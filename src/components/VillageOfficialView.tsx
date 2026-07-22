/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { UserRole, WardTenant, Village, Official, Announcement, FieldReflection, AuditLog, OfficialRegistration } from "../types";
import { 
  Users, Building, MapPin, Plus, FileText, CheckCircle2, 
  XCircle, Edit2, Check, RefreshCw, Eye, Trash2, Calendar, 
  Phone, Mail, UserPlus, AlertCircle, Sparkles, Send, LogOut, Download, Image
} from "lucide-react";
import { motion } from "motion/react";

interface VillageOfficialViewProps {
  activeTenant: WardTenant;
  activeVillageId: string;
  villages: Village[];
  officials: Official[];
  announcements: Announcement[];
  reflections: FieldReflection[];
  onUpdateVillage: (village: Village) => void;
  onAddAnnouncement: (announcement: Announcement) => void;
  onUpdateAnnouncement?: (announcement: Announcement) => void;
  onUpdateOfficial: (official: Official) => void;
  onAddOfficial: (official: Official) => void;
  onResolveReflection: (reflectionId: string, status: "RESOLVED" | "REJECTED") => void;
  onLogAudit: (action: string, details: string) => void;
  loggedInOfficial: OfficialRegistration | null;
  onLogout: () => void;
  onExportDatabase: () => void;
  onShowPermissions?: () => void;
}

export default function VillageOfficialView({
  activeTenant,
  activeVillageId,
  villages,
  officials,
  announcements,
  reflections,
  onUpdateVillage,
  onAddAnnouncement,
  onUpdateAnnouncement,
  onUpdateOfficial,
  onAddOfficial,
  onResolveReflection,
  onLogAudit,
  loggedInOfficial,
  onLogout,
  onExportDatabase,
  onShowPermissions
}: VillageOfficialViewProps) {
  // Locate current simulated village
  const village = villages.find(v => v.id === activeVillageId);

  // States for Village Editor fields
  const [households, setHouseholds] = useState(0);
  const [population, setPopulation] = useState(0);
  const [hasCH, setHasCH] = useState(false);
  const [chAddress, setChAddress] = useState("");
  const [lat, setLat] = useState(20.0);
  const [lng, setLng] = useState(106.0);
  const [mapIframe, setMapIframe] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  
  // Announcement drafting state
  const [annTitle, setAnnTitle] = useState("");
  const [annCategory, setAnnCategory] = useState<"Thông báo" | "Tin tức">("Thông báo");
  const [annContent, setAnnContent] = useState("");

  // Add official modal/inline states
  const [showAddOff, setShowAddOff] = useState(false);
  const [newOffForm, setNewOffForm] = useState({
    name: "",
    birthDate: "1980-01-01",
    gender: "Nam" as "Nam" | "Nữ",
    phone: "",
    email: "",
    position: "Phó thôn",
    address: ""
  });

  // Success alert triggers
  const [successMsg, setSuccessMsg] = useState("");

  // Sync state whenever active village changes
  useEffect(() => {
    if (village) {
      setHouseholds(village.householdCount);
      setPopulation(village.population);
      setHasCH(village.hasCultureHouse);
      setChAddress(village.cultureHouseAddress);
      setLat(village.latitude);
      setLng(village.longitude);
      setMapIframe(village.mapIframe || "");
      setImageUrl(village.imageUrl || "");
      setBannerUrl(village.bannerUrl || "");
    }
  }, [village, activeVillageId]);

  if (!village) {
    return (
      <div className="bg-slate-50 min-h-screen flex items-center justify-center p-8">
        <div className="text-center p-6 bg-white rounded-xl shadow border border-slate-200">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-800">Không tìm thấy thôn cần mô phỏng</h2>
          <p className="text-sm text-slate-500 mt-1">Vui lòng kiểm tra hoặc chọn thôn khác ở thanh công cụ phía trên.</p>
        </div>
      </div>
    );
  }

  // Filter lists for current village scope
  const localOfficials = officials.filter(o => o.villageId === village.id);
  const localAnnouncements = announcements.filter(a => a.villageId === village.id);
  const localReflections = reflections.filter(r => r.villageId === village.id);

  // Submit main Village parameters
  const handleSaveVillageDetails = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Village = {
      ...village,
      householdCount: Number(households),
      population: Number(population),
      hasCultureHouse: hasCH,
      cultureHouseAddress: chAddress,
      latitude: Number(lat),
      longitude: Number(lng),
      googleMapUrl: `https://maps.google.com/?q=${lat},${lng}`,
      mapIframe: mapIframe,
      imageUrl: imageUrl,
      bannerUrl: bannerUrl,
      status: "DRAFT", // Saving edits as DRAFT for review
      createdBy: "Phạm Văn Nam"
    };
    onUpdateVillage(updated);
    onLogAudit("YÊU CẦU CẬP NHẬT THÔN (NHÁP)", `Đề xuất cập nhật thông tin thôn ${village.name}: Hộ=${households}, Khẩu=${population}. Trạng thái: DRAFT chờ duyệt.`);
    triggerSuccess("Đã lưu bản nháp cập nhật thôn! Chờ duyệt để công bố.");
  };

  // Submit new Announcement
  const handlePublishAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle || !annContent) return;

    const newAnn: Announcement = {
      id: `ann-local-${Date.now()}`,
      wardId: activeTenant.id,
      villageId: village.id,
      title: annTitle,
      content: annContent,
      publishedDate: new Date().toISOString().split('T')[0],
      author: localOfficials[0]?.name || "Phạm Văn Nam",
      category: annCategory === "Thông báo" ? "Thông báo" : "Tin tức",
      status: "DRAFT", // Starts as DRAFT
      createdBy: "Phạm Văn Nam"
    };

    onAddAnnouncement(newAnn);
    onLogAudit("TẠO BẢN TIN NHÁP", `Tạo bản tin nháp mới cho thôn ${village.name}: ${annTitle}`);
    setAnnTitle("");
    setAnnContent("");
    triggerSuccess("Đã lưu bản nháp thông báo! Vui lòng gửi phê duyệt ở danh sách bên dưới.");
  };

  // Submit new Official
  const handleAddOfficialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOffForm.name || !newOffForm.phone) return;

    const newOff: Official = {
      id: `off-local-${Date.now()}`,
      wardId: activeTenant.id,
      villageId: village.id,
      name: newOffForm.name,
      birthDate: newOffForm.birthDate,
      gender: newOffForm.gender,
      phone: newOffForm.phone,
      email: newOffForm.email || `${newOffForm.phone}@gmail.com`,
      avatar: newOffForm.gender === "Nữ" 
        ? "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=60"
        : "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=60",
      position: newOffForm.position,
      address: newOffForm.address || village.name,
      status: "DRAFT", // Starts as DRAFT
      createdBy: "Phạm Văn Nam"
    };

    onAddOfficial(newOff);
    onLogAudit("THÊM NHÂN SỰ NHÁP", `Thêm cán bộ nháp mới ${newOff.name} (${newOff.position}) vào thôn ${village.name}`);
    setShowAddOff(false);
    setNewOffForm({
      name: "",
      birthDate: "1980-01-01",
      gender: "Nam",
      phone: "",
      email: "",
      position: "Phó thôn",
      address: ""
    });
    triggerSuccess("Thêm nhân sự nháp thành công! Vui lòng bấm Gửi phê duyệt.");
  };

  // Handle reflection updates
  const handleReflectionAction = (refId: string, status: "RESOLVED" | "REJECTED") => {
    onResolveReflection(refId, status);
    onLogAudit("XỬ LÝ PHẢN ÁNH", `Thay đổi trạng thái phản ánh ${refId} của thôn thành ${status}`);
    triggerSuccess(`Đã cập nhật trạng thái phản ánh thành công!`);
  };

  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3500);
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 pb-16" id="village-official-portal">
      
      {/* Visual alerts toast */}
      {successMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-indigo-500/80 text-indigo-100 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />
          <span className="text-xs font-bold">{successMsg}</span>
        </div>
      )}

      {/* Top Welcome Title */}
      <div className="bg-slate-900 text-white py-10 px-6 shadow-sm border-b border-slate-850">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-block bg-indigo-500/20 text-indigo-300 text-[10px] font-mono font-extrabold px-2.5 py-1 rounded mb-2 border border-indigo-500/30">
              CÁN BỘ THÔN TRỰC BAN
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight font-sans">
              Bảng Điều Hành {village.name}
            </h1>
            <p className="text-slate-400 text-xs font-medium mt-1">
              Sáp nhập từ: <strong className="font-semibold text-slate-300">{village.formerNames}</strong> | Ngày thành lập: {village.establishedDate}
            </p>
          </div>

          <div className="flex gap-2">
            <span className="bg-white/5 text-white font-mono text-xs px-3.5 py-1.5 rounded-lg border border-white/10 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              {localOfficials.length} Nhân Sự phụ trách
            </span>
            <span className="bg-white/5 text-white font-mono text-xs px-3.5 py-1.5 rounded-lg border border-white/10 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              {localAnnouncements.length} Bản tin thôn
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6 animate-fadeIn">
        
        {/* LEFT COLUMN: OFFICIAL PROFILE CARD & HUMAN RESOURCES */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card matching user second screenshot */}
          <div className="bg-slate-900 text-slate-100 rounded-xl shadow-md border border-slate-850 p-5 space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
              <div 
                onClick={onShowPermissions}
                className="cursor-pointer hover:bg-slate-800/60 p-2 -m-2 rounded-lg transition-all group flex-1"
                title="Click để xem chi tiết ma trận phân quyền"
              >
                <span className="text-[10px] text-slate-400 font-extrabold tracking-wider uppercase block group-hover:text-indigo-400 transition-colors">CHÀO ÔNG/BÀ (CLICK XEM QUYỀN):</span>
                <span className="font-extrabold text-sm text-white mt-1 block group-hover:text-indigo-300 transition-colors">
                  {loggedInOfficial ? loggedInOfficial.fullName : "Cán bộ Thôn"}
                </span>
                <span className="mt-2 inline-block bg-indigo-500/20 text-indigo-300 text-[10px] font-mono font-extrabold px-2 py-0.5 rounded border border-indigo-500/30 uppercase group-hover:bg-indigo-500/30 transition-all">
                  CÁN BỘ THÔN 🔑
                </span>
              </div>
              <button
                onClick={onLogout}
                className="p-2 bg-rose-950/35 hover:bg-rose-900/50 text-rose-400 hover:text-rose-300 border border-rose-900/40 rounded-lg transition-colors cursor-pointer shrink-0"
                title="Đăng xuất tài khoản quản trị"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">LƯU TRỮ DỰ PHÒNG</span>
                <button
                  onClick={onExportDatabase}
                  className="flex items-center gap-1 px-2.5 py-1 bg-emerald-950/50 hover:bg-emerald-900/50 text-emerald-400 hover:text-emerald-300 border border-emerald-900/50 rounded-lg text-[10px] font-extrabold transition-colors cursor-pointer"
                >
                  <Download className="w-3 h-3" /> TẢI BACKUP (JSON)
                </button>
              </div>
              <p className="text-[10px] text-slate-400 leading-normal">
                Đảm bảo tính minh bạch dữ liệu theo quy định số hóa thông tin của thôn {village?.name}.
              </p>
            </div>
          </div>

          {/* Assigned Officials Editor */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <Users className="w-4.5 h-4.5 text-indigo-600" />
                Ban Nhân sự ({localOfficials.length})
              </h2>
              <button
                onClick={() => setShowAddOff(!showAddOff)}
                className="p-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded border border-indigo-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                id="toggle-add-official-btn"
              >
                <UserPlus className="w-3 h-3" /> Thêm
              </button>
            </div>

            {/* Add new Official Form */}
            {showAddOff && (
              <form onSubmit={handleAddOfficialSubmit} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-slate-900">Bổ sung Nhân sự Thôn mới</h4>
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Họ và tên cán bộ *</label>
                    <input
                      type="text"
                      required
                      value={newOffForm.name}
                      onChange={(e) => setNewOffForm({...newOffForm, name: e.target.value})}
                      placeholder="Ví dụ: Nguyễn Văn A"
                      className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none font-medium"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Số điện thoại *</label>
                      <input
                        type="tel"
                        required
                        value={newOffForm.phone}
                        onChange={(e) => setNewOffForm({...newOffForm, phone: e.target.value})}
                        placeholder="Số ĐT..."
                        className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Chức vụ phụ trách</label>
                      <select
                        value={newOffForm.position}
                        onChange={(e) => setNewOffForm({...newOffForm, position: e.target.value})}
                        className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none font-medium select-none"
                      >
                        <option value="Bí thư Chi bộ Thôn">Bí thư Chi bộ</option>
                        <option value="Trưởng thôn">Trưởng thôn</option>
                        <option value="Phó thôn">Phó thôn</option>
                        <option value="Công an viên thôn">Công an viên</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-1.5">
                    <button
                      type="submit"
                      className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded cursor-pointer"
                    >
                      Xác nhận lưu
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddOff(false)}
                      className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold cursor-pointer"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* List of current village officials */}
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {localOfficials.map((o) => {
                const status = o.status || "PUBLISHED";
                return (
                  <div key={o.id} className="p-2.5 bg-slate-50 border border-slate-150 rounded-xl flex flex-col justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <img 
                        src={o.avatar} 
                        alt={o.name} 
                        className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1 flex-wrap">
                          <h4 className="font-bold text-slate-900 text-[11px] truncate">{o.name}</h4>
                          {o.isPartyMember && (
                            <span className="text-[8px] font-bold text-red-600 bg-red-50 border border-red-100 px-1 rounded-full">★ ĐV</span>
                          )}
                        </div>
                        <span className="text-[10px] text-indigo-700 font-bold block">{o.position}</span>
                        <span className="font-mono text-[9px] text-slate-500 block">{o.phone}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 self-end">
                      <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                        status === "PUBLISHED" ? "text-emerald-700 bg-emerald-50 border-emerald-200" :
                        status === "PENDING" ? "text-blue-700 bg-blue-50 border-blue-200 animate-pulse" :
                        status === "REJECTED" ? "text-rose-700 bg-rose-50 border-rose-200" :
                        "text-amber-700 bg-amber-50 border-amber-200"
                      }`}>
                        {status === "PUBLISHED" ? "Đã công bố" :
                         status === "PENDING" ? "Chờ duyệt" :
                         status === "REJECTED" ? "Từ chối" : "Nháp"}
                      </span>

                      {(status === "DRAFT" || status === "REJECTED") && (
                        <button
                          onClick={() => {
                            onUpdateOfficial({ ...o, status: "PENDING" });
                            onLogAudit("GỬI DUYỆT CÁN BỘ", `Gửi yêu cầu phê duyệt cho nhân sự ${o.name} (${o.position})`);
                            triggerSuccess(`Đã gửi yêu cầu phê duyệt cho cán bộ ${o.name}!`);
                          }}
                          className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-bold rounded transition-colors cursor-pointer shadow-sm"
                        >
                          Gửi duyệt
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* List of current announcements / news */}
            <div className="mt-4 pt-4 border-t border-slate-200">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-600" />
                Duyệt Bản Tin ({localAnnouncements.length})
              </h3>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {localAnnouncements.map((a) => {
                  const status = a.status || "PUBLISHED";
                  return (
                    <div key={a.id} className="p-2.5 bg-slate-50 border border-slate-150 rounded-xl flex flex-col justify-between gap-2">
                      <div>
                        <div className="flex items-center justify-between gap-1.5 mb-1">
                          <span className="text-[8px] font-bold text-slate-400 font-mono">{a.publishedDate}</span>
                          <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                            status === "PUBLISHED" ? "text-emerald-700 bg-emerald-50 border-emerald-200" :
                            status === "PENDING" ? "text-blue-700 bg-blue-50 border-blue-200" :
                            status === "REJECTED" ? "text-rose-700 bg-rose-50 border-rose-200" :
                            "text-amber-700 bg-amber-50 border-amber-200"
                          }`}>
                            {status === "PUBLISHED" ? "Đã công bố" :
                             status === "PENDING" ? "Chờ duyệt" :
                             status === "REJECTED" ? "Từ chối" : "Nháp"}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-slate-900 text-[11px] truncate">{a.title}</h4>
                      </div>

                      <div className="flex items-center justify-between text-[9px] border-t border-slate-100 pt-1.5">
                        <span className="text-slate-400">Loại: <strong>{a.category}</strong></span>
                        {(status === "DRAFT" || status === "REJECTED") && (
                          <button
                            onClick={() => {
                              if (onUpdateAnnouncement) {
                                onUpdateAnnouncement({ ...a, status: "PENDING" });
                                onLogAudit("GỬI DUYỆT BẢN TIN", `Gửi yêu cầu phê duyệt bản tin "${a.title}"`);
                                triggerSuccess(`Đã gửi yêu cầu phê duyệt cho bản tin: ${a.title}`);
                              } else {
                                triggerSuccess("Lỗi kết nối bộ quản lý phê duyệt!");
                              }
                            }}
                            className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded transition-colors cursor-pointer shadow-sm text-[8px]"
                          >
                            Gửi duyệt
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {localAnnouncements.length === 0 && (
                  <div className="text-center py-4 text-slate-400 text-xs italic">
                    Chưa có bản tin nào.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: CRITICAL PARAMETER EDITOR */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main info parameters form */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-base font-extrabold text-slate-900 mb-4 border-b border-slate-100 pb-2.5 flex items-center gap-2">
              <Building className="w-5 h-5 text-indigo-600" />
              Cập Nhật Chỉ Số Quy Mô & Cơ Sở Vật Chất Thôn
            </h2>

            <form onSubmit={handleSaveVillageDetails} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Số hộ dân cư xóm *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={households}
                    onChange={(e) => setHouseholds(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white font-semibold"
                    id="input-household-count"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">Tổng cộng các hộ cũ ghép lại</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Tổng số nhân khẩu *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={population}
                    onChange={(e) => setPopulation(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white font-semibold"
                    id="input-population-count"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">Dân số thực tế cư trú</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Diện tích đất (ha)</label>
                  <input
                    type="text"
                    disabled
                    value={`${village.area} ha`}
                    className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-500 font-bold"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">Cố định do Xã điều chỉnh</span>
                </div>
              </div>

              {/* Culture House setup toggle */}
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800">Nhà Văn Hóa Thôn</h3>
                    <p className="text-[11px] text-slate-500">Bật nếu thôn đã có nhà văn hóa đạt quy chuẩn sinh hoạt cộng đồng mới.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setHasCH(true)}
                      className={`px-3 py-1 text-xs font-bold rounded transition-all cursor-pointer ${hasCH ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
                    >
                      Đạt chuẩn
                    </button>
                    <button
                      type="button"
                      onClick={() => { setHasCH(false); setChAddress("Đang quy hoạch xây dựng"); }}
                      className={`px-3 py-1 text-xs font-bold rounded transition-all cursor-pointer ${!hasCH ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
                    >
                      Chờ quy hoạch
                    </button>
                  </div>
                </div>

                {hasCH && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Địa chỉ cụ thể nhà văn hóa *</label>
                    <input
                      type="text"
                      required
                      value={chAddress}
                      onChange={(e) => setChAddress(e.target.value)}
                      placeholder="Nhập địa điểm nhà văn hóa..."
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                    />
                  </div>
                )}
              </div>

              {/* GPS Coordinates updater */}
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/60">
                <h3 className="text-xs font-bold text-slate-800 mb-2.5 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-indigo-600" />
                  Cấu Hình Vị Trí Định Vị Bản Đồ GPS
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Vĩ độ (Latitude) *</label>
                    <input
                      type="number"
                      step="0.0001"
                      required
                      value={lat}
                      onChange={(e) => setLat(parseFloat(e.target.value) || 20.0)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Kinh độ (Longitude) *</label>
                    <input
                      type="number"
                      step="0.0001"
                      required
                      value={lng}
                      onChange={(e) => setLng(parseFloat(e.target.value) || 106.0)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Mã Nhúng Bản Đồ Google Map Iframe (Tùy chọn)</label>
                  <textarea
                    rows={2}
                    value={mapIframe}
                    onChange={(e) => setMapIframe(e.target.value)}
                    placeholder='Ví dụ: &lt;iframe src="https://www.google.com/maps/embed?..."&gt;&lt;/iframe&gt;'
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Dán mã nhúng {"<iframe>"} từ Google Maps để thay thế hình định vị giả lập bằng bản đồ tương tác thật.</p>
                </div>
              </div>

              {/* Image & Banner URLs */}
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/60">
                <h3 className="text-xs font-bold text-slate-800 mb-2.5 flex items-center gap-1.5">
                  <Image className="w-4 h-4 text-indigo-600" />
                  Cấu Hình Hình Ảnh Thôn (Ảnh đại diện & Banner)
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Đường dẫn Ảnh đại diện thôn (Image URL) *</label>
                    <input
                      type="text"
                      required
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="Nhập link ảnh (ví dụ từ Unsplash)..."
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Đường dẫn Banner rộng thôn (Banner URL) *</label>
                    <input
                      type="text"
                      required
                      value={bannerUrl}
                      onChange={(e) => setBannerUrl(e.target.value)}
                      placeholder="Nhập link ảnh banner rộng..."
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-all shadow-sm flex items-center justify-center gap-1.5 uppercase tracking-wide cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Lưu Cập Nhật Dữ Liệu Thôn
                </button>
              </div>
            </form>
          </div>

          {/* Announcements publishing desk */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-base font-extrabold text-slate-900 mb-4 border-b border-slate-100 pb-2.5 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              Đăng Bản Tin & Thông Báo Khẩn Cho Thôn
            </h2>

            <form onSubmit={handlePublishAnnouncement} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Tiêu đề thông báo *</label>
                  <input
                    type="text"
                    required
                    value={annTitle}
                    onChange={(e) => setAnnTitle(e.target.value)}
                    placeholder="Ví dụ: Họp dân thống nhất phương án đường nội đồng..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white font-medium"
                    id="input-announcement-title"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Phân loại bản tin</label>
                  <select
                    value={annCategory}
                    onChange={(e) => setAnnCategory(e.target.value as "Thông báo" | "Tin tức")}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white font-medium select-none"
                  >
                    <option value="Thông báo">Thông báo khẩn</option>
                    <option value="Tin tức">Tin tức / Sự kiện</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Nội dung chi tiết thông báo *</label>
                <textarea
                  required
                  rows={4}
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  placeholder="Nhập nội dung đầy đủ, thời gian, địa điểm, yêu cầu tham dự để bà con nắm bắt được..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white font-medium"
                  id="input-announcement-content"
                ></textarea>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" /> Đăng bản tin công cộng
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* RIGHT COLUMN: RECURRING FEEDBACKS */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Action-pending Reflections list */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
            <h2 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <AlertCircle className="w-4.5 h-4.5 text-indigo-600" />
                Ý Kiến Phản Ánh Của Thôn ({localReflections.length})
              </span>
              <span className="text-[10px] font-mono bg-indigo-50 text-indigo-800 border border-indigo-200 px-1.5 py-0.5 rounded">
                DÂN CƯ GỬI
              </span>
            </h2>

            <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
              {localReflections.map((ref) => (
                <div key={ref.id} className="p-3 bg-slate-50 border border-slate-150 rounded-lg text-xs space-y-2">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-slate-800">{ref.citizenName} ({ref.citizenPhone})</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${
                      ref.status === "PENDING" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                      ref.status === "RESOLVED" ? "bg-indigo-50 text-indigo-700 border border-indigo-150" :
                      "bg-rose-100 text-rose-800 border border-rose-200"
                    }`}>
                      {ref.status === "PENDING" ? "CHỜ XỬ LÝ" : ref.status === "RESOLVED" ? "ĐẠT CHUẨN" : "TỪ CHỐI"}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900">{ref.title}</h4>
                  <p className="text-slate-500 leading-relaxed text-[11px]">{ref.content}</p>
                  
                  {/* Media Evidence Display */}
                  {ref.videoUrl || ref.mediaType === "video" ? (
                    <div className="mt-2 rounded-lg overflow-hidden bg-slate-950 border border-slate-200">
                      <video controls src={ref.videoUrl} className="w-full max-h-48 object-contain">
                        Trình duyệt không hỗ trợ phát video.
                      </video>
                    </div>
                  ) : ref.imageUrl ? (
                    <div className="mt-2 rounded-lg overflow-hidden border border-slate-200">
                      <img src={ref.imageUrl} alt={ref.title} className="w-full max-h-36 object-cover" />
                    </div>
                  ) : null}

                  {ref.status === "PENDING" && (
                    <div className="flex items-center gap-1.5 pt-2.5 border-t border-slate-200/55">
                      <button
                        onClick={() => handleReflectionAction(ref.id, "RESOLVED")}
                        className="flex-1 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3 h-3" /> Duyệt & Giải quyết
                      </button>
                      <button
                        onClick={() => handleReflectionAction(ref.id, "REJECTED")}
                        className="py-1 px-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold rounded transition-all cursor-pointer"
                      >
                        Từ chối
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {localReflections.length === 0 && (
                <div className="text-center py-6 text-slate-400 text-xs">
                  Chưa có kiến nghị phản ánh nào từ nhân dân thôn này.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
