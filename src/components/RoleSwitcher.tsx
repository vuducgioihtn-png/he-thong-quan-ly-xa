/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { UserRole, WardTenant, Village, OfficialRegistration } from "../types";
import { 
  Shield, Users, User, Landmark, Building2, HelpCircle, 
  UserCheck, ShieldCheck, FileEdit, Eye, EyeOff, CheckSquare, XCircle, MapPin, Sparkles, UserX, ToggleLeft, ToggleRight,
  Lock, LogIn, UserPlus, ChevronDown, Calendar, LogOut, X, FileText, Check
} from "lucide-react";

interface RoleSwitcherProps {
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  activeTenant: WardTenant;
  activeVillageId: string;
  onChangeActiveVillageId: (villageId: string) => void;
  villages: Village[];
  isCustomerLoggedIn: boolean;
  onToggleCustomerLogin: () => void;
  loggedInOfficial: OfficialRegistration | null;
  loggedInCitizen?: any;
  onLoginCitizen?: (citizen: any) => void;
  onLogoutCitizen?: () => void;
  showAuthModal?: boolean;
  setShowAuthModal?: (show: boolean) => void;
  authTab?: "login" | "register";
  setAuthTab?: (tab: "login" | "register") => void;
}

export interface Persona {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
  title: string;
  scope: string;
  capabilities: string[];
  restrictions: string[];
  badgeColor: string;
  bgGlow: string;
}

export const SIMULATED_PERSONAS: Record<UserRole, Persona> = {
  [UserRole.SUPER_ADMIN]: {
    id: "p-super",
    name: "Quản trị viên DGMarketing",
    role: UserRole.SUPER_ADMIN,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    title: "Chuyên viên Hệ thống (Bộ Nội vụ / Sở)",
    scope: "Toàn quốc & Toàn bộ Đơn vị Đăng ký SaaS",
    capabilities: [
      "Quản lý toàn bộ SaaS Tenants (Thêm/Sửa/Khóa/Mở/Xóa xã)",
      "Cấu hình hệ thống (Logo, Banner, SMTP, SMS, Maps API, Storage, Backup)",
      "Quản lý Menu tổng (Bật tắt Dashboard, Cán bộ, Bản đồ, Phản ánh...)",
      "Quản lý Role & Permission cấp cao (Tạo Role mới, gán quyền)",
      "Audit Log toàn bộ hệ thống & Thống kê lượt truy cập toàn quốc"
    ],
    restrictions: [
      "Không can thiệp sâu vào hoạt động nội bộ hàng ngày của từng xã trừ khi được yêu cầu hỗ trợ kỹ thuật"
    ],
    badgeColor: "bg-purple-600 text-white border-purple-500",
    bgGlow: "shadow-purple-500/10 border-purple-200 dark:border-purple-900/50"
  },
  [UserRole.ADMIN]: {
    id: "p-admin",
    name: "Nguyễn Văn Hoạt",
    role: UserRole.ADMIN,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    title: "Chủ tịch UBND / Admin CNTT Xã Hải Anh",
    scope: "Nội bộ Xã Hải Anh (Đầy đủ quyền quản trị)",
    capabilities: [
      "Thêm/Sửa/Xóa/Khóa/Ẩn Thôn, Bản đồ và Marker xã",
      "Quản lý Cán bộ xã/thôn (Thêm, Sửa, Xóa, Điều chuyển, Khóa)",
      "Quản lý Cơ quan, Ban ngành (UBND, Đảng ủy, MTTQ, Trạm y tế...)",
      "Quản lý Tài khoản (Tạo/Sửa/Khóa/Reset mật khẩu Manager & Staff)",
      "Đăng Tin tức/Thông báo xã, duyệt Phản ánh hiện trường, sao lưu"
    ],
    restrictions: [
      "Không thể chỉnh sửa Menu cấu hình SaaS toàn quốc của Super Admin",
      "Không thể xóa/thêm Đơn vị Xã khác trên hệ thống SaaS"
    ],
    badgeColor: "bg-blue-600 text-white border-blue-500",
    bgGlow: "shadow-blue-500/10 border-blue-200 dark:border-blue-900/50"
  },
  [UserRole.MANAGER]: {
    id: "p-manager",
    name: "Trần Minh Đức",
    role: UserRole.MANAGER,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    title: "Phó Chủ tịch UBND Xã",
    scope: "Kiểm tra, Duyệt dữ liệu & Giám sát nội bộ xã",
    capabilities: [
      "Phê duyệt/Trả lại dữ liệu do Staff nhập (Quy trình: Staff -> Manager Duyệt -> Public)",
      "Sửa dữ liệu Thôn, Cán bộ, Bản đồ để hoàn thiện chuẩn xác",
      "Xem Dashboard nâng cao, Xuất báo cáo Excel/PDF",
      "Đăng tin tức, duyệt phản ánh của người dân trực tiếp"
    ],
    restrictions: [
      "❌ Không được xóa tài khoản người dùng, Thôn hoặc Cán bộ",
      "❌ Không được thay đổi Permission, Menu hay cấu hình hệ thống"
    ],
    badgeColor: "bg-indigo-600 text-white border-indigo-500",
    bgGlow: "shadow-indigo-500/10 border-indigo-200 dark:border-indigo-900/50"
  },
  [UserRole.STAFF]: {
    id: "p-staff",
    name: "Phạm Văn Nam",
    role: UserRole.STAFF,
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    title: "Công chức Văn hóa / Trưởng Thôn 1",
    scope: "Chỉ được phép nhập liệu Thôn được phân công",
    capabilities: [
      "Thêm/Sửa dữ liệu Thôn và Cán bộ dưới dạng ĐƠN NHÁP (Draft)",
      "Gửi yêu cầu phê duyệt lên Manager (Draft -> Pending -> Approved)",
      "Cập nhật tọa độ GPS, bản đồ điểm chỉ định của Thôn mình",
      "Đăng tin tức/thông báo nháp của Thôn"
    ],
    restrictions: [
      "❌ Không có quyền XÓA thôn/cán bộ khỏi hệ thống chính thức",
      "❌ Không được phép can thiệp hay chỉnh sửa Thôn khác (ví dụ: Thôn 2)",
      "❌ Không có quyền phân quyền, khóa người dùng hoặc xuất báo cáo hệ thống"
    ],
    badgeColor: "bg-amber-600 text-white border-amber-500",
    bgGlow: "shadow-amber-500/10 border-amber-200 dark:border-amber-900/50"
  },
  [UserRole.CUSTOMER]: {
    id: "p-customer",
    name: "Vũ Đức Giới",
    role: UserRole.CUSTOMER,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    title: "Công dân xã Hải Anh",
    scope: "Tra cứu công cộng & Gửi ý kiến phản ánh hiện trường",
    capabilities: [
      "Tra cứu thông tin chi tiết Thôn, Cán bộ, Bản đồ hành chính",
      "Tải mã QR Code thông tin Thôn, thực hiện gọi điện/email cán bộ",
      "Gửi ý kiến phản ánh hiện trường (có ảnh chụp, định vị)",
      "Đánh giá & chấm điểm mức độ hài lòng với cán bộ (Chỉ khi Đăng nhập)",
      "Lưu thôn yêu thích, lưu danh bạ cán bộ tiện liên lạc (Chỉ khi Đăng nhập)"
    ],
    restrictions: [
      "❌ Tuyệt đối không được sửa đổi, thêm hoặc xóa bất kỳ dữ liệu gốc nào",
      "❌ Không thể truy cập Dashboard quản trị nội bộ hoặc xem Audit Logs"
    ],
    badgeColor: "bg-emerald-600 text-white border-emerald-500",
    bgGlow: "shadow-emerald-500/10 border-emerald-200 dark:border-emerald-900/50"
  }
};

export default function RoleSwitcher({
  currentRole,
  onChangeRole,
  activeTenant,
  activeVillageId,
  onChangeActiveVillageId,
  villages,
  isCustomerLoggedIn,
  onToggleCustomerLogin,
  loggedInOfficial,
  loggedInCitizen,
  onLoginCitizen,
  onLogoutCitizen,
  showAuthModal: propsShowAuthModal,
  setShowAuthModal: propsSetShowAuthModal,
  authTab: propsAuthTab,
  setAuthTab: propsSetAuthTab
}: RoleSwitcherProps) {
  const filteredVillages = villages.filter(v => v.wardId === activeTenant.id);
  const activePersona = SIMULATED_PERSONAS[currentRole] || SIMULATED_PERSONAS[UserRole.CUSTOMER];

  // Citizen Authentication Dialog States (with fallback to local state)
  const [localShowAuthModal, setLocalShowAuthModal] = React.useState(false);
  const [localAuthTab, setLocalAuthTab] = React.useState<"login" | "register">("login");

  const showAuthModal = propsShowAuthModal !== undefined ? propsShowAuthModal : localShowAuthModal;
  const setShowAuthModal = propsSetShowAuthModal !== undefined ? propsSetShowAuthModal : setLocalShowAuthModal;
  const authTab = propsAuthTab !== undefined ? propsAuthTab : localAuthTab;
  const setAuthTab = propsSetAuthTab !== undefined ? propsSetAuthTab : setLocalAuthTab;
  const [phoneInput, setPhoneInput] = React.useState("");
  const [cccdInput, setCccdInput] = React.useState("");
  const [passwordInput, setPasswordInput] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loginError, setLoginError] = React.useState("");

  // Registration States
  const [regFullName, setRegFullName] = React.useState("");
  const [regPhone, setRegPhone] = React.useState("");
  const [regCccd, setRegCccd] = React.useState("");
  const [regBirthDate, setRegBirthDate] = React.useState("");
  const [regGender, setRegGender] = React.useState<"Nam" | "Nữ">("Nam");
  const [regVillageId, setRegVillageId] = React.useState("");
  const [regAddress, setRegAddress] = React.useState("");
  const [regPassword, setRegPassword] = React.useState("");
  const [regConfirmPassword, setRegConfirmPassword] = React.useState("");
  const [showRegPassword, setShowRegPassword] = React.useState(false);
  const [regError, setRegError] = React.useState("");

  // Seed default registered citizens
  const getRegisteredCitizens = () => {
    const saved = localStorage.getItem("vims_registered_citizens");
    if (saved) return JSON.parse(saved);
    const seeded = [
      {
        fullName: "Vũ Đức Giới",
        phone: "0912.345.678",
        cccd: "037096001234",
        birthDate: "1990-08-15",
        gender: "Nam",
        villageId: "v-kt-1",
        address: "Thôn Hải Anh, Xã Hải Anh",
        password: "Matkhau123@"
      },
      {
        fullName: "Nguyễn Công Dân",
        phone: "0988.888.888",
        cccd: "037096005678",
        birthDate: "1995-10-20",
        gender: "Nam",
        villageId: "v-kt-2",
        address: "Thôn Hải Thịnh, Xã Hải Anh",
        password: "Matkhau123@"
      }
    ];
    localStorage.setItem("vims_registered_citizens", JSON.stringify(seeded));
    return seeded;
  };

  const handleCitizenLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!phoneInput || !passwordInput) {
      setLoginError("Vui lòng nhập đầy đủ Số điện thoại và Mật khẩu!");
      return;
    }

    const citizens = getRegisteredCitizens();
    
    // Normalize phone input to compare
    const normalizedInputPhone = phoneInput.replace(/[\.\s]/g, "");
    
    const found = citizens.find((c: any) => {
      const normalizedCPhone = c.phone.replace(/[\.\s]/g, "");
      return normalizedCPhone === normalizedInputPhone || c.phone === phoneInput;
    });

    if (found) {
      const expectedPassword = found.password || "Matkhau123@";
      if (passwordInput !== expectedPassword) {
        setLoginError("Mật khẩu định danh không chính xác! Vui lòng thử lại.");
        return;
      }
      if (onLoginCitizen) {
        onLoginCitizen(found);
      }
      setShowAuthModal(false);
      setPhoneInput("");
      setPasswordInput("");
    } else {
      setLoginError("Không tìm thấy thông tin công dân với SĐT này. Vui lòng chuyển sang tab Đăng ký để tạo tài khoản!");
    }
  };

  const handleCitizenRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");

    if (!regFullName || !regPhone || !regCccd || !regVillageId || !regPassword) {
      setRegError("Vui lòng nhập đầy đủ các trường thông tin bắt buộc (*)");
      return;
    }

    if (regCccd.length < 9) {
      setRegError("Số CCCD không hợp lệ (phải từ 9 đến 12 số)");
      return;
    }

    // Password validation criteria
    const hasLength = regPassword.length >= 8;
    const hasUpper = /[A-Z]/.test(regPassword);
    const hasLower = /[a-z]/.test(regPassword);
    const hasDigit = /[0-9]/.test(regPassword);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(regPassword);

    if (!hasLength || !hasUpper || !hasLower || !hasDigit || !hasSpecial) {
      setRegError("Mật khẩu của bạn chưa đạt Tiêu chuẩn mật khẩu an toàn! Vui lòng tuân thủ các gợi ý bên dưới.");
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError("Mật khẩu xác nhận không khớp!");
      return;
    }

    const citizens = getRegisteredCitizens();
    const duplicate = citizens.find((c: any) => c.phone === regPhone || c.cccd === regCccd);
    if (duplicate) {
      setRegError("Số điện thoại hoặc CCCD này đã được đăng ký trên hệ thống!");
      return;
    }

    const newCitizen = {
      fullName: regFullName,
      phone: regPhone,
      cccd: regCccd,
      birthDate: regBirthDate || "1995-01-01",
      gender: regGender,
      villageId: regVillageId,
      address: regAddress || `Xã ${activeTenant.name}`,
      password: regPassword
    };

    const updated = [newCitizen, ...citizens];
    localStorage.setItem("vims_registered_citizens", JSON.stringify(updated));

    if (onLoginCitizen) {
      onLoginCitizen(newCitizen);
    }

    // Reset fields
    setRegFullName("");
    setRegPhone("");
    setRegCccd("");
    setRegBirthDate("");
    setRegAddress("");
    setRegPassword("");
    setRegConfirmPassword("");
    setShowAuthModal(false);
  };

  // Determine available roles for the switcher based on loggedInOfficial
  const getAvailableRoles = () => {
    if (!loggedInOfficial) {
      return [UserRole.CUSTOMER];
    }
    const officialRole = loggedInOfficial.proposedRole;
    if (officialRole === UserRole.SUPER_ADMIN) {
      return [UserRole.CUSTOMER, UserRole.STAFF, UserRole.MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN];
    }
    if (officialRole === UserRole.ADMIN) {
      return [UserRole.CUSTOMER, UserRole.STAFF, UserRole.MANAGER, UserRole.ADMIN];
    }
    if (officialRole === UserRole.MANAGER) {
      return [UserRole.CUSTOMER, UserRole.STAFF, UserRole.MANAGER];
    }
    if (officialRole === UserRole.STAFF) {
      return [UserRole.CUSTOMER, UserRole.STAFF];
    }
    return [UserRole.CUSTOMER];
  };

  const availableRoles = getAvailableRoles();

  const renderCitizenAuthModal = () => {
    const isLengthValid = regPassword.length >= 8;
    const isUpperValid = /[A-Z]/.test(regPassword);
    const isLowerValid = /[a-z]/.test(regPassword);
    const isNumberValid = /[0-9]/.test(regPassword);
    const isSpecialValid = /[!@#$%^&*(),.?":{}|<>]/.test(regPassword);
    const isConfirmMatch = regPassword && regPassword === regConfirmPassword;

    return (
      <AnimatePresence>
        {showAuthModal && (
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
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 max-w-md w-full overflow-hidden text-xs text-slate-800 dark:text-slate-200"
            >
              {/* Header */}
              <div className="bg-indigo-600 p-4 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-indigo-200" />
                  <div>
                    <h3 className="font-extrabold text-sm uppercase tracking-wider text-white">Hệ thống Định danh Công dân</h3>
                    <p className="text-[10px] text-indigo-200">{activeTenant.name}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAuthModal(false)}
                  className="p-1 bg-indigo-700/50 hover:bg-indigo-700 rounded-full text-indigo-100 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold">
                <button
                  onClick={() => { setAuthTab("login"); setLoginError(""); }}
                  className={`flex-1 py-3 text-center transition-all ${
                    authTab === "login"
                      ? "border-b-2 border-indigo-600 text-indigo-600 bg-white dark:bg-slate-900"
                      : "text-slate-400 dark:text-slate-500 hover:text-slate-600"
                  }`}
                >
                  ĐĂNG NHẬP
                </button>
                <button
                  onClick={() => { setAuthTab("register"); setRegError(""); }}
                  className={`flex-1 py-3 text-center transition-all ${
                    authTab === "register"
                      ? "border-b-2 border-indigo-600 text-indigo-600 bg-white dark:bg-slate-900"
                      : "text-slate-400 dark:text-slate-500 hover:text-slate-600"
                  }`}
                >
                  ĐĂNG KÝ CÔNG DÂN MỚI
                </button>
              </div>

              {/* Form Content */}
              <div className="p-6">
                {authTab === "login" ? (
                  <form onSubmit={handleCitizenLoginSubmit} className="space-y-4">
                    {loginError && (
                      <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-lg font-bold">
                        ⚠️ {loginError}
                      </div>
                    )}

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">Số điện thoại *</label>
                        <input
                          type="tel"
                          required
                          value={phoneInput}
                          onChange={(e) => setPhoneInput(e.target.value)}
                          placeholder="Ví dụ: 0912.345.678"
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white font-semibold outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">Mật khẩu *</label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            placeholder="Nhập mật khẩu định danh..."
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg pl-3 pr-10 py-2 text-xs text-slate-900 dark:text-white font-semibold outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none flex items-center justify-center cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-extrabold uppercase tracking-wide transition-all shadow-md shadow-indigo-600/10 cursor-pointer mt-4"
                    >
                      Xác Nhận Đăng Nhập
                    </button>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 mb-2 font-bold uppercase">Tài khoản công dân mẫu để test nhanh:</div>
                      <div className="grid grid-cols-1 gap-1.5 text-[11px]">
                        <button
                          type="button"
                          onClick={() => { setPhoneInput("0912.345.678"); setPasswordInput("Matkhau123@"); }}
                          className="text-left px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800/80 rounded-lg text-slate-600 dark:text-slate-300 font-bold cursor-pointer transition-colors flex items-center justify-between"
                        >
                          <span>👤 Vũ Đức Giới (SĐT: 0912.345.678)</span>
                          <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500">MK: Matkhau123@</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => { setPhoneInput("0988.888.888"); setPasswordInput("Matkhau123@"); }}
                          className="text-left px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800/80 rounded-lg text-slate-600 dark:text-slate-300 font-bold cursor-pointer transition-colors flex items-center justify-between"
                        >
                          <span>👤 Nguyễn Công Dân (SĐT: 0988.888.888)</span>
                          <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500">MK: Matkhau123@</span>
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleCitizenRegisterSubmit} className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                    {regError && (
                      <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-lg font-bold">
                        ⚠️ {regError}
                      </div>
                    )}

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">Họ và Tên *</label>
                      <input
                        type="text"
                        required
                        value={regFullName}
                        onChange={(e) => setRegFullName(e.target.value)}
                        placeholder="Ví dụ: Nguyễn Văn Hải"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white font-semibold outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">Số điện thoại *</label>
                        <input
                          type="tel"
                          required
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="0912.345.678"
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white font-semibold outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">Số CCCD *</label>
                        <input
                          type="text"
                          required
                          value={regCccd}
                          onChange={(e) => setRegCccd(e.target.value)}
                          placeholder="12 chữ số CCCD..."
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white font-semibold outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">Ngày sinh</label>
                        <input
                          type="date"
                          value={regBirthDate}
                          onChange={(e) => setRegBirthDate(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white font-semibold outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">Giới tính</label>
                        <select
                          value={regGender}
                          onChange={(e) => setRegGender(e.target.value as "Nam" | "Nữ")}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white font-semibold outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="Nam">Nam</option>
                          <option value="Nữ">Nữ</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">Địa bàn cư trú / Thôn Xóm *</label>
                      <select
                        required
                        value={regVillageId}
                        onChange={(e) => setRegVillageId(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white font-semibold outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="">-- Chọn Thôn / Xóm cư trú --</option>
                        {filteredVillages.map(v => (
                          <option key={v.id} value={v.id}>{v.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">Địa chỉ cụ thể (Số nhà, ngõ xóm)</label>
                      <input
                        type="text"
                        value={regAddress}
                        onChange={(e) => setRegAddress(e.target.value)}
                        placeholder="Số nhà 45, xóm Trung,..."
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white font-semibold outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    {/* New Secure Password Fields */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">Mật khẩu mới *</label>
                        <div className="relative">
                          <input
                            type={showRegPassword ? "text" : "password"}
                            required
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            placeholder="Mật khẩu..."
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-900 dark:text-white font-semibold outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegPassword(!showRegPassword)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none flex items-center justify-center cursor-pointer"
                          >
                            {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">Xác nhận mật khẩu *</label>
                        <input
                          type={showRegPassword ? "text" : "password"}
                          required
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          placeholder="Nhập lại..."
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white font-semibold outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Password Strength Checklist with Interactive Suggestions */}
                    <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/80 p-3 rounded-xl text-[11px] space-y-2 mt-1">
                      <div className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[9px] tracking-wide mb-1 flex items-center justify-between">
                        <span>Tiêu chuẩn mật khẩu an toàn:</span>
                        {regPassword && (
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                            isLengthValid && isUpperValid && isLowerValid && isNumberValid && isSpecialValid
                              ? "bg-emerald-500 text-white animate-pulse"
                              : "bg-amber-500 text-white"
                          }`}>
                            {isLengthValid && isUpperValid && isLowerValid && isNumberValid && isSpecialValid ? "Hợp lệ" : "Chưa đủ mạnh"}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-slate-600 dark:text-slate-400">
                        <div className={`flex items-center gap-1.5 transition-colors ${isLengthValid ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-slate-400"}`}>
                          {isLengthValid ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          ) : (
                            <div className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-1 shrink-0" />
                          )}
                          <span>Tối thiểu 8 ký tự</span>
                        </div>
                        <div className={`flex items-center gap-1.5 transition-colors ${isUpperValid ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-slate-400"}`}>
                          {isUpperValid ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          ) : (
                            <div className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-1 shrink-0" />
                          )}
                          <span>Chứa 1 chữ hoa (A-Z)</span>
                        </div>
                        <div className={`flex items-center gap-1.5 transition-colors ${isLowerValid ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-slate-400"}`}>
                          {isLowerValid ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          ) : (
                            <div className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-1 shrink-0" />
                          )}
                          <span>Chứa 1 chữ thường (a-z)</span>
                        </div>
                        <div className={`flex items-center gap-1.5 transition-colors ${isNumberValid ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-slate-400"}`}>
                          {isNumberValid ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          ) : (
                            <div className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-1 shrink-0" />
                          )}
                          <span>Chứa 1 chữ số (0-9)</span>
                        </div>
                        <div className={`flex items-center gap-1.5 transition-colors ${isSpecialValid ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-slate-400"}`}>
                          {isSpecialValid ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          ) : (
                            <div className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-1 shrink-0" />
                          )}
                          <span>Ký tự đặc biệt (@#$...)</span>
                        </div>
                        <div className={`flex items-center gap-1.5 transition-colors ${isConfirmMatch ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-slate-400"}`}>
                          {isConfirmMatch ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          ) : (
                            <div className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-1 shrink-0" />
                          )}
                          <span>Mật khẩu khớp nhau</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={!(isLengthValid && isUpperValid && isLowerValid && isNumberValid && isSpecialValid && isConfirmMatch)}
                      className={`w-full py-2.5 text-white rounded-lg font-extrabold uppercase tracking-wide transition-all shadow-md cursor-pointer mt-2 ${
                        isLengthValid && isUpperValid && isLowerValid && isNumberValid && isSpecialValid && isConfirmMatch
                          ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/15"
                          : "bg-slate-300 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none"
                      }`}
                    >
                      Xác Nhận Đăng Ký Hệ Thống
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  // If the user is currently viewing the public CUSTOMER interface
  if (currentRole === UserRole.CUSTOMER) {
    return (
      <>
        <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 px-6 py-4 sticky top-0 z-50 shadow-sm transition-colors duration-150 animate-fadeIn">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-extrabold text-xl shadow-md shadow-indigo-600/20">
              V
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-sans text-[10px] text-indigo-600 dark:text-indigo-400 font-extrabold tracking-wider uppercase">
                  Village Information Management System
                </span>
                <span className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-[9px] px-2 py-0.5 rounded-full font-mono font-bold border border-emerald-100 dark:border-emerald-900/50 flex items-center gap-1">
                  <User className="w-2.5 h-2.5" /> GIAO DIỆN CÔNG DÂN
                </span>
              </div>
              <h1 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 leading-none mt-1">
                {activeTenant.name} <span className="text-slate-400 dark:text-slate-500 font-normal text-xs">({activeTenant.district ? `${activeTenant.district}, ` : ""}{activeTenant.province})</span>
              </h1>
            </div>
          </div>

          {/* Citizen Actions: Simulation login + Official Login Entry */}
          <div className="flex items-center gap-3">
            {/* Customer Login / Register Dialog trigger */}
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200/60 dark:border-slate-850/80">
              {isCustomerLoggedIn ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200/50">
                    <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Chào công dân: <strong className="text-emerald-700 dark:text-emerald-400 font-extrabold">{loggedInCitizen?.fullName || "Vũ Đức Giới"}</strong>
                      <span className="text-[10px] text-slate-500 font-medium ml-1">
                        ({loggedInCitizen?.villageId ? (filteredVillages.find(v => v.id === loggedInCitizen.villageId)?.name || "Vãng lai") : "Mô phỏng"})
                      </span>
                    </span>
                  </div>
                  <button
                    onClick={() => { if (onLogoutCitizen) onLogoutCitizen(); else onToggleCustomerLogin(); }}
                    className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg cursor-pointer transition-colors"
                    title="Đăng xuất"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => { setShowAuthModal(true); setAuthTab("login"); }}
                    className="flex items-center gap-1.5 text-xs font-extrabold px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm text-slate-700 dark:text-slate-200 cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5 text-slate-400" />
                    <span>Đăng Nhập</span>
                  </button>
                  <button
                    onClick={() => { setShowAuthModal(true); setAuthTab("register"); }}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-lg shadow-sm transition-all cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Đăng Ký Công Dân</span>
                  </button>
                </div>
              )}
            </div>

            {/* Gateway Button */}
            {loggedInOfficial ? (
              <button
                onClick={() => onChangeRole(loggedInOfficial.proposedRole)}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-indigo-600/15 hover:shadow-indigo-600/25 transition-all duration-150 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
                <span>Quay lại Quản trị ({loggedInOfficial.proposedRole === UserRole.STAFF ? "Cán bộ thôn" : loggedInOfficial.proposedRole === UserRole.MANAGER ? "Trưởng ban" : "Quản trị viên"})</span>
              </button>
            ) : (
              <button
                onClick={() => onChangeRole(UserRole.STAFF)}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-indigo-600/15 hover:shadow-indigo-600/25 transition-all duration-150 cursor-pointer"
                id="goto-admin-portal-btn"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Cổng Cán Bộ / Đăng Nhập Quản Trị</span>
              </button>
            )}
          </div>
        </div>
      </div>
      {renderCitizenAuthModal()}
      </>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 px-6 py-4 sticky top-0 z-50 shadow-sm transition-colors duration-150">
      <div className="max-w-7xl mx-auto flex flex-col gap-4">
        
        {/* Row 1: Header Branding */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-extrabold text-xl shadow-md shadow-indigo-600/20">
              V
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-sans text-[10px] text-indigo-600 dark:text-indigo-400 font-extrabold tracking-wider uppercase">
                  Village Information Management System
                </span>
                <span className="bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 text-[9px] px-2 py-0.5 rounded-full font-mono font-bold border border-indigo-100 dark:border-indigo-900/50 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> RBAC MATRIX V2.0
                </span>
              </div>
              <h1 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 leading-none mt-1">
                {activeTenant.name} <span className="text-slate-400 dark:text-slate-500 font-normal text-xs">({activeTenant.district ? `${activeTenant.district}, ` : ""}{activeTenant.province})</span>
              </h1>
            </div>
          </div>

          {/* Role selector Segmented control (filtered for the logged in official) */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-850/80 shadow-inner">
            {availableRoles.includes(UserRole.CUSTOMER) && (
              <button
                onClick={() => onChangeRole(UserRole.CUSTOMER)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all duration-200 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-900"
                id="role-customer-btn"
              >
                <User className="w-3.5 h-3.5" />
                Người dân (Customer)
              </button>
            )}

            {availableRoles.includes(UserRole.STAFF) && (
              <button
                onClick={() => onChangeRole(UserRole.STAFF)}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
                  currentRole === UserRole.STAFF
                    ? "bg-amber-600 text-white shadow-md shadow-amber-600/15"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-900"
                }`}
                id="role-staff-btn"
              >
                <FileEdit className="w-3.5 h-3.5" />
                Cán bộ thôn (Staff)
              </button>
            )}

            {availableRoles.includes(UserRole.MANAGER) && (
              <button
                onClick={() => onChangeRole(UserRole.MANAGER)}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
                  currentRole === UserRole.MANAGER
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/15"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-900"
                }`}
                id="role-manager-btn"
              >
                <Building2 className="w-3.5 h-3.5" />
                Trưởng ban (Manager)
              </button>
            )}

            {availableRoles.includes(UserRole.ADMIN) && (
              <button
                onClick={() => onChangeRole(UserRole.ADMIN)}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
                  currentRole === UserRole.ADMIN
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/15"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-900"
                }`}
                id="role-admin-btn"
              >
                <Landmark className="w-3.5 h-3.5" />
                Cấp xã (Admin)
              </button>
            )}

            {availableRoles.includes(UserRole.SUPER_ADMIN) && (
              <button
                onClick={() => onChangeRole(UserRole.SUPER_ADMIN)}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
                  currentRole === UserRole.SUPER_ADMIN
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/15"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-900"
                }`}
                id="role-super-btn"
              >
                <Shield className="w-3.5 h-3.5" />
                Super Admin
              </button>
            )}

            {currentRole === UserRole.STAFF && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200/50 ml-1.5">
                <span className="text-[10px] font-extrabold text-amber-800 dark:text-amber-300 uppercase">Thôn phụ trách:</span>
                <select
                  value={activeVillageId}
                  onChange={(e) => onChangeActiveVillageId(e.target.value)}
                  className="bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-100 rounded-lg px-2 py-0.5 text-[10px] font-bold focus:ring-1 focus:ring-amber-500 outline-none shadow-sm cursor-pointer"
                  id="staff-assigned-village-select"
                >
                  {filteredVillages.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} {v.id === "v-kt-1" ? "(Staff A)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

      </div>

      {renderCitizenAuthModal()}

    </div>
  );
}
