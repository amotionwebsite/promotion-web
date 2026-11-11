import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import {
  Menu,
  ChevronLeft,
  X,
  Edit2,
  Plus,
  Play,
  Pause,
  Upload,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Gem,
  Disc3,
  Globe,
  Sliders,
  AlertCircle,
  CheckCircle,
  Volume2
} from 'lucide-react';

const SOCKET_URL = 'https://promotion-backend-production.up.railway.app';
const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  reconnectionAttempts: 5,
});

// Preset Musik Rekomendasi
const RECOMMENDED_TRACKS = [
  { id: 'rec-1', title: 'Cyber City Beats', src: 'https://cdn.freesound.org/previews/612/612081_5674468-lq.mp3' },
  { id: 'rec-2', title: 'Night Lo-Fi Chill', src: 'https://cdn.freesound.org/previews/515/515824_11564757-lq.mp3' },
  { id: 'rec-3', title: 'Neon Electro Vibes', src: 'https://cdn.freesound.org/previews/415/415804_5121236-lq.mp3' }
];

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [isNewUser, setIsNewUser] = useState(true); // Diskon Rp 500 per slot untuk user baru

  // Tier Langganan: 'Basic' | 'Pro' | 'Super'
  const [currentPlan, setCurrentPlan] = useState('Pro');

  // Menu Hamburger & Tab
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('langganan'); // 'slots' | 'langganan' | 'plugin'

  // User Profile
  const [userProfile, setUserProfile] = useState({
    name: 'Anak Programmer Indonesia',
    handle: '@anakprogrammer',
    avatar: 'https://cdn-icons-png.flaticon.com/512/3670/3670157.png',
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(userProfile.name);
  const [editAvatar, setEditAvatar] = useState(userProfile.avatar);

  // Default Medsos List dengan icon bawaan & kustom
  const [socials, setSocials] = useState([
    { id: 1, name: 'TikTok', platform: 'tiktok', url: 'https://tiktok.com/@anakprogrammer', customIcon: null },
    { id: 2, name: 'Discord', platform: 'discord', url: 'https://discord.gg/anakprogrammer', customIcon: null },
    { id: 3, name: 'Instagram', platform: 'instagram', url: 'https://instagram.com', customIcon: null }
  ]);
  const [isAddSocialModal, setIsAddSocialModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('tiktok');
  const [customSocialUrl, setCustomSocialUrl] = useState('');
  const [customSocialIcon, setCustomSocialIcon] = useState(null);

  // Audio & Equalizer States
  const [musicTitle, setMusicTitle] = useState('');
  const [musicSrc, setMusicSrc] = useState(null);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [isSelectMusicOpen, setIsSelectMusicOpen] = useState(false);
  const [hasVideoAudio, setHasVideoAudio] = useState(false);
  const audioRef = useRef(null);

  // 1000 Slots Data Grid
  const TOTAL_SLOTS = 1000;
  const [slotsData, setSlotsData] = useState(() => {
    const list = Array.from({ length: TOTAL_SLOTS }, (_, i) => ({
      id: i + 1,
      filled: false,
      brandName: '',
      media: null,
      mediaType: 'image',
      hasAudio: false,
      link: '',
      ratio: '1:1',
      slotCost: 0,
      musicTitle: '',
      tier: 'Basic'
    }));
    list[0] = {
      id: 1,
      filled: true,
      brandName: 'Anak Programmer Indonesia',
      media: null,
      mediaType: 'image',
      hasAudio: false,
      link: 'https://linktujuan.com',
      ratio: '5:1',
      slotCost: 0,
      musicTitle: '',
      tier: 'Pro'
    };
    return list;
  });

  // Modal Konfigurasi Banner Slot
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [bannerBrandName, setBannerBrandName] = useState('');
  const [bannerRatio, setBannerRatio] = useState('1:1');
  const [bannerMedia, setBannerMedia] = useState(null);
  const [bannerMediaType, setBannerMediaType] = useState('image');
  const [bannerLink, setBannerLink] = useState('');
  const [bannerHasAudio, setBannerHasAudio] = useState(false);
  const [mediaError, setMediaError] = useState('');

  // Socket Connection Listener
  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('get_billboard');
    });
    socket.on('disconnect', () => setIsConnected(false));
    socket.on('billboard_data', (data) => {
      if (!data) return;
      if (data.currentPlan) setCurrentPlan(data.currentPlan);
      if (data.userProfile) setUserProfile(data.userProfile);
      if (data.slotsData) setSlotsData(data.slotsData);
      if (data.socials) setSocials(data.socials);
      if (data.musicTitle) setMusicTitle(data.musicTitle);
      if (data.musicSrc) setMusicSrc(data.musicSrc);
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

  // Helper Hitung Biaya Slot & Rasio
  const getSlotCost = (ratio) => {
    if (currentPlan === 'Super') return 0; // Super unlimited
    let multiplier = 1;
    if (ratio === '5:1') multiplier = 5;
    else if (ratio === '2x2') multiplier = 4;
    else if (ratio === '9:16' || ratio === '16:9') multiplier = 6;

    const basePrice = isNewUser ? 500 : 1000;
    if (currentPlan === 'Basic') {
      return (multiplier - 1) * basePrice; // 1 slot gratis
    }
    // Pro: manipulasi / geser slot bertambah
    return multiplier * basePrice;
  };

  // Filter Audio & Deteksi Durasi Video
  const handleMediaUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setMediaError('');

    const isVid = file.type.startsWith('video/');
    const isGif = file.type === 'image/gif' || file.name.endsWith('.gif');

    if (isVid) {
      const vidObj = document.createElement('video');
      vidObj.preload = 'metadata';
      vidObj.src = URL.createObjectURL(file);

      vidObj.onloadedmetadata = () => {
        window.URL.revokeObjectURL(vidObj.src);
        const duration = vidObj.duration;

        // Limit Durasi
        if (currentPlan === 'Basic' && duration > 120) {
          setMediaError('Durasi video basic maks 2 menit! Upgrade ke Pro atau Super.');
          return;
        }
        if (currentPlan === 'Pro' && duration > 600) {
          setMediaError('Durasi video Pro maks 10 menit! Upgrade ke Super untuk Unlimited.');
          return;
        }

        // Deteksi Audio Stream di Video
        const audioTracks = vidObj.mozHasAudio || Boolean(vidObj.webkitAudioDecodedByteCount) || Boolean(vidObj.audioTracks?.length);
        const hasAudio = audioTracks !== undefined ? true : true; // default true jika video audio aktif
        setBannerHasAudio(hasAudio);
        if (hasAudio) {
          setMusicTitle('');
          setMusicSrc(null);
          setIsPlayingMusic(false);
        }

        const reader = new FileReader();
        reader.onload = (ev) => {
          setBannerMedia(ev.target.result);
          setBannerMediaType('video');
        };
        reader.readAsDataURL(file);
      };
    } else {
      setBannerHasAudio(false);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setBannerMedia(ev.target.result);
        setBannerMediaType(isGif ? 'gif' : 'image');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleToggleMusic = () => {
    if (!audioRef.current || !musicSrc) return;
    if (isPlayingMusic) {
      audioRef.current.pause();
      setIsPlayingMusic(false);
    } else {
      audioRef.current.play();
      setIsPlayingMusic(true);
    }
  };

  const handleSaveProfile = () => {
    const updated = { ...userProfile, name: editName, avatar: editAvatar };
    setUserProfile(updated);
    setIsEditingProfile(false);
    broadcastUpdate({ userProfile: updated });
  };
  return (
    <div className="min-h-screen w-full bg-[#070b12] text-zinc-100 flex flex-col items-center selection:bg-emerald-500 selection:text-black">
      {/* Keyframe Animasi Modern, Sweep Shimmer Pro, & Gold Pulsing Super */}
      <style>{`
        @keyframes proSweep {
          0% { transform: translateX(-150%) skewX(-25deg); }
          50%, 100% { transform: translateX(200%) skewX(-25deg); }
        }
        .pro-sweep-light {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.4), rgba(168, 85, 247, 0.5), transparent);
          animation: proSweep 3s infinite ease-in-out;
          pointer-events: none;
        }
        @keyframes goldPulseGlow {
          0%, 100% { box-shadow: 0 0 25px rgba(234, 179, 8, 0.35), inset 0 0 15px rgba(234, 179, 8, 0.2); }
          50% { box-shadow: 0 0 45px rgba(250, 204, 21, 0.65), inset 0 0 30px rgba(250, 204, 21, 0.45); }
        }
        .super-gold-card {
          background: radial-gradient(circle at top right, rgba(234, 179, 8, 0.22), rgba(20, 16, 7, 0.9) 75%), #0c0a06;
          border: 1.5px solid rgba(250, 204, 21, 0.7);
          animation: goldPulseGlow 3.5s infinite ease-in-out;
        }
        @keyframes eqWave {
          0%, 100% { height: 25%; }
          50% { height: 100%; }
        }
        .eq-bar {
          animation: eqWave 0.8s infinite ease-in-out alternate;
        }
      `}</style>

      {/* Top Header Responsif Desktop & Mobile */}
      <header className="w-full max-w-7xl flex items-center justify-between py-4 px-4 sm:px-8 sticky top-0 z-40 bg-[#070b12]/85 backdrop-blur-xl border-b border-zinc-850">
        {/* Kiri: Hamburger Menu Berputar Menjadi Chevron Back */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-zinc-300 hover:text-white transition-transform duration-300 active:scale-90 flex items-center justify-center"
          >
            {isMenuOpen ? (
              <ChevronLeft className="w-5 h-5 text-emerald-400 rotate-[-180deg] transition-all duration-300" />
            ) : (
              <Menu className="w-5 h-5 transition-all duration-300" />
            )}
          </button>
        </div>

        {/* Tengah: Nama Website (ProMotion) dengan Animasi Bergerak Sesuai Tier */}
        <div className={`relative overflow-hidden flex items-center gap-2.5 px-4 sm:px-6 py-2 rounded-2xl border transition-all ${
          currentPlan === 'Super'
            ? 'super-gold-card'
            : currentPlan === 'Pro'
            ? 'bg-zinc-900 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
            : 'bg-zinc-900 border-emerald-500/50 shadow-md'
        }`}>
          {currentPlan === 'Pro' && <div className="pro-sweep-light" />}
          <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
            currentPlan === 'Super' ? 'bg-amber-400 text-black' : 'bg-emerald-500 text-black'
          }`}>
            P
          </div>
          <span className="font-black text-base sm:text-lg tracking-wider bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            ProMotion
          </span>
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 ${
            currentPlan === 'Super'
              ? 'bg-amber-400/20 text-amber-300 border border-amber-400/50'
              : currentPlan === 'Pro'
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50'
              : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
          }`}>
            {currentPlan === 'Super' ? <Gem className="w-3 h-3 text-amber-400" /> : <Sparkles className="w-3 h-3 text-cyan-400" />}
            {currentPlan.toUpperCase()}
          </span>
        </div>

        {/* Kanan: Status Diganti DAFTAR (Abu-abu) & LOGIN (Hijau Glassmorphism) */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button className="px-3.5 py-1.5 rounded-xl bg-zinc-850/80 hover:bg-zinc-800 text-xs font-semibold text-zinc-400 hover:text-white border border-zinc-700/60 transition-all">
            Daftar
          </button>
          <button className="px-4 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 backdrop-blur-md text-xs font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            Login
          </button>
        </div>
      </header>

      {/* Hero Header */}
      <div className="w-full max-w-4xl text-center px-4 pt-6 pb-2">
        <span className="px-4 py-1 rounded-full text-xs font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 shadow-lg">
          Papan Promosi Komunitas Digital
        </span>
        <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-md mx-auto">
          Pasang banner kreasi Anda, sesuaikan widget grid fleksibel, dan hubungkan media interaktif secara langsung.
        </p>
        <div className="mt-3 inline-flex items-center gap-2 text-xs text-emerald-400 bg-zinc-900/80 px-3 py-1 rounded-full border border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          Slot Aktif: 1/{TOTAL_SLOTS}
        </div>
      </div>

      {/* Layout Grid 1000 Slots - Adaptif Desktop & Mobile */}
      <main className="w-full max-w-7xl px-3 sm:px-6 my-4 flex-1 flex flex-col items-center">
        <div className="relative w-full rounded-3xl bg-[#0b0f17]/95 border border-zinc-800/80 p-3 sm:p-6 shadow-2xl backdrop-blur-xl">
          {/* Scrollable Container dengan Animasi Sentuh Lembut */}
          <div className="overflow-x-auto overflow-y-auto max-h-[680px] p-2 rounded-2xl scrollbar-thin scrollbar-thumb-zinc-700 scroll-smooth">
            <div 
              className="grid gap-3 sm:gap-4 min-w-[750px] sm:min-w-full"
              style={{
                gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))'
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
                      setBannerRatio(slot.ratio || '1:1');
                      setBannerMedia(slot.media || null);
                      setBannerMediaType(slot.mediaType || 'image');
                      setBannerHasAudio(slot.hasAudio || false);
                      setIsConfigModalOpen(true);
                    }}
                    className={`relative group rounded-2xl flex flex-col justify-between cursor-pointer transition-all duration-300 min-h-[135px] p-3 overflow-hidden select-none hover:scale-[1.02] ${
                      slot.filled
                        ? isSuper 
                          ? 'super-gold-card'
                          : isPro
                          ? 'bg-zinc-900 border-2 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                          : 'bg-zinc-900 border border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                        : 'bg-[#121620]/60 border border-zinc-800/70 hover:border-zinc-700 hover:bg-zinc-800/40'
                    }`}
                  >
                    {slot.filled && isPro && <div className="pro-sweep-light" />}

                    {/* Widget Grid Pojok Kanan Atas dengan Animasi Pembesar */}
                    <div className="w-full flex items-center justify-between text-[10px] z-10">
                      <span className="font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/30">
                        {slot.ratio}
                      </span>
                      {/* Widget Hijau Pojok */}
                      <div className="w-4 h-4 rounded-md bg-emerald-500/20 border border-emerald-400 flex items-center justify-center transition-transform duration-300 group-hover:scale-125 shadow-[0_0_8px_rgba(16,185,129,0.6)]">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-sm" />
                      </div>
                    </div>

                    {/* Konten Slot */}
                    {slot.filled ? (
                      <div className="w-full flex-1 flex flex-col items-center justify-center my-1.5 z-10">
                        {slot.media ? (
                          <div className="w-full h-14 rounded-xl overflow-hidden bg-black/60 flex items-center justify-center">
                            {slot.mediaType === 'video' ? (
                              <video src={slot.media} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                            ) : (
                              <img src={slot.media} alt="Slot Visual" className="w-full h-full object-cover" />
                            )}
                          </div>
                        ) : (
                          <span className="text-xs font-black text-emerald-300 text-center truncate max-w-[110px]">
                            {slot.brandName || userProfile.name}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-1 text-zinc-600 group-hover:text-zinc-400 my-auto">
                        <Plus className="w-5 h-5 transition-transform group-hover:scale-125" />
                        <span className="text-[10px] font-mono">#{slot.id}</span>
                      </div>
                    )}

                    {/* Bagian Bawah Banner: Foto Profil, Nama, Equalizer/Music */}
                    {slot.filled && (
                      <div className="w-full flex items-center justify-between pt-1 border-t border-zinc-800/60 z-10">
                        <div className="flex items-center gap-1.5 truncate">
                          <img src={userProfile.avatar} alt="Avatar" className="w-4 h-4 rounded-full object-cover border border-emerald-400/60" />
                          <span className="text-[9px] text-zinc-300 truncate max-w-[65px]">{userProfile.name}</span>
                        </div>
                        {slot.hasAudio ? (
                          <div className="flex items-center gap-0.5 h-3">
                            <span className="w-0.5 bg-emerald-400 rounded-full eq-bar" style={{ animationDelay: '0s' }} />
                            <span className="w-0.5 bg-emerald-400 rounded-full eq-bar" style={{ animationDelay: '0.2s' }} />
                            <span className="w-0.5 bg-emerald-400 rounded-full eq-bar" style={{ animationDelay: '0.4s' }} />
                          </div>
                        ) : (
                          <span className="text-[9px] text-zinc-500">No Audio</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
      {/* Modal Konfigurasi Banner */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#0e121a] border border-zinc-800 p-6 flex flex-col gap-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Header Modal */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-emerald-400">+ Konfigurasi Banner</span>
                <span className="text-[10px] font-bold bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
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
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-zinc-300">Nama Brand / Produk</label>
              <input
                type="text"
                value={bannerBrandName}
                onChange={(e) => setBannerBrandName(e.target.value)}
                placeholder="Contoh: Anak Programmer Indonesia"
                className="w-full bg-[#141923] border border-zinc-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            {/* Aspek Rasio Grid & Biaya */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-zinc-300">Aspek Rasio Grid</span>
                <span className="text-emerald-400 text-[11px] font-bold">
                  Biaya: Rp {getSlotCost(bannerRatio).toLocaleString()}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {['1:1', '5:1', '2x2', '9:16', '16:9'].map((r) => (
                  <button
                    key={r}
                    onClick={() => setBannerRatio(r)}
                    className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
                      bannerRatio === r
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                        : 'bg-[#141923] text-zinc-400 hover:text-white border border-zinc-800'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Media Upload & Pratinjau Bergerak Langsung */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-zinc-300">Media Visual (Gambar / GIF / Video)</label>
              {bannerMedia ? (
                <div className="relative w-full h-36 rounded-2xl overflow-hidden border border-emerald-500/40 bg-black flex items-center justify-center group">
                  {bannerMediaType === 'video' ? (
                    <video src={bannerMedia} autoPlay loop muted playsInline className="w-full h-full object-contain" />
                  ) : (
                    <img src={bannerMedia} alt="Preview Bergerak" className="w-full h-full object-contain" />
                  )}
                  <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-xs font-bold text-white cursor-pointer transition-opacity">
                    <Upload className="w-5 h-5 mb-1 text-emerald-400" />
                    <span>Klik Ganti Media</span>
                    <input type="file" accept="image/*,video/*,.gif" onChange={handleMediaUpload} className="hidden" />
                  </label>
                </div>
              ) : (
                <label className="w-full py-5 rounded-2xl bg-[#141923] border border-dashed border-zinc-700 hover:border-emerald-500/60 flex flex-col items-center justify-center gap-1.5 cursor-pointer">
                  <Upload className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-semibold text-zinc-300">Upload Visual (Video max 2m/10m/Unlimited)</span>
                  <input type="file" accept="image/*,video/*,.gif" onChange={handleMediaUpload} className="hidden" />
                </label>
              )}

              {mediaError && (
                <div className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-950/40 border border-rose-800/40 px-3 py-1.5 rounded-xl">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{mediaError}</span>
                </div>
              )}
            </div>

            {/* Bagian Musik / Audio */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-zinc-300">Audio Latar Belakang</label>
              {bannerHasAudio ? (
                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-[11px] text-amber-300 flex items-center gap-2">
                  <Volume2 className="w-4 h-4 flex-shrink-0" />
                  <span>Video memiliki audio bawaan. Penambahan musik dinonaktifkan otomatis.</span>
                </div>
              ) : musicTitle ? (
                <div className="p-3 rounded-2xl bg-[#141923] border border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Disc3 className={`w-4 h-4 text-emerald-400 ${isPlayingMusic ? 'animate-spin' : ''}`} />
                    <span className="text-xs font-bold text-white truncate max-w-[150px]">{musicTitle}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={handleToggleMusic} className="p-1.5 rounded-lg bg-emerald-500 text-black">
                      {isPlayingMusic ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={() => { setMusicTitle(''); setMusicSrc(null); setIsPlayingMusic(false); }} className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-rose-400">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsSelectMusicOpen(true)}
                  className="w-full py-2.5 rounded-xl bg-[#141923] hover:bg-zinc-800 text-xs font-bold text-zinc-300 border border-zinc-800 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4 text-emerald-400" /> Add Musik Rekomendasi
                </button>
              )}
            </div>

            {/* Tautan Banner */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-zinc-300">Tautan Tujuan</label>
              <input
                type="text"
                value={bannerLink}
                onChange={(e) => setBannerLink(e.target.value)}
                placeholder="https://linktujuan.com"
                className="w-full bg-[#141923] border border-zinc-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            {/* Simpan Konfigurasi */}
            <button
              onClick={() => {
                if (selectedSlotIndex === null) return;
                const updated = [...slotsData];
                updated[selectedSlotIndex] = {
                  ...updated[selectedSlotIndex],
                  filled: true,
                  brandName: bannerBrandName,
                  media: bannerMedia,
                  mediaType: bannerMediaType,
                  hasAudio: bannerHasAudio || Boolean(musicTitle),
                  link: bannerLink,
                  ratio: bannerRatio,
                  slotCost: getSlotCost(bannerRatio),
                  musicTitle: musicTitle || (bannerHasAudio ? 'Video Audio' : ''),
                  tier: currentPlan
                };
                setSlotsData(updated);
                setIsConfigModalOpen(false);
                broadcastUpdate({ slotsData: updated });
              }}
              className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs transition-transform active:scale-95 shadow-lg shadow-emerald-500/20"
            >
              Pasang Sekarang
            </button>
          </div>
        </div>
      )}

      {/* Navigasi Pemilihan Musik Rekomendasi */}
      {isSelectMusicOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[#0e121a] border border-zinc-800 p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <span className="text-xs font-black text-emerald-400">Pilih Musik Rekomendasi</span>
              <button onClick={() => setIsSelectMusicOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            {RECOMMENDED_TRACKS.map((t) => (
              <div
                key={t.id}
                onClick={() => {
                  setMusicTitle(t.title);
                  setMusicSrc(t.src);
                  setIsSelectMusicOpen(false);
                }}
                className="p-3 rounded-xl bg-[#141923] hover:bg-zinc-800 border border-zinc-800/80 cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Disc3 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-white">{t.title}</span>
                </div>
                <Plus className="w-4 h-4 text-zinc-400" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Drawer Menu Hamburger (Tulisan Pengaturan Dihapus) */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-sm h-full bg-[#0c1017] border-l border-zinc-800 p-5 flex flex-col justify-between overflow-y-auto">
            <div className="flex flex-col gap-4">
              {/* Header Drawer Bersih */}
              <div className="flex items-center justify-end pb-1 border-b border-zinc-800/50">
                <button onClick={() => setIsMenuOpen(false)} className="p-1.5 rounded-full bg-zinc-850 text-zinc-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Tab Navigasi */}
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

              {/* Konten Tab Langganan & Pricing Pancingan */}
              {activeTab === 'langganan' && (
                <div className="flex flex-col gap-3">
                  <span className="text-xs font-black text-zinc-400">Pilih Paket Langganan</span>

                  {/* 1. Motion Basic */}
                  <div
                    onClick={() => {
                      setCurrentPlan('Basic');
                      broadcastUpdate({ currentPlan: 'Basic' });
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      currentPlan === 'Basic' ? 'bg-zinc-900 border-emerald-500/60 shadow-md' : 'bg-[#121620]/60 border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-zinc-400" /> 1. Motion Basic
                      </span>
                      <span className="text-xs font-black text-emerald-400">Gratis</span>
                    </div>
                    <ul className="text-[11px] text-zinc-400 space-y-0.5 list-disc list-inside">
                      <li>1 Slot gratis 1x1 permanen</li>
                      <li>Video max 2 menit</li>
                      <li>Tambah slot: Rp {isNewUser ? '500 (Diskon)' : '1.000'}</li>
                    </ul>
                  </div>

                  {/* 2. Motion Pro */}
                  <div
                    onClick={() => {
                      setCurrentPlan('Pro');
                      broadcastUpdate({ currentPlan: 'Pro' });
                    }}
                    className={`relative overflow-hidden p-4 rounded-2xl border cursor-pointer transition-all ${
                      currentPlan === 'Pro' ? 'bg-zinc-900 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]' : 'bg-[#121620]/60 border-zinc-800'
                    }`}
                  >
                    <div className="pro-sweep-light" />
                    <div className="flex items-center justify-between mb-1 relative z-10">
                      <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-cyan-400" /> 2. Motion Pro
                      </span>
                      <span className="text-xs font-black text-cyan-300">Rp 29.000 / bln</span>
                    </div>
                    <ul className="text-[11px] text-zinc-400 space-y-0.5 list-disc list-inside relative z-10">
                      <li>Bebas rasio 9:16, 16:9, dll</li>
                      <li>Video diperpanjang hingga 10 menit</li>
                      <li>Animasi cahaya bergeser (Sweep light)</li>
                    </ul>
                  </div>

                  {/* 3. Motion Super (Pancingan Selisih Dikit) */}
                  <div
                    onClick={() => {
                      setCurrentPlan('Super');
                      broadcastUpdate({ currentPlan: 'Super' });
                    }}
                    className={`p-4 rounded-2xl cursor-pointer transition-all ${
                      currentPlan === 'Super' ? 'super-gold-card text-amber-200' : 'bg-[#121620]/60 border border-zinc-800 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <Gem className="w-4 h-4 text-amber-400" /> 3. Motion Super
                      </span>
                      <span className="text-xs font-black text-amber-300">Rp 35.000 / bln</span>
                    </div>
                    <ul className="text-[11px] text-amber-200/80 space-y-0.5 list-disc list-inside">
                      <li>Unlimited Semua Slot (Tanpa Biaya Tambahan)</li>
                      <li>Video Unlimited (Tanpa Batas Durasi)</li>
                      <li>Background Emas & Animasi Modern Glow</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Glassmorphism di Pojok Bawah Menu */}
            <div className="w-full p-4 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-xl flex flex-col gap-3 shadow-2xl mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={userProfile.avatar} alt="Avatar" className="w-11 h-11 rounded-2xl object-cover border border-emerald-500/50 shadow-md" />
                  <div>
                    <h4 className="text-xs font-black text-white">{userProfile.name}</h4>
                    <p className="text-[10px] text-zinc-400">{userProfile.handle}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-emerald-400"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Edit Mode Profil */}
              {isEditingProfile && (
                <div className="flex flex-col gap-2 pt-2 border-t border-zinc-800">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Nama Profil"
                    className="w-full bg-[#141923] border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-white"
                  />
                  <label className="w-full py-1.5 rounded-xl bg-[#141923] border border-dashed border-zinc-700 text-[11px] text-center text-zinc-400 cursor-pointer">
                    Ganti Foto Profil
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => setEditAvatar(ev.target.result);
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                  <button
                    onClick={handleSaveProfile}
                    className="w-full py-1.5 rounded-xl bg-emerald-500 font-bold text-black text-xs"
                  >
                    Simpan Profil
                  </button>
                </div>
              )}

              {/* Tautan Medsos Bawaan & Custom */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                {socials.map((s) => (
                  <a
                    key={s.id}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg bg-zinc-800/80 border border-zinc-700/60 text-zinc-300 hover:text-emerald-400 text-[10px] flex items-center gap-1"
                  >
                    {s.customIcon ? (
                      <img src={s.customIcon} alt={s.name} className="w-3 h-3 rounded-full" />
                    ) : (
                      <Globe className="w-3 h-3" />
                    )}
                    <span>{s.name}</span>
                  </a>
                ))}
                <button
                  onClick={() => setIsAddSocialModal(true)}
                  className="p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px]"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah Medsos (TikTok, Instagram, Facebook, Discord, LinkedIn, Linktree, & Custom Icon) */}
      {isAddSocialModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[#0e121a] border border-zinc-800 p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <span className="text-xs font-black text-emerald-400">Tambah Icon / Medsos</span>
              <button onClick={() => setIsAddSocialModal(false)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {['TikTok', 'Instagram', 'Facebook', 'Discord', 'LinkedIn', 'Linktree'].map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedPlatform(p)}
                  className={`py-1.5 rounded-xl text-xs font-bold ${
                    selectedPlatform === p ? 'bg-emerald-600 text-white' : 'bg-[#141923] text-zinc-400'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={customSocialUrl}
              onChange={(e) => setCustomSocialUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-[#141923] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
            />
            <label className="w-full py-2 rounded-xl bg-[#141923] border border-dashed border-zinc-700 text-xs text-center text-zinc-400 cursor-pointer">
              Upload Logo Kustom (Opsional)
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => setCustomSocialIcon(ev.target.result);
                    reader.readAsDataURL(file);
                  }
                }}
                className="hidden"
              />
            </label>
            <button
              onClick={() => {
                if (!customSocialUrl) return;
                const newEntry = {
                  id: Date.now(),
                  name: selectedPlatform,
                  platform: selectedPlatform.toLowerCase(),
                  url: customSocialUrl,
                  customIcon: customSocialIcon
                };
                const updated = [...socials, newEntry];
                setSocials(updated);
                setIsAddSocialModal(false);
                setCustomSocialUrl('');
                setCustomSocialIcon(null);
                broadcastUpdate({ socials: updated });
              }}
              className="w-full py-2.5 rounded-xl bg-emerald-500 font-black text-black text-xs"
            >
              Tambahkan
            </button>
          </div>
        </div>
      )}

      {/* Background Audio Hidden Player */}
      {musicSrc && <audio ref={audioRef} src={musicSrc} loop />}
    </div>
  );
}
