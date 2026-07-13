import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomepageView } from './components/HomepageView';
import { ProductDetailView } from './components/ProductDetailView';
import { CartAndCheckoutView } from './components/CartAndCheckoutView';
import { OrderAndProfileView } from './components/OrderAndProfileView';
import { AdminViews } from './components/AdminViews';
import { dbService, authService, auth } from './lib/db';
import { Product, Article, FAQ, HomepageSection, SiteSettings, Order, CartItem, UserProfile, OrderStatus } from './types';

export default function App() {
  // Global View Router
  const [currentView, setCurrentView] = useState<string>('home');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Loaded database collections
  const [products, setProducts] = useState<Product[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Cart operations
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('makosa_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync cart to localStorage
  useEffect(() => {
    localStorage.setItem('makosa_cart', JSON.stringify(cart));
  }, [cart]);

  // Load Midtrans Snap.js script dynamically
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
    script.setAttribute('data-client-key', (import.meta as any).env.VITE_MIDTRANS_CLIENT_KEY || 'Mid-client-tiJHZGw601rIUIV7');
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);
  
  // Selection models
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // 1. Initial Load Hook
  useEffect(() => {
    async function loadAllData() {
      try {
        const [prodList, artList, faqList, secList, generalSettings, orderList] = await Promise.all([
          dbService.getProducts(),
          dbService.getArticles(),
          dbService.getFAQs(),
          dbService.getHomepageSections(),
          dbService.getSettings(),
          dbService.getOrders()
        ]);

        setProducts(prodList || []);
        setArticles(artList || []);
        setFaqs(faqList || []);
        setSections(secList || []);
        setSettings(generalSettings);
        setOrders(orderList || []);

        // Authenticated user
        const cachedUser = authService.getCurrentUser();
        if (cachedUser) {
          setCurrentUser(cachedUser);
        }
      } catch (err) {
        console.error("Failed to load initial db data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAllData();
  }, []);

  // 1b. Listen to Firebase Auth state changes to refresh user session & collections
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser: any) => {
      try {
        if (firebaseUser) {
          // Get the fresh user profile
          const freshProfile = await authService.getProfile(firebaseUser.uid);
          if (freshProfile) {
            setCurrentUser(freshProfile);
            localStorage.setItem('makosa_current_user', JSON.stringify(freshProfile));
          } else {
            const cachedUser = authService.getCurrentUser();
            if (cachedUser && cachedUser.uid === firebaseUser.uid) {
              setCurrentUser(cachedUser);
            }
          }

          // Reload collections now that we are authenticated (different role permissions)
          const [prodList, artList, orderList] = await Promise.all([
            dbService.getProducts(),
            dbService.getArticles(),
            dbService.getOrders()
          ]);
          setProducts(prodList || []);
          setArticles(artList || []);
          setOrders(orderList || []);
        } else {
          // User is logged out, clear order list and load guest-accessible products and articles
          setCurrentUser(null);
          setOrders([]);
          const [prodList, artList] = await Promise.all([
            dbService.getProducts(),
            dbService.getArticles()
          ]);
          setProducts(prodList || []);
          setArticles(artList || []);
        }
      } catch (err) {
        console.error("Error synchronizing auth state change:", err);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Synchronize user specific orders
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  useEffect(() => {
    if (currentUser) {
      dbService.getOrdersByUser(currentUser.uid).then(list => {
        setUserOrders(list || []);
      });
    } else {
      setUserOrders([]);
    }
  }, [currentUser, orders]);

  // 3. User Authentication Controls
  const handleGoogleLogin = async () => {
    try {
      const profile = await authService.loginWithGoogle();
      setCurrentUser(profile);
    } catch (err) {
      console.error("Login trigger failed:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setCurrentUser(null);
      setCurrentView('home');
    } catch (err) {
      console.error("Logout trigger failed:", err);
    }
  };

  const handleSaveProfile = (updated: UserProfile) => {
    authService.saveProfile(updated);
    setCurrentUser(updated);
  };

  // 4. Shopping Cart Handlers
  const handleAddToCart = async (product: Product, quantity: number = 1) => {
    try {
      // Get fresh product to validate real-time stock
      const freshProds = await dbService.getProducts();
      const dbProduct = freshProds.find(p => p.id === product.id);
      const stock = dbProduct ? dbProduct.stock : product.stock;

      if (stock < quantity) {
        alert(`Maaf, stok produk "${product.name}" tidak mencukupi (Tersedia: ${stock}).`);
        return;
      }

      setCart((prev) => {
        const idx = prev.findIndex(item => item.product.id === product.id);
        if (idx > -1) {
          const totalRequested = prev[idx].quantity + quantity;
          if (totalRequested > stock) {
            alert(`Maaf, tidak bisa menambah ke keranjang. Stok total "${product.name}" hanya ada ${stock}.`);
            return prev;
          }
          const copy = [...prev];
          copy[idx].quantity = totalRequested;
          return copy;
        }
        return [...prev, { product: dbProduct || product, quantity }];
      });
      alert(`Berhasil menambahkan ${product.name} ke keranjang belanja!`);
    } catch (err) {
      console.error("Gagal menambahkan ke keranjang:", err);
      alert("Terjadi kesalahan saat memvalidasi stok.");
    }
  };

  const handleUpdateCartQty = async (product: Product, delta: number) => {
    try {
      if (delta > 0) {
        const freshProds = await dbService.getProducts();
        const dbProduct = freshProds.find(p => p.id === product.id);
        const stock = dbProduct ? dbProduct.stock : product.stock;

        const currentQty = cart.find(item => item.product.id === product.id)?.quantity || 0;
        if (currentQty + delta > stock) {
          alert(`Maaf, stok produk "${product.name}" tidak mencukupi (Tersedia: ${stock}).`);
          return;
        }
      }

      setCart((prev) => {
        const idx = prev.findIndex(item => item.product.id === product.id);
        if (idx > -1) {
          const copy = [...prev];
          const newQty = copy[idx].quantity + delta;
          if (newQty <= 0) {
            return copy.filter(item => item.product.id !== product.id);
          }
          copy[idx].quantity = newQty;
          return copy;
        }
        return prev;
      });
    } catch (err) {
      console.error("Gagal mengubah kuantitas keranjang:", err);
    }
  };

  const handleRemoveCartItem = (product: Product) => {
    setCart(prev => prev.filter(item => item.product.id !== product.id));
  };

  // 5. Place and Process Order Transaction
  const handleCheckoutComplete = async (shippingAddress: string, phone: string, fullName: string) => {
    if (!currentUser) return;

    try {
      // 1. Fetch latest products and validate stock before creating order
      const freshProds = await dbService.getProducts();
      for (const item of cart) {
        const dbProduct = freshProds.find(p => p.id === item.product.id);
        const currentStock = dbProduct ? dbProduct.stock : item.product.stock;
        if (currentStock < item.quantity) {
          alert(`Maaf, stok produk "${item.product.name}" tidak mencukupi (Tersedia: ${currentStock}). Silakan kurangi kuantitas.`);
          return;
        }
      }

      const itemsSubtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      const flatShippingFee = 15000;
      const flatServiceFee = 1000;
      const totalBill = itemsSubtotal + flatShippingFee + flatServiceFee;

      // Create unique order ID
      const orderId = 'MKS-' + Math.floor(100000 + Math.random() * 900000);

      // Create domain transaction model
      const newOrder: Order = {
        id: orderId,
        userId: currentUser.uid,
        userName: fullName,
        phone,
        shippingAddress,
        items: cart.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          qty: item.quantity,
          price: item.product.price,
          image: item.product.images[0]
        })),
        totalPrice: totalBill,
        status: 'menunggu_pembayaran', // Wajib status awal 'menunggu_pembayaran'
        courier: '',
        trackingNumber: '',
        paymentId: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Record order in Firestore (client-side allowed by security rules)
      await dbService.saveOrder(newOrder);

      // Call our secure Express server API to generate Midtrans Snap token
      let idToken = '';
      if (authService.isFirebaseEnabled() && auth) {
        idToken = await auth.currentUser?.getIdToken() || '';
      }

      const response = await fetch('/api/checkout/snap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ orderId: orderId })
      });

      if (!response.ok) {
        const errDetails = await response.text();
        throw new Error(`Gagal memproses pembayaran dengan server. Details: ${errDetails}`);
      }

      const { token, redirect_url } = await response.json();

      // Trigger Midtrans Snap UI or fallback to direct URL
      if ((window as any).snap) {
        (window as any).snap.pay(token, {
          onSuccess: function (result: any) {
            console.log('Payment success:', result);
            alert('Pembayaran sukses diproses! Terima kasih.');
            setCart([]);
            // Refresh products and orders
            dbService.getProducts().then(fresh => setProducts(fresh));
            dbService.getOrders().then(fresh => setOrders(fresh));
            setCurrentView('orders');
          },
          onPending: function (result: any) {
            console.log('Payment pending:', result);
            alert('Menunggu pembayaran Anda.');
            setCart([]);
            dbService.getProducts().then(fresh => setProducts(fresh));
            dbService.getOrders().then(fresh => setOrders(fresh));
            setCurrentView('orders');
          },
          onError: function (result: any) {
            console.error('Payment error:', result);
            alert('Terjadi kesalahan pembayaran. Silakan coba lagi.');
          },
          onClose: function () {
            console.log('Customer closed payment popup without finishing');
            setCart([]);
            dbService.getProducts().then(fresh => setProducts(fresh));
            dbService.getOrders().then(fresh => setOrders(fresh));
            setCurrentView('orders');
          }
        });
      } else {
        // Fallback: Open Midtrans Snap redirect URL in a new tab if popup is blocked
        alert('Mengalihkan Anda ke halaman pembayaran Midtrans...');
        window.open(redirect_url, '_blank');
        setCart([]);
        dbService.getProducts().then(fresh => setProducts(fresh));
        dbService.getOrders().then(fresh => setOrders(fresh));
        setCurrentView('orders');
      }

      // Refresh products and orders list
      const [freshProducts, freshOrders] = await Promise.all([
        dbService.getProducts(),
        dbService.getOrders()
      ]);
      setProducts(freshProducts);
      setOrders(freshOrders);

      // Auto route customer to track their new order
      setSelectedOrder(newOrder);
      setCurrentView('orders');
    } catch (err: any) {
      console.error("Order processing failure:", err);
      alert(`Gagal memproses transaksi: ${err.message || err}`);
    }
  };

  const handleCompleteOrder = async (orderId: string) => {
    try {
      let idToken = '';
      if (authService.isFirebaseEnabled() && auth) {
        idToken = await auth.currentUser?.getIdToken() || '';
      }

      const response = await fetch('/api/admin/update-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ orderId, status: 'selesai' })
      });

      if (!response.ok) {
        const errDetails = await response.json();
        throw new Error(errDetails.error || 'Gagal mengubah status pesanan.');
      }

      const freshOrders = await dbService.getOrders();
      setOrders(freshOrders);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({
          ...selectedOrder,
          status: 'selesai',
          updatedAt: new Date().toISOString()
        });
      }
      alert("Terima kasih! Pesanan telah dikonfirmasi selesai.");
    } catch (err: any) {
      console.error("Failed to update status to complete:", err);
      alert(`Gagal mengonfirmasi selesai: ${err.message || err}`);
    }
  };

  // 6. Admin Panel Hooks
  const handleSaveProductAdmin = async (p: Product) => {
    await dbService.saveProduct(p);
    const list = await dbService.getProducts();
    setProducts(list);
  };

  const handleDeleteProductAdmin = async (id: string) => {
    await dbService.deleteProduct(id);
    const list = await dbService.getProducts();
    setProducts(list);
  };

  const handleSaveArticleAdmin = async (a: Article) => {
    await dbService.saveArticle(a);
    const list = await dbService.getArticles();
    setArticles(list);
  };

  const handleDeleteArticleAdmin = async (id: string) => {
    await dbService.deleteArticle(id);
    const list = await dbService.getArticles();
    setArticles(list);
  };

  const handleSaveFAQAdmin = async (f: FAQ) => {
    await dbService.saveFAQ(f);
    const list = await dbService.getFAQs();
    setFaqs(list);
  };

  const handleDeleteFAQAdmin = async (id: string) => {
    await dbService.deleteFAQ(id);
    const list = await dbService.getFAQs();
    setFaqs(list);
  };

  const handleSaveSettingsAdmin = async (s: SiteSettings) => {
    await dbService.saveSettings(s);
    setSettings(s);
  };

  const handleSaveSectionAdmin = async (sec: HomepageSection) => {
    await dbService.saveHomepageSection(sec);
    const list = await dbService.getHomepageSections();
    setSections(list);
  };

  const handleUpdateOrderStatusAdmin = async (orderId: string, status: OrderStatus, courier?: string, trackingNumber?: string) => {
    try {
      let idToken = '';
      if (authService.isFirebaseEnabled() && auth) {
        idToken = await auth.currentUser?.getIdToken() || '';
      }

      const response = await fetch('/api/admin/update-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ orderId, status, courier, trackingNumber })
      });

      if (!response.ok) {
        const errDetails = await response.json();
        throw new Error(errDetails.error || 'Gagal mengubah status order.');
      }

      alert('Status pesanan berhasil diperbarui!');
      const list = await dbService.getOrders();
      setOrders(list);
    } catch (err: any) {
      console.error("Gagal mengubah status pesanan oleh admin:", err);
      alert(`Gagal: ${err.message || err}`);
    }
  };

  // 7. Render skeleton loader
  if (loading || !settings) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center space-y-4">
        <svg className="animate-spin h-10 w-10 text-[#154212]" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-sm font-semibold text-[#154212] tracking-wide uppercase">Memuat Data Portal MAKOSA Desa Manggihan...</p>
      </div>
    );
  }

  // Check if Admin Panel view is requested
  const isAdminView = currentView.startsWith('admin-');

  if (isAdminView && currentUser?.role === 'admin') {
    return (
      <AdminViews
        products={products}
        articles={articles}
        faqs={faqs}
        sections={sections}
        settings={settings}
        orders={orders}
        onSaveProduct={handleSaveProductAdmin}
        onDeleteProduct={handleDeleteProductAdmin}
        onSaveArticle={handleSaveArticleAdmin}
        onDeleteArticle={handleDeleteArticleAdmin}
        onSaveFAQ={handleSaveFAQAdmin}
        onDeleteFAQ={handleDeleteFAQAdmin}
        onSaveSettings={handleSaveSettingsAdmin}
        onSaveSection={handleSaveSectionAdmin}
        onUpdateOrderStatus={handleUpdateOrderStatusAdmin}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white text-zinc-900 transition-colors">
      <Navbar 
        currentUser={currentUser}
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          setSelectedProduct(null);
          setSelectedOrder(null);
        }}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        onLogin={handleGoogleLogin}
        onLogout={handleLogout}
        settings={settings}
      />

      <main className="flex-grow">
        {currentView === 'home' && !selectedProduct && (
          <HomepageView 
            products={products}
            articles={articles}
            faqs={faqs}
            sections={sections}
            settings={settings}
            onViewProduct={(p) => setSelectedProduct(p)}
            onAddToCart={(p) => handleAddToCart(p, 1)}
            onNavigate={(view) => setCurrentView(view)}
          />
        )}

        {selectedProduct && (
          <ProductDetailView 
            product={selectedProduct}
            allProducts={products}
            onBack={() => setSelectedProduct(null)}
            onAddToCart={(prod, count) => {
              handleAddToCart(prod, count);
              setSelectedProduct(null);
            }}
            onViewProduct={(p) => setSelectedProduct(p)}
          />
        )}

        {currentView === 'cart' && (
          <CartAndCheckoutView 
            cart={cart}
            currentUser={currentUser}
            onUpdateQty={handleUpdateCartQty}
            onRemoveItem={handleRemoveCartItem}
            onLogin={handleGoogleLogin}
            onCheckoutComplete={handleCheckoutComplete}
            onNavigate={(view) => setCurrentView(view)}
          />
        )}

        {(currentView === 'orders' || currentView === 'profile') && (
          <div className="max-w-7xl mx-auto px-6 md:px-10 py-16">
            <OrderAndProfileView 
              orders={userOrders}
              currentUser={currentUser}
              onSaveProfile={handleSaveProfile}
              onLogout={handleLogout}
              onNavigate={(view) => setCurrentView(view)}
              selectedOrder={selectedOrder}
              onSelectOrder={setSelectedOrder}
            />
          </div>
        )}
      </main>

      <Footer 
        settings={settings} 
        onNavigate={(view) => {
          setCurrentView(view);
          setSelectedProduct(null);
          setSelectedOrder(null);
        }} 
      />
    </div>
  );
}
