import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import {
  Save,
  Upload,
  Music,
  Type,
  CreditCard,
  Trash2,
  Gem,
  Sparkles,
  ShieldCheck,
  Layers,
  Disc3,
  Sliders,
  Wifi,
  WifiOff
} from 'lucide-react';

const SOCKET_URL = 'https://promotion-backend-production.up.railway.app';
const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  reconnectionAttempts: 5,
});

export default function App() {
  // State Status Koneksi Real-time
  const [isConnected, setIsConnected] = useState(false);

  // State Langganan: Default 'Basic'
  const [currentPlan, setCurrentPlan] = useState('Basic');
  const [subscriptionExpiry, setSubscriptionExpiry] = useState('12 Des 2026');

  // State Drawer & Modal Navigasi
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('subscription');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  // State Ukuran Grid Slot - DEFAULT 5x1
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

  // Modal Tambah Medsos
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
    musicVisualizerType: 'bars',
    clicks: 142,
    views: 1890,
    socials: [],
  });

  // State Riwayat Banner
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

  // --- SINKRONISASI REAL-TIME WEBSOCKET (SOCKET.IO) ---
  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
      console.log('Terhubung ke ProMotion Realtime Server');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Terputus dari ProMotion Realtime Server');
    });

    // Inisialisasi awal saat user buka web
    socket.on('billboard_init', (data) => {
      applyIncomingData(data);
    });

    // Menerima update LIVE dari user lain yang mengubah data
    socket.on('billboard_updated', (data) => {
      applyIncomingData(data);
    });

    // Sinkronisasi klik banner real-time
    socket.on('banner_click_updated', (clicks) => {
      setBannerData((prev) => ({ ...prev, clicks }));
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('billboard_init');
      socket.off('billboard_updated');
      socket.off('banner_click_updated');
    };
  }, []);

  const applyIncomingData = (data) => {
    if (!data) return;
    setBannerData((prev) => ({
      ...prev,
      name: data.name ?? prev.name,
      brandFont: data.brandFont ?? prev.brandFont,
      image: data.image ?? prev.image,
      link: data.link ?? prev.link,
      musicTitle: data.musicTitle ?? prev.musicTitle,
      musicFile: data.musicFile ?? prev.musicFile,
      musicVisualizerType: data.musicVisualizerType ?? prev.musicVisualizerType,
      clicks: data.clicks ?? prev.clicks,
      views: data.views ?? prev.views,
      socials: data.socials ?? prev.socials,
    }));

    if (data.colSpan) setColSpan(data.colSpan);
    if (data.rowSpan) setRowSpan(data.rowSpan);
    if (data.currentPlan) setCurrentPlan(data.currentPlan);
    if (data.userProfile) {
      setUserProfile(data.userProfile);
      setTempProfileName(data.userProfile.name);
      setTempAvatar(data.userProfile.avatar);
    }
  };

  // Broadcast Perubahan ke Seluruh Client
  const broadcastUpdate = (updatedBanner, cols, rows, plan, profile) => {
    const payload = {
      name: updatedBanner.name,
      brandFont: updatedBanner.brandFont,
      image: updatedBanner.image,
      link: updatedBanner.link,
      musicTitle: updatedBanner.musicTitle,
      musicFile: updatedBanner.musicFile,
      musicVisualizerType: updatedBanner.musicVisualizerType,
      clicks: updatedBanner.clicks,
      views: updatedBanner.views,
      socials: updatedBanner.socials,
      colSpan: cols ?? colSpan,
      rowSpan: rows ?? rowSpan,
      currentPlan: plan ?? currentPlan,
      userProfile: profile ?? userProfile,
    };
    socket.emit('update_billboard', payload);
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
    broadcastUpdate(bannerData, colSpan, rowSpan, currentPlan, updatedProfile);
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
    broadcastUpdate(bannerData, colSpan, rowSpan, currentPlan, userProfile);
  };

  const applyAspectRatio = (ratio) => {
    setSelectedRatio(ratio);
    let nextCols = colSpan;
    let nextRows = rowSpan;
    if (ratio === '1:1') { nextCols = 1; nextRows = 1; }
    else if (ratio === '5:1') { nextCols = 5; nextRows = 1; }
    else if (ratio === '2x2') { nextCols = 2; nextRows = 2; }
    else if (ratio === '9:16') { nextCols = 2; nextRows = 4; }
    else if (ratio === '16:9') { nextCols = 4; nextRows = 2; }

    setColSpan(nextCols);
    setRowSpan(nextRows);
    broadcastUpdate(bannerData, nextCols, nextRows, currentPlan, userProfile);
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
        broadcastUpdate(updatedBanner, colSpan, rowSpan, currentPlan, userProfile);
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
      broadcastUpdate(updated, colSpan, rowSpan, currentPlan, userProfile);
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
    const nextPlayState = !bannerData.isPlayingMusic;
    setBannerData((prev) => ({ ...prev, isPlayingMusic: nextPlayState }));
    socket.emit('toggle_music', nextPlayState);
  };

  const toggleVisualizerType = (e) => {
    e.stopPropagation();
    const nextType = bannerData.musicVisualizerType === 'bars' ? 'disc' : 'bars';
    const updated = { ...bannerData, musicVisualizerType: nextType };
    setBannerData(updated);
    broadcastUpdate(updated, colSpan, rowSpan, currentPlan, userProfile);
  };

  const handleAddSocial = () => {
    const maxSocials = getMaxSocials();
    if (bannerData.socials.length >= maxSocials) {
      alert(`Batas maksimal paket ${currentPlan} adalah ${maxSocials} icon.`);
      return;
    }
    if (!newSocialIcon || !newSocialUrl) {
      alert('Pilih icon medsos dan cantumkan URL tautan.');
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
    broadcastUpdate(updatedBanner, colSpan, rowSpan, currentPlan, userProfile);
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

    broadcastUpdate(updatedBanner, colSpan, rowSpan, currentPlan, userProfile);
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
      socket.emit('click_banner');
      window.open(bannerData.link, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-[#070a10] text-[#f1f5f9] flex flex-col items-center p-4 md:p-8 select-none relative overflow-x-hidden font-sans">
      
      {/* Header Bar */}
      <header className="w-full max-w-md md:max-w-3xl lg:max-w-5xl flex items-center justify-between py-3.5 px-3 border-b border-white/[0.06] backdrop-blur-xl relative z-30">
        
        {/* SISI KIRI: MENU + [LOGO] PROMOTION [PLAN] */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="w-10 h-10 rounded-2xl bg-[#0d131f]/80 backdrop-blur-xl border border-white/[0.08] flex items-center justify-center text-slate-300 hover:text-white hover:border-violet-500/40 active:scale-95 transition-all duration-200 shadow-sm"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-2xl backdrop-blur-2xl border transition-all duration-300 shadow-md ${
            currentPlan === 'Basic'
              ? 'bg-[#0f1523]/80 border-white/[0.08]'
              : currentPlan === 'Pro'
              ? 'bg-gradient-to-r from-violet-950/40 via-cyan-950/30 to-blue-950/40 border-cyan-400/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
              : 'bg-gradient-to-r from-amber-950/40 via-yellow-950/30 to-amber-950/40 border-amber-400/30 shadow-[0_0_24px_rgba(245,158,11,0.2)]'
          }`}>
            <img 
              src="/logo.png" 
              alt="Logo" 
              onError={(e) => { e.target.style.display = 'none'; }}
              className="w-6 h-6 object-contain drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]"
            />
            <div className="text-sm font-extrabold tracking-tight flex items-center gap-2 select-none">
              <span className="text-slate-100">ProMotion</span>
              {currentPlan === 'Basic' && (
                <span className="text-[10px] tracking-wider uppercase font-semibold text-slate-400 bg-white/[0.06] px-2 py-0.5 rounded-md border border-white/[0.06]">
                  Basic
                </span>
              )}
              {currentPlan === 'Pro' && (
                <span className="text-[10px] tracking-wider uppercase font-bold text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-400/30 flex items-center gap-1 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                  <Gem className="w-3 h-3 text-cyan-400" />
                  Pro
                </span>
              )}
              {currentPlan === 'Super' && (
                <span className="text-[10px] tracking-wider uppercase font-extrabold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-md border border-amber-400/30 flex items-center gap-1 shadow-[0_0_12px_rgba(245,158,11,0.25)]">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  Super
                </span>
              )}
            </div>
          </div>
        </div>

        {/* SISI KANAN: STATUS SINKRON WEBSOCKET & MASUK/DAFTAR */}
        <div className="flex items-center gap-2">
          <div 
            title={isConnected ? 'Realtime WebSocket Aktif' : 'Menghubungkan ke Realtime...'}
            className="flex items-center gap-1 px-2 py-1 rounded-xl bg-white/[0.03] border border-white/[0.06]"
          >
            {isConnected ? (
              <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-rose-400" />
            )}
            <span className="text-[9px] font-mono text-slate-400 hidden sm:inline">
              {isConnected ? 'LIVE' : 'OFFLINE'}
            </span>
          </div>

          <button
            onClick={() => { setAuthMode('login'); setIsAuthModalOpen(true); }}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-2xl bg-white/[0.03] hover:bg-violet-500/10 border border-white/[0.08] hover:border-violet-500/30 text-slate-300 hover:text-violet-300 backdrop-blur-xl transition-all duration-200 active:scale-95 flex items-center gap-1.5 shadow-sm"
          >
            <LogIn className="w-3.5 h-3.5 text-violet-400" />
            <span>Masuk / Daftar</span>
          </button>
        </div>
      </header>

      {/* Hero Description */}
      <div className="w-full max-w-md md:max-w-2xl text-center my-4 px-2 flex flex-col items-center">
        <div className="inline-block px-3 py-1 rounded-full bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-2 shadow-[0_0_12px_rgba(16,185,129,0.1)]">
          Papan Promosi Komunitas Digital
        </div>
        <p className="text-slate-400 text-xs md:text-sm leading-relaxed mb-2.5">
          Pasang banner kreasi Anda, sesuaikan grid fleksibel, dan hubungkan media sosial secara langsung.
        </p>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0c121d]/90 border border-emerald-500/20 shadow-[0_0_14px_rgba(16,185,129,0.1)] backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[11px] font-mono font-medium text-emerald-400">
            Slot {isOccupied ? totalSlotsUsed : '0'}/100
          </span>
        </div>
      </div>

      {/* Grid Canvas Wrapper */}
      <div className="w-full max-w-md md:max-w-3xl lg:max-w-5xl bg-[#090e17]/70 border border-white/[0.06] rounded-3xl p-3 md:p-5 shadow-2xl backdrop-blur-2xl relative">
        <div className="grid grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-2 md:gap-3 auto-rows-[64px] md:auto-rows-[76px] relative">
          
          {/* BANNER UTAMA */}
          {isOccupied ? (
            <div
              style={{
                gridColumn: `span ${colSpan}`,
                gridRow: `span ${rowSpan}`,
              }}
              className={`relative rounded-2xl flex flex-col justify-between overflow-hidden transition-all duration-300 border border-emerald-500/30 bg-gradient-to-br from-[#101726]/90 to-[#0a0f1a]/95 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] group ${
                rowSpan === 1 ? 'p-1' : 'p-1.5'
              }`}
            >
              <span className={`absolute top-1 left-1 z-20 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-md border border-white/[0.08] font-mono text-emerald-400 ${
                rowSpan === 1 ? 'text-[7px]' : 'text-[9px]'
              }`}>
                {colSpan}x{rowSpan} ({totalSlotsUsed} Slot)
              </span>

              <button
                onClick={() => setIsModalOpen(true)}
                className={`absolute top-1 right-1 z-20 rounded-full bg-white/[0.08] hover:bg-white/[0.16] active:scale-90 flex items-center justify-center text-slate-200 border border-white/[0.08] transition-transform ${
                  rowSpan === 1 ? 'w-4 h-4' : 'w-6 h-6'
                }`}
              >
                <Edit3 className={rowSpan === 1 ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
              </button>

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
                  <div className="flex flex-col items-center justify-center text-slate-500 gap-0.5 p-1">
                    <span className={rowSpan === 1 ? 'text-[8px]' : 'text-xs'}>Preview Media</span>
                  </div>
                )}
              </div>

              {/* Bawah Banner */}
              <div className={`w-full flex flex-col items-center justify-center ${rowSpan === 1 ? 'pt-0.5 pb-0' : 'pt-1.5 pb-0.5 px-1'}`}>
                <div className="flex items-center justify-center gap-1.5 max-w-full overflow-hidden">
                  {rowSpan > 1 && (
                    <img 
                      src={userProfile.avatar} 
                      alt="Avatar" 
                      className={`rounded-full object-cover border border-white/[0.1] shrink-0 ${colSpan === 1 ? 'w-2.5 h-2.5' : 'w-4 h-4'}`}
                    />
                  )}
                  <span 
                    style={{ fontFamily: bannerData.brandFont ? bannerData.brandFont : 'inherit' }}
                    className={`text-center font-bold tracking-tight truncate max-w-full ${
                      rowSpan === 1 ? 'text-[11px] leading-tight text-emerald-400' : colSpan === 1 ? 'text-[8px]' : 'text-[12px] md:text-sm text-slate-200'
                    } ${
                      isMotionSuper
                        ? 'bg-gradient-to-r from-emerald-400 via-violet-300 to-amber-300 bg-[length:200%_auto] animate-[shimmer_3s_linear_infinite] bg-clip-text text-transparent'
                        : ''
                    }`}
                  >
                    {bannerData.name}
                  </span>
                </div>

                {/* Plugin Musik Mini */}
                <div 
                  onClick={togglePlayMusic}
                  className={`rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-md flex items-center cursor-pointer hover:bg-white/[0.08] active:scale-95 transition-all ${
                    rowSpan === 1 ? 'mt-0.5 px-2 py-0.5 gap-1.5' : 'mt-1 px-2.5 py-0.5 gap-2'
                  }`}
                >
                  <div className={`flex items-center justify-center text-emerald-400 ${rowSpan === 1 ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'}`}>
                    {bannerData.isPlayingMusic ? (
                      <Pause className="w-2.5 h-2.5 fill-current" />
                    ) : (
                      <Play className="w-2.5 h-2.5 fill-current" />
                    )}
                  </div>

                  <span className={`text-slate-300 truncate font-medium ${rowSpan === 1 ? 'text-[9px] max-w-[90px]' : 'text-[10px] max-w-[110px]'}`}>
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

                {/* Medsos Dinamis */}
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
                        className="w-3.5 h-3.5 rounded-full bg-white/[0.06] hover:bg-emerald-500/20 border border-white/[0.1] text-slate-300 hover:text-emerald-400 flex items-center justify-center transition active:scale-90"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                )}

              </div>

              {/* Handle Resize Sudut */}
              <div
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="absolute -bottom-1 -right-1 w-6 h-6 flex items-center justify-center cursor-nwse-resize z-30 select-none touch-none active:scale-125 transition-transform"
                title="Tarik untuk sesuaikan slot"
              >
                <div className="w-2.5 h-2.5 border-r-2 border-b-2 border-emerald-400/80 rounded-br-sm" />
              </div>
            </div>
          ) : (
            <div
              onClick={() => setIsModalOpen(true)}
              className="rounded-2xl border border-dashed border-emerald-500/30 bg-[#0c121d]/70 hover:bg-[#121c2d]/80 hover:border-emerald-400/50 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 group active:scale-95"
            >
              <Plus className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="text-[9px] text-emerald-400/80 font-mono mt-0.5 font-medium">#1 Buka</span>
            </div>
          )}

          {/* Sisa Grid Slots */}
          {Array.from({ length: Math.max(0, 100 - (isOccupied ? totalSlotsUsed : 1)) }).map((_, i) => {
            const slotNumber = (isOccupied ? totalSlotsUsed : 1) + i + 1;
            return (
              <div
                key={slotNumber}
                onClick={() => setIsModalOpen(true)}
                className="rounded-2xl border border-white/[0.03] bg-[#0b1019]/50 hover:bg-[#111826]/60 hover:border-violet-500/20 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 group active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 text-slate-600 group-hover:text-violet-400 transition-colors" />
                <span className="text-[8px] text-slate-600 group-hover:text-slate-400 font-mono mt-0.5">#{slotNumber}</span>
              </div>
            );
          })}

        </div>
      </div>
      {/* DRAWER MENU UTAMA */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div 
            onClick={() => setIsMenuOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-300"
          />

          <div className="relative w-88 max-w-[90vw] h-full bg-[#0a0f18]/95 backdrop-blur-2xl border-r border-white/[0.08] p-5 flex flex-col justify-between shadow-2xl z-10 animate-[slideRight_0.3s_cubic-bezier(0.16,1,0.3,1)]">
            <div className="flex flex-col gap-4 overflow-y-auto pr-1">
              
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-violet-400" />
                  <span className="font-bold text-sm tracking-wide text-slate-200">Panel Kontrol</span>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-slate-400 hover:text-white transition active:scale-90"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Tab Navigasi */}
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#060910] rounded-2xl border border-white/[0.06]">
                {[
                  { key: 'slots', label: 'Slots' },
                  { key: 'subscription', label: 'Langganan' },
                  { key: 'plugin', label: 'Plugin' },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setActiveTab(item.key)}
                    className={`py-2 px-2 rounded-xl text-[11px] font-semibold transition-all duration-200 active:scale-95 ${
                      activeTab === item.key 
                        ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30 shadow-sm' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* TAB 1: SLOTS */}
              {activeTab === 'slots' && (
                <div className="flex flex-col gap-3 text-left">
                  <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl flex flex-col gap-1.5 shadow-sm">
                    <span className="text-xs font-bold text-slate-200">Status Grid Billboard</span>
                    <span className="text-[11px] text-slate-400">Dimensi Grid: {colSpan} Kolom x {rowSpan} Baris</span>
                    <span className="text-[11px] text-emerald-400 font-medium">Kapasitas: {totalSlotsUsed} Slot {isFreeSlot ? '(Gratis)' : ''}</span>
                  </div>
                  <button
                    onClick={() => { setIsMenuOpen(false); setIsModalOpen(true); }}
                    className="w-full py-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold hover:bg-emerald-500/30 active:scale-95 transition flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Atur / Sewa Slot</span>
                  </button>
                </div>
              )}

              {/* TAB 2: FULL NAVIGASI LANGGANAN */}
              {activeTab === 'subscription' && (
                <div className="flex flex-col gap-3 text-left">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-bold text-slate-300">Tingkat Langganan Akun</span>
                    <span className="text-[10px] text-emerald-400 font-mono font-medium">Status: Motion {currentPlan}</span>
                  </div>
                  
                  {/* 1. Motion Basic */}
                  <div 
                    onClick={() => { 
                      setCurrentPlan('Basic'); 
                      broadcastUpdate(bannerData, colSpan, rowSpan, 'Basic', userProfile);
                    }}
                    className={`p-3.5 rounded-2xl cursor-pointer transition-all duration-300 border backdrop-blur-xl relative ${
                      currentPlan === 'Basic'
                        ? 'bg-gradient-to-br from-slate-800/40 via-slate-900/60 to-black/50 border-slate-500/40 shadow-sm'
                        : 'bg-white/[0.02] border-white/[0.05] hover:border-white/[0.12]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-bold text-slate-200">1. Motion Basic</span>
                      </div>
                      {currentPlan === 'Basic' && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/[0.1] text-slate-200 font-bold border border-white/[0.1]">
                          AKTIF
                        </span>
                      )}
                    </div>
                    <ul className="text-[10px] text-slate-400 mt-2.5 space-y-1 list-disc list-inside leading-relaxed">
                      <li>Badge ProMotion Basic di bilah utama</li>
                      <li>Slot gratis 1x1 permanen</li>
                      <li>Maksimal 2 icon media sosial</li>
                      <li>Pemutar audio lo-fi standar</li>
                    </ul>
                  </div>

                  {/* 2. Motion Pro */}
                  <div 
                    onClick={() => { 
                      setCurrentPlan('Pro'); 
                      broadcastUpdate(bannerData, colSpan, rowSpan, 'Pro', userProfile);
                    }}
                    className={`p-3.5 rounded-2xl cursor-pointer transition-all duration-300 border backdrop-blur-xl relative overflow-hidden ${
                      currentPlan === 'Pro'
                        ? 'bg-gradient-to-br from-cyan-950/30 via-[#0d1627]/70 to-[#0a1120]/80 border-cyan-400/50 shadow-[0_0_24px_rgba(6,182,212,0.18)]'
                        : 'bg-white/[0.02] border-white/[0.05] hover:border-cyan-500/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Gem className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs font-bold text-cyan-300">2. Motion Pro</span>
                      </div>
                      {currentPlan === 'Pro' && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/30">
                          AKTIF
                        </span>
                      )}
                    </div>
                    <ul className="text-[10px] text-slate-300 mt-2.5 space-y-1 list-disc list-inside leading-relaxed">
                      <li>Badge ProMotion Pro dengan aksen kristal</li>
                      <li>Kapasitas hingga 5 icon media sosial</li>
                      <li>Border slot neon cyan-blue dinamis</li>
                      <li>Akses visualizer piringan vinyl audio</li>
                    </ul>
                  </div>

                  {/* 3. Motion Super */}
                  <div 
                    onClick={() => { 
                      setCurrentPlan('Super'); 
                      broadcastUpdate(bannerData, colSpan, rowSpan, 'Super', userProfile);
                    }}
                    className={`p-3.5 rounded-2xl cursor-pointer transition-all duration-300 border backdrop-blur-xl relative overflow-hidden ${
                      currentPlan === 'Super'
                        ? 'bg-gradient-to-br from-amber-950/35 via-[#1b1509]/70 to-[#120e06]/80 border-amber-400/50 shadow-[0_0_28px_rgba(245,158,11,0.22)]'
                        : 'bg-white/[0.02] border-white/[0.05] hover:border-amber-500/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span className="text-xs font-bold text-amber-300">3. Motion Super</span>
                      </div>
                      {currentPlan === 'Super' && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-400/40">
                          AKTIF
                        </span>
                      )}
                    </div>
                    <ul className="text-[10px] text-amber-200/90 mt-2.5 space-y-1 list-disc list-inside leading-relaxed">
                      <li>Badge ProMotion Super emas bersinar penuh</li>
                      <li>Unlimited tautan icon media sosial</li>
                      <li>Animasi teks shimmer gradasi bergerak</li>
                      <li>Efek aura neon glow di icon media sosial</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* TAB 3: PLUGIN */}
              {activeTab === 'plugin' && (
                <div className="flex flex-col gap-3 text-left">
                  <div className="p-4 rounded-3xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-2xl shadow-xl flex flex-col gap-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Music className="w-4 h-4 text-violet-400" />
                        <span className="text-xs font-bold text-slate-200">Audio Latar Belakang</span>
                      </div>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono">
                        Active
                      </span>
                    </div>

                    <input 
                      type="text" 
                      value={bannerData.musicTitle}
                      onChange={(e) => {
                        const updated = { ...bannerData, musicTitle: e.target.value };
                        setBannerData(updated);
                        broadcastUpdate(updated, colSpan, rowSpan, currentPlan, userProfile);
                      }}
                      className="w-full bg-[#060910] border border-white/[0.08] rounded-2xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-violet-500/50 backdrop-blur-md"
                    />

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-slate-400">Gaya Visualizer:</span>
                      <button 
                        onClick={toggleVisualizerType}
                        className="px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-xs font-semibold text-emerald-400 hover:bg-white/[0.08] active:scale-95 transition flex items-center gap-1.5"
                      >
                        {bannerData.musicVisualizerType === 'bars' ? (
                          <>
                            <Sliders className="w-3.5 h-3.5" />
                            <span>Equalizer Bar</span>
                          </>
                        ) : (
                          <>
                            <Disc3 className="w-3.5 h-3.5" />
                            <span>Vinyl Disc</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* POJOK BAWAH DRAWER */}
            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between p-2 rounded-2xl bg-white/[0.02]">
              <div className="flex items-center gap-2.5 truncate">
                <div className="relative shrink-0">
                  <img 
                    src={userProfile.avatar} 
                    alt="Avatar" 
                    className="w-9 h-9 rounded-2xl object-cover border border-white/[0.1] shadow-md" 
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0a0f18]" />
                </div>
                <div className="flex flex-col text-left truncate">
                  <span className="text-xs font-bold text-slate-200 truncate">{userProfile.name}</span>
                  <span className="text-[10px] text-emerald-400 font-mono font-medium">Akun Terdaftar</span>
                </div>
              </div>

              <button
                onClick={() => { setIsMenuOpen(false); setIsProfileModalOpen(true); }}
                className="w-8 h-8 rounded-xl bg-white/[0.04] hover:bg-violet-500/15 border border-white/[0.08] hover:border-violet-500/30 text-slate-400 hover:text-violet-300 flex items-center justify-center transition active:scale-90"
                title="Pengaturan Profil"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL FULL PENGATURAN PROFIL */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fadeIn">
          <div className="w-full max-w-md rounded-[32px] bg-[#0c121d]/95 border border-white/[0.08] p-6 shadow-2xl flex flex-col gap-4 text-left max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-sm font-bold text-slate-200">Pengaturan Profil Pengguna</span>
              </div>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/[0.05] text-slate-400 hover:text-white flex items-center justify-center text-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Foto Profil & Nama Brand */}
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col gap-3">
              <span className="text-xs font-bold text-slate-200">1. Foto Profil & Identitas Brand</span>
              <div className="flex items-center gap-3">
                <label className="relative cursor-pointer group shrink-0">
                  <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleAvatarFileSelect} className="hidden" />
                  <div className="w-12 h-12 rounded-2xl overflow-hidden border border-white/[0.1] shadow-sm relative">
                    <img 
                      src={tempAvatar} 
                      alt="Avatar" 
                      style={{ transform: `scale(${zoomLevel}) rotate(${rotateDeg}deg)` }}
                      className="w-full h-full object-cover transition-transform duration-200"
                    />
                  </div>
                  <span className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 text-[9px] text-white font-medium">
                    Ubah
                  </span>
                </label>
                <div className="flex-1">
                  <label className="text-[10px] text-slate-400 block mb-1">Nama Brand / Profil</label>
                  <input 
                    type="text" 
                    value={tempProfileName}
                    onChange={(e) => {
                      setTempProfileName(e.target.value);
                      triggerAutoSaveTimer();
                    }}
                    className="w-full bg-[#060910] border border-white/[0.08] rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500/50"
                  />
                </div>
              </div>

              {/* Tombol Simpan Otomatis */}
              <div className={`transition-all duration-500 overflow-hidden ${showSaveBtn ? 'max-h-14 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                <button
                  onClick={handleSaveProfile}
                  className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Perubahan Profil</span>
                </button>
              </div>
            </div>

            {/* Custom Font & Musik */}
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col gap-2.5">
              <span className="text-xs font-bold text-slate-200">2. Custom Upload (Font & Musik)</span>
              
              <label className="w-full py-2.5 px-3.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 text-emerald-300 text-xs font-semibold flex items-center justify-between cursor-pointer active:scale-95 transition">
                <div className="flex items-center gap-2">
                  <Type className="w-4 h-4 text-emerald-400" />
                  <span>Upload Font (.ttf/.otf)</span>
                </div>
                <Upload className="w-4 h-4 text-emerald-400" />
                <input type="file" accept=".ttf,.otf" onChange={handleFontUpload} className="hidden" />
              </label>

              <label className="w-full py-2.5 px-3.5 rounded-2xl bg-violet-600/10 hover:bg-violet-600/15 border border-violet-500/20 text-violet-300 text-xs font-semibold flex items-center justify-between cursor-pointer active:scale-95 transition">
                <div className="flex items-center gap-2">
                  <Music className="w-4 h-4 text-violet-400" />
                  <span>Upload Music (.mp3)</span>
                </div>
                <Upload className="w-4 h-4 text-violet-400" />
                <input type="file" accept=".mp3,audio/mpeg" onChange={handleMusicUpload} className="hidden" />
              </label>
            </div>

            {/* Riwayat Banner */}
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-200">Riwayat Banner Anda</span>
              <div className="flex flex-col gap-1.5 max-h-24 overflow-y-auto">
                {uploadedBanners.map((item) => (
                  <div key={item.id} className="p-2 rounded-xl bg-black/40 border border-white/[0.05] flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-300 truncate">{item.name}</span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 text-[9px] font-mono font-bold">
                      {item.size}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={() => {
                localStorage.removeItem('promotion_slot_data_v11');
                setIsOccupied(false);
                setIsProfileModalOpen(false);
              }}
              className="w-full py-2 rounded-xl bg-rose-500/15 border border-rose-500/25 text-rose-300 text-xs font-semibold hover:bg-rose-500/20 active:scale-95 transition flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset Data Billboard</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL MASUK / DAFTAR AKUN */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fadeIn">
          <div className="w-full max-w-xs rounded-[32px] bg-[#0c121d]/95 border border-white/[0.08] p-6 shadow-2xl flex flex-col gap-4 text-left">
            
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <span className="text-sm font-bold text-slate-200">
                {authMode === 'login' ? 'Masuk ke ProMotion' : 'Buat Akun Baru'}
              </span>
              <button
                onClick={() => setIsAuthModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/[0.05] text-slate-400 hover:text-white flex items-center justify-center text-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex p-1 bg-[#060910] rounded-xl border border-white/[0.06]">
              <button
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${authMode === 'login' ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-400'}`}
              >
                Masuk
              </button>
              <button
                onClick={() => setAuthMode('register')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${authMode === 'register' ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-400'}`}
              >
                Daftar
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Email / Username</label>
                <input 
                  type="text" 
                  placeholder="nama@domain.com"
                  className="w-full bg-[#060910] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500/50"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Kata Sandi</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full bg-[#060910] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500/50"
                />
              </div>

              <button
                onClick={() => {
                  alert(authMode === 'login' ? 'Berhasil Masuk!' : 'Akun berhasil terdaftar!');
                  setIsAuthModalOpen(false);
                }}
                className="w-full mt-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition shadow-lg active:scale-95"
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
          <div className="w-full max-w-xs rounded-[32px] bg-[#0c121d]/95 border border-white/[0.08] p-5 shadow-2xl flex flex-col items-center gap-4 text-center">
            <span className="text-sm font-bold text-slate-200">Sesuaikan Foto Profil</span>
            
            <div className="w-40 h-40 rounded-full border-2 border-emerald-500/50 overflow-hidden relative flex items-center justify-center bg-black/50 shadow-inner">
              <img
                src={rawAvatarImage}
                alt="Crop Preview"
                style={{ transform: `scale(${zoomLevel}) rotate(${rotateDeg}deg)` }}
                className="w-full h-full object-cover transition-transform duration-100"
              />
            </div>

            <div className="w-full flex items-center gap-2 px-2">
              <span className="text-[10px] text-slate-400 font-medium">Zoom</span>
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
                className="px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-xs text-slate-300 hover:text-white active:scale-95 transition flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Putar ↺</span>
              </button>
              <button
                type="button"
                onClick={() => setRotateDeg((prev) => prev + 90)}
                className="px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-xs text-slate-300 hover:text-white active:scale-95 transition flex items-center gap-1"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Putar ↻</span>
              </button>
            </div>

            <div className="flex items-center gap-2 w-full mt-2">
              <button
                type="button"
                onClick={() => setCropModalOpen(false)}
                className="flex-1 py-2 rounded-xl bg-white/[0.05] text-slate-300 text-xs font-semibold active:scale-95 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmCrop}
                className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center justify-center gap-1 active:scale-95 transition shadow-lg"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Terapkan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH IKON MEDSOS (+) */}
      {isAddSocialOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-xs rounded-[32px] bg-[#0c121d]/95 border border-white/[0.08] p-5 shadow-2xl flex flex-col gap-3.5 text-left">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-200">+ Tambah Medsos</span>
              <button 
                onClick={() => setIsAddSocialOpen(false)}
                className="w-7 h-7 rounded-full bg-white/[0.05] text-slate-400 hover:text-white flex items-center justify-center text-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-slate-400">
              Paket <b>Motion {currentPlan}</b>: maksimal {getMaxSocials() === 999 ? 'Unlimited' : `${getMaxSocials()} tautan`}.
            </p>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Unggah Ikon Medsos (PNG/JPG/WebP)</label>
              <label className="w-full border border-dashed border-white/[0.1] hover:border-emerald-500/40 rounded-2xl py-2.5 px-3 flex items-center justify-center gap-2 cursor-pointer bg-[#060910] transition">
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
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Pilih File Ikon</span>
                  </span>
                )}
              </label>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Tautan URL Medsos</label>
              <input
                type="url"
                value={newSocialUrl}
                onChange={(e) => setNewSocialUrl(e.target.value)}
                placeholder="https://tiktok.com/@akun"
                className="w-full bg-[#060910] border border-white/[0.08] rounded-2xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
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
          <div className="w-full max-w-sm rounded-[32px] bg-[#0c121d]/95 backdrop-blur-2xl border border-white/[0.08] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex flex-col gap-3.5 text-left relative transition-all duration-300 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold text-sm">+ Konfigurasi Banner</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                  isFreeSlot 
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' 
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}>
                  {isFreeSlot ? '1 Slot Gratis' : `Rp ${totalPrice.toLocaleString('id-ID')}`}
                </span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-emerald-500 text-black flex items-center justify-center font-bold text-sm hover:scale-105 active:scale-95 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">Nama Brand / Produk</label>
              <input
                type="text"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                placeholder="Contoh: Anak Programmer Indonesia"
                className="w-full bg-[#060910] border border-white/[0.08] rounded-2xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-slate-400 font-medium">Aspek Rasio Grid</label>
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
                        ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 shadow-sm'
                        : 'bg-[#060910] border border-white/[0.05] text-slate-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">Media Visual (Gambar)</label>
              <label className="w-full border border-dashed border-white/[0.1] hover:border-emerald-500/40 rounded-2xl py-3 px-2 flex flex-col items-center justify-center cursor-pointer bg-[#060910] transition relative overflow-hidden">
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
                    <Upload className="w-5 h-5 text-emerald-400 mb-1" />
                    <span className="text-xs text-slate-300 font-medium">
                      {inputImage ? '✓ Media Terpilih (Klik Ganti)' : 'Pilih File Gambar'}
                    </span>
                  </>
                )}
              </label>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">Tautan Tujuan Banner</label>
              <input
                type="url"
                value={inputLink}
                onChange={(e) => setInputLink(e.target.value)}
                placeholder="https://linktujuan.com"
                className="w-full bg-[#060910] border border-white/[0.08] rounded-2xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <button
              onClick={handleProceedRent}
              className="w-full mt-2 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs tracking-wide shadow-[0_4px_16px_rgba(16,185,129,0.3)] transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
            >
              <span>{isFreeSlot ? 'Pasang Sekarang (1 Slot Gratis)' : `Bayar Rp ${totalPrice.toLocaleString('id-ID')} & Pasang`}</span>
            </button>
          </div>
        </div>
      )}

      {/* POPUP BAYAR QRIS */}
      {isPaymentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg animate-fadeIn">
          <div className="w-full max-w-xs rounded-[32px] bg-[#0c121d]/95 border border-white/[0.08] p-5 shadow-2xl flex flex-col items-center text-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CreditCard className="w-6 h-6" />
            </div>

            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-200">Konfirmasi Sewa Slot</span>
              <span className="text-xs text-slate-400 mt-1">Total {totalSlotsUsed} Slot (1 Slot Gratis + {totalSlotsUsed - 1} Slot Berbayar)</span>
              <span className="text-lg font-extrabold text-emerald-400 mt-2 font-mono">
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

            <span className="text-[10px] text-slate-500">Scan QRIS instan atau klik konfirmasi</span>

            <div className="flex gap-2 w-full mt-1">
              <button
                onClick={() => setIsPaymentOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 text-xs font-semibold active:scale-95 transition"
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
