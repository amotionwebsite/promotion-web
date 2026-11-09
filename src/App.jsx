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
  WifiOff,
  ExternalLink,
  Plus,
  Play,
  Pause,
  Edit2,
  Check,
  X,
  Volume2
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
  const [subscriptionExpiry, setSubscriptionExpiry] = useState(null);

  // State Drawer & Modal Navigasi
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('subscription');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  // State Ukuran Grid Slot - DEFAULT 5x1
  const [colSpan, setColSpan] = useState(5);
  const [rowSpan, setRowSpan] = useState(1);
  const [selectedRatio, setSelectedRatio] = useState('5x1');

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
  const [newSocialIcon, setNewSocialIcon] = useState('Globe');
  const [newSocialUrl, setNewSocialUrl] = useState('');
  const [socials, setSocials] = useState([
    { id: 1, name: 'TikTok', url: 'https://tiktok.com/@anakprogrammer' },
    { id: 2, name: 'Discord', url: 'https://discord.gg/anakprogrammer' },
    { id: 3, name: 'WhatsApp', url: 'https://chat.whatsapp.com' }
  ]);

  // State Banner & Media Custom
  const [bannerImage, setBannerImage] = useState(null);
  const [bannerLink, setBannerLink] = useState('https://linktujuankamu.com');
  const [brandFont, setBrandFont] = useState('');
  const [fontName, setFontName] = useState('');
  
  // State Musik & Audio Player
  const [musicTitle, setMusicTitle] = useState('iphone-circles');
  const [musicFile, setMusicFile] = useState(null);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [musicVisualizerType, setMusicVisualizerType] = useState('bars');
  const audioRef = useRef(null);

  // State Statistik
  const [clicks, setClicks] = useState(142);
  const [views, setViews] = useState(1890);

  // Sinkronisasi Socket.io Real-time
  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('get_billboard');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('billboard_data', (data) => {
      if (data) {
        if (data.colSpan) setColSpan(data.colSpan);
        if (data.rowSpan) setRowSpan(data.rowSpan);
        if (data.currentPlan) setCurrentPlan(data.currentPlan);
        if (data.userProfile) {
          setUserProfile(data.userProfile);
          setTempProfileName(data.userProfile.name);
          setTempAvatar(data.userProfile.avatar);
        }
        if (data.image) setBannerImage(data.image);
        if (data.link) setBannerLink(data.link);
        if (data.brandFont) {
          setBrandFont(data.brandFont);
          applyCustomFont(data.brandFont);
        }
        if (data.musicTitle) setMusicTitle(data.musicTitle);
        if (data.musicFile) setMusicFile(data.musicFile);
        if (data.clicks !== undefined) setClicks(data.clicks);
        if (data.views !== undefined) setViews(data.views);
        if (data.socials) setSocials(data.socials);
      }
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('billboard_data');
    };
  }, []);

  // Pasang custom font secara dinamis ke head HTML
  const applyCustomFont = (fontBase64) => {
    if (!fontBase64) return;
    const styleId = 'custom-brand-font';
    let styleTag = document.getElementById(styleId);
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = styleId;
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

  // Upload Custom Font (.ttf/.otf)
  const handleFontUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Font = event.target.result;
        setBrandFont(base64Font);
        applyCustomFont(base64Font);
        broadcastUpdate({ brandFont: base64Font });
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload Custom Musik (.mp3)
  const handleMusicUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const audioUrl = URL.createObjectURL(file);
      setMusicFile(audioUrl);
      setMusicTitle(file.name.replace(/\.[^/.]+$/, ''));
      broadcastUpdate({ musicTitle: file.name, musicFile: audioUrl });
    }
  };

  // Toggle Musik
  const togglePlayMusic = () => {
    if (!audioRef.current) return;
    if (isPlayingMusic) {
      audioRef.current.pause();
      setIsPlayingMusic(false);
    } else {
      audioRef.current.play();
      setIsPlayingMusic(true);
    }
  };

  // Auto-Save Nama Profil (Timer 5 Detik)
  const handleProfileNameChange = (e) => {
    const val = e.target.value;
    setTempProfileName(val);
    setShowSaveBtn(true);

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveProfile(val, tempAvatar);
    }, 5000);
  };

  // Simpan Profil Manual / Auto
  const saveProfile = (nameToSave = tempProfileName, avatarToSave = tempAvatar) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    const updated = { ...userProfile, name: nameToSave, avatar: avatarToSave };
    setUserProfile(updated);
    setShowSaveBtn(false);
    broadcastUpdate({ userProfile: updated });
  };

  // Broadcast Perubahan via Socket.io
  const broadcastUpdate = (patch) => {
    socket.emit('update_billboard', patch);
  };

  // Ubah Rasio Grid Banner
  const handleRatioChange = (ratio, col, row) => {
    setSelectedRatio(ratio);
    setColSpan(col);
    setRowSpan(row);
    broadcastUpdate({ colSpan: col, rowSpan: row });
  };

  // Ganti Tier Langganan
  const handlePlanSelect = (tier) => {
    setCurrentPlan(tier);
    broadcastUpdate({ currentPlan: tier });
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-zinc-100 flex flex-col items-center p-4 selection:bg-[#7c3aed] selection:text-white">
      {/* Background Glows */}
      <div className="fixed top-[-10%] left-[20%] w-[350px] h-[350px] bg-violet-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[15%] w-[400px] h-[400px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header / Bar */}
      <header className="w-full max-w-md flex items-center justify-between py-4 px-2 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#7c3aed] to-[#3b82f6] flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold tracking-wider text-sm bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
            PROMOTION
          </span>
        </div>

        {/* Live Status Badge */}
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border backdrop-blur-md transition-all ${
            isConnected 
              ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
              : 'bg-rose-950/60 text-rose-400 border-rose-500/30'
          }`}>
            {isConnected ? <Wifi className="w-3 h-3 text-emerald-400 animate-pulse" /> : <WifiOff className="w-3 h-3 text-rose-400" />}
            <span>{isConnected ? 'LIVE' : 'OFFLINE'}</span>
          </div>

          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-300 hover:text-white backdrop-blur-md"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-md flex flex-col gap-5 z-10 pb-20">
        {/* Profile Card */}
        <div className="relative p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl shadow-2xl flex flex-col items-center gap-3">
          <div className="relative group">
            <img 
              src={userProfile.avatar} 
              alt="Avatar" 
              className="w-20 h-20 rounded-2xl object-cover border-2 border-violet-500/40 p-0.5 shadow-lg shadow-violet-500/20"
            />
            <button 
              onClick={() => setCropModalOpen(true)}
              className="absolute bottom-[-4px] right-[-4px] p-1.5 rounded-lg bg-violet-600 text-white shadow-md hover:bg-violet-500"
            >
              <Edit2 className="w-3 h-3" />
            </button>
          </div>

          <div className="w-full text-center flex flex-col items-center">
            <input 
              type="text" 
              value={tempProfileName}
              onChange={handleProfileNameChange}
              className={`text-center font-bold text-lg bg-transparent border-b border-transparent hover:border-zinc-700 focus:border-violet-500 focus:outline-none transition-all px-2 py-0.5 ${fontName ? 'font-brand' : ''}`}
            />
            <p className="text-xs text-zinc-400">{userProfile.handle}</p>

            {showSaveBtn && (
              <button 
                onClick={() => saveProfile()}
                className="mt-2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-600 hover:bg-violet-500 text-xs font-medium text-white transition-all shadow-md shadow-violet-600/30"
              >
                <Save className="w-3 h-3" /> Simpan Sekarang
              </button>
            )}
          </div>

          {/* Social Links Badge */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
            {socials.map((s) => (
              <a 
                key={s.id} 
                href={s.url} 
                target="_blank" 
                rel="noreferrer"
                className="px-3 py-1 rounded-xl bg-zinc-800/80 border border-zinc-700/60 text-xs text-zinc-300 hover:text-violet-300 hover:border-violet-500/50 flex items-center gap-1.5 transition-all"
              >
                {s.name} <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            ))}
            <button 
              onClick={() => setIsAddSocialOpen(true)}
              className="p-1 rounded-xl bg-zinc-800/50 border border-dashed border-zinc-700 text-zinc-400 hover:text-white"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Music Player Bar (With Bars Visualizer) */}
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-950/60 border border-violet-800/50 flex items-center justify-center text-violet-400">
              <Disc3 className={`w-5 h-5 ${isPlayingMusic ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-200 truncate max-w-[150px]">{musicTitle}</p>
              <p className="text-[10px] text-zinc-500">Audio Background</p>
            </div>
          </div>

          {/* Visualizer Bars */}
          <div className="flex items-end gap-1 h-5 px-2">
            {[40, 90, 60, 100, 75, 45].map((h, i) => (
              <span 
                key={i} 
                style={{ height: isPlayingMusic ? `${h}%` : '20%' }}
                className={`w-1 rounded-full bg-violet-500 transition-all duration-300 ${isPlayingMusic ? 'animate-pulse' : 'opacity-30'}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={togglePlayMusic}
              className="w-8 h-8 rounded-lg bg-violet-600 hover:bg-violet-500 flex items-center justify-center text-white shadow-md shadow-violet-600/30"
            >
              {isPlayingMusic ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            <label className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <input type="file" accept="audio/mp3" onChange={handleMusicUpload} className="hidden" />
            </label>
          </div>

          {musicFile && <audio ref={audioRef} src={musicFile} loop />}
        </div>

        {/* Live Billboard Grid Showcase */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
            <span className="font-semibold text-zinc-300">Live Ad Slot ({selectedRatio})</span>
            <span>{views} Views • {clicks} Clicks</span>
          </div>

          <div 
            className="w-full rounded-3xl bg-zinc-900/70 border border-violet-500/30 p-4 backdrop-blur-xl relative overflow-hidden shadow-2xl"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${colSpan}, minmax(0, 1fr))`,
              minHeight: '140px'
            }}
          >
            {/* Slot Content */}
            <div className="col-span-full flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-gradient-to-b from-zinc-800/40 to-zinc-900/60 border border-zinc-700/40">
              <h3 className={`text-base font-bold text-white mb-1 ${fontName ? 'font-brand' : ''}`}>
                {userProfile.name}
              </h3>
              <p className="text-xs text-zinc-400 max-w-xs mb-3">
                Slot Iklan Promosi Interaktif Terintegrasi Real-Time WebSocket.
              </p>
              <a 
                href={bannerLink} 
                target="_blank" 
                rel="noreferrer"
                onClick={() => {
                  setClicks(c => c + 1);
                  broadcastUpdate({ clicks: clicks + 1 });
                }}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-xs font-semibold text-white shadow-lg shadow-violet-600/30 hover:opacity-90 flex items-center gap-1.5"
              >
                Kunjungi Tautan <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Grid Ratio Selector */}
        <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/70 flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-violet-400" /> Grid Slot:
          </span>
          <div className="flex gap-2">
            {[
              { label: '5x1', col: 5, row: 1 },
              { label: '4x2', col: 4, row: 2 },
              { label: '3x3', col: 3, row: 3 }
            ].map((r) => (
              <button
                key={r.label}
                onClick={() => handleRatioChange(r.label, r.col, r.row)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedRatio === r.label 
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Subscription Tier Selection */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold text-zinc-400 px-1">Pilih Paket Langganan</span>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { name: 'Basic', icon: ShieldCheck, color: 'text-zinc-400', border: 'border-zinc-800' },
              { name: 'Pro', icon: Sparkles, color: 'text-blue-400', border: 'border-blue-500/40' },
              { name: 'Super', icon: Gem, color: 'text-violet-400', border: 'border-violet-500/40' }
            ].map((plan) => {
              const Icon = plan.icon;
              const isSelected = currentPlan === plan.name;
              return (
                <div 
                  key={plan.name}
                  onClick={() => handlePlanSelect(plan.name)}
                  className={`p-3 rounded-2xl border backdrop-blur-md cursor-pointer flex flex-col items-center gap-1.5 transition-all ${
                    isSelected 
                      ? 'bg-violet-950/40 border-violet-500 shadow-lg shadow-violet-600/20' 
                      : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${plan.color}`} />
                  <span className="text-xs font-bold text-zinc-200">{plan.name}</span>
                  {isSelected && <span className="text-[9px] text-violet-400 font-medium">Aktif</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom Font Upload Box */}
        <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Type className="w-4 h-4 text-violet-400" />
            <div>
              <p className="text-xs font-medium text-zinc-200">Custom Typography (.ttf / .otf)</p>
              <p className="text-[10px] text-zinc-500">{fontName ? 'Font kustom aktif' : 'Gunakan font brand kamu'}</p>
            </div>
          </div>
          <label className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 cursor-pointer flex items-center gap-1.5">
            <Upload className="w-3 h-3" /> Pilih Font
            <input type="file" accept=".ttf,.otf" onChange={handleFontUpload} className="hidden" />
          </label>
        </div>
      </main>

      {/* Modal Crop Foto Profil */}
      {cropModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-zinc-900 border border-zinc-800 p-5 flex flex-col items-center gap-4">
            <h3 className="text-sm font-bold text-zinc-200">Ubah Foto Profil</h3>
            <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-violet-500/50 flex items-center justify-center overflow-hidden">
              <img 
                src={tempAvatar} 
                alt="Preview" 
                style={{ transform: `scale(${zoomLevel}) rotate(${rotateDeg}deg)` }}
                className="w-full h-full object-cover transition-transform" 
              />
            </div>

            {/* Slider Zoom */}
            <div className="w-full flex flex-col gap-1">
              <label className="text-[11px] text-zinc-400">Zoom: {zoomLevel}x</label>
              <input 
                type="range" min="1" max="2" step="0.1" 
                value={zoomLevel} 
                onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                className="w-full accent-violet-600"
              />
            </div>

            <div className="w-full flex gap-2">
              <label className="flex-1 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-center font-medium cursor-pointer">
                Pilih File
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) setTempAvatar(URL.createObjectURL(file));
                  }} 
                  className="hidden" 
                />
              </label>
              <button 
                onClick={() => {
                  saveProfile(tempProfileName, tempAvatar);
                  setCropModalOpen(false);
                }}
                className="flex-1 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white"
              >
                Terapkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
