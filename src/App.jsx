import React, { useState, useRef } from 'react';

export default function App() {
  // State Mode Motion Super
  const [isMotionSuper, setIsMotionSuper] = useState(true);

  // State Ukuran Banner (default 2x2)
  const [colSpan, setColSpan] = useState(2);
  const [rowSpan, setRowSpan] = useState(2);

  // State Data Banner
  const [bannerData, setBannerData] = useState({
    name: 'Anak Programmer Indonesia',
    image: null,
    link: 'https://github.com/amotionwebsite',
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

  // State Modal Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputName, setInputName] = useState(bannerData.name);
  const [inputImage, setInputImage] = useState(bannerData.image);
  const [inputLink, setInputLink] = useState(bannerData.link);
  const [customIcon, setCustomIcon] = useState(null);
  const [customIconUrl, setCustomIconUrl] = useState('');

  // Drag / Resize Tracking State
  const dragStartRef = useRef(null);

  // Handle Resize Touch / Mouse (Drag Corner)
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

    // Sensitivitas drag per 40px
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

  // Upload Gambar Banner Utama
  const handleBannerUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setInputImage(URL.createObjectURL(file));
    }
  };

  // Upload Icon Medsos Kustom
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
      name: inputName || 'Anak Programmer Indonesia',
      image: inputImage,
      link: inputLink,
      socials: updatedSocials,
    });
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#070b12] text-white flex flex-col items-center p-4 select-none font-sans relative overflow-x-hidden">
      
      {/* Header Bar */}
      <header className="w-full max-w-md flex items-center justify-between py-3 px-2 border-b border-white/5">
        <div className="flex items-center gap-3">
          <button className="text-gray-400 hover:text-white p-1">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-bold text-emerald-400 text-sm shadow-[0_0_12px_rgba(16,185,129,0.3)]">
              P
            </div>
            <span className="font-bold text-lg tracking-wide text-white">
              Pro<span className="text-emerald-400">Motion</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Badge Switcher Motion Super */}
          <button
            onClick={() => setIsMotionSuper(!isMotionSuper)}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-full transition-all border ${
              isMotionSuper
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.25)]'
                : 'bg-white/5 border-white/10 text-gray-400'
            }`}
          >
            MOTION SUPER
          </button>
          <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            Slot 1/100
          </span>
        </div>
      </header>

      {/* Hero Description */}
      <div className="w-full max-w-md text-center my-4 px-2">
        <div className="inline-block px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-medium mb-2">
          Promosikan Produk, Jasa, Website, dll anda di sini
        </div>
        <p className="text-gray-400 text-xs leading-relaxed">
          Papan iklan piksel digital komunitas. Pasang banner usahamu, tentukan ukuran custom, dan tautkan jejaring media sosial langsung secara instan.
        </p>
      </div>

      {/* Grid Canvas Wrapper */}
      <div className="w-full max-w-md bg-[#0c121d]/70 border border-white/5 rounded-3xl p-3 shadow-2xl backdrop-blur-md relative">
        <div className="grid grid-cols-5 gap-2 auto-rows-[64px] relative">
          
          {/* BANNER UTAMA (Slot #1) */}
          <div
            style={{
              gridColumn: `span ${colSpan}`,
              gridRow: `span ${rowSpan}`,
            }}
            className="relative rounded-2xl p-1.5 flex flex-col justify-between overflow-visible transition-all duration-75 border border-emerald-500/40 bg-gradient-to-br from-[#121c2b] to-[#0a111a] shadow-[0_4px_20px_rgba(0,0,0,0.5)] group"
          >
            {/* Tag Ukuran Grid */}
            <span className="absolute top-2 left-2 z-20 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-mono text-emerald-400">
              {colSpan}x{rowSpan}
            </span>

            {/* Tombol Edit / Buka Modal */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="absolute top-2 right-2 z-20 w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 text-xs border border-white/10"
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

            {/* Bagian Bawah Banner: Nama Tengah + Icon Medsos */}
            <div className="w-full flex flex-col items-center justify-center pt-1.5 pb-0.5 px-1">
              
              {/* Nama Banner (Center) */}
              {isMotionSuper ? (
                <span className="text-center font-extrabold text-[12px] tracking-wide bg-gradient-to-r from-emerald-400 via-violet-300 via-pink-400 to-emerald-400 bg-[length:250%_auto] animate-[shimmer_3s_linear_infinite] bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(167,139,250,0.4)] truncate max-w-full">
                  {bannerData.name}
                </span>
              ) : (
                <span className="text-center font-bold text-[12px] text-gray-200 tracking-wide truncate max-w-full">
                  {bannerData.name}
                </span>
              )}

              {/* Deretan Icon Medsos di Bawah Nama */}
              {bannerData.socials && bannerData.socials.length > 0 && (
                <div className="flex items-center justify-center gap-2 mt-1 flex-wrap">
                  {bannerData.socials.map((social, idx) => (
                    <a
                      key={idx}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative p-0.5 flex items-center justify-center group/icon"
                    >
                      {/* Animasi Gerakan di Belakang Icon (Khusus Motion Super) */}
                      {isMotionSuper && (
                        <span className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-500 via-violet-500 to-pink-500 blur-[2px] opacity-75 animate-[spin_4s_linear_infinite]" />
                      )}

                      {/* Gambar Icon Medsos */}
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

            {/* HANDLE RESIZE GAYA CORNER GESTURE IOS DI POJOK KANAN BAWAH */}
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

          {/* Dummy Empty Slots Sisa Grid (#2 s/d #35) */}
          {Array.from({ length: 34 }).map((_, i) => (
            <div
              key={i}
              onClick={() => setIsModalOpen(true)}
              className="rounded-2xl border border-white/[0.04] bg-[#0f1622]/50 hover:bg-[#152030]/60 hover:border-emerald-500/20 flex flex-col items-center justify-center cursor-pointer transition group"
            >
              <span className="text-gray-600 group-hover:text-emerald-400 font-light text-base leading-none mb-0.5">+</span>
              <span className="text-[9px] text-gray-600 group-hover:text-gray-400 font-mono">#{i + 2}</span>
            </div>
          ))}

        </div>
      </div>

      {/* MODAL FORM SEWA / EDIT BANNER (Mirip iOS + Semi-Glass) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm rounded-[32px] bg-[#111722]/85 backdrop-blur-2xl border border-white/10 p-5 shadow-[0_16px_40px_rgba(0,0,0,0.8)] flex flex-col gap-4 text-left relative">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold text-sm">+ Sewa / Ubah Slot</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold border border-emerald-500/20">
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

            {/* Input Nama Brand / Produk */}
            <div>
              <label className="text-xs text-gray-400 font-medium block mb-1.5">Nama Merek / Produk</label>
              <input
                type="text"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                placeholder="Contoh: Anak Programmer Indonesia"
                className="w-full bg-[#0a0f16]/90 border border-white/10 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition"
              />
            </div>

            {/* Upload Media Banner */}
            <div>
              <label className="text-xs text-gray-400 font-medium block mb-1.5">Unggah Media (Gambar / Video)</label>
              <label className="w-full border-2 border-dashed border-white/10 hover:border-emerald-500/40 rounded-2xl py-3 px-2 flex flex-col items-center justify-center cursor-pointer bg-[#0a0f16]/60 transition">
                <input type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" />
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-emerald-400 mb-1">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span className="text-xs text-gray-300 font-medium">Pilih Gambar atau Video</span>
              </label>
            </div>

            {/* Custom Icon & Link Medsos Tambahan */}
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
                  className="flex-1 bg-[#0a0f16]/90 border border-white/10 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>

            {/* Link Default */}
            <div>
              <label className="text-xs text-gray-400 font-medium block mb-1.5">Link Tujuan Default (Opsional)</label>
              <input
                type="url"
                value={inputLink}
                onChange={(e) => setInputLink(e.target.value)}
                placeholder="https://toko-kamu.com"
                className="w-full bg-[#0a0f16]/90 border border-white/10 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            {/* Tombol Simpan / Pasang */}
            <button
              onClick={handleSaveModal}
              className="w-full mt-2 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs tracking-wide shadow-[0_4px_16px_rgba(16,185,129,0.3)] transition active:scale-95"
            >
              Simpan & Pasang Banner
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
