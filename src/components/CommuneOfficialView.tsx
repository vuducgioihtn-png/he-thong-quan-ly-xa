/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { UserRole, WardTenant, Village, Official, AdministrativeOffice, Announcement, FieldReflection, AuditLog, OfficialRegistration } from "../types";
import { 
  Building2, Users, Landmark, MapPin, Plus, Trash2, Edit3, 
  Search, ShieldAlert, Check, X, FileSpreadsheet, FileText, 
  BarChart3, RefreshCw, Calendar, Phone, Mail, CheckCircle2, 
  XCircle, ListFilter, Map, Eye, AlertTriangle, UserPlus, HelpCircle,
  CheckSquare, MessageSquare, Clock, Info, LogOut, Download
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CommuneOfficialViewProps {
  currentRole: UserRole;
  activeTenant: WardTenant;
  villages: Village[];
  officials: Official[];
  offices: AdministrativeOffice[];
  announcements: Announcement[];
  reflections: FieldReflection[];
  auditLogs: AuditLog[];
  registrations: OfficialRegistration[];
  onAddVillage: (v: Village) => void;
  onUpdateVillage: (v: Village) => void;
  onDeleteVillage: (id: string) => void;
  onAddOfficial: (o: Official) => void;
  onUpdateOfficial: (o: Official) => void;
  onDeleteOfficial: (id: string) => void;
  onAddOffice: (of: AdministrativeOffice) => void;
  onUpdateOffice: (of: AdministrativeOffice) => void;
  onDeleteOffice: (id: string) => void;
  onAddAnnouncement?: (ann: Announcement) => void;
  onUpdateAnnouncement: (ann: Announcement) => void;
  onResolveReflection: (id: string, status: "RESOLVED" | "REJECTED") => void;
  onUpdateRegistration: (reg: OfficialRegistration) => void;
  onLogAudit: (action: string, details: string) => void;
  loggedInOfficial?: OfficialRegistration;
  onLogout?: () => void;
  onExportDatabase?: () => void;
  onShowPermissions?: () => void;
  onUpdateTenant?: (t: WardTenant) => void;
}

export default function CommuneOfficialView({
  currentRole,
  activeTenant,
  villages,
  officials,
  offices,
  announcements,
  reflections,
  auditLogs,
  registrations,
  onAddVillage,
  onUpdateVillage,
  onDeleteVillage,
  onAddOfficial,
  onUpdateOfficial,
  onDeleteOfficial,
  onAddOffice,
  onUpdateOffice,
  onDeleteOffice,
  onAddAnnouncement,
  onUpdateAnnouncement,
  onResolveReflection,
  onUpdateRegistration,
  onLogAudit,
  loggedInOfficial,
  onLogout,
  onExportDatabase,
  onShowPermissions,
  onUpdateTenant
}: CommuneOfficialViewProps) {
  // Sidebar navigation
  const [activeTab, setActiveTab] = useState<"dashboard" | "villages" | "officials" | "offices" | "reflections" | "logs" | "approval" | "registrations">("dashboard");
  
  // Manual Area edit states
  const [isEditingArea, setIsEditingArea] = useState(false);
  const [inputArea, setInputArea] = useState("");
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [villageFilter, setVillageFilter] = useState("");

  // CRUD Forms control states
  const [editingVillage, setEditingVillage] = useState<Village | null>(null);
  const [showAddVillageForm, setShowAddVillageForm] = useState(false);
  const [newVillageForm, setNewVillageForm] = useState({
    name: "",
    formerNames: "",
    householdCount: 300,
    population: 1200,
    area: 100,
    hasCultureHouse: true,
    cultureHouseAddress: "",
    latitude: 20.245,
    longitude: 106.082,
    imageUrl: "https://images.unsplash.com/photo-1508873535684-277a3cbcc4e8?w=600&auto=format&fit=crop&q=60",
    introduction: "",
    mapIframe: ""
  });

  const [editingOfficial, setEditingOfficial] = useState<Official | null>(null);
  const [showAddOfficialForm, setShowAddOfficialForm] = useState(false);
  const [newOfficialForm, setNewOfficialForm] = useState({
    name: "",
    birthDate: "1985-06-15",
    gender: "Nam" as "Nam" | "Nữ",
    phone: "",
    email: "",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=60",
    position: "Bí thư Chi bộ",
    villageId: "COMMUNE",
    address: "",
    formerVillage: "",
    education: "",
    specialization: "",
    politicalTheory: "",
    isPartyMember: false,
    notes: ""
  });

  const [editingOffice, setEditingOffice] = useState<AdministrativeOffice | null>(null);
  const [showAddOfficeForm, setShowAddOfficeForm] = useState(false);
  const [newOfficeForm, setNewOfficeForm] = useState({
    name: "",
    address: "",
    latitude: 20.246,
    longitude: 106.084,
    description: "",
    imageUrl: "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?w=600&auto=format&fit=crop&q=60",
    phone: ""
  });

  // Toast controls
  const [successToast, setSuccessToast] = useState("");

  // Registration controls state
  const [selectedRegId, setSelectedRegId] = useState<string | null>(null);
  const [regStatusFilter, setRegStatusFilter] = useState<"ALL" | "PENDING" | "ACTIVE" | "ADDITIONAL_REQUIRED" | "REJECTED">("ALL");
  const [regSearchQuery, setRegSearchQuery] = useState("");
  const [rejectionText, setRejectionText] = useState("");
  const [additionalInfoText, setAdditionalInfoText] = useState("");
  const [showActionForm, setShowActionForm] = useState<"NONE" | "REJECT" | "ADDITIONAL">("NONE");

  // State and hander for writing commune announcements
  const [showAddAnnForm, setShowAddAnnForm] = useState(false);
  const [newAnnForm, setNewAnnForm] = useState({
    title: "",
    category: "Tin tức" as "Thông báo" | "Tin tức" | "Văn bản pháp lý",
    content: "",
    villageId: "ALL",
    author: loggedInOfficial?.fullName || "UBND Xã Hải Anh"
  });

  const [approvalStatusFilter, setApprovalStatusFilter] = useState<"PENDING" | "APPROVED" | "DRAFT_REJECTED">("PENDING");

  const handleCreateAnnouncement = (e: React.FormEvent, status: "DRAFT" | "PUBLISHED") => {
    e.preventDefault();
    if (!newAnnForm.title || !newAnnForm.content) return;
    if (onAddAnnouncement) {
      const newAnn: Announcement = {
        id: `ann-commune-${Date.now()}`,
        wardId: activeTenant.id,
        villageId: newAnnForm.villageId,
        title: newAnnForm.title,
        content: newAnnForm.content,
        publishedDate: new Date().toISOString().split('T')[0],
        author: newAnnForm.author || "UBND Xã Hải Anh",
        category: newAnnForm.category,
        status: status,
        createdBy: loggedInOfficial?.fullName || "Ban quản trị Xã"
      };
      onAddAnnouncement(newAnn);
      onLogAudit(
        status === "PUBLISHED" ? "ĐĂNG BẢN TIN TRỰC TIẾP" : "TẠO BẢN TIN NHÁP",
        `${loggedInOfficial?.fullName || "Lãnh đạo Xã"} đã ${status === "PUBLISHED" ? "đăng tải trực tiếp" : "tạo nháp"} bản tin cấp xã: ${newAnnForm.title}`
      );
      setNewAnnForm({
        title: "",
        category: "Tin tức",
        content: "",
        villageId: "ALL",
        author: loggedInOfficial?.fullName || "UBND Xã Hải Anh"
      });
      setShowAddAnnForm(false);
      triggerToast(status === "PUBLISHED" ? "Đã đăng tải bản tin chính thức lên cổng xã!" : "Đã tạo bản tin nháp thành công!");
    }
  };

  // Local filtered data bindings
  const tenantVillages = useMemo(() => villages.filter(v => v.wardId === activeTenant.id), [villages, activeTenant]);
  const tenantOfficials = useMemo(() => officials.filter(o => o.wardId === activeTenant.id), [officials, activeTenant]);
  const filteredOfficials = useMemo(() => {
    return tenantOfficials.filter(o => {
      if (!o) return false;
      const oName = o.name || "";
      const oPosition = o.position || "";
      const oPhone = o.phone || "";
      const oEmail = o.email || "";
      const matchSearch = !searchQuery ? true : (
        oName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        oPosition.toLowerCase().includes(searchQuery.toLowerCase()) ||
        oPhone.includes(searchQuery) ||
        oEmail.toLowerCase().includes(searchQuery.toLowerCase())
      );
      const matchVillage = !villageFilter ? true : o.villageId === villageFilter;
      return matchSearch && matchVillage;
    });
  }, [tenantOfficials, searchQuery, villageFilter]);
  const tenantOffices = useMemo(() => offices.filter(of => of.wardId === activeTenant.id), [offices, activeTenant]);
  const tenantReflections = useMemo(() => reflections.filter(r => r.wardId === activeTenant.id), [reflections, activeTenant]);

  // Aggregate Realtime Metrics
  const stats = useMemo(() => {
    const totalVillages = tenantVillages.length;
    const totalHouseholds = tenantVillages.reduce((sum, v) => sum + v.householdCount, 0);
    const totalPopulation = tenantVillages.reduce((sum, v) => sum + v.population, 0);
    const totalArea = activeTenant.naturalArea !== undefined ? activeTenant.naturalArea : 0;
    const totalOfficials = tenantOfficials.length;
    const pendingReflections = tenantReflections.filter(r => r.status === "PENDING").length;

    return {
      totalVillages,
      totalHouseholds,
      totalPopulation,
      totalArea: Math.round((totalArea / 100) * 100) / 100, // Chuyển từ ha sang km²
      totalOfficials,
      pendingReflections
    };
  }, [tenantVillages, tenantOfficials, tenantReflections, activeTenant.naturalArea]);

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(""), 3000);
  };

  const handleSaveArea = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedArea = parseFloat(inputArea);
    if (isNaN(parsedArea) || parsedArea < 0) {
      triggerToast("Diện tích tự nhiên không hợp lệ!");
      return;
    }
    if (onUpdateTenant) {
      onUpdateTenant({
        ...activeTenant,
        naturalArea: parsedArea * 100 // Chuyển đổi ngược km² sang ha để lưu trữ đồng bộ
      });
      onLogAudit("CẬP NHẬT DIỆN TÍCH", `Cập nhật diện tích tự nhiên thủ công của xã thành ${parsedArea} km²`);
      triggerToast("Cập nhật diện tích tự nhiên thành công!");
      setIsEditingArea(false);
    }
  };

  // VILLAGE CRUD SUBMISSIONS
  const handleCreateVillage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVillageForm.name || !newVillageForm.formerNames) return;

    const v: Village = {
      id: `v-kt-new-${Date.now()}`,
      wardId: activeTenant.id,
      name: newVillageForm.name,
      formerNames: newVillageForm.formerNames,
      establishedDate: new Date().toISOString().split('T')[0],
      householdCount: Number(newVillageForm.householdCount),
      population: Number(newVillageForm.population),
      area: Number(newVillageForm.area),
      hasCultureHouse: newVillageForm.hasCultureHouse,
      cultureHouseAddress: newVillageForm.hasCultureHouse ? newVillageForm.cultureHouseAddress || `Nhà văn hóa ${newVillageForm.name}` : "Đang quy hoạch",
      latitude: Number(newVillageForm.latitude),
      longitude: Number(newVillageForm.longitude),
      googleMapUrl: `https://maps.google.com/?q=${newVillageForm.latitude},${newVillageForm.longitude}`,
      imageUrl: newVillageForm.imageUrl,
      bannerUrl: newVillageForm.imageUrl,
      introduction: newVillageForm.introduction || `Bản tin thông tin mô tả chi tiết của thôn mới sáp nhập ${newVillageForm.name}.`,
      mapIframe: newVillageForm.mapIframe
    };

    onAddVillage(v);
    onLogAudit("TẠO THÔN MỚI", `Khởi tạo thực thể thôn sáp nhập mới: ${v.name}, sáp nhập từ: ${v.formerNames}`);
    setShowAddVillageForm(false);
    setNewVillageForm({
      name: "",
      formerNames: "",
      householdCount: 300,
      population: 1200,
      area: 100,
      hasCultureHouse: true,
      cultureHouseAddress: "",
      latitude: 20.245,
      longitude: 106.082,
      imageUrl: "https://images.unsplash.com/photo-1508873535684-277a3cbcc4e8?w=600&auto=format&fit=crop&q=60",
      introduction: "",
      mapIframe: ""
    });
    triggerToast(`Đã thêm mới thôn ${v.name} thành công!`);
  };

  const handleUpdateVillageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVillage) return;
    onUpdateVillage(editingVillage);
    onLogAudit("CẬP NHẬT THÔN (ADMIN)", `Thay đổi thông tin hành chính thôn ${editingVillage.name}`);
    setEditingVillage(null);
    triggerToast(`Đã lưu thay đổi thông tin thôn thành công!`);
  };

  const handleDeleteVillageAction = (id: string, name: string) => {
    if (currentRole === UserRole.MANAGER) {
      triggerToast("❌ Cảnh báo RBAC: Phó Chủ Tịch (Manager) không được quyền xóa đơn vị Thôn xóm!");
      return;
    }
    if (confirm(`Bạn có chắc chắn muốn xóa thôn ${name}? Hành động này không thể hoàn tác.`)) {
      onDeleteVillage(id);
      onLogAudit("XÓA THÔN", `Xóa hoàn toàn thực thể thôn ${name} khỏi hệ thống xã`);
      triggerToast(`Đã xóa thôn ${name} khỏi danh sách.`);
    }
  };

  // OFFICIALS CRUD SUBMISSIONS
  const handleCreateOfficial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOfficialForm.name || !newOfficialForm.phone) return;

    const o: Official = {
      id: `off-adm-${Date.now()}`,
      wardId: activeTenant.id,
      villageId: newOfficialForm.villageId,
      name: newOfficialForm.name,
      birthDate: newOfficialForm.birthDate,
      gender: newOfficialForm.gender,
      phone: newOfficialForm.phone,
      email: newOfficialForm.email || `${newOfficialForm.phone}@gmail.com`,
      avatar: newOfficialForm.avatar || (newOfficialForm.gender === "Nữ" 
        ? "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=60"
        : "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=60"),
      position: newOfficialForm.position,
      address: newOfficialForm.address || activeTenant.name,
      formerVillage: newOfficialForm.formerVillage || "",
      education: newOfficialForm.education || "",
      specialization: newOfficialForm.specialization || "",
      politicalTheory: newOfficialForm.politicalTheory || "",
      isPartyMember: newOfficialForm.isPartyMember,
      notes: newOfficialForm.notes || ""
    };

    onAddOfficial(o);
    onLogAudit("THÊM CÁN BỘ", `Bổ nhiệm mới cán bộ ${o.name} giữ chức vụ ${o.position}`);
    setShowAddOfficialForm(false);
    setNewOfficialForm({
      name: "",
      birthDate: "1985-06-15",
      gender: "Nam",
      phone: "",
      email: "",
      avatar: "",
      position: "Bí thư Chi bộ",
      villageId: "COMMUNE",
      address: "",
      formerVillage: "",
      education: "",
      specialization: "",
      politicalTheory: "",
      isPartyMember: false,
      notes: ""
    });
    triggerToast(`Bổ nhiệm cán bộ ${o.name} thành công!`);
  };

  const handleUpdateOfficialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOfficial) return;
    onUpdateOfficial(editingOfficial);
    onLogAudit("CẬP NHẬT CÁN BỘ", `Thay đổi hồ sơ cán bộ ${editingOfficial.name}`);
    setEditingOfficial(null);
    triggerToast(`Đã lưu thay đổi hồ sơ cán bộ thành công!`);
  };

  const handleDeleteOfficialAction = (id: string, name: string) => {
    if (currentRole === UserRole.MANAGER) {
      triggerToast("❌ Cảnh báo RBAC: Phó Chủ Tịch (Manager) không được quyền bãi nhiệm cán bộ!");
      return;
    }
    if (confirm(`Bạn có chắc muốn xóa cán bộ ${name} khỏi danh sách?`)) {
      onDeleteOfficial(id);
      onLogAudit("BÃI NHIỆM CÁN BỘ", `Xóa hồ sơ nhân sự ${name}`);
      triggerToast(`Đã bãi nhiệm cán bộ ${name}.`);
    }
  };

  const handleDeleteOfficeAction = (id: string, name: string) => {
    if (currentRole === UserRole.MANAGER) {
      triggerToast("❌ Cảnh báo RBAC: Phó Chủ Tịch (Manager) không được quyền xóa trụ sở ban ngành!");
      return;
    }
    if (confirm(`Bạn có chắc muốn xóa trụ sở/ban ngành ${name}?`)) {
      onDeleteOffice(id);
      onLogAudit("XÓA BAN NGÀNH", `Xóa ban ngành/trụ sở: ${name}`);
      triggerToast(`Đã xóa trụ sở ${name}.`);
    }
  };

  // OFFICES CRUD SUBMISSIONS
  const handleCreateOffice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOfficeForm.name || !newOfficeForm.address) return;

    const of: AdministrativeOffice = {
      id: `of-adm-${Date.now()}`,
      wardId: activeTenant.id,
      name: newOfficeForm.name,
      address: newOfficeForm.address,
      latitude: Number(newOfficeForm.latitude),
      longitude: Number(newOfficeForm.longitude),
      googleMapUrl: `https://maps.google.com/?q=${newOfficeForm.latitude},${newOfficeForm.longitude}`,
      description: newOfficeForm.description || "Trụ sở trực thuộc ban ngành xã.",
      imageUrl: newOfficeForm.imageUrl,
      phone: newOfficeForm.phone || activeTenant.phone
    };

    onAddOffice(of);
    onLogAudit("THÊM CƠ QUAN", `Thiết lập mới trụ sở ban ngành: ${of.name}`);
    setShowAddOfficeForm(false);
    setNewOfficeForm({
      name: "",
      address: "",
      latitude: 20.246,
      longitude: 106.084,
      description: "",
      imageUrl: "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?w=600&auto=format&fit=crop&q=60",
      phone: ""
    });
    triggerToast(`Thiết lập cơ quan ${of.name} thành công!`);
  };

  const handleUpdateOfficeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOffice) return;
    onUpdateOffice(editingOffice);
    onLogAudit("CẬP NHẬT CƠ QUAN", `Sửa đổi cấu hình cơ quan ${editingOffice.name}`);
    setEditingOffice(null);
    triggerToast(`Đã lưu thông tin cơ quan thành công!`);
  };

  // Simulated Exports (Excel/PDF)
  const handleSimulatedExport = (format: "EXCEL" | "PDF") => {
    onLogAudit("XUẤT BÁO CÁO", `Yêu cầu kết xuất dữ liệu hành chính tổng hợp xã dạng file ${format}`);
    triggerToast(`Hệ thống đang chuẩn hóa cấu trúc... Tải xuống báo cáo ${format} thành công!`);
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 pb-20 flex flex-col lg:flex-row" id="commune-official-portal">
      
      {/* Toast Alert widget */}
      {successToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-slate-800 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
          <span className="text-xs font-bold">{successToast}</span>
        </div>
      )}

      {/* Admin Side Nav Drawer */}
      <div className="w-full lg:w-64 bg-slate-950 text-white shrink-0 border-r border-slate-800 flex flex-col">
        {/* Profile Card */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/40 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div 
              onClick={onShowPermissions}
              className="cursor-pointer hover:bg-slate-900/40 p-2 -m-2 rounded-lg transition-all group flex-1"
              title="Click để xem chi tiết ma trận phân quyền"
            >
              <span className="text-[9px] text-slate-400 font-extrabold tracking-wider uppercase block group-hover:text-indigo-400 transition-colors">CHÀO CÁN BỘ (CLICK XEM QUYỀN):</span>
              <span className="font-extrabold text-sm text-white mt-1 block group-hover:text-indigo-300 transition-colors">
                {loggedInOfficial ? loggedInOfficial.fullName : "Lãnh đạo Cấp xã"}
              </span>
              <span className="mt-1.5 inline-block bg-indigo-500/20 text-indigo-300 text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded border border-indigo-500/30 uppercase group-hover:bg-indigo-500/30 transition-all">
                CÁN BỘ CẤP XÃ 🔑
              </span>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="p-1.5 bg-rose-950/35 hover:bg-rose-900/50 text-rose-400 hover:text-rose-300 border border-rose-900/40 rounded-lg transition-colors cursor-pointer shadow-sm shrink-0"
                title="Đăng xuất tài khoản quản trị"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          
          {onExportDatabase && (
            <div className="pt-2 border-t border-slate-900 flex justify-between items-center gap-2">
              <span className="text-[9px] text-slate-400 font-medium">Sao lưu dữ liệu:</span>
              <button
                onClick={onExportDatabase}
                className="flex items-center gap-1 px-2 py-0.5 bg-emerald-950/50 hover:bg-emerald-900/50 text-emerald-400 hover:text-emerald-300 border border-emerald-900/50 rounded text-[9px] font-bold transition-colors cursor-pointer"
              >
                <Download className="w-2.5 h-2.5" /> Backup
              </button>
            </div>
          )}
        </div>

        {/* Navigation Sidebar List */}
        <nav className="p-4 space-y-1.5 flex-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === "dashboard" ? "bg-indigo-600 text-white font-bold shadow-sm" : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
            id="admin-nav-dashboard"
          >
            <BarChart3 className="w-4 h-4" /> Báo Cáo Thống Kê
          </button>
          
          <button
            onClick={() => setActiveTab("villages")}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === "villages" ? "bg-indigo-600 text-white font-bold shadow-sm" : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
            id="admin-nav-villages"
          >
            <Landmark className="w-4 h-4" /> Quản Lý Thôn / Xóm
          </button>

          <button
            onClick={() => setActiveTab("officials")}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === "officials" ? "bg-indigo-600 text-white font-bold shadow-sm" : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
            id="admin-nav-officials"
          >
            <Users className="w-4 h-4" /> Quản Lý Cán Bộ
          </button>

          <button
            onClick={() => setActiveTab("offices")}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === "offices" ? "bg-indigo-600 text-white font-bold shadow-sm" : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
            id="admin-nav-offices"
          >
            <Building2 className="w-4 h-4" /> Ban Ngành / Trụ Sở
          </button>

          <button
            onClick={() => setActiveTab("reflections")}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-2.5 transition-all relative cursor-pointer ${
              activeTab === "reflections" ? "bg-indigo-600 text-white font-bold shadow-sm" : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
            id="admin-nav-reflections"
          >
            <AlertTriangle className="w-4 h-4" /> Phản Ánh Hiện Trường
            {stats.pendingReflections > 0 && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-indigo-500 text-white font-bold font-mono text-[9px] px-1.5 py-0.5 rounded-full animate-pulse">
                {stats.pendingReflections}
              </span>
            )}
          </button>

          {/* Core RBAC Approval Workflow tab */}
          {(() => {
            const pendingV = villages.filter(v => v.status === "PENDING" || v.status === "APPROVED").length;
            const pendingO = officials.filter(o => o.status === "PENDING" || o.status === "APPROVED").length;
            const pendingA = announcements.filter(a => a.status === "PENDING" || a.status === "APPROVED").length;
            const totalPending = pendingV + pendingO + pendingA;
            return (
              <button
                onClick={() => setActiveTab("approval")}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-2.5 transition-all relative cursor-pointer ${
                  activeTab === "approval" ? "bg-indigo-600 text-white font-bold shadow-sm" : "text-slate-400 hover:bg-slate-900 hover:text-white"
                }`}
                id="admin-nav-approval"
              >
                <CheckSquare className="w-4 h-4 text-indigo-400" /> 
                <span>Phê Duyệt Quy Trình</span>
                {totalPending > 0 && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-amber-500 text-slate-950 font-extrabold font-mono text-[10px] px-2 py-0.5 rounded-full animate-pulse">
                    {totalPending}
                  </span>
                )}
              </button>
            );
          })()}

          {/* Registration/Approval accounts tab */}
          <button
            onClick={() => setActiveTab("registrations")}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-2.5 transition-all relative cursor-pointer ${
              activeTab === "registrations" ? "bg-indigo-600 text-white font-bold shadow-sm" : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
            id="admin-nav-registrations"
          >
            <UserPlus className="w-4 h-4 text-indigo-400" /> 
            <span>Duyệt Tài Khoản Cán Bộ</span>
            {registrations.filter(r => r.status === "PENDING").length > 0 && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-amber-500 text-slate-950 font-extrabold font-mono text-[10px] px-2 py-0.5 rounded-full animate-pulse">
                {registrations.filter(r => r.status === "PENDING").length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("logs")}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === "logs" ? "bg-indigo-600 text-white font-bold shadow-sm" : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
            id="admin-nav-logs"
          >
            <ShieldAlert className="w-4 h-4" /> Nhật Ký Thao Tác
          </button>
        </nav>

        {/* Quick Export Panel inside sidebar footer */}
        <div className="p-4 border-t border-slate-800 space-y-2 text-[10px]">
          <span className="text-slate-500 font-bold block uppercase tracking-wider">Trích xuất báo cáo</span>
          <button
            onClick={() => handleSimulatedExport("EXCEL")}
            className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold rounded flex items-center justify-center gap-1 border border-slate-800 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" /> Export Excel (.xlsx)
          </button>
          <button
            onClick={() => handleSimulatedExport("PDF")}
            className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold rounded flex items-center justify-center gap-1 border border-slate-800 transition-all cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-red-500" /> Export PDF Report
          </button>
        </div>
      </div>

      {/* MAIN CONTAINER PANEL */}
      <div className="flex-1 p-6 lg:p-8 space-y-6 overflow-x-hidden">
        
        {/* Dynamic TAB 1: REPORT & STATISTICS DASHBOARD */}
        {activeTab === "dashboard" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
            key="admin-dashboard-tab"
          >
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Cổng Quản Trị Hệ Thống Toàn Xã</h1>
              <p className="text-xs text-slate-500">Giám sát tổng thể quy mô hành chính, hộ dân, cán bộ và tiến trình giải quyết phản ánh.</p>
            </div>

            {/* General metrics widgets */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Đơn vị thôn sáp nhập</span>
                <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{stats.totalVillages} thôn</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Tổng hộ dân cư</span>
                <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{stats.totalHouseholds.toLocaleString()} hộ</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Tổng số nhân khẩu</span>
                <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{stats.totalPopulation.toLocaleString()} khẩu</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative group">
                <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Tổng diện tích tự nhiên</span>
                {isEditingArea ? (
                  <form onSubmit={handleSaveArea} className="mt-1 flex items-center gap-1.5">
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={inputArea}
                      onChange={(e) => setInputArea(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900"
                      autoFocus
                    />
                    <button type="submit" className="p-1 px-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg cursor-pointer text-xs font-bold transition-all shrink-0 shadow-sm">
                      Lưu
                    </button>
                    <button type="button" onClick={() => setIsEditingArea(false)} className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg cursor-pointer text-xs font-bold transition-all shrink-0">
                      Hủy
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-2xl font-extrabold text-slate-900">{stats.totalArea} km²</span>
                    <button
                      onClick={() => {
                        setInputArea(stats.totalArea.toString());
                        setIsEditingArea(true);
                      }}
                      title="Cập nhật diện tích thủ công"
                      className="text-indigo-600 hover:text-indigo-800 p-1 rounded-lg border border-indigo-100 bg-indigo-50 hover:bg-indigo-100 cursor-pointer transition-all flex items-center gap-1 text-[11px] font-bold"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Cập nhật</span>
                    </button>
                  </div>
                )}
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Đội ngũ cán bộ xã/thôn</span>
                <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{stats.totalOfficials} đ/chí</span>
              </div>
            </div>

            {/* Custom interactive visual charts designed in beautiful SVG/Tailwind */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Population allocation across villages - SVG Bar Chart */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <h3 className="font-bold text-slate-900 text-sm">Biểu đồ so sánh dân số giữa các thôn sáp nhập (người)</h3>
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded border border-indigo-150">Real-time</span>
                </div>

                <div className="space-y-4 pt-2">
                  {tenantVillages.map(v => {
                    // Calculate percentage relative to max population in ward
                    const maxPop = Math.max(...tenantVillages.map(vi => vi.population), 1);
                    const percent = (v.population / maxPop) * 100;
                    return (
                      <div key={v.id} className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-slate-700">{v.name}</span>
                          <span className="font-mono text-slate-500 font-bold">{v.population.toLocaleString()} khẩu</span>
                        </div>
                        <div className="h-4 bg-slate-100 rounded-full overflow-hidden flex">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${percent}%` }}
                            transition={{ duration: 0.8 }}
                            className="bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-full"
                          />
                        </div>
                      </div>
                    );
                  })}
                  {tenantVillages.length === 0 && (
                    <p className="text-center text-slate-400 py-10 text-xs">Chưa có dữ liệu thôn để hiển thị biểu đồ.</p>
                  )}
                </div>
              </div>

              {/* Household count breakdown distribution - Donut style meter */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <h3 className="font-bold text-slate-900 text-sm">Mật độ quy mô Hộ gia đình</h3>
                  <span className="text-[10px] text-slate-400 font-mono font-bold">TỔNG HỢP XÃ</span>
                </div>

                <div className="flex flex-col items-center justify-center py-4">
                  {/* Custom radial indicator */}
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90">
                      <circle 
                        cx="72" cy="72" r="58" 
                        stroke="#f1f5f9" strokeWidth="12" fill="transparent"
                      />
                      <circle 
                        cx="72" cy="72" r="58" 
                        stroke="#4f46e5" strokeWidth="12" fill="transparent"
                        strokeDasharray="364.4" strokeDashoffset="90" // Simulated dash offset representation
                      />
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-3xl font-extrabold text-slate-900 font-mono">{stats.totalHouseholds}</span>
                      <span className="text-[10px] text-slate-500 block uppercase font-bold mt-0.5">Tổng Số Hộ</span>
                    </div>
                  </div>

                  <div className="w-full space-y-2 mt-6 text-xs text-slate-600">
                    {tenantVillages.map((v, idx) => (
                      <div key={v.id} className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <span className={`w-2.5 h-2.5 rounded-full ${idx === 0 ? 'bg-indigo-600' : idx === 1 ? 'bg-indigo-400' : 'bg-slate-400'}`}></span>
                          {v.name}
                        </span>
                        <span className="font-mono font-bold">{v.householdCount} hộ ({Math.round(v.householdCount / stats.totalHouseholds * 100)}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Quick access system activity log dashboard clip */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2.5 mb-3">Nhật ký hoạt động sáp nhập gần đây</h3>
              <div className="space-y-2.5 text-xs">
                {auditLogs.slice(0, 4).map(log => (
                  <div key={log.id} className="flex items-start justify-between p-2.5 bg-slate-50 border border-slate-150 rounded-lg">
                    <div className="space-y-0.5">
                      <span className="bg-indigo-50 text-indigo-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider border border-indigo-200">
                        {log.action}
                      </span>
                      <p className="text-slate-700 font-medium">{log.details}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            </div>

          </motion.div>
        )}

        {/* Dynamic TAB 2: VILLAGES MANAGEMENT (CRUD) */}
        {activeTab === "villages" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
            key="admin-villages-tab"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Quản Lý Thôn / Xóm</h1>
                <p className="text-xs text-slate-500">Thêm mới, sửa đổi chỉ số, quy hoạch cơ sở hạ tầng nhà văn hóa, GPS.</p>
              </div>
              <button
                onClick={() => { setEditingVillage(null); setShowAddVillageForm(!showAddVillageForm); }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                id="add-village-btn"
              >
                <Plus className="w-4 h-4" /> Thành Lập Thôn Mới
              </button>
            </div>

            {/* Create Village Form inline panel */}
            {showAddVillageForm && (
              <form onSubmit={handleCreateVillage} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-md">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                  <h3 className="font-extrabold text-sm text-indigo-900 uppercase tracking-wide">Đăng Ký Thành Lập Thôn Sáp Nhập Mới</h3>
                  <button type="button" onClick={() => setShowAddVillageForm(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Tên thôn mới *</label>
                    <input
                      type="text" required
                      value={newVillageForm.name}
                      onChange={(e) => setNewVillageForm({...newVillageForm, name: e.target.value})}
                      placeholder="Ví dụ: Thôn Tăng Phong"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                      id="new-village-name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Danh sách các xóm/thôn cũ sáp nhập *</label>
                    <input
                      type="text" required
                      value={newVillageForm.formerNames}
                      onChange={(e) => setNewVillageForm({...newVillageForm, formerNames: e.target.value})}
                      placeholder="Ví dụ: Thôn Tăng Ngoại, Thôn Phong Thành..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                      id="new-village-former"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Số hộ dân cư quy đổi *</label>
                    <input
                      type="number" required min="1"
                      value={newVillageForm.householdCount}
                      onChange={(e) => setNewVillageForm({...newVillageForm, householdCount: parseInt(e.target.value) || 0})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Tổng số nhân khẩu *</label>
                    <input
                      type="number" required min="1"
                      value={newVillageForm.population}
                      onChange={(e) => setNewVillageForm({...newVillageForm, population: parseInt(e.target.value) || 0})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Diện tích đất tự nhiên (ha) *</label>
                    <input
                      type="number" required min="1"
                      value={newVillageForm.area}
                      onChange={(e) => setNewVillageForm({...newVillageForm, area: parseFloat(e.target.value) || 0})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Mô phỏng GPS (Latitude, Longitude)</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number" step="0.0001" required
                        value={newVillageForm.latitude}
                        onChange={(e) => setNewVillageForm({...newVillageForm, latitude: parseFloat(e.target.value) || 20.0})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      />
                      <input
                        type="number" step="0.0001" required
                        value={newVillageForm.longitude}
                        onChange={(e) => setNewVillageForm({...newVillageForm, longitude: parseFloat(e.target.value) || 106.0})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Tải lên Banner / Ảnh minh họa (Mẫu tự động)</label>
                    <input
                      type="text" required
                      value={newVillageForm.imageUrl}
                      onChange={(e) => setNewVillageForm({...newVillageForm, imageUrl: e.target.value})}
                      className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-500 font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Bài viết giới thiệu thôn</label>
                  <textarea
                    rows={2}
                    value={newVillageForm.introduction}
                    onChange={(e) => setNewVillageForm({...newVillageForm, introduction: e.target.value})}
                    placeholder="Mô tả tóm tắt lịch sử, địa bàn hoạt động thôn..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Mã Nhúng Bản Đồ Google Map Iframe (Tùy chọn)</label>
                  <textarea
                    rows={2}
                    value={newVillageForm.mapIframe}
                    onChange={(e) => setNewVillageForm({...newVillageForm, mapIframe: e.target.value})}
                    placeholder='Ví dụ: &lt;iframe src="https://www.google.com/maps/embed?..."&gt;&lt;/iframe&gt;'
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white font-mono"
                  ></textarea>
                  <p className="text-[10px] text-slate-400 mt-1">Dán mã nhúng {"<iframe>"} từ Google Maps để thay thế hình định vị giả lập bằng bản đồ tương tác thật.</p>
                </div>

                <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg uppercase tracking-wider shadow-sm cursor-pointer">
                  Ký Quyết Định & Tạo Đơn Vị Thôn
                </button>
              </form>
            )}

            {/* List Villages management list */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full border-collapse text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[10px] font-extrabold uppercase text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="p-4">Tên thôn mới</th>
                    <th className="p-4">Thôn xóm cũ sáp nhập</th>
                    <th className="p-4 text-center">Hộ khẩu</th>
                    <th className="p-4 text-center">Dân số</th>
                    <th className="p-4 text-center">Diện tích</th>
                    <th className="p-4">Nhà văn hóa</th>
                    <th className="p-4 text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {tenantVillages.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/70 transition-all">
                      <td className="p-4 font-bold text-slate-900">{v.name}</td>
                      <td className="p-4 max-w-[200px] truncate text-slate-500" title={v.formerNames}>{v.formerNames}</td>
                      <td className="p-4 text-center font-mono">{v.householdCount} hộ</td>
                      <td className="p-4 text-center font-mono">{v.population} người</td>
                      <td className="p-4 text-center font-mono">{v.area} ha</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${v.hasCultureHouse ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                          {v.hasCultureHouse ? "Sẵn sàng" : "Chờ xây"}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setEditingVillage(v)}
                            className="p-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded cursor-pointer"
                            title="Chỉnh sửa chỉ số"
                            id={`edit-village-${v.id}`}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteVillageAction(v.id, v.name)}
                            className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded cursor-pointer"
                            title="Xóa thôn"
                            id={`delete-village-${v.id}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Editing Village Overlay Modal */}
            <AnimatePresence>
              {editingVillage && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <motion.form 
                    onSubmit={handleUpdateVillageSubmit}
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.95 }}
                    className="bg-white rounded-xl shadow-xl border border-slate-200 p-6 max-w-lg w-full space-y-4 text-slate-800 text-xs"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                      <h3 className="font-extrabold text-sm text-slate-900">Sửa đổi chỉ số Thôn: {editingVillage.name}</h3>
                      <button type="button" onClick={() => setEditingVillage(null)} className="text-slate-400 hover:text-slate-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Số hộ dân cư</label>
                        <input
                          type="number" required
                          value={editingVillage.householdCount}
                          onChange={(e) => setEditingVillage({...editingVillage, householdCount: parseInt(e.target.value) || 0})}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Số nhân khẩu</label>
                        <input
                          type="number" required
                          value={editingVillage.population}
                          onChange={(e) => setEditingVillage({...editingVillage, population: parseInt(e.target.value) || 0})}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Diện tích (ha)</label>
                        <input
                          type="number" step="0.1" required
                          value={editingVillage.area}
                          onChange={(e) => setEditingVillage({...editingVillage, area: parseFloat(e.target.value) || 0})}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Tên thôn sáp nhập mới</label>
                      <input
                        type="text" required
                        value={editingVillage.name}
                        onChange={(e) => setEditingVillage({...editingVillage, name: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Thôn cũ sáp nhập</label>
                      <input
                        type="text" required
                        value={editingVillage.formerNames}
                        onChange={(e) => setEditingVillage({...editingVillage, formerNames: e.target.value})}
                        className="w-full bg-slate-100 border border-slate-200 rounded px-2.5 py-2"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Đường dẫn Ảnh đại diện thôn (Image URL) *</label>
                      <input
                        type="text" required
                        value={editingVillage.imageUrl || ""}
                        onChange={(e) => setEditingVillage({...editingVillage, imageUrl: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 font-mono"
                        placeholder="Nhập URL ảnh Unsplash..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Đường dẫn Banner rộng thôn (Banner URL) *</label>
                      <input
                        type="text" required
                        value={editingVillage.bannerUrl || ""}
                        onChange={(e) => setEditingVillage({...editingVillage, bannerUrl: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 font-mono"
                        placeholder="Nhập URL ảnh banner..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Vĩ độ (Latitude) *</label>
                        <input
                          type="number" step="0.0001" required
                          value={editingVillage.latitude}
                          onChange={(e) => setEditingVillage({...editingVillage, latitude: parseFloat(e.target.value) || 20.0})}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 font-mono font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Kinh độ (Longitude) *</label>
                        <input
                          type="number" step="0.0001" required
                          value={editingVillage.longitude}
                          onChange={(e) => setEditingVillage({...editingVillage, longitude: parseFloat(e.target.value) || 106.0})}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 font-mono font-semibold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Mã Nhúng Bản Đồ Google Map Iframe (Tùy chọn)</label>
                      <textarea
                        rows={2}
                        value={editingVillage.mapIframe || ""}
                        onChange={(e) => setEditingVillage({...editingVillage, mapIframe: e.target.value})}
                        placeholder='Ví dụ: &lt;iframe src="https://www.google.com/maps/embed?..."&gt;&lt;/iframe&gt;'
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 font-mono"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">Dán mã nhúng {"<iframe>"} từ Google Maps để cập nhật bản đồ định vị tương tác trực tiếp.</p>
                    </div>

                    <div className="flex gap-2 pt-2 text-xs">
                      <button type="submit" className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded cursor-pointer">
                        Lưu thông số mới
                      </button>
                      <button type="button" onClick={() => setEditingVillage(null)} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded cursor-pointer">
                        Đóng
                      </button>
                    </div>
                  </motion.form>
                </div>
              )}
            </AnimatePresence>

          </motion.div>
        )}

        {/* Dynamic TAB 3: OFFICIALS MANAGEMENT (CRUD) */}
        {activeTab === "officials" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
            key="admin-officials-tab"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Quản Lý Nhân Sự Cán Bộ</h1>
                <p className="text-xs text-slate-500">Phân nhiệm Bí thư, Trưởng thôn, Chủ tịch UBND hoặc các bộ phận chuyên trách xóm.</p>
              </div>
              <button
                onClick={() => { setEditingOfficial(null); setShowAddOfficialForm(!showAddOfficialForm); }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm cursor-pointer"
                id="add-official-btn"
              >
                <UserPlus className="w-4 h-4" /> Bổ Nhiệm Cán Bộ
              </button>
            </div>

            {/* Create Official Form Panel */}
            {showAddOfficialForm && (
              <form onSubmit={handleCreateOfficial} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-md text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                  <h3 className="font-extrabold text-sm text-indigo-900 uppercase tracking-wide">Hồ Sơ Bổ Nhiệm Cán Bộ Mới</h3>
                  <button type="button" onClick={() => setShowAddOfficialForm(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Họ và tên *</label>
                    <input
                      type="text" required
                      value={newOfficialForm.name}
                      onChange={(e) => setNewOfficialForm({...newOfficialForm, name: e.target.value})}
                      placeholder="Ví dụ: Lê Văn Nam"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white font-semibold"
                      id="new-official-name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Số điện thoại di động *</label>
                    <input
                      type="tel" required
                      value={newOfficialForm.phone}
                      onChange={(e) => setNewOfficialForm({...newOfficialForm, phone: e.target.value})}
                      placeholder="Số điện thoại..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      id="new-official-phone"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Địa bàn phụ trách *</label>
                    <select
                      value={newOfficialForm.villageId}
                      onChange={(e) => setNewOfficialForm({...newOfficialForm, villageId: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="COMMUNE">Chính quyền cấp Xã</option>
                      {tenantVillages.map(v => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Chức danh / Vị trí phụ trách *</label>
                    <input
                      type="text" required
                      value={newOfficialForm.position}
                      onChange={(e) => setNewOfficialForm({...newOfficialForm, position: e.target.value})}
                      placeholder="Ví dụ: Trưởng thôn, Bí thư chi bộ..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Ngày sinh / Năm sinh</label>
                    <input
                      type="text"
                      value={newOfficialForm.birthDate}
                      onChange={(e) => setNewOfficialForm({...newOfficialForm, birthDate: e.target.value})}
                      placeholder="Ví dụ: 1962 hoặc 15/06/1985..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Giới tính</label>
                    <div className="flex gap-4 py-1.5">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="gender-opt" checked={newOfficialForm.gender === "Nam"} onChange={() => setNewOfficialForm({...newOfficialForm, gender: "Nam"})} className="cursor-pointer" />
                        Nam
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="gender-opt" checked={newOfficialForm.gender === "Nữ"} onChange={() => setNewOfficialForm({...newOfficialForm, gender: "Nữ"})} className="cursor-pointer" />
                        Nữ
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Thôn cũ (Nếu có)</label>
                    <input
                      type="text"
                      value={newOfficialForm.formerVillage}
                      onChange={(e) => setNewOfficialForm({...newOfficialForm, formerVillage: e.target.value})}
                      placeholder="Ví dụ: Thôn 3B, Thôn Gò..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Trình độ Văn hóa</label>
                    <input
                      type="text"
                      value={newOfficialForm.education}
                      onChange={(e) => setNewOfficialForm({...newOfficialForm, education: e.target.value})}
                      placeholder="Ví dụ: 10/10, 12/12..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Chuyên môn</label>
                    <input
                      type="text"
                      value={newOfficialForm.specialization}
                      onChange={(e) => setNewOfficialForm({...newOfficialForm, specialization: e.target.value})}
                      placeholder="TC, CĐ, ĐH..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Lý luận chính trị</label>
                    <input
                      type="text"
                      value={newOfficialForm.politicalTheory}
                      onChange={(e) => setNewOfficialForm({...newOfficialForm, politicalTheory: e.target.value})}
                      placeholder="Sơ cấp, Trung cấp..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <label className="flex items-center gap-1.5 cursor-pointer select-none font-bold text-slate-700">
                      <input 
                        type="checkbox" 
                        checked={newOfficialForm.isPartyMember} 
                        onChange={(e) => setNewOfficialForm({...newOfficialForm, isPartyMember: e.target.checked})} 
                        className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                      />
                      Đảng viên (x)
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Ghi chú nhân sự</label>
                  <input
                    type="text"
                    value={newOfficialForm.notes}
                    onChange={(e) => setNewOfficialForm({...newOfficialForm, notes: e.target.value})}
                    placeholder="Ghi chú chi tiết, nhiệm kỳ cũ..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg uppercase tracking-wider cursor-pointer">
                  Phê Duyệt Quyết Định Bổ Nhiệm
                </button>
              </form>
            )}

            {/* Search and Filter Toolbar */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
              <div className="relative md:col-span-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Tìm theo Tên, Chức danh, SĐT, Email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-400 font-semibold"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    Xóa
                  </button>
                )}
              </div>

              <div className="md:col-span-1">
                <select
                  value={villageFilter}
                  onChange={(e) => setVillageFilter(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                >
                  <option value="">-- Tất cả địa bàn phụ trách --</option>
                  <option value="COMMUNE">Chính quyền cấp Xã</option>
                  {tenantVillages.map(v => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-1 flex items-center justify-end text-[11px] text-slate-500">
                Hiển thị <strong className="text-indigo-600 mx-1">{filteredOfficials.length}</strong> / {tenantOfficials.length} nhân sự
              </div>
            </div>

            {/* Grid listings of officials */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full border-collapse text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[10px] font-extrabold uppercase text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="p-4">Họ và tên cán bộ</th>
                    <th className="p-4">Chức vụ</th>
                    <th className="p-4">Địa bàn phụ trách</th>
                    <th className="p-4">Điện thoại</th>
                    <th className="p-4">Email liên hệ</th>
                    <th className="p-4 text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredOfficials.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 font-bold">
                        Không tìm thấy cán bộ nào phù hợp với từ khóa hoặc bộ lọc của bạn.
                      </td>
                    </tr>
                  )}
                  {filteredOfficials.map(o => (
                    <tr key={o.id} className="hover:bg-slate-50/70 transition-all">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img src={o.avatar} alt={o.name} className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0" referrerPolicy="no-referrer" />
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1">
                              {o.name}
                              {o.isPartyMember && (
                                <span className="text-[9px] font-bold text-red-600 bg-red-50 border border-red-100 px-1 py-0.2 rounded-full cursor-help" title="Đảng viên">
                                  ★
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono block">
                              NS: {o.birthDate} ({o.gender}) 
                              {o.formerVillage && ` | Cũ: ${o.formerVillage}`}
                              {o.education && ` | VH: ${o.education}`}
                              {o.specialization && ` | CM: ${o.specialization}`}
                              {o.politicalTheory && ` | LLCT: ${o.politicalTheory}`}
                            </span>
                            {o.notes && (
                              <span className="text-[9px] text-slate-400 italic block leading-tight mt-0.5 max-w-xs truncate" title={o.notes}>
                                Ghi chú: {o.notes}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-slate-700">
                        <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2.5 py-1 rounded border border-indigo-150">
                          {o.position}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500">
                        {o.villageId === "COMMUNE" ? "Cấp Ủy / UBND Xã" : tenantVillages.find(v => v.id === o.villageId)?.name}
                      </td>
                      <td className="p-4 font-mono text-slate-700">{o.phone}</td>
                      <td className="p-4 font-mono text-slate-400">{o.email}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setEditingOfficial(o)}
                            className="p-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded cursor-pointer"
                            title="Chỉnh sửa hồ sơ"
                            id={`edit-official-${o.id}`}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteOfficialAction(o.id, o.name)}
                            className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded cursor-pointer"
                            title="Bãi nhiệm"
                            id={`delete-official-${o.id}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Editing Official Overlay modal */}
            <AnimatePresence>
              {editingOfficial && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <motion.form 
                    onSubmit={handleUpdateOfficialSubmit}
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.95 }}
                    className="bg-white rounded-xl shadow-xl border border-slate-200 p-6 max-w-md w-full space-y-4 text-slate-800 text-xs"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                      <h3 className="font-extrabold text-sm text-slate-900">Sửa đổi hồ sơ cán bộ</h3>
                      <button type="button" onClick={() => setEditingOfficial(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Chức danh / Vị trí</label>
                        <input
                          type="text" required
                          value={editingOfficial.position}
                          onChange={(e) => setEditingOfficial({...editingOfficial, position: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 font-bold focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Họ và tên cán bộ</label>
                        <input
                          type="text" required
                          value={editingOfficial.name}
                          onChange={(e) => setEditingOfficial({...editingOfficial, name: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Ngày sinh / Năm sinh</label>
                        <input
                          type="text" required
                          value={editingOfficial.birthDate}
                          onChange={(e) => setEditingOfficial({...editingOfficial, birthDate: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Điện thoại liên hệ</label>
                        <input
                          type="tel" required
                          value={editingOfficial.phone}
                          onChange={(e) => setEditingOfficial({...editingOfficial, phone: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Đơn vị Thôn cũ</label>
                        <input
                          type="text"
                          value={editingOfficial.formerVillage || ""}
                          onChange={(e) => setEditingOfficial({...editingOfficial, formerVillage: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Trình độ văn hóa</label>
                        <input
                          type="text"
                          value={editingOfficial.education || ""}
                          onChange={(e) => setEditingOfficial({...editingOfficial, education: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Chuyên môn</label>
                        <input
                          type="text"
                          value={editingOfficial.specialization || ""}
                          onChange={(e) => setEditingOfficial({...editingOfficial, specialization: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Lý luận CT</label>
                        <input
                          type="text"
                          value={editingOfficial.politicalTheory || ""}
                          onChange={(e) => setEditingOfficial({...editingOfficial, politicalTheory: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>

                      <div className="col-span-2 py-1 flex items-center">
                        <label className="flex items-center gap-1.5 cursor-pointer select-none font-bold text-slate-700">
                          <input 
                            type="checkbox" 
                            checked={!!editingOfficial.isPartyMember} 
                            onChange={(e) => setEditingOfficial({...editingOfficial, isPartyMember: e.target.checked})} 
                            className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                          />
                          Là Đảng viên (x)
                        </label>
                      </div>

                      <div className="col-span-2">
                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Ghi chú</label>
                        <input
                          type="text"
                          value={editingOfficial.notes || ""}
                          onChange={(e) => setEditingOfficial({...editingOfficial, notes: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button type="submit" className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded cursor-pointer">
                        Cập nhật hồ sơ
                      </button>
                      <button type="button" onClick={() => setEditingOfficial(null)} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded cursor-pointer">
                        Đóng
                      </button>
                    </div>
                  </motion.form>
                </div>
              )}
            </AnimatePresence>

          </motion.div>
        )}

        {/* Dynamic TAB 4: ADMINISTRATIVE OFFICES (CRUD) */}
        {activeTab === "offices" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
            key="admin-offices-tab"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Cấu Hình Trụ Sở Ban Ngành</h1>
                <p className="text-xs text-slate-500">Quản lý định vị, mô tả, số liên hệ trực thuộc Công an, Y tế, Quân sự, Trường học...</p>
              </div>
              <button
                onClick={() => { setEditingOffice(null); setShowAddOfficeForm(!showAddOfficeForm); }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm cursor-pointer"
                id="add-office-btn"
              >
                <Plus className="w-4 h-4" /> Đăng Ký Cơ Quan
              </button>
            </div>

            {/* Create Office inline Form */}
            {showAddOfficeForm && (
              <form onSubmit={handleCreateOffice} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-md text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                  <h3 className="font-extrabold text-sm text-indigo-900 uppercase tracking-wide">Đăng Ký Ban Ngành / Trụ Sở Mới</h3>
                  <button type="button" onClick={() => setShowAddOfficeForm(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Tên cơ quan / Ban ngành *</label>
                    <input
                      type="text" required
                      value={newOfficeForm.name}
                      onChange={(e) => setNewOfficeForm({...newOfficeForm, name: e.target.value})}
                      placeholder="Ví dụ: Quân sự Xã Hải Anh"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      id="new-office-name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Số điện thoại trực ban *</label>
                    <input
                      type="tel" required
                      value={newOfficeForm.phone}
                      onChange={(e) => setNewOfficeForm({...newOfficeForm, phone: e.target.value})}
                      placeholder="Ví dụ: 0229.3864.123"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Địa chỉ trụ sở vật lý *</label>
                  <input
                    type="text" required
                    value={newOfficeForm.address}
                    onChange={(e) => setNewOfficeForm({...newOfficeForm, address: e.target.value})}
                    placeholder="Nhập địa điểm thực tế..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Chức năng & Nhiệm vụ chuyên môn</label>
                  <textarea
                    rows={2}
                    value={newOfficeForm.description}
                    onChange={(e) => setNewOfficeForm({...newOfficeForm, description: e.target.value})}
                    placeholder="Mô tả tóm tắt quyền hạn công đức trực..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  ></textarea>
                </div>

                <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg uppercase tracking-wider cursor-pointer">
                  Kích Hoạt Hoạt Động Cơ Quan
                </button>
              </form>
            )}

            {/* Edit Office Form */}
            {editingOffice && (
              <form onSubmit={handleUpdateOfficeSubmit} className="bg-slate-100 rounded-xl border-2 border-indigo-500 p-6 space-y-4 shadow-md text-xs">
                <div className="flex items-center justify-between border-b border-indigo-200 pb-2 mb-2">
                  <h3 className="font-extrabold text-sm text-indigo-950 uppercase tracking-wide flex items-center gap-1.5">
                    <Edit3 className="w-4 h-4 text-indigo-600" /> Chỉnh Sửa Thông Tin Ban Ngành / Trụ Sở
                  </h3>
                  <button type="button" onClick={() => setEditingOffice(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Tên cơ quan / Ban ngành *</label>
                    <input
                      type="text" required
                      value={editingOffice.name}
                      onChange={(e) => setEditingOffice({...editingOffice, name: e.target.value})}
                      placeholder="Ví dụ: Quân sự Xã Hải Anh"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none text-slate-900 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Số điện thoại trực ban *</label>
                    <input
                      type="tel" required
                      value={editingOffice.phone}
                      onChange={(e) => setEditingOffice({...editingOffice, phone: e.target.value})}
                      placeholder="Ví dụ: 0229.3864.123"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none text-slate-900 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Địa chỉ trụ sở vật lý *</label>
                  <input
                    type="text" required
                    value={editingOffice.address}
                    onChange={(e) => setEditingOffice({...editingOffice, address: e.target.value})}
                    placeholder="Nhập địa điểm thực tế..."
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none text-slate-900 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Chức năng & Nhiệm vụ chuyên môn</label>
                  <textarea
                    rows={2}
                    value={editingOffice.description}
                    onChange={(e) => setEditingOffice({...editingOffice, description: e.target.value})}
                    placeholder="Mô tả tóm tắt quyền hạn nhiệm vụ..."
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none text-slate-900 font-semibold"
                  ></textarea>
                </div>

                <div className="flex items-center gap-3">
                  <button type="submit" className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg uppercase tracking-wider cursor-pointer">
                    Cập Nhật Thông Tin Trụ Sở
                  </button>
                  <button type="button" onClick={() => setEditingOffice(null)} className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-lg uppercase cursor-pointer">
                    Hủy
                  </button>
                </div>
              </form>
            )}

            {/* List current physical offices */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tenantOffices.map((office) => (
                <div key={office.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex justify-between items-start">
                  <div className="space-y-2">
                    <h3 className="font-extrabold text-slate-900 text-sm">{office.name}</h3>
                    <p className="text-slate-500 text-xs flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" /> {office.address}
                    </p>
                    <p className="text-slate-600 text-[11px] leading-relaxed line-clamp-2 pr-4">{office.description}</p>
                    <span className="inline-block font-mono text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      HOTLINE: {office.phone}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => { setEditingOffice(office); setShowAddOfficeForm(false); }}
                      className="p-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded cursor-pointer transition-all"
                      title="Chỉnh sửa trụ sở"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteOfficeAction(office.id, office.name)}
                      className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded cursor-pointer transition-all"
                      title="Xóa trụ sở"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Dynamic TAB 5: COMPLAINTS & FIELD REFLECTIONS */}
        {activeTab === "reflections" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
            key="admin-reflections-tab"
          >
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Hồ Sơ Phản Ánh Hiện Trường Của Nhân Dân</h1>
              <p className="text-xs text-slate-500">Giám sát, phân loại, giải trình và duyệt trạng thái xử lý cho bà con.</p>
            </div>

            <div className="space-y-4">
              {tenantReflections.map((ref) => (
                <div key={ref.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">{ref.title}</span>
                      <p className="text-slate-400 text-[10px] mt-0.5 font-medium">
                        Người gửi: <strong className="text-slate-600 font-semibold">{ref.citizenName}</strong> | SĐT: <span className="font-mono">{ref.citizenPhone}</span> | Gửi lúc: {new Date(ref.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <span className={`px-2.5 py-1 rounded text-[10px] font-extrabold font-mono ${
                      ref.status === "PENDING" ? "bg-amber-100 text-amber-800 animate-pulse" :
                      ref.status === "RESOLVED" ? "bg-emerald-100 text-emerald-800" :
                      "bg-rose-100 text-rose-800"
                    }`}>
                      {ref.status === "PENDING" ? "ĐANG CHỜ" : ref.status === "RESOLVED" ? "ĐÃ XỬ LÝ" : "TỪ CHỐI CHẤP THUẬN"}
                    </span>
                  </div>

                  <p className="text-slate-600 leading-relaxed text-sm">{ref.content}</p>

                  {/* Media Evidence Display */}
                  {ref.videoUrl || ref.mediaType === "video" ? (
                    <div className="rounded-xl overflow-hidden bg-slate-950 border border-slate-200 p-1">
                      <div className="px-3 py-1.5 flex items-center justify-between text-[11px] text-slate-300 border-b border-slate-800">
                        <span className="font-bold flex items-center gap-1 text-rose-400">🎥 Bằng chứng Video từ công dân</span>
                        <span className="font-mono text-[10px] text-slate-400">HD / MP4</span>
                      </div>
                      <video controls src={ref.videoUrl} className="w-full max-h-72 object-contain bg-black rounded-b-lg">
                        Trình duyệt không hỗ trợ phát video này.
                      </video>
                    </div>
                  ) : ref.imageUrl ? (
                    <div className="rounded-xl overflow-hidden border border-slate-200">
                      <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-700 flex items-center gap-1">
                        🖼️ Hình ảnh hiện trường
                      </div>
                      <img src={ref.imageUrl} alt={ref.title} className="w-full max-h-64 object-cover" />
                    </div>
                  ) : null}

                  <div className="p-3 bg-slate-50 border border-slate-200/50 rounded-lg flex items-center justify-between text-[11px] text-slate-600">
                    <span className="flex items-center gap-1 font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      Địa bàn: {tenantVillages.find(v => v.id === ref.villageId)?.name || "Cấp Xã"}
                    </span>
                    {ref.latitude && (
                      <span className="font-mono text-slate-500">
                        GPS: {ref.latitude}, {ref.longitude}
                      </span>
                    )}
                  </div>

                  {ref.status === "PENDING" && (
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => {
                          onResolveReflection(ref.id, "RESOLVED");
                          onLogAudit("XỬ LÝ PHẢN ÁNH (ADMIN)", `UBND duyệt ý kiến kiến nghị của công dân ${ref.citizenName}`);
                          triggerToast("Đã duyệt phản ánh hiện trường thành công!");
                        }}
                        className="py-1.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" /> Phê duyệt & Khắc phục
                      </button>
                      <button
                        onClick={() => {
                          onResolveReflection(ref.id, "REJECTED");
                          onLogAudit("BÁC PHẢN ÁNH", `Từ chối tiếp nhận ý kiến của ${ref.citizenName}`);
                          triggerToast("Đã từ chối phản ánh này.");
                        }}
                        className="py-1.5 px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg transition-all cursor-pointer"
                      >
                        Từ chối tiếp nhận
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {tenantReflections.length === 0 && (
                <div className="bg-white py-12 text-center rounded-xl border border-slate-200 text-slate-400">
                  Chưa có ý kiến phản ánh hiện trường nào của người dân được lưu.
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Dynamic TAB 5.5: RBAC MULTI-LEVEL APPROVAL WORKFLOW */}
        {activeTab === "approval" && (() => {
          const pendingCount = 
            villages.filter(v => v.status === "PENDING").length +
            officials.filter(o => o.status === "PENDING").length +
            announcements.filter(a => a.status === "PENDING").length;

          const approvedCount = 
            villages.filter(v => v.status === "APPROVED").length +
            officials.filter(o => o.status === "APPROVED").length +
            announcements.filter(a => a.status === "APPROVED").length;

          const draftRejectedCount = 
            villages.filter(v => v.status === "DRAFT" || v.status === "REJECTED" || !v.status).length +
            officials.filter(o => o.status === "DRAFT" || o.status === "REJECTED" || !o.status).length +
            announcements.filter(a => a.status === "DRAFT" || a.status === "REJECTED" || !a.status).length;

          const displayVillages = villages.filter(v => {
            if (approvalStatusFilter === "PENDING") return v.status === "PENDING";
            if (approvalStatusFilter === "APPROVED") return v.status === "APPROVED";
            return v.status === "DRAFT" || v.status === "REJECTED" || !v.status;
          });

          const displayOfficials = officials.filter(o => {
            if (approvalStatusFilter === "PENDING") return o.status === "PENDING";
            if (approvalStatusFilter === "APPROVED") return o.status === "APPROVED";
            return o.status === "DRAFT" || o.status === "REJECTED" || !o.status;
          });

          const displayAnnouncements = announcements.filter(a => {
            if (approvalStatusFilter === "PENDING") return a.status === "PENDING";
            if (approvalStatusFilter === "APPROVED") return a.status === "APPROVED";
            return a.status === "DRAFT" || a.status === "REJECTED" || !a.status;
          });

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
              key="admin-approval-tab"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    <CheckSquare className="w-6 h-6 text-indigo-600" />
                    Quy Trình Kiểm Duyệt & Công Bố Dữ Liệu (SaaS RBAC)
                  </h1>
                  <p className="text-xs text-slate-500">
                    Phân cấp luồng dữ liệu chuẩn doanh nghiệp: <strong>Staff</strong> nhập liệu nháp → <strong>Manager</strong> kiểm tra & duyệt → <strong>Admin</strong> công bố chính thức ra công dân.
                  </p>
                </div>

                <div className="bg-slate-100 p-1 rounded-xl border border-slate-200/60 flex items-center gap-1">
                  <span className="text-[10px] font-mono font-extrabold text-slate-500 px-2 uppercase">Role Hiện Tại:</span>
                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wide border shadow-xs ${
                    currentRole === UserRole.ADMIN ? "bg-blue-600 text-white border-blue-500" : "bg-indigo-600 text-white border-indigo-500"
                  }`}>
                    {currentRole === UserRole.ADMIN ? "Admin (Chủ tịch)" : "Manager (Phó chủ tịch)"}
                  </span>
                </div>
              </div>

              {/* Matrix Workflow Diagram */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-white rounded-lg border border-slate-150 relative">
                  <div className="w-6 h-6 bg-amber-100 text-amber-800 text-xs font-bold rounded-full flex items-center justify-center mx-auto mb-1">1</div>
                  <span className="text-[11px] font-extrabold text-slate-700 uppercase block">1. Nhập liệu (Staff)</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Tạo bản ghi dạng <strong>Draft</strong>, kiểm tra và bấm "Gửi duyệt".</p>
                  <div className="hidden md:block absolute top-1/2 -right-2 -translate-y-1/2 text-slate-400 font-extrabold z-10">➜</div>
                </div>

                <div className="p-3 bg-indigo-50/50 border border-indigo-150 rounded-lg relative">
                  <div className="w-6 h-6 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-full flex items-center justify-center mx-auto mb-1">2</div>
                  <span className="text-[11px] font-extrabold text-slate-700 uppercase block">2. Chờ duyệt (Pending)</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Manager đối soát dữ liệu thực tế, phát hiện sai sót.</p>
                  <div className="hidden md:block absolute top-1/2 -right-2 -translate-y-1/2 text-slate-400 font-extrabold z-10">➜</div>
                </div>

                <div className="p-3 bg-blue-50/50 border border-blue-150 rounded-lg relative">
                  <div className="w-6 h-6 bg-blue-100 text-blue-800 text-xs font-bold rounded-full flex items-center justify-center mx-auto mb-1">3</div>
                  <span className="text-[11px] font-extrabold text-slate-700 uppercase block">3. Đã duyệt (Approved)</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Manager xác thực chuẩn, chuyển sang hàng chờ công bố.</p>
                  <div className="hidden md:block absolute top-1/2 -right-2 -translate-y-1/2 text-slate-400 font-extrabold z-10">➜</div>
                </div>

                <div className="p-3 bg-emerald-50/50 border border-emerald-150 rounded-lg">
                  <div className="w-6 h-6 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full flex items-center justify-center mx-auto mb-1">4</div>
                  <span className="text-[11px] font-extrabold text-slate-700 uppercase block">4. Công bố (Published)</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Admin (Chủ tịch) ký phát hành. Công dân bắt đầu tra cứu.</p>
                </div>
              </div>

              {/* Filter Toolbar */}
              <div className="bg-slate-100/80 p-2 rounded-2xl border border-slate-200/60 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                <span className="text-xs font-black text-slate-700 uppercase tracking-wide flex items-center gap-1.5 pl-2">
                  <ListFilter className="w-4 h-4 text-indigo-600" />
                  Hồ sơ đang xem:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setApprovalStatusFilter("PENDING")}
                    className={`px-4 py-2 text-xs font-black rounded-xl uppercase tracking-wider cursor-pointer transition-all flex items-center gap-2 border ${
                      approvalStatusFilter === "PENDING"
                        ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/10"
                        : "bg-white hover:bg-slate-50 text-slate-600 border-slate-200"
                    }`}
                  >
                    📥 Chờ duyệt (Pending)
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                      approvalStatusFilter === "PENDING" ? "bg-blue-700 text-blue-100" : "bg-slate-100 text-slate-600"
                    }`}>
                      {pendingCount}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setApprovalStatusFilter("APPROVED")}
                    className={`px-4 py-2 text-xs font-black rounded-xl uppercase tracking-wider cursor-pointer transition-all flex items-center gap-2 border ${
                      approvalStatusFilter === "APPROVED"
                        ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/10"
                        : "bg-white hover:bg-slate-50 text-slate-600 border-slate-200"
                    }`}
                  >
                    ✍️ Đã duyệt (Approved)
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                      approvalStatusFilter === "APPROVED" ? "bg-indigo-700 text-indigo-100" : "bg-slate-100 text-slate-600"
                    }`}>
                      {approvedCount}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setApprovalStatusFilter("DRAFT_REJECTED")}
                    className={`px-4 py-2 text-xs font-black rounded-xl uppercase tracking-wider cursor-pointer transition-all flex items-center gap-2 border ${
                      approvalStatusFilter === "DRAFT_REJECTED"
                        ? "bg-amber-600 text-white border-amber-500 shadow-md shadow-amber-500/10"
                        : "bg-white hover:bg-slate-50 text-slate-600 border-slate-200"
                    }`}
                  >
                    📝 Bản nháp & Từ chối
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                      approvalStatusFilter === "DRAFT_REJECTED" ? "bg-amber-700 text-amber-100" : "bg-slate-100 text-slate-600"
                    }`}>
                      {draftRejectedCount}
                    </span>
                  </button>
                </div>
              </div>

              {/* Approval Workspace Split Columns */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1. VILLAGES APPROVAL DECK */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                  <h2 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Landmark className="w-4 h-4 text-indigo-600" />
                      Thay đổi thông số Thôn xóm
                    </span>
                    <span className="bg-slate-100 text-slate-600 font-mono text-[10px] px-2 py-0.5 rounded-full">
                      {displayVillages.length}
                    </span>
                  </h2>

                  <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
                    {displayVillages.map((v) => {
                      const status = v.status || "DRAFT";
                      return (
                        <div key={v.id} className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-extrabold text-indigo-700">{v.name}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                              status === "PENDING" ? "text-blue-700 bg-blue-50 border-blue-200 animate-pulse" :
                              status === "APPROVED" ? "text-indigo-700 bg-indigo-50 border-indigo-200" :
                              status === "REJECTED" ? "text-rose-700 bg-rose-50 border-rose-200" :
                              "text-amber-700 bg-amber-50 border-amber-200"
                            }`}>
                              {status === "PENDING" ? "Chờ duyệt" : status === "APPROVED" ? "Đã duyệt" : status === "REJECTED" ? "Từ chối" : "Nháp"}
                            </span>
                          </div>

                          <div className="text-[10px] text-slate-600 space-y-1 bg-white p-2.5 rounded-lg border border-slate-100">
                            <div>• Số hộ đề xuất: <strong>{v.householdCount} hộ</strong></div>
                            <div>• Nhân khẩu: <strong>{v.population} khẩu</strong></div>
                            <div>• Tọa độ GPS mới: <strong>{v.latitude}, {v.longitude}</strong></div>
                            <div className="text-[9px] text-slate-400 italic mt-1 border-t border-slate-100 pt-1">Người gửi: {v.createdBy || "Staff"}</div>
                          </div>

                          {/* Actions container for Villages */}
                          <div className="flex flex-wrap gap-1.5 items-center justify-end pt-1.5 border-t border-slate-200/60">
                            {/* PENDING status actions */}
                            {status === "PENDING" && (
                              <>
                                {(currentRole === UserRole.MANAGER || currentRole === UserRole.ADMIN || currentRole === UserRole.SUPER_ADMIN) && (
                                  <>
                                    <button
                                      onClick={() => {
                                        onUpdateVillage({ ...v, status: "REJECTED" });
                                        onLogAudit("BÁC ĐỀ XUẤT THÔN", `Từ chối đề xuất thông số thôn ${v.name}`);
                                        triggerToast("Đã từ chối đề xuất này.");
                                      }}
                                      className="px-2 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-[10px] font-bold rounded-lg cursor-pointer transition-all"
                                    >
                                      Từ chối
                                    </button>
                                    <button
                                      onClick={() => {
                                        onUpdateVillage({ ...v, status: "APPROVED" });
                                        onLogAudit("DUYỆT ĐỀ XUẤT THÔN", `Duyệt thông số mới thôn ${v.name}`);
                                        triggerToast("Đã duyệt! Chờ Admin ký công bố chính thức.");
                                      }}
                                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-lg cursor-pointer transition-all flex items-center gap-0.5 shadow-sm"
                                    >
                                      <Check className="w-3 h-3" /> Duyệt
                                    </button>
                                  </>
                                )}
                                {(currentRole === UserRole.ADMIN || currentRole === UserRole.SUPER_ADMIN) && (
                                  <button
                                    onClick={() => {
                                      onUpdateVillage({ ...v, status: "PUBLISHED" });
                                      onLogAudit("CÔNG BỐ THÔN", `Ký công bố chỉ số mới của thôn ${v.name}`);
                                      triggerToast("Đã ký và công bố chính thức thôn!");
                                    }}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg cursor-pointer transition-all flex items-center gap-0.5 shadow-sm"
                                  >
                                    <CheckCircle2 className="w-3 h-3" /> Công bố
                                  </button>
                                )}
                              </>
                            )}

                            {/* APPROVED status actions */}
                            {status === "APPROVED" && (
                              <>
                                {currentRole === UserRole.MANAGER && (
                                  <span className="text-[10px] text-indigo-600 font-semibold italic bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                                    Đã duyệt - Chờ Chủ tịch công bố
                                  </span>
                                )}
                                {(currentRole === UserRole.ADMIN || currentRole === UserRole.SUPER_ADMIN) && (
                                  <>
                                    <button
                                      onClick={() => {
                                        onUpdateVillage({ ...v, status: "REJECTED" });
                                        onLogAudit("HỦY DUYỆT THÔN", `Hủy phê duyệt thôn ${v.name}`);
                                        triggerToast("Đã hủy duyệt và chuyển về danh sách Từ chối.");
                                      }}
                                      className="px-2 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-[10px] font-bold rounded-lg cursor-pointer transition-all"
                                    >
                                      Hủy duyệt
                                    </button>
                                    <button
                                      onClick={() => {
                                        onUpdateVillage({ ...v, status: "PUBLISHED" });
                                        onLogAudit("CÔNG BỐ THÔN", `Ký công bố chỉ số mới của thôn ${v.name}`);
                                        triggerToast("Đã ký và công bố chính thức thôn!");
                                      }}
                                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg cursor-pointer transition-all flex items-center gap-0.5 shadow-sm"
                                    >
                                      <CheckCircle2 className="w-3 h-3" /> Ký công bố
                                    </button>
                                  </>
                                )}
                              </>
                            )}

                            {/* DRAFT / REJECTED status actions */}
                            {(status === "DRAFT" || status === "REJECTED") && (
                              <>
                                <button
                                  onClick={() => {
                                    onUpdateVillage({ ...v, status: "PENDING" });
                                    onLogAudit("TRÌNH DUYỆT THÔN", `Gửi trình duyệt thông số thôn ${v.name}`);
                                    triggerToast("Đã gửi hồ sơ trình duyệt!");
                                  }}
                                  className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-[10px] font-bold rounded-lg cursor-pointer transition-all"
                                >
                                  Gửi trình duyệt
                                </button>
                                {(currentRole === UserRole.MANAGER || currentRole === UserRole.ADMIN || currentRole === UserRole.SUPER_ADMIN) && (
                                  <button
                                    onClick={() => {
                                      onUpdateVillage({ ...v, status: "APPROVED" });
                                      onLogAudit("DUYỆT NHANH THÔN", `Duyệt nhanh thông số thôn ${v.name}`);
                                      triggerToast("Đã duyệt nhanh!");
                                    }}
                                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-lg cursor-pointer transition-all"
                                  >
                                    Duyệt nhanh
                                  </button>
                                )}
                                {(currentRole === UserRole.ADMIN || currentRole === UserRole.SUPER_ADMIN) && (
                                  <button
                                    onClick={() => {
                                      onUpdateVillage({ ...v, status: "PUBLISHED" });
                                      onLogAudit("CÔNG BỐ NHANH THÔN", `Công bố trực tiếp thông số thôn ${v.name}`);
                                      triggerToast("Đã công bố trực tiếp thành công!");
                                    }}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg cursor-pointer shadow-sm transition-all"
                                  >
                                    Công bố nhanh
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {displayVillages.length === 0 && (
                      <div className="text-center py-10 text-slate-400 text-xs italic">
                        {approvalStatusFilter === "PENDING" ? "Không có đề xuất thôn nào chờ duyệt." :
                         approvalStatusFilter === "APPROVED" ? "Không có đề xuất thôn nào đã duyệt." :
                         "Không có bản nháp hoặc đề xuất thôn bị từ chối."}
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. OFFICIALS APPROVAL DECK */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                  <h2 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-indigo-600" />
                      Nhân sự cán bộ xóm
                    </span>
                    <span className="bg-slate-100 text-slate-600 font-mono text-[10px] px-2 py-0.5 rounded-full">
                      {displayOfficials.length}
                    </span>
                  </h2>

                  <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
                    {displayOfficials.map((o) => {
                      const status = o.status || "DRAFT";
                      return (
                        <div key={o.id} className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-2.5">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-[11px] font-extrabold text-indigo-700 block">{o.name}</span>
                              <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded mt-0.5 inline-block">{o.position}</span>
                            </div>
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                              status === "PENDING" ? "text-blue-700 bg-blue-50 border-blue-200 animate-pulse" :
                              status === "APPROVED" ? "text-indigo-700 bg-indigo-50 border-indigo-200" :
                              status === "REJECTED" ? "text-rose-700 bg-rose-50 border-rose-200" :
                              "text-amber-700 bg-amber-50 border-amber-200"
                            }`}>
                              {status === "PENDING" ? "Chờ duyệt" : status === "APPROVED" ? "Đã duyệt" : status === "REJECTED" ? "Từ chối" : "Nháp"}
                            </span>
                          </div>

                          <div className="text-[10px] text-slate-600 space-y-1 bg-white p-2.5 rounded-lg border border-slate-100">
                            <div>• Địa bàn: <strong>{o.villageId === "COMMUNE" ? "Cấp Ủy / UBND Xã" : tenantVillages.find(v => v.id === o.villageId)?.name || o.villageId}</strong></div>
                            <div>• SĐT: <strong>{o.phone}</strong></div>
                            {o.birthDate && <div>• Ngày sinh: <strong>{o.birthDate} ({o.gender})</strong></div>}
                            {o.specialization && <div>• Chuyên môn: <strong>{o.specialization}</strong></div>}
                          </div>

                          {/* Actions container for Officials */}
                          <div className="flex flex-wrap gap-1.5 items-center justify-end pt-1.5 border-t border-slate-200/60">
                            {/* PENDING status actions */}
                            {status === "PENDING" && (
                              <>
                                {(currentRole === UserRole.MANAGER || currentRole === UserRole.ADMIN || currentRole === UserRole.SUPER_ADMIN) && (
                                  <>
                                    <button
                                      onClick={() => {
                                        onUpdateOfficial({ ...o, status: "REJECTED" });
                                        onLogAudit("BÁC NHÂN SỰ", `Từ chối duyệt nhân sự cán bộ ${o.name}`);
                                        triggerToast("Đã từ chối cán bộ này.");
                                      }}
                                      className="px-2 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-[10px] font-bold rounded-lg cursor-pointer transition-all"
                                    >
                                      Từ chối
                                    </button>
                                    <button
                                      onClick={() => {
                                        onUpdateOfficial({ ...o, status: "APPROVED" });
                                        onLogAudit("DUYỆT NHÂN SỰ", `Phê duyệt nhân sự cán bộ ${o.name}`);
                                        triggerToast("Đã phê duyệt! Chờ Admin ký bổ nhiệm.");
                                      }}
                                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-lg cursor-pointer transition-all flex items-center gap-0.5 shadow-sm"
                                    >
                                      <Check className="w-3 h-3" /> Duyệt
                                    </button>
                                  </>
                                )}
                                {(currentRole === UserRole.ADMIN || currentRole === UserRole.SUPER_ADMIN) && (
                                  <button
                                    onClick={() => {
                                      onUpdateOfficial({ ...o, status: "PUBLISHED" });
                                      onLogAudit("CÔNG BỐ BỔ NHIỆM", `Ký quyết định bổ nhiệm cán bộ ${o.name}`);
                                      triggerToast("Đã ký bổ nhiệm chính thức!");
                                    }}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg cursor-pointer transition-all flex items-center gap-0.5 shadow-sm"
                                  >
                                    <CheckCircle2 className="w-3 h-3" /> Ký bổ nhiệm
                                  </button>
                                )}
                              </>
                            )}

                            {/* APPROVED status actions */}
                            {status === "APPROVED" && (
                              <>
                                {currentRole === UserRole.MANAGER && (
                                  <span className="text-[10px] text-indigo-600 font-semibold italic bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                                    Đã duyệt - Chờ Chủ tịch ký bổ nhiệm
                                  </span>
                                )}
                                {(currentRole === UserRole.ADMIN || currentRole === UserRole.SUPER_ADMIN) && (
                                  <>
                                    <button
                                      onClick={() => {
                                        onUpdateOfficial({ ...o, status: "REJECTED" });
                                        onLogAudit("HỦY DUYỆT BỔ NHIỆM", `Hủy duyệt đề xuất bổ nhiệm cán bộ ${o.name}`);
                                        triggerToast("Đã hủy duyệt và chuyển về danh sách Từ chối.");
                                      }}
                                      className="px-2 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-[10px] font-bold rounded-lg cursor-pointer transition-all"
                                    >
                                      Hủy duyệt
                                    </button>
                                    <button
                                      onClick={() => {
                                        onUpdateOfficial({ ...o, status: "PUBLISHED" });
                                        onLogAudit("CÔNG BỐ BỔ NHIỆM", `Ký quyết định bổ nhiệm cán bộ ${o.name}`);
                                        triggerToast("Đã ký bổ nhiệm chính thức!");
                                      }}
                                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg cursor-pointer transition-all flex items-center gap-0.5 shadow-sm"
                                    >
                                      <CheckCircle2 className="w-3 h-3" /> Ký bổ nhiệm
                                    </button>
                                  </>
                                )}
                              </>
                            )}

                            {/* DRAFT / REJECTED status actions */}
                            {(status === "DRAFT" || status === "REJECTED") && (
                              <>
                                <button
                                  onClick={() => {
                                    onUpdateOfficial({ ...o, status: "PENDING" });
                                    onLogAudit("TRÌNH DUYỆT NHÂN SỰ", `Trình duyệt hồ sơ cán bộ ${o.name}`);
                                    triggerToast("Đã gửi hồ sơ trình duyệt!");
                                  }}
                                  className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-[10px] font-bold rounded-lg cursor-pointer transition-all"
                                >
                                  Gửi trình duyệt
                                </button>
                                {(currentRole === UserRole.MANAGER || currentRole === UserRole.ADMIN || currentRole === UserRole.SUPER_ADMIN) && (
                                  <button
                                    onClick={() => {
                                      onUpdateOfficial({ ...o, status: "APPROVED" });
                                      onLogAudit("DUYỆT NHANH NHÂN SỰ", `Duyệt nhanh hồ sơ cán bộ ${o.name}`);
                                      triggerToast("Đã duyệt nhanh!");
                                    }}
                                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-lg cursor-pointer transition-all"
                                  >
                                    Duyệt nhanh
                                  </button>
                                )}
                                {(currentRole === UserRole.ADMIN || currentRole === UserRole.SUPER_ADMIN) && (
                                  <button
                                    onClick={() => {
                                      onUpdateOfficial({ ...o, status: "PUBLISHED" });
                                      onLogAudit("BỔ NHIỆM NHANH", `Bổ nhiệm trực tiếp cán bộ ${o.name}`);
                                      triggerToast("Đã bổ nhiệm trực tiếp thành công!");
                                    }}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg cursor-pointer shadow-sm transition-all"
                                  >
                                    Bổ nhiệm nhanh
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {displayOfficials.length === 0 && (
                      <div className="text-center py-10 text-slate-400 text-xs italic">
                        {approvalStatusFilter === "PENDING" ? "Không có đề xuất nhân sự nào chờ duyệt." :
                         approvalStatusFilter === "APPROVED" ? "Không có đề xuất nhân sự nào đã duyệt." :
                         "Không có bản nháp hoặc đề xuất nhân sự bị từ chối."}
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. ANNOUNCEMENTS APPROVAL DECK */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                  <h2 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      Bản tin & Chỉ thị thôn
                    </span>
                    <span className="bg-slate-100 text-slate-600 font-mono text-[10px] px-2 py-0.5 rounded-full">
                      {displayAnnouncements.length}
                    </span>
                  </h2>

                  {/* Write new bulletin quick action */}
                  <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-150 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                        <Plus className="w-3.5 h-3.5 text-indigo-600" />
                        Viết bài & Đăng tin cấp xã
                      </span>
                      <button
                        onClick={() => setShowAddAnnForm(!showAddAnnForm)}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-lg cursor-pointer transition-all ${
                          showAddAnnForm
                            ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
                            : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                        }`}
                      >
                        {showAddAnnForm ? "Đóng lại" : "Viết Bài Mới"}
                      </button>
                    </div>

                    {showAddAnnForm && (
                      <form onSubmit={(e) => handleCreateAnnouncement(e, "PUBLISHED")} className="space-y-3 pt-1 border-t border-slate-200 animate-fadeIn">
                        <div>
                          <label className="block text-[9px] font-extrabold text-slate-500 uppercase mb-1">Tiêu đề bài viết / thông báo *</label>
                          <input
                            type="text"
                            required
                            value={newAnnForm.title}
                            onChange={(e) => setNewAnnForm({ ...newAnnForm, title: e.target.value })}
                            placeholder="Nhập tiêu đề tin tức, thông báo chính thức..."
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[9px] font-extrabold text-slate-500 uppercase mb-1">Phân loại</label>
                            <select
                              value={newAnnForm.category}
                              onChange={(e) => setNewAnnForm({ ...newAnnForm, category: e.target.value as any })}
                              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                            >
                              <option value="Thông báo">Thông báo hành chính</option>
                              <option value="Tin tức">Tin tức / Sự kiện</option>
                              <option value="Văn bản pháp lý">Văn bản pháp lý</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[9px] font-extrabold text-slate-500 uppercase mb-1">Địa bàn áp dụng</label>
                            <select
                              value={newAnnForm.villageId}
                              onChange={(e) => setNewAnnForm({ ...newAnnForm, villageId: e.target.value })}
                              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                            >
                              <option value="ALL">Toàn xã Hải Anh (Tất cả)</option>
                              {tenantVillages.map(v => (
                                <option key={v.id} value={v.id}>{v.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[9px] font-extrabold text-slate-500 uppercase mb-1">Tác giả ký tên *</label>
                            <input
                              type="text"
                              required
                              value={newAnnForm.author}
                              onChange={(e) => setNewAnnForm({ ...newAnnForm, author: e.target.value })}
                              placeholder="Ví dụ: UBND Xã Hải Anh..."
                              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                            />
                          </div>
                          <div className="flex items-end justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => handleCreateAnnouncement(e, "DRAFT")}
                              className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-black uppercase rounded-lg transition-colors cursor-pointer"
                            >
                              Lưu nháp
                            </button>
                            <button
                              type="submit"
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase rounded-lg shadow-xs transition-all cursor-pointer"
                            >
                              Đăng Ngay
                            </button>
                          </div>
                        </div>
                      </form>
                    )}
                  </div>

                  <div className="space-y-3.5 max-h-[400px] overflow-y-auto pr-1">
                    {displayAnnouncements.map((a) => {
                      const status = a.status || "DRAFT";
                      return (
                        <div key={a.id} className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-2.5">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-[11px] font-extrabold text-slate-800 line-clamp-1 block" title={a.title}>{a.title}</span>
                              <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded mt-0.5 inline-block">{a.category}</span>
                            </div>
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                              status === "PENDING" ? "text-blue-700 bg-blue-50 border-blue-200 animate-pulse" :
                              status === "APPROVED" ? "text-indigo-700 bg-indigo-50 border-indigo-200" :
                              status === "REJECTED" ? "text-rose-700 bg-rose-50 border-rose-200" :
                              "text-amber-700 bg-amber-50 border-amber-200"
                            }`}>
                              {status === "PENDING" ? "Chờ duyệt" : status === "APPROVED" ? "Đã duyệt" : status === "REJECTED" ? "Từ chối" : "Nháp"}
                            </span>
                          </div>

                          <div className="text-[10px] text-slate-600 space-y-1 bg-white p-2.5 rounded-lg border border-slate-100">
                            <div>• Địa bàn: <strong>{a.villageId === "ALL" ? "Toàn xã Hải Anh" : tenantVillages.find(v => v.id === a.villageId)?.name || a.villageId}</strong></div>
                            <div>• Tác giả: <strong>{a.author}</strong></div>
                            {a.publishedDate && <div>• Ngày đăng: <strong>{a.publishedDate}</strong></div>}
                          </div>

                          {/* Actions container for Announcements */}
                          <div className="flex flex-wrap gap-1.5 items-center justify-end pt-1.5 border-t border-slate-200/60">
                            {/* PENDING status actions */}
                            {status === "PENDING" && (
                              <>
                                {(currentRole === UserRole.MANAGER || currentRole === UserRole.ADMIN || currentRole === UserRole.SUPER_ADMIN) && (
                                  <>
                                    <button
                                      onClick={() => {
                                        onUpdateAnnouncement({ ...a, status: "REJECTED" });
                                        onLogAudit("BÁC BẢN TIN", `Từ chối duyệt bản tin "${a.title}"`);
                                        triggerToast("Đã từ chối bản tin này.");
                                      }}
                                      className="px-2 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-[10px] font-bold rounded-lg cursor-pointer transition-all"
                                    >
                                      Từ chối
                                    </button>
                                    <button
                                      onClick={() => {
                                        onUpdateAnnouncement({ ...a, status: "APPROVED" });
                                        onLogAudit("DUYỆT BẢN TIN", `Phê duyệt nội dung bản tin "${a.title}"`);
                                        triggerToast("Đã duyệt bản tin! Chờ Admin phát hành.");
                                      }}
                                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-lg cursor-pointer transition-all flex items-center gap-0.5 shadow-sm"
                                    >
                                      <Check className="w-3 h-3" /> Duyệt
                                    </button>
                                  </>
                                )}
                                {(currentRole === UserRole.ADMIN || currentRole === UserRole.SUPER_ADMIN) && (
                                  <button
                                    onClick={() => {
                                      onUpdateAnnouncement({ ...a, status: "PUBLISHED" });
                                      onLogAudit("CÔNG BỐ BẢN TIN", `Ký phát hành bản tin "${a.title}"`);
                                      triggerToast("Bản tin đã được phát hành chính thức!");
                                    }}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg cursor-pointer transition-all flex items-center gap-0.5 shadow-sm"
                                  >
                                    <CheckCircle2 className="w-3 h-3" /> Phát hành
                                  </button>
                                )}
                              </>
                            )}

                            {/* APPROVED status actions */}
                            {status === "APPROVED" && (
                              <>
                                {currentRole === UserRole.MANAGER && (
                                  <span className="text-[10px] text-indigo-600 font-semibold italic bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                                    Đã duyệt - Chờ Chủ tịch phát hành
                                  </span>
                                )}
                                {(currentRole === UserRole.ADMIN || currentRole === UserRole.SUPER_ADMIN) && (
                                  <>
                                    <button
                                      onClick={() => {
                                        onUpdateAnnouncement({ ...a, status: "REJECTED" });
                                        onLogAudit("HỦY DUYỆT BẢN TIN", `Hủy duyệt đề xuất bản tin "${a.title}"`);
                                        triggerToast("Đã hủy duyệt và chuyển về danh sách Từ chối.");
                                      }}
                                      className="px-2 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-[10px] font-bold rounded-lg cursor-pointer transition-all"
                                    >
                                      Hủy duyệt
                                    </button>
                                    <button
                                      onClick={() => {
                                        onUpdateAnnouncement({ ...a, status: "PUBLISHED" });
                                        onLogAudit("CÔNG BỐ BẢN TIN", `Ký phát hành bản tin "${a.title}"`);
                                        triggerToast("Bản tin đã được phát hành chính thức!");
                                      }}
                                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg cursor-pointer transition-all flex items-center gap-0.5 shadow-sm"
                                    >
                                      <CheckCircle2 className="w-3 h-3" /> Phát hành
                                    </button>
                                  </>
                                )}
                              </>
                            )}

                            {/* DRAFT / REJECTED status actions */}
                            {(status === "DRAFT" || status === "REJECTED") && (
                              <>
                                <button
                                  onClick={() => {
                                    onUpdateAnnouncement({ ...a, status: "PENDING" });
                                    onLogAudit("TRÌNH DUYỆT BẢN TIN", `Trình duyệt thông báo "${a.title}"`);
                                    triggerToast("Đã gửi thông tin trình duyệt!");
                                  }}
                                  className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-[10px] font-bold rounded-lg cursor-pointer transition-all"
                                >
                                  Gửi trình duyệt
                                </button>
                                {(currentRole === UserRole.MANAGER || currentRole === UserRole.ADMIN || currentRole === UserRole.SUPER_ADMIN) && (
                                  <button
                                    onClick={() => {
                                      onUpdateAnnouncement({ ...a, status: "APPROVED" });
                                      onLogAudit("DUYỆT NHANH BẢN TIN", `Duyệt nhanh thông báo "${a.title}"`);
                                      triggerToast("Đã duyệt nhanh!");
                                    }}
                                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-lg cursor-pointer transition-all"
                                  >
                                    Duyệt nhanh
                                  </button>
                                )}
                                {(currentRole === UserRole.ADMIN || currentRole === UserRole.SUPER_ADMIN) && (
                                  <button
                                    onClick={() => {
                                      onUpdateAnnouncement({ ...a, status: "PUBLISHED" });
                                      onLogAudit("PHÁT HÀNH NHANH BẢN TIN", `Phát hành nhanh thông báo "${a.title}"`);
                                      triggerToast("Đã phát hành nhanh thành công!");
                                    }}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg cursor-pointer shadow-sm transition-all"
                                  >
                                    Phát hành nhanh
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {displayAnnouncements.length === 0 && (
                      <div className="text-center py-10 text-slate-400 text-xs italic">
                        {approvalStatusFilter === "PENDING" ? "Không có bản tin nào chờ duyệt." :
                         approvalStatusFilter === "APPROVED" ? "Không có bản tin nào đã duyệt." :
                         "Không có bản tin nháp hoặc bản tin bị từ chối."}
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </motion.div>
          );
        })()}

        {/* Dynamic TAB 5.5: REGISTRATIONS APPROVAL WORKSPACE */}
        {activeTab === "registrations" && (() => {
          const safeRegs = Array.isArray(registrations) ? registrations : [];
          const filteredRegs = safeRegs.filter(r => {
            if (!r) return false;
            const matchStatus = regStatusFilter === "ALL" || r.status === regStatusFilter;
            const fullName = r.fullName || "";
            const phone = r.phone || "";
            const email = r.email || "";
            const cccd = r.cccd || "";
            const matchSearch = !regSearchQuery ? true : (
              fullName.toLowerCase().includes(regSearchQuery.toLowerCase()) ||
              phone.includes(regSearchQuery) ||
              email.toLowerCase().includes(regSearchQuery.toLowerCase()) ||
              cccd.includes(regSearchQuery)
            );
            return matchStatus && matchSearch;
          });

          const currentReg = safeRegs.find(r => r.id === selectedRegId) || filteredRegs[0] || null;

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
              key="admin-registrations-tab"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    <UserPlus className="w-6 h-6 text-indigo-600 animate-pulse" />
                    Phê Duyệt Hồ Sơ Đăng Ký Tài Khoản Cán Bộ
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Kiểm tra thông tin thẻ căn cước (CCCD) và ảnh chân dung tự chụp của cán bộ đăng ký gia nhập hệ thống SaaS quản trị.
                  </p>
                </div>

                {/* Counters summary */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <div className="bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1">
                    <span>Chờ duyệt:</span>
                    <span className="bg-amber-500 text-white rounded px-1.5 font-mono">
                      {safeRegs.filter(r => r && r.status === "PENDING").length}
                    </span>
                  </div>
                  <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1">
                    <span>Đã duyệt:</span>
                    <span className="bg-emerald-600 text-white rounded px-1.5 font-mono">
                      {safeRegs.filter(r => r && r.status === "ACTIVE").length}
                    </span>
                  </div>
                  <div className="bg-rose-50 text-rose-800 border border-rose-200 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1">
                    <span>Bị từ chối:</span>
                    <span className="bg-rose-600 text-white rounded px-1.5 font-mono">
                      {safeRegs.filter(r => r && r.status === "REJECTED").length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Advanced search and quick filter tabs */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search query box */}
                <div className="relative md:col-span-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Tìm theo Tên, SĐT, Email, CCCD..."
                    value={regSearchQuery}
                    onChange={(e) => setRegSearchQuery(e.target.value)}
                    className="w-full bg-white border border-slate-250 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-400"
                  />
                  {regSearchQuery && (
                    <button
                      onClick={() => setRegSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                    >
                      Xóa
                    </button>
                  )}
                </div>

                {/* Filter segments */}
                <div className="md:col-span-2 flex flex-wrap gap-1 items-center justify-start md:justify-end">
                  <span className="text-[10px] font-extrabold text-slate-400 mr-2 uppercase">Lọc Trạng Thái:</span>
                  {(["ALL", "PENDING", "ACTIVE", "ADDITIONAL_REQUIRED", "REJECTED"] as const).map((status) => {
                    const count = status === "ALL" ? safeRegs.length : safeRegs.filter(r => r && r.status === status).length;
                    const label = status === "ALL" ? "Tất cả" :
                                  status === "PENDING" ? "Chờ duyệt" :
                                  status === "ACTIVE" ? "Đã duyệt" :
                                  status === "ADDITIONAL_REQUIRED" ? "Cần bổ sung" : "Bị từ chối";

                    const activeColors = status === "PENDING" ? "bg-amber-500 text-white" :
                                         status === "ACTIVE" ? "bg-emerald-600 text-white" :
                                         status === "ADDITIONAL_REQUIRED" ? "bg-yellow-500 text-slate-950" :
                                         status === "REJECTED" ? "bg-rose-600 text-white" : "bg-indigo-600 text-white";

                    const badgeStyle = status === "PENDING" ? "bg-amber-100 text-amber-800" :
                                       status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" :
                                       status === "ADDITIONAL_REQUIRED" ? "bg-yellow-100 text-yellow-800" :
                                       status === "REJECTED" ? "bg-rose-100 text-rose-800" : "bg-slate-200 text-slate-800";

                    return (
                      <button
                        key={status}
                        onClick={() => {
                          setRegStatusFilter(status);
                          setSelectedRegId(null); // Reset selection to trigger auto first element
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer border ${
                          regStatusFilter === status
                            ? `${activeColors} border-transparent shadow-xs`
                            : "bg-white hover:bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        <span>{label}</span>
                        <span className={`text-[10px] font-mono font-black px-1.5 py-0.2 rounded-full ${
                          regStatusFilter === status ? "bg-black/20 text-white" : badgeStyle
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Main Split Layout Workspace */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* LEFT LIST PANEL: 5 cols */}
                <div className="lg:col-span-4 space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                  {filteredRegs.map((reg) => {
                    const isSelected = currentReg?.id === reg.id;
                    const villageName = villages.find(v => v.id === reg.villageId)?.name || "ỦBND Xã Hải Anh";
                    
                    let statusLabel = "Chờ duyệt";
                    let statusColor = "bg-amber-100 text-amber-800 border-amber-200";
                    if (reg.status === "ACTIVE") {
                      statusLabel = "Đã duyệt";
                      statusColor = "bg-emerald-100 text-emerald-800 border-emerald-200";
                    } else if (reg.status === "ADDITIONAL_REQUIRED") {
                      statusLabel = "Yêu cầu bổ sung";
                      statusColor = "bg-yellow-100 text-yellow-800 border-yellow-200";
                    } else if (reg.status === "REJECTED") {
                      statusLabel = "Từ chối";
                      statusColor = "bg-rose-100 text-rose-800 border-rose-200";
                    }

                    return (
                      <div
                        key={reg.id}
                        onClick={() => {
                          setSelectedRegId(reg.id);
                          setShowActionForm("NONE");
                        }}
                        className={`p-4 rounded-xl border transition-all cursor-pointer text-left space-y-2.5 relative group ${
                          isSelected
                            ? "bg-slate-900 border-indigo-500 shadow-md translate-x-1"
                            : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={reg.portraitUrl}
                            alt={reg.fullName}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-extrabold text-xs truncate ${isSelected ? "text-white" : "text-slate-800"}`}>
                              {reg.fullName}
                            </h4>
                            <span className={`inline-block text-[9px] font-mono px-1.5 py-0.2 rounded border uppercase mt-1 ${statusColor}`}>
                              {statusLabel}
                            </span>
                          </div>
                        </div>

                        <div className="text-[11px] space-y-1 border-t border-dashed pt-2 border-slate-200/60">
                          <p className={`flex justify-between ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                            <span>Chức danh đề xuất:</span>
                            <strong className="font-extrabold">{reg.proposedRole === UserRole.STAFF ? "Cán bộ Thôn" : "Quản lý Cấp xã"}</strong>
                          </p>
                          <p className={`flex justify-between ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                            <span>Phạm vi đơn vị:</span>
                            <span className="truncate max-w-[150px] text-right font-semibold">{villageName}</span>
                          </p>
                          <p className="text-[9px] text-slate-400 text-right pt-1 italic font-mono">
                            Gửi lúc: {reg.createdAt}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  {filteredRegs.length === 0 && (
                    <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-2">
                      <ShieldAlert className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="text-xs font-bold text-slate-500">Không tìm thấy hồ sơ nào phù hợp.</p>
                      <p className="text-[11px] text-slate-400">Vui lòng thay đổi bộ lọc trạng thái hoặc từ khóa tìm kiếm.</p>
                    </div>
                  )}
                </div>

                {/* RIGHT DOSSIER DETAIL WORKSHEET: 8 cols */}
                <div className="lg:col-span-8">
                  {currentReg ? (
                    <div className="bg-white rounded-2xl border border-slate-250 shadow-sm p-6 space-y-6">
                      
                      {/* 1. Header profile widget */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                        <div className="flex items-center gap-4">
                          <img
                            src={currentReg.portraitUrl}
                            alt={currentReg.fullName}
                            className="w-16 h-16 rounded-full object-cover border-2 border-indigo-100 shadow-sm shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <h2 className="text-lg font-black text-slate-900 leading-tight">
                              {currentReg.fullName}
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-bold text-[10px]">
                                Đăng ký: {currentReg.proposedRole === UserRole.STAFF ? "CÁN BỘ THÔN (STAFF)" : "QUẢN LÝ CẤP XÃ (MANAGER)"}
                              </span>
                            </p>
                            
                            {/* State Badge displays */}
                            <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                              {currentReg.status === "PENDING" && (
                                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-200 px-2 py-0.5 rounded-md uppercase tracking-wide">
                                  ● Đang chờ thẩm định
                                </span>
                              )}
                              {currentReg.status === "ACTIVE" && (
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200 px-2 py-0.5 rounded-md uppercase tracking-wide flex items-center gap-1">
                                  <Check className="w-3 h-3" /> Đã hoạt động chính thức
                                </span>
                              )}
                              {currentReg.status === "ADDITIONAL_REQUIRED" && (
                                <span className="bg-yellow-100 text-yellow-800 text-[10px] font-bold border border-yellow-200 px-2 py-0.5 rounded-md uppercase tracking-wide">
                                  ⚠ Yêu cầu bổ sung thông tin
                                </span>
                              )}
                              {currentReg.status === "REJECTED" && (
                                <span className="bg-rose-100 text-rose-800 text-[10px] font-bold border border-rose-200 px-2 py-0.5 rounded-md uppercase tracking-wide flex items-center gap-1">
                                  <X className="w-3 h-3" /> Hồ sơ bị từ chối
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right text-[11px] text-slate-400 font-mono self-end sm:self-center">
                          Yêu cầu ID: <strong className="font-bold text-slate-700">{currentReg.id}</strong>
                        </div>
                      </div>

                      {/* 2. Detailed Grid Profile Dossier */}
                      <div className="space-y-4">
                        <h3 className="text-xs font-black text-indigo-900 uppercase tracking-wider flex items-center gap-1 border-l-2 border-indigo-600 pl-2">
                          Thông Tin Đối Chiếu Căn Cước Công Dân
                        </h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/60 text-xs">
                          <div className="space-y-2.5">
                            <p className="flex justify-between border-b border-slate-200/50 pb-1.5 text-slate-600">
                              <span>Số định danh cá nhân (CCCD):</span>
                              <strong className="text-slate-900 font-mono font-bold">{currentReg.cccd}</strong>
                            </p>
                            <p className="flex justify-between border-b border-slate-200/50 pb-1.5 text-slate-600">
                              <span>Ngày sinh:</span>
                              <strong className="text-slate-900 font-semibold">{currentReg.birthDate}</strong>
                            </p>
                            <p className="flex justify-between border-b border-slate-200/50 pb-1.5 text-slate-600">
                              <span>Giới tính:</span>
                              <strong className="text-slate-900">{currentReg.gender}</strong>
                            </p>
                            <p className="flex justify-between text-slate-600">
                              <span>Địa bàn phân công dự kiến:</span>
                              <strong className="text-slate-900">
                                {villages.find(v => v.id === currentReg.villageId)?.name || "Toàn xã (UBND Xã)"}
                              </strong>
                            </p>
                          </div>

                          <div className="space-y-2.5">
                            <p className="flex justify-between border-b border-slate-200/50 pb-1.5 text-slate-600">
                              <span>Số điện thoại đăng ký:</span>
                              <strong className="text-slate-900 font-semibold">{currentReg.phone}</strong>
                            </p>
                            <p className="flex justify-between border-b border-slate-200/50 pb-1.5 text-slate-600">
                              <span>Hòm thư điện tử (Email):</span>
                              <strong className="text-slate-900 font-semibold lowercase">{currentReg.email}</strong>
                            </p>
                            <p className="flex justify-between border-b border-slate-200/50 pb-1.5 text-slate-600">
                              <span>Ngày cấp CCCD:</span>
                              <strong className="text-slate-900">{currentReg.cccdIssueDate}</strong>
                            </p>
                            <p className="flex justify-between text-slate-600">
                              <span>Nơi cấp:</span>
                              <span className="text-slate-900 text-right truncate max-w-[180px] font-medium" title={currentReg.cccdIssuePlace}>
                                {currentReg.cccdIssuePlace}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* 3. Identity Evidence Pictures Checkboard */}
                      <div className="space-y-3">
                        <h3 className="text-xs font-black text-indigo-900 uppercase tracking-wider flex items-center gap-1 border-l-2 border-indigo-600 pl-2">
                          Ảnh Đối Soát Sinh Trắc Học & Pháp Lý
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-extrabold text-slate-500 block uppercase">1. Mặt Trước Thẻ CCCD:</span>
                            <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-950 aspect-[8/5] relative group shadow-inner">
                              <img
                                src={currentReg.frontCccdUrl}
                                alt="Mặt trước CCCD"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                                <span className="text-[10px] text-white font-bold">Thẻ Căn cước công dân gắn chíp</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <span className="text-[10px] font-extrabold text-slate-500 block uppercase">2. Mặt Sau Thẻ CCCD:</span>
                            <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-950 aspect-[8/5] relative group shadow-inner">
                              <img
                                src={currentReg.backCccdUrl}
                                alt="Mặt sau CCCD"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                                <span className="text-[10px] text-white font-bold">Mặt sau - Vân tay và Đặc điểm nhận dạng</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 4. Action Decision Box based on status */}
                      <div className="border-t border-slate-100 pt-5 space-y-4">
                        
                        {/* Status detail panel if NOT pending */}
                        {currentReg.status === "ACTIVE" && (
                          <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl border border-emerald-200 flex items-start gap-3 text-xs leading-relaxed">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="font-extrabold">Hồ sơ đã được phê duyệt thành công.</p>
                              <p className="mt-1 text-slate-600 font-medium">
                                Tài khoản cán bộ đã được ký duyệt chính thức vào danh mục nhân sự hoạt động. 
                                Đăng nhập đã được mở khóa bằng số điện thoại <strong>{currentReg.phone}</strong>.
                              </p>
                              {currentReg.approvedBy && (
                                <p className="mt-2 text-[10px] text-emerald-700 font-mono">
                                  Người ký duyệt: {currentReg.approvedBy}
                                </p>
                              )}
                              <div className="mt-3.5">
                                <button
                                  onClick={() => {
                                    setSearchQuery(currentReg.fullName);
                                    setVillageFilter("");
                                    setActiveTab("officials");
                                  }}
                                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer text-xs animate-bounce"
                                >
                                  <Users className="w-4 h-4" /> Xem chi tiết tại danh sách Quản Lý Cán Bộ
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {currentReg.status === "ADDITIONAL_REQUIRED" && (
                          <div className="bg-yellow-50 text-yellow-850 p-4 rounded-xl border border-yellow-250 flex items-start gap-3 text-xs leading-relaxed">
                            <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="font-extrabold">Yêu cầu bổ sung thông tin minh chứng.</p>
                              <p className="mt-1 text-slate-700 font-medium">
                                Hệ thống đang tạm hoãn phê duyệt hồ sơ này và gửi thông báo yêu cầu ứng viên cập nhật thêm.
                              </p>
                              <div className="mt-3 bg-white/70 p-3 rounded-lg border border-yellow-200 text-xs italic text-slate-800">
                                <strong>Nội dung yêu cầu bổ sung:</strong> "{currentReg.additionalInfoRequired}"
                              </div>
                            </div>
                          </div>
                        )}

                        {currentReg.status === "REJECTED" && (
                          <div className="bg-rose-50 text-rose-800 p-4 rounded-xl border border-rose-200 flex items-start gap-3 text-xs leading-relaxed">
                            <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="font-extrabold">Hồ sơ này đã bị từ chối cấp quyền.</p>
                              <p className="mt-1 text-slate-600 font-medium">
                                Lý do từ chối đã được gửi về số điện thoại và email của ứng viên.
                              </p>
                              <div className="mt-3 bg-white/70 p-3 rounded-lg border border-rose-100 text-xs text-rose-950 font-medium">
                                <strong>Lý do từ chối chính thức:</strong> {currentReg.rejectionReason}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Decision buttons */}
                        <div className="space-y-4">
                          
                          {showActionForm === "NONE" && (
                            <div className="flex flex-wrap items-center gap-2">
                              {/* Always allow approving or re-approving if needed */}
                              <button
                                onClick={() => {
                                  // Update status
                                  const updated: OfficialRegistration = {
                                    ...currentReg,
                                    status: "ACTIVE",
                                    approvedBy: loggedInOfficial?.fullName || "Chủ tịch UBND Xã"
                                  };
                                  onUpdateRegistration(updated);

                                  // Add as active official so they appear in personnel lists
                                  const off: Official = {
                                    id: "off-" + currentReg.id,
                                    wardId: activeTenant.id,
                                    villageId: currentReg.villageId,
                                    name: currentReg.fullName,
                                    birthDate: currentReg.birthDate,
                                    gender: currentReg.gender,
                                    phone: currentReg.phone,
                                    email: currentReg.email,
                                    avatar: currentReg.portraitUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
                                    position: currentReg.proposedRole === UserRole.STAFF ? "Cán bộ Thôn phụ trách" : "Chuyên viên Ủy ban xã",
                                    address: "Xã Hải Anh, Ninh Bình",
                                    status: "PUBLISHED",
                                    createdBy: loggedInOfficial?.fullName || "Chủ tịch UBND Xã"
                                  };
                                  onAddOfficial(off);

                                  // Audit
                                  onLogAudit(
                                    "DUYỆT_TÀI_KHOẢN",
                                    `Phê duyệt cấp tài khoản và kích hoạt vai trò ${currentReg.proposedRole} cho cán bộ ${currentReg.fullName}.`
                                  );

                                  triggerToast(`Phê duyệt tài khoản cho cán bộ ${currentReg.fullName} thành công!`);
                                }}
                                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                              >
                                <CheckSquare className="w-4 h-4" /> Ký Duyệt & Kích Hoạt Tài Khoản
                              </button>

                              {currentReg.status === "PENDING" && (
                                <>
                                  <button
                                    onClick={() => {
                                      setShowActionForm("ADDITIONAL");
                                      setAdditionalInfoText("");
                                    }}
                                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <Clock className="w-4 h-4" /> Yêu Cầu Bổ Sung Hồ Sơ
                                  </button>

                                  <button
                                    onClick={() => {
                                      setShowActionForm("REJECT");
                                      setRejectionText("");
                                    }}
                                    className="px-4 py-2.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 hover:border-rose-200 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <XCircle className="w-4 h-4" /> Từ Chối Đăng Ký
                                  </button>
                                </>
                              )}

                              {currentReg.status !== "PENDING" && (
                                <button
                                  onClick={() => {
                                    // Reset status to PENDING for re-examination
                                    const updated: OfficialRegistration = {
                                      ...currentReg,
                                      status: "PENDING"
                                    };
                                    onUpdateRegistration(updated);
                                    onLogAudit(
                                      "THU_HỒI_TRẠNG_THÁI",
                                      `Thu hồi trạng thái để thẩm định lại hồ sơ đăng ký của ${currentReg.fullName}.`
                                    );
                                    triggerToast(`Đã thu hồi trạng thái hồ sơ của ${currentReg.fullName} về Chờ duyệt.`);
                                  }}
                                  className="px-4 py-2.5 bg-slate-150 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                                >
                                  <RefreshCw className="w-4 h-4" /> Thu hồi trạng thái để thẩm định lại
                                </button>
                              )}
                            </div>
                          )}

                          {/* REJECTION REASON SUBMISSION FORM */}
                          {showActionForm === "REJECT" && (
                            <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl space-y-3">
                              <span className="text-[11px] font-extrabold text-rose-800 uppercase block">Nhập lý do từ chối hồ sơ:</span>
                              <textarea
                                value={rejectionText}
                                onChange={(e) => setRejectionText(e.target.value)}
                                placeholder="Nhập lý do cụ thể gửi tới cán bộ đăng ký... (ví dụ: Số CCCD không trùng khớp với ảnh chụp mặt trước/sau, thông tin địa bàn phân công không chính xác,...)"
                                rows={3}
                                className="w-full bg-white border border-rose-200 rounded-lg p-3 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-rose-500 placeholder:text-slate-400"
                              />
                              <div className="flex items-center gap-2 justify-end">
                                <button
                                  onClick={() => setShowActionForm("NONE")}
                                  className="px-3.5 py-1.5 bg-white text-slate-500 border border-slate-200 text-xs font-bold rounded-lg hover:bg-slate-50 cursor-pointer"
                                >
                                  Hủy bỏ
                                </button>
                                <button
                                  onClick={() => {
                                    if (!rejectionText.trim()) return;
                                    const updated: OfficialRegistration = {
                                      ...currentReg,
                                      status: "REJECTED",
                                      rejectionReason: rejectionText
                                    };
                                    onUpdateRegistration(updated);
                                    onLogAudit(
                                      "TỪ_CHỐI_TÀI_KHOẢN",
                                      `Từ chối cấp tài khoản cho cán bộ ${currentReg.fullName}. Lý do: ${rejectionText}`
                                    );
                                    triggerToast(`Đã từ chối cấp tài khoản cho ${currentReg.fullName}.`);
                                    setShowActionForm("NONE");
                                  }}
                                  disabled={!rejectionText.trim()}
                                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-lg disabled:opacity-50 cursor-pointer"
                                >
                                  Xác nhận Từ Chối
                                </button>
                              </div>
                            </div>
                          )}

                          {/* ADDITIONAL INFO REQ FORM */}
                          {showActionForm === "ADDITIONAL" && (
                            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-3">
                              <span className="text-[11px] font-extrabold text-amber-800 uppercase block">Nhập yêu cầu bổ sung thông tin:</span>
                              <textarea
                                value={additionalInfoText}
                                onChange={(e) => setAdditionalInfoText(e.target.value)}
                                placeholder="Nhập chi tiết yêu cầu bổ sung... (ví dụ: Ảnh chụp mặt sau CCCD bị lóa mờ góc dưới, vui lòng tải lại ảnh sắc nét rõ thông tin đặc điểm nhận dạng,...)"
                                rows={3}
                                className="w-full bg-white border border-amber-200 rounded-lg p-3 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder:text-slate-400"
                              />
                              <div className="flex items-center gap-2 justify-end">
                                <button
                                  onClick={() => setShowActionForm("NONE")}
                                  className="px-3.5 py-1.5 bg-white text-slate-500 border border-slate-200 text-xs font-bold rounded-lg hover:bg-slate-50 cursor-pointer"
                                >
                                  Hủy bỏ
                                </button>
                                <button
                                  onClick={() => {
                                    if (!additionalInfoText.trim()) return;
                                    const updated: OfficialRegistration = {
                                      ...currentReg,
                                      status: "ADDITIONAL_REQUIRED",
                                      additionalInfoRequired: additionalInfoText
                                    };
                                    onUpdateRegistration(updated);
                                    onLogAudit(
                                      "YÊU_CẦU_BỔ_SUNG_HỒ_SƠ",
                                      `Yêu cầu cán bộ ${currentReg.fullName} bổ sung tài liệu: ${additionalInfoText}`
                                    );
                                    triggerToast(`Đã gửi yêu cầu bổ sung thông tin hồ sơ cho ${currentReg.fullName}.`);
                                    setShowActionForm("NONE");
                                  }}
                                  disabled={!additionalInfoText.trim()}
                                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold rounded-lg disabled:opacity-50 cursor-pointer"
                                >
                                  Gửi Yêu Cầu Bổ Sung
                                </button>
                              </div>
                            </div>
                          )}

                        </div>
                      </div>

                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
                      <ShieldAlert className="w-10 h-10 text-slate-400 mx-auto" />
                      <p className="text-sm font-bold text-slate-500">Không tìm thấy hồ sơ được chọn.</p>
                      <p className="text-xs text-slate-400">Vui lòng bấm chọn một cán bộ trong danh mục bên trái để duyệt.</p>
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          );
        })()}

        {/* Dynamic TAB 6: AUDIT OPERATIONS LOGS */}
        {activeTab === "logs" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
            key="admin-logs-tab"
          >
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Nhật Ký Thao Tác Hệ Thống (Audit Logs)</h1>
              <p className="text-xs text-slate-500">Đảm bảo minh bạch hóa thông tin, lưu dấu vết các hành động sửa đổi dữ liệu dân cư của cán bộ.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden text-xs">
              <div className="bg-slate-50 border-b border-slate-100 px-5 py-3 flex items-center justify-between font-bold text-slate-500 uppercase text-[10px]">
                <span>Lịch sử thao tác trong phiên</span>
                <span>ADMIN CONSOLE ACTIVE</span>
              </div>

              <div className="divide-y divide-slate-100 font-mono">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-4 flex items-start justify-between gap-4 hover:bg-slate-50/50">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-slate-900 text-amber-400 text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                          {log.userRole}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold">{log.timestamp}</span>
                      </div>
                      <p className="text-slate-700 font-medium font-sans text-sm">{log.details}</p>
                    </div>

                    <span className="bg-indigo-50 text-indigo-750 text-[10px] font-extrabold px-2.5 py-1 rounded border border-indigo-150 shrink-0 uppercase tracking-wide">
                      {log.action}
                    </span>
                  </div>
                ))}
                {auditLogs.length === 0 && (
                  <p className="text-center py-8 text-slate-400">Chưa có hoạt động hệ thống nào trong phiên sáp nhập này.</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

      </div>

    </div>
  );
}
