import React, { useState, useRef } from 'react';

export default function App() {
  // State Mode Motion Super
  const [isMotionSuper, setIsMotionSuper] = useState(true);

  // State Drawer Menu Samping
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('slots');

  // State Slot Pertama (Default Kosong, Nanti User Yang Pasang)
  const [isOccupied, setIsOccupied] = useState(false);
  const [colSpan, setColSpan] = useState(2);
  const [rowSpan, setRowSpan] = useState(2);

  // Data Banner
  const [bannerData, setBannerData] = useState({
    name: '',
    image: null,
    link: '',
    musicTitle: 'Lofi Vibes - API Chill',
    isPlayingMusic: false,
    socials: [
      {
        name: 'TikTok',
        icon: 'https://cdn-icons-png.flaticon.com/512/3046/3046121.png',
        url: 'https://tiktok.com',
      },
      {
        name: 'Discord',
        icon: 'https://cdn-icons-png.flaticon.com/512/3670/3670157.png',
        url: 'https://discord.com',
      },
    ],
  });

  // State Modal Form (Default kosong agar placeholder tidak perlu dihapus manual)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputName, setInputName] = useState('');
  const [inputImage, setInputImage] = useState(null);
  const [inputLink, setInputLink] = useState('');
  const [customIcon, setCustomIcon] = useState(null);
  const [customIconUrl, setCustomIconUrl] = useState('');

  // Drag / Resize Tracking State
  const dragStartRef = useRef(null);

  // Handle Resize Touch / Mouse
  const handleTouchStart = (e) => {
    e.stopPropagation();
    const touch = e.touches[0];
    dragStartRef.current = { x: touch.clientX, y: touch.clientY, initialCols: colSpan, initialRows: rowSpan };
  };

  const handleTouchMove = (e) => {
    if (!dragStartRef.current) return;
    const touch = e.touches[0];
    const diffX = touch.clientX - dragStartRef.current.x;
    const diffY = touch.clientY - dragStartRef.current.y;

    const addCols = Math.round(diffX / 40);
    const addRows = Math.round(diffY / 40);

    const nextCols = Math.min(Math.max(dragStartRef.current.initialCols + addCols, 1), 5);
    const nextRows = Math.min(Math.max(dragStartRef.current.initialRows + addRows, 1), 6);

    setColSpan(nextCols);
    setRowSpan(nextRows);
  };

  const handleTouchEnd = () => {
    dragStartRef.current = null;
  };

  // Upload Media
  const handleBannerUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setInputImage(URL.createObjectURL(file));
    }
  };

  const handleCustomIconUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCustomIcon(URL.createObjectURL(file));
    }
  };

  // Simpan Form Modal
  const handleSaveModal = () => {
    let updatedSocials = [...bannerData.socials];
    if (customIcon && customIconUrl) {
      updatedSocials.push({
        name: 'Custom',
        icon: customIcon,
        url: customIconUrl,
      });
    }

    setBannerData({
      ...bannerData,
      name: inputName.trim() ? inputName : 'Anak Programmer Indonesia',
      image: inputImage,
      link: inputLink.trim() ? inputLink : 'https://linktujuankamu',
      socials: updatedSocials,
    });
    setIsOccupied(true);
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#070b12] text-white flex flex-col items-center p-4 select-none font-sans relative overflow-x-hidden transition-colors duration-500">
      
      {/* Header Bar (Logo ProMotion Ditiadakan) */}
      <header className="w-full max-w-md flex items-center justify-between py-3 px-2 border-b border-white/5 relative z-30">
        <div className="flex items-center gap-3">
          {/* Tombol Hamburger Aktif */}
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="w-10 h-10 rounded-2xl bg-[#0e1622]/80 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white hover:border-emerald-500/40 active:scale-90 transition-all duration-300 shadow-sm"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Badge Switcher Motion Super */}
          <button
            onClick={() => setIsMotionSuper(!isMotionSuper)}
            className={`px-3 py-1.5 text-[11px] font-bold rounded-full transition-all duration-300 border ${
              isMotionSuper
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)] scale-100'
                : 'bg-white/5 border-white/10 text-gray-400 opacity-70'
            }`}
          >
            MOTION SUPER
          </button>
          <span className="px-3 py-1.5 text-[11px] font-semibold rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            Slot {isOccupied ? '1' : '0'}/100
          </span>
        </div>
      </header>

      {/* Hero Description */}
      <div className="w-full max-w-md text-center my-4 px-2 animate-fadeIn">
        <div className="inline-block px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-medium mb-2 shadow-[0_0_10px_rgba(16,185,129,0.15)]">
          Promosikan Produk, Jasa, Website, dll anda di sini
        </div>
        <p className="text-gray-400 text-xs leading-relaxed">
          Papan iklan piksel digital komunitas. Pasang banner usahamu, tentukan ukuran custom, dan tautkan jejaring media sosial langsung secara instan.
        </p>
      </div>

      {/* Grid Canvas Wrapper */}
      <div className="w-full max-w-md bg-[#0c121d]/70 border border-white/5 rounded-3xl p-3 shadow-2xl backdrop-blur-md relative">
        <div className="grid grid-cols-5 gap-2 auto-rows-[64px] relative">
          
          {/* KOTAK SLOT PERTAMA (Bisa Kosong / Berisi Banner) */}
          {isOccupied ? (
            <div
              style={{
                gridColumn: `span ${colSpan}`,
                gridRow: `span ${rowSpan}`,
              }}
              className="relative rounded-2xl p-1.5 flex flex-col justify-between overflow-visible transition-all duration-300 border border-emerald-500/40 bg-gradient-to-br from-[#121c2b] to-[#0a111a] shadow-[0_4px_24px_rgba(0,0,0,0.5)] group"
            >
              {/* Tag Ukuran Grid */}
              <span className="absolute top-2 left-2 z-20 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-mono text-emerald-400">
                {colSpan}x{rowSpan}
              </span>

              {/* Tombol Edit Isi Modal */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="absolute top-2 right-2 z-20 w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 flex items-center justify-center text-gray-200 text-xs border border-white/10 transition-transform duration-200"
              >
                ✎
              </button>

              {/* Media Image Banner */}
              <div className="w-full flex-1 rounded-xl overflow-hidden bg-black/40 relative flex items-center justify-center">
                {bannerData.image ? (
                  <img
                    src={bannerData.image}
                    alt="Banner Media"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-500 gap-1 p-2">
                    <span className="text-xs">Preview Media</span>
                  </div>
                )}
              </div>

              {/* Bagian Bawah Banner: Nama (Center) + Plugin Musik + Icon Medsos */}
              <div className="w-full flex flex-col items-center justify-center pt-1.5 pb-0.5 px-1">
                
                {/* Nama Banner di Tengah */}
                {isMotionSuper ? (
                  <span className="text-center font-extrabold text-[12px] tracking-wide bg-gradient-to-r from-emerald-400 via-violet-300 via-pink-400 to-emerald-400 bg-[length:250%_auto] animate-[shimmer_3s_linear_infinite] bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(167,139,250,0.4)] truncate max-w-full">
                    {bannerData.name}
                  </span>
                ) : (
                  <span className="text-center font-bold text-[12px] text-gray-200 tracking-wide truncate max-w-full">
                    {bannerData.name}
                  </span>
                )}

                {/* Plugin Musik Mini (Bawah Nama & Di Atas Medsos) */}
                <div 
                  onClick={() => setBannerData(prev => ({ ...prev, isPlayingMusic: !prev.isPlayingMusic }))}
                  className="mt-1 px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/10 flex items-center gap-1.5 cursor-pointer hover:bg-white/[0.08] active:scale-95 transition-all"
                >
                  <span className={`w-2 h-2 rounded-full ${bannerData.isPlayingMusic ? 'bg-emerald-400 animate-ping' : 'bg-gray-500'}`} />
                  <span className="text-[10px] text-gray-300 truncate max-w-[120px]">
                    🎵 {bannerData.musicTitle}
                  </span>
                </div>

                {/* Deretan Icon Medsos di Bawah Nama */}
                {bannerData.socials && bannerData.socials.length > 0 && (
                  <div className="flex items-center justify-center gap-2 mt-1.5 flex-wrap">
                    {bannerData.socials.map((social, idx) => (
                      <a
                        key={idx}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative p-0.5 flex items-center justify-center group/icon"
                      >
                        {isMotionSuper && (
                          <span className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-500 via-violet-500 to-pink-500 blur-[2px] opacity-75 animate-[spin_4s_linear_infinite]" />
                        )}
                        <img
                          src={social.icon}
                          alt={social.name}
                          className="w-4 h-4 rounded-full relative z-10 object-cover bg-black/60 p-[1px] hover:scale-125 transition-transform"
                        />
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* HANDLE RESIZE GAYA CORNER GESTURE IOS */}
              <div
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="absolute -bottom-1.5 -right-1.5 w-8 h-8 flex items-center justify-center cursor-nwse-resize z-30 select-none touch-none active:scale-125 transition-transform"
                title="Tarik untuk ubah ukuran"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="rotate-[-10deg] drop-shadow-[0_0_6px_rgba(255,255,255,0.85)]">
                  <path
                    d="M19 7C19 13.6274 13.6274 19 7 19"
                    stroke="#ffffff"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          ) : (
            /* Slot #1 Saat Masih Kosong */
            <div
              onClick={() => setIsModalOpen(true)}
              className="rounded-2xl border-2 border-dashed border-emerald-500/30 bg-[#0f1622]/70 hover:bg-[#152030]/80 hover:border-emerald-400/60 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group active:scale-95"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-emerald-400 group-hover:scale-110 transition-transform">
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span className="text-[10px] text-emerald-400/80 font-mono mt-1 font-semibold">#1 Buka</span>
            </div>
          )}

          {/* Sisa Grid Slots Kosong (#2 s/d #35) dengan Icon Melengkung */}
          {Array.from({ length: 34 }).map((_, i) => (
            <div
              key={i}
              onClick={() => setIsModalOpen(true)}
              className="rounded-2xl border border-white/[0.04] bg-[#0f1622]/50 hover:bg-[#152030]/60 hover:border-emerald-500/20 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group active:scale-95"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="text-gray-600 group-hover:text-emerald-400 transition-colors">
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span className="text-[9px] text-gray-600 group-hover:text-gray-400 font-mono mt-0.5">#{i + 2}</span>
            </div>
          ))}

        </div>
      </div>

      {/* DRAWER MENU HAMBURGER (Smooth Slide-In + iOS Glass) */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop Blur */}
          <div 
            onClick={() => setIsMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
          />

          {/* Sidebar Box */}
          <div className="relative w-72 max-w-[80vw] h-full bg-[#0c121e]/90 backdrop-blur-2xl border-r border-white/10 p-5 flex flex-col justify-between shadow-2xl z-10 animate-[slideRight_0.3s_cubic-bezier(0.16,1,0.3,1)]">
            <div className="flex flex-col gap-6">
              
              {/* Menu Title & Close */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="font-bold text-sm tracking-wide text-gray-200">Menu Utama</span>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition"
                >
                  ✕
                </button>
              </div>

              {/* Navigation Items (Melengkung & Halus) */}
              <nav className="flex flex-col gap-2">
                
                {/* 1. Slots (+) */}
                <button
                  onClick={() => { setActiveTab('slots'); setIsMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all duration-300 ${
                    activeTab === 'slots' 
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
                      : 'text-gray-300 hover:bg-white/5 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </div>
                  <span>Slots (+)</span>
                </button>

                {/* 2. Langganan Motion (Custom Badge / Crown Melengkung) */}
                <button
                  onClick={() => { setActiveTab('subscription'); setIsMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all duration-300 ${
                    activeTab === 'subscription' 
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' 
                      : 'text-gray-300 hover:bg-white/5 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="w-7 h-7 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 17h14l1-10-4.5 3.5L12 4 8.5 10.5 4 7z" />
                    </svg>
                  </div>
                  <span>Langganan Motion</span>
                </button>

                {/* 3. Plugin (Musik & Ekstensi) */}
                <button
                  onClick={() => { setActiveTab('plugin'); setIsMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all duration-300 ${
                    activeTab === 'plugin' 
                      ? 'bg-violet-500/15 text-violet-300 border border-violet-500/30' 
                      : 'text-gray-300 hover:bg-white/5 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="w-7 h-7 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-400">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                      <path d="M9 18V5l12-2v13" />
                      <circle cx="6" cy="18" r="3" />
                      <circle cx="18" cy="16" r="3" />
                    </svg>
                  </div>
                  <span>Plugin</span>
                </button>

                {/* 4. Saya (Profile) */}
                <button
                  onClick={() => { setActiveTab('profile'); setIsMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all duration-300 ${
                    activeTab === 'profile' 
                      ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30' 
                      : 'text-gray-300 hover:bg-white/5 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="w-7 h-7 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                      <circle cx="12" cy="7" r="4" />
                      <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
                    </svg>
                  </div>
                  <span>Saya</span>
                </button>

              </nav>
            </div>

            {/* Profile Footer */}
            <div className="pt-4 border-t border-white/10 flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-500 to-violet-600 p-[1px]">
                <div className="w-full h-full bg-[#0a0f16] rounded-2xl flex items-center justify-center text-xs font-bold text-white">
                  A
                </div>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-gray-200">amotionwebsite</span>
                <span className="text-[10px] text-gray-400 font-mono">Community Dev</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FORM SEWA / UPLOAD BANNER (Input Langsung Bersih Tanpa Hapus Tulisan) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm rounded-[32px] bg-[#111722]/90 backdrop-blur-2xl border border-white/10 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex flex-col gap-4 text-left relative transition-all duration-300">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold text-sm">+ Sewa / Ubah Slot</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold border border-emerald-500/20">
                  Rp 1.000
                </span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-emerald-500 text-black flex items-center justify-center font-bold text-sm hover:scale-105 active:scale-95 transition"
              >
                ✕
              </button>
            </div>

            {/* Input Nama Brand (User Langsung Ngetik Tanpa Perlu Hapus Teks) */}
            <div>
              <label className="text-xs text-gray-400 font-medium block mb-1.5">Nama Merek / Produk</label>
              <input
                type="text"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                placeholder="Contoh: Anak Programmer Indonesia"
                className="w-full bg-[#0a0f16]/90 border border-white/10 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-all duration-300"
              />
            </div>

            {/* Upload Media Banner */}
            <div>
              <label className="text-xs text-gray-400 font-medium block mb-1.5">Unggah Media (Gambar / Video)</label>
              <label className="w-full border-2 border-dashed border-white/10 hover:border-emerald-500/40 rounded-2xl py-3 px-2 flex flex-col items-center justify-center cursor-pointer bg-[#0a0f16]/60 transition-all duration-300">
                <input type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" />
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-emerald-400 mb-1">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span className="text-xs text-gray-300 font-medium">Pilih Gambar atau Video</span>
              </label>
            </div>

            {/* Custom Icon & Link Medsos */}
            <div>
              <label className="text-xs text-gray-400 font-medium block mb-1.5">Tambah Icon Medsos Kustom & Link</label>
              <div className="flex items-center gap-2">
                <label className="cursor-pointer w-10 h-10 rounded-2xl bg-[#0a0f16]/90 border border-white/10 flex items-center justify-center hover:border-emerald-500/40 transition shrink-0">
                  <input type="file" accept="image/*" onChange={handleCustomIconUpload} className="hidden" />
                  {customIcon ? (
                    <img src={customIcon} alt="Icon" className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <span className="text-[10px] text-gray-400 font-semibold">+Icon</span>
                  )}
                </label>
                <input
                  type="url"
                  value={customIconUrl}
                  onChange={(e) => setCustomIconUrl(e.target.value)}
                  placeholder="https://tiktok.com/@akun / ig"
                  className="flex-1 bg-[#0a0f16]/90 border border-white/10 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-all duration-300"
                />
              </div>
            </div>

            {/* Link Tujuan Default (Placeholder https://linktujuankamu) */}
            <div>
              <label className="text-xs text-gray-400 font-medium block mb-1.5">Link Tujuan Default (Opsional)</label>
              <input
                type="url"
                value={inputLink}
                onChange={(e) => setInputLink(e.target.value)}
                placeholder="https://linktujuankamu"
                className="w-full bg-[#0a0f16]/90 border border-white/10 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-all duration-300"
              />
            </div>

            {/* Tombol Simpan */}
            <button
              onClick={handleSaveModal}
              className="w-full mt-2 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs tracking-wide shadow-[0_4px_16px_rgba(16,185,129,0.3)] transition-all duration-300 active:scale-95"
            >
              Simpan & Pasang Banner
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
