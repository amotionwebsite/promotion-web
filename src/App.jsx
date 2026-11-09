import React, { useState, useRef, useEffect } from 'react';

export default function App() {
  // State Langganan Aktif: Default saat ini adalah 'Basic'
  const [currentPlan, setCurrentPlan] = useState('Basic');
  const [subscriptionExpiry, setSubscriptionExpiry] = useState('12 Des 2026');

  // State Drawer & Full Navigasi
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('subscription'); // Default tab langsung ke langganan
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'

  // State Ukuran Grid Slot - DEFAULT 5x1 (Sesuai Gambar 2)
  const [colSpan, setColSpan] = useState(5);
  const [rowSpan, setRowSpan] = useState(1);
  const [selectedRatio, setSelectedRatio] = useState('5:1');

  // State User Profile
  const [userProfile, setUserProfile] = useState({
    name: 'Anak Programmer Indonesia',
    handle: '@anakprogrammer',
    avatar: 'https://cdn-icons-png.flaticon.com/512/3670/3670157.png',
  });

  // State Edit Profil Sementara & Auto Save (5 Detik)
  const [tempProfileName, setTempProfileName] = useState(userProfile.name);
  const [tempAvatar, setTempAvatar] = useState(userProfile.avatar);
  const [showSaveBtn, setShowSaveBtn] = useState(false);
  const saveTimerRef = useRef(null);

  // State Crop Foto Profil
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [rawAvatarImage, setRawAvatarImage] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotateDeg, setRotateDeg] = useState(0);

  // Modal Khusus Tambah Medsos Dinamis
  const [isAddSocialOpen, setIsAddSocialOpen] = useState(false);
  const [newSocialIcon, setNewSocialIcon] = useState(null);
  const [newSocialUrl, setNewSocialUrl] = useState('');

  // State Data Banner & Media
  const [isOccupied, setIsOccupied] = useState(true);
  const [bannerData, setBannerData] = useState({
    name: 'Anak Programmer Indonesia',
    brandFont: '',
    image: null,
    link: 'https://linktujuankamu',
    musicTitle: 'iphone-circles',
    musicFile: null,
    isPlayingMusic: false,
    musicVisualizerType: 'bars', // 'bars' | 'disc'
    clicks: 142,
    views: 1890,
    socials: [],
  });

  // State Riwayat Upload Banner
  const [uploadedBanners, setUploadedBanners] = useState([
    {
      id: 1,
      name: 'Anak Programmer Indonesia',
      size: '5x1 (5 Slot)',
      date: '09 Nov 2026',
    },
  ]);

  // Modal State Sewa / Edit Banner
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputName, setInputName] = useState('');
  const [inputImage, setInputImage] = useState(null);
  const [inputLink, setInputLink] = useState('');

  // Upload Progress & Payment Simulation
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isProcessingPay, setIsProcessingPay] = useState(false);

  // Audio & Drag Ref
  const audioRef = useRef(null);
  const dragStartRef = useRef(null);

  // Persistence Load LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('promotion_slot_data_v9');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.bannerData) {
          setBannerData(parsed.bannerData);
          if (parsed.bannerData.brandFont) {
            const style = document.createElement('style');
            style.id = 'dynamic-brand-font';
            style.innerHTML = `@font-face { font-family: 'BrandCustomFont'; src: url('${parsed.bannerData.brandFont}'); }`;
            document.head.appendChild(style);
          }
        }
        if (parsed.userProfile) {
          setUserProfile(parsed.userProfile);
          setTempProfileName(parsed.userProfile.name);
          setTempAvatar(parsed.userProfile.avatar);
        }
        if (parsed.colSpan) setColSpan(parsed.colSpan);
        if (parsed.rowSpan) setRowSpan(parsed.rowSpan);
        if (parsed.isOccupied !== undefined) setIsOccupied(parsed.isOccupied);
        if (parsed.currentPlan) setCurrentPlan(parsed.currentPlan);
        if (parsed.uploadedBanners) setUploadedBanners(parsed.uploadedBanners);
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  const persistAll = (updatedBanner, cols, rows, occupied, profile, plan, history) => {
    localStorage.setItem(
      'promotion_slot_data_v9',
      JSON.stringify({
        bannerData: updatedBanner,
        colSpan: cols,
        rowSpan: rows,
        isOccupied: occupied,
        userProfile: profile,
        currentPlan: plan,
        uploadedBanners: history,
      })
    );
  };

  const totalSlotsUsed = colSpan * rowSpan;
  const isFreeSlot = totalSlotsUsed <= 1;
  const totalPrice = isFreeSlot ? 0 : (totalSlotsUsed - 1) * 1000;
  const isMotionSuper = currentPlan === 'Super';

  const getMaxSocials = () => {
    if (currentPlan === 'Basic') return 2;
    if (currentPlan === 'Pro') return 5;
    return 999;
  };

  const triggerAutoSaveTimer = () => {
    setShowSaveBtn(true);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      setShowSaveBtn(false);
    }, 5000);
  };

  const handleSaveProfile = () => {
    const updatedProfile = {
      ...userProfile,
      name: tempProfileName.trim() ? tempProfileName : userProfile.name,
      avatar: tempAvatar,
    };
    setUserProfile(updatedProfile);
    setShowSaveBtn(false);
    persistAll(bannerData, colSpan, rowSpan, isOccupied, updatedProfile, currentPlan, uploadedBanners);
  };

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
    persistAll(bannerData, colSpan, rowSpan, isOccupied, userProfile, currentPlan, uploadedBanners);
  };

  const applyAspectRatio = (ratio) => {
    setSelectedRatio(ratio);
    if (ratio === '1:1') { setColSpan(1); setRowSpan(1); }
    else if (ratio === '5:1') { setColSpan(5); setRowSpan(1); }
    else if (ratio === '2x2') { setColSpan(2); setRowSpan(2); }
    else if (ratio === '9:16') { setColSpan(2); setRowSpan(4); }
    else if (ratio === '16:9') { setColSpan(4); setRowSpan(2); }
  };

  const handleBannerUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsUploading(true);
      setUploadProgress(15);
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval);
            return 95;
          }
          return prev + 25;
        });
      }, 120);

      setTimeout(() => {
        clearInterval(interval);
        setUploadProgress(100);
        setInputImage(URL.createObjectURL(file));
        setTimeout(() => setIsUploading(false), 300);
      }, 700);
    }
  };

  const handleAvatarFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setRawAvatarImage(URL.createObjectURL(file));
      setZoomLevel(1);
      setRotateDeg(0);
      setCropModalOpen(true);
    }
  };

  const handleConfirmCrop = () => {
    setTempAvatar(rawAvatarImage);
    setCropModalOpen(false);
    triggerAutoSaveTimer();
  };

  const handleFontUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const isFont = file.name.endsWith('.ttf') || file.name.endsWith('.otf');
      if (!isFont) {
        alert('File harus berformat .ttf atau .otf');
        return;
      }
      try {
        const fontName = 'BrandCustomFont';
        const buffer = await file.arrayBuffer();
        const fontFace = new FontFace(fontName, buffer);
        await fontFace.load();
        document.fonts.add(fontFace);

        const updatedBanner = { ...bannerData, brandFont: fontName };
        setBannerData(updatedBanner);
        triggerAutoSaveTimer();
        persistAll(updatedBanner, colSpan, rowSpan, isOccupied, userProfile, currentPlan, uploadedBanners);
      } catch (err) {
        console.error('Gagal load font:', err);
      }
    }
  };

  const handleMusicUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const isMp3 = file.name.endsWith('.mp3') || file.type.includes('audio');
      if (!isMp3) {
        alert('File harus berformat .mp3');
        return;
      }
      const audioUrl = URL.createObjectURL(file);
      const updated = {
        ...bannerData,
        musicTitle: file.name.replace(/\.[^/.]+$/, ''),
        musicFile: audioUrl,
        isPlayingMusic: false,
      };
      setBannerData(updated);
      triggerAutoSaveTimer();
      persistAll(updated, colSpan, rowSpan, isOccupied, userProfile, currentPlan, uploadedBanners);
    }
  };

  const togglePlayMusic = () => {
    if (bannerData.musicFile) {
      if (!bannerData.isPlayingMusic) {
        if (!audioRef.current) {
          audioRef.current = new Audio(bannerData.musicFile);
          audioRef.current.onended = () => {
            setBannerData((prev) => ({ ...prev, isPlayingMusic: false }));
          };
        }
        audioRef.current.play();
      } else {
        if (audioRef.current) audioRef.current.pause();
      }
    }
    setBannerData((prev) => ({ ...prev, isPlayingMusic: !prev.isPlayingMusic }));
  };

  const toggleVisualizerType = (e) => {
    e.stopPropagation();
    const nextType = bannerData.musicVisualizerType === 'bars' ? 'disc' : 'bars';
    const updated = { ...bannerData, musicVisualizerType: nextType };
    setBannerData(updated);
    persistAll(updated, colSpan, rowSpan, isOccupied, userProfile, currentPlan, uploadedBanners);
  };

  const handleAddSocial = () => {
    const maxSocials = getMaxSocials();
    if (bannerData.socials.length >= maxSocials) {
      alert(`Paket Motion ${currentPlan} dibatasi maksimal ${maxSocials} medsos!`);
      return;
    }
    if (!newSocialIcon || !newSocialUrl) {
      alert('Pilih icon medsos dan isi URL!');
      return;
    }
    const updatedSocials = [
      ...bannerData.socials,
      {
        id: Date.now(),
        icon: newSocialIcon,
        url: newSocialUrl.startsWith('http') ? newSocialUrl : `https://${newSocialUrl}`,
      },
    ];
    const updatedBanner = { ...bannerData, socials: updatedSocials };
    setBannerData(updatedBanner);
    setIsAddSocialOpen(false);
    setNewSocialIcon(null);
    setNewSocialUrl('');
    persistAll(updatedBanner, colSpan, rowSpan, isOccupied, userProfile, currentPlan, uploadedBanners);
  };

  const handleProceedRent = () => {
    if (isFreeSlot) {
      applyBannerChanges();
    } else {
      setIsPaymentOpen(true);
    }
  };

  const applyBannerChanges = () => {
    const bannerTitle = inputName.trim() ? inputName : userProfile.name;
    const updatedBanner = {
      ...bannerData,
      name: bannerTitle,
      image: inputImage || bannerData.image,
      link: inputLink.trim() ? inputLink : 'https://linktujuankamu',
    };

    const newHistoryItem = {
      id: Date.now(),
      name: bannerTitle,
      size: `${colSpan}x${rowSpan} (${totalSlotsUsed} Slot${isFreeSlot ? ' - Gratis' : ''})`,
      date: 'Hari ini',
    };
    const updatedHistory = [newHistoryItem, ...uploadedBanners];

    setBannerData(updatedBanner);
    setUploadedBanners(updatedHistory);
    setIsOccupied(true);
    setIsPaymentOpen(false);
    setIsModalOpen(false);

    persistAll(updatedBanner, colSpan, rowSpan, true, userProfile, currentPlan, updatedHistory);
  };

  const handleConfirmPayment = () => {
    setIsProcessingPay(true);
    setTimeout(() => {
      setIsProcessingPay(false);
      applyBannerChanges();
    }, 1100);
  };

  const handleBannerClick = () => {
    if (bannerData.link) {
      setBannerData((prev) => {
        const next = { ...prev, clicks: prev.clicks + 1 };
        persistAll(next, colSpan, rowSpan, isOccupied, userProfile, currentPlan, uploadedBanners);
        return next;
      });
      window.open(bannerData.link, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-[#070b12] text-white flex flex-col items-center p-4 md:p-8 select-none relative overflow-x-hidden font-sans">
      
      {/* Header Bar Baru: (Menu) + (Logo ProMotion Status) di Kiri, (Masuk/Daftar) di Kanan */}
      <header className="w-full max-w-md md:max-w-3xl lg:max-w-5xl flex items-center justify-between py-3 px-2 border-b border-white/5 relative z-30">
        
        {/* SISI KIRI: MENU + [LOGO] PROMOTION [BASIC/PRO/SUPER] SESUAI STATUS LANGGANAN */}
        <div className="flex items-center gap-2.5 animate-[fadeIn_0.5s_ease-out]">
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="w-10 h-10 rounded-2xl bg-[#0e1622]/80 backdrop-blur-xl border border-white/10 flex items-center justify-center text-gray-300 hover:text-white hover:border-emerald-500/40 active:scale-90 transition-all shadow-sm"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>

          {/* Kotak [Logo] ProMotion [Plan] dengan Background Gradasi Dinamis */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl backdrop-blur-xl border transition-all duration-300 shadow-md ${
            currentPlan === 'Basic'
              ? 'bg-[#0c131f]/80 border-white/10'
              : currentPlan === 'Pro'
              ? 'bg-gradient-to-r from-cyan-950/70 via-blue-900/50 to-indigo-950/70 border-cyan-400/50 shadow-[0_0_16px_rgba(6,182,212,0.3)]'
              : 'bg-gradient-to-r from-amber-950/70 via-yellow-900/50 to-amber-950/70 border-amber-400/50 shadow-[0_0_20px_rgba(245,158,11,0.35)]'
          }`}>
            <img 
              src="/logo.png" 
              alt="Logo" 
              onError={(e) => { e.target.style.display = 'none'; }}
              className="w-6 h-6 object-contain drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]"
            />
            <div className="text-sm font-extrabold tracking-tight flex items-center gap-1.5 select-none">
              <span className="text-white">ProMotion</span>
              {currentPlan === 'Basic' && (
                <span className="text-[11px] font-semibold text-gray-300 bg-white/10 px-1.5 py-0.5 rounded-md border border-white/10">
                  Basic
                </span>
              )}
              {currentPlan === 'Pro' && (
                <span className="text-[11px] font-bold text-cyan-300 bg-cyan-500/20 px-1.5 py-0.5 rounded-md border border-cyan-400/40 shadow-[0_0_8px_rgba(6,182,212,0.3)]">
                  Pro 💎
                </span>
              )}
              {currentPlan === 'Super' && (
                <span className="text-[11px] font-extrabold text-amber-300 bg-amber-500/25 px-1.5 py-0.5 rounded-md border border-amber-400/50 shadow-[0_0_12px_rgba(245,158,11,0.4)]">
                  Super ✨
                </span>
              )}
            </div>
          </div>
        </div>

        {/* SISI KANAN: TOMBOL MASUK/DAFTAR DENGAN FULL NAVIGASI MODAL */}
        <button
          onClick={() => { setAuthMode('login'); setIsAuthModalOpen(true); }}
          className="px-3.5 py-1.5 text-xs font-bold rounded-2xl bg-white/5 hover:bg-emerald-500/15 border border-white/10 hover:border-emerald-500/30 text-gray-200 hover:text-emerald-400 backdrop-blur-xl transition-all active:scale-95 flex items-center gap-1.5 shadow-sm"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <polyline points="10 17 15 12 10 7" />
            <line x1="15" y1="12" x2="3" y2="12" />
          </svg>
          <span>Masuk / Daftar</span>
        </button>
      </header>

      {/* Hero Description */}
      <div className="w-full max-w-md md:max-w-2xl text-center my-4 px-2 flex flex-col items-center">
        <div className="inline-block px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-medium mb-2 shadow-[0_0_10px_rgba(16,185,129,0.15)]">
          Promosikan Produk, Jasa, Website, dll anda di sini
        </div>
        <p className="text-gray-400 text-xs md:text-sm leading-relaxed mb-2.5">
          Papan iklan piksel digital komunitas. Pasang banner usahamu, tentukan ukuran custom, dan tautkan jejaring media sosial langsung secara instan.
        </p>

        {/* BADGE SLOT DI BAWAH DESKRIPSI */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0e1622]/90 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)] backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-mono font-bold text-emerald-400">
            Slot {isOccupied ? totalSlotsUsed : '0'}/100
          </span>
        </div>
      </div>

      {/* Grid Canvas Wrapper */}
      <div className="w-full max-w-md md:max-w-3xl lg:max-w-5xl bg-[#0c121d]/70 border border-white/5 rounded-3xl p-3 md:p-5 shadow-2xl backdrop-blur-2xl relative">
        <div className="grid grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-2 md:gap-3 auto-rows-[64px] md:auto-rows-[76px] relative">
          
          {/* BANNER UTAMA */}
          {isOccupied ? (
            <div
              style={{
                gridColumn: `span ${colSpan}`,
                gridRow: `span ${rowSpan}`,
              }}
              className={`relative rounded-2xl flex flex-col justify-between overflow-hidden transition-all duration-300 border border-emerald-500/40 bg-gradient-to-br from-[#121c2b]/95 to-[#0a111a]/95 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.5)] group ${
                rowSpan === 1 ? 'p-1' : 'p-1.5'
              }`}
            >
              {/* Badge Ukuran Slot */}
              <span className={`absolute top-1 left-1 z-20 px-1 py-0.2 rounded bg-black/70 backdrop-blur-md border border-white/10 font-mono text-emerald-400 ${
                rowSpan === 1 ? 'text-[7px]' : 'text-[9px] px-1.5 py-0.5'
              }`}>
                {colSpan}x{rowSpan} ({totalSlotsUsed} Slot)
              </span>

              {/* Tombol Edit Isi Banner */}
              <button
                onClick={() => setIsModalOpen(true)}
                className={`absolute top-1 right-1 z-20 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 flex items-center justify-center text-gray-200 border border-white/10 transition-transform ${
                  rowSpan === 1 ? 'w-4 h-4 text-[9px]' : 'w-6 h-6 text-xs'
                }`}
              >
                ✎
              </button>

              {/* Gambar / Media Banner */}
              <div 
                onClick={handleBannerClick}
                className="w-full flex-1 rounded-xl overflow-hidden bg-black/40 relative flex items-center justify-center cursor-pointer active:opacity-90 transition-opacity min-h-0"
              >
                {bannerData.image ? (
                  <img
                    src={bannerData.image}
                    alt="Banner Media"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-500 gap-0.5 p-1">
                    <span className={rowSpan === 1 ? 'text-[8px]' : 'text-xs'}>Preview Media</span>
                  </div>
                )}
              </div>

              {/* Bagian Bawah Banner: Jika slot melebar horizontal (misal 5x1 di gambar 2), logo avatar otomatis disembunyikan agar hanya nama yang tampil */}
              <div className={`w-full flex flex-col items-center justify-center ${rowSpan === 1 ? 'pt-0.5 pb-0' : 'pt-1.5 pb-0.5 px-1'}`}>
                
                {/* 1. Baris Identitas (Logo Avatar sembunyi saat melebar rowSpan === 1) */}
                <div className="flex items-center justify-center gap-1 max-w-full overflow-hidden">
                  {rowSpan > 1 && (
                    <img 
                      src={userProfile.avatar} 
                      alt="Avatar" 
                      className={`rounded-full object-cover border border-white/20 shrink-0 ${colSpan === 1 ? 'w-2.5 h-2.5' : 'w-4 h-4'}`}
                    />
                  )}
                  <span 
                    style={{ fontFamily: bannerData.brandFont ? bannerData.brandFont : 'inherit' }}
                    className={`text-center font-extrabold tracking-wide truncate max-w-full ${
                      rowSpan === 1 ? 'text-[11px] leading-tight text-emerald-400' : colSpan === 1 ? 'text-[8px]' : 'text-[12px] md:text-sm text-gray-200'
                    } ${
                      isMotionSuper
                        ? 'bg-gradient-to-r from-emerald-400 via-violet-300 to-pink-400 bg-[length:250%_auto] animate-[shimmer_3s_linear_infinite] bg-clip-text text-transparent'
                        : ''
                    }`}
                  >
                    {bannerData.name}
                  </span>
                </div>

                {/* 2. Plugin Musik Mini */}
                <div 
                  onClick={togglePlayMusic}
                  className={`rounded-full bg-white/[0.05] border border-white/10 backdrop-blur-md flex items-center cursor-pointer hover:bg-white/[0.09] active:scale-95 transition-all ${
                    rowSpan === 1 ? 'mt-0.5 px-2 py-0.5 gap-1.5' : 'mt-1 px-2.5 py-0.5 gap-2'
                  }`}
                >
                  <div className={`flex items-center justify-center text-emerald-400 ${rowSpan === 1 ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'}`}>
                    {bannerData.isPlayingMusic ? (
                      <svg width={rowSpan === 1 ? '8' : '10'} height={rowSpan === 1 ? '8' : '10'} viewBox="0 0 24 24" fill="currentColor">
                        <rect x="5" y="4" width="4" height="16" rx="1" />
                        <rect x="15" y="4" width="4" height="16" rx="1" />
                      </svg>
                    ) : (
                      <svg width={rowSpan === 1 ? '8' : '10'} height={rowSpan === 1 ? '8' : '10'} viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 4l14 8-14 8V4z" />
                      </svg>
                    )}
                  </div>

                  <span className={`text-gray-300 truncate ${rowSpan === 1 ? 'text-[9px] max-w-[90px]' : 'text-[10px] max-w-[110px]'}`}>
                    {bannerData.musicTitle}
                  </span>

                  <div 
                    onClick={toggleVisualizerType}
                    title="Ubah visualizer"
                    className="flex items-center justify-center cursor-pointer"
                  >
                    {bannerData.musicVisualizerType === 'bars' ? (
                      <div className={`flex items-end ${rowSpan === 1 ? 'gap-[1px] h-2' : 'gap-[2px] h-2.5'}`}>
                        <span className={`w-[2px] bg-emerald-400 rounded-full transition-all ${bannerData.isPlayingMusic ? 'h-full animate-pulse' : 'h-1'}`} />
                        <span className={`w-[2px] bg-emerald-400 rounded-full transition-all ${bannerData.isPlayingMusic ? 'h-2/3 animate-ping' : 'h-1'}`} />
                      </div>
                    ) : (
                      <div className={`rounded-full border border-emerald-400 bg-black flex items-center justify-center ${
                        rowSpan === 1 ? 'w-2.5 h-2.5' : 'w-3 h-3'
                      } ${bannerData.isPlayingMusic ? 'animate-[spin_2s_linear_infinite]' : ''}`}>
                        <div className={`rounded-full bg-emerald-400 ${rowSpan === 1 ? 'w-0.5 h-0.5' : 'w-1 h-1'}`} />
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Medsos Dinamis: Ikon Terpasang + Tombol [+] Lengkung */}
                {rowSpan > 1 && (
                  <div className="flex items-center justify-center flex-wrap gap-1 mt-1">
                    {bannerData.socials.map((social) => (
                      <a
                        key={social.id}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative flex items-center justify-center active:scale-90 transition-transform"
                      >
                        <img
                          src={social.icon}
                          alt="Social Icon"
                          className="w-3.5 h-3.5 rounded-full object-cover bg-black/60 p-[0.5px]"
                        />
                      </a>
                    ))}

                    {bannerData.socials.length < getMaxSocials() && (
                      <button
                        type="button"
                        onClick={() => setIsAddSocialOpen(true)}
                        className="w-3.5 h-3.5 rounded-full bg-white/[0.08] hover:bg-emerald-500/20 border border-white/20 text-gray-300 hover:text-emerald-400 flex items-center justify-center transition active:scale-90"
                      >
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      </button>
                    )}
                  </div>
                )}

              </div>

              {/* Handle Resize Sudut iOS */}
              <div
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="absolute -bottom-1 -right-1 w-6 h-6 flex items-center justify-center cursor-nwse-resize z-30 select-none touch-none active:scale-125 transition-transform"
                title="Tarik untuk sesuaikan slot"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="rotate-[-10deg] drop-shadow-[0_0_6px_rgba(255,255,255,0.85)]">
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
            <div
              onClick={() => setIsModalOpen(true)}
              className="rounded-2xl border-2 border-dashed border-emerald-500/30 bg-[#0f1622]/70 hover:bg-[#152030]/80 hover:border-emerald-400/60 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group active:scale-95"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-emerald-400 group-hover:scale-110 transition-transform">
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span className="text-[9px] text-emerald-400/80 font-mono mt-0.5 font-semibold">#1 Buka</span>
            </div>
          )}

          {/* Sisa Grid Slots Kosong */}
          {Array.from({ length: Math.max(0, 100 - (isOccupied ? totalSlotsUsed : 1)) }).map((_, i) => {
            const slotNumber = (isOccupied ? totalSlotsUsed : 1) + i + 1;
            return (
              <div
                key={slotNumber}
                onClick={() => setIsModalOpen(true)}
                className="rounded-2xl border border-white/[0.04] bg-[#0f1622]/50 hover:bg-[#152030]/60 hover:border-emerald-500/20 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group active:scale-95"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="text-gray-600 group-hover:text-emerald-400 transition-colors">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                <span className="text-[8px] text-gray-600 group-hover:text-gray-400 font-mono mt-0.5">#{slotNumber}</span>
              </div>
            );
          })}

        </div>
      </div>
      {/* DRAWER MENU UTAMA (FULL NAVIGASI LANGGANAN, PLUGIN, DAN FOOTER IKON GERIGI) */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div 
            onClick={() => setIsMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
          />

          <div className="relative w-88 max-w-[90vw] h-full bg-[#0c121e]/95 backdrop-blur-2xl border-r border-white/10 p-5 flex flex-col justify-between shadow-2xl z-10 animate-[slideRight_0.3s_cubic-bezier(0.16,1,0.3,1)]">
            <div className="flex flex-col gap-4 overflow-y-auto pr-1">
              
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="font-bold text-sm tracking-wide text-gray-200">Panel Kontrol ProMotion</span>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition active:scale-90"
                >
                  ✕
                </button>
              </div>

              {/* Tab Navigasi: Slots, Langganan, Plugin */}
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#070b12]/90 rounded-2xl border border-white/5 backdrop-blur-md">
                {[
                  { key: 'slots', label: 'Slots' },
                  { key: 'subscription', label: 'Langganan' },
                  { key: 'plugin', label: 'Plugin' },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setActiveTab(item.key)}
                    className={`py-2 px-2 rounded-xl text-[11px] font-semibold transition-all duration-300 active:scale-95 ${
                      activeTab === item.key 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* TAB 1: SLOTS */}
              {activeTab === 'slots' && (
                <div className="flex flex-col gap-3 text-left">
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl flex flex-col gap-1.5 shadow-sm">
                    <span className="text-xs font-bold text-gray-200">Status Grid Billboard</span>
                    <span className="text-[11px] text-gray-400">Dimensi Grid: {colSpan} Kolom x {rowSpan} Baris</span>
                    <span className="text-[11px] text-emerald-400 font-medium">Kapasitas: {totalSlotsUsed} Slot {isFreeSlot ? '(Gratis)' : ''}</span>
                  </div>
                  <button
                    onClick={() => { setIsMenuOpen(false); setIsModalOpen(true); }}
                    className="w-full py-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold hover:bg-emerald-500/30 active:scale-95 transition"
                  >
                    + Atur / Sewa Slot
                  </button>
                </div>
              )}

              {/* TAB 2: FULL NAVIGASI LANGGANAN (PENJELASAN LENGKAP APA YANG DIPEROLEH PRO & SUPER) */}
              {activeTab === 'subscription' && (
                <div className="flex flex-col gap-3.5 text-left">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-bold text-gray-300">Pilihan Paket Langganan</span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">Saat ini: Motion {currentPlan}</span>
                  </div>
                  
                  {/* 1. Motion Basic (Paket Bawaan Saat Ini) */}
                  <div 
                    onClick={() => { setCurrentPlan('Basic'); persistAll(bannerData, colSpan, rowSpan, isOccupied, userProfile, 'Basic', uploadedBanners); }}
                    className={`p-3.5 rounded-2xl cursor-pointer transition-all border backdrop-blur-xl ${
                      currentPlan === 'Basic'
                        ? 'bg-gradient-to-r from-gray-200/15 via-white/10 to-gray-300/15 border-white/40 shadow-sm'
                        : 'bg-white/[0.02] border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-200">1. Motion Basic</span>
                      {currentPlan === 'Basic' && <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/20 text-white font-bold">AKTIF</span>}
                    </div>
                    <ul className="text-[10px] text-gray-400 mt-2 space-y-1 list-disc list-inside">
                      <li>Badge ProMotion Basic di header</li>
                      <li>Slot 1x1 gratis selamanya</li>
                      <li>Maksimal 2 tautan icon media sosial</li>
                      <li>Pemutar audio latar belakang standar</li>
                    </ul>
                  </div>

                  {/* 2. Motion Pro (Berlian Mengkilap) */}
                  <div 
                    onClick={() => { setCurrentPlan('Pro'); persistAll(bannerData, colSpan, rowSpan, isOccupied, userProfile, 'Pro', uploadedBanners); }}
                    className={`p-3.5 rounded-2xl cursor-pointer transition-all border backdrop-blur-xl relative overflow-hidden ${
                      currentPlan === 'Pro'
                        ? 'bg-gradient-to-r from-cyan-500/25 via-blue-600/30 to-indigo-500/25 border-cyan-400/60 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                        : 'bg-white/[0.02] border-white/5 hover:border-cyan-500/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-cyan-300">2. Motion Pro 💎</span>
                      {currentPlan === 'Pro' && <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-500/30 text-cyan-200 font-bold">AKTIF</span>}
                    </div>
                    <ul className="text-[10px] text-gray-300 mt-2 space-y-1 list-disc list-inside">
                      <li>Badge ProMotion Pro dengan kilau berlian di header</li>
                      <li>Kapasitas hingga 5 tautan icon media sosial</li>
                      <li>Border slot bercahaya neon cyan-blue modern</li>
                      <li>Akses visualizer piringan hitam (vinyl disc) berputar</li>
                    </ul>
                  </div>

                  {/* 3. Motion Super (Emas Modern) */}
                  <div 
                    onClick={() => { setCurrentPlan('Super'); persistAll(bannerData, colSpan, rowSpan, isOccupied, userProfile, 'Super', uploadedBanners); }}
                    className={`p-3.5 rounded-2xl cursor-pointer transition-all border backdrop-blur-xl ${
                      currentPlan === 'Super'
                        ? 'bg-gradient-to-r from-amber-500/30 via-yellow-500/30 to-amber-600/30 border-amber-400/60 shadow-[0_0_24px_rgba(245,158,11,0.35)]'
                        : 'bg-white/[0.02] border-white/5 hover:border-amber-500/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300">3. Motion Super ✨</span>
                      {currentPlan === 'Super' && <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-300 font-bold">AKTIF</span>}
                    </div>
                    <ul className="text-[10px] text-amber-200/90 mt-2 space-y-1 list-disc list-inside">
                      <li>Badge ProMotion Super emas bercahaya penuh di header</li>
                      <li>Unlimited tautan icon media sosial tanpa batas</li>
                      <li>Animasi teks shimmer gradasi bergerak bebas</li>
                      <li>Efek rotasi neon glow di icon media sosial</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* TAB 3: PLUGIN */}
              {activeTab === 'plugin' && (
                <div className="flex flex-col gap-3 text-left">
                  <div className="p-4 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.37)] flex flex-col gap-3.5 relative overflow-hidden group">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-200">Plugin Audio Background</span>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono">
                        Active
                      </span>
                    </div>

                    <input 
                      type="text" 
                      value={bannerData.musicTitle}
                      onChange={(e) => {
                        const updated = { ...bannerData, musicTitle: e.target.value };
                        setBannerData(updated);
                        persistAll(updated, colSpan, rowSpan, isOccupied, userProfile, currentPlan, uploadedBanners);
                      }}
                      className="w-full bg-[#070b12]/90 border border-white/10 rounded-2xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/50 backdrop-blur-md shadow-inner"
                    />

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-gray-400">Gaya Visualizer:</span>
                      <button 
                        onClick={toggleVisualizerType}
                        className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 text-xs font-semibold text-emerald-400 active:scale-95 transition"
                      >
                        {bannerData.musicVisualizerType === 'bars' ? 'Equalizer Bar' : 'Vinyl Disc'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* POJOK BAWAH DRAWER: PROFIL USER + IKON GERIGI LENGKAP */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between p-2 rounded-2xl bg-white/[0.02]">
              <div className="flex items-center gap-2.5 truncate">
                <div className="relative shrink-0">
                  <img 
                    src={userProfile.avatar} 
                    alt="Avatar" 
                    className="w-9 h-9 rounded-2xl object-cover border border-white/20 shadow-md" 
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0c121e]" />
                </div>
                <div className="flex flex-col text-left truncate">
                  <span className="text-xs font-bold text-gray-100 truncate">{userProfile.name}</span>
                  <span className="text-[10px] text-emerald-400 font-mono font-medium">Akun Pengguna</span>
                </div>
              </div>

              {/* IKON GERIGI (KLIK UNTUK FULL NAVIGASI PENGATURAN PROFIL) */}
              <button
                onClick={() => { setIsMenuOpen(false); setIsProfileModalOpen(true); }}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-500/40 text-gray-300 hover:text-emerald-400 flex items-center justify-center transition active:scale-90"
                title="Buka Pengaturan Profil Lengkap"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* FULL NAVIGASI MODAL: PENGATURAN PROFIL PENGGUNA (DIBUKA LEWAT IKON GERIGI) */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fadeIn">
          <div className="w-full max-w-md rounded-[32px] bg-[#111722]/95 border border-white/10 p-6 shadow-2xl flex flex-col gap-4 text-left max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-sm font-bold text-white">Pengaturan Profil Pengguna</span>
              </div>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 text-gray-400 hover:text-white flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            {/* Foto Profil & Nama Brand */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col gap-3">
              <span className="text-xs font-bold text-gray-200">1. Foto Profil & Identitas Brand</span>
              <div className="flex items-center gap-3">
                <label className="relative cursor-pointer group shrink-0">
                  <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleAvatarFileSelect} className="hidden" />
                  <div className="w-12 h-12 rounded-2xl overflow-hidden border border-white/20 shadow-sm relative">
                    <img 
                      src={tempAvatar} 
                      alt="Avatar" 
                      style={{ transform: `scale(${zoomLevel}) rotate(${rotateDeg}deg)` }}
                      className="w-full h-full object-cover transition-transform duration-200"
                    />
                  </div>
                  <span className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 text-[9px] text-white font-semibold">
                    Ubah
                  </span>
                </label>
                <div className="flex-1">
                  <label className="text-[10px] text-gray-400 block mb-1">Nama Brand / Profil</label>
                  <input 
                    type="text" 
                    value={tempProfileName}
                    onChange={(e) => {
                      setTempProfileName(e.target.value);
                      triggerAutoSaveTimer();
                    }}
                    className="w-full bg-[#070b12]/90 border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              {/* Tombol Simpan Otomatis 5 Detik */}
              <div className={`transition-all duration-500 overflow-hidden ${showSaveBtn ? 'max-h-14 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                <button
                  onClick={handleSaveProfile}
                  className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                  <span>Simpan Perubahan Profil</span>
                </button>
              </div>
            </div>

            {/* Custom Font & Musik */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col gap-2.5">
              <span className="text-xs font-bold text-gray-200">2. Custom Upload (Font Nama & Musik)</span>
              
              <label className="w-full py-2.5 px-3.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 text-xs font-semibold flex items-center justify-between cursor-pointer active:scale-95 transition">
                <div className="flex items-center gap-2">
                  <span className="font-bold">T</span>
                  <span>Upload Font (.ttf/.otf)</span>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="text-emerald-400">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <input type="file" accept=".ttf,.otf" onChange={handleFontUpload} className="hidden" />
              </label>

              <label className="w-full py-2.5 px-3.5 rounded-2xl bg-violet-600/15 hover:bg-violet-600/20 border border-violet-500/25 text-violet-300 text-xs font-semibold flex items-center justify-between cursor-pointer active:scale-95 transition">
                <div className="flex items-center gap-2">
                  <span>♫</span>
                  <span>Upload Music (.mp3)</span>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="text-violet-400">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <input type="file" accept=".mp3,audio/mpeg" onChange={handleMusicUpload} className="hidden" />
              </label>
            </div>

            {/* Riwayat Banner */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col gap-2">
              <span className="text-xs font-bold text-gray-200">Riwayat Banner Anda</span>
              <div className="flex flex-col gap-1.5 max-h-24 overflow-y-auto">
                {uploadedBanners.map((item) => (
                  <div key={item.id} className="p-2 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-gray-200 truncate">{item.name}</span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[9px] font-mono font-bold">
                      {item.size}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reset */}
            <button 
              onClick={() => {
                localStorage.removeItem('promotion_slot_data_v9');
                setIsOccupied(false);
                setIsProfileModalOpen(false);
              }}
              className="w-full py-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold hover:bg-rose-500/20 active:scale-95 transition"
            >
              Reset Data Banner & Slot
            </button>
          </div>
        </div>
      )}

      {/* FULL NAVIGASI MODAL: MASUK / DAFTAR AKUN (POJOK KANAN ATAS) */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fadeIn">
          <div className="w-full max-w-xs rounded-[32px] bg-[#111722]/95 border border-white/10 p-6 shadow-2xl flex flex-col gap-4 text-left">
            
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-sm font-bold text-white">
                {authMode === 'login' ? 'Masuk ke ProMotion' : 'Buat Akun Baru'}
              </span>
              <button
                onClick={() => setIsAuthModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 text-gray-400 hover:text-white flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <div className="flex p-1 bg-[#070b12] rounded-xl border border-white/5">
              <button
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${authMode === 'login' ? 'bg-emerald-500 text-black' : 'text-gray-400'}`}
              >
                Masuk
              </button>
              <button
                onClick={() => setAuthMode('register')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${authMode === 'register' ? 'bg-emerald-500 text-black' : 'text-gray-400'}`}
              >
                Daftar
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[10px] text-gray-400 block mb-1">Email / Username</label>
                <input 
                  type="text" 
                  placeholder="nama@email.com"
                  className="w-full bg-[#0a0f16] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 block mb-1">Kata Sandi</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full bg-[#0a0f16] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <button
                onClick={() => {
                  alert(authMode === 'login' ? 'Berhasil Masuk!' : 'Akun berhasil terdaftar!');
                  setIsAuthModalOpen(false);
                }}
                className="w-full mt-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition shadow-lg active:scale-95"
              >
                {authMode === 'login' ? 'Masuk Sekarang' : 'Daftar Akun'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CROP & ROTATE AVATAR */}
      {cropModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-xs rounded-[32px] bg-[#111722]/95 border border-white/10 p-5 shadow-2xl flex flex-col items-center gap-4 text-center">
            <span className="text-sm font-bold text-white">Sesuaikan Foto Profil</span>
            
            <div className="w-40 h-40 rounded-full border-2 border-emerald-500/60 overflow-hidden relative flex items-center justify-center bg-black/50 shadow-inner">
              <img
                src={rawAvatarImage}
                alt="Crop Preview"
                style={{ transform: `scale(${zoomLevel}) rotate(${rotateDeg}deg)` }}
                className="w-full h-full object-cover transition-transform duration-100"
              />
            </div>

            <div className="w-full flex items-center gap-2 px-2">
              <span className="text-[10px] text-gray-400">Zoom</span>
              <input
                type="range"
                min="1"
                max="2.5"
                step="0.05"
                value={zoomLevel}
                onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 h-1 bg-white/10 rounded-lg cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setRotateDeg((prev) => prev - 90)}
                className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-300 hover:text-white active:scale-95 transition"
              >
                Putar ↺
              </button>
              <button
                type="button"
                onClick={() => setRotateDeg((prev) => prev + 90)}
                className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-300 hover:text-white active:scale-95 transition"
              >
                Putar ↻
              </button>
            </div>

            <div className="flex items-center gap-2 w-full mt-2">
              <button
                type="button"
                onClick={() => setCropModalOpen(false)}
                className="flex-1 py-2 rounded-xl bg-white/5 text-gray-300 text-xs font-semibold active:scale-95 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmCrop}
                className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center justify-center gap-1 active:scale-95 transition shadow-lg"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Terapkan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL POPUP TAMBAH IKON MEDSOS (+) */}
      {isAddSocialOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-xs rounded-[32px] bg-[#111722]/95 border border-white/10 p-5 shadow-2xl flex flex-col gap-3.5 text-left">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white">+ Tambah Medsos</span>
              <button 
                onClick={() => setIsAddSocialOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 text-gray-400 hover:text-white flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-[11px] text-gray-400">
              Paket <b>Motion {currentPlan}</b>: maksimal {getMaxSocials() === 999 ? 'Unlimited' : `${getMaxSocials()} medsos`}.
            </p>

            <div>
              <label className="text-[10px] text-gray-400 block mb-1">Unggah Ikon Medsos (PNG/JPG/WebP)</label>
              <label className="w-full border-2 border-dashed border-white/10 hover:border-emerald-500/40 rounded-2xl py-2.5 px-3 flex items-center justify-center gap-2 cursor-pointer bg-[#0a0f16]/60 transition">
                <input 
                  type="file" 
                  accept="image/png,image/jpeg,image/webp" 
                  onChange={(e) => {
                    const f = e.target.files[0];
                    if (f) setNewSocialIcon(URL.createObjectURL(f));
                  }} 
                  className="hidden" 
                />
                {newSocialIcon ? (
                  <img src={newSocialIcon} alt="Icon Preview" className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <span className="text-xs text-emerald-400 font-semibold">+ Pilih File Ikon</span>
                )}
              </label>
            </div>

            <div>
              <label className="text-[10px] text-gray-400 block mb-1">Tautan / Link Medsos</label>
              <input
                type="url"
                value={newSocialUrl}
                onChange={(e) => setNewSocialUrl(e.target.value)}
                placeholder="https://tiktok.com/@kamu atau ig"
                className="w-full bg-[#0a0f16]/90 border border-white/10 rounded-2xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <button
              onClick={handleAddSocial}
              className="w-full py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition shadow-lg active:scale-95"
            >
              Pasang Ikon Medsos
            </button>
          </div>
        </div>
      )}

      {/* MODAL FORM SEWA BANNER */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm rounded-[32px] bg-[#111722]/90 backdrop-blur-2xl border border-white/10 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex flex-col gap-3.5 text-left relative transition-all duration-300 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold text-sm">+ Atur / Pasang Banner</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                  isFreeSlot 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}>
                  {isFreeSlot ? '1 Slot Gratis' : `Rp ${totalPrice.toLocaleString('id-ID')}`}
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
                <span className="text-[10px] text-emerald-400 font-mono">
                  {totalSlotsUsed} Slot {isFreeSlot ? '(Gratis)' : `(Bayar ${totalSlotsUsed - 1} Slot)`}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { label: '1:1', val: '1:1' },
                  { label: '5:1', val: '5:1' },
                  { label: '2x2', val: '2x2' },
                  { label: '9:16', val: '9:16' },
                  { label: '16:9', val: '16:9' },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => applyAspectRatio(item.val)}
                    className={`py-2 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-95 ${
                      selectedRatio === item.val
                        ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 shadow-sm'
                        : 'bg-[#0a0f16]/80 border border-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    {item.label}
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
              onClick={handleProceedRent}
              className="w-full mt-2 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs tracking-wide shadow-[0_4px_16px_rgba(16,185,129,0.3)] transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
            >
              <span>{isFreeSlot ? 'Pasang Gratis (1 Slot)' : `Bayar Rp ${totalPrice.toLocaleString('id-ID')} & Pasang`}</span>
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
              <span className="text-sm font-bold text-white">Konfirmasi Tambahan Slot</span>
              <span className="text-xs text-gray-400 mt-1">Total {totalSlotsUsed} Slot (1 Slot Gratis + {totalSlotsUsed - 1} Slot Berbayar)</span>
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
