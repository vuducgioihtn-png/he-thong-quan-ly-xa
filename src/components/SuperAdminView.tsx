/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { UserRole, WardTenant, Village, Official, OfficialRegistration } from "../types";
import { 
  Shield, Landmark, MapPin, Plus, Edit3, Check, X, 
  Phone, Mail, Database, Globe, Network, Building2, HelpCircle,
  LogOut, Download
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SuperAdminViewProps {
  tenants: WardTenant[];
  activeTenantId: string;
  onSelectTenant: (tenantId: string) => void;
  onUpdateTenant: (tenant: WardTenant) => void;
  onAddTenant: (tenant: WardTenant) => void;
  villages: Village[];
  officials: Official[];
  loggedInOfficial?: OfficialRegistration;
  onLogout?: () => void;
  onExportDatabase?: () => void;
  onShowPermissions?: () => void;
}

export default function SuperAdminView({
  tenants,
  activeTenantId,
  onSelectTenant,
  onUpdateTenant,
  onAddTenant,
  villages,
  officials,
  loggedInOfficial,
  onLogout,
  onExportDatabase,
  onShowPermissions
}: SuperAdminViewProps) {
  // Editing state
  const [editingTenant, setEditingTenant] = useState<WardTenant | null>(null);
  const [showAddTenant, setShowAddTenant] = useState(false);
  
  // Create New Tenant state
  const [newTenant, setNewTenant] = useState({
    name: "",
    district: "",
    province: "",
    address: "",
    logo: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=150&auto=format&fit=crop&q=60",
    banner: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&auto=format&fit=crop&q=80",
    introduction: "",
    phone: "",
    email: ""
  });

  // Success message toaster
  const [toastMsg, setToastMsg] = useState("");

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  // Cross-Commune global stats aggregation
  const globalStats = useMemo(() => {
    const totalTenants = tenants.length;
    const totalVillages = villages.length;
    const totalPopulation = villages.reduce((sum, v) => sum + v.population, 0);
    const totalHouseholds = villages.reduce((sum, v) => sum + v.householdCount, 0);
    const totalOfficials = officials.length;

    return {
      totalTenants,
      totalVillages,
      totalPopulation,
      totalHouseholds,
      totalOfficials
    };
  }, [tenants, villages, officials]);

  // Submit New Tenant
  const handleCreateTenantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenant.name || !newTenant.province) return;

    const tId = `tenant-${Date.now()}`;
    const t: WardTenant = {
      id: tId,
      name: newTenant.name,
      district: newTenant.district || "Huyện Mới",
      province: newTenant.province,
      address: newTenant.address || `${newTenant.name}, ${newTenant.district}, ${newTenant.province}`,
      logo: newTenant.logo,
      banner: newTenant.banner,
      introduction: newTenant.introduction || `Cơ sở dữ liệu sáp nhập thôn hành chính của ${newTenant.name}.`,
      phone: newTenant.phone || "0220.xxx.xxx",
      email: newTenant.email || `ubnd.${tId}@gov.vn`
    };

    onAddTenant(t);
    setShowAddTenant(false);
    setNewTenant({
      name: "",
      district: "",
      province: "",
      address: "",
      logo: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=150&auto=format&fit=crop&q=60",
      banner: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&auto=format&fit=crop&q=80",
      introduction: "",
      phone: "",
      email: ""
    });
    triggerToast(`Đã khởi tạo và cấp phép máy chủ SaaS thành công cho địa phương ${t.name}!`);
  };

  // Submit Update Tenant
  const handleUpdateTenantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTenant) return;

    onUpdateTenant(editingTenant);
    setEditingTenant(null);
    triggerToast(`Đã lưu thay đổi cấu hình địa phương thành công!`);
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-100 pb-20 transition-colors duration-150" id="super-admin-portal">
      
      {/* Toast alert indicator */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-indigo-900 border border-indigo-500 text-indigo-100 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce text-xs font-bold">
          <Check className="w-5 h-5 text-indigo-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Welcome Control board */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white py-8 px-6 shadow-md border-b border-indigo-950/40">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
          
          {/* PROFILE CARD - TOP LEFT */}
          <div className="lg:col-span-1 bg-slate-950/60 rounded-xl border border-indigo-500/20 p-5 space-y-3.5 shadow-inner">
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
              <div 
                onClick={onShowPermissions}
                className="cursor-pointer hover:bg-slate-900/40 p-2 -m-2 rounded-lg transition-all group flex-1"
                title="Click để xem chi tiết ma trận phân quyền"
              >
                <span className="text-[10px] text-slate-400 font-extrabold tracking-wider uppercase block group-hover:text-indigo-400 transition-colors">CHÀO QUẢN TRỊ VIÊN (CLICK XEM QUYỀN):</span>
                <span className="font-extrabold text-sm text-white mt-1 block group-hover:text-indigo-300 transition-colors">
                  {loggedInOfficial ? loggedInOfficial.fullName : "Super Admin"}
                </span>
                <span className="mt-2 inline-block bg-purple-500/20 text-purple-300 text-[10px] font-mono font-extrabold px-2 py-0.5 rounded border border-purple-500/30 uppercase group-hover:bg-purple-500/30 transition-all">
                  SUPER ADMIN 🔑
                </span>
              </div>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-2 bg-rose-950/35 hover:bg-rose-900/50 text-rose-400 hover:text-rose-300 border border-rose-900/40 rounded-lg transition-colors cursor-pointer shadow-sm shrink-0"
                  title="Đăng xuất tài khoản quản trị"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {onExportDatabase && (
              <div className="flex items-center justify-between text-[10px] pt-1">
                <span className="text-slate-400 font-medium">Toàn hệ thống:</span>
                <button
                  onClick={onExportDatabase}
                  className="flex items-center gap-1 px-2.5 py-1 bg-emerald-950/50 hover:bg-emerald-900/50 text-emerald-400 hover:text-emerald-300 border border-emerald-900/50 rounded-lg text-[10px] font-extrabold transition-colors cursor-pointer"
                >
                  <Download className="w-3 h-3" /> EXPORT BACKUP
                </button>
              </div>
            )}
          </div>

          {/* MAIN WELCOME MESSAGE & CTA */}
          <div className="lg:col-span-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-bold border border-indigo-500/30 mb-3">
                <Shield className="w-4 h-4 text-indigo-400" />
                <span>Super Admin Dashboard (Quản trị Hệ thống Multi-Tenant)</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Trung Tâm Quản Trị Liên Xã
              </h1>
              <p className="text-slate-300 text-xs md:text-sm mt-1.5 leading-relaxed max-w-2xl font-sans font-medium font-sans">
                Cổng giám sát cao cấp điều phối tài nguyên và dữ liệu hành chính cho chính quyền Xã Hải Anh, Tỉnh Ninh Bình.
              </p>
            </div>

            <button
              onClick={() => { setEditingTenant(null); setShowAddTenant(!showAddTenant); }}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg flex items-center gap-1.5 border border-indigo-500 cursor-pointer shrink-0"
              id="register-tenant-btn"
            >
              <Plus className="w-4 h-4" /> Thiết lập Địa bàn mới
            </button>
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 space-y-8">
        
        {/* Global Cloud Resource Analytics widgets */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center gap-3.5 shadow-sm">
            <Landmark className="w-8 h-8 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wide">Tổng xã sáp nhập</span>
              <span className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">{globalStats.totalTenants} Xã</span>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center gap-3.5 shadow-sm">
            <Database className="w-8 h-8 text-indigo-500 dark:text-indigo-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wide">Tổng thôn liên thôn</span>
              <span className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">{globalStats.totalVillages} Thôn</span>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center gap-3.5 shadow-sm">
            <Globe className="w-8 h-8 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wide">Hộ dân được quản lý</span>
              <span className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">{globalStats.totalHouseholds.toLocaleString()} hộ</span>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center gap-3.5 shadow-sm">
            <Network className="w-8 h-8 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wide">Tổng nhân khẩu sáp nhập</span>
              <span className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">{globalStats.totalPopulation.toLocaleString()} khẩu</span>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center gap-3.5 shadow-sm">
            <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wide">Cán bộ được cấp quyền</span>
              <span className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">{globalStats.totalOfficials} đ/chí</span>
            </div>
          </div>
        </div>

        {/* Create Tenant Form drawer inline */}
        {showAddTenant && (
          <form onSubmit={handleCreateTenantSubmit} className="bg-white dark:bg-slate-900 border border-indigo-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-md text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5 mb-2">
              <h3 className="font-extrabold text-sm text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">Khởi tạo & Phân phối máy chủ SaaS Địa phương mới</h3>
              <button type="button" onClick={() => setShowAddTenant(false)} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Tên Xã / Phường mới *</label>
                <input
                  type="text" required
                  value={newTenant.name}
                  onChange={(e) => setNewTenant({...newTenant, name: e.target.value})}
                  placeholder="Ví dụ: Xã Liêm Cần"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                  id="new-tenant-name"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Huyện trực thuộc *</label>
                <input
                  type="text" required
                  value={newTenant.district}
                  onChange={(e) => setNewTenant({...newTenant, district: e.target.value})}
                  placeholder="Ví dụ: Huyện Yên Khánh"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  id="new-tenant-district"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Tỉnh trực thuộc *</label>
                <input
                  type="text" required
                  value={newTenant.province}
                  onChange={(e) => setNewTenant({...newTenant, province: e.target.value})}
                  placeholder="Ví dụ: Tỉnh Ninh Bình"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Số điện thoại đường dây nóng trực xã</label>
                <input
                  type="tel"
                  value={newTenant.phone}
                  onChange={(e) => setNewTenant({...newTenant, phone: e.target.value})}
                  placeholder="Ví dụ: 0229.3864.123"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Hộp thư điện tử Công vụ xã</label>
                <input
                  type="email"
                  value={newTenant.email}
                  onChange={(e) => setNewTenant({...newTenant, email: e.target.value})}
                  placeholder="Ví dụ: khanhthien.yenkhanh@ninhbinh.gov.vn"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Mô tả giới thiệu địa phương</label>
              <textarea
                rows={2}
                value={newTenant.introduction}
                onChange={(e) => setNewTenant({...newTenant, introduction: e.target.value})}
                placeholder="Bài viết tóm tắt..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
              ></textarea>
            </div>

            <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg uppercase tracking-wider cursor-pointer">
              Khởi tạo cấu trúc & Cấp phép Tenant địa phương
            </button>
          </form>
        )}

        {/* Grid of registered Ward Tenants (SaaS multi-tenancy visualization) */}
        <div>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-5 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Cơ sở dữ liệu hành chính Địa phương trực thuộc hệ thống
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tenants.map((tenant) => {
              const isActive = tenant.id === activeTenantId;
              // Filter counts for indicators
              const villageCount = villages.filter(v => v.wardId === tenant.id).length;
              return (
                <div 
                  key={tenant.id}
                  className={`bg-white dark:bg-slate-900 rounded-2xl border p-6 flex flex-col justify-between h-full transition-all ${
                    isActive 
                      ? 'border-indigo-500 shadow-md shadow-indigo-500/10' 
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
                  }`}
                >
                  <div>
                    {/* Header profile info */}
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 p-2.5 rounded-xl font-bold font-mono text-sm border border-slate-200 dark:border-slate-700">
                          {tenant.province.substring(5, 7).toUpperCase() || "ADM"}
                        </div>
                        <div>
                          <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">{tenant.name}</h3>
                          <p className="text-slate-500 text-[11px] font-semibold flex items-center gap-0.5 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" /> {tenant.district ? `${tenant.district}, ` : ""}{tenant.province}
                          </p>
                        </div>
                      </div>

                      {isActive ? (
                        <span className="bg-indigo-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-inner">
                          ACTIVE DATABASE
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">STANDBY</span>
                      )}
                    </div>

                    <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed line-clamp-3 mb-5 font-medium">
                      {tenant.introduction}
                    </p>

                    {/* Metadata indicators */}
                    <div className="grid grid-cols-2 gap-3.5 text-xs font-mono mb-5">
                      <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800/60 shadow-inner">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-0.5">Sáp nhập</span>
                        <span className="font-extrabold text-slate-900 dark:text-white">{villageCount} Đơn vị thôn</span>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800/60 shadow-inner">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-0.5">Đường dây nóng</span>
                        <span className="font-extrabold text-slate-900 dark:text-white text-[11px] truncate block">{tenant.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 dark:border-slate-800 pt-4 flex gap-2">
                    <button
                      onClick={() => {
                        onSelectTenant(tenant.id);
                        triggerToast(`Đã liên thông cơ sở dữ liệu làm việc trực tiếp với ${tenant.name}`);
                      }}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                        isActive 
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-500' 
                          : 'bg-slate-150 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}
                      id={`select-tenant-${tenant.id}`}
                    >
                      <Check className="w-4 h-4" />
                      {isActive ? "Đang liên thông dữ liệu" : "Kích hoạt dữ liệu liên thông"}
                    </button>
                    
                    <button
                      onClick={() => setEditingTenant(tenant)}
                      className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg border border-slate-250 dark:border-slate-700 transition-all cursor-pointer"
                      title="Chỉnh sửa cấu hình"
                      id={`edit-tenant-${tenant.id}`}
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Editing Tenant Overlay modal */}
        <AnimatePresence>
          {editingTenant && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-slate-300">
              <motion.form 
                onSubmit={handleUpdateTenantSubmit}
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 text-xs shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5 mb-2">
                  <h3 className="font-extrabold text-sm text-indigo-600 dark:text-indigo-400">Cấu hình tham số Địa phương: {editingTenant.name}</h3>
                  <button type="button" onClick={() => setEditingTenant(null)} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Tên Xã / Phường</label>
                    <input
                      type="text" required
                      value={editingTenant.name}
                      onChange={(e) => setEditingTenant({...editingTenant, name: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-2 font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Đường dây nóng</label>
                    <input
                      type="text" required
                      value={editingTenant.phone}
                      onChange={(e) => setEditingTenant({...editingTenant, phone: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-2 font-mono text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Địa chỉ cụ thể Ủy ban</label>
                  <input
                    type="text" required
                    value={editingTenant.address}
                    onChange={(e) => setEditingTenant({...editingTenant, address: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-2 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Bài viết giới thiệu tóm tắt</label>
                  <textarea
                    rows={4}
                    value={editingTenant.introduction}
                    onChange={(e) => setEditingTenant({...editingTenant, introduction: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-2 text-slate-900 dark:text-white leading-relaxed"
                  ></textarea>
                </div>

                <div className="flex gap-2 pt-2">
                  <button type="submit" className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg uppercase tracking-wide cursor-pointer">
                    Xác nhận lưu thay đổi
                  </button>
                  <button type="button" onClick={() => setEditingTenant(null)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-semibold rounded-lg cursor-pointer">
                    Đóng
                  </button>
                </div>
              </motion.form>
            </div>
          )}
        </AnimatePresence>

      </div>

    </div>
  );
}
