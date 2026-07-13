import React from 'react';
import { Compass, Mail, Phone, MapPin, Instagram, Facebook, Youtube } from 'lucide-react';
import { SiteSettings } from '../types';

interface FooterProps {
  settings: SiteSettings;
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onNavigate }) => {
  return (
    <footer className="bg-zinc-50 border-t border-zinc-200 pt-16 pb-10 font-sans">
      <div className="max-w-7xl mx-auto px-6 md:px-10 grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8 mb-16">
        {/* Brand Column */}
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <img 
              alt="MAKOSA Logo" 
              className="h-12 w-auto object-contain" 
              src={settings.logoUrl} 
            />
            <span className="text-2xl font-bold text-[#154212] font-display">
              {settings.siteName}
            </span>
          </div>
          <p className="text-sm text-zinc-600 leading-relaxed">
            Pemberdayaan masyarakat melalui pengelolaan sampah mandiri menuju Desa Manggihan yang hijau, berkelanjutan, dan sejahtera.
          </p>
          <div className="flex gap-4">
            <a 
              href={`https://${settings.socialMedia.instagram}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-zinc-200/50 hover:bg-[#E1306C] hover:text-white flex items-center justify-center text-zinc-700 transition-all duration-300"
              aria-label="Instagram Link"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a 
              href={`https://${settings.socialMedia.facebook}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-zinc-200/50 hover:bg-[#1877F2] hover:text-white flex items-center justify-center text-zinc-700 transition-all duration-300"
              aria-label="Facebook Link"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a 
              href={`https://${settings.socialMedia.youtube}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-zinc-200/50 hover:bg-[#FF0000] hover:text-white flex items-center justify-center text-zinc-700 transition-all duration-300"
              aria-label="Youtube Link"
            >
              <Youtube className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Navigation Link Column */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold uppercase tracking-wider text-[#154212]">
            Navigasi
          </h4>
          <ul className="space-y-3 text-sm text-zinc-600">
            <li>
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('home'); }} className="hover:text-[#154212] transition-colors">
                Beranda
              </a>
            </li>
            <li>
              <a href="#produk" className="hover:text-[#154212] transition-colors">
                Katalog Produk
              </a>
            </li>
            <li>
              <a href="#artikel" className="hover:text-[#154212] transition-colors">
                Artikel Terbaru
              </a>
            </li>
            <li>
              <a href="#faq" className="hover:text-[#154212] transition-colors">
                Pusat FAQ
              </a>
            </li>
          </ul>
        </div>

        {/* Support Column */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold uppercase tracking-wider text-[#154212]">
            Dukungan
          </h4>
          <ul className="space-y-3 text-sm text-zinc-600">
            <li>
              <a href="#faq" className="hover:text-[#154212] transition-colors">
                Pusat Bantuan / FAQ
              </a>
            </li>
            <li>
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('orders'); }} className="hover:text-[#154212] transition-colors">
                Riwayat Pengiriman
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[#154212] transition-colors">
                Kebijakan Privasi
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[#154212] transition-colors">
                Syarat & Ketentuan
              </a>
            </li>
          </ul>
        </div>

        {/* Contact/Location Column */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold uppercase tracking-wider text-[#154212]">
            Hubungi Kami
          </h4>
          <ul className="space-y-3 text-sm text-zinc-600">
            <li className="flex items-start gap-2.5">
              <MapPin className="w-5 h-5 text-[#154212] flex-shrink-0 mt-0.5" />
              <span>{settings.address}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="w-4.5 h-4.5 text-[#154212] flex-shrink-0" />
              <a href={`mailto:${settings.email}`} className="hover:underline">
                {settings.email}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="w-4.5 h-4.5 text-[#154212] flex-shrink-0" />
              <a href={`https://wa.me/62${settings.phone}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                +62 {settings.phone}
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer Bottom Credentials */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 border-t border-zinc-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-zinc-500">
          © 2024 MAKOSA Desa Manggihan. All rights reserved.
        </p>
        <p className="text-xs text-zinc-400 font-medium">
          Sustainability is a shared journey. Supported by local community.
        </p>
      </div>
    </footer>
  );
};
export default Footer;
