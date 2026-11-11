import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import {
  Save,
  Upload,
  Music,
  Type,
  Trash2,
  Gem,
  Sparkles,
  ShieldCheck,
  Layers,
  Disc3,
  Sliders,
  Wifi,
  WifiOff,
  ExternalLink,
  Plus,
  Play,
  Pause,
  Edit2,
  X,
  Volume2,
  Video,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const SOCKET_URL = 'https://promotion-backend-production.up.railway.app';
const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  reconnectionAttempts: 5,
});

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [currentPlan, setCurrentPlan] = useState('Pro'); // 'Basic' | 'Pro' | 'Super'
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('slots'); // 'slots' | 'langganan' | 'plugin'

  // Profile States
  const [userProfile, setUserProfile] = useState({
    name: 'Anak Programmer Indonesia',
    handle: '@anakprogrammer',
    avatar: 'https://cdn-icons-png.flaticon.com/512/3670/3670157.png',
  });
  const [tempProfileName, setTempProfileName] = useState(userProfile.name);
  const [tempAvatar, setTempAvatar] = useState(userProfile.avatar);
  const [showSaveBtn, setShowSaveBtn] = useState(false);
  const saveTimerRef = useRef(null);

  // Social Links
  const [socials, setSocials] = useState([
    { id: 1, name: 'TikTok', url: 'https://tiktok.com/@anakprogrammer' },
    { id: 2, name: 'Discord', url: 'https://discord.gg/anakprogrammer' },
    { id: 3, name: 'WhatsApp', url: 'https://chat.whatsapp.com' }
  ]);
  const [isAddSocialOpen, setIsAddSocialOpen] = useState(false);
  const [newSocialName, setNewSocialName] = useState('');
  const [newSocialUrl, setNewSocialUrl] = useState('');

  // Audio State
  const [musicTitle, setMusicTitle] = useState('iphone-circles');
  const [musicFile, setMusicFile] = useState(null);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const audioRef = useRef(null);

  // Custom Font
  const [brandFont, setBrandFont] = useState('');
  const [fontName, setFontName] = useState('');

  // Billboard & Banner State
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [bannerBrandName, setBannerBrandName] = useState('Anak Programmer Indonesia');
  const [bannerRatio, setBannerRatio] = useState('5:1'); // '1:1', '5:1', '2:2', '9:16', '16:9'
  const [bannerMedia, setBannerMedia] = useState(null); // URL / Base64
  const [mediaType, setMediaType] = useState('image'); // 'image' | 'video' | 'gif'
  const [bannerLink, setBannerLink] = useState('https://linktujuan.com');
  const [mediaDurationError, setMediaDurationError] = useState('');

  // 1000 Slots Data Array
  const TOTAL_SLOTS = 1000;
  const [slotsData, setSlotsData] = useState(() => {
    const arr = Array.from({ length: TOTAL_SLOTS }, (_, i) => ({
      id: i + 1,
      filled: false,
      brandName: '',
      media: null,
      mediaType: 'image',
      link: '',
      ratio: '1:1',
      musicTitle: 'iphone-circles',
      tier: 'Basic'
    }));
    // Default slot #1 aktif terisi
    arr[0] = {
      id: 1,
      filled: true,
      brandName: 'Anak Programmer Indonesia',
      media: null,
      mediaType: 'image',
      link: 'https://linktujuan.com',
      ratio: '5:1',
      musicTitle: 'iphone-circles',
      tier: 'Pro'
    };
    return arr;
  });

  // Socket Synchronization
  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('get_billboard');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('billboard_data', (data) => {
      if (!data) return;
      if (data.currentPlan) setCurrentPlan(data.currentPlan);
      if (data.userProfile) {
        setUserProfile(data.userProfile);
        setTempProfileName(data.userProfile.name);
        setTempAvatar(data.userProfile.avatar);
      }
      if (data.slotsData) setSlotsData(data.slotsData);
      if (data.brandFont) {
        setBrandFont(data.brandFont);
        applyCustomFont(data.brandFont);
      }
      if (data.socials) setSocials(data.socials);
      if (data.musicTitle) setMusicTitle(data.musicTitle);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('billboard_data');
    };
  }, []);

  const broadcastUpdate = (patch) => {
    socket.emit('update_billboard', patch);
  };

  const applyCustomFont = (fontBase64) => {
    if (!fontBase64) return;
    let styleTag = document.getElementById('custom-brand-font');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'custom-brand-font';
      document.head.appendChild(styleTag);
    }
    styleTag.innerHTML = `
      @font-face {
        font-family: 'UploadedBrandFont';
        src: url(${fontBase64});
      }
      .font-brand {
        font-family: 'UploadedBrandFont', sans-serif !important;
      }
    `;
    setFontName('UploadedBrandFont');
  };

  // Validasi Limit Durasi Video Sesuai Tier
  const handleMediaUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setMediaDurationError('');

    const isVid = file.type.startsWith('video/');
    const isGif = file.type === 'image/gif' || file.name.endsWith('.gif');

    if (isVid) {
      const videoElement = document.createElement('video');
      videoElement.preload = 'metadata';
      videoElement.src = URL.createObjectURL(file);

      videoElement.onloadedmetadata = () => {
        window.URL.revokeObjectURL(videoElement.src);
        const durationSec = videoElement.duration;

        // Aturan Durasi:
        // Basic: max 2 Menit (120 detik)
        // Motion Pro: max 10 Menit (600 detik)
        // Motion Super: Unlimited
        if (currentPlan === 'Basic' && durationSec > 120) {
          setMediaDurationError('Durasi video melebihi 2 menit! Upgrade ke Motion Pro (10 menit) atau Motion Super (Unlimited).');
          return;
        }
        if (currentPlan === 'Pro' && durationSec > 600) {
          setMediaDurationError('Durasi video melebihi 10 menit! Upgrade ke Motion Super untuk durasi tanpa batas.');
          return;
        }

        const reader = new FileReader();
        reader.onload = (ev) => {
          setBannerMedia(ev.target.result);
          setMediaType('video');
        };
        reader.readAsDataURL(file);
      };
    } else {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setBannerMedia(ev.target.result);
        setMediaType(isGif ? 'gif' : 'image');
      };
      reader.readAsDataURL(file);
    }
  };

  const saveSlotConfiguration = () => {
    if (selectedSlotIndex === null) return;
    const updated = [...slotsData];
    updated[selectedSlotIndex] = {
      ...updated[selectedSlotIndex],
      filled: true,
      brandName: bannerBrandName,
      media: bannerMedia,
      mediaType: mediaType,
      link: bannerLink,
      ratio: bannerRatio,
      musicTitle: musicTitle,
      tier: currentPlan
    };
    setSlotsData(updated);
    setIsConfigModalOpen(false);
    broadcastUpdate({ slotsData: updated });
  };
  return (
    <div className="min-h-screen bg-[#070b12] text-zinc-100 flex flex-col items-center selection:bg-emerald-500 selection:text-black overflow-x-hidden">
      {/* Dynamic Keyframe Animations for Pro & Super */}
      <style>{`
        @keyframes sweepLight {
          0% { transform: translateX(-150%) skewX(-20deg); }
          50% { transform: translateX(150%) skewX(-20deg); }
          100% { transform: translateX(150%) skewX(-20deg); }
        }
        .pro-sweep-anim {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.35), rgba(168, 85, 247, 0.4), transparent);
          animation: sweepLight 3.5s infinite ease-in-out;
          pointer-events: none;
        }
        @keyframes superGlowPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(234, 179, 8, 0.3), inset 0 0 15px rgba(234, 179, 8, 0.2); }
          50% { box-shadow: 0 0 35px rgba(250, 204, 21, 0.6), inset 0 0 25px rgba(250, 204, 21, 0.4); }
        }
        .super-gold-card {
          background: radial-gradient(circle at top right, rgba(234, 179, 8, 0.18), rgba(20, 16, 7, 0.85) 75%), #0c0a06;
          border: 1.5px solid rgba(250, 204, 21, 0.6);
          animation: superGlowPulse 4s infinite ease-in-out;
        }
      `}</style>

      {/* Top Navbar */}
      <header className="w-full max-w-xl flex items-center justify-between py-4 px-4 sticky top-0 z-40 bg-[#070b12]/80 backdrop-blur-md border-b border-zinc-900/60">
        <button 
          onClick={() => setIsMenuOpen(true)}
          className="p-2.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-zinc-300 hover:text-white"
        >
          <Sliders className="w-5 h-5" />
        </button>

        {/* Brand Pill */}
        <div className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl border transition-all ${
          currentPlan === 'Super'
            ? 'super-gold-card'
            : currentPlan === 'Pro'
            ? 'bg-zinc-900/90 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
            : 'bg-zinc-900/90 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
        }`}>
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs ${
            currentPlan === 'Super' ? 'bg-amber-400 text-zinc-950' : 'bg-emerald-500 text-black'
          }`}>
            P
          </div>
          <span className="font-extrabold text-sm tracking-wide text-white">ProMotion</span>
          
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
            currentPlan === 'Super' 
              ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40' 
              : currentPlan === 'Pro'
              ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40'
              : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
          }`}>
            {currentPlan === 'Super' ? <Gem className="w-3 h-3 text-amber-400" /> : <Sparkles className="w-3 h-3 text-cyan-400" />}
            {currentPlan.toUpperCase()}
          </span>
        </div>

        {/* Live Indicator */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
          isConnected ? 'bg-emerald-950/70 text-emerald-400 border-emerald-500/40' : 'bg-rose-950/70 text-rose-400 border-rose-500/40'
        }`}>
          {isConnected ? <Wifi className="w-3.5 h-3.5 animate-pulse" /> : <WifiOff className="w-3.5 h-3.5" />}
          <span>{isConnected ? 'LIVE' : 'OFFLINE'}</span>
        </div>
      </header>

      {/* Hero Description */}
      <div className="w-full max-w-xl text-center px-4 pt-6 pb-4">
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/50 text-emerald-400 border border-emerald-500/30">
          Papan Promosi Komunitas Digital
        </span>
        <p className="text-xs text-zinc-400 mt-2 max-w-md mx-auto leading-relaxed">
          Pasang banner kreasi Anda, sesuaikan grid fleksibel, dan hubungkan media interaktif secara langsung.
        </p>
        <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-zinc-900/60 px-3 py-1 rounded-full border border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          Slot 1/{TOTAL_SLOTS}
        </div>
      </div>

      {/* Grid Canvas 1000 Slots - Memanjang, Melebar, & Smooth Scrollable */}
      <div className="w-full max-w-4xl px-3 my-4">
        <div className="relative w-full rounded-3xl bg-[#0c1017]/90 border border-zinc-800/80 p-4 shadow-2xl backdrop-blur-2xl">
          {/* Scroll Area */}
          <div className="overflow-x-auto overflow-y-auto max-h-[650px] p-2 rounded-2xl scrollbar-thin scrollbar-thumb-zinc-700 scroll-smooth">
            <div 
              className="grid gap-3 min-w-[700px]"
              style={{
                gridTemplateColumns: 'repeat(5, minmax(130px, 1fr))',
              }}
            >
              {slotsData.map((slot, idx) => {
                const isPro = slot.tier === 'Pro';
                const isSuper = slot.tier === 'Super';

                return (
                  <div
                    key={slot.id}
                    onClick={() => {
                      setSelectedSlotIndex(idx);
                      setBannerBrandName(slot.brandName || userProfile.name);
                      setBannerLink(slot.link || 'https://linktujuan.com');
                      setBannerRatio(slot.ratio || '5:1');
                      setBannerMedia(slot.media || null);
                      setMediaType(slot.mediaType || 'image');
                      setIsConfigModalOpen(true);
                    }}
                    className={`relative group rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 min-h-[120px] p-3 overflow-hidden select-none ${
                      slot.filled
                        ? isSuper 
                          ? 'super-gold-card'
                          : isPro
                          ? 'bg-zinc-900 border-2 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                          : 'bg-zinc-900 border border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                        : 'bg-[#121620]/70 border border-zinc-800/70 hover:border-zinc-700 hover:bg-zinc-800/40'
                    }`}
                  >
                    {/* Sweep Light Animation for Pro */}
                    {slot.filled && isPro && <div className="pro-sweep-anim" />}

                    {slot.filled ? (
                      <div className="w-full h-full flex flex-col items-center justify-between text-center relative z-10">
                        {/* Header Slot Tag */}
                        <div className="w-full flex items-center justify-between text-[10px] text-zinc-400 mb-1">
                          <span className="font-semibold text-emerald-400">{slot.ratio}</span>
                          <Edit2 className="w-3 h-3 text-zinc-400 opacity-60 group-hover:opacity-100" />
                        </div>

                        {/* Visual Media Center Slot */}
                        <div className="w-full flex-1 flex items-center justify-center my-1 rounded-xl overflow-hidden bg-black/40 min-h-[50px]">
                          {slot.media ? (
                            slot.mediaType === 'video' ? (
                              <video src={slot.media} autoPlay loop muted playsInline className="w-full h-full object-cover max-h-[70px]" />
                            ) : (
                              <img src={slot.media} alt="Slot Visual" className="w-full h-full object-cover max-h-[70px]" />
                            )
                          ) : (
                            <span className="text-xs font-bold text-emerald-400 px-1 truncate max-w-[110px] font-brand">
                              {slot.brandName || 'ProMotion'}
                            </span>
                          )}
                        </div>

                        {/* Bottom Track Title */}
                        <div className="text-[10px] text-zinc-400 truncate max-w-full flex items-center gap-1">
                          <Disc3 className="w-2.5 h-2.5 text-zinc-500" />
                          <span>{slot.musicTitle}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-1 text-zinc-600 group-hover:text-zinc-400">
                        <Plus className="w-5 h-5 transition-transform group-hover:scale-125" />
                        <span className="text-[10px] font-mono">#{slot.id}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      {/* Modal Konfigurasi Banner */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#0e121a] border border-zinc-800 p-6 flex flex-col gap-4 shadow-2xl relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-emerald-400">+ Konfigurasi Banner</span>
                <span className="text-[10px] font-semibold bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Slot #{selectedSlotIndex !== null ? selectedSlotIndex + 1 : 1}
                </span>
              </div>
              <button 
                onClick={() => setIsConfigModalOpen(false)}
                className="w-7 h-7 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center transition-transform hover:scale-110"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Nama Brand */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-300">Nama Brand / Produk</label>
              <input 
                type="text" 
                value={bannerBrandName} 
                onChange={(e) => setBannerBrandName(e.target.value)}
                placeholder="Contoh: Anak Programmer Indonesia"
                className="w-full bg-[#141923] border border-zinc-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            {/* Aspek Rasio Grid */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-zinc-300">Aspek Rasio Grid</span>
                <span className="text-emerald-400 text-[11px]">Pilihan Bebas</span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {['1:1', '5:1', '2x2', '9:16', '16:9'].map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setBannerRatio(ratio)}
                    className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
                      bannerRatio === ratio 
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30' 
                        : 'bg-[#141923] text-zinc-400 hover:text-white border border-zinc-800'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            {/* Media Visual Upload & Dynamic Moving Preview */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-300">Media Visual (Gambar / GIF / Video)</label>
              
              {/* Box Pratinjau Bergerak */}
              {bannerMedia ? (
                <div className="relative w-full h-36 rounded-2xl overflow-hidden border border-emerald-500/40 bg-black flex items-center justify-center group">
                  {mediaType === 'video' ? (
                    <video 
                      src={bannerMedia} 
                      autoPlay 
                      loop 
                      muted 
                      playsInline 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <img 
                      src={bannerMedia} 
                      alt="Pratinjau Media Bergerak" 
                      className="w-full h-full object-contain"
                    />
                  )}
                  
                  {/* Overlay Ganti Media */}
                  <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-xs font-semibold text-white cursor-pointer transition-opacity">
                    <Upload className="w-5 h-5 mb-1 text-emerald-400" />
                    <span>Klik untuk Mengganti Media</span>
                    <input type="file" accept="image/*,video/*,.gif" onChange={handleMediaUpload} className="hidden" />
                  </label>
                </div>
              ) : (
                <label className="w-full py-5 rounded-2xl bg-[#141923] border border-dashed border-zinc-700 hover:border-emerald-500/60 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all">
                  <Upload className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-medium text-zinc-300">Upload Media Visual</span>
                  <span className="text-[10px] text-zinc-500">Mendukung Gambar, GIF bergerak, & Video</span>
                  <input type="file" accept="image/*,video/*,.gif" onChange={handleMediaUpload} className="hidden" />
                </label>
              )}

              {/* Error Limit Durasi Video */}
              {mediaDurationError && (
                <div className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-950/40 border border-rose-800/40 px-3 py-1.5 rounded-xl">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{mediaDurationError}</span>
                </div>
              )}
            </div>

            {/* Tautan Tujuan */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-300">Tautan Tujuan Banner</label>
              <input 
                type="text" 
                value={bannerLink} 
                onChange={(e) => setBannerLink(e.target.value)}
                placeholder="https://linktujuan.com"
                className="w-full bg-[#141923] border border-zinc-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            {/* Tombol Simpan */}
            <button 
              onClick={saveSlotConfiguration}
              className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition-transform active:scale-95 shadow-lg shadow-emerald-500/20"
            >
              Pasang Sekarang (Aktif Real-time)
            </button>
          </div>
        </div>
      )}

      {/* Drawer Kontrol & Pengaturan (TULISAN PUSAT KONTROL TELAH DIHAPUS) */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-sm h-full bg-[#0c1017] border-l border-zinc-800 p-5 flex flex-col gap-5 overflow-y-auto">
            {/* Header Bersih: Hanya Tombol Close */}
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800/60">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Pengaturan</span>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="p-1.5 rounded-full bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigasi Tab */}
            <div className="grid grid-cols-3 gap-2 bg-[#121620] p-1 rounded-2xl border border-zinc-800">
              {['slots', 'langganan', 'plugin'].map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                    activeTab === t ? 'bg-zinc-800 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Konten Tab Langganan */}
            {activeTab === 'langganan' && (
              <div className="flex flex-col gap-3">
                <span className="text-xs font-bold text-zinc-400">Tingkat Langganan Akun</span>

                {/* Motion Basic */}
                <div 
                  onClick={() => {
                    setCurrentPlan('Basic');
                    broadcastUpdate({ currentPlan: 'Basic' });
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    currentPlan === 'Basic' 
                      ? 'bg-zinc-900 border-emerald-500/50 shadow-md' 
                      : 'bg-[#121620]/60 border-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-zinc-400" /> 1. Motion Basic
                    </span>
                    {currentPlan === 'Basic' && <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded-md font-bold">AKTIF</span>}
                  </div>
                  <ul className="text-[11px] text-zinc-400 space-y-1 list-disc list-inside">
                    <li>Slot banner grid standar</li>
                    <li>Maksimal durasi video 2 menit</li>
                    <li>Maksimal 2 icon media sosial</li>
                  </ul>
                </div>

                {/* Motion Pro (Animasi Cahaya Bergeser / Premium Shimmer) */}
                <div 
                  onClick={() => {
                    setCurrentPlan('Pro');
                    broadcastUpdate({ currentPlan: 'Pro' });
                  }}
                  className={`relative overflow-hidden p-4 rounded-2xl border cursor-pointer transition-all ${
                    currentPlan === 'Pro' 
                      ? 'bg-zinc-900 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]' 
                      : 'bg-[#121620]/60 border-zinc-800'
                  }`}
                >
                  <div className="pro-sweep-anim" />
                  <div className="flex items-center justify-between mb-2 relative z-10">
                    <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-cyan-400" /> 2. Motion Pro
                    </span>
                    {currentPlan === 'Pro' && <span className="text-[10px] bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded-md font-bold">AKTIF</span>}
                  </div>
                  <ul className="text-[11px] text-zinc-400 space-y-1 list-disc list-inside relative z-10">
                    <li>Efek border neon sweep cyan-blue dinamis</li>
                    <li>Durasi video ditingkatkan hingga 10 menit</li>
                    <li>Kapasitas hingga 5 tautan media sosial</li>
                  </ul>
                </div>

                {/* Motion Super (Background Emas & Animasi Cahaya Modern) */}
                <div 
                  onClick={() => {
                    setCurrentPlan('Super');
                    broadcastUpdate({ currentPlan: 'Super' });
                  }}
                  className={`p-4 rounded-2xl cursor-pointer transition-all ${
                    currentPlan === 'Super' 
                      ? 'super-gold-card text-amber-200' 
                      : 'bg-[#121620]/60 border border-zinc-800 text-zinc-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <Gem className="w-4 h-4 text-amber-400" /> 3. Motion Super
                    </span>
                    {currentPlan === 'Super' && <span className="text-[10px] bg-amber-400 text-black px-2 py-0.5 rounded-md font-black">AKTIF</span>}
                  </div>
                  <ul className="text-[11px] text-amber-200/80 space-y-1 list-disc list-inside">
                    <li>Background emas metallic & aura radial pulsasi</li>
                    <li>Video Unlimited (Tanpa Batas Durasi)</li>
                    <li>Unlimited tautan icon media sosial</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Konten Tab Slots & Custom Profile */}
            {activeTab === 'slots' && (
              <div className="flex flex-col gap-4">
                <span className="text-xs font-bold text-zinc-400">Profil & Personalisasi</span>
                <div className="p-3 bg-[#121620] rounded-2xl border border-zinc-800 flex items-center gap-3">
                  <img src={userProfile.avatar} alt="Avatar" className="w-12 h-12 rounded-xl object-cover border border-emerald-500/40" />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-white">{userProfile.name}</p>
                    <p className="text-[10px] text-zinc-400">{userProfile.handle}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
