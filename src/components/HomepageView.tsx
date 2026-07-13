import React from 'react';
import { Leaf, Award, Shield, ArrowRight, Star, ShoppingCart, CheckCircle, Flame, Eye, Calendar, Plus, Tag, HelpCircle, Heart } from 'lucide-react';
import { Product, Article, FAQ, HomepageSection, SiteSettings } from '../types';
import { motion } from 'motion/react';

interface HomepageViewProps {
  products: Product[];
  articles: Article[];
  faqs: FAQ[];
  sections: HomepageSection[];
  settings: SiteSettings;
  onViewProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onNavigate: (view: string) => void;
}

export const HomepageView: React.FC<HomepageViewProps> = ({
  products,
  articles,
  faqs,
  sections,
  settings,
  onViewProduct,
  onAddToCart,
  onNavigate
}) => {
  const [activeFaq, setActiveFaq] = React.useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = React.useState<Article | null>(null);

  // Fallback defaults if sections is empty
  const heroSec = sections.find(s => s.type === 'hero') || {
    title: 'Solusi Energi Berkelanjutan untuk Desa',
    subtitle: 'Mengubah limbah organik menjadi briket berkualitas tinggi dan kompos premium untuk masa depan hijau Indonesia.',
    buttonText: 'Jelajahi Produk',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB7UmjNUou828wbbM3py2XJhaWxRhbZNhTtf7yimBCotgjfkpGamV6-nmkzOTnTDBqc8daZFtfgOXAgBRb6jozb2cXCWtEPNdSnWIySv9fcwsltgTEjy0alYbgvrS-Fue2S0jU852mKnSF2pv121MjEbOwoPuKDq3ajyugyAnEniV-SkVheIFdkU-iX9Sl9UEwxV016oKEvHtEhcFmANFA6OxpZ_xj_hBV6xaqHt6cCNqA8zZul4ZlF'
  };

  const aboutSec = sections.find(s => s.type === 'about') || {
    title: 'Tentang Program MAKOSA',
    subtitle: 'MAKOSA adalah inisiatif keberlanjutan Desa Manggihan untuk mengelola sampah secara mandiri dan menciptakan ekonomi sirkular. Kami percaya bahwa setiap limbah yang dihasilkan oleh desa dapat dikembalikan ke alam dalam bentuk yang lebih bermanfaat.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCinpHS8S_bFEO4QL_0c3uBPycXM395-QGvXL7ls7yMr1B8KP5noFeKOd4fB5ruY58ubJrJEjsScnOk-jnZnUJMBMAgItqVyjpAGU6bS7uYEyNkIsu4asuOMnQlBOKHSOahfuX9DwJfc6njP8XIpbHVG_N8VxOTSAWmGQ5V9ZDHDXfvMKxritKvjOpZzaAYOtiqSKpqt9K6DKqBazUoQgXpLQfW9EJ-pNR9YtwE8SapvdN6O5dZq_qF'
  };

  return (
    <div className="animate-in fade-in duration-300">
      {/* Hero Header Banner */}
      <header className="relative bg-white pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left space-y-6 z-10">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#154212]/10 text-[#154212] rounded-full text-xs font-bold uppercase tracking-wider">
              <Leaf className="w-3.5 h-3.5" />
              Inisiatif Keberlanjutan
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#154212] leading-tight font-display">
              {heroSec.title}
            </h1>
            <p className="text-zinc-600 text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
              {heroSec.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a 
                href="#produk"
                className="px-8 py-4 bg-[#154212] text-white font-semibold text-sm rounded-lg hover:bg-[#2d5a27] hover:shadow-lg hover:shadow-[#154212]/10 transition-all text-center"
              >
                Lihat Produk Kami
              </a>
              <a 
                href="#tentang"
                className="px-8 py-4 bg-white border-2 border-zinc-200 text-zinc-700 font-semibold text-sm rounded-lg hover:bg-zinc-50 transition-all text-center"
              >
                Pelajari Program
              </a>
            </div>
          </div>

          <div className="relative flex justify-center lg:h-[500px]">
            {/* Soft decorative background blurs */}
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-[#154212]/5 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-zinc-100 rounded-full blur-3xl opacity-50"></div>
            
            <div className="relative w-full h-[320px] sm:h-[400px] lg:h-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
              <img 
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" 
                src={heroSec.image} 
                alt="MAKOSA program banner image showcasing green rolling hills of Manggihan village" 
              />
            </div>
          </div>
        </div>
      </header>

      {/* Sustainable Impact Meter */}
      <section className="bg-[#154212] text-white py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-1">
            <p className="text-3xl md:text-4xl font-bold font-headline">70%</p>
            <p className="text-xs md:text-sm text-zinc-300 uppercase tracking-widest font-semibold">Sampah Desa Berkurang</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl md:text-4xl font-bold font-headline">14.5 Ton</p>
            <p className="text-xs md:text-sm text-zinc-300 uppercase tracking-widest font-semibold">Limbah Organik Terolah</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl md:text-4xl font-bold font-headline">145+</p>
            <p className="text-xs md:text-sm text-zinc-300 uppercase tracking-widest font-semibold">Peternak &amp; Petani Terbantu</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl md:text-4xl font-bold font-headline">4.2 Ton</p>
            <p className="text-xs md:text-sm text-zinc-300 uppercase tracking-widest font-semibold">Emisi CO2 Dikurangi</p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 bg-white" id="tentang">
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-col lg:flex-row gap-16 items-center">
          <div className="w-full lg:w-1/2 order-2 lg:order-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl overflow-hidden aspect-square shadow-md transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                <img 
                  className="w-full h-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCinpHS8S_bFEO4QL_0c3uBPycXM395-QGvXL7ls7yMr1B8KP5noFeKOd4fB5ruY58ubJrJEjsScnOk-jnZnUJMBMAgItqVyjpAGU6bS7uYEyNkIsu4asuOMnQlBOKHSOahfuX9DwJfc6njP8XIpbHVG_N8VxOTSAWmGQ5V9ZDHDXfvMKxritKvjOpZzaAYOtiqSKpqt9K6DKqBazUoQgXpLQfW9EJ-pNR9YtwE8SapvdN6O5dZq_qF" 
                  alt="Farmer processing agricultural organic compost" 
                />
              </div>
              <div className="rounded-xl overflow-hidden aspect-square shadow-md transform translate-y-6 rotate-3 hover:rotate-0 transition-transform duration-300">
                <img 
                  className="w-full h-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAbxLn-aC4XWtMtZldST6vvSP8A0nhgeBxVspBbEVgWhO4Zs6ukcrSEjccXpudFf2BDqDWQsJLaE9Cj2veCKEvA7y8FKN974mMbZcxmyGIDDPj4xoPO0UNRTqKHTnbtunRjAjzGAe9JRqqbCx5wPg5vlKqKDgZ3JrmdfjzmlH8DXfIsFLQGOx4YOBNvXCYR9QbmxhbxYnYjVYoXZiAFKR2m0Nug8qW8deG8mHVcqCyncHBrfd-l-BF9" 
                  alt="Desa Manggihan green landscape integrated with recycling facilities" 
                />
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/2 order-1 lg:order-2 space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-[#154212] font-display">
              {aboutSec.title}
            </h2>
            <p className="text-zinc-600 leading-relaxed text-sm md:text-base">
              {aboutSec.subtitle}
            </p>
            <p className="text-zinc-600 leading-relaxed text-sm md:text-base">
              Melalui kolaborasi antara masyarakat desa Manggihan and teknologi pengolahan sampah modern, kami mengubah sisa organik menjadi produk unggulan yang membantu petani meningkatkan hasil panen dan menyediakan energi ramah lingkungan.
            </p>
            <div className="space-y-3 pt-2">
              {[
                'Pengurangan pembuangan sampah liar secara swadaya.',
                'Pemberdayaan ekonomi sirkular dan penciptaan lapangan kerja lokal.',
                'Menghasilkan pupuk organik berkualitas tinggi untuk ketahanan pangan.'
              ].map((point, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#154212] mt-0.5 flex-shrink-0" />
                  <span className="text-sm font-medium text-zinc-700">{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Products Catalog Listing */}
      <section className="py-24 bg-white border-t border-b border-zinc-200" id="produk">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="text-center space-y-3 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#154212] font-display">
              Produk Unggulan Kami
            </h2>
            <p className="text-zinc-600 max-w-xl mx-auto text-sm md:text-base">
              Gunakan produk ramah lingkungan hasil olahan Desa Manggihan berkualitas tinggi untuk pertanian dan energi alternatif Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto font-sans">
            {products.filter(p => p.isActive).map((product) => {
              const isKompos = product.id === 'kompos-blok';
              return (
                <div 
                  key={product.id}
                  className="bg-white rounded-2xl overflow-hidden border border-zinc-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group"
                >
                  <div className="relative h-64 overflow-hidden bg-zinc-50 cursor-pointer" onClick={() => onViewProduct(product)}>
                    <img 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                      src={product.images[0]} 
                      alt={product.name} 
                    />
                    {isKompos && (
                      <span className="absolute top-4 left-4 bg-[#154212] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        Terlaris
                      </span>
                    )}
                    {product.stock <= 10 && (
                      <span className="absolute top-4 right-4 bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        Stok Menipis ({product.stock})
                      </span>
                    )}
                  </div>

                  <div className="p-8 flex flex-col flex-grow space-y-4">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-xl font-bold text-zinc-900 group-hover:text-[#154212] transition-colors cursor-pointer" onClick={() => onViewProduct(product)}>
                        {product.name}
                      </h3>
                      <span className="text-lg font-bold text-[#2d5a27] whitespace-nowrap">
                        Rp {product.price.toLocaleString('id-ID')}
                      </span>
                    </div>

                    <p className="text-sm text-zinc-600 leading-relaxed flex-grow line-clamp-3">
                      {product.description}
                    </p>

                    <div className="pt-4 flex items-center gap-3">
                      <button
                        onClick={() => onViewProduct(product)}
                        className="px-4 py-3 border border-zinc-300 text-zinc-700 font-semibold text-xs rounded-lg hover:bg-zinc-50 transition-colors"
                      >
                        Detail
                      </button>
                      <button 
                        onClick={() => onAddToCart(product)}
                        className="flex-1 bg-[#154212] hover:bg-[#2d5a27] text-white py-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-98"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Tambah ke Keranjang
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Articles / News Feed Section */}
      <section className="py-24 bg-white font-sans" id="artikel">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="flex flex-col sm:flex-row justify-between items-end gap-4 mb-16">
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#154212] uppercase tracking-widest">
                Kabar Terkini
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-[#154212] font-display">
                Edukasi Lingkungan &amp; Aktivitas Desa
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.filter(a => a.isPublished).slice(0, 3).map((article) => (
              <div 
                key={article.id} 
                className="group cursor-pointer flex flex-col h-full bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all"
                onClick={() => setSelectedArticle(article)}
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-zinc-50">
                  <img 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    src={article.coverImage} 
                    alt={article.title} 
                  />
                  <span className="absolute top-4 left-4 bg-white/95 backdrop-blur text-[#154212] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    {article.category}
                  </span>
                </div>
                <div className="p-6 flex flex-col flex-grow space-y-3">
                  <div className="flex items-center gap-4 text-xs text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(article.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {article.views} views
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 group-hover:text-[#154212] transition-colors line-clamp-2 leading-snug">
                    {article.title}
                  </h3>
                  <p className="text-xs md:text-sm text-zinc-600 line-clamp-3 leading-relaxed flex-grow">
                    {article.content}
                  </p>
                  <span className="text-[#154212] font-bold text-xs inline-flex items-center gap-1 pt-2 group-hover:gap-2 transition-all">
                    Baca Selengkapnya
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Collapsible FAQ Section */}
      <section className="py-24 bg-white border-t border-zinc-200" id="faq font-sans">
        <div className="max-w-4xl mx-auto px-6 md:px-10 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-[#154212] uppercase tracking-widest flex items-center justify-center gap-1.5">
              <HelpCircle className="w-4 h-4" />
              Tanya Jawab
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#154212] font-display">
              Frequently Asked Questions (FAQ)
            </h2>
            <p className="text-zinc-600 max-w-xl mx-auto text-sm md:text-base">
              Temukan jawaban atas pertanyaan umum terkait produk dan operasional MAKOSA Desa Manggihan.
            </p>
          </div>

          <div className="space-y-4 font-sans">
            {faqs.map((faq) => {
              const isOpen = activeFaq === faq.id;
              return (
                <div 
                  key={faq.id}
                  className="bg-white border border-zinc-200 rounded-xl overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : faq.id)}
                    className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                  >
                    <span className="text-base font-bold text-zinc-900 pr-4">
                      {faq.question}
                    </span>
                    <span className={`p-1.5 rounded-full bg-zinc-100 text-zinc-700 transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}>
                      <Plus className="w-4 h-4" />
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 pt-1 border-t border-zinc-100 dark:border-zinc-850 animate-in fade-in slide-in-from-top-2 duration-350">
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        {faq.answer}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-4">
                        {faq.tags.map((tag, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded text-xs font-semibold">
                            <Tag className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Partners Grayscale Strip */}
      <section className="py-16 bg-white border-t border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 md:px-10 text-center space-y-8">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
            Mitra Kami &amp; Didukung Oleh
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-50 hover:opacity-100 transition-opacity duration-300">
            <img 
              alt="Partner Logos" 
              className="h-10 md:h-12 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCN9dvbRouocMr47m4L0ftWmsEDRltxGrF0vicV7snl6JM9qvOb5drZhVr3G0m98YjvIUIZSyiei50yMCb0LvZealFZjM-SsR5z9uHN_XCiyllpOhQ2XnoUhJVgaNVp6qu8TzZuDD9et7u94Y0-z6HpJWDEfIE-Ir7kYmc4OuPowPRtwVZ6bFnwyi9af7V2DgrPOzghIG7Ydlu3Elnwx82CNDk-uRlYeQ4lRgVAc0hXYX8iIbcadynazc0v24h8DGmitQ" 
            />
          </div>
        </div>
      </section>

      {/* Read Article Dialog Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop blur */}
          <div 
            onClick={() => setSelectedArticle(null)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          ></div>
          
          <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
            <div className="relative h-64 overflow-hidden bg-zinc-50 flex-shrink-0">
              <img 
                className="w-full h-full object-cover" 
                src={selectedArticle.coverImage} 
                alt={selectedArticle.title} 
              />
              <span className="absolute top-4 left-4 bg-[#154212] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {selectedArticle.category}
              </span>
              <button 
                onClick={() => setSelectedArticle(null)}
                className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="p-8 overflow-y-auto space-y-4">
              <div className="flex items-center gap-4 text-xs text-zinc-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(selectedArticle.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  {selectedArticle.views} views
                </span>
              </div>
              <h3 className="text-2xl font-bold text-zinc-900 leading-tight">
                {selectedArticle.title}
              </h3>
              <p className="text-zinc-700 leading-relaxed text-sm md:text-base whitespace-pre-wrap">
                {selectedArticle.content}
              </p>
            </div>
            
            <div className="p-6 bg-zinc-50 border-t border-zinc-200 flex justify-end flex-shrink-0 font-sans">
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-6 py-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 font-semibold text-sm rounded-lg"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default HomepageView;
