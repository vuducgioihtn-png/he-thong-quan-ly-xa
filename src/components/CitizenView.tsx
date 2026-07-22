/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from "react";
import { UserRole, WardTenant, Village, Official, AdministrativeOffice, Announcement, FieldReflection } from "../types";
import { 
  Search, Landmark, MapPin, Users, Phone, Mail, QrCode, FileText, 
  Map, Calendar, ArrowRight, X, PhoneCall, Copy, Check, Info,
  AlertCircle, ChevronRight, Upload, MapPinned, Activity, HelpCircle, UserPlus,
  Video, Image, Play, Trash2, Film, FileVideo, Paperclip
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CitizenViewProps {
  activeTenant: WardTenant;
  villages: Village[];
  officials: Official[];
  offices: AdministrativeOffice[];
  announcements: Announcement[];
  reflections: FieldReflection[];
  onSubmitReflection: (reflection: Omit<FieldReflection, "id" | "createdAt" | "status">) => void;
  isCustomerLoggedIn: boolean;
  onToggleCustomerLogin: () => void;
  loggedInCitizen?: any;
  onLoginCitizen?: (citizen: any) => void;
  onLogoutCitizen?: () => void;
  onOpenCitizenAuth?: (tab: "login" | "register") => void;
}

const getMapEmbedUrl = (input: string): string | null => {
  if (!input) return null;
  const trimmed = input.trim();
  if (trimmed.startsWith("<iframe") || trimmed.includes("src=")) {
    const match = trimmed.match(/src="([^"]+)"/);
    if (match && match[1]) {
      return match[1];
    }
  }
  return trimmed;
};

export default function CitizenView({
  activeTenant,
  villages,
  officials,
  offices,
  announcements,
  reflections,
  onSubmitReflection,
  isCustomerLoggedIn,
  onToggleCustomerLogin,
  loggedInCitizen,
  onLoginCitizen,
  onLogoutCitizen,
  onOpenCitizenAuth
}: CitizenViewProps) {
  // Navigation tabs within Citizen portal
  const [activeTab, setActiveTab] = useState<"home" | "villages" | "officials" | "offices" | "reflections">("home");
  
  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  
  // Detail views state
  const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);
  const [selectedOffice, setSelectedOffice] = useState<AdministrativeOffice | null>(null);
  
  // QR modal state
  const [qrModalUrl, setQrModalUrl] = useState<{title: string, url: string, lat?: number, lng?: number} | null>(null);
  const [villageMapViewMode, setVillageMapViewMode] = useState<"satellite" | "roadmap">("satellite");
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  // Helper function to build directions link
  const getVillageDirectionsUrl = (v: { latitude?: number; longitude?: number; googleMapUrl?: string; name?: string }) => {
    if (v.latitude && v.longitude) {
      return `https://www.google.com/maps/dir/?api=1&destination=${v.latitude},${v.longitude}`;
    }
    if (v.googleMapUrl && v.googleMapUrl.includes("google.com/maps")) {
      return v.googleMapUrl;
    }
    return `https://maps.google.com/?q=${encodeURIComponent(v.name || 'Thôn')}`;
  };

  // Helper function to build map embed URL for satellite / roadmap view
  const getVillageEmbedUrl = (v: Village, mode: "satellite" | "roadmap") => {
    if (v.mapIframe && mode === "satellite") {
      const embedUrl = getMapEmbedUrl(v.mapIframe);
      if (embedUrl) return embedUrl;
    }
    const mapType = mode === "satellite" ? "k" : "m";
    const lat = v.latitude || 20.2458;
    const lng = v.longitude || 106.0825;
    return `https://maps.google.com/maps?q=${lat},${lng}&t=${mapType}&z=16&output=embed`;
  };
  
  // Reflection form states
  const [reflectionForm, setReflectionForm] = useState<{
    citizenName: string;
    citizenPhone: string;
    villageId: string;
    title: string;
    content: string;
    latitude: number;
    longitude: number;
    imageUrl?: string;
    videoUrl?: string;
    mediaType?: "image" | "video";
    mediaFileName?: string;
  }>({
    citizenName: "",
    citizenPhone: "",
    villageId: "",
    title: "",
    content: "",
    latitude: 20.245,
    longitude: 106.082
  });
  const [reflectionSuccess, setReflectionSuccess] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Handle image or video file upload
  const handleReflectionMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");

    if (!isVideo && !isImage) {
      alert("Vui lòng chọn tệp hình ảnh (jpg, png, webp) hoặc tệp video (mp4, webm, mov)!");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (isVideo) {
        setReflectionForm((prev) => ({
          ...prev,
          videoUrl: dataUrl,
          imageUrl: undefined,
          mediaType: "video",
          mediaFileName: file.name
        }));
      } else {
        setReflectionForm((prev) => ({
          ...prev,
          imageUrl: dataUrl,
          videoUrl: undefined,
          mediaType: "image",
          mediaFileName: file.name
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Favorite state management
  const [favoriteVillages, setFavoriteVillages] = useState<string[]>(() => {
    const saved = localStorage.getItem("vims_fav_villages");
    return saved ? JSON.parse(saved) : [];
  });
  
  const [favoriteOfficials, setFavoriteOfficials] = useState<string[]>(() => {
    const saved = localStorage.getItem("vims_fav_officials");
    return saved ? JSON.parse(saved) : [];
  });

  const [officialRatings, setOfficialRatings] = useState<Record<string, { rating: number; count: number; reviews: { stars: number; text: string; date: string }[] }>>(() => {
    const saved = localStorage.getItem("vims_official_ratings");
    if (saved) return JSON.parse(saved);
    // Initialize with some default ratings
    return {
      "o-kt-v1-1": { rating: 4.8, count: 4, reviews: [
        { stars: 5, text: "Bác Bí thư làm việc cực kỳ trách nhiệm, nhiệt tình hỗ trợ nhân dân làm thủ tục hành chính.", date: "12/07/2026" },
        { stars: 5, text: "Cán bộ mẫu mực!", date: "10/07/2026" },
        { stars: 4, text: "Hỗ trợ nhanh chóng.", date: "08/07/2026" }
      ]},
      "o-kt-v1-2": { rating: 4.5, count: 2, reviews: [
        { stars: 5, text: "Thái độ niềm nở, giải thích rõ ràng chi tiết.", date: "14/07/2026" },
        { stars: 4, text: "Tốt.", date: "09/07/2026" }
      ]}
    };
  });

  // Modal for rating
  const [ratingOfficial, setRatingOfficial] = useState<Official | null>(null);
  const [newRatingStars, setNewRatingStars] = useState(5);
  const [newRatingText, setNewRatingText] = useState("");

  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Sync favorites & ratings
  useEffect(() => {
    localStorage.setItem("vims_fav_villages", JSON.stringify(favoriteVillages));
  }, [favoriteVillages]);

  useEffect(() => {
    localStorage.setItem("vims_fav_officials", JSON.stringify(favoriteOfficials));
  }, [favoriteOfficials]);

  useEffect(() => {
    localStorage.setItem("vims_official_ratings", JSON.stringify(officialRatings));
  }, [officialRatings]);

  // Auto-fill reflection form when citizen logs in
  useEffect(() => {
    if (isCustomerLoggedIn && loggedInCitizen) {
      setReflectionForm(prev => ({
        ...prev,
        citizenName: loggedInCitizen.fullName || "",
        citizenPhone: loggedInCitizen.phone || "",
        villageId: loggedInCitizen.villageId || prev.villageId
      }));
    } else {
      setReflectionForm(prev => ({
        ...prev,
        citizenName: "",
        citizenPhone: "",
        villageId: ""
      }));
    }
  }, [isCustomerLoggedIn, loggedInCitizen]);

  const toggleFavoriteVillage = (id: string) => {
    if (!isCustomerLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }
    setFavoriteVillages(prev => 
      prev.includes(id) ? prev.filter(vid => vid !== id) : [...prev, id]
    );
  };

  const toggleFavoriteOfficial = (id: string) => {
    if (!isCustomerLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }
    setFavoriteOfficials(prev => 
      prev.includes(id) ? prev.filter(oid => oid !== id) : [...prev, id]
    );
  };

  const handleOpenRatingModal = (o: Official) => {
    if (!isCustomerLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }
    setRatingOfficial(o);
    setNewRatingStars(5);
    setNewRatingText("");
  };

  const handleSubmitRating = () => {
    if (!ratingOfficial) return;
    const current = officialRatings[ratingOfficial.id] || { rating: 0, count: 0, reviews: [] };
    const newReviews = [
      { stars: newRatingStars, text: newRatingText || "Cán bộ nhiệt tình, trách nhiệm giải quyết việc thôn.", date: new Date().toLocaleDateString("vi-VN") },
      ...current.reviews
    ];
    const avgRating = Math.round((newReviews.reduce((sum, r) => sum + r.stars, 0) / newReviews.length) * 10) / 10;
    
    setOfficialRatings(prev => ({
      ...prev,
      [ratingOfficial.id]: {
        rating: avgRating,
        count: newReviews.length,
        reviews: newReviews
      }
    }));
    setRatingOfficial(null);
  };

  // Filter local data to match active tenant and ONLY show Published records (or items with status not draft/pending/approved/rejected)
  const tenantVillages = useMemo(() => 
    villages.filter(v => v.wardId === activeTenant.id), 
    [villages, activeTenant]
  );
  const tenantOfficials = useMemo(() => 
    officials.filter(o => o.wardId === activeTenant.id && o.status !== "DRAFT" && o.status !== "PENDING" && o.status !== "APPROVED" && o.status !== "REJECTED"), 
    [officials, activeTenant]
  );
  const tenantOffices = useMemo(() => offices.filter(of => of.wardId === activeTenant.id), [offices, activeTenant]);
  const tenantAnnouncements = useMemo(() => 
    announcements.filter(a => a.wardId === activeTenant.id && a.status !== "DRAFT" && a.status !== "PENDING" && a.status !== "APPROVED" && a.status !== "REJECTED"), 
    [announcements, activeTenant]
  );
  const tenantReflections = useMemo(() => reflections.filter(r => r.wardId === activeTenant.id), [reflections, activeTenant]);

  // Real-time statistics aggregation (Dynamically calculated, not hardcoded)
  const stats = useMemo(() => {
    const totalVillages = tenantVillages.length;
    const totalHouseholds = tenantVillages.reduce((sum, v) => sum + v.householdCount, 0);
    const totalPopulation = tenantVillages.reduce((sum, v) => sum + v.population, 0);
    const totalArea = activeTenant.naturalArea !== undefined ? activeTenant.naturalArea : 0;
    const totalOfficials = tenantOfficials.length;
    const totalCultureHouses = tenantVillages.filter(v => v.hasCultureHouse).length;
    
    return {
      totalVillages,
      totalHouseholds,
      totalPopulation,
      totalArea: Math.round((totalArea / 100) * 100) / 100, // Chuyển từ ha sang km²
      totalOfficials,
      totalCultureHouses
    };
  }, [tenantVillages, tenantOfficials, activeTenant.naturalArea]);

  // Unified Full-Text Search logic
  // Matches query against village names, former names, culture houses, official names, phone numbers
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();

    const matchingVillages = tenantVillages.filter(
      v => v.name.toLowerCase().includes(q) || 
           v.formerNames.toLowerCase().includes(q) ||
           (v.hasCultureHouse && v.cultureHouseAddress.toLowerCase().includes(q))
    );

    const matchingOfficials = tenantOfficials.filter(
      o => o.name.toLowerCase().includes(q) || 
           o.phone.includes(q) || 
           o.position.toLowerCase().includes(q)
    );

    const matchingOffices = tenantOffices.filter(
      of => of.name.toLowerCase().includes(of.name.toLowerCase().includes(q) || q) || 
            of.description.toLowerCase().includes(q)
    );

    return {
      villages: matchingVillages,
      officials: matchingOfficials,
      offices: matchingOffices
    };
  }, [searchQuery, tenantVillages, tenantOfficials, tenantOffices]);

  // Action helpers (copy phone or open dialer)
  const handleCall = (phone: string, id: string) => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = `tel:${phone}`;
    } else {
      navigator.clipboard.writeText(phone);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Submit Reflection
  const handleReflectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflectionForm.citizenName || !reflectionForm.citizenPhone || !reflectionForm.title || !reflectionForm.content || !reflectionForm.villageId) {
      return;
    }
    onSubmitReflection({
      wardId: activeTenant.id,
      villageId: reflectionForm.villageId,
      citizenName: reflectionForm.citizenName,
      citizenPhone: reflectionForm.citizenPhone,
      title: reflectionForm.title,
      content: reflectionForm.content,
      latitude: reflectionForm.latitude,
      longitude: reflectionForm.longitude,
      imageUrl: reflectionForm.imageUrl,
      videoUrl: reflectionForm.videoUrl,
      mediaType: reflectionForm.mediaType
    });

    setReflectionSuccess(true);
    setTimeout(() => {
      setReflectionSuccess(false);
      setReflectionForm({
        citizenName: "",
        citizenPhone: "",
        villageId: "",
        title: "",
        content: "",
        latitude: 20.245,
        longitude: 106.082,
        imageUrl: undefined,
        videoUrl: undefined,
        mediaType: undefined,
        mediaFileName: undefined
      });
      setActiveTab("home");
    }, 3000);
  };

  // Filter states for officials directory
  const [offVillageFilter, setOffVillageFilter] = useState("");
  const [offPositionFilter, setOffPositionFilter] = useState("");
  const [offSearchFilter, setOffSearchFilter] = useState("");

  const filteredOfficials = useMemo(() => {
    return tenantOfficials.filter(o => {
      const matchVillage = !offVillageFilter || o.villageId === offVillageFilter;
      const matchPosition = !offPositionFilter || o.position.toLowerCase().includes(offPositionFilter.toLowerCase());
      const matchSearch = !offSearchFilter || o.name.toLowerCase().includes(offSearchFilter.toLowerCase()) || o.phone.includes(offSearchFilter);
      return matchVillage && matchPosition && matchSearch;
    });
  }, [tenantOfficials, offVillageFilter, offPositionFilter, offSearchFilter]);

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 pb-12" id="citizen-portal">
      
      {/* Banner / Header Branding Section */}
      <div className="relative overflow-hidden bg-slate-900 text-white py-12 px-6">
        <div className="absolute inset-0 z-0 opacity-45">
          <img 
            src={activeTenant.banner} 
            alt={activeTenant.name} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/25 text-indigo-300 rounded-full text-xs font-semibold mb-3 border border-indigo-500/40">
              <Landmark className="w-3.5 h-3.5" />
              <span>Cổng Thông Tin Hành Chính Điện Tử</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-3">
              {activeTenant.name}
            </h1>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed line-clamp-3">
              {activeTenant.introduction}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 flex flex-col items-center text-center self-stretch justify-center md:self-auto md:w-64 shrink-0">
            <span className="text-xs font-mono text-indigo-400 font-bold uppercase tracking-wider mb-2">Đường Dây Nóng</span>
            <Phone className="w-8 h-8 text-indigo-400 mb-2 animate-pulse" />
            <span className="text-lg font-bold font-mono text-white">{activeTenant.phone}</span>
            <span className="text-xs text-slate-300 mt-1">{activeTenant.email}</span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        
        {/* Navigation Tabs bar */}
        <div className="flex border-b border-slate-200 bg-white rounded-t-xl shadow-sm overflow-x-auto scrollbar-none">
          <button 
            onClick={() => { setActiveTab("home"); setSearchQuery(""); }}
            className={`px-5 py-4 text-sm font-medium border-b-2 transition-all duration-150 whitespace-nowrap ${
              activeTab === "home" ? "border-indigo-600 text-indigo-700 font-bold" : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
            }`}
            id="tab-home"
          >
            Tổng Quan & Tin Tức
          </button>
          <button 
            onClick={() => { setActiveTab("villages"); setSearchQuery(""); }}
            className={`px-5 py-4 text-sm font-medium border-b-2 transition-all duration-150 whitespace-nowrap ${
              activeTab === "villages" ? "border-indigo-600 text-indigo-700 font-bold" : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
            }`}
            id="tab-villages"
          >
            Thông Tin Thôn (Sáp nhập)
          </button>
          <button 
            onClick={() => { setActiveTab("officials"); setSearchQuery(""); }}
            className={`px-5 py-4 text-sm font-medium border-b-2 transition-all duration-150 whitespace-nowrap ${
              activeTab === "officials" ? "border-indigo-600 text-indigo-700 font-bold" : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
            }`}
            id="tab-officials"
          >
            Danh Bạ Cán Bộ
          </button>
          <button 
            onClick={() => { setActiveTab("offices"); setSearchQuery(""); }}
            className={`px-5 py-4 text-sm font-medium border-b-2 transition-all duration-150 whitespace-nowrap ${
              activeTab === "offices" ? "border-indigo-600 text-indigo-700 font-bold" : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
            }`}
            id="tab-offices"
          >
            Cơ Quan Hành Chính
          </button>
          <button 
            onClick={() => { setActiveTab("reflections"); setSearchQuery(""); }}
            className={`px-5 py-4 text-sm font-medium border-b-2 transition-all duration-150 whitespace-nowrap ${
              activeTab === "reflections" ? "border-indigo-600 text-indigo-700 font-bold" : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
            }`}
            id="tab-reflections"
          >
            Phản Ánh Hiện Trường
          </button>
        </div>

        {/* Real-Time Stats Bar Widget */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mt-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="p-3 border-r border-slate-100 last:border-0 flex flex-col justify-center">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Tổng số thôn</span>
            <span className="text-2xl font-extrabold text-slate-900 mt-1 flex items-baseline gap-1">
              {stats.totalVillages} <span className="text-xs font-normal text-slate-400">thôn</span>
            </span>
          </div>
          <div className="p-3 md:border-r border-slate-100 last:border-0 flex flex-col justify-center">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Tổng số hộ</span>
            <span className="text-2xl font-extrabold text-slate-900 mt-1 flex items-baseline gap-1">
              {stats.totalHouseholds.toLocaleString()} <span className="text-xs font-normal text-slate-400">hộ</span>
            </span>
          </div>
          <div className="p-3 border-r border-slate-100 last:border-0 flex flex-col justify-center">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Tổng dân số</span>
            <span className="text-2xl font-extrabold text-slate-900 mt-1 flex items-baseline gap-1">
              {stats.totalPopulation.toLocaleString()} <span className="text-xs font-normal text-slate-400">người</span>
            </span>
          </div>
          <div className="p-3 md:border-r border-slate-100 last:border-0 flex flex-col justify-center">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Diện tích tự nhiên</span>
            <span className="text-2xl font-extrabold text-slate-900 mt-1 flex items-baseline gap-1">
              {stats.totalArea} <span className="text-xs font-normal text-slate-400">km²</span>
            </span>
          </div>
          <div className="p-3 border-r border-slate-100 last:border-0 flex flex-col justify-center">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Số cán bộ thôn/xã</span>
            <span className="text-2xl font-extrabold text-slate-900 mt-1 flex items-baseline gap-1">
              {stats.totalOfficials} <span className="text-xs font-normal text-slate-400">đ/chí</span>
            </span>
          </div>
          <div className="p-3 flex flex-col justify-center">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Nhà văn hóa đạt chuẩn</span>
            <span className="text-2xl font-extrabold text-slate-900 mt-1 flex items-baseline gap-1">
              {stats.totalCultureHouses}/{stats.totalVillages} <span className="text-xs font-normal text-slate-400">NVH</span>
            </span>
          </div>
        </div>

        {/* Global Unified Search Input */}
        <div className="mt-4 relative bg-white p-2 rounded-xl shadow-sm border border-slate-200">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Nhập tên thôn, tên cán bộ, số điện thoại, hoặc tên nhà văn hóa để tìm kiếm nhanh..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 pl-11 pr-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white border border-slate-200 transition-all font-medium"
              id="global-search-input"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-200 hover:bg-slate-300 p-1 rounded-full text-slate-600 transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Unified Full-Text Search Results Panel */}
        {searchResults !== null && (
          <div className="mt-4 bg-white rounded-xl shadow-lg border border-indigo-100 p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Search className="w-4 h-4 text-indigo-600" />
                Kết quả tìm kiếm cho: <span className="text-indigo-700">"{searchQuery}"</span>
              </h2>
              <span className="text-xs text-slate-400 font-mono">
                {searchResults.villages.length + searchResults.officials.length + searchResults.offices.length} kết quả
              </span>
            </div>

            {/* Empty state */}
            {searchResults.villages.length === 0 && searchResults.officials.length === 0 && searchResults.offices.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium">Không tìm thấy kết quả nào phù hợp.</p>
                <p className="text-xs text-slate-400 mt-1">Vui lòng thử từ khóa khác như "Tăng", "Khoa", "0912", "UBND"...</p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Matching Villages */}
              {searchResults.villages.length > 0 && (
                <div className="border-r border-slate-100 pr-4 last:border-0">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Thôn / Xóm ({searchResults.villages.length})</h3>
                  <div className="space-y-3">
                    {searchResults.villages.map(v => (
                      <div 
                        key={v.id} 
                        onClick={() => { setSelectedVillage(v); setSearchQuery(""); }}
                        className="p-3 bg-slate-50 hover:bg-indigo-50/50 rounded-lg border border-slate-100 hover:border-indigo-200 cursor-pointer transition-all"
                      >
                        <div className="font-bold text-slate-900 text-sm">{v.name}</div>
                        <div className="text-xs text-slate-500 mt-1">Sáp nhập từ: {v.formerNames}</div>
                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-200/55 text-[11px] text-slate-600 font-mono">
                          <span>{v.householdCount} hộ</span>
                          <span>{v.population} khẩu</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Matching Officials */}
              {searchResults.officials.length > 0 && (
                <div className="border-r border-slate-100 pr-4 last:border-0">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Cán bộ liên quan ({searchResults.officials.length})</h3>
                  <div className="space-y-3">
                    {searchResults.officials.map(o => (
                      <div 
                        key={o.id}
                        className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-3"
                      >
                        <img 
                          src={o.avatar} 
                          alt={o.name} 
                          className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200"
                          referrerPolicy="no-referrer"
                        />
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-slate-900 text-sm truncate">{o.name}</div>
                        <div className="text-xs text-indigo-700 font-medium truncate">{o.position}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                          {o.villageId === "COMMUNE" ? "Cấp Xã" : tenantVillages.find(v => v.id === o.villageId)?.name}
                        </div>
                      </div>
                      <button
                        onClick={() => handleCall(o.phone, o.id)}
                        className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-full transition-all shrink-0"
                        title="Gọi điện / Copy số"
                      >
                        {copiedId === o.id ? <Check className="w-3.5 h-3.5 text-indigo-600" /> : <PhoneCall className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

              {/* Matching Offices / Culture Houses */}
              {searchResults.offices.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Trụ sở & Nhà văn hóa ({searchResults.offices.length})</h3>
                  <div className="space-y-3">
                    {searchResults.offices.map(of => (
                      <div 
                        key={of.id}
                        onClick={() => { setSelectedOffice(of); setSearchQuery(""); }}
                        className="p-3 bg-slate-50 hover:bg-blue-50 rounded-lg border border-slate-100 hover:border-blue-200 cursor-pointer transition-all"
                      >
                        <div className="font-bold text-slate-900 text-sm">{of.name}</div>
                        <div className="text-xs text-slate-500 mt-1 line-clamp-1">{of.address}</div>
                        <span className="inline-block bg-blue-100 text-blue-800 text-[9px] font-bold px-1.5 py-0.5 rounded mt-2">Cơ quan</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dynamic Screen rendering depending on activeTab */}
        <AnimatePresence mode="wait">
          
          {/* TAB 1: HOME & LOCAL ANNOUNCEMENTS */}
          {activeTab === "home" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6"
              key="citizen-home-tab"
            >
              {/* Left & Middle: Introduction & Announcements */}
              <div className="lg:col-span-2 space-y-6">
                
                {!isCustomerLoggedIn && (
                  <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-lg border border-emerald-500/10 relative overflow-hidden animate-fadeIn">
                    <div className="absolute right-0 bottom-0 opacity-10 translate-x-4 translate-y-4">
                      <Users className="w-32 h-32" />
                    </div>
                    <div className="relative z-10">
                      <span className="bg-white/20 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider mb-3 inline-block">
                        Hệ Thống Định Danh Công Dân Xã Hải Anh
                      </span>
                      <h3 className="text-lg font-extrabold leading-tight mb-2">
                        Bạn chưa đăng ký tài khoản định danh công dân?
                      </h3>
                      <p className="text-emerald-50 text-xs leading-relaxed mb-4 max-w-xl">
                        Đăng ký định danh công dân xã Hải Anh ngay hôm nay để sử dụng toàn bộ tính năng số: lưu giữ thôn yêu thích, danh bạ cán bộ, phản ánh hiện trường và đánh giá sự hài lòng cán bộ.
                      </p>
                      <div className="flex flex-wrap gap-2.5">
                        <button
                          onClick={() => {
                            if (onOpenCitizenAuth) onOpenCitizenAuth("register");
                          }}
                          className="px-4 py-2 bg-white text-emerald-700 hover:bg-emerald-50 text-xs font-extrabold rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          Đăng ký Công dân Mới
                        </button>
                        <button
                          onClick={() => {
                            if (onOpenCitizenAuth) onOpenCitizenAuth("login");
                          }}
                          className="px-4 py-2 bg-emerald-800 text-white hover:bg-emerald-900 text-xs font-extrabold rounded-xl border border-emerald-700/30 transition-all cursor-pointer"
                        >
                          Đăng nhập định danh
                        </button>
                        <button
                          onClick={onToggleCustomerLogin}
                          className="px-4 py-2 bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30 text-xs font-bold rounded-xl transition-all cursor-pointer"
                        >
                          Trải nghiệm nhanh (Vũ Đức Giới)
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Introduction Details */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h2 className="text-xl font-extrabold text-slate-900 mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
                    <Landmark className="w-5 h-5 text-indigo-600" />
                    Chào mừng đến với {activeTenant.name}
                  </h2>
                  <div className="prose prose-indigo text-sm text-slate-600 leading-relaxed space-y-3">
                    <p>{activeTenant.introduction}</p>
                    <p className="bg-slate-50 p-4 rounded-lg border border-slate-200/60 text-xs italic text-slate-500 flex gap-2">
                      <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                      <span>
                        Hệ thống được phát triển nhằm hỗ trợ quá trình cập nhật, tra cứu dữ liệu dân cư, hạ tầng và liên kết giữa chính quyền xã với các ban quản lý thôn mới sáp nhập. Giúp nhân dân dễ dàng giám sát, tra cứu thông tin cán bộ trực tuyến.
                      </span>
                    </p>
                  </div>
                </div>

                {/* Đặc điểm tình hình của xã Hải Anh hiện nay */}
                <div className="bg-gradient-to-br from-indigo-50/50 to-white rounded-xl shadow-sm border border-indigo-100 p-6">
                  <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-indigo-50 pb-3">
                    <Activity className="w-5 h-5 text-indigo-600" />
                    Báo Cáo Đặc Điểm & Số Liệu Phát Triển Xã Hải Anh
                  </h2>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-3.5 rounded-lg border border-indigo-100/50 shadow-sm">
                      <div className="text-slate-500 text-[11px] font-medium uppercase tracking-wider">Diện Tích Tự Nhiên</div>
                      <div className="text-lg font-extrabold text-indigo-700 font-mono mt-0.5">{stats.totalArea.toLocaleString("vi-VN", {minimumFractionDigits: 1, maximumFractionDigits: 2})} km²</div>
                      <div className="text-[10px] text-slate-400">Tương đương {Math.round(stats.totalArea * 100).toLocaleString("vi-VN")} ha</div>
                    </div>
                    <div className="bg-white p-3.5 rounded-lg border border-indigo-100/50 shadow-sm">
                      <div className="text-slate-500 text-[11px] font-medium uppercase tracking-wider">Quy Mô Dân Số</div>
                      <div className="text-lg font-extrabold text-indigo-700 font-mono mt-0.5">{stats.totalPopulation.toLocaleString("vi-VN")} người</div>
                      <div className="text-[10px] text-slate-400">{stats.totalHouseholds.toLocaleString("vi-VN")} hộ gia đình</div>
                    </div>
                    <div className="bg-white p-3.5 rounded-lg border border-indigo-100/50 shadow-sm">
                      <div className="text-slate-500 text-[11px] font-medium uppercase tracking-wider">Cơ Cấu Hành Chính</div>
                      <div className="text-lg font-extrabold text-indigo-700 font-mono mt-0.5">{stats.totalVillages} Thôn Mới</div>
                      <div className="text-[10px] text-slate-400">Đạt chuẩn quy mô</div>
                    </div>
                    <div className="bg-white p-3.5 rounded-lg border border-indigo-100/50 shadow-sm">
                      <div className="text-slate-500 text-[11px] font-medium uppercase tracking-wider">Thành Phần Tôn Giáo</div>
                      <div className="text-lg font-extrabold text-indigo-700 font-mono mt-0.5">39,3%</div>
                      <div className="text-[10px] text-slate-400">Đồng bào Công giáo</div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
                      <div className="font-bold text-slate-800 text-sm mb-2 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Đảng Bộ Xã Hải Anh
                      </div>
                      <p className="text-slate-600 text-xs leading-relaxed">
                        Toàn đảng bộ hiện có <strong>1.818 đảng viên</strong> ưu tú đang sinh hoạt gương mẫu tại <strong>81 tổ chức Đảng</strong> (bao gồm 02 Đảng bộ cơ sở, 14 chi bộ cơ sở trực thuộc và 65 chi bộ thôn xóm).
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
                      <div className="font-bold text-slate-800 text-sm mb-2 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
                        Bàn Giao Cụm Phú Cường (Cát Thành)
                      </div>
                      <p className="text-slate-600 text-xs leading-relaxed">
                        Tiếp quản bàn giao toàn bộ <strong>209 hộ dân</strong> với <strong>896 nhân khẩu</strong>, diện tích <strong>401.250 m²</strong> trước đây thuộc thị trấn Cát Thành, huyện Trực Ninh để giải quyết triệt để tình trạng xâm canh, xâm cư lịch sử.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Local Announcements List */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h2 className="text-xl font-extrabold text-slate-900 mb-4 border-b border-slate-100 pb-3 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-indigo-600" />
                      Tin Tức & Thông Báo Bản Tin Hành Chính
                    </span>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded font-semibold">Mới nhất</span>
                  </h2>

                  <div className="space-y-4">
                    {tenantAnnouncements.map((ann) => (
                      <div 
                        key={ann.id} 
                        onClick={() => setSelectedAnnouncement(ann)}
                        className="p-4 rounded-lg border border-slate-100 hover:border-indigo-250 bg-slate-50/50 hover:bg-slate-50 transition-all cursor-pointer group shadow-xs hover:shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded ${
                            ann.category === "Thông báo" ? "bg-amber-100 text-amber-800" :
                            ann.category === "Văn bản pháp lý" ? "bg-blue-100 text-blue-800" :
                            "bg-indigo-100 text-indigo-800 border border-indigo-200/55"
                          }`}>
                            {ann.category}
                          </span>
                          <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {ann.publishedDate}
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-base mb-1.5 group-hover:text-indigo-600 transition-colors">
                          {ann.title}
                        </h3>
                        <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed mb-3">
                          {ann.content}
                        </p>
                        <div className="flex justify-between items-center text-xs text-slate-500 border-t border-slate-100 pt-2.5">
                          <span className="font-medium">Nguồn: <span className="text-slate-700 font-semibold">{ann.author}</span></span>
                          {ann.villageId !== "ALL" && (
                            <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded font-medium">
                              Thôn: {tenantVillages.find(v => v.id === ann.villageId)?.name}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    {tenantAnnouncements.length === 0 && (
                      <div className="text-center py-8 text-slate-400">
                        Chưa có bản tin nào từ UBND xã.
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Right Sidebar: Dynamic Quick-Links & Feature highlights */}
              <div className="space-y-6">
                
                {/* Visual Hotline Cards */}
                <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 rounded-2xl shadow-lg border border-indigo-950/40 p-6 text-white relative overflow-hidden">
                  <div className="absolute right-0 bottom-0 opacity-[0.07] translate-x-4 translate-y-4">
                    <Landmark className="w-40 h-40 text-indigo-400" />
                  </div>
                  <h3 className="font-extrabold text-lg mb-2 text-indigo-200">Đội Ngũ Phản Ứng Nhanh</h3>
                  <p className="text-slate-300 text-xs leading-relaxed mb-4 font-sans font-medium">
                    Mọi thắc mắc liên quan tới thủ tục hành chính, giải phóng mặt bằng, hoặc kiến nghị sáp nhập vui lòng liên hệ.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-white/5 px-3.5 py-2.5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                      <span className="text-xs text-slate-300">Trực ban Công an xã</span>
                      <span className="font-mono text-sm font-bold text-indigo-300">{activeTenant.phone}</span>
                    </div>
                    <div className="flex items-center justify-between bg-white/5 px-3.5 py-2.5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                      <span className="text-xs text-slate-300">Tiếp nhận Hồ sơ 1 Cửa</span>
                      <span className="font-mono text-sm font-bold text-indigo-300">0229.3864.000</span>
                    </div>
                  </div>
                </div>

                {/* Culture House spotlight card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                  <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <Building2Icon className="w-4 h-4 text-indigo-600" />
                    Thống kê Nhà Văn Hóa Thôn
                  </h3>
                  <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                    Sau sáp nhập, toàn xã hiện có <strong>{stats.totalCultureHouses}</strong> nhà văn hóa liên thôn đã đạt chuẩn và đưa vào vận hành thực tế.
                  </p>
                  <div className="space-y-2">
                    {tenantVillages.map(v => (
                      <div key={v.id} className="flex items-center justify-between text-xs p-2 rounded bg-slate-50 border border-slate-100">
                        <span className="font-semibold text-slate-700">{v.name}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${v.hasCultureHouse ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-amber-100 text-amber-800'}`}>
                          {v.hasCultureHouse ? "Sẵn sàng" : "Chờ quy hoạch"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* QR Code Quick Scanner App Intro */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col items-center text-center">
                  <div className="bg-indigo-50 text-indigo-700 p-3 rounded-full mb-3">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">Quét Mã Tra Cứu Tọa Độ</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-xs">
                    Mọi vị trí trụ sở cơ quan và nhà văn hóa thôn đều được cấp mã QR định vị vệ tinh GPS để nhân dân dễ dàng tra cứu đường đi.
                  </p>
                  <button 
                    onClick={() => setActiveTab("offices")}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mt-3 cursor-pointer"
                  >
                    Xem danh sách cơ quan <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 2: MERGED VILLAGES CATALOG */}
          {activeTab === "villages" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="mt-6"
              key="citizen-villages-tab"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">Danh Sách Thôn / Xóm Sau Sáp Nhập</h2>
                  <p className="text-xs text-slate-500">Các dữ liệu thống kê, quy mô dân khẩu, diện tích và nhà văn hóa.</p>
                </div>
                <span className="text-xs bg-indigo-50 text-indigo-800 border border-indigo-200 px-3 py-1 rounded-full font-mono font-bold">
                  {tenantVillages.length} Đơn Vị Thôn
                </span>
              </div>

              {/* Grid of Villages */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tenantVillages.map((v) => {
                  // Calculate count of original villages (e.g. split by comma)
                  const originalCount = v.formerNames.split(",").length;
                  return (
                     <div 
                      key={v.id} 
                      className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md hover:border-slate-300 transition-all flex flex-col h-full relative"
                    >
                      <div className="relative h-44 bg-slate-100 shrink-0">
                        <img 
                          src={v.imageUrl} 
                          alt={v.name} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute bottom-3 left-4">
                          <span className="bg-indigo-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider mb-1 inline-block">
                            Sáp nhập từ {originalCount} thôn gốc
                          </span>
                          <h3 className="text-lg font-bold text-white leading-tight">{v.name}</h3>
                        </div>

                        {/* Favorite Bookmark Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavoriteVillage(v.id);
                          }}
                          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md shadow-md border transition-all cursor-pointer z-10 ${
                            favoriteVillages.includes(v.id)
                              ? "bg-amber-500 text-white border-amber-400"
                              : "bg-black/35 hover:bg-black/50 text-white border-white/20"
                          }`}
                          title={favoriteVillages.includes(v.id) ? "Bỏ yêu thích thôn" : "Lưu thôn yêu thích"}
                        >
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                        </button>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          {/* Former Names info */}
                          <div className="mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200/50">
                            <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Xóm / Thôn cũ sáp nhập:</span>
                            <span className="text-xs font-semibold text-slate-700 leading-relaxed block">{v.formerNames}</span>
                          </div>

                          {/* Quick Stats Grid */}
                          <div className="grid grid-cols-3 gap-2 text-center mb-4 text-xs">
                            <div className="bg-slate-50/50 p-2 rounded">
                              <div className="text-[10px] text-slate-400 font-semibold uppercase">Số hộ</div>
                              <div className="font-extrabold text-slate-950 mt-0.5 font-mono">{v.householdCount}</div>
                            </div>
                            <div className="bg-slate-50/50 p-2 rounded">
                              <div className="text-[10px] text-slate-400 font-semibold uppercase">Dân số</div>
                              <div className="font-extrabold text-slate-950 mt-0.5 font-mono">{v.population}</div>
                            </div>
                            <div className="bg-slate-50/50 p-2 rounded">
                              <div className="text-[10px] text-slate-400 font-semibold uppercase">Diện tích</div>
                              <div className="font-extrabold text-slate-950 mt-0.5 font-mono">{v.area} ha</div>
                            </div>
                          </div>

                          {/* Culture House Status indicator */}
                          <div className="flex items-center gap-2 text-xs mb-4 text-slate-600">
                            <Building2Icon className={`w-4 h-4 ${v.hasCultureHouse ? "text-indigo-600" : "text-amber-500"}`} />
                            <span className="truncate">
                              <strong className="text-slate-800">Nhà văn hóa:</strong> {v.hasCultureHouse ? "Đã có đạt chuẩn" : "Sử dụng tạm / Chờ quy hoạch"}
                            </span>
                          </div>
                        </div>

                        <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                          <span className="text-xs text-slate-400 font-mono">QĐ ngày: {v.establishedDate}</span>
                          <button 
                            onClick={() => setSelectedVillage(v)}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 py-1 px-2.5 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-all cursor-pointer"
                          >
                            Chi tiết thôn <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* TAB 3: OFFICIALS DIRECTORY */}
          {activeTab === "officials" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="mt-6 space-y-4"
              key="citizen-officials-tab"
            >
              {/* Directory Filter controls */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-4">
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Tìm theo tên/SĐT</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Nhập tên..."
                      value={offSearchFilter}
                      onChange={(e) => setOffSearchFilter(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 font-sans">Lọc theo đơn vị</label>
                  <select
                    value={offVillageFilter}
                    onChange={(e) => setOffVillageFilter(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                  >
                    <option value="">Tất cả thôn & cơ quan xã</option>
                    <option value="COMMUNE">Chính quyền cấp Xã</option>
                    {tenantVillages.map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Lọc theo chức danh</label>
                  <select
                    value={offPositionFilter}
                    onChange={(e) => setOffPositionFilter(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                  >
                    <option value="">Tất cả chức danh</option>
                    <option value="Trưởng thôn">Trưởng thôn / xóm</option>
                    <option value="Bí thư">Bí thư Chi bộ / Đảng ủy</option>
                    <option value="Chủ tịch">Chủ tịch UBND</option>
                    <option value="Công an">Lực lượng Công an</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button 
                    onClick={() => { setOffVillageFilter(""); setOffPositionFilter(""); setOffSearchFilter(""); }}
                    className="w-full py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-bold transition-all"
                  >
                    Xóa bộ lọc
                  </button>
                </div>

              </div>

              {/* Directory listings */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredOfficials.map((o) => (
                  <div key={o.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col justify-between hover:shadow-md hover:border-indigo-150 transition-all">
                    <div>
                      {/* Avatar & Header info */}
                      <div className="flex items-center gap-3.5 pb-3 border-b border-slate-100 mb-3 relative">
                        <img 
                          src={o.avatar} 
                          alt={o.name} 
                          className="w-12 h-12 rounded-full object-cover shrink-0 border border-slate-200"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1 flex-wrap">
                            <h3 className="font-bold text-slate-900 text-sm truncate">{o.name}</h3>
                            {o.isPartyMember && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-red-600 bg-red-50 border border-red-100 px-1 py-0.2 rounded-full shadow-2xs shrink-0" title="Đảng viên">
                                ★
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded uppercase tracking-wider block mt-0.5 w-max">
                            {o.position}
                          </span>

                          {/* Star Ratings visualization */}
                          {(() => {
                            const ratings = officialRatings[o.id] || { rating: 5.0, count: 0 };
                            return (
                              <div className="flex items-center gap-1 mt-1 text-[11px] text-amber-500 font-bold">
                                <span>★ {ratings.rating.toFixed(1)}</span>
                                <span className="text-[10px] text-slate-400 font-normal">({ratings.count} đánh giá)</span>
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Contact fields */}
                      <div className="space-y-1.5 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">
                            {o.villageId === "COMMUNE" ? "UBND cấp Xã" : tenantVillages.find(v => v.id === o.villageId)?.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate text-slate-500 font-mono text-[11px]">{o.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-mono text-slate-700 font-semibold">{o.phone}</span>
                        </div>
                      </div>

                      {/* Expanded Excel-based Qualifications and Former Village */}
                      {(o.birthDate || o.formerVillage || o.education || o.specialization || o.politicalTheory) && (
                        <div className="mt-3 pt-2 border-t border-slate-100 grid grid-cols-2 gap-1.5 text-[10px] text-slate-500 leading-snug">
                          {o.birthDate && (
                            <div>
                              <span className="text-slate-400">Năm sinh:</span> <span className="font-bold text-slate-700 font-mono">{o.birthDate}</span>
                            </div>
                          )}
                          {o.formerVillage && (
                            <div className="col-span-2">
                              <span className="text-slate-400">Sáp nhập từ:</span> <span className="font-bold text-slate-700">{o.formerVillage}</span>
                            </div>
                          )}
                          {o.education && (
                            <div>
                              <span className="text-slate-400">Văn hóa:</span> <span className="font-bold text-slate-700">{o.education}</span>
                            </div>
                          )}
                          {o.specialization && (
                            <div>
                              <span className="text-slate-400">Chuyên môn:</span> <span className="font-bold text-slate-700">{o.specialization}</span>
                            </div>
                          )}
                          {o.politicalTheory && (
                            <div className="col-span-2">
                              <span className="text-slate-400">Lý luận CT:</span> <span className="font-bold text-slate-700">{o.politicalTheory}</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {o.notes && (
                        <div className="mt-2 p-1.5 bg-slate-50 border border-slate-100 rounded text-[10px] text-slate-500 italic leading-snug">
                          Ghi chú: {o.notes}
                        </div>
                      )}
                    </div>

                    {/* Dialer trigger button */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5">
                      <button
                        onClick={() => handleCall(o.phone, o.id)}
                        className="flex-1 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                        id={`call-official-${o.id}`}
                      >
                        {copiedId === o.id ? (
                          <>
                            <Check className="w-3 h-3 text-indigo-600" />
                            Đã Copy
                          </>
                        ) : (
                          <>
                            <Phone className="w-3 h-3" />
                            Gọi điện
                          </>
                        )}
                      </button>

                      {/* Satisfaction review trigger button */}
                      <button
                        onClick={() => handleOpenRatingModal(o)}
                        className="p-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 rounded-lg transition-all flex items-center justify-center cursor-pointer"
                        title="Đánh giá cán bộ"
                      >
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                      </button>

                      {/* Favorite contact bookmark toggler */}
                      <button
                        onClick={() => toggleFavoriteOfficial(o.id)}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          favoriteOfficials.includes(o.id)
                            ? "bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100"
                            : "bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-500"
                        }`}
                        title={favoriteOfficials.includes(o.id) ? "Bỏ lưu liên hệ" : "Lưu danh bạ cán bộ"}
                      >
                        <svg className={`w-3.5 h-3.5 ${favoriteOfficials.includes(o.id) ? "fill-current" : ""}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}

                {filteredOfficials.length === 0 && (
                  <div className="col-span-full text-center py-12 bg-white rounded-xl border border-slate-200 text-slate-400 text-sm">
                    Không tìm thấy cán bộ nào khớp bộ lọc.
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 4: ADMINISTRATIVE OFFICES (TRỤ SỞ CƠ QUAN) */}
          {activeTab === "offices" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="mt-6"
              key="citizen-offices-tab"
            >
              <div className="mb-4">
                <h2 className="text-xl font-extrabold text-slate-900">Ban Ngành & Trụ Sở Hành Chính Xã</h2>
                <p className="text-xs text-slate-500">Các vị trí đầu mối tiếp nhận, giải quyết thủ tục và hỗ trợ nhân dân.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tenantOffices.map((office) => (
                  <div 
                    key={office.id} 
                    className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all flex flex-col md:flex-row"
                  >
                    <div className="md:w-44 h-48 md:h-auto bg-slate-100 shrink-0 relative">
                      <img 
                        src={office.imageUrl} 
                        alt={office.name} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded font-bold font-mono">
                        GPS CONNECT
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-base mb-1.5">{office.name}</h3>
                        <p className="text-slate-500 text-xs flex items-start gap-1 mb-2.5">
                          <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                          <span>{office.address}</span>
                        </p>
                        <p className="text-slate-600 text-xs leading-relaxed mb-4 line-clamp-3">
                          {office.description}
                        </p>
                      </div>

                      <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold font-mono text-slate-700 bg-slate-100 px-2 py-1 rounded">
                          SĐT: {office.phone}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedOffice(office)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all text-xs flex items-center gap-1 font-semibold cursor-pointer"
                            title="Định vị bản đồ"
                          >
                            <Map className="w-3.5 h-3.5 text-blue-600" /> Map
                          </button>
                          
                          <button
                            onClick={() => setQrModalUrl({title: office.name, url: office.googleMapUrl})}
                            className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-lg transition-all text-xs flex items-center gap-1 font-semibold cursor-pointer"
                            title="Sinh mã định vị QR"
                          >
                            <QrCode className="w-3.5 h-3.5 text-indigo-600" /> Mã QR
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 5: FIELD REFLECTION (PHẢN ÁNH HIỆN TRƯỜNG) */}
          {activeTab === "reflections" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6"
              key="citizen-reflections-tab"
            >
              
              {/* Form to submit reflection */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-extrabold text-slate-900 mb-2 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-600" />
                  Gửi Phản Ánh Hiện Trường Sau Sáp Nhập
                </h2>
                <p className="text-xs text-slate-500 mb-5 leading-relaxed">
                  Người dân có thể gửi các kiến nghị, thắc mắc về hạ tầng công cộng, ô nhiễm môi trường, sự cố điện nước, hoặc các thủ tục hành chính liên quan sáp nhập trực tiếp tới Cán bộ quản lý xã tại đây. Dữ liệu sẽ được tổng hợp lên Dashboard xã xử lý.
                </p>

                {reflectionSuccess ? (
                  <div className="bg-indigo-50 border border-indigo-200 text-indigo-800 p-6 rounded-lg text-center space-y-3">
                    <Check className="w-12 h-12 text-indigo-500 mx-auto" />
                    <h3 className="font-bold text-lg">Gửi phản ánh thành công!</h3>
                    <p className="text-xs text-slate-600">
                      Cảm ơn sự đóng góp ý kiến của quý công dân. Thông tin phản ánh đã được gửi tới Trung tâm Chỉ huy Hành chính Xã để phê duyệt và cử ban ngành khắc phục xử lý.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleReflectionSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Họ và tên người phản ánh *</label>
                        <input
                          type="text"
                          required
                          value={reflectionForm.citizenName}
                          onChange={(e) => setReflectionForm({...reflectionForm, citizenName: e.target.value})}
                          placeholder="Ví dụ: Nguyễn Văn Hùng"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Số điện thoại liên hệ *</label>
                        <input
                          type="tel"
                          required
                          value={reflectionForm.citizenPhone}
                          onChange={(e) => setReflectionForm({...reflectionForm, citizenPhone: e.target.value})}
                          placeholder="Ví dụ: 0904.xxx.xxx"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Địa bàn thôn xảy ra sự việc *</label>
                        <select
                          required
                          value={reflectionForm.villageId}
                          onChange={(e) => setReflectionForm({...reflectionForm, villageId: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white font-medium"
                        >
                          <option value="">-- Chọn Thôn / Xóm --</option>
                          {tenantVillages.map(v => (
                            <option key={v.id} value={v.id}>{v.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Tọa độ sự việc (Tùy chọn mô phỏng GPS)</label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            step="0.0001"
                            value={reflectionForm.latitude}
                            onChange={(e) => setReflectionForm({...reflectionForm, latitude: parseFloat(e.target.value) || 20.245})}
                            placeholder="Vĩ độ (Lat)"
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                          <input
                            type="number"
                            step="0.0001"
                            value={reflectionForm.longitude}
                            onChange={(e) => setReflectionForm({...reflectionForm, longitude: parseFloat(e.target.value) || 106.082})}
                            placeholder="Kinh độ (Lng)"
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Tiêu đề phản ánh *</label>
                      <input
                        type="text"
                        required
                        value={reflectionForm.title}
                        onChange={(e) => setReflectionForm({...reflectionForm, title: e.target.value})}
                        placeholder="Mô tả tóm tắt (Ví dụ: Bóng đèn đường Phong Thành bị hỏng, Rác thải bốc mùi...)"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Nội dung chi tiết sự việc *</label>
                      <textarea
                        required
                        rows={4}
                        value={reflectionForm.content}
                        onChange={(e) => setReflectionForm({...reflectionForm, content: e.target.value})}
                        placeholder="Nhập nội dung phản ánh cụ thể, thời gian phát hiện, mô tả hiện trạng chi tiết..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white font-medium"
                      ></textarea>
                    </div>

                    {/* Media Upload Section (Image or Video) */}
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                          <Paperclip className="w-4 h-4 text-indigo-600" />
                          Tải Lên Hình Ảnh Hoặc Video Hiện Trường
                        </label>
                        <span className="text-[10px] text-slate-500 font-semibold bg-slate-200/80 px-2 py-0.5 rounded">
                          Tải tệp thực tế hoặc dùng mẫu
                        </span>
                      </div>

                      {/* File upload input & action triggers */}
                      {!reflectionForm.imageUrl && !reflectionForm.videoUrl ? (
                        <div className="space-y-2">
                          <label className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-white hover:bg-indigo-50/50 p-4 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all group">
                            <input
                              type="file"
                              accept="image/*,video/*"
                              onChange={handleReflectionMediaUpload}
                              className="hidden"
                            />
                            <div className="flex items-center gap-2 mb-1">
                              <Image className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform" />
                              <Video className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform" />
                            </div>
                            <span className="text-xs font-bold text-indigo-700">Chọn tệp Hình ảnh (.jpg, .png...) hoặc Video (.mp4, .mov...) từ thiết bị</span>
                            <span className="text-[10px] text-slate-400 mt-0.5">Hỗ trợ tất cả định dạng video và hình ảnh từ điện thoại / máy tính</span>
                          </label>

                          <div className="flex items-center justify-between gap-2 pt-1">
                            <span className="text-[11px] text-slate-400 font-medium">Hoặc thử nghiệm nhanh:</span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setReflectionForm(prev => ({
                                  ...prev,
                                  imageUrl: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=60",
                                  videoUrl: undefined,
                                  mediaType: "image",
                                  mediaFileName: "mau_anh_hien_truong.jpg"
                                }))}
                                className="px-2.5 py-1 bg-white border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-600 text-[11px] font-bold rounded-lg flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
                              >
                                <Image className="w-3.5 h-3.5 text-emerald-600" /> Mẫu Ảnh
                              </button>

                              <button
                                type="button"
                                onClick={() => setReflectionForm(prev => ({
                                  ...prev,
                                  videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
                                  imageUrl: undefined,
                                  mediaType: "video",
                                  mediaFileName: "mau_video_hien_truong.mp4"
                                }))}
                                className="px-2.5 py-1 bg-white border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-600 text-[11px] font-bold rounded-lg flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
                              >
                                <Video className="w-3.5 h-3.5 text-rose-600" /> Mẫu Video
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white border border-slate-200 p-3 rounded-xl space-y-2">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <div className="flex items-center gap-2">
                              {reflectionForm.mediaType === "video" ? (
                                <Film className="w-4 h-4 text-rose-600 shrink-0" />
                              ) : (
                                <Image className="w-4 h-4 text-emerald-600 shrink-0" />
                              )}
                              <span className="text-xs font-bold text-slate-800 truncate max-w-[200px]">
                                {reflectionForm.mediaFileName || (reflectionForm.mediaType === "video" ? "Video_Hien_Truong.mp4" : "Hinh_Anh_Hien_Truong.jpg")}
                              </span>
                              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 font-mono">
                                {reflectionForm.mediaType === "video" ? "VIDEO" : "HÌNH ẢNH"}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => setReflectionForm(prev => ({
                                ...prev,
                                imageUrl: undefined,
                                videoUrl: undefined,
                                mediaType: undefined,
                                mediaFileName: undefined
                              }))}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Xóa tệp
                            </button>
                          </div>

                          {/* Media Preview Player */}
                          {reflectionForm.mediaType === "video" || reflectionForm.videoUrl ? (
                            <div className="rounded-lg overflow-hidden bg-slate-950 border border-slate-800 max-h-56 flex items-center justify-center">
                              <video
                                controls
                                src={reflectionForm.videoUrl}
                                className="w-full max-h-52 object-contain"
                              >
                                Trình duyệt không hỗ trợ phát video này.
                              </video>
                            </div>
                          ) : (
                            <div className="rounded-lg overflow-hidden border border-slate-200 max-h-52">
                              <img
                                src={reflectionForm.imageUrl}
                                alt="Ảnh hiện trường"
                                className="w-full max-h-48 object-cover"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-all shadow-sm uppercase tracking-wider cursor-pointer"
                      >
                        Gửi phản ánh ngay
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Side logs of recent citizen reports */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center gap-1.5">
                  <MapPinned className="w-4 h-4 text-indigo-600" />
                  Màn Thống Kê Phản Ánh Gần Đây
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Danh sách phản ánh của người dân xã {activeTenant.name} đang chờ xử lý hoặc đã hoàn thành.
                </p>

                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {tenantReflections.map((ref) => (
                    <div key={ref.id} className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{ref.citizenName}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold font-mono ${
                          ref.status === "PENDING" ? "bg-amber-100 text-amber-800" :
                          ref.status === "RESOLVED" ? "bg-indigo-100 text-indigo-800 border border-indigo-200/50" :
                          "bg-rose-100 text-rose-800"
                        }`}>
                          {ref.status === "PENDING" ? "ĐANG CHỜ" : ref.status === "RESOLVED" ? "ĐẠT CHUẨN" : "TỪ CHỐI"}
                        </span>
                      </div>
                      <div className="font-semibold text-slate-900 text-xs">{ref.title}</div>
                      <p className="text-slate-500 leading-relaxed text-[11px] line-clamp-2">
                        {ref.content}
                      </p>

                      {/* Display attached media if available */}
                      {ref.videoUrl || ref.mediaType === "video" ? (
                        <div className="rounded-lg overflow-hidden bg-slate-950 border border-slate-200 mt-2">
                          <video controls src={ref.videoUrl} className="w-full max-h-48 object-contain">
                            Trình duyệt không hỗ trợ phát video.
                          </video>
                        </div>
                      ) : ref.imageUrl ? (
                        <div className="rounded-lg overflow-hidden border border-slate-200 mt-2">
                          <img src={ref.imageUrl} alt={ref.title} className="w-full max-h-36 object-cover" />
                        </div>
                      ) : null}

                      <div className="text-[10px] text-slate-400 font-mono flex justify-between pt-1 border-t border-slate-200/55">
                        <span>Thôn: {tenantVillages.find(v => v.id === ref.villageId)?.name || "Chưa chọn"}</span>
                        <span>{new Date(ref.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                  {tenantReflections.length === 0 && (
                    <p className="text-center text-slate-400 py-4 text-xs">Chưa có phản ánh hiện trường nào.</p>
                  )}
                </div>
              </div>

            </motion.div>
          )}

        </AnimatePresence>

      </div>

      {/* OVERLAY 1: VILLAGE DETAILS MODAL */}
      <AnimatePresence>
        {selectedVillage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-4xl w-full max-h-[90vh] overflow-y-auto text-slate-800"
            >
              {/* Header Image */}
              <div className="relative h-60 bg-slate-100">
                <img 
                  src={selectedVillage.bannerUrl} 
                  alt={selectedVillage.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent"></div>
                <button 
                  onClick={() => setSelectedVillage(null)}
                  className="absolute top-4 right-4 p-2 bg-slate-900/70 hover:bg-slate-900 text-white rounded-full transition-all"
                  id="close-village-modal-btn"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-5 left-6">
                  <span className="bg-emerald-500 text-slate-950 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">
                    Thôn sáp nhập hành chính mới
                  </span>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-white">{selectedVillage.name}</h2>
                </div>
              </div>

              {/* Grid content inside modal */}
              <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Information, intro & details */}
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Giới thiệu tổng quan</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{selectedVillage.introduction}</p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">Lịch sử sáp nhập & Địa lý</h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1.5 border-b border-slate-200/55">
                        <span className="text-slate-500">Các thôn gốc sáp nhập:</span>
                        <span className="font-bold text-slate-800">{selectedVillage.formerNames}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-200/55">
                        <span className="text-slate-500">Quyết định thành lập ngày:</span>
                        <span className="font-mono text-slate-800 font-semibold">{selectedVillage.establishedDate}</span>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="text-slate-500">Nhà văn hóa sinh hoạt:</span>
                        <span className="font-bold text-slate-800 text-right max-w-[200px]">{selectedVillage.cultureHouseAddress}</span>
                      </div>
                    </div>
                  </div>

                  {/* Local village officials */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Ban quản lý Thôn (Cán bộ phụ trách)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {tenantOfficials.filter(o => o.villageId === selectedVillage.id).map(o => (
                        <div key={o.id} className="p-3 bg-white rounded-xl border border-slate-200 hover:border-indigo-200 hover:shadow-sm transition-all flex flex-col justify-between gap-2.5">
                          <div className="flex items-center gap-3">
                            <img 
                              src={o.avatar} 
                              alt={o.name} 
                              className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200"
                              referrerPolicy="no-referrer"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1 flex-wrap">
                                <h4 className="font-bold text-slate-900 text-xs truncate">{o.name}</h4>
                                {o.isPartyMember && (
                                  <span className="inline-flex items-center gap-0.5 text-[8px] font-bold text-red-600 bg-red-50 border border-red-100 px-1 py-0.2 rounded-full shrink-0">
                                    ★ Đảng viên
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-amber-800 font-bold block mt-0.5">{o.position}</span>
                              <span className="font-mono text-[10px] text-slate-500 block">SĐT: {o.phone}</span>
                            </div>
                          </div>

                          {/* Extra personnel fields from Excel */}
                          {(o.birthDate || o.formerVillage || o.education || o.specialization || o.politicalTheory || o.notes) && (
                            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-1 text-[10px] text-slate-600 leading-normal">
                              {o.birthDate && (
                                <div>
                                  <span className="text-slate-400">Năm sinh:</span> <span className="font-bold text-slate-700 font-mono">{o.birthDate}</span>
                                </div>
                              )}
                              {o.formerVillage && (
                                <div className="col-span-2">
                                  <span className="text-slate-400">Sáp nhập từ:</span> <span className="font-bold text-slate-700">{o.formerVillage}</span>
                                </div>
                              )}
                              {o.education && (
                                <div>
                                  <span className="text-slate-400">Văn hóa:</span> <span className="font-bold text-slate-700">{o.education}</span>
                                </div>
                              )}
                              {o.specialization && (
                                <div>
                                  <span className="text-slate-400">Chuyên môn:</span> <span className="font-bold text-slate-700">{o.specialization}</span>
                                </div>
                              )}
                              {o.politicalTheory && (
                                <div className="col-span-2">
                                  <span className="text-slate-400">Lý luận CT:</span> <span className="font-bold text-slate-700">{o.politicalTheory}</span>
                                </div>
                              )}
                              {o.notes && (
                                <div className="col-span-2 mt-1.5 p-1 bg-slate-50 border border-slate-100 rounded text-[9px] text-slate-500 italic">
                                  Ghi chú: {o.notes}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                      {tenantOfficials.filter(o => o.villageId === selectedVillage.id).length === 0 && (
                        <p className="text-slate-400 text-xs">Chưa phân công cán bộ phụ trách thôn này.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stat sidebar, Map & QR code links */}
                <div className="space-y-6">
                  
                  {/* Detailed metrics */}
                  <div className="bg-slate-900 text-white p-5 rounded-xl space-y-4">
                    <h4 className="font-bold text-sm border-b border-white/10 pb-2 text-emerald-400">Chỉ số dân cư thôn</h4>
                    <div className="space-y-3 font-mono text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Tổng Số Hộ:</span>
                        <span className="font-bold">{selectedVillage.householdCount} hộ</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Tổng Số Khẩu:</span>
                        <span className="font-bold">{selectedVillage.population} người</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Diện Tự Nhiên:</span>
                        <span className="font-bold">{selectedVillage.area} ha</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Mật Độ Dân Cư:</span>
                        <span className="font-bold text-emerald-300">
                          {Math.round(selectedVillage.population / (selectedVillage.area / 100))} người/km²
                        </span>
                      </div>
                    </div>
                  </div>

                    {/* Interactive Satellite & Geographic Google Map Section */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                          Bản đồ vệ tinh & Địa lý thôn
                        </h4>
                        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/80 text-[11px] font-bold">
                          <button
                            type="button"
                            onClick={() => setVillageMapViewMode("satellite")}
                            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                              villageMapViewMode === "satellite"
                                ? "bg-slate-900 text-white shadow-sm"
                                : "text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            🛰️ Vệ tinh
                          </button>
                          <button
                            type="button"
                            onClick={() => setVillageMapViewMode("roadmap")}
                            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                              villageMapViewMode === "roadmap"
                                ? "bg-slate-900 text-white shadow-sm"
                                : "text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            🗺️ Địa lý
                          </button>
                        </div>
                      </div>
                      
                      <div className="bg-slate-900 rounded-xl h-60 relative overflow-hidden border border-slate-200 shadow-inner flex items-center justify-center">
                        <iframe
                          src={getVillageEmbedUrl(selectedVillage, villageMapViewMode)}
                          className="w-full h-full border-0 rounded-xl"
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          title={`Bản đồ ${selectedVillage.name}`}
                        />
                        <div className="absolute top-2 left-2 bg-slate-900/90 backdrop-blur-md text-white text-[10px] font-mono font-bold px-2.5 py-1 rounded-md shadow-md border border-white/20 flex items-center gap-1 z-10 pointer-events-none">
                          <MapPin className="w-3 h-3 text-rose-400" />
                          GPS: {selectedVillage.latitude}, {selectedVillage.longitude}
                        </div>
                      </div>

                      <div className="mt-3.5 space-y-2">
                        <a 
                          href={getVillageDirectionsUrl(selectedVillage)} 
                          target="_blank" 
                          rel="noreferrer"
                          className="w-full py-2.5 bg-slate-900 hover:bg-slate-950 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
                        >
                          <Map className="w-4 h-4 text-blue-400" />
                          Mở Google Maps chỉ đường
                        </a>

                        <button
                          type="button"
                          onClick={() => setQrModalUrl({
                            title: selectedVillage.name,
                            url: getVillageDirectionsUrl(selectedVillage),
                            lat: selectedVillage.latitude,
                            lng: selectedVillage.longitude
                          })}
                          className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 border border-emerald-200/60 shadow-sm cursor-pointer"
                        >
                          <QrCode className="w-4 h-4 text-emerald-600" />
                          Sinh QR Code quét điện thoại
                        </button>
                      </div>

                    </div>

                </div>

              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* OVERLAY 2: CO-OFFICE DETAILS MODAL */}
      <AnimatePresence>
        {selectedOffice && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden text-slate-800"
            >
              <div className="relative h-44 bg-slate-100">
                <img 
                  src={selectedOffice.imageUrl} 
                  alt={selectedOffice.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent"></div>
                <button 
                  onClick={() => setSelectedOffice(null)}
                  className="absolute top-4 right-4 p-1.5 bg-slate-900/70 hover:bg-slate-900 text-white rounded-full transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
                <h3 className="absolute bottom-4 left-5 text-lg font-bold text-white pr-6">{selectedOffice.name}</h3>
              </div>

              <div className="p-5 space-y-4">
                <div className="text-xs text-slate-600 leading-relaxed">
                  <h4 className="font-bold text-slate-800 mb-1 uppercase tracking-wider text-[10px]">Mô tả chức năng nhiệm vụ</h4>
                  <p>{selectedOffice.description}</p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200/50 rounded-lg text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Đại diện điện thoại:</span>
                    <span className="font-bold font-mono text-slate-800">{selectedOffice.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Địa chỉ cụ thể:</span>
                    <span className="font-bold text-slate-800 text-right">{selectedOffice.address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tọa độ GPS liên kết:</span>
                    <span className="font-mono text-slate-800 font-bold">{selectedOffice.latitude}, {selectedOffice.longitude}</span>
                  </div>
                </div>

                <div className="pt-2 grid grid-cols-2 gap-2">
                  <a 
                    href={selectedOffice.googleMapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2.5 bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs rounded-lg text-center transition-all flex items-center justify-center gap-1.5"
                  >
                    <Map className="w-3.5 h-3.5" /> Mở Google Maps
                  </a>
                  <button
                    onClick={() => {
                      setQrModalUrl({title: selectedOffice.name, url: selectedOffice.googleMapUrl});
                      setSelectedOffice(null);
                    }}
                    className="py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-lg text-center transition-all flex items-center justify-center gap-1.5"
                  >
                    <QrCode className="w-3.5 h-3.5" /> Tạo QR Map
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* OVERLAY: ANNOUNCEMENT DETAILS MODAL */}
      <AnimatePresence>
        {selectedAnnouncement && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full max-h-[85vh] overflow-y-auto text-slate-800 dark:text-slate-200 relative"
            >
              {/* Header Banner */}
              <div className="bg-indigo-600 p-5 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-200 animate-pulse" />
                  <div>
                    <span className="text-[10px] uppercase font-black bg-indigo-700 text-indigo-100 px-2 py-0.5 rounded-md">
                      {selectedAnnouncement.category}
                    </span>
                    <h3 className="font-extrabold text-xs uppercase tracking-wider text-indigo-100 mt-1">Chi tiết bản tin hành chính</h3>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAnnouncement(null)}
                  className="p-1.5 bg-indigo-700/50 hover:bg-indigo-700 rounded-full text-indigo-100 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Main Content */}
              <div className="p-6 md:p-8 space-y-6">
                <div className="space-y-3">
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                    {selectedAnnouncement.title}
                  </h2>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400 dark:text-slate-500 font-medium pb-4 border-b border-slate-150 dark:border-slate-800">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                      Ngày phát hành: <strong className="text-slate-600 dark:text-slate-300 font-bold">{selectedAnnouncement.publishedDate}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Nguồn: <strong className="text-slate-600 dark:text-slate-300 font-bold">{selectedAnnouncement.author}</strong>
                    </span>
                    {selectedAnnouncement.villageId !== "ALL" && (
                      <>
                        <span>•</span>
                        <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 text-[10px] px-2 py-0.5 rounded font-black">
                          Địa bàn: Thôn {tenantVillages.find(v => v.id === selectedAnnouncement.villageId)?.name}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Body Text */}
                <div className="text-slate-700 dark:text-slate-300 text-sm md:text-base leading-relaxed space-y-4 whitespace-pre-wrap font-medium">
                  {selectedAnnouncement.content}
                </div>

                {/* Modal Footer */}
                <div className="pt-4 border-t border-slate-150 dark:border-slate-800/80 flex justify-end">
                  <button
                    onClick={() => setSelectedAnnouncement(null)}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md shadow-indigo-600/10 cursor-pointer transition-all"
                  >
                    Đóng Bản Tin
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* OVERLAY 3: QR CODE GENERATED VIEW MODAL */}
      <AnimatePresence>
        {qrModalUrl && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.92, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 10 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 text-slate-800 text-center relative overflow-hidden"
            >
              <button 
                onClick={() => setQrModalUrl(null)}
                className="absolute top-4 right-4 p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-all cursor-pointer z-10"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <QrCode className="w-5 h-5" />
              </div>

              <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider mb-1">
                Mã QR Định Vị Google Maps
              </h3>
              <p className="text-xs font-semibold text-indigo-700 px-2 mb-2">{qrModalUrl.title}</p>

              {qrModalUrl.lat && qrModalUrl.lng && (
                <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full mb-3 border border-slate-200">
                  <MapPin className="w-3 h-3 text-rose-500" />
                  Tọa độ: {qrModalUrl.lat}, {qrModalUrl.lng}
                </div>
              )}

              {/* Real-time QR Code display using standard safe qrserver API */}
              <div className="bg-slate-50 p-4 rounded-2xl inline-block border border-slate-200 shadow-inner mb-3 relative group">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrModalUrl.url)}`}
                  alt="Mã định vị QR"
                  className="w-48 h-48 mx-auto rounded-lg shadow-sm"
                />
              </div>

              <div className="space-y-2.5 px-1">
                <p className="text-[11px] text-slate-600 leading-relaxed bg-emerald-50/80 p-3 rounded-xl border border-emerald-100 text-left">
                  📱 <strong>Hướng dẫn:</strong> Sử dụng camera điện thoại (iPhone/Android), ứng dụng <strong>Zalo</strong> hoặc <strong>Google Lens</strong> quét mã QR này để tự động mở Google Maps chỉ đường tới vị trí thôn.
                </p>

                <a
                  href={qrModalUrl.url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-950 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Map className="w-4 h-4 text-blue-400" />
                  Mở Google Maps chỉ đường
                </a>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleCopyLink(qrModalUrl.url, "qr-link")}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {copiedId === "qr-link" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        Đã Copy Link
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy Link Maps
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setQrModalUrl(null)}
                    className="py-2 px-5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RATING MODAL */}
      <AnimatePresence>
        {ratingOfficial && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.93 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.93 }}
              className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 text-slate-800 relative"
            >
              <button 
                onClick={() => setRatingOfficial(null)}
                className="absolute top-4 right-4 p-1 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <img src={ratingOfficial.avatar} alt={ratingOfficial.name} className="w-12 h-12 rounded-full object-cover border border-slate-200" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-indigo-600">{ratingOfficial.position}</span>
                  <h3 className="font-extrabold text-slate-900 text-base">{ratingOfficial.name}</h3>
                </div>
              </div>

              <h4 className="font-bold text-xs text-slate-700 mb-2 uppercase tracking-wider">Đánh giá mức độ hài lòng</h4>
              
              {/* Star selector */}
              <div className="flex items-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewRatingStars(star)}
                    className="p-1 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <svg 
                      className={`w-7 h-7 ${star <= newRatingStars ? "text-amber-400 fill-current" : "text-slate-300"}`} 
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  </button>
                ))}
                <span className="text-xs font-bold text-slate-500 ml-1">
                  {newRatingStars === 5 ? "Rất xuất sắc/Hài lòng" :
                   newRatingStars === 4 ? "Tốt/Hài lòng" :
                   newRatingStars === 3 ? "Bình thường" :
                   newRatingStars === 2 ? "Chưa hài lòng" : "Rất không hài lòng"}
                </span>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Ý kiến đóng góp, nhận xét:</label>
                <textarea
                  value={newRatingText}
                  onChange={(e) => setNewRatingText(e.target.value)}
                  placeholder="Ví dụ: Cán bộ giải quyết hồ sơ nhiệt tình, nhanh chóng, đúng hẹn..."
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none h-24 resize-none"
                />
              </div>

              {/* Previous reviews */}
              {officialRatings[ratingOfficial.id]?.reviews && officialRatings[ratingOfficial.id].reviews.length > 0 && (
                <div className="mb-4">
                  <span className="block text-[10px] font-bold text-slate-400 mb-2 uppercase">Các đánh giá gần đây:</span>
                  <div className="space-y-2 max-h-32 overflow-y-auto pr-1 border-t border-slate-100 pt-2">
                    {officialRatings[ratingOfficial.id].reviews.map((r, idx) => (
                      <div key={idx} className="bg-slate-50/70 p-2 rounded-lg border border-slate-100 text-[11px]">
                        <div className="flex justify-between text-slate-400 mb-1">
                          <span className="font-bold text-amber-500">{"★".repeat(r.stars)}</span>
                          <span className="text-[9px]">{r.date}</span>
                        </div>
                        <p className="text-slate-600 italic font-medium">{r.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2.5">
                <button
                  onClick={() => setRatingOfficial(null)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleSubmitRating}
                  className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
                >
                  Gửi đánh giá cán bộ
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LOGIN PROMPT MODAL */}
      <AnimatePresence>
        {showLoginPrompt && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.93 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.93 }}
              className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-sm w-full p-6 text-slate-800 text-center relative"
            >
              <button 
                onClick={() => setShowLoginPrompt(false)}
                className="absolute top-4 right-4 p-1 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-3.5 border border-emerald-100">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>

              <h3 className="font-extrabold text-slate-900 text-base mb-1.5">Yêu cầu Đăng nhập</h3>
              <p className="text-xs text-slate-500 px-2 leading-relaxed mb-4">
                Tính năng <strong>Lưu thôn yêu thích, lưu danh bạ cán bộ</strong> và <strong>Đánh giá sự hài lòng</strong> chỉ dành riêng cho công dân xã đã được định danh trên hệ thống.
              </p>

              <div className="p-3 bg-slate-50 border border-slate-200/50 rounded-xl mb-4 text-[11px] text-slate-600 leading-normal">
                💡 <strong>Trải nghiệm nhanh:</strong> Bấm nút <strong>Đăng nhập mô phỏng</strong> ngay tại bảng điều khiển Persona của Role Switcher phía trên để giả lập công dân <strong>Vũ Đức Giới</strong>!
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (onOpenCitizenAuth) onOpenCitizenAuth("register");
                      setShowLoginPrompt(false);
                    }}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Đăng ký mới
                  </button>
                  <button
                    onClick={() => {
                      if (onOpenCitizenAuth) onOpenCitizenAuth("login");
                      setShowLoginPrompt(false);
                    }}
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    Đăng nhập định danh
                  </button>
                </div>

                <div className="flex gap-2 mt-1 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setShowLoginPrompt(false)}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    onClick={() => {
                      onToggleCustomerLogin();
                      setShowLoginPrompt(false);
                    }}
                    className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
                    title="Đăng nhập giả lập công dân Vũ Đức Giới"
                  >
                    Mô phỏng nhanh
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Simple Footer */}
      <footer className="mt-12 border-t border-slate-200 bg-white py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
          <div>
            © 2026 {activeTenant.name}. Đã liên kết cơ sở dữ liệu sáp nhập thôn xóm quốc gia.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-800 cursor-pointer">Hướng dẫn sử dụng</span>
            <span>•</span>
            <span className="hover:text-slate-800 cursor-pointer">Điều khoản chính sách</span>
            <span>•</span>
            <span className="text-indigo-600 font-mono font-bold">Phiên bản v2.5-SaaS</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

// Extra Icons inline implementation for safety
function Building2Icon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18" />
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
      <path d="M10 6h4" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
      <path d="M10 18h4" />
    </svg>
  );
}
