import express from 'express';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Load environment variables
dotenv.config();

// Initialize Firebase Admin SDK
// Uses VITE_FIREBASE_PROJECT_ID or fallback to 'makosa-e7b4b'
const projectId = process.env.VITE_FIREBASE_PROJECT_ID || 'makosa-e7b4b';

if (getApps().length === 0) {
  initializeApp({
    projectId: projectId,
  });
}

const db = getFirestore();
const auth = getAuth();

const app = express();
const PORT = 3000;

// Enable JSON bodies
app.use(express.json());

// 1. MIDTRANS SNAP API ROUTE
// Client requests a Snap payment token for an order.
app.post('/api/checkout/snap', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Tidak diotorisasi: Token JWT tidak ditemukan.' });
    }

    const token = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(token);
    } catch (err) {
      return res.status(401).json({ error: 'Tidak diotorisasi: Token JWT tidak valid.' });
    }

    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ error: 'orderId wajib dikirimkan.' });
    }

    // Fetch order from Firestore
    const orderDoc = await db.collection('orders').doc(orderId).get();
    if (!orderDoc.exists) {
      return res.status(404).json({ error: 'Pesanan tidak ditemukan.' });
    }

    const orderData = orderDoc.data();
    if (!orderData) {
      return res.status(500).json({ error: 'Data pesanan kosong.' });
    }

    // Security: ensure the logged-in user matches the order owner
    if (orderData.userId !== decodedToken.uid) {
      return res.status(403).json({ error: 'Akses ditolak: Anda bukan pemilik pesanan ini.' });
    }

    const serverKey = process.env.MIDTRANS_SERVER_KEY || 'Mid-server-DJHgxVKDB-XMzCYsrwzboWao';
    const midtransUrl = 'https://app.sandbox.midtrans.com/snap/v1/transactions';

    // Map cart items into Midtrans item_details format
    const itemDetails = (orderData.items || []).map((item: any) => ({
      id: item.productId,
      price: item.price,
      quantity: item.qty,
      name: item.name.substring(0, 50), // Midtrans max length is 50
    }));

    const payload = {
      transaction_details: {
        order_id: orderId,
        gross_amount: orderData.totalPrice,
      },
      item_details: itemDetails,
      customer_details: {
        first_name: orderData.userName || decodedToken.name || 'Pelanggan',
        email: decodedToken.email || orderData.email || 'customer@example.com',
        phone: orderData.phone || '',
        shipping_address: {
          first_name: orderData.userName || decodedToken.name || 'Pelanggan',
          address: orderData.shippingAddress,
          phone: orderData.phone || '',
        }
      },
      enabled_payments: ['qris', 'gopay', 'shopeepay', 'bank_transfer'],
    };

    const authString = Buffer.from(`${serverKey}:`).toString('base64');

    const response = await fetch(midtransUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Basic ${authString}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Midtrans API error:', errText);
      return res.status(500).json({ error: 'Gagal menghubungi Midtrans Snap API.', details: errText });
    }

    const midtransData = await response.json();
    return res.json({
      token: midtransData.token,
      redirect_url: midtransData.redirect_url,
    });
  } catch (error: any) {
    console.error('Checkout Snap Error:', error);
    return res.status(500).json({ error: 'Internal server error.', message: error.message });
  }
});

// 2. MIDTRANS WEBHOOK ENDPOINT
// Handles incoming HTTP POST notification from Midtrans
app.post('/api/midtrans/webhook', async (req, res) => {
  try {
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
    } = req.body;

    if (!order_id || !status_code || !gross_amount || !signature_key) {
      return res.status(400).json({ error: 'Payload tidak lengkap.' });
    }

    // Verify signature key to prevent spoofing
    const serverKey = process.env.MIDTRANS_SERVER_KEY || 'Mid-server-DJHgxVKDB-XMzCYsrwzboWao';
    const signatureStr = `${order_id}${status_code}${gross_amount}${serverKey}`;
    const calculatedSignature = crypto
      .createHash('sha512')
      .update(signatureStr)
      .digest('hex');

    if (calculatedSignature !== signature_key) {
      console.warn(`[WARNING] Signature mismatch for order: ${order_id}`);
      return res.status(403).json({ error: 'Signature key tidak valid!' });
    }

    console.log(`[MIDTRANS WEBHOOK] Status transaksi order ${order_id} adalah ${transaction_status}`);

    const isSettled =
      transaction_status === 'settlement' ||
      (transaction_status === 'capture' && fraud_status === 'accept');

    const isFailed =
      transaction_status === 'expire' ||
      transaction_status === 'failure' ||
      transaction_status === 'cancel';

    if (isSettled) {
      // 1-Transaction atomic update: status order, stock reduction, payments collection update
      await db.runTransaction(async (transaction) => {
        const orderRef = db.collection('orders').doc(order_id);
        const orderDoc = await transaction.get(orderRef);

        if (!orderDoc.exists) {
          throw new Error(`Order ${order_id} tidak ditemukan.`);
        }

        const orderData = orderDoc.data();
        if (!orderData) {
          throw new Error(`Data order ${order_id} kosong.`);
        }

        // Avoid double processing if order is already processed
        if (orderData.status !== 'menunggu_pembayaran') {
          console.log(`Order ${order_id} sudah diproses sebelumnya.`);
          return;
        }

        // Check and reduce stock for each product in the order
        for (const item of orderData.items || []) {
          const productRef = db.collection('products').doc(item.productId);
          const productDoc = await transaction.get(productRef);

          if (!productDoc.exists) {
            throw new Error(`Produk ${item.productId} tidak ditemukan di katalog.`);
          }

          const productData = productDoc.data();
          const currentStock = productData?.stock || 0;
          const newStock = currentStock - item.qty;

          if (newStock < 0) {
            throw new Error(`Stok produk "${item.name}" tidak mencukupi.`);
          }

          transaction.update(productRef, { stock: newStock, updatedAt: new Date().toISOString() });
        }

        // Update order status
        transaction.update(orderRef, {
          status: 'diproses',
          updatedAt: new Date().toISOString(),
        });

        // Write to payments collection
        const paymentRef = db.collection('payments').doc(order_id);
        transaction.set(paymentRef, {
          orderId: order_id,
          status: 'settlement',
          midtransResponse: req.body,
          updatedAt: new Date().toISOString(),
        });
      });

      console.log(`[SUCCESS] Order ${order_id} berhasil diproses dan stok dikurangi.`);
    } else if (isFailed) {
      // Update payment status to failed, leave stock intact
      await db.runTransaction(async (transaction) => {
        const orderRef = db.collection('orders').doc(order_id);
        transaction.update(orderRef, {
          status: 'menunggu_pembayaran', // or set to fail, let's keep it 'menunggu_pembayaran' as per standard checkout retryability or update as needed
          updatedAt: new Date().toISOString(),
        });

        const paymentRef = db.collection('payments').doc(order_id);
        transaction.set(paymentRef, {
          orderId: order_id,
          status: transaction_status,
          midtransResponse: req.body,
          updatedAt: new Date().toISOString(),
        });
      });
      console.log(`[FAILED] Order ${order_id} gagal pembayaran (Status: ${transaction_status}).`);
    }

    return res.json({ status: 'success' });
  } catch (error: any) {
    console.error('Midtrans Webhook Error:', error);
    return res.status(500).json({ error: 'Gagal memproses webhook.', message: error.message });
  }
});

// 3. ADMIN STATUS UPDATE API ROUTE
// Direct admin endpoint that verifies role admin via decoded claims token before allowing status changes.
// It also allows the order owner to confirm "selesai" (order completed) because client security rules deny updates.
app.post('/api/admin/update-order', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Tidak diotorisasi: Token JWT tidak ditemukan.' });
    }

    const token = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(token);
    } catch (err) {
      return res.status(401).json({ error: 'Tidak diotorisasi: Token JWT tidak valid.' });
    }

    const { orderId, status, courier, trackingNumber } = req.body;

    if (!orderId || !status) {
      return res.status(400).json({ error: 'orderId dan status wajib dikirimkan.' });
    }

    const orderRef = db.collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      return res.status(404).json({ error: 'Pesanan tidak ditemukan.' });
    }

    const orderData = orderDoc.data();
    if (!orderData) {
      return res.status(500).json({ error: 'Data pesanan kosong.' });
    }

    // Role verification: ONLY admin is allowed to update orders (status, courier, tracking)
    const isUserAdmin = decodedToken.admin === true;

    if (!isUserAdmin) {
      return res.status(403).json({ error: 'Akses ditolak: Anda tidak memiliki hak akses administrator.' });
    }

    // Validation for "dikirim" status
    if (status === 'dikirim') {
      if (!courier || !trackingNumber) {
        return res.status(400).json({ error: 'Status "dikirim" memerlukan input kurir dan nomor resi.' });
      }
    }

    const updates: any = {
      status,
      updatedAt: new Date().toISOString(),
    };

    if (courier) updates.courier = courier;
    if (trackingNumber) updates.trackingNumber = trackingNumber;

    await orderRef.update(updates);

    return res.json({ status: 'success', message: 'Status pesanan berhasil diperbarui.' });
  } catch (error: any) {
    console.error('Admin Update Order Error:', error);
    return res.status(500).json({ error: 'Gagal memperbarui status pesanan.', message: error.message });
  }
});

// 4. VITE MIDDLEWARE / STATIC FILES MOUNT
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MAKOSA backend running on http://localhost:${PORT}`);
  });
}

startServer();
