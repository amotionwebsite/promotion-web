import React, { useState } from 'react';
import { 
  Menu, X, Plus, Crown, BarChart3, Upload, 
  CheckCircle2, ChevronLeft, Type, Palette, Zap,
  Globe, MessageSquare, Share2
} from 'lucide-react';

export default function App() {
  const totalSlots = 100;
  const [activeTab, setActiveTab] = useState('slot');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState('free');

  const [slots, setSlots] = useState([]);

  // Modal Sewa Slot
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Modal Resize Handle Luar
  const [resizeModalOpen, setResizeModalOpen] = useState(false);
  const [targetResizeSlot, setTargetResizeSlot] = useState(null);
  const [selectedDimension, setSelectedDimension] = useState({ col: 1, row: 1 });

  // Modal Media Sosial
  const [socialModalOpen, setSocialModalOpen] = useState(false);
  const [targetSocialSlot, setTargetSocialSlot] = useState(null);
  const [socialInputs, setSocialInputs] = useState({
    tiktok: '',
    instagram: '',
    discord: '',
    website: ''
  });

  // Modal Gaya Font & Palet Warna
  const [styleModalOpen, setStyleModalOpen] = useState(false);
  const [targetStyleSlot, setTargetStyleSlot] = useState(null);
  const [customFontFamily, setCustomFontFamily] = useState('font-sans');
  const [customTextColor, setCustomTextColor] = useState('text-slate-200');
  const [customHexColor, setCustomHexColor] = useState('#10b981');

  // Form State Sewa Awal
  const [formData, setFormData] = useState({
    title: '',
    mediaUrl: '',
    mediaType: 'image',
    videoQuality: 'sd',
    aspectRatio: '1:1',
    targetUrl: '',
    colSpan: 1,
    rowSpan: 1,
    mediaScale: 100,
    fontStyle: 'font-sans',
    textGradient: 'text-slate-200',
    customHex: ''
  });

  const [errors, setErrors] = useState({});
  const [shake, setShake] = useState(false);

  // Perhitungan Biaya
  const unitSlotRate = formData.mediaType === 'video' 
    ? (formData.videoQuality === 'hd' ? 5000 : 1000)
    : 1000;

  const totalBoxes = formData.colSpan * formData.rowSpan;
  const formTotalPrice = totalBoxes * unitSlotRate;

  // Biaya Tambahan Resize
  const oldBoxes = (targetResizeSlot ? (targetResizeSlot.colSpan || 1) * (targetResizeSlot.rowSpan || 1) : 1);
  const newBoxes = selectedDimension.col * selectedDimension.row;
  const oldPaid = targetResizeSlot ? (targetResizeSlot.paidAmount || oldBoxes * 1000) : 0;
  const ratePerBox = (targetResizeSlot && targetResizeSlot.mediaType === 'video' && targetResizeSlot.videoQuality === 'hd') ? 5000 : 1000;
  const newTotalCost = newBoxes * ratePerBox;
  const upgradeCost = Math.max(0, newTotalCost - oldPaid);

  const handleMediaUpload = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      const isVid = file.type.indexOf('video') === 0;
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          mediaUrl: String(reader.result || ''),
          mediaType: isVid ? 'video' : 'image'
        }));
        if (errors.mediaUrl) setErrors((prev) => ({ ...prev, mediaUrl: false }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSlotClick = (index) => {
    const existing = slots.find((s) => s.id === index);
    if (existing && existing.isOccupied) {
      setSlots((prev) => prev.map((s) => s.id === index ? { ...s, clicks: s.clicks + 1 } : s));
      const target = (existing.socials && existing.socials.website) ? existing.socials.website : existing.targetUrl;
      window.open(target, '_blank');
    } else {
      setSelectedSlot(index);
      setFormData({
        title: '',
        mediaUrl: '',
        mediaType: 'image',
        videoQuality: 'sd',
        aspectRatio: '1:1',
        targetUrl: '',
        colSpan: 1,
        rowSpan: 1,
        mediaScale: 100,
        fontStyle: 'font-sans',
        textGradient: 'text-slate-200',
        customHex: ''
      });
      setErrors({});
      setModalOpen(true);
    }
  };

  const applyRatioToDimensions = (ratio) => {
    let col = 1, row = 1;
    if (ratio === '9:16') { col = 1; row = 2; }
    else if (ratio === '16:9') { col = 2; row = 1; }
    else if (ratio === '4:5') { col = 2; row = 2; }
    setFormData((prev) => ({ ...prev, aspectRatio: ratio, colSpan: col, rowSpan: row }));
  };

  const handleOuterCornerTouch = (e, slotItem) => {
    e.stopPropagation();
    setTargetResizeSlot(slotItem);
    setSelectedDimension({
      col: slotItem.colSpan || 1,
      row: slotItem.rowSpan || 1
    });
    setResizeModalOpen(true);
  };

  const confirmResize = (e) => {
    e.preventDefault();
    if (!targetResizeSlot) return;

    setSlots((prev) => prev.map((s) => {
      if (s.id === targetResizeSlot.id) {
        return {
          ...s,
          colSpan: selectedDimension.col,
          rowSpan: selectedDimension.row,
          paidAmount: oldPaid + upgradeCost
        };
      }
      return s;
    }));

    setResizeModalOpen(false);
  };

  const handleOpenSocialModal = (e, slotItem) => {
    e.stopPropagation();
    setTargetSocialSlot(slotItem);
    setSocialInputs({
      tiktok: (slotItem.socials && slotItem.socials.tiktok) ? slotItem.socials.tiktok : '',
      instagram: (slotItem.socials && slotItem.socials.instagram) ? slotItem.socials.instagram : '',
      discord: (slotItem.socials && slotItem.socials.discord) ? slotItem.socials.discord : '',
      website: (slotItem.socials && slotItem.socials.website) ? slotItem.socials.website : (slotItem.targetUrl || '')
    });
    setSocialModalOpen(true);
  };

  const handleSaveSocials = (e) => {
    e.preventDefault();
    if (!targetSocialSlot) return;

    setSlots((prev) => prev.map((s) => {
      if (s.id === targetSocialSlot.id) {
        return {
          ...s,
          socials: { ...socialInputs }
        };
      }
      return s;
    }));

    setSocialModalOpen(false);
  };

  const handleOpenStyleModal = (e, slotItem) => {
    e.stopPropagation();
    setTargetStyleSlot(slotItem);
    setCustomFontFamily(slotItem.fontStyle || 'font-sans');
    setCustomTextColor(slotItem.textGradient || 'text-slate-200');
    setCustomHexColor(slotItem.customHex || '#10b981');
    setStyleModalOpen(true);
  };

  const handleSaveStyle = (e) => {
    e.preventDefault();
    if (!targetStyleSlot) return;

    setSlots((prev) => prev.map((s) => {
      if (s.id === targetStyleSlot.id) {
        return { 
          ...s, 
          fontStyle: customFontFamily,
          textGradient: customTextColor,
          customHex: customTextColor === 'custom' ? customHexColor : ''
        };
      }
      return s;
    }));

    setStyleModalOpen(false);
  };

  const handleClaimSlot = (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = true;
    if (!formData.mediaUrl) newErrors.mediaUrl = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setShake(true);
      setTimeout(() => setShake(false), 420);
      return;
    }

    setSlots((prev) => [
      ...prev.filter((s) => s.id !== selectedSlot),
      {
        id: selectedSlot,
        title: formData.title,
        mediaUrl: formData.mediaUrl,
        mediaType: formData.mediaType,
        videoQuality: formData.videoQuality,
        aspectRatio: formData.aspectRatio,
        targetUrl: formData.targetUrl.indexOf('http') === 0 ? formData.targetUrl : (formData.targetUrl ? `https://${formData.targetUrl}` : 'https://google.com'),
        colSpan: formData.colSpan,
        rowSpan: formData.rowSpan,
        scale: Number(formData.mediaScale),
        fontStyle: formData.fontStyle,
        textGradient: formData.textGradient,
        customHex: formData.customHex,
        clicks: 0,
        views: 1,
        paidAmount: formTotalPrice,
        socials: { tiktok: '', instagram: '', discord: '', website: formData.targetUrl },
        isOccupied: true
      }
    ]);

    setModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#05070d] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black antialiased relative overflow-x-hidden">
      
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-emerald-500/10 rounded-full blur-[110px]" />
        <div className="absolute top-1/2 -right-32 w-80 h-80 bg-cyan-600/10 rounded-full blur-[130px]" />
      </div>

      <style>{`
        @keyframes liquidShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          50% { transform: translateX(6px); }
          75% { transform: translateX(-4px); }
        }
        .animate-shake {
          animation: liquidShake 0.4s ease-in-out both;
        }
      `}</style>

      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-[#0a0e1a]/85 backdrop-blur-xl sticky top-0 z-40 px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-white hover:border-emerald-500/80 transition-all active:scale-90 flex items-center justify-center overflow-hidden"
          >
            <div className={`transition-transform duration-300 ${sidebarOpen ? 'rotate-180' : 'rotate-0'}`}>
              {sidebarOpen ? <ChevronLeft className="w-5 h-5 text-emerald-400" /> : <Menu className="w-5 h-5 text-emerald-400" />}
            </div>
          </button>

          <div className="flex items-center gap-2">
            <img 
              src="/logo.png" 
              alt="ProMotion" 
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
              className="w-8 h-8 rounded-xl object-contain shadow-[0_0_15px_rgba(52,211,153,0.35)]"
            />
            <h1 className="font-extrabold text-base tracking-wide flex items-center select-none">
              <span className="bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">Pro</span>
              <span className="bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]">Motion</span>
            </h1>
          </div>
        </div>

        <div className="text-right flex items-center gap-2">
          {currentPlan !== 'free' && (
            <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border tracking-wide uppercase ${
              currentPlan === 'super'
                ? 'bg-amber-500/20 text-yellow-300 border-amber-400/50'
                : currentPlan === 'pro'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50'
                : 'bg-slate-800 text-slate-200 border-slate-700'
            }`}>
              {currentPlan === 'super' ? 'Motion Super' : currentPlan === 'pro' ? 'Motion Pro' : 'Motion Basic'}
            </span>
          )}
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
            Slot {slots.filter((s) => s.isOccupied).length}/{totalSlots}
          </span>
        </div>
      </header>

      {/* Drawer Menu Navigasi Kiri */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div 
            onClick={() => setSidebarOpen(false)} 
            className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-200"
          />

          <aside className="relative w-72 max-w-[80vw] h-full bg-[#080d18] border-r border-slate-800 p-5 flex flex-col justify-between z-10 shadow-2xl transition-transform duration-300">
            <div>
              <div className="flex items-center justify-between pb-5 border-b border-slate-800/80 mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center font-black text-black text-sm">
                    P
                  </div>
                  <span className="font-bold text-sm tracking-wide text-white">Menu Navigasi</span>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                  <X className="w-5 h-5 text-emerald-400" />
                </button>
              </div>

              <nav className="space-y-2">
                {[
                  { id: 'slot', label: '1. Slot (Billboard Utama)', icon: Plus, color: 'text-emerald-400' },
                  { id: 'premium', label: '2. Premium (Langganan)', icon: Crown, color: 'text-amber-400' },
                  { id: 'you', label: '3. You (Analisis Web)', icon: BarChart3, color: 'text-emerald-400' }
                ].map((tab) => {
                  const IconComp = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-xs transition-all active:scale-95 relative overflow-hidden ${
                        isActive
                          ? 'text-emerald-400 border border-emerald-500/40 bg-emerald-500/10'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                      }`}
                    >
                      <IconComp className={`w-4 h-4 ${tab.color}`} />
                      <span>{tab.label}</span>
                      {isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-400 rounded-r shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-[11px] text-slate-400">
              <span className="text-emerald-400 font-bold block mb-0.5 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" /> Billboard Komunitas Digital
              </span>
              Promosikan proyek, tautkan medsos, dan sesuaikan ukuran secara live.
            </div>
          </aside>
        </div>
      )}

      {/* Konten Halaman Aktif */}
      <div className="flex-1 flex flex-col">
        {/* TAB 1: BILLBOARD UTAMA */}
        {activeTab === 'slot' && (
          <div className="flex-1 flex flex-col z-10 transition-all duration-200">
            <section className="px-4 py-4 text-center max-w-xl mx-auto">
              <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-400 mb-2 font-medium tracking-wide">
                Promosikan Produk, Jasa, Website, dll anda di sini
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Papan iklan piksel digital komunitas. Pasang banner usahamu, tentukan ukuran custom, dan tautkan jejaring media sosial langsung secara instan.
              </p>
            </section>

            <main className="flex-1 px-3 pb-8 max-w-4xl mx-auto w-full">
              <div className="p-3 rounded-3xl bg-[#0a0f1d]/75 border border-slate-800/80 shadow-2xl backdrop-blur-xl">
                <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 auto-rows-fr">
                  {Array.from({ length: totalSlots }).map((_, i) => {
                    const slotIndex = i + 1;
                    const data = slots.find((s) => s.id === slotIndex);

                    const colClass = data && data.colSpan === 2 ? 'col-span-2' : (data && data.colSpan === 3 ? 'col-span-3' : 'col-span-1');
                    const rowClass = data && data.rowSpan === 2 ? 'row-span-2' : (data && data.rowSpan === 3 ? 'row-span-3' : 'row-span-1');

                    return (
                      <div
                        key={slotIndex}
                        onClick={() => handleSlotClick(slotIndex)}
                        className={`aspect-square rounded-2xl flex flex-col items-center justify-between p-1 relative cursor-pointer border transition-all duration-200 active:scale-95 ${colClass} ${rowClass} ${
                          data && data.isOccupied
                            ? 'bg-slate-900/90 border-emerald-500/50 hover:border-emerald-400'
                            : 'bg-slate-900/30 border-dashed border-slate-800 hover:border-emerald-500/60 hover:bg-emerald-950/20'
                        }`}
                      >
                        {data && data.isOccupied ? (
                          <>
                            {/* Kotak Banner Media */}
                            <div className="w-full flex-1 relative flex items-center justify-center overflow-hidden rounded-xl border border-slate-800/80">
                              {data.mediaType === 'video' ? (
                                <video
                                  src={data.mediaUrl}
                                  autoPlay
                                  loop
                                  muted
                                  playsInline
                                  style={{ transform: `scale(${(data.scale || 100) / 100})` }}
                                  className="w-full h-full object-cover rounded-xl pointer-events-none"
                                />
                              ) : (
                                <img
                                  src={data.mediaUrl}
                                  alt={data.title}
                                  style={{ transform: `scale(${(data.scale || 100) / 100})` }}
                                  className="w-full h-full object-contain rounded-xl pointer-events-none"
                                />
                              )}

                              <span className="absolute top-1 left-1 bg-black/85 border border-emerald-500/40 text-emerald-400 text-[8px] font-mono px-1 rounded z-10 shadow">
                                {data.colSpan}x{data.rowSpan}
                              </span>
                            </div>

                            {/* Handle Hijau di Luar Garis Banner */}
                            <div
                              onClick={(e) => handleOuterCornerTouch(e, data)}
                              title="Tarik / Ubah Ukuran Banner"
                              className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-br from-emerald-400 to-green-500 rounded-tl-full rounded-br-lg cursor-pointer z-30 border-2 border-[#0a0f1d] shadow-lg hover:scale-125 transition-transform"
                            />

                            {/* Bawah Banner: Nama Produk + Tombol Medsos (+) */}
                            <div className="w-full pt-1 flex items-center justify-between gap-1 overflow-hidden">
                              <div 
                                onClick={(e) => handleOpenStyleModal(e, data)}
                                className="flex-1 truncate text-left"
                                title="Klik untuk custom warna & font"
                              >
                                <span 
                                  style={data.customHex ? { color: data.customHex } : {}}
                                  className={`text-[9px] font-semibold truncate block ${data.fontStyle || 'font-sans'} ${data.textGradient || 'text-slate-200'}`}
                                >
                                  {data.title}
                                </span>
                              </div>

                              <button
                                onClick={(e) => handleOpenSocialModal(e, data)}
                                title="Tambah Link Medsos (TikTok, IG, Discord)"
                                className="w-4 h-4 rounded-full bg-slate-800 border border-emerald-500/60 flex items-center justify-center text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all active:scale-90 shrink-0 shadow-sm"
                              >
                                <Plus className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="flex-1 w-full flex flex-col items-center justify-center gap-0.5 text-slate-600 group-hover:text-emerald-400 transition-colors">
                            <Plus className="w-4 h-4" />
                            <span className="text-[9px] font-mono opacity-50">#{slotIndex}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </main>
          </div>
        )}

        {/* TAB 2: PREMIUM */}
        {activeTab === 'premium' && (
          <main className="flex-1 px-4 py-8 max-w-4xl mx-auto w-full z-10">
            <div className="text-center mb-8">
              <span className="px-3 py-1 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/25 text-xs font-semibold inline-flex items-center gap-1.5 mb-2">
                <Crown className="w-3.5 h-3.5" /> Paket Langganan Eksklusif
              </span>
              <h2 className="text-xl font-bold text-white">Tingkatkan Performa Promosi Brand Kamu</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              {/* Motion Basic */}
              <div className={`p-5 rounded-3xl bg-[#0c111e] border ${currentPlan === 'basic' ? 'border-slate-300 ring-2 ring-slate-400/40' : 'border-slate-800'}`}>
                <h3 className="font-bold text-white text-base">Motion Basic</h3>
                <p className="text-xl font-black text-slate-100 my-2">Rp15.000<span className="text-xs font-normal text-slate-400">/bln</span></p>
                <ul className="text-xs text-slate-300 space-y-2 mb-4">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-slate-400" /> Free 10 Kotak Grid</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-slate-400" /> Edit Logo Minimal 5x</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-slate-400" /> Warna Solid Bawaan</li>
                </ul>
                <button 
                  onClick={() => { setCurrentPlan('basic'); alert('Paket Motion Basic aktif!'); }}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold active:scale-95 transition-all"
                >
                  {currentPlan === 'basic' ? 'Paket Aktif' : 'Coba Motion Basic'}
                </button>
              </div>

              {/* Motion Pro */}
              <div className={`p-5 rounded-3xl bg-[#0c111e] border ${currentPlan === 'pro' ? 'border-emerald-400 ring-2 ring-emerald-500/40' : 'border-emerald-500/40'}`}>
                <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full inline-block mb-1">REKOMENDASI</span>
                <h3 className="font-extrabold text-base bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">Motion Pro</h3>
                <p className="text-xl font-black text-emerald-400 my-2">Rp25.000<span className="text-xs font-normal text-slate-400">/bln</span></p>
                <ul className="text-xs text-slate-300 space-y-2 mb-4">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Free 20 Kotak Grid</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Unlimited Edit Logo</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Warna Solid Bebas, Palet & Gradasi</li>
                </ul>
                <button 
                  onClick={() => { setCurrentPlan('pro'); alert('Paket Motion Pro aktif!'); }}
                  className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-xs shadow-md active:scale-95 transition-all"
                >
                  {currentPlan === 'pro' ? 'Paket Aktif' : 'Coba Motion Pro'}
                </button>
              </div>

              {/* Motion Super */}
              <div className={`p-5 rounded-3xl bg-[#0c111e] border ${currentPlan === 'super' ? 'border-amber-400 ring-2 ring-amber-400/50 shadow-lg' : 'border-amber-500/40'}`}>
                <span className="text-[9px] font-bold bg-amber-400/20 text-yellow-300 border border-amber-400/30 px-2.5 py-0.5 rounded-full inline-block mb-1">ULTIMATE TIER</span>
                <h3 className="font-extrabold text-base bg-gradient-to-r from-amber-300 to-yellow-500 bg-clip-text text-transparent">Motion Super</h3>
                <p className="text-xl font-black text-amber-400 my-2">Rp35.000<span className="text-xs font-normal text-slate-400">/bln</span></p>
                <ul className="text-xs text-slate-300 space-y-2 mb-4">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Semua Fitur Pro Termasuk</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Palet RGB & Custom Hex #ffff</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Prioritas Banner</li>
                </ul>
                <button 
                  onClick={() => { setCurrentPlan('super'); alert('Paket Motion Super aktif!'); }}
                  className="w-full py-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-extrabold rounded-xl text-xs shadow-md active:scale-95 transition-all"
                >
                  {currentPlan === 'super' ? 'Paket Aktif' : 'Coba Motion Super'}
                </button>
              </div>
            </div>
          </main>
        )}

        {/* TAB 3: YOU */}
        {activeTab === 'you' && (
          <main className="flex-1 px-4 py-8 max-w-3xl mx-auto w-full z-10">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-400" /> Analisis Slot Kamu
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-4 rounded-2xl bg-[#0c111e] border border-slate-800">
                <span className="text-slate-400 text-xs">Total Klik</span>
                <p className="text-2xl font-black text-white mt-1">
                  {slots.reduce((acc, curr) => acc + (curr.clicks || 0), 0)}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[#0c111e] border border-slate-800">
                <span className="text-slate-400 text-xs">Total Views</span>
                <p className="text-2xl font-black text-white mt-1">
                  {slots.reduce((acc, curr) => acc + (curr.views || 0), 0)}
                </p>
              </div>
            </div>
          </main>
        )}
      </div>

      {/* MODAL TAMBAH MEDIA SOSIAL */}
      {socialModalOpen && targetSocialSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setSocialModalOpen(false)}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
          />

          <div className="bg-[#0b101e] border border-emerald-500/50 w-full max-w-sm rounded-3xl p-5 shadow-2xl relative z-10">
            <button onClick={() => setSocialModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <Share2 className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">
                Tautkan Media Sosial: {targetSocialSlot.title}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Masukkan tautan akun media sosial atau toko onlinemu (opsional):
            </p>

            <form onSubmit={handleSaveSocials} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                  <span className="text-emerald-400 font-bold">TikTok</span>
                </label>
                <input
                  type="text"
                  placeholder="https://tiktok.com/@namamu"
                  value={socialInputs.tiktok}
                  onChange={(e) => setSocialInputs({ ...socialInputs, tiktok: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                  {/* SVG Instagram Murni */}
                  <svg className="w-3.5 h-3.5 text-pink-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                  </svg>
                  <span>Instagram</span>
                </label>
                <input
                  type="text"
                  placeholder="https://instagram.com/namamu"
                  value={socialInputs.instagram}
                  onChange={(e) => setSocialInputs({ ...socialInputs, instagram: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Discord Server / Invite</span>
                </label>
                <input
                  type="text"
                  placeholder="https://discord.gg/invite"
                  value={socialInputs.discord}
                  onChange={(e) => setSocialInputs({ ...socialInputs, discord: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-sky-400" />
                  <span>Website / Toko Online</span>
                </label>
                <input
                  type="text"
                  placeholder="https://tokoku.com"
                  value={socialInputs.website}
                  onChange={(e) => setSocialInputs({ ...socialInputs, website: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 font-bold text-black text-xs shadow-md transition-all active:scale-95"
                >
                  Simpan Media Sosial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP RESIZE HANDLE LUAR */}
      {resizeModalOpen && targetResizeSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setResizeModalOpen(false)}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
          />

          <div className="bg-[#0b101e] border border-emerald-500/50 w-full max-w-sm rounded-3xl p-5 shadow-2xl relative z-10">
            <button onClick={() => setResizeModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 bg-gradient-to-br from-emerald-400 to-green-500 rounded-tl-full rounded-br-md shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
              <h3 className="text-sm font-bold text-white">
                Kustomisasi Ukuran Banner
              </h3>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Pilih ukuran dan rasio slot baru untuk #{targetResizeSlot.id}:
            </p>

            <form onSubmit={confirmResize} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: '1:1 Square (1x1)', col: 1, row: 1 },
                  { label: '16:9 Melebar (2x1)', col: 2, row: 1 },
                  { label: '9:16 Tegak (1x2)', col: 1, row: 2 },
                  { label: '4:5 Portrait (2x2)', col: 2, row: 2 },
                  { label: '2:1 Wide (3x2)', col: 3, row: 2 },
                  { label: '3x3 Giant Box', col: 3, row: 3 }
                ].map((dim) => {
                  const isSelected = selectedDimension.col === dim.col && selectedDimension.row === dim.row;
                  return (
                    <button
                      type="button"
                      key={dim.label}
                      onClick={() => setSelectedDimension({ col: dim.col, row: dim.row })}
                      className={`p-2.5 rounded-xl border text-xs text-left transition-all active:scale-95 flex items-center justify-between ${
                        isSelected 
                          ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 font-bold shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
                          : 'border-slate-800 bg-slate-950 text-slate-400'
                      }`}
                    >
                      <span>{dim.label}</span>
                      <span className="text-[10px] opacity-70">{dim.col * dim.row} Kotak</span>
                    </button>
                  );
                })}
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                <span className="text-xs text-slate-300 block">Total Biaya Tambahan:</span>
                <span className="text-base font-extrabold text-emerald-400">
                  {upgradeCost === 0 ? 'Lunas / Gratis' : `bayar Rp.${upgradeCost.toLocaleString('id-ID')}`}
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 font-bold text-black text-xs shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all active:scale-95"
              >
                {upgradeCost === 0 ? 'Terapkan Ukuran' : `Ubah ukuran? bayar Rp.${upgradeCost.toLocaleString('id-ID')}`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL GAYA, FONT & PALET WARNA */}
      {styleModalOpen && targetStyleSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setStyleModalOpen(false)}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
          />

          <div className="bg-[#0b101e] border border-emerald-500/40 w-full max-w-sm rounded-3xl p-5 shadow-2xl relative max-h-[90vh] overflow-y-auto z-10">
            <button onClick={() => setStyleModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-1.5">
              <Type className="w-4 h-4 text-emerald-400" />
              Gaya & Warna: {targetStyleSlot.title}
            </h3>
            <p className="text-xs text-slate-400 mb-4">Pilih font, warna solid, palet RGB lingkaran, atau custom hex.</p>

            <form onSubmit={handleSaveStyle} className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1.5">Pilihan Font</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Sans Modern', value: 'font-sans' },
                    { label: 'Monospace Code', value: 'font-mono' },
                    { label: 'Serif Elegan', value: 'font-serif' },
                    { label: 'Italic Casual', value: 'italic font-sans' }
                  ].map((f) => (
                    <button
                      type="button"
                      key={f.value}
                      onClick={() => setCustomFontFamily(f.value)}
                      className={`py-2 px-2.5 rounded-xl border text-xs text-center transition-all ${
                        customFontFamily === f.value 
                          ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 font-bold' 
                          : 'border-slate-800 bg-slate-950 text-slate-400'
                      }`}
                    >
                      <span className={f.value}>{f.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-3">
                <label className="block text-[11px] font-medium text-slate-300 flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5 text-emerald-400" />
                  Warna Solid & Palet Lingkaran
                </label>

                {/* Palet Lingkaran Preset */}
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    '#ffffff', '#10b981', '#3b82f6', '#f59e0b', 
                    '#ec4899', '#8b5cf6', '#ef4444', '#06b6d4', '#e2e8f0'
                  ].map((color) => (
                    <button
                      type="button"
                      key={color}
                      onClick={() => { setCustomTextColor('custom'); setCustomHexColor(color); }}
                      style={{ backgroundColor: color }}
                      className={`w-6 h-6 rounded-full border-2 transition-all active:scale-90 ${
                        customTextColor === 'custom' && customHexColor.toLowerCase() === color.toLowerCase() 
                          ? 'border-white ring-2 ring-emerald-400 scale-110' 
                          : 'border-transparent'
                      }`}
                    />
                  ))}
                </div>

                {/* Input Custom Hex & Picker */}
                <div className="flex items-center gap-2 pt-1 bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
                  <input
                    type="color"
                    value={customHexColor.indexOf('#') === 0 ? customHexColor : '#10b981'}
                    onChange={(e) => { setCustomTextColor('custom'); setCustomHexColor(e.target.value); }}
                    className="w-8 h-8 rounded-xl cursor-pointer bg-transparent border-0"
                  />
                  <div className="flex-1">
                    <span className="text-[10px] text-slate-400 block">Kode Hex Warna:</span>
                    <input
                      type="text"
                      placeholder="#ffffff"
                      value={customHexColor}
                      onChange={(e) => { setCustomTextColor('custom'); setCustomHexColor(e.target.value); }}
                      className="w-full text-xs font-mono bg-transparent text-white focus:outline-none uppercase"
                    />
                  </div>
                </div>

                {/* Gradasi Bawaan */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {[
                    { label: 'Hijau Gradasi', val: 'bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent' },
                    { label: 'Biru Gradasi', val: 'bg-gradient-to-r from-sky-400 to-blue-600 bg-clip-text text-transparent' },
                    { label: 'Kuning Gradasi', val: 'bg-gradient-to-r from-amber-300 to-yellow-500 bg-clip-text text-transparent' },
                    { label: 'Pink Gradasi', val: 'bg-gradient-to-r from-pink-400 to-rose-500 bg-clip-text text-transparent' }
                  ].map((grad) => (
                    <button
                      type="button"
                      key={grad.label}
                      onClick={() => { setCustomTextColor(grad.val); setCustomHexColor(''); }}
                      className={`py-1.5 px-2 rounded-xl border text-[11px] text-left transition-all ${
                        customTextColor === grad.val ? 'border-emerald-400 bg-slate-900 font-bold' : 'border-slate-800 bg-slate-950 text-slate-400'
                      }`}
                    >
                      <span className={grad.val}>{grad.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 font-bold text-black text-xs transition-all active:scale-95 shadow-lg"
              >
                Simpan Tampilan
              </button>
            </form>
          </div>
        </div>
      )}

      {/* POPUP PASANG SLOT BARU */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setModalOpen(false)}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
          />

          <div className={`bg-[#0b101e] border ${shake ? 'border-red-500 animate-shake' : 'border-slate-800'} w-full max-w-md rounded-3xl p-5 shadow-2xl relative max-h-[90vh] overflow-y-auto z-10`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-emerald-400" />
                  Sewa Slot # {selectedSlot}
                </h3>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  Rp {formTotalPrice.toLocaleString('id-ID')}
                </span>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-500 to-green-400 text-black flex items-center justify-center active:scale-90"
              >
                <X className="w-4 h-4 font-black" />
              </button>
            </div>

            <form onSubmit={handleClaimSlot} noValidate className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Nama Merek / Produk
                </label>
                <input
                  type="text"
                  placeholder="Contoh: aowkwok Store"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value });
                    if (errors.title) setErrors({ ...errors, title: false });
                  }}
                  className={`w-full px-3 py-2 text-xs bg-slate-950 border rounded-xl text-white focus:outline-none transition-colors ${
                    errors.title ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)] animate-shake' : 'border-slate-800 focus:border-emerald-500'
                  }`}
                />
                {errors.title && <p className="text-[10px] text-red-400 mt-1">Nama produk wajib diisi.</p>}
              </div>

              {/* Rasio Cepat */}
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <span className="text-[11px] font-medium text-slate-300 block mb-2">
                  Pilih Aspek Rasio: <strong className="text-emerald-400">{formData.aspectRatio} ({totalBoxes} Kotak)</strong>
                </span>
                <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
                  {[
                    { label: '1:1', val: '1:1' },
                    { label: '9:16', val: '9:16' },
                    { label: '16:9', val: '16:9' },
                    { label: '4:5', val: '4:5' }
                  ].map((ratio) => (
                    <button
                      type="button"
                      key={ratio.val}
                      onClick={() => applyRatioToDimensions(ratio.val)}
                      className={`py-1.5 px-1 rounded-xl border transition-all active:scale-95 ${
                        formData.aspectRatio === ratio.val
                          ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 font-bold shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                          : 'border-slate-800 bg-slate-900 text-slate-400'
                      }`}
                    >
                      {ratio.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Unggah Media */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Unggah Media (Gambar / Video)
                </label>

                <label className={`cursor-pointer flex flex-col items-center justify-center p-3.5 border-2 border-dashed rounded-2xl bg-slate-950 transition-all ${
                  errors.mediaUrl ? 'border-red-500 text-red-400 animate-shake' : 'border-slate-800 hover:border-emerald-500 text-slate-400'
                }`}>
                  <Upload className="w-5 h-5 text-emerald-400 mb-1" />
                  <span className="text-xs font-medium text-slate-200">
                    {formData.mediaUrl ? 'Ganti File Media' : 'Pilih Gambar atau Video'}
                  </span>
                  <input
                    type="file"
                    accept="image/*,video/mp4,video/webm"
                    onChange={handleMediaUpload}
                    className="hidden"
                  />
                </label>
                {errors.mediaUrl && <p className="text-[10px] text-red-400 mt-1">Unggah media terlebih dahulu.</p>}

                {/* Video Quality */}
                {formData.mediaType === 'video' && (
                  <div className="mt-2.5 p-2.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                    <span className="text-[11px] font-semibold text-slate-300 block">Resolusi Video</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, videoQuality: 'sd' })}
                        className={`py-1.5 px-2 rounded-xl border text-xs text-center ${
                          formData.videoQuality === 'sd' ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 font-bold' : 'border-slate-800 bg-slate-900 text-slate-400'
                        }`}
                      >
                        Standard (Rp1.000/kotak)
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, videoQuality: 'hd' })}
                        className={`py-1.5 px-2 rounded-xl border text-xs text-center ${
                          formData.videoQuality === 'hd' ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 font-bold' : 'border-slate-800 bg-slate-900 text-slate-400'
                        }`}
                      >
                        HD 60fps (Rp5.000/kotak)
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Link Default */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Link Tujuan Default (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="https://toko-kamu.com (bisa diatur medsos nanti via icon +)"
                  value={formData.targetUrl}
                  onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 font-bold text-black text-xs transition-all active:scale-95 shadow-lg"
                >
                  Bayar Rp {formTotalPrice.toLocaleString('id-ID')} & Pasang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}