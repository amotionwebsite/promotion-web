import React, { useState, useRef, useEffect } from 'react';

export default function App() {
  // State Langganan Aktif: 'Basic' | 'Pro' | 'Super'
  const [currentTier, setCurrentTier] = useState('Super');
  const [tierExpiry, setTierExpiry] = useState('30 Des 2026');

  // State Drawer Menu Samping & Tab Aktif
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('slots'); // 'slots' | 'subscription' | 'plugin' | 'profile'

  // State Grid Slot
  const [colSpan, setColSpan] = useState(2);
  const [rowSpan, setRowSpan] = useState(2);
  const [selectedRatio, setSelectedRatio] = useState('1:1');

  // State Profil Pengguna
  const [userProfile, setUserProfile] = useState({
    name: 'Anak Programmer Indonesia',
    avatar: null,
    bio: 'Komunitas Developer Mobile & Full-Stack',
  });

  // State Slot & Data Banner
  const [isOccupied, setIsOccupied] = useState(false);
  const [bannerClicks, setBannerClicks] = useState(142);
  const [bannerHistory, setBannerHistory] = useState([]);

  // State Audio Player & Playlist Musik Pribadi
  const [userMusicList, setUserMusicList] = useState([
    { title: 'Lofi Chill - API Beats', src: null },
  ]);
  const [activeMusic, setActiveMusic] = useState('Lofi Chill - API Beats');
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const audioRef = useRef(null);

  // State Data Banner
  const [bannerData, setBannerData] = useState({
    name: 'Anak Programmer Indonesia',
    image: null,
    link: '',
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

  // State Modal Form & Upload
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputName, setInputName] = useState('');
  const [inputImage, setInputImage] = useState(null);
  const [inputLink, setInputLink] = useState('');
  const [customIcon, setCustomIcon] = useState(null);
  const [customIconUrl, setCustomIconUrl] = useState('');

  // UI Feedback, Upload & Payment
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isProcessingPay, setIsProcessingPay] = useState(false);

  // Drag Tracking
  const dragStartRef = useRef(null);

  // Load Data dari LocalStorage
  useEffect(() => {
    const savedSlot = localStorage.getItem('promotion_slot_data');
    if (savedSlot) {
      try {
        const parsed = JSON.parse(savedSlot);
        if (parsed.bannerData) setBannerData(parsed.bannerData);
        if (parsed.colSpan) setColSpan(parsed.colSpan);
        if (parsed.rowSpan) setRowSpan(parsed.rowSpan);
        if (parsed.isOccupied !== undefined) setIsOccupied(parsed.isOccupied);
        if (parsed.userProfile) setUserProfile(parsed.userProfile);
        if (parsed.bannerClicks) setBannerClicks(parsed.bannerClicks);
        if (parsed.bannerHistory) setBannerHistory(parsed.bannerHistory);
        if (parsed.currentTier) setCurrentTier(parsed.currentTier);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Simpan data ke LocalStorage
  const persistAll = (updates = {}) => {
    const payload = {
      bannerData: updates.bannerData || bannerData,
      colSpan: updates.colSpan || colSpan,
      rowSpan: updates.rowSpan || rowSpan,
      isOccupied: updates.isOccupied !== undefined ? updates.isOccupied : isOccupied,
      userProfile: updates.userProfile || userProfile,
      bannerClicks: updates.bannerClicks !== undefined ? updates.bannerClicks : bannerClicks,
      bannerHistory: updates.bannerHistory || bannerHistory,
      currentTier: updates.currentTier || currentTier,
    };
    localStorage.setItem('promotion_slot_data', JSON.stringify(payload));
  };

  const totalSlotsUsed = colSpan * rowSpan;
  const totalPrice = totalSlotsUsed * 1000;

  // Track Klik Banner
  const handleBannerClick = () => {
    const nextClicks = bannerClicks + 1;
    setBannerClicks(nextClicks);
    persistAll({ bannerClicks: nextClicks });
    if (bannerData.link) {
      window.open(bannerData.link, '_blank');
    }
  };

  // Handle Resize Corner Gesture
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

    const addCols = Math.round(diffX / 42);
    const addRows = Math.round(diffY / 42);

    const nextCols = Math.min(Math.max(dragStartRef.current.initialCols + addCols, 1), 5);
    const nextRows = Math.min(Math.max(dragStartRef.current.initialRows + addRows, 1), 6);

    setColSpan(nextCols);
    setRowSpan(nextRows);
  };

  const handleTouchEnd = () => {
    dragStartRef.current = null;
    persistAll({ colSpan, rowSpan });
  };

  // Preset Aspek Rasio
  const applyAspectRatio = (ratio) => {
    setSelectedRatio(ratio);
    let c = 2, r = 2;
    if (ratio === '1:1') { c = 2; r = 2; }
    else if (ratio === '9:16') { c = 2; r = 4; }
    else if (ratio === '16:9') { c = 4; r = 2; }
    else if (ratio === '4:5') { c = 2; r = 3; }
    setColSpan(c);
    setRowSpan(r);
  };

  // Upload Media Banner
  const handleBannerUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsUploading(true);
      setUploadProgress(20);
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval);
            return 95;
          }
          return prev + 25;
        });
      }, 100);

      setTimeout(() => {
        clearInterval(interval);
        setUploadProgress(100);
        setInputImage(URL.createObjectURL(file));
        setTimeout(() => setIsUploading(false), 300);
      }, 600);
    }
  };

  // Upload Avatar Pengguna
  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const nextProfile = { ...userProfile, avatar: url };
      setUserProfile(nextProfile);
      persistAll({ userProfile: nextProfile });
    }
  };

  // Upload File Musik Sendiri
  const handleMusicUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const audioUrl = URL.createObjectURL(file);
      const newTrack = {
        title: file.name.replace(/\.[^/.]+$/, ''),
        src: audioUrl,
      };
      const updatedList = [newTrack, ...userMusicList];
      setUserMusicList(updatedList);
      setActiveMusic(newTrack.title);
      setIsPlayingMusic(true);
    }
  };

  // Upload Icon Medsos
  const handleCustomIconUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCustomIcon(URL.createObjectURL(file));
    }
  };

  // Konfirmasi Pembayaran dan Simpan Slot
  const handleConfirmPayment = () => {
    setIsProcessingPay(true);
    setTimeout(() => {
      let updatedSocials = [...bannerData.socials];
      if (customIcon && customIconUrl) {
        updatedSocials.push({
          name: 'Custom',
          icon: customIcon,
          url: customIconUrl,
        });
      }

      const finalName = inputName.trim() ? inputName : userProfile.name;
      const updatedData = {
        ...bannerData,
        name: finalName,
        image: inputImage,
        link: inputLink.trim() ? inputLink : 'https://linktujuankamu',
        socials: updatedSocials,
      };

      const newHistoryItem = {
        id: Date.now(),
        name: finalName,
        image: inputImage,
        size: `${colSpan}x${rowSpan}`,
        date: new Date().toLocaleDateString('id-ID'),
      };
      const updatedHistory = [newHistoryItem, ...bannerHistory];

      setBannerData(updatedData);
      setIsOccupied(true);
      setBannerHistory(updatedHistory);
      setIsProcessingPay(false);
      setIsPaymentOpen(false);
      setIsModalOpen(false);

      persistAll({
        bannerData: updatedData,
        isOccupied: true,
        bannerHistory: updatedHistory,
      });
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#070b12] text-white flex flex-col items-center p-4 md:p-8 select-none font-sans relative overflow-x-hidden">
      
      {/* Header Bar Tanpa Logo */}
      <header className="w-full max-w-md md:max-w-3xl lg:max-w-5xl flex items-center justify-between py-3 px-2 border-b border-white/5 relative z-30">
        <button 
          onClick={() => setIsMenuOpen(true)}
          className="w-10 h-10 rounded-2xl bg-[#0e1622]/80 backdrop-blur-xl border border-white/10 flex items-center justify-center text-gray-300 hover:text-white hover:border-emerald-500/40 active:scale-90 transition-all duration-300 shadow-lg"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          {/* Badge Switcher Langganan */}
          <button
            onClick={() => { setActiveTab('subscription'); setIsMenuOpen(true); }}
            className={`px-3 py-1.5 text-[11px] font-bold rounded-full transition-all duration-300 border backdrop-blur-md active:scale-95 ${
              currentTier === 'Super'
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                : currentTier === 'Pro'
                ? 'bg-violet-500/15 border-violet-500/40 text-violet-300 shadow-[0_0_15px_rgba(139,92,246,0.25)]'
                : 'bg-white/10 border-white/20 text-gray-200'
            }`}
          >
            MOTION {currentTier.toUpperCase()}
          </button>
          <span className="px-3 py-1.5 text-[11px] font-semibold rounded-full bg-emerald-500/10 backdrop-blur-md border border-emerald-500/30 text-emerald-400">
            Slot {isOccupied ? totalSlotsUsed : '0'}/100
          </span>
        </div>
      </header>

      {/* Hero Description */}
      <div className="w-full max-w-md md:max-w-2xl text-center my-6 px-2">
        <div className="inline-block px-3 py-1 rounded-full bg-emerald-950/40 backdrop-blur-md border border-emerald-500/30 text-emerald-400 text-xs font-medium mb-2 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
          Promosikan Produk, Jasa, Website, dll anda di sini
        </div>
        <p className="text-gray-400 text-xs md:text-sm leading-relaxed">
          Papan iklan piksel digital komunitas. Pasang banner usahamu, tentukan ukuran custom, dan tautkan jejaring media sosial langsung secara instan.
        </p>
      </div>

      {/* Grid Canvas Wrapper Melebar di Desktop */}
      <div className="w-full max-w-md md:max-w-3xl lg:max-w-5xl bg-[#0c121d]/75 border border-white/5 rounded-3xl p-3 md:p-5 shadow-2xl backdrop-blur-2xl relative">
        <div className="grid grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-2 md:gap-3 auto-rows-[64px] md:auto-rows-[76px] relative">
          
          {/* BANNER UTAMA */}
          {isOccupied ? (
            <div
              style={{
                gridColumn: `span ${colSpan}`,
                gridRow: `span ${rowSpan}`,
              }}
              className={`relative rounded-2xl p-1.5 flex flex-col justify-between overflow-visible transition-all duration-300 border backdrop-blur-xl group ${
                currentTier === 'Super'
                  ? 'border-amber-500/50 bg-gradient-to-br from-[#1b1712]/90 to-[#0e1117]/80 shadow-[0_4px_28px_rgba(245,158,11,0.2)]'
                  : currentTier === 'Pro'
                  ? 'border-violet-500/50 bg-gradient-to-br from-[#161226]/90 to-[#0d121d]/80 shadow-[0_4px_28px_rgba(139,92,246,0.2)]'
                  : 'border-emerald-500/40 bg-gradient-to-br from-[#121c2b]/90 to-[#0a111a]/80 shadow-[0_4px_24px_rgba(0,0,0,0.5)]'
              }`}
            >
              {/* Badge Indikator Grid */}
              <span className="absolute top-2 left-2 z-20 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-mono text-emerald-400">
                {colSpan}x{rowSpan} ({totalSlotsUsed} Slot)
              </span>

              {/* Tombol Edit */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="absolute top-2 right-2 z-20 w-6 h-6 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 active:scale-90 flex items-center justify-center text-gray-200 text-xs border border-white/10 transition-transform"
              >
                ✎
              </button>

              {/* Media Image Banner */}
              <div 
                onClick={handleBannerClick}
                className="w-full flex-1 rounded-xl overflow-hidden bg-black/40 relative flex items-center justify-center cursor-pointer active:opacity-90 transition-opacity"
              >
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

              {/* Bagian Bawah Banner: Profil (Logo + Nama) + Plugin Musik Pribadi + Medsos */}
              <div className="w-full flex flex-col items-center justify-center pt-1.5 pb-0.5 px-1">
                
                {/* 1. Profil di Bawah Banner: (Logo) Nama Merek */}
                <div className="flex items-center justify-center gap-1.5 max-w-full">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-emerald-500 to-violet-500 p-[1px] shrink-0">
                    {userProfile.avatar ? (
                      <img src={userProfile.avatar} alt="Logo" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <div className="w-full h-full bg-black rounded-full flex items-center justify-center text-[8px] font-bold text-white">
                        {userProfile.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  {currentTier === 'Super' ? (
                    <span className="text-center font-extrabold text-[12px] md:text-sm tracking-wide bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-[length:250%_auto] animate-[shimmer_3s_linear_infinite] bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(245,158,11,0.5)] truncate">
                      {bannerData.name}
                    </span>
                  ) : currentTier === 'Pro' ? (
                    <span className="text-center font-extrabold text-[12px] md:text-sm tracking-wide bg-gradient-to-r from-violet-400 via-blue-300 to-violet-400 bg-[length:250%_auto] animate-[shimmer_3s_linear_infinite] bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(139,92,246,0.4)] truncate">
                      {bannerData.name}
                    </span>
                  ) : (
                    <span className="text-center font-bold text-[12px] md:text-sm text-gray-200 tracking-wide truncate">
                      {bannerData.name}
                    </span>
                  )}
                </div>

                {/* 5. Plugin Musik Pribadi (Clean Icon Manual - No AI) */}
                <div 
                  onClick={() => setIsPlayingMusic(!isPlayingMusic)}
                  className="mt-1 px-2.5 py-0.5 rounded-full bg-white/[0.05] backdrop-blur-md border border-white/10 flex items-center gap-1.5 cursor-pointer hover:bg-white/[0.09] active:scale-95 transition-all"
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-emerald-400">
                    <path d="M9 18V5l12-2v13" />
                    <circle cx="6" cy="18" r="3" />
                    <circle cx="18" cy="16" r="3" />
                  </svg>
                  <div className="flex items-end gap-[2px] h-2">
                    <span className={`w-[2px] bg-emerald-400 rounded-full transition-all duration-200 ${isPlayingMusic ? 'h-2 animate-pulse' : 'h-1'}`} />
                    <span className={`w-[2px] bg-emerald-400 rounded-full transition-all duration-300 ${isPlayingMusic ? 'h-2.5 animate-ping' : 'h-1.5'}`} />
                    <span className={`w-[2px] bg-emerald-400 rounded-full transition-all duration-200 ${isPlayingMusic ? 'h-2 animate-pulse' : 'h-1'}`} />
                  </div>
                  <span className="text-[10px] text-gray-300 truncate max-w-[110px]">
                    {activeMusic}
                  </span>
                </div>

                {/* Deretan Icon Medsos */}
                {bannerData.socials && bannerData.socials.length > 0 && (
                  <div className="flex items-center justify-center gap-2 mt-1.5 flex-wrap">
                    {bannerData.socials.map((social, idx) => (
                      <a
                        key={idx}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative p-0.5 flex items-center justify-center group/icon active:scale-90 transition-transform"
                      >
                        {currentTier !== 'Basic' && (
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

              {/* HANDLE RESIZE SUDUT MELENGKUNG IOS */}
              <div
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="absolute -bottom-1.5 -right-1.5 w-8 h-8 flex items-center justify-center cursor-nwse-resize z-30 select-none touch-none active:scale-125 transition-transform"
                title="Tarik untuk sesuaikan slot"
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
            /* Slot #1 Kosong */
            <div
              onClick={() => setIsModalOpen(true)}
              className="rounded-2xl border-2 border-dashed border-emerald-500/30 bg-[#0f1622]/70 backdrop-blur-md hover:bg-[#152030]/80 hover:border-emerald-400/60 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group active:scale-95"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-emerald-400 group-hover:scale-110 transition-transform">
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span className="text-[10px] text-emerald-400/80 font-mono mt-1 font-semibold">#1 Buka</span>
            </div>
          )}

          {/* Sisa Grid Slots Kosong (Total pas 100 Slot) */}
          {Array.from({ length: Math.max(0, 100 - (isOccupied ? totalSlotsUsed : 1)) }).map((_, i) => {
            const slotNumber = (isOccupied ? totalSlotsUsed : 1) + i + 1;
            return (
              <div
                key={slotNumber}
                onClick={() => setIsModalOpen(true)}
                className="rounded-2xl border border-white/[0.04] bg-[#0f1622]/50 backdrop-blur-sm hover:bg-[#152030]/60 hover:border-emerald-500/20 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group active:scale-95"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="text-gray-600 group-hover:text-emerald-400 transition-colors">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                <span className="text-[9px] text-gray-600 group-hover:text-gray-400 font-mono mt-0.5">#{slotNumber}</span>
              </div>
            );
          })}

        </div>
      </div>

      {/* DRAWER MENU HAMBURGER (Full Glassmorphism) */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div 
            onClick={() => setIsMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
          />

          <div className="relative w-84 max-w-[85vw] h-full bg-[#0a0f18]/85 backdrop-blur-2xl border-r border-white/10 p-5 flex flex-col justify-between shadow-2xl z-10 animate-[slideRight_0.3s_cubic-bezier(0.16,1,0.3,1)]">
            <div className="flex flex-col gap-4 overflow-y-auto pr-1">
              
              {/* Header Panel */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="font-bold text-sm tracking-wide text-gray-200">Panel Kontrol</span>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/5 backdrop-blur-md hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition active:scale-90"
                >
                  ✕
                </button>
              </div>

              {/* Tab Navigasi */}
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#05080f]/80 backdrop-blur-lg rounded-2xl border border-white/5">
                {['slots', 'subscription', 'plugin', 'profile'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-2 px-3 rounded-xl text-[11px] font-semibold capitalize transition-all duration-300 active:scale-95 ${
                      activeTab === tab 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {tab === 'slots' ? 'Slots' : tab === 'subscription' ? 'Langganan' : tab === 'plugin' ? 'Plugin' : 'Saya'}
                  </button>
                ))}
              </div>

              {/* 1. TAB SLOTS */}
              {activeTab === 'slots' && (
                <div className="flex flex-col gap-3 text-left">
                  <div className="p-4 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 flex flex-col gap-1.5 shadow-lg">
                    <span className="text-xs font-bold text-gray-200">Status Slot Aktif</span>
                    <span className="text-[11px] text-gray-400">Dimensi Grid: {colSpan} Kolom x {rowSpan} Baris</span>
                    <span className="text-[11px] text-emerald-400 font-semibold">Kapasitas Digunakan: {totalSlotsUsed} Slot</span>
                  </div>
                  <button
                    onClick={() => { setIsMenuOpen(false); setIsModalOpen(true); }}
                    className="w-full py-2.5 rounded-2xl bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 text-emerald-300 text-xs font-bold hover:bg-emerald-500/30 active:scale-95 transition"
                  >
                    + Sewa / Atur Banner
                  </button>
                </div>
              )}

              {/* 2. TAB LANGGANAN (3 Tier Klasik + Glassmorphism) */}
              {activeTab === 'subscription' && (
                <div className="flex flex-col gap-3 text-left">
                  
                  {/* Motion Basic: Abu-abu Gradasi Putih + Glassmorphism */}
                  <div 
                    onClick={() => { setCurrentTier('Basic'); persistAll({ currentTier: 'Basic' }); }}
                    className={`p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer backdrop-blur-xl bg-gradient-to-br from-slate-400/15 via-white/[0.07] to-transparent ${
                      currentTier === 'Basic' ? 'border-white/50 shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-200">1. Motion Basic</span>
                      <span className="px-2 py-0.5 rounded-full bg-white/10 text-gray-300 text-[10px] font-semibold">Gratis</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">Banner statis standar, border minimalis, dan tautan sosial media.</p>
                  </div>

                  {/* Motion Pro: Ungu Gradasi Biru + Glassmorphism */}
                  <div 
                    onClick={() => { setCurrentTier('Pro'); persistAll({ currentTier: 'Pro' }); }}
                    className={`p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer backdrop-blur-xl bg-gradient-to-br from-violet-600/25 via-blue-600/15 to-transparent ${
                      currentTier === 'Pro' ? 'border-violet-400/60 shadow-[0_0_18px_rgba(139,92,246,0.25)]' : 'border-white/10 hover:border-violet-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-violet-300">2. Motion Pro</span>
                      <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 text-[10px] font-bold">PRO</span>
                    </div>
                    <p className="text-[10px] text-gray-300 mt-1">Animasi glow neon halus, visualizer audio, dan dukungan prioritas grid.</p>
                  </div>

                  {/* Motion Super / Pro Gold: Emas Gradasi Amber + Glassmorphism */}
                  <div 
                    onClick={() => { setCurrentTier('Super'); persistAll({ currentTier: 'Super' }); }}
                    className={`p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer backdrop-blur-xl bg-gradient-to-br from-amber-400/25 via-yellow-600/15 to-transparent ${
                      currentTier === 'Super' ? 'border-amber-400/60 shadow-[0_0_20px_rgba(245,158,11,0.3)]' : 'border-white/10 hover:border-amber-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300">3. Motion Super</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold">VIP GOLD</span>
                    </div>
                    <p className="text-[10px] text-amber-200/80 mt-1">Shimmer gradasi emas bergerak, animasi spin icon medsos, dan analitik klik instan.</p>
                  </div>

                </div>
              )}

              {/* 3. TAB PLUGIN (Upload & Putar Musik Pribadi) */}
              {activeTab === 'plugin' && (
                <div className="flex flex-col gap-3 text-left">
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 flex flex-col gap-2.5">
                    <span className="text-xs font-bold text-gray-200">Upload Musik Pribadi</span>
                    
                    {/* Tombol Upload Musik File Lokal */}
                    <label className="w-full py-2.5 px-3 rounded-xl border border-dashed border-emerald-500/40 bg-emerald-500/10 flex items-center justify-center gap-2 cursor-pointer hover:bg-emerald-500/15 transition active:scale-95">
                      <input type="file" accept="audio/*" onChange={handleMusicUpload} className="hidden" />
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-emerald-400">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                      <span className="text-[11px] font-semibold text-emerald-300">Pilih File Musik (.mp3)</span>
                    </label>

                    {/* Playlist Musik Saya */}
                    <span className="text-[10px] text-gray-400 font-medium mt-1">Playlist Musik Tersimpan:</span>
                    <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto pr-1">
                      {userMusicList.map((track, i) => (
                        <div 
                          key={i}
                          onClick={() => { setActiveMusic(track.title); setIsPlayingMusic(true); }}
                          className={`flex items-center justify-between p-2 rounded-xl text-[11px] cursor-pointer transition ${
                            activeMusic === track.title 
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                              : 'bg-white/[0.02] text-gray-400 hover:text-white'
                          }`}
                        >
                          <span className="truncate max-w-[170px]">🎵 {track.title}</span>
                          <span className="text-[9px] font-mono">{activeMusic === track.title && isPlayingMusic ? 'Playing' : 'Setel'}</span>
                        </div>
                      ))}
                    </div>

                  </div>
                </div>
              )}

              {/* 4. TAB SAYA (Profile User Lengkap - Sesuai Poin 1 s/d 5) */}
              {activeTab === 'profile' && (
                <div className="flex flex-col gap-3 text-left">
                  
                  {/* 1. Pengaturan Profil (Kelihatan untuk semua user di bawah banner) */}
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 flex flex-col gap-2.5">
                    <span className="text-xs font-bold text-gray-200">1. Profil Publik</span>
                    <div className="flex items-center gap-3">
                      <label className="relative cursor-pointer group">
                        <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-violet-600 p-[1.5px] overflow-hidden">
                          {userProfile.avatar ? (
                            <img src={userProfile.avatar} alt="Avatar" className="w-full h-full object-cover rounded-2xl" />
                          ) : (
                            <div className="w-full h-full bg-[#0a0f16] rounded-2xl flex items-center justify-center font-bold text-white text-xs">
                              {userProfile.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-black text-[9px] font-bold flex items-center justify-center">✎</span>
                      </label>
                      <div className="flex-1">
                        <input 
                          type="text"
                          value={userProfile.name}
                          onChange={(e) => {
                            const next = { ...userProfile, name: e.target.value };
                            setUserProfile(next);
                            setBannerData(prev => ({ ...prev, name: e.target.value }));
                            persistAll({ userProfile: next });
                          }}
                          className="w-full bg-[#070b12] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                          placeholder="Nama Merek..."
                        />
                        <span className="text-[9px] text-gray-400 mt-1 block">Tampil di bawah banner</span>
                      </div>
                    </div>
                  </div>

                  {/* 2. Banner yang Telah Diupload & Ukurannya */}
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 flex flex-col gap-2">
                    <span className="text-xs font-bold text-gray-200">2. Riwayat Banner & Size</span>
                    {bannerHistory.length > 0 ? (
                      <div className="flex flex-col gap-1.5 max-h-28 overflow-y-auto pr-1">
                        {bannerHistory.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/5 text-[10px]">
                            <div className="flex items-center gap-2 truncate max-w-[130px]">
                              {item.image && <img src={item.image} alt="prev" className="w-5 h-5 rounded-md object-cover" />}
                              <span className="text-gray-300 truncate">{item.name}</span>
                            </div>
                            <span className="font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">{item.size} Grid</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[10px] text-gray-500 italic">Belum ada riwayat banner.</span>
                    )}
                  </div>

                  {/* 3. Status Langganan & Waktu Berakhir */}
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 flex flex-col gap-1.5">
                    <span className="text-xs font-bold text-gray-200">3. Langganan Aktif</span>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-gray-400">Paket:</span>
                      <span className="font-bold text-amber-300">Motion {currentTier}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-gray-400">Berakhir Pada:</span>
                      <span className="font-mono text-emerald-400">{tierExpiry}</span>
                    </div>
                  </div>

                          {/* 4. Analisis Klik Banner */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col gap-2">
              <span className="text-xs font-bold text-gray-200">Analisis Performa</span>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-xl bg-black/40 border border-white/5 flex flex-col">
                  <span className="text-[9px] text-gray-400">Total Klik</span>
                  <span className="text-sm font-extrabold text-white">128</span>
                </div>
                <div className="p-2 rounded-xl bg-black/40 border border-white/5 flex flex-col">
                  <span className="text-[9px] text-gray-400">Total Dilihat</span>
                  <span className="text-sm font-extrabold text-emerald-400">1.4K</span>
                </div>
              </div>
            </div>

            {/* Tombol Reset Slot */}
            <button 
              onClick={() => {
                localStorage.removeItem('promotion_slot_data');
                setIsOccupied(false);
                setIsMenuOpen(false);
              }}
              className="w-full py-2.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold hover:bg-rose-500/20 active:scale-95 transition"
            >
              Reset Slot Tersimpan
            </button>
          </div>
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

  {/* MODAL FORM SEWA */}
  {isModalOpen && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-sm rounded-[32px] bg-[#111722]/90 backdrop-blur-2xl border border-white/10 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex flex-col gap-3.5 text-left relative transition-all duration-300 max-h-[90vh] overflow-y-auto">
        
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold text-sm">+ Sewa / Ubah Slot</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold border border-emerald-500/20">
              Rp {totalPrice.toLocaleString('id-ID')}
            </span>
          </div>
          <button
            onClick={() => setIsModalOpen(false)}
            className="w-7 h-7 rounded-full bg-emerald-500 text-black flex items-center justify-center font-bold text-sm hover:scale-105 active:scale-95 transition"
          >
            ✕
          </button>
        </div>

        <div>
          <label className="text-xs text-gray-400 font-medium block mb-1">Nama Merek / Produk</label>
          <input
            type="text"
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            placeholder="Contoh: Anak Programmer Indonesia"
            className="w-full bg-[#0a0f16]/90 border border-white/10 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-all duration-300"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-gray-400 font-medium">Aspek Rasio Slot</label>
            <span className="text-[10px] text-emerald-400 font-mono">Memakan {totalSlotsUsed} Slot</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {['1:1', '9:16', '16:9', '4:5'].map((ratio) => (
              <button
                key={ratio}
                type="button"
                onClick={() => applyAspectRatio(ratio)}
                className={`py-2 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-95 ${
                  selectedRatio === ratio
                    ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 shadow-sm'
                    : 'bg-[#0a0f16]/80 border border-white/5 text-gray-400 hover:text-white'
                }`}
              >
                {ratio}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-400 font-medium block mb-1">Unggah Media (Gambar / Video)</label>
          <label className="w-full border-2 border-dashed border-white/10 hover:border-emerald-500/40 rounded-2xl py-3 px-2 flex flex-col items-center justify-center cursor-pointer bg-[#0a0f16]/60 transition-all duration-300 relative overflow-hidden">
            <input type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" />
            {isUploading ? (
              <div className="w-full flex flex-col items-center gap-2 py-1">
                <div className="w-3/4 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    style={{ width: `${uploadProgress}%` }} 
                    className="h-full bg-emerald-400 rounded-full transition-all duration-150"
                  />
                </div>
                <span className="text-[11px] text-emerald-400 font-mono">Mengunggah... {uploadProgress}%</span>
              </div>
            ) : (
              <>
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-emerald-400 mb-1">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span className="text-xs text-gray-300 font-medium">
                  {inputImage ? '✓ Media Terpilih (Klik Ganti)' : 'Pilih Gambar atau Video'}
                </span>
              </>
            )}
          </label>
        </div>

        <div>
          <label className="text-xs text-gray-400 font-medium block mb-1">Tambah Icon Medsos Kustom & Link</label>
          <div className="flex items-center gap-2">
            <label className="cursor-pointer w-10 h-10 rounded-2xl bg-[#0a0f16]/90 border border-white/10 flex items-center justify-center hover:border-emerald-500/40 transition shrink-0 active:scale-95">
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
              className="flex-1 bg-[#0a0f16]/90 border border-white/10 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-400 font-medium block mb-1">Link Tujuan Default (Opsional)</label>
          <input
            type="url"
            value={inputLink}
            onChange={(e) => setInputLink(e.target.value)}
            placeholder="https://linktujuankamu"
            className="w-full bg-[#0a0f16]/90 border border-white/10 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        <button
          onClick={() => setIsPaymentOpen(true)}
          className="w-full mt-2 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs tracking-wide shadow-[0_4px_16px_rgba(16,185,129,0.3)] transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
        >
          <span>Bayar Rp {totalPrice.toLocaleString('id-ID')} & Pasang</span>
        </button>
      </div>
    </div>
  )}

  {/* POPUP BAYAR QRIS */}
  {isPaymentOpen && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg animate-fadeIn">
      <div className="w-full max-w-xs rounded-[32px] bg-[#111722]/95 border border-white/10 p-5 shadow-2xl flex flex-col items-center text-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
          </svg>
        </div>

        <div className="flex flex-col">
          <span className="text-sm font-bold text-white">Konfirmasi Sewa Slot</span>
          <span className="text-xs text-gray-400 mt-1">Mengambil {totalSlotsUsed} Slot Piksel</span>
          <span className="text-lg font-extrabold text-emerald-400 mt-2">
            Rp {totalPrice.toLocaleString('id-ID')}
          </span>
        </div>

        <div className="w-36 h-36 rounded-2xl bg-white p-2 flex items-center justify-center shadow-inner">
          <img 
            src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PROMOTION-SLOT-PAYMENT" 
            alt="QRIS" 
            className="w-full h-full object-contain"
          />
        </div>

        <span className="text-[10px] text-gray-500">Scan QRIS instan atau klik konfirmasi</span>

        <div className="flex gap-2 w-full mt-1">
          <button
            onClick={() => setIsPaymentOpen(false)}
            className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold active:scale-95 transition"
          >
            Batal
          </button>
          <button
            onClick={handleConfirmPayment}
            disabled={isProcessingPay}
            className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold active:scale-95 transition shadow-lg flex items-center justify-center gap-1.5"
          >
            {isProcessingPay ? (
              <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              'Sudah Bayar'
            )}
          </button>
        </div>
      </div>
    </div>
  )}

</div>
);
}
