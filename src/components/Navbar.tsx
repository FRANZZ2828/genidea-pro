import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from './Icon';

interface NavItem { label: string; path: string; }
const NAV_ITEMS: NavItem[] = [
  { label: 'Beranda', path: '/' },
  { label: 'Serial Drama', path: '/serial-drama' },
];

const readCoins = () => Number(localStorage.getItem('genidea_coins') || 100);

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [coins, setCoins] = useState(readCoins);
  const [walletOpen, setWalletOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.add('dark');
    const sync = () => setCoins(readCoins());
    window.addEventListener('storage', sync);
    window.addEventListener('genidea-coins', sync);
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('genidea-coins', sync);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const addDemoCoins = (amount: number) => {
    const next = readCoins() + amount;
    localStorage.setItem('genidea_coins', String(next));
    setCoins(next);
    window.dispatchEvent(new Event('genidea-coins'));
  };

  const navClass = `fixed w-full z-50 transition-colors duration-300 ${
    isScrolled
      ? 'bg-white/95 dark:bg-[#080f1d]/95 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-blue-950'
      : 'bg-transparent'
  }`;

  return (
    <>
      <nav className={navClass}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                <span className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Icon name="play_arrow" className="text-white" size="lg" />
                </span>
                <span className="font-black text-xl tracking-tight text-gray-900 dark:text-white">GENIDEA <span className="text-primary">PRO</span></span>
              </Link>
              <div className="hidden md:block">
                <div className="flex items-baseline space-x-6">
                  {NAV_ITEMS.map((item) => (
                    <Link key={item.path} to={item.path}
                      className={`${location.pathname === item.path ? 'text-primary' : 'text-gray-600 dark:text-gray-300 hover:text-primary'} px-3 py-2 rounded-md text-sm font-semibold transition-colors`}>
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <form onSubmit={handleSearch} className="relative hidden sm:block">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Icon name="search" className="text-gray-400" /></div>
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-gray-100 dark:bg-slate-900 text-gray-900 dark:text-white text-sm rounded-full block w-40 lg:w-52 pl-10 pr-3 py-2 border border-transparent focus:border-primary focus:ring-0 placeholder-gray-500"
                  placeholder="Cari drama..." />
              </form>
              <button onClick={() => setWalletOpen(true)} className="flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-2 text-sm font-bold text-blue-600 dark:text-blue-300 hover:bg-blue-500/20">
                <Icon name="monetization_on" size="sm" /> <span>{coins.toLocaleString('id-ID')}</span><span className="hidden sm:inline">Koin</span>
              </button>
              <button onClick={toggleTheme} className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-800">
                {isDarkMode ? <Icon name="light_mode" /> : <Icon name="dark_mode" />}
              </button>
            </div>
          </div>
        </div>
      </nav>
      {walletOpen && (
        <div className="fixed inset-0 z-[80] bg-black/70 flex items-center justify-center p-4" onClick={() => setWalletOpen(false)}>
          <div className="w-full max-w-md rounded-2xl border border-blue-500/20 bg-white dark:bg-[#0c1729] p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div><p className="text-xs uppercase tracking-[.2em] text-primary font-bold">GENIDEA PRO WALLET</p><h2 className="text-2xl font-black text-gray-900 dark:text-white">Saldo Koin</h2></div>
              <button onClick={() => setWalletOpen(false)} className="text-2xl text-gray-500">×</button>
            </div>
            <div className="rounded-xl bg-gradient-to-r from-blue-700 to-cyan-500 p-5 text-white mb-5">
              <p className="text-sm text-blue-100">Saldo tersedia</p><p className="text-4xl font-black mt-1">{coins.toLocaleString('id-ID')} <span className="text-lg">Koin</span></p>
            </div>
            <p className="font-bold text-gray-900 dark:text-white mb-3">Paket koin demo</p>
            <div className="grid grid-cols-2 gap-3">
              {[{c:100,label:'Pemula'},{c:300,label:'Hemat'},{c:700,label:'Populer'},{c:1500,label:'Premium'}].map(p => (
                <button key={p.c} onClick={() => addDemoCoins(p.c)} className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4 text-left hover:bg-blue-500/15">
                  <span className="block text-xl font-black text-primary">{p.c.toLocaleString('id-ID')} koin</span><span className="text-xs text-gray-500 dark:text-gray-400">{p.label} · Tambah demo</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">Mode prototipe: penambahan koin hanya simulasi lokal, belum memproses pembayaran sungguhan.</p>
          </div>
        </div>
      )}
    </>
  );
};
export default Navbar;
