import React from 'react';
import { ChevronRight, Trash2, ShoppingCart, Lock, CreditCard, ShieldCheck, Mail, MapPin, Phone, User, QrCode } from 'lucide-react';
import { Product, CartItem, UserProfile } from '../types';

interface CartAndCheckoutViewProps {
  cart: CartItem[];
  currentUser: UserProfile | null;
  onUpdateQty: (product: Product, delta: number) => void;
  onRemoveItem: (product: Product) => void;
  onLogin: () => void;
  onCheckoutComplete: (shippingAddress: string, phone: string, fullName: string) => void;
  onNavigate: (view: string) => void;
}

export const CartAndCheckoutView: React.FC<CartAndCheckoutViewProps> = ({
  cart,
  currentUser,
  onUpdateQty,
  onRemoveItem,
  onLogin,
  onCheckoutComplete,
  onNavigate
}) => {
  const [step, setStep] = React.useState<'cart' | 'checkout' | 'payment'>('cart');
  const [fullName, setFullName] = React.useState(currentUser?.name || '');
  const [phone, setPhone] = React.useState(currentUser?.phone || '');
  const [address, setAddress] = React.useState(currentUser?.address || '');
  const [loading, setLoading] = React.useState(false);

  // Sync profile details if available
  React.useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.name);
      if (currentUser.phone) setPhone(currentUser.phone);
      if (currentUser.address) setAddress(currentUser.address);
    }
  }, [currentUser]);

  const itemsSubtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const flatShippingFee = 15000;
  const flatServiceFee = 1000;
  const totalBill = itemsSubtotal + flatShippingFee + flatServiceFee;

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !address) {
      alert("Mohon lengkapi seluruh kolom pengiriman!");
      return;
    }
    setStep('payment');
  };

  const handleSimulatePayment = () => {
    setLoading(true);
    // Simulate payment callback from Midtrans
    setTimeout(() => {
      setLoading(false);
      onCheckoutComplete(address, phone, fullName);
    }, 2000);
  };

  if (cart.length === 0 && step === 'cart') {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center space-y-6 animate-in fade-in duration-300 font-sans">
        <div className="w-48 h-48 bg-zinc-50 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <ShoppingCart className="w-24 h-24 text-zinc-400" />
        </div>
        <h2 className="text-3xl font-bold text-[#154212] font-display">Keranjang Anda Kosong</h2>
        <p className="text-zinc-500 max-w-md mx-auto text-sm md:text-base">
          Wah, sepertinya Anda belum memilih produk ramah lingkungan kami. Yuk, lihat produk terbaik dari desa binaan kami!
        </p>
        <button 
          onClick={() => onNavigate('home')}
          className="px-8 py-3 bg-[#154212] text-white hover:bg-[#2d5a27] font-semibold text-sm rounded-lg transition-transform active:scale-95"
        >
          Mulai Belanja Sekarang
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-12 animate-in fade-in duration-300 font-sans">
      {/* Page header and progress breadcrumbs */}
      <header className="mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-[#154212] mb-2 font-display">
          {step === 'cart' ? 'Keranjang Belanja' : step === 'checkout' ? 'Konfirmasi Pengiriman' : 'Pembayaran QRIS'}
        </h1>
        <div className="flex items-center gap-2 text-zinc-400 text-xs font-semibold">
          <span className={step === 'cart' ? 'text-[#154212] font-bold' : ''}>Keranjang</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className={step === 'checkout' ? 'text-[#154212] font-bold' : ''}>Pengiriman</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className={step === 'payment' ? 'text-[#154212] font-bold' : ''}>Pembayaran</span>
        </div>
      </header>

      {/* Cart step details */}
      {step === 'cart' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart items list */}
          <div className="lg:col-span-8 space-y-4">
            {cart.map((item) => {
              const rowSubtotal = item.product.price * item.quantity;
              return (
                <div 
                  key={item.product.id}
                  className="bg-white p-6 rounded-xl border border-zinc-200/60 flex flex-col sm:flex-row items-center gap-6 group hover:shadow-md transition-shadow"
                >
                  <div className="w-20 h-24 rounded-lg overflow-hidden bg-zinc-50 flex-shrink-0">
                    <img src={item.product.images[0]} className="w-full h-full object-cover" alt={item.product.name} />
                  </div>

                  <div className="flex-grow text-center sm:text-left space-y-1">
                    <h3 className="font-bold text-lg text-zinc-900">{item.product.name}</h3>
                    <p className="text-xs text-zinc-500">Harga: Rp {item.product.price.toLocaleString('id-ID')}</p>
                  </div>

                  {/* Quantity Steppers */}
                  <div className="flex items-center bg-zinc-100 rounded-full p-1 border border-zinc-200/50">
                    <button 
                      onClick={() => onUpdateQty(item.product, -1)}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-200 text-[#154212] font-bold transition-colors"
                    >
                      -
                    </button>
                    <span className="px-4 text-sm font-bold min-w-[28px] text-center text-zinc-900">{item.quantity}</span>
                    <button 
                      onClick={() => onUpdateQty(item.product, 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-200 text-[#154212] font-bold transition-colors"
                    >
                      +
                    </button>
                  </div>

                  {/* Row Subtotal */}
                  <div className="sm:w-32 text-right">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 mb-0.5">Subtotal</p>
                    <p className="font-bold text-lg text-[#154212]">Rp {rowSubtotal.toLocaleString('id-ID')}</p>
                  </div>

                  <button 
                    onClick={() => onRemoveItem(item.product)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-all"
                    title="Remove Item"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Cart Sidebar Summary */}
          <aside className="lg:col-span-4 bg-white border border-zinc-200/60 p-8 rounded-xl shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-[#154212] font-display border-b border-zinc-150 pb-3">
              Ringkasan Pesanan
            </h2>
            <div className="space-y-4 text-sm text-zinc-600">
              <div className="flex justify-between">
                <span>Subtotal Produk</span>
                <span className="font-semibold text-zinc-900">Rp {itemsSubtotal.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span>Ongkos Kirim (Flat)</span>
                <span className="font-semibold text-zinc-900">Rp {flatShippingFee.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span>Biaya Layanan</span>
                <span className="font-semibold text-zinc-900">Rp {flatServiceFee.toLocaleString('id-ID')}</span>
              </div>
              <div className="h-[1px] bg-zinc-200 pt-2"></div>
              <div className="flex justify-between text-lg font-bold text-[#154212]">
                <span>Total</span>
                <span>Rp {totalBill.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <button 
              onClick={() => setStep('checkout')}
              className="w-full bg-[#154212] hover:bg-[#2d5a27] text-white py-4 rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all text-center active:scale-98"
            >
              Lanjut ke Pengiriman
            </button>
          </aside>
        </div>
      )}

      {/* Checkout step: Shipping form and login trigger */}
      {step === 'checkout' && (
        <div className="space-y-12">
          {!currentUser ? (
            <div className="bg-white border border-zinc-200/60 rounded-xl p-8 max-w-xl mx-auto flex flex-col items-center text-center shadow-sm">
              <div className="w-16 h-16 bg-[#154212]/10 rounded-full flex items-center justify-center mb-6">
                <Lock className="w-8 h-8 text-[#154212]" />
              </div>
              <h2 className="text-2xl font-bold mb-2 font-display text-zinc-900">Hanya satu langkah lagi!</h2>
              <p className="text-sm text-zinc-500 max-w-sm mb-8 leading-relaxed">
                Silakan masuk dengan Google untuk mengamankan pesanan Anda dan mendapatkan update pengiriman otomatis di akun Anda.
              </p>
              <button 
                onClick={onLogin}
                className="flex items-center gap-3 bg-white hover:bg-zinc-50 border border-zinc-300 text-zinc-700 px-8 py-3.5 rounded-lg font-semibold text-sm transition-transform active:scale-95 shadow-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                </svg>
                <span>Masuk dengan Google</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Shipping Information form */}
              <form onSubmit={handleCheckoutSubmit} className="lg:col-span-7 bg-white p-8 rounded-xl border border-zinc-200/60 shadow-sm space-y-6">
                <div className="flex items-center gap-2.5 border-b border-zinc-100 pb-4 mb-4">
                  <MapPin className="w-5.5 h-5.5 text-[#154212]" />
                  <h3 className="text-xl font-bold font-display text-zinc-900">Alamat Kirim</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500" htmlFor="fname">
                      Nama Lengkap Penerima
                    </label>
                    <input 
                      id="fname"
                      type="text" 
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Contoh: Slamet Riyadi"
                      className="w-full px-4 py-3 rounded-lg border border-zinc-300 bg-transparent text-sm focus:border-[#154212] focus:ring-1 focus:ring-[#154212] text-zinc-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500" htmlFor="fphone">
                      Nomor Telepon WA
                    </label>
                    <input 
                      id="fphone"
                      type="tel" 
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Contoh: 081234567890"
                      className="w-full px-4 py-3 rounded-lg border border-zinc-300 bg-transparent text-sm focus:border-[#154212] focus:ring-1 focus:ring-[#154212] text-zinc-900"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500" htmlFor="faddress">
                    Alamat Lengkap Pengiriman
                  </label>
                  <textarea 
                    id="faddress"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={4}
                    placeholder="Nama Jalan, RT/RW, Kecamatan, Kota, Kode Pos"
                    className="w-full px-4 py-3 rounded-lg border border-zinc-300 bg-transparent text-sm focus:border-[#154212] focus:ring-1 focus:ring-[#154212] text-zinc-900"
                  ></textarea>
                </div>

                {/* Simulated payment info block */}
                <div className="pt-4 border-t border-zinc-100 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Metode Pembayaran</h4>
                  <div className="border-2 border-[#154212] bg-[#154212]/5 p-5 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <QrCode className="w-10 h-10 text-[#154212]" />
                      <div>
                        <p className="text-sm font-bold text-zinc-900">QRIS Instant via Midtrans</p>
                        <p className="text-xs text-zinc-500">Verifikasi otomatis, aman &amp; praktis</p>
                      </div>
                    </div>
                    <span className="text-[#154212] font-bold text-sm">✓ Terpilih</span>
                  </div>
                </div>

                <div className="pt-4 flex justify-between gap-4">
                  <button 
                    type="button"
                    onClick={() => setStep('cart')}
                    className="px-6 py-3 border border-zinc-300 text-zinc-700 rounded-lg text-sm font-semibold hover:bg-zinc-50"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    className="px-8 py-3 bg-[#154212] hover:bg-[#2d5a27] text-white rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all"
                  >
                    Lanjut ke Pembayaran
                  </button>
                </div>
              </form>

              {/* Sidebar confirmation info */}
              <aside className="lg:col-span-5 bg-white border border-zinc-200/60 p-8 rounded-xl shadow-sm space-y-6">
                <h3 className="text-lg font-bold text-[#154212] font-display border-b border-zinc-100 pb-3">
                  Ringkasan Pesanan
                </h3>
                <div className="divide-y divide-zinc-100 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex gap-4 py-3 first:pt-0">
                      <img src={item.product.images[0]} className="w-12 h-12 rounded object-cover flex-shrink-0" alt="" />
                      <div className="flex-grow">
                        <p className="text-sm font-bold text-zinc-900">{item.product.name}</p>
                        <p className="text-xs text-zinc-500">{item.quantity} x Rp {item.product.price.toLocaleString('id-ID')}</p>
                      </div>
                      <span className="text-sm font-semibold text-zinc-900">Rp {(item.product.price * item.quantity).toLocaleString('id-ID')}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-zinc-100 text-sm space-y-3">
                  <div className="flex justify-between text-zinc-600">
                    <span>Subtotal</span>
                    <span>Rp {itemsSubtotal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-zinc-600">
                    <span>Flat Ongkir</span>
                    <span>Rp {flatShippingFee.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-zinc-600">
                    <span>Layanan</span>
                    <span>Rp {flatServiceFee.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-[#154212] pt-2 border-t border-dashed border-zinc-200">
                    <span>Total Tagihan</span>
                    <span>Rp {totalBill.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </aside>
            </div>
          )}
        </div>
      )}

      {/* Payment step: Simulated QR Code display */}
      {step === 'payment' && (
        <div className="max-w-xl mx-auto bg-white border border-zinc-200/60 rounded-2xl p-8 shadow-xl text-center space-y-6">
          <div className="flex items-center justify-center gap-2 text-zinc-800 font-bold border-b border-zinc-100 pb-4">
            <CreditCard className="w-5 h-5 text-[#154212]" />
            <span className="font-display">Midtrans QRIS Gateway</span>
          </div>

          <p className="text-sm text-zinc-600">
            Pindai Kode QRIS di bawah ini dengan aplikasi perbankan atau e-wallet Anda (Gopay, OVO, Dana, LinkAja, ShopeePay) untuk menyelesaikan pesanan.
          </p>

          <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl max-w-[280px] mx-auto shadow-inner relative group">
            {/* Real QR representation */}
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuACX32vJXAmqGvNmWOTJYCn_XDpbt1JAVlIYYdT1ZoNiGTlikRgR2zWGpLoKI1iGFHBemjGDtovkRmyT6-_tFYT7si5qgh1HrmG0WLAt7Ul0H3ijdQFQOKLm1JV_3gGHaftX7VOr-o-YWW8lXq-JcD4wfirCQQPCMpcHqByR5hnYSidGhp5G7yQ84XHr4P7WhkOfGSPLx8JayZhL-_lVkZN8lPL74pLDmvk5SFrbvvv4PfidIwpD9RG" 
              alt="Scan QRIS code to finalize purchase" 
              className="w-full h-auto object-contain rounded"
            />
            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-[10px] font-bold text-zinc-500 bg-white/95 px-2 py-1 rounded">MAKOSA Official QRIS</span>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-zinc-400 uppercase tracking-wider font-bold">TOTAL TAGIHAN</p>
            <p className="text-3xl font-extrabold text-[#154212]">Rp {totalBill.toLocaleString('id-ID')}</p>
          </div>

          <div className="bg-zinc-50 p-4 rounded-xl text-left border border-zinc-250 space-y-2">
            <div className="flex justify-between text-xs font-semibold text-zinc-500">
              <span>PENERIMA:</span>
              <span className="text-zinc-900 font-bold">{fullName}</span>
            </div>
            <div className="flex justify-between text-xs font-semibold text-zinc-500">
              <span>TELEPON:</span>
              <span className="text-zinc-900 font-bold">{phone}</span>
            </div>
            <div className="flex justify-between text-xs font-semibold text-zinc-500">
              <span>ALAMAT KIRIM:</span>
              <span className="text-zinc-900 text-right font-medium max-w-xs truncate">{address}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-100 flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              onClick={() => setStep('checkout')}
              disabled={loading}
              className="px-6 py-3 border border-zinc-300 text-zinc-700 rounded-lg text-sm font-semibold hover:bg-zinc-50 disabled:opacity-55"
            >
              Ubah Alamat
            </button>
            <button 
              onClick={handleSimulatePayment}
              disabled={loading}
              className="px-8 py-3 bg-[#154212] hover:bg-[#2d5a27] text-white rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-55"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Memproses Transaksi...</span>
                </span>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>Simulasi Konfirmasi Pembayaran</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default CartAndCheckoutView;
