import React from 'react';
import { 
  BarChart, ShoppingCart, Layers, Globe, FileText, HelpCircle, Settings, LogOut, Search, Bell, 
  Trash2, Edit, Plus, Save, Download, Filter, AlertTriangle, CheckCircle, Flame, Leaf, Move, MapPin
} from 'lucide-react';
import { Product, Article, FAQ, HomepageSection, SiteSettings, Order, OrderStatus } from '../types';

interface AdminViewsProps {
  products: Product[];
  articles: Article[];
  faqs: FAQ[];
  sections: HomepageSection[];
  settings: SiteSettings;
  orders: Order[];
  onSaveProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onSaveArticle: (article: Article) => void;
  onDeleteArticle: (id: string) => void;
  onSaveFAQ: (faq: FAQ) => void;
  onDeleteFAQ: (id: string) => void;
  onSaveSettings: (settings: SiteSettings) => void;
  onSaveSection: (section: HomepageSection) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus, courier?: string, trackingNumber?: string) => void;
  onLogout: () => void;
}

interface CloudinaryUploaderProps {
  currentUrl: string;
  onUploadSuccess: (url: string) => void;
  label?: string;
}

const CloudinaryUploader: React.FC<CloudinaryUploaderProps> = ({ currentUrl, onUploadSuccess, label = "Unggah Gambar ke Cloudinary" }) => {
  const [uploading, setUploading] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState(currentUrl);

  React.useEffect(() => {
    setPreviewUrl(currentUrl);
  }, [currentUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'makosa_unsigned');

      const response = await fetch('https://api.cloudinary.com/v1_1/hr5roooz/image/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      const uploadedUrl = data.secure_url;
      setPreviewUrl(uploadedUrl);
      onUploadSuccess(uploadedUrl);
    } catch (err) {
      console.error("Cloudinary upload failed:", err);
      alert("Gagal mengunggah gambar ke Cloudinary. Silakan coba lagi.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2 border border-zinc-200 p-4 rounded-xl bg-zinc-50">
      <div className="flex justify-between items-center">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{label}</label>
        {uploading && <span className="text-xs text-[#154212] font-semibold animate-pulse">Mengunggah...</span>}
      </div>
      <div className="flex gap-4 items-center">
        {previewUrl && (
          <img 
            src={previewUrl} 
            alt="Preview" 
            className="w-16 h-16 object-cover rounded-lg border border-zinc-200" 
            referrerPolicy="no-referrer"
          />
        )}
        <div className="flex-grow">
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            className="block w-full text-xs text-zinc-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-xs file:font-semibold
              file:bg-[#154212]/10 file:text-[#154212]
              hover:file:bg-[#154212]/20 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

export const AdminViews: React.FC<AdminViewsProps> = ({
  products,
  articles,
  faqs,
  sections,
  settings,
  orders,
  onSaveProduct,
  onDeleteProduct,
  onSaveArticle,
  onDeleteArticle,
  onSaveFAQ,
  onDeleteFAQ,
  onSaveSettings,
  onSaveSection,
  onUpdateOrderStatus,
  onLogout
}) => {
  const [activeTab, setActiveTab] = React.useState<'dashboard' | 'orders' | 'products' | 'cms' | 'articles' | 'faq' | 'settings'>('dashboard');
  const [toastMsg, setToastMsg] = React.useState<string | null>(null);

  // Modal / Editor States
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);
  const [editingArticle, setEditingArticle] = React.useState<Article | null>(null);
  const [editingFAQ, setEditingFAQ] = React.useState<FAQ | null>(null);
  const [selectedAdminOrder, setSelectedAdminOrder] = React.useState<Order | null>(orders[0] || null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Helper status styling
  const getStatusStyle = (status: OrderStatus) => {
    switch (status) {
      case 'menunggu_pembayaran': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'diproses': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'dikirim': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'selesai': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-50 text-zinc-900 font-sans">
      {/* 1. SIDENAVBAR SHELL */}
      <aside className="w-64 bg-[#154212] text-white flex flex-col fixed left-0 top-0 h-screen py-6 z-40 border-r border-[#2d5a27]/30 shadow-xl">
        <div className="px-6 pb-8 border-b border-[#2d5a27]/40 mb-6">
          <h1 className="text-xl font-bold tracking-tight font-display flex items-center gap-2">
            <Leaf className="w-5 h-5 text-[#a1d494]" />
            MAKOSA Admin
          </h1>
          <p className="text-[10px] text-zinc-300 font-bold uppercase tracking-wider mt-1">Eco-Professional Portal</p>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          {[
            { id: 'dashboard', name: 'Dashboard', icon: <BarChart className="w-5 h-5" /> },
            { id: 'orders', name: 'Pesanan', icon: <ShoppingCart className="w-5 h-5" /> },
            { id: 'products', name: 'Katalog Produk', icon: <Layers className="w-5 h-5" /> },
            { id: 'cms', name: 'Homepage CMS', icon: <Globe className="w-5 h-5" /> },
            { id: 'articles', name: 'Artikel', icon: <FileText className="w-5 h-5" /> },
            { id: 'faq', name: 'Kelola FAQ', icon: <HelpCircle className="w-5 h-5" /> },
            { id: 'settings', name: 'Pengaturan', icon: <Settings className="w-5 h-5" /> },
          ].map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                  isActive 
                    ? 'bg-[#2d5a27] text-white shadow-inner font-bold border-l-4 border-[#a1d494]' 
                    : 'text-zinc-200 hover:bg-[#2d5a27]/40 hover:text-white'
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="px-4 pt-4 border-t border-[#2d5a27]/40">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-300 hover:text-red-100 hover:bg-red-950/20 rounded-lg text-sm font-semibold transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Keluar Sesi</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <div className="pl-64 flex-1 flex flex-col">
        {/* TopAppBar */}
        <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-zinc-200 py-4 px-10 flex justify-between items-center z-35 shadow-sm">
          <div className="flex items-center bg-zinc-100 px-4 py-2 rounded-full border border-zinc-200/80 max-w-sm w-full">
            <Search className="w-4 h-4 text-zinc-400 mr-2" />
            <input 
              type="text" 
              placeholder="Cari transaksi atau data..." 
              className="bg-transparent border-none text-xs focus:ring-0 w-full"
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-zinc-500 hover:text-[#154212] transition-colors rounded-full hover:bg-zinc-100">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-zinc-200">
              <div className="text-right">
                <p className="text-sm font-bold">Admin Utama</p>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Super Administrator</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#154212]/10 text-[#154212] flex items-center justify-center font-bold">
                AU
              </div>
            </div>
          </div>
        </header>

        {/* Content Canvas */}
        <main className="p-10 flex-1 overflow-y-auto">
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-10 animate-in fade-in duration-300">
              <div className="space-y-1">
                <h2 className="text-3xl font-bold font-display text-[#154212]">Ringkasan Dashboard</h2>
                <p className="text-sm text-zinc-500">Selamat datang kembali. Berikut adalah aktivitas terkini MAKOSA.</p>
              </div>

              {/* Bento Grid Analytics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200/50 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="p-3 bg-[#154212]/10 text-[#154212] rounded-lg">
                      <ShoppingCart className="w-6 h-6" />
                    </span>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">+12%</span>
                  </div>
                  <div className="mt-4">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Pesanan Baru Hari Ini</p>
                    <h3 className="text-2xl font-bold mt-1">{orders.filter(o => o.status === 'diproses').length} Pesanan</h3>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200/50 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="p-3 bg-amber-500/10 text-amber-600 rounded-lg">
                      <AlertTriangle className="w-6 h-6" />
                    </span>
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">Urgent</span>
                  </div>
                  <div className="mt-4">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Menunggu Diproses</p>
                    <h3 className="text-2xl font-bold mt-1">{orders.filter(o => o.status === 'menunggu_pembayaran').length} Pesanan</h3>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200/50 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="p-3 bg-blue-500/10 text-blue-600 rounded-lg">
                      <FileText className="w-6 h-6" />
                    </span>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">Active</span>
                  </div>
                  <div className="mt-4">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Artikel Terbit</p>
                    <h3 className="text-2xl font-bold mt-1">{articles.filter(a => a.isPublished).length} Publikasi</h3>
                  </div>
                </div>

                {/* Stock warnings */}
                <div className="bg-red-50 p-6 rounded-xl border border-red-200 flex flex-col justify-between border-l-4 border-l-red-600">
                  <div className="flex justify-between items-start">
                    <span className="p-3 bg-red-600/10 text-red-600 rounded-lg">
                      <AlertTriangle className="w-6 h-6" />
                    </span>
                    <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Peringatan</span>
                  </div>
                  <div className="mt-4">
                    <p className="text-xs font-bold text-red-700 uppercase tracking-wider">Briket Eco Stok Tipis</p>
                    <h3 className="text-2xl font-extrabold text-red-600 mt-1">{products.find(p => p.id === 'briket-eco')?.stock || 0} pcs tersisa</h3>
                  </div>
                </div>
              </div>

              {/* Lower Section: Orders table & system status split */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Recent Orders Table */}
                <div className="xl:col-span-2 bg-white rounded-xl border border-zinc-200/50 shadow-sm overflow-hidden">
                  <div className="px-6 py-5 border-b border-zinc-200 flex items-center justify-between">
                    <h3 className="font-bold text-lg font-display">Aktivitas Pesanan Terkini</h3>
                    <button onClick={() => setActiveTab('orders')} className="text-sm font-bold text-[#154212] hover:underline">Lihat Semua</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-zinc-50 border-b border-zinc-100 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                          <th className="px-6 py-4">ID Pesanan</th>
                          <th className="px-6 py-4">Pelanggan</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 text-sm">
                        {orders.slice(0, 5).map((ord) => (
                          <tr key={ord.id} className="hover:bg-zinc-50/50">
                            <td className="px-6 py-4 font-bold text-zinc-800">#{ord.id}</td>
                            <td className="px-6 py-4 font-semibold text-zinc-700">{ord.userName}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${getStatusStyle(ord.status)}`}>
                                {ord.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-bold">Rp {ord.totalPrice.toLocaleString('id-ID')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* System response & inventory checklist */}
                <div className="space-y-6">
                  <div className="bg-[#154212] text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                    <div className="relative z-10 space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-[#a1d494] rounded-full animate-ping"></span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#a1d494]">Sistem Online</span>
                      </div>
                      <h4 className="text-xl font-bold font-display">Performa Hari Ini Optimal</h4>
                      <p className="text-xs text-zinc-200 leading-relaxed">Kecepatan respons server 142ms. Integrasi Midtrans API &amp; Google Firebase berjalan tanpa hambatan.</p>
                      <button className="w-full py-2 bg-white text-[#154212] hover:bg-zinc-50 font-bold text-xs rounded-lg shadow-sm">
                        Unduh Log Laporan
                      </button>
                    </div>
                  </div>

                  {/* Inventory checklists */}
                  <div className="bg-white p-6 rounded-xl border border-zinc-200/50 shadow-sm space-y-4">
                    <h4 className="font-bold text-sm uppercase tracking-wider text-zinc-500">Quick Inventory Check</h4>
                    <div className="space-y-3">
                      {products.map((p) => (
                        <div key={p.id} className="flex justify-between items-center p-3 rounded-lg border border-zinc-150">
                          <div>
                            <p className="text-xs font-bold">{p.name}</p>
                            <p className="text-[10px] text-zinc-400">Tersedia: {p.stock} units</p>
                          </div>
                          {p.stock <= 10 ? (
                            <button 
                              onClick={() => {
                                const added = prompt(`Masukkan jumlah stok restok untuk ${p.name}:`, "50");
                                if (added) {
                                  const num = parseInt(added) || 0;
                                  onSaveProduct({ ...p, stock: p.stock + num });
                                  triggerToast(`Berhasil merestock ${p.name} sebanyak ${num} pcs.`);
                                }
                              }}
                              className="px-3 py-1 bg-red-600 text-white font-bold text-[10px] rounded uppercase"
                            >
                              Restock
                            </button>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Aman</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MANAGE ORDERS (Split Panel) */}
          {activeTab === 'orders' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <h2 className="text-3xl font-bold font-display text-[#154212]">Manajemen Pesanan</h2>
                  <p className="text-sm text-zinc-500">Pantau, terima, dan input nomor resi pengiriman logistik pelanggan.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-300 rounded-lg text-xs font-bold hover:bg-zinc-50">
                  <Download className="w-4 h-4" />
                  Ekspor PDF
                </button>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                {/* Orders list table */}
                <div className="xl:col-span-8 bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="p-4 border-b border-zinc-100 bg-zinc-50 flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-500">Daftar Transaksi</span>
                    <div className="flex gap-2">
                      <button className="p-2 bg-white rounded border border-zinc-200"><Filter className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-zinc-50 border-b border-zinc-100 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                          <th className="px-6 py-4">ID Pesanan</th>
                          <th className="px-6 py-4">Penerima</th>
                          <th className="px-6 py-4">Total</th>
                          <th className="px-6 py-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 text-sm">
                        {orders.map((ord) => {
                          const isSelected = selectedAdminOrder?.id === ord.id;
                          return (
                            <tr 
                              key={ord.id} 
                              onClick={() => setSelectedAdminOrder(ord)}
                              className={`cursor-pointer hover:bg-zinc-50/50 ${isSelected ? 'bg-[#154212]/5 font-semibold' : ''}`}
                            >
                              <td className="px-6 py-5 text-[#154212] font-bold">#{ord.id}</td>
                              <td className="px-6 py-5">{ord.userName}</td>
                              <td className="px-6 py-5 font-bold">Rp {ord.totalPrice.toLocaleString('id-ID')}</td>
                              <td className="px-6 py-5">
                                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${getStatusStyle(ord.status)}`}>
                                  {ord.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Split Panel detail editor */}
                <div className="xl:col-span-4">
                  {selectedAdminOrder ? (
                    <div className="bg-white border-2 border-[#154212]/20 rounded-xl overflow-hidden shadow-md sticky top-28">
                      <div className="bg-[#154212] text-white p-6">
                        <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Detail Mutasi</p>
                        <h3 className="text-xl font-bold font-display mt-1">#{selectedAdminOrder.id}</h3>
                      </div>

                      <div className="p-6 space-y-6">
                        {/* Items listed */}
                        <div className="space-y-3">
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider border-b pb-1">Daftar Barang</p>
                          {selectedAdminOrder.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs">
                              <span className="font-semibold text-zinc-800">{item.name} (x{item.qty})</span>
                              <span className="text-zinc-500">Rp {(item.price * item.qty).toLocaleString('id-ID')}</span>
                            </div>
                          ))}
                        </div>

                        {/* Customer billing address */}
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider border-b pb-1">Tujuan Kirim</p>
                          <p className="text-xs font-bold text-zinc-800">{selectedAdminOrder.userName} ({selectedOrderShippingWA(selectedAdminOrder)})</p>
                          <p className="text-xs text-zinc-600 leading-relaxed">{selectedAdminOrder.shippingAddress}</p>
                        </div>

                        {/* Save adjustments form */}
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const f = e.currentTarget;
                          const stat = (f.elements.namedItem('status') as HTMLSelectElement).value as OrderStatus;
                          const courier = (f.elements.namedItem('courier') as HTMLInputElement).value;
                          const resi = (f.elements.namedItem('resi') as HTMLInputElement).value;
                          onUpdateOrderStatus(selectedAdminOrder.id, stat, courier, resi);
                          triggerToast(`Berhasil menyimpan perubahan pesanan #${selectedAdminOrder.id}.`);
                        }} className="space-y-4 pt-4 border-t border-zinc-100">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Update Status</label>
                            <select 
                              name="status"
                              defaultValue={selectedAdminOrder.status}
                              className="w-full text-xs font-bold bg-zinc-50 p-2 border border-zinc-200 rounded focus:border-[#154212] focus:ring-0"
                            >
                              <option value="menunggu_pembayaran">Menunggu Pembayaran</option>
                              <option value="diproses">Diproses</option>
                              <option value="dikirim">Dikirim</option>
                              <option value="selesai">Selesai</option>
                            </select>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Ekspedisi</label>
                              <input 
                                type="text"
                                name="courier"
                                placeholder="Contoh: J&amp;T Express"
                                defaultValue={selectedAdminOrder.courier}
                                className="w-full text-xs p-2 border border-zinc-200 rounded"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Nomor Resi</label>
                              <input 
                                type="text"
                                name="resi"
                                placeholder="Contoh: JT1299"
                                defaultValue={selectedAdminOrder.trackingNumber}
                                className="w-full text-xs p-2 border border-zinc-200 rounded"
                              />
                            </div>
                          </div>

                          <button 
                            type="submit"
                            className="w-full flex items-center justify-center gap-2 py-3 bg-[#154212] hover:bg-[#2d5a27] text-white font-bold text-xs rounded-lg"
                          >
                            <Save className="w-4 h-4" />
                            <span>Simpan Perubahan</span>
                          </button>
                        </form>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-zinc-400 bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-xl">
                      <HelpCircle className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
                      <span>Silakan pilih salah satu pesanan untuk melihat detail mutasi.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MANAGE PRODUCTS CATALOG */}
          {activeTab === 'products' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <h2 className="text-3xl font-bold font-display text-[#154212]">Kelola Katalog Produk</h2>
                  <p className="text-sm text-zinc-500">Edit deskripsi, status tayang, stok, dan rentang harga jual pupuk &amp; briket.</p>
                </div>
                <button 
                  onClick={() => setEditingProduct({
                    id: `prod-${Date.now()}`,
                    name: 'Produk Baru',
                    description: 'Tulis deskripsi detail produk.',
                    price: 25000,
                    stock: 50,
                    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuCMfLPdcPYkvg0Ea0VPR3fuHFkKifpX-uHMeZk2LROQFgqu9_0DsCgTBQWPZuRJ0As5Ka7Pa7rYzI3zx_DDIbgKGilhfk-9a9qsK8FT-si_ndtnYiOyK6CFog2mzDjyvHkZPKSOIuBSKq1X__Gf3u4LQ_8khuFnfkWtH0jNe9ZsC5KqRp1sgCJrP033uvTV16kef8uOph-BvBDPmgXZJYBImYivn-q7xIy5Ed8Q5RvG6s7NN5anURtK'],
                    isActive: true,
                    updatedAt: new Date().toISOString()
                  })}
                  className="bg-[#154212] hover:bg-[#2d5a27] text-white px-5 py-3 rounded-lg text-xs font-bold flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Produk Baru
                </button>
              </div>

              {/* Product catalog tables */}
              <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-zinc-50 border-b border-zinc-100 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                        <th className="px-6 py-4">Gambar</th>
                        <th className="px-6 py-4">Nama Produk</th>
                        <th className="px-6 py-4">Harga</th>
                        <th className="px-6 py-4">Stok</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 text-sm">
                      {products.map((p) => (
                        <tr key={p.id} className="hover:bg-zinc-50/50">
                          <td className="px-6 py-4">
                            <img src={p.images[0]} className="w-12 h-12 rounded object-cover border border-zinc-200" alt="" />
                          </td>
                          <td className="px-6 py-4 font-bold text-[#154212]">{p.name}</td>
                          <td className="px-6 py-4 font-semibold">Rp {p.price.toLocaleString('id-ID')}</td>
                          <td className="px-6 py-4">
                            <span className={p.stock <= 10 ? 'text-red-600 font-extrabold' : 'font-medium'}>
                              {p.stock}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${p.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-100 text-zinc-500'}`}>
                              {p.isActive ? 'Aktif' : 'Nonaktif'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <button 
                              onClick={() => setEditingProduct(p)}
                              className="p-1.5 hover:bg-[#154212]/10 text-[#154212] rounded transition-colors"
                              title="Edit product info"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => {
                                if (confirm("Apakah Anda yakin ingin menghapus produk ini dari katalog?")) {
                                  onDeleteProduct(p.id);
                                  triggerToast("Produk berhasil dihapus.");
                                }
                              }}
                              className="p-1.5 hover:bg-red-50 text-red-600 rounded transition-colors"
                              title="Delete product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: HOMEPAGE CMS EDITOR */}
          {activeTab === 'cms' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="space-y-1">
                <h2 className="text-3xl font-bold font-display text-[#154212]">Homepage CMS Editor</h2>
                <p className="text-sm text-zinc-500">Edit, tambah, dan atur ulang urutan letak konten seksi pada halaman utama.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* CMS List segments */}
                <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Struktur Urutan Tampil</h3>
                  <div className="space-y-3">
                    {sections.map((sec, idx) => (
                      <div 
                        key={sec.id}
                        className="p-4 rounded-xl border-2 border-zinc-200 hover:border-[#154212]/40 bg-white flex items-center gap-3"
                      >
                        <Move className="w-4 h-4 text-zinc-400 cursor-grab active:cursor-grabbing" />
                        <div className="flex-grow">
                          <p className="font-bold text-sm text-[#154212]">{sec.type.toUpperCase()}</p>
                          <p className="text-xs text-zinc-500 truncate">{sec.title}</p>
                        </div>
                        <span className="text-[10px] font-bold text-zinc-400">POS {idx + 1}</span>
                      </div>
                    ))}
                  </div>

                  <button className="w-full py-3 mt-2 border-2 border-dashed border-zinc-300 hover:border-[#154212] rounded-xl flex items-center justify-center gap-2 text-zinc-500 hover:text-[#154212] text-xs font-bold transition-all">
                    <Plus className="w-4 h-4" />
                    Tambah Section Baru
                  </button>
                </div>

                {/* Right: CMS Active block config details */}
                <div className="lg:col-span-7 bg-white p-8 rounded-xl border border-zinc-200 shadow-sm space-y-6">
                  <h3 className="text-xl font-bold font-display text-[#154212] border-b pb-3">Konfigurasi Banner Hero Utama</h3>
                  
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const hero = sections.find(s => s.type === 'hero') || { id: 'sec-hero', type: 'hero', order: 1 } as HomepageSection;
                    const f = e.currentTarget;
                    onSaveSection({
                      ...hero,
                      title: (f.elements.namedItem('title') as HTMLInputElement).value,
                      subtitle: (f.elements.namedItem('subtitle') as HTMLTextAreaElement).value,
                      buttonText: (f.elements.namedItem('btn_text') as HTMLInputElement).value,
                      buttonLink: (f.elements.namedItem('btn_link') as HTMLInputElement).value,
                      image: (f.elements.namedItem('image') as HTMLInputElement).value,
                    });
                    triggerToast("Section Hero berhasil disimpan.");
                  }} className="space-y-5 text-sm">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Judul Headline Utama</label>
                      <input 
                        type="text" 
                        name="title"
                        defaultValue={sections.find(s => s.type === 'hero')?.title}
                        className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:border-[#154212] focus:ring-0" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Sub-judul / Deskripsi Pendukung</label>
                      <textarea 
                        name="subtitle"
                        rows={3}
                        defaultValue={sections.find(s => s.type === 'hero')?.subtitle}
                        className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:border-[#154212] focus:ring-0 resize-none" 
                      ></textarea>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Teks Tombol</label>
                        <input 
                          type="text" 
                          name="btn_text"
                          defaultValue={sections.find(s => s.type === 'hero')?.buttonText}
                          className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Tautan / Link Tombol</label>
                        <input 
                          type="text" 
                          name="btn_link"
                          defaultValue={sections.find(s => s.type === 'hero')?.buttonLink}
                          className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg" 
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">URL Gambar Banner</label>
                      <input 
                        type="text" 
                        name="image"
                        id="cmsHeroImageInput"
                        defaultValue={sections.find(s => s.type === 'hero')?.image}
                        className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg mb-2" 
                      />
                      <CloudinaryUploader 
                        currentUrl={sections.find(s => s.type === 'hero')?.image || ''} 
                        onUploadSuccess={(url) => {
                          const imgInput = document.getElementById('cmsHeroImageInput') as HTMLInputElement;
                          if (imgInput) {
                            imgInput.value = url;
                          }
                        }}
                        label="Unggah Gambar Banner ke Cloudinary"
                      />
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-[#154212] hover:bg-[#2d5a27] text-white py-3 rounded-lg text-xs font-bold shadow transition-all flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Simpan Perubahan Section</span>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: WRITE/MANAGE ARTICLES */}
          {activeTab === 'articles' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <h2 className="text-3xl font-bold font-display text-[#154212]">Manajemen Artikel</h2>
                  <p className="text-sm text-zinc-500">Tulis edukasi seputar pemanfaatan limbah, kompos blok, dan agenda Desa Manggihan.</p>
                </div>
                <button 
                  onClick={() => setEditingArticle({
                    id: `art-${Date.now()}`,
                    title: 'Artikel Baru',
                    content: 'Mulai menulis artikel inspiratif Anda di sini...',
                    category: 'Edukasi',
                    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwz0Tn5NoIB75FigD8a5Jp2X6TDu185t0AsQRHiTYbASIayaENOdDEWVt8Vs4cPkoL-JCq0Nj6e9IoUdHfLPwKeurJXjwsoPQEVXbg5vuTcOEz4dlZX4NVEw6ZxcS-EK8xw_0Z5jdJvbZDpa3cr_V3bqK0u4qWPcDekgu2nrSsHouD9xek4lzSdTBAmlGH-Q9vDXklqsQr1WFmWcPKBy5xQZyHr2h2i9k6bodR-GUPejKi75M5QmW7',
                    isPublished: true,
                    views: 0,
                    createdAt: new Date().toISOString()
                  })}
                  className="bg-[#154212] hover:bg-[#2d5a27] text-white px-5 py-3 rounded-lg text-xs font-bold flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Tulis Artikel Baru
                </button>
              </div>

              {/* Articles lists grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {articles.map((art) => (
                  <div key={art.id} className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm flex group">
                    <img src={art.coverImage} className="w-28 h-auto object-cover flex-shrink-0" alt="" />
                    <div className="p-5 flex-grow flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wider">{art.category}</span>
                        <h4 className="font-bold text-base text-zinc-900 mt-2 line-clamp-1">{art.title}</h4>
                        <p className="text-xs text-zinc-500 line-clamp-2 mt-1">{art.content}</p>
                      </div>
                      <div className="pt-4 border-t border-zinc-100 flex justify-between items-center text-xs">
                        <span className="text-zinc-400 font-semibold">{art.views} views</span>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setEditingArticle(art)}
                            className="p-1 hover:bg-[#154212]/10 text-[#154212] rounded transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => {
                              if (confirm("Hapus artikel ini secara permanen?")) {
                                onDeleteArticle(art.id);
                                triggerToast("Artikel berhasil dihapus.");
                              }
                            }}
                            className="p-1 hover:bg-red-50 text-red-600 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: FAQ MANAGEMENT */}
          {activeTab === 'faq' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <h2 className="text-3xl font-bold font-display text-[#154212]">Kelola FAQ Sistem</h2>
                  <p className="text-sm text-zinc-500">Edit, hapus, dan kelompokkan pertanyaan paling umum dari calon pembeli.</p>
                </div>
                <button 
                  onClick={() => setEditingFAQ({
                    id: `faq-${Date.now()}`,
                    question: 'Pertanyaan Baru?',
                    answer: 'Jawaban detail ditulis di sini.',
                    order: faqs.length + 1,
                    tags: ['Umum']
                  })}
                  className="bg-[#154212] hover:bg-[#2d5a27] text-white px-5 py-3 rounded-lg text-xs font-bold flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Tambah FAQ Baru
                </button>
              </div>

              {/* FAQs inline cards table */}
              <div className="space-y-4">
                {faqs.map((faq) => (
                  <div key={faq.id} className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex gap-4 group">
                    <div className="flex-grow space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Urutan {faq.order}</span>
                        <div className="flex gap-1">
                          {faq.tags.map((t, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-zinc-100 rounded text-[9px] font-bold text-zinc-600">{t}</span>
                          ))}
                        </div>
                      </div>
                      <h4 className="font-bold text-base text-[#154212]">{faq.question}</h4>
                      <p className="text-xs text-zinc-500 leading-relaxed">{faq.answer}</p>
                    </div>

                    <div className="flex flex-col gap-2 items-end flex-shrink-0">
                      <button 
                        onClick={() => setEditingFAQ(faq)}
                        className="p-1.5 hover:bg-[#154212]/10 text-[#154212] rounded transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm("Apakah Anda yakin ingin menghapus FAQ ini?")) {
                            onDeleteFAQ(faq.id);
                            triggerToast("FAQ berhasil dihapus.");
                          }
                        }}
                        className="p-1.5 hover:bg-red-50 text-red-600 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: SYSTEM SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="space-y-1">
                <h2 className="text-3xl font-bold font-display text-[#154212]">Pengaturan Sistem</h2>
                <p className="text-sm text-zinc-500">Kelola identitas, WA hotline, email bisnis, alamat kantor, dan tautan sosial media.</p>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                const f = e.currentTarget;
                onSaveSettings({
                  logoUrl: (f.elements.namedItem('logoUrl') as HTMLInputElement).value,
                  siteName: (f.elements.namedItem('siteName') as HTMLInputElement).value,
                  tagline: (f.elements.namedItem('tagline') as HTMLInputElement).value,
                  email: (f.elements.namedItem('email') as HTMLInputElement).value,
                  phone: (f.elements.namedItem('phone') as HTMLInputElement).value,
                  address: (f.elements.namedItem('address') as HTMLTextAreaElement).value,
                  socialMedia: {
                    instagram: (f.elements.namedItem('ig') as HTMLInputElement).value,
                    facebook: (f.elements.namedItem('fb') as HTMLInputElement).value,
                    youtube: (f.elements.namedItem('yt') as HTMLInputElement).value,
                  }
                });
                triggerToast("Pengaturan sistem berhasil disimpan.");
              }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Branding Column */}
                  <div className="bg-white p-8 rounded-xl border border-zinc-200 shadow-sm space-y-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 border-b pb-2">Identitas Visual</h3>
                    
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500">Nama Situs (Site Name)</label>
                      <input type="text" name="siteName" defaultValue={settings.siteName} className="w-full text-sm px-3 py-2 border rounded-lg" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500">Slogan (Tagline)</label>
                      <input type="text" name="tagline" defaultValue={settings.tagline} className="w-full text-sm px-3 py-2 border rounded-lg" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500">URL Logo Situs</label>
                      <input type="text" name="logoUrl" defaultValue={settings.logoUrl} className="w-full text-sm px-3 py-2 border rounded-lg" />
                    </div>
                  </div>

                  {/* Contacts Column */}
                  <div className="bg-white p-8 rounded-xl border border-zinc-200 shadow-sm space-y-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 border-b pb-2">Informasi Kontak</h3>
                    
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500">Email Bisnis</label>
                      <input type="email" name="email" defaultValue={settings.email} className="w-full text-sm px-3 py-2 border rounded-lg" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500">Nomor WhatsApp Hotline</label>
                      <input type="text" name="phone" defaultValue={settings.phone} className="w-full text-sm px-3 py-2 border rounded-lg" />
                    </div>
                  </div>
                </div>

                {/* Address & map coordinates preview */}
                <div className="bg-white p-8 rounded-xl border border-zinc-200 shadow-sm space-y-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 border-b pb-2">Alamat &amp; Sosial Media</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-500">Alamat Lengkap Operasional</label>
                        <textarea name="address" rows={4} defaultValue={settings.address} className="w-full text-sm px-3 py-2 border rounded-lg resize-none"></textarea>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-500">Instagram</label>
                        <input type="text" name="ig" defaultValue={settings.socialMedia.instagram} className="w-full text-sm px-3 py-2 border rounded-lg" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-500">Facebook</label>
                        <input type="text" name="fb" defaultValue={settings.socialMedia.facebook} className="w-full text-sm px-3 py-2 border rounded-lg" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-500">YouTube Channel</label>
                        <input type="text" name="yt" defaultValue={settings.socialMedia.youtube} className="w-full text-sm px-3 py-2 border rounded-lg" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button 
                    type="submit" 
                    className="px-10 py-3.5 bg-[#154212] hover:bg-[#2d5a27] text-white font-bold text-sm rounded-lg shadow-md transition-all active:scale-98"
                  >
                    Simpan Semua Pengaturan
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* 2. MODAL EDIT PRODUCT */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingProduct(null)}></div>
          <div className="relative bg-white w-full max-w-xl rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b flex justify-between items-center bg-zinc-50">
              <h3 className="text-lg font-bold text-[#154212] font-display">Kelola Detil Produk</h3>
              <button onClick={() => setEditingProduct(null)} className="text-zinc-400 hover:text-zinc-600">✕</button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const f = e.currentTarget;
              onSaveProduct({
                ...editingProduct,
                name: (f.elements.namedItem('name') as HTMLInputElement).value,
                price: parseInt((f.elements.namedItem('price') as HTMLInputElement).value) || 0,
                stock: parseInt((f.elements.namedItem('stock') as HTMLInputElement).value) || 0,
                description: (f.elements.namedItem('description') as HTMLTextAreaElement).value,
                isActive: (f.elements.namedItem('isActive') as HTMLInputElement).checked,
              });
              setEditingProduct(null);
              triggerToast("Berhasil menyimpan perubahan produk.");
            }} className="p-8 space-y-4 text-sm">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500">Nama Produk</label>
                <input type="text" name="name" defaultValue={editingProduct.name} required className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500">Harga Jual (Rp)</label>
                  <input type="number" name="price" defaultValue={editingProduct.price} required className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500">Stok Tersedia (pcs)</label>
                  <input type="number" name="stock" defaultValue={editingProduct.stock} required className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </div>
              <div className="space-y-1">
                <CloudinaryUploader 
                  currentUrl={editingProduct.images?.[0] || ''} 
                  onUploadSuccess={(url) => {
                    setEditingProduct({
                      ...editingProduct,
                      images: [url]
                    });
                  }}
                  label="Foto Produk"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500">Deskripsi Lengkap</label>
                <textarea name="description" rows={3} defaultValue={editingProduct.description} className="w-full px-3 py-2 border rounded-lg resize-none"></textarea>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="p_active" name="isActive" defaultChecked={editingProduct.isActive} className="rounded text-[#154212] focus:ring-0" />
                <label htmlFor="p_active" className="text-xs font-bold text-zinc-600">Tampilkan Produk ke Publik (Aktif)</label>
              </div>

              <div className="pt-4 border-t flex justify-end gap-3">
                <button type="button" onClick={() => setEditingProduct(null)} className="px-5 py-2 border rounded-lg">Batal</button>
                <button type="submit" className="px-8 py-2 bg-[#154212] text-white rounded-lg font-bold">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. MODAL EDIT ARTICLE */}
      {editingArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingArticle(null)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b flex justify-between items-center bg-zinc-50">
              <h3 className="text-lg font-bold text-[#154212] font-display">Tulis / Edit Artikel</h3>
              <button onClick={() => setEditingArticle(null)} className="text-zinc-400 hover:text-zinc-600">✕</button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const f = e.currentTarget;
              onSaveArticle({
                ...editingArticle,
                title: (f.elements.namedItem('title') as HTMLInputElement).value,
                category: (f.elements.namedItem('category') as HTMLSelectElement).value,
                content: (f.elements.namedItem('content') as HTMLTextAreaElement).value,
                coverImage: (f.elements.namedItem('coverImage') as HTMLInputElement).value,
              });
              setEditingArticle(null);
              triggerToast("Berhasil menyimpan perubahan artikel.");
            }} className="p-8 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500">Judul Artikel</label>
                  <input type="text" name="title" defaultValue={editingArticle.title} required className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500">Kategori</label>
                  <select name="category" defaultValue={editingArticle.category} className="w-full px-3 py-2 border rounded-lg">
                    <option value="Edukasi">Edukasi</option>
                    <option value="Panduan Produk">Panduan Produk</option>
                    <option value="Berita Desa">Berita Desa</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500">URL Foto Cover</label>
                <input 
                  type="text" 
                  name="coverImage" 
                  id="coverImageInput"
                  defaultValue={editingArticle.coverImage} 
                  className="w-full px-3 py-2 border rounded-lg mb-2" 
                />
                <CloudinaryUploader 
                  currentUrl={editingArticle.coverImage || ''} 
                  onUploadSuccess={(url) => {
                    setEditingArticle({
                      ...editingArticle,
                      coverImage: url
                    });
                    const coverInput = document.getElementById('coverImageInput') as HTMLInputElement;
                    if (coverInput) coverInput.value = url;
                  }}
                  label="Unggah Foto Cover ke Cloudinary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500">Konten Artikel</label>
                <textarea name="content" rows={6} defaultValue={editingArticle.content} required className="w-full px-3 py-2 border rounded-lg font-mono text-xs"></textarea>
              </div>

              <div className="pt-4 border-t flex justify-end gap-3">
                <button type="button" onClick={() => setEditingArticle(null)} className="px-5 py-2 border rounded-lg">Batal</button>
                <button type="submit" className="px-8 py-2 bg-[#154212] text-white rounded-lg font-bold">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. MODAL EDIT FAQ */}
      {editingFAQ && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingFAQ(null)}></div>
          <div className="relative bg-white w-full max-w-xl rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b flex justify-between items-center bg-zinc-50">
              <h3 className="text-lg font-bold text-[#154212] font-display">Kelola FAQ</h3>
              <button onClick={() => setEditingFAQ(null)} className="text-zinc-400 hover:text-zinc-600">✕</button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const f = e.currentTarget;
              onSaveFAQ({
                ...editingFAQ,
                question: (f.elements.namedItem('question') as HTMLInputElement).value,
                answer: (f.elements.namedItem('answer') as HTMLTextAreaElement).value,
                order: parseInt((f.elements.namedItem('order') as HTMLInputElement).value) || 1,
              });
              setEditingFAQ(null);
              triggerToast("Berhasil menyimpan perubahan FAQ.");
            }} className="p-8 space-y-4 text-sm">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-bold text-zinc-500">Pertanyaan</label>
                  <input type="text" name="question" defaultValue={editingFAQ.question} required className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500">Posisi Tampil</label>
                  <input type="number" name="order" defaultValue={editingFAQ.order} required className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500">Jawaban Detail</label>
                <textarea name="answer" rows={4} defaultValue={editingFAQ.answer} required className="w-full px-3 py-2 border rounded-lg resize-none"></textarea>
              </div>

              <div className="pt-4 border-t flex justify-end gap-3">
                <button type="button" onClick={() => setEditingFAQ(null)} className="px-5 py-2 border rounded-lg">Batal</button>
                <button type="submit" className="px-8 py-2 bg-[#154212] text-white rounded-lg font-bold">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. SUCCESS LIVE TOAST ALERTER */}
      {toastMsg && (
        <div className="fixed bottom-8 right-8 bg-[#154212] text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300 z-50">
          <CheckCircle className="w-5 h-5 text-[#a1d494]" />
          <p className="text-xs font-bold">{toastMsg}</p>
        </div>
      )}
    </div>
  );
};

// Safe fallback parsing for WA number on order details
function selectedOrderShippingWA(order: Order): string {
  if (order.phone) return order.phone;
  return '+62 812-3456-7890';
}

export default AdminViews;
