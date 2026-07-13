import React from 'react';
import { ShoppingCart, LogIn, LogOut, Menu, User, ShieldAlert, BookOpen, Compass } from 'lucide-react';
import { UserProfile, SiteSettings } from '../types';

interface NavbarProps {
  currentUser: UserProfile | null;
  currentView: string;
  onNavigate: (view: string) => void;
  cartCount: number;
  onLogin: () => void;
  onLogout: () => void;
  settings: SiteSettings;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentView,
  onNavigate,
  cartCount,
  onLogin,
  onLogout,
  settings
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleNav = (view: string) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { name: 'Beranda', view: 'home' },
    { name: 'Produk', view: 'home', hash: '#produk' },
    { name: 'Artikel', view: 'home', hash: '#artikel' },
    { name: 'FAQ', view: 'home', hash: '#faq' },
  ];

  return (
    <nav className="bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-zinc-200 shadow-sm transition-all duration-300">
      <div className="flex justify-between items-center w-full px-6 md:px-10 py-4 max-w-7xl mx-auto">
        {/* Brand Logo */}
        <a 
          href="#" 
          onClick={(e) => { e.preventDefault(); handleNav('home'); }} 
          className="flex items-center gap-3 group"
        >
          <img 
            alt="MAKOSA Logo" 
            className="h-10 md:h-12 w-auto object-contain transition-transform group-hover:scale-105" 
            src={settings.logoUrl} 
          />
          <span className="text-xl md:text-2xl font-bold tracking-tight text-[#154212] font-display">
            {settings.siteName}
          </span>
        </a>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8 font-sans">
          {navLinks.map((link, idx) => (
            <a
              key={idx}
              href={link.hash || '#'}
              onClick={(e) => {
                if (!link.hash) {
                  e.preventDefault();
                  handleNav(link.view);
                }
              }}
              className={`font-semibold text-sm transition-all py-1 border-b-2 ${
                currentView === link.view && !link.hash
                  ? 'border-[#154212] text-[#154212]'
                  : 'border-transparent text-zinc-600 hover:text-[#154212]'
              }`}
            >
              {link.name}
            </a>
          ))}

          {currentUser && (
            <>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); handleNav('orders'); }}
                className={`font-semibold text-sm transition-all py-1 border-b-2 ${
                  currentView === 'orders'
                    ? 'border-[#154212] text-[#154212]'
                    : 'border-transparent text-zinc-600 hover:text-[#154212]'
                }`}
              >
                Pesanan Saya
              </a>
              {currentUser.role === 'admin' && (
                <button
                  onClick={() => handleNav('admin-dashboard')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#154212]/10 hover:bg-[#154212]/20 text-[#154212] rounded-lg text-xs font-bold transition-all"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Admin Panel
                </button>
              )}
            </>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4 md:gap-5">
          {/* Shopping Cart button */}
          <button 
            onClick={() => handleNav('cart')}
            className="p-2 hover:bg-zinc-100 rounded-full transition-all relative text-zinc-700"
            aria-label="View Cart"
          >
            <ShoppingCart className="w-5.5 h-5.5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#fcd400] text-[#6e5c00] text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full ring-2 ring-white">
                {cartCount}
              </span>
            )}
          </button>

          {/* User Profile / Login menu */}
          {currentUser ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleNav('profile')}
                className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#154212]/20 hover:border-[#154212] transition-all cursor-pointer focus:outline-none"
                title="Edit Profil"
              >
                <img 
                  className="w-full h-full object-cover" 
                  src={currentUser.photoUrl} 
                  alt={currentUser.name} 
                />
              </button>
              <button
                onClick={onLogout}
                className="hidden sm:flex items-center gap-1.5 text-zinc-500 hover:text-red-600 transition-colors text-sm font-semibold"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onLogin}
              className="bg-[#154212] text-white hover:bg-[#2d5a27] px-5 py-2 rounded-lg text-sm font-semibold transition-transform active:scale-95 flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk</span>
            </button>
          )}

          {/* Mobile menu trigger */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-zinc-700 hover:bg-zinc-100 rounded-lg transition-all"
            aria-label="Toggle Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-zinc-200 py-4 px-6 flex flex-col gap-3 shadow-inner animate-in fade-in slide-in-from-top-4 duration-200">
          {navLinks.map((link, idx) => (
            <a
              key={idx}
              href={link.hash || '#'}
              onClick={(e) => {
                if (!link.hash) {
                  e.preventDefault();
                  handleNav(link.view);
                } else {
                  setMobileMenuOpen(false);
                }
              }}
              className="text-zinc-700 font-semibold text-sm hover:text-[#154212] py-2"
            >
              {link.name}
            </a>
          ))}

          {currentUser && (
            <>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); handleNav('orders'); }}
                className="text-zinc-700 font-semibold text-sm hover:text-[#154212] py-2"
              >
                Pesanan Saya
              </a>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); handleNav('profile'); }}
                className="text-zinc-700 font-semibold text-sm hover:text-[#154212] py-2"
              >
                Edit Profil
              </a>
              {currentUser.role === 'admin' && (
                <button
                  onClick={() => handleNav('admin-dashboard')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#154212]/10 text-[#154212] font-bold rounded-lg text-sm mt-1"
                >
                  <ShieldAlert className="w-4 h-4" />
                  Admin Panel
                </button>
              )}
              <button
                onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-zinc-200 text-red-600 font-semibold rounded-lg text-sm mt-1"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};
export default Navbar;
