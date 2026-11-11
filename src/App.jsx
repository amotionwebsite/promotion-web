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
  Disc3,
  Globe,
  Sliders,
  AlertCircle,
  CheckCircle,
  Volume2,
  VolumeX,
  UserPlus,
  LogIn,
  Crop,
  Folder,
  Image as ImageIcon,
  Video,
  Film
} from 'lucide-react';

const SOCKET_URL = 'https://promotion-backend-production.up.railway.app';
const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  reconnectionAttempts: 5,
});

// Rekomendasi Lagu Preset
const RECOMMENDED_TRACKS = [
  { id: 'rec-1', title: 'Cyber City Beats', src: 'https://cdn.freesound.org/previews/612/612081_5674468-lq.mp3' },
  { id: 'rec-2', title: 'Night Lo-Fi Chill', src: 'https://cdn.freesound.org/previews/515/515824_11564757-lq.mp3' },
  { id: 'rec-3', title: 'Neon Electro Vibes', src: 'https://cdn.freesound.org/previews/415/415804_5121236-lq.mp3' }
];

// Media Internal Bawaan (Folder Media Sendiri)
const BUILTIN_GALLERY = {
  images: [
    { id: 'img-1', name: 'Cyber Neon', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&q=80' },
    { id: 'img-2', name: 'Minimal Tech', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&q=80' }
  ],
  gifs: [
    { id: 'gif-1', name: 'Matrix Rain', url: 'https://media.giphy.com/media/oEI9uBYSzLpBK/giphy.gif' },
    { id: 'gif-2', name: 'Retro Grid', url: 'https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif' }
  ],
  videos: [
    { id: 'vid-1', name: 'Abstract Light Flow', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' }
  ]
};

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [isNewUser, setIsNewUser] = useState(true);
  const [currentPlan, setCurrentPlan] = useState('Pro'); // 'Basic' | 'Pro' | 'Super'

  // Navigation & Drawer
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('langganan');
  const [isProfilePageOpen, setIsProfilePageOpen] = useState(false); // Navigasi baru profil

  // Profil Pengguna
  const [userProfile, setUserProfile] = useState({
    name: 'Anak Programmer Indonesia',
    handle: '@anakprogrammer',
    avatar: 'https://cdn-icons-png.flaticon.com/512/3670/3670157.png',
  });
  const [editName, setEditName] = useState(userProfile.name);
  const [editAvatar, setEditAvatar] = useState(userProfile.avatar);

  // Media Sosial
  const [socials, setSocials] = useState([
    { id: 1, name: 'TikTok', platform: 'tiktok', url: 'https://tiktok.com/@anakprogrammer', customIcon: null },
    { id: 2, name: 'Discord', platform: 'discord', url: 'https://discord.gg/anakprogrammer', customIcon: null },
    { id: 3, name: 'Instagram', platform: 'instagram', url: 'https://instagram.com', customIcon: null }
  ]);
  const [isAddSocialModal, setIsAddSocialModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('TikTok');
  const [customSocialUrl, setCustomSocialUrl] = useState('');
  const [customSocialIcon, setCustomSocialIcon] = useState(null);

  // Audio & Pemutar Suara
  const [musicTitle, setMusicTitle] = useState('');
  const [musicSrc, setMusicSrc] = useState(null);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [isSelectMusicOpen, setIsSelectMusicOpen] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
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

  // Modal Banner Slot & Media Folder Modal
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isMediaGalleryOpen, setIsMediaGalleryOpen] = useState(false);
  const [galleryTab, setGalleryTab] = useState('images'); // 'images' | 'videos' | 'gifs'
  const [bannerBrandName, setBannerBrandName] = useState('');
  const [bannerRatio, setBannerRatio] = useState('1:1');
  const [bannerMedia, setBannerMedia] = useState(null);
  const [bannerMediaType, setBannerMediaType] = useState('image');
  const [bannerLink, setBannerLink] = useState('');
  const [bannerHasAudio, setBannerHasAudio] = useState(false);
  const [mediaError, setMediaError] = useState('');
  const [showCropAlert, setShowCropAlert] = useState(false);

  // Socket Synchronization
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

  const getSlotCost = (ratio) => {
    if (currentPlan === 'Super') return 0;
    let multiplier = 1;
    if (ratio === '5:1') multiplier = 5;
    else if (ratio === '2x2') multiplier = 4;
    else if (ratio === '9:16' || ratio === '16:9') multiplier = 6;

    const basePrice = isNewUser ? 500 : 1000;
    if (currentPlan === 'Basic') {
      return (multiplier - 1) * basePrice;
    }
    return multiplier * basePrice;
  };

  // Upload Media dengan Deteksi Rasio & Audio
  const handleMediaUpload = (file) => {
    if (!file) return;
    setMediaError('');
    setShowCropAlert(false);

    const isVid = file.type?.startsWith('video/') || typeof file === 'string' && file.endsWith('.mp4');
    const isGif = file.type === 'image/gif' || (typeof file === 'string' && file.endsWith('.gif'));

    if (isVid) {
      const vidObj = document.createElement('video');
      vidObj.preload = 'metadata';
      vidObj.src = typeof file === 'string' ? file : URL.createObjectURL(file);

      vidObj.onloadedmetadata = () => {
        const duration = vidObj.duration;
        const width = vidObj.videoWidth;
        const height = vidObj.videoHeight;

        if (width / height > 1.3 || height / width > 1.3) {
          setShowCropAlert(true);
        }

        if (currentPlan === 'Basic' && duration > 120) {
          setMediaError('Durasi video basic maks 2 menit! Upgrade ke Pro atau Super.');
          return;
        }
        if (currentPlan === 'Pro' && duration > 600) {
          setMediaError('Durasi video Pro maks 10 menit! Upgrade ke Super untuk Unlimited.');
          return;
        }

        setBannerHasAudio(true);
        setMusicTitle('');
        setMusicSrc(null);
        setIsPlayingMusic(false);

        if (typeof file === 'string') {
          setBannerMedia(file);
          setBannerMediaType('video');
        } else {
          const reader = new FileReader();
          reader.onload = (ev) => {
            setBannerMedia(ev.target.result);
            setBannerMediaType('video');
          };
          reader.readAsDataURL(file);
        }
      };
    } else {
      setBannerHasAudio(false);
      if (typeof file === 'string') {
        setBannerMedia(file);
        setBannerMediaType(isGif ? 'gif' : 'image');
      } else {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
          if (img.width / img.height > 1.3 || img.height / img.width > 1.3) {
            setShowCropAlert(true);
          }
        };
        const reader = new FileReader();
        reader.onload = (ev) => {
          setBannerMedia(ev.target.result);
          setBannerMediaType(isGif ? 'gif' : 'image');
        };
        reader.readAsDataURL(file);
      }
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
    setIsProfilePageOpen(false);
    broadcastUpdate({ userProfile: updated });
  };
  return (
    <div className="min-h-screen w-full bg-[#070b12] text-zinc-100 flex flex-col items-center selection:bg-emerald-500 selection:text-black">
      {/* Dynamic Keyframes & Entrance Animations */}
      <style>{`
        @keyframes pageEntrance {
          0% { opacity: 0; transform: translateY(12px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .page-enter-anim {
          animation: pageEntrance 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes proSweep {
          0% { transform: translateX(-150%) skewX(-25deg); }
          50%, 100% { transform: translateX(200%) skewX(-25deg); }
        }
        .pro-sweep-light {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.45), rgba(168, 85, 247, 0.55), transparent);
          animation: proSweep 3s infinite ease-in-out;
          pointer-events: none;
        }
        @keyframes goldPulseGlow {
          0%, 100% { box-shadow: 0 0 25px rgba(234, 179, 8, 0.4), inset 0 0 15px rgba(234, 179, 8, 0.25); }
          50% { box-shadow: 0 0 50px rgba(250, 204, 21, 0.7), inset 0 0 30px rgba(250, 204, 21, 0.5); }
        }
        .super-gold-card {
          background: radial-gradient(circle at top right, rgba(234, 179, 8, 0.25), rgba(20, 16, 7, 0.92) 75%), #0c0a06;
          border: 1.5px solid rgba(250, 204, 21, 0.75);
          animation: goldPulseGlow 3.5s infinite ease-in-out;
        }
        @keyframes eqWave {
          0%, 100% { height: 25%; }
          50% { height: 100%; }
        }
        .eq-bar {
          animation: eqWave 0.7s infinite ease-in-out alternate;
        }
      `}</style>

      {/* Bagian Paling Atas: Brand ProMotion & Status Langganan Dipindahkan ke Kiri Atas */}
      <div className="w-full max-w-7xl px-4 sm:px-8 pt-3 pb-1 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img src="/logopromotion.png" alt="ProMotion" className="w-6 h-6 object-contain rounded-md" />
          <span className="font-black text-sm tracking-wide bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            ProMotion
          </span>
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 ${
            currentPlan === 'Super'
              ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
              : currentPlan === 'Pro'
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
              : 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
          }`}>
            {currentPlan === 'Super' ? (
              <img src="/motionsuper.png" alt="Super" className="w-3.5 h-3.5 object-contain" />
            ) : currentPlan === 'Pro' ? (
              <img src="/motionpro.png" alt="Pro" className="w-3.5 h-3.5 object-contain" />
            ) : (
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
            )}
            {currentPlan.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Header Utama: Hamburger Menu di Kiri & Gabungan Tombol Daftar/Login di Kanan */}
      <header className="w-full max-w-7xl flex items-center justify-between py-2.5 px-4 sm:px-8 sticky top-0 z-40 bg-[#070b12]/90 backdrop-blur-xl border-b border-zinc-850">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-zinc-300 hover:text-white transition-transform duration-300 active:scale-90 flex items-center justify-center shadow-md"
        >
          {isMenuOpen ? (
            <ChevronLeft className="w-5 h-5 text-emerald-400 rotate-[-180deg] transition-all duration-300" />
          ) : (
            <Menu className="w-5 h-5 transition-all duration-300" />
          )}
        </button>

        {/* Tombol Disatukan: Daftar & Login Glassmorphism */}
        <div className="flex items-center rounded-2xl bg-zinc-900/80 border border-zinc-800/90 p-1 backdrop-blur-md shadow-lg">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition-all">
            <UserPlus className="w-3.5 h-3.5" />
            <span>Daftar</span>
          </button>
          <div className="w-[1px] h-4 bg-zinc-700/60 my-auto mx-0.5" />
          <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/25 hover:bg-emerald-500/35 text-emerald-400 border border-emerald-500/40 text-xs font-bold transition-all shadow-[0_0_12px_rgba(16,185,129,0.3)]">
            <LogIn className="w-3.5 h-3.5" />
            <span>Login</span>
          </button>
        </div>
      </header>

      {/* Deskripsi Baru */}
      <div className="w-full max-w-4xl text-center px-4 pt-6 pb-2 page-enter-anim">
        <span className="px-4 py-1 rounded-full text-xs font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 shadow-lg">
          Papan Promosi Komunitas Digital
        </span>
        <p className="text-xs sm:text-sm text-zinc-300 mt-2 max-w-md mx-auto font-medium">
          Pasang dan promosikan produk anda di ProMotion dengan fitur yang melimpah..
        </p>
        <div className="mt-3 inline-flex items-center gap-2 text-xs text-emerald-400 bg-zinc-900/80 px-3 py-1 rounded-full border border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          Slot Aktif: 1/{TOTAL_SLOTS}
        </div>
      </div>

      {/* Layout Grid 1000 Slot */}
      <main className="w-full max-w-7xl px-3 sm:px-6 my-4 flex-1 flex flex-col items-center">
        <div className="relative w-full rounded-3xl bg-[#0b0f17]/95 border border-zinc-800/80 p-3 sm:p-6 shadow-2xl backdrop-blur-xl">
          <div className="overflow-x-auto overflow-y-auto max-h-[680px] p-2 rounded-2xl scrollbar-thin scrollbar-thumb-zinc-700 scroll-smooth">
            <div 
              className="grid gap-3 sm:gap-4 min-w-[750px] sm:min-w-full"
              style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))' }}
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
                    className={`relative group rounded-2xl flex flex-col justify-between cursor-pointer transition-all duration-300 min-h-[160px] p-3 overflow-hidden select-none hover:scale-[1.02] ${
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

                    {/* Atas Slot: Status Langganan & Size Tanpa Garis Samping */}
                    <div className="w-full flex items-center justify-between text-[10px] z-10">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase text-zinc-400">
                          {slot.tier || currentPlan}
                        </span>
                        <span className="font-bold text-emerald-400">
                          {slot.ratio}
                        </span>
                      </div>
                      <div className="w-4 h-4 rounded-md bg-emerald-500/20 border border-emerald-400 flex items-center justify-center transition-transform duration-300 group-hover:scale-125 shadow-[0_0_8px_rgba(16,185,129,0.6)]">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-sm" />
                      </div>
                    </div>

                    {/* Konten Banner Media */}
                    {slot.filled ? (
                      <div className="w-full flex-1 flex flex-col items-center justify-center my-1.5 z-10">
                        {slot.media ? (
                          <div className="w-full h-16 rounded-xl overflow-hidden bg-black/60 flex items-center justify-center relative">
                            {slot.mediaType === 'video' ? (
                              <video
                                src={slot.media}
                                autoPlay
                                loop
                                playsInline
                                muted={isVideoMuted}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <img src={slot.media} alt="Slot Visual" className="w-full h-full object-cover" />
                            )}
                            {slot.mediaType === 'video' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsVideoMuted(!isVideoMuted);
                                }}
                                className="absolute bottom-1 right-1 p-1 rounded-md bg-black/60 text-white hover:bg-black/80"
                              >
                                {isVideoMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3 text-emerald-400" />}
                              </button>
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

                    {/* Bawah Banner Terstruktur: Profil -> Medsos -> Musik Equalizer */}
                    {slot.filled && (
                      <div className="w-full flex flex-col gap-1 pt-1.5 border-t border-zinc-800/60 z-10 text-[9px]">
                        {/* 1. Foto Profil + Nama */}
                        <div className="flex items-center gap-1.5 truncate">
                          <img src={userProfile.avatar} alt="Avatar" className="w-3.5 h-3.5 rounded-full object-cover border border-emerald-400/60 shrink-0" />
                          <span className="text-zinc-200 font-bold truncate max-w-[85px]">{userProfile.name}</span>
                        </div>

                        {/* 2. Medsos User */}
                        <div className="flex items-center gap-1 overflow-x-hidden">
                          {socials.slice(0, 3).map((s) => (
                            <span key={s.id} className="text-zinc-400 text-[8px] bg-zinc-800/80 px-1 py-0.2 rounded">
                              {s.name}
                            </span>
                          ))}
                        </div>

                        {/* 3. Musik / Equalizer */}
                        <div className="flex items-center justify-between text-zinc-400 pt-0.5">
                          <span className="truncate max-w-[70px] text-[8px]">
                            {slot.musicTitle || (slot.hasAudio ? 'Video Sound' : 'Tanpa Lagu')}
                          </span>
                          {slot.hasAudio ? (
                            <div className="flex items-center gap-0.5 h-2.5">
                              <span className="w-0.5 bg-emerald-400 rounded-full eq-bar" style={{ animationDelay: '0s' }} />
                              <span className="w-0.5 bg-emerald-400 rounded-full eq-bar" style={{ animationDelay: '0.2s' }} />
                              <span className="w-0.5 bg-emerald-400 rounded-full eq-bar" style={{ animationDelay: '0.4s' }} />
                            </div>
                          ) : (
                            <span className="text-[8px] text-zinc-600">•</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Widget Resize Hijau Gradasi di Pojok Kanan Bawah */}
                    <div className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-br-md bg-gradient-to-br from-emerald-400 to-teal-600 opacity-70 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
      {/* Navigasi Penuh Pengaturan Profil (Muncul saat Ikon Pensil Diklik) */}
      {isProfilePageOpen && (
        <div className="fixed inset-0 bg-[#070b12] z-50 flex flex-col items-center p-6 page-enter-anim overflow-y-auto">
          <div className="w-full max-w-md flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <button
                onClick={() => setIsProfilePageOpen(false)}
                className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-white"
              >
                <ChevronLeft className="w-4 h-4 text-emerald-400" /> Kembali
              </button>
              <span className="text-sm font-black text-white">Atur Profil Saya</span>
              <div className="w-6" />
            </div>

            <div className="flex flex-col items-center gap-3">
              <img src={editAvatar} alt="Profile" className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-500 shadow-xl" />
              <label className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold cursor-pointer text-zinc-300">
                Ganti Foto
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
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-zinc-400">Nama Tampilan</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-[#121620] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <button
              onClick={handleSaveProfile}
              className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs transition-transform active:scale-95 shadow-lg shadow-emerald-500/20"
            >
              Simpan Perubahan Profil
            </button>
          </div>
        </div>
      )}

      {/* Modal Galeri Media Internal Kustom (Bukan Langsung Galeri Google) */}
      {isMediaGalleryOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#0e121a] border border-zinc-800 p-5 flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-black text-white">Folder Media ProMotion</span>
              </div>
              <button onClick={() => setIsMediaGalleryOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tab Folder */}
            <div className="grid grid-cols-3 gap-2 bg-[#121620] p-1 rounded-xl">
              <button
                onClick={() => setGalleryTab('images')}
                className={`py-1.5 rounded-lg text-xs font-bold ${galleryTab === 'images' ? 'bg-emerald-600 text-white' : 'text-zinc-400'}`}
              >
                Gambar
              </button>
              <button
                onClick={() => setGalleryTab('gifs')}
                className={`py-1.5 rounded-lg text-xs font-bold ${galleryTab === 'gifs' ? 'bg-emerald-600 text-white' : 'text-zinc-400'}`}
              >
                GIF
              </button>
              <button
                onClick={() => setGalleryTab('videos')}
                className={`py-1.5 rounded-lg text-xs font-bold ${galleryTab === 'videos' ? 'bg-emerald-600 text-white' : 'text-zinc-400'}`}
              >
                Video
              </button>
            </div>

            {/* List Media Folder */}
            <div className="grid grid-cols-2 gap-2.5">
              {BUILTIN_GALLERY[galleryTab].map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    handleMediaUpload(item.url);
                    setIsMediaGalleryOpen(false);
                  }}
                  className="p-2 rounded-xl bg-[#141923] border border-zinc-800/80 hover:border-emerald-500/50 cursor-pointer flex flex-col items-center gap-1.5"
                >
                  {galleryTab === 'videos' ? (
                    <video src={item.url} className="w-full h-20 object-cover rounded-lg" />
                  ) : (
                    <img src={item.url} alt={item.name} className="w-full h-20 object-cover rounded-lg" />
                  )}
                  <span className="text-[10px] text-zinc-300 font-semibold truncate w-full text-center">{item.name}</span>
                </div>
              ))}
            </div>

            {/* Opsi Upload dari Perangkat Sendiri */}
            <label className="w-full py-2.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-center text-zinc-200 cursor-pointer flex items-center justify-center gap-2">
              <Upload className="w-4 h-4 text-emerald-400" /> Upload File dari HP
              <input
                type="file"
                accept="image/*,video/*,.gif"
                onChange={(e) => {
                  handleMediaUpload(e.target.files[0]);
                  setIsMediaGalleryOpen(false);
                }}
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}

      {/* Modal Konfigurasi Banner */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#0e121a] border border-zinc-800 p-6 flex flex-col gap-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-emerald-400">+ Konfigurasi Banner</span>
                <span className="text-[10px] font-bold bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Slot #{selectedSlotIndex !== null ? selectedSlotIndex + 1 : 1}
                </span>
              </div>
              <button onClick={() => setIsConfigModalOpen(false)} className="w-7 h-7 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-zinc-300">Nama Brand / Produk</label>
              <input
                type="text"
                value={bannerBrandName}
                onChange={(e) => setBannerBrandName(e.target.value)}
                placeholder="Contoh: Toko Online Saya"
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
                      bannerRatio === r ? 'bg-emerald-600 text-white shadow-md' : 'bg-[#141923] text-zinc-400 border border-zinc-800'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Buka Folder Media Sendiri */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-zinc-300">Media Visual (Gambar / GIF / Video)</label>
              {bannerMedia ? (
                <div className="relative w-full h-36 rounded-2xl overflow-hidden border border-emerald-500/40 bg-black flex items-center justify-center group">
                  {bannerMediaType === 'video' ? (
                    <video src={bannerMedia} autoPlay loop playsInline controls className="w-full h-full object-contain" />
                  ) : (
                    <img src={bannerMedia} alt="Preview" className="w-full h-full object-contain" />
                  )}
                  <button
                    onClick={() => setIsMediaGalleryOpen(true)}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-bold text-white transition-opacity gap-1.5"
                  >
                    <Folder className="w-4 h-4 text-emerald-400" /> Buka Folder Media
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsMediaGalleryOpen(true)}
                  className="w-full py-5 rounded-2xl bg-[#141923] border border-dashed border-zinc-700 hover:border-emerald-500 flex flex-col items-center justify-center gap-1.5"
                >
                  <Folder className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-semibold text-zinc-300">Buka Folder Media (Gambar, Video, GIF)</span>
                </button>
              )}

              {/* Peringatan Auto-Resize / Crop */}
              {showCropAlert && (
                <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-800/40 text-[11px] text-cyan-300 flex items-center justify-between">
                  <span>Rasio bukan 1:1. Potong otomatis ke 1:1 atau pertahankan rasio dengan biaya slot tambahan.</span>
                  <button
                    onClick={() => setBannerRatio('1:1')}
                    className="px-2 py-1 rounded bg-cyan-600 text-white font-bold ml-2 text-[10px]"
                  >
                    Set 1:1
                  </button>
                </div>
              )}

              {mediaError && (
                <div className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-950/40 border border-rose-800/40 px-3 py-1.5 rounded-xl">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{mediaError}</span>
                </div>
              )}
            </div>

            {/* Audio Latar Belakang */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-zinc-300">Audio Latar Belakang</label>
              {bannerHasAudio ? (
                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-[11px] text-amber-300 flex items-center gap-2">
                  <Volume2 className="w-4 h-4 shrink-0" />
                  <span>Video memiliki audio aktif. Penambahan lagu luar dinonaktifkan otomatis.</span>
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
                  musicTitle: musicTitle || (bannerHasAudio ? 'Video Sound' : ''),
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

      {/* Navigasi Musik Rekomendasi */}
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

      {/* Drawer Menu Hamburger */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-sm h-full bg-[#0c1017] border-l border-zinc-800 p-5 flex flex-col justify-between overflow-y-auto">
            <div className="flex flex-col gap-4">
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

              {/* Tab Langganan Tanpa Nomor 1, 2, 3 & Icon Diperbesar di Samping Kata Motion */}
              {activeTab === 'langganan' && (
                <div className="flex flex-col gap-3">
                  <span className="text-xs font-black text-zinc-400">Pilih Paket Langganan</span>

                  {/* Motion Basic */}
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
                        <ShieldCheck className="w-4 h-4 text-emerald-400" /> Motion Basic
                      </span>
                      <span className="text-xs font-black text-emerald-400">Gratis</span>
                    </div>
                    <ul className="text-[11px] text-zinc-400 space-y-0.5 list-disc list-inside">
                      <li>1 Slot gratis 1x1 permanen</li>
                      <li>Video max 2 menit</li>
                      <li>Tambah slot: Rp {isNewUser ? '500 (Diskon)' : '1.000'}</li>
                    </ul>
                  </div>

                  {/* Motion Pro (Icon Pro Diperbesar) */}
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
                      <span className="text-xs font-bold text-cyan-300 flex items-center gap-2">
                        Motion
                        <img src="/motionpro.png" alt="Pro" className="w-5 h-5 object-contain shrink-0" />
                      </span>
                      <span className="text-xs font-black text-cyan-300">Rp 29.000 / bln</span>
                    </div>
                    <ul className="text-[11px] text-zinc-400 space-y-0.5 list-disc list-inside relative z-10">
                      <li>Bebas rasio 9:16, 16:9, dll</li>
                      <li>Video diperpanjang hingga 10 menit</li>
                      <li>Animasi cahaya bergeser (Sweep light)</li>
                    </ul>
                  </div>

                  {/* Motion Super (Icon Super Diperbesar) */}
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
                      <span className="text-xs font-bold text-amber-300 flex items-center gap-2">
                        Motion
                        <img src="/motionsuper.png" alt="Super" className="w-5 h-5 object-contain shrink-0" />
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

            {/* Profile Glassmorphism di Bawah Menu: Klik Pensil Membuka Halaman Profil Penuh */}
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
                  onClick={() => setIsProfilePageOpen(true)}
                  className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-emerald-400 transition-transform active:scale-90"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Medsos */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                {socials.map((s) => (
                  <a
                    key={s.id}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg bg-zinc-800/80 border border-zinc-700/60 text-zinc-300 hover:text-emerald-400 text-[10px] flex items-center gap-1"
                  >
                    <Globe className="w-3 h-3" />
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

      {/* Modal Tambah Medsos */}
      {isAddSocialModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[#0e121a] border border-zinc-800 p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <span className="text-xs font-black text-emerald-400">Tambah Media Sosial</span>
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
            <button
              onClick={() => {
                if (!customSocialUrl) return;
                const newEntry = {
                  id: Date.now(),
                  name: selectedPlatform,
                  platform: selectedPlatform.toLowerCase(),
                  url: customSocialUrl,
                  customIcon: null
                };
                const updated = [...socials, newEntry];
                setSocials(updated);
                setIsAddSocialModal(false);
                setCustomSocialUrl('');
                broadcastUpdate({ socials: updated });
              }}
              className="w-full py-2.5 rounded-xl bg-emerald-500 font-black text-black text-xs"
            >
              Tambahkan
            </button>
          </div>
        </div>
      )}

      {/* Hidden Audio Player */}
      {musicSrc && <audio ref={audioRef} src={musicSrc} loop />}
    </div>
  );
}
