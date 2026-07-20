/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { UserRole, Village, OfficialRegistration } from "../types";
import { 
  ShieldCheck, UserCheck, AlertTriangle, Clock, Landmark, 
  ChevronRight, Upload, Phone, Mail, FileText, CheckCircle2, 
  MapPin, User, Building2, Shield, Calendar, Info, RefreshCw, XCircle, UserPlus
} from "lucide-react";
import { motion } from "motion/react";

interface OfficialAuthPortalProps {
  villages: Village[];
  registrations: OfficialRegistration[];
  onRegister: (newReg: OfficialRegistration) => void;
  onLogin: (account: OfficialRegistration) => void;
  loggedInOfficial: OfficialRegistration | null;
  onLogout: () => void;
  activeRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  onOpenCitizenAuth?: (tab: "login" | "register") => void;
}

export default function OfficialAuthPortal({
  villages,
  registrations,
  onRegister,
  onLogin,
  loggedInOfficial,
  onLogout,
  activeRole,
  onChangeRole,
  onOpenCitizenAuth
}: OfficialAuthPortalProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register" | "status">("login");
  
  // Registration Form States
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    birthDate: "",
    gender: "Nam" as "Nam" | "Nữ",
    cccd: "",
    cccdIssueDate: "",
    cccdIssuePlace: "Cục Cảnh sát Quản lý hành chính về trật tự xã hội",
    phone: "",
    email: "",
    villageId: "COMMUNE",
    proposedRole: UserRole.STAFF,
    subVillage: "",
    detailedAddress: "",
    termsAccepted: false
  });

  // Mock Upload States
  const [frontCccd, setFrontCccd] = useState<string | null>(null);
  const [backCccd, setBackCccd] = useState<string | null>(null);
  const [portrait, setPortrait] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  // Search status state
  const [searchCCCD, setSearchCCCD] = useState("");
  const [searchedReg, setSearchedReg] = useState<OfficialRegistration | null>(null);
  const [searchAttempted, setSearchAttempted] = useState(false);

  // Login inputs
  const [loginInput, setLoginInput] = useState("");
  const [loginError, setLoginError] = useState("");

  // Quick select login lists
  const approvedAccounts = registrations.filter(r => r.status === "ACTIVE");

  const handleSimulatedUpload = (field: "front" | "back" | "portrait") => {
    setUploadProgress(prev => ({ ...prev, [field]: 10 }));
    
    let currentProgress = 10;
    const interval = setInterval(() => {
      currentProgress += 30;
      if (currentProgress >= 100) {
        clearInterval(interval);
        setUploadProgress(prev => ({ ...prev, [field]: 100 }));
        
        // Assign beautiful mock image based on field
        if (field === "front") {
          setFrontCccd("https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=400&auto=format&fit=crop&q=80");
        } else if (field === "back") {
          setBackCccd("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80");
        } else {
          // Use nice portrait based on gender
          const portraitUrl = formData.gender === "Nam" 
            ? "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80"
            : "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80";
          setPortrait(portraitUrl);
        }
      } else {
        setUploadProgress(prev => ({ ...prev, [field]: currentProgress }));
      }
    }, 150);
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!formData.fullName || !formData.birthDate || !formData.cccd) {
        alert("Vui lòng điền đầy đủ các thông tin cá nhân bắt buộc (Họ tên, Ngày sinh, CCCD).");
        return;
      }
      if (formData.cccd.length !== 12) {
        alert("Số CCCD phải bao gồm đúng 12 chữ số theo quy định.");
        return;
      }
    } else if (step === 2) {
      if (!formData.phone || !formData.email) {
        alert("Vui lòng điền đầy đủ thông tin liên hệ (SĐT và Email).");
        return;
      }
    } else if (step === 3) {
      if (!frontCccd || !backCccd || !portrait) {
        alert("Vui lòng tải lên đầy đủ các tài liệu xác thực (CCCD mặt trước, mặt sau và Ảnh chân dung).");
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setStep(prev => prev - 1);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.termsAccepted) {
      alert("Bạn phải cam kết thông tin khai báo đúng sự thật trước khi nộp yêu cầu.");
      return;
    }

    const newReg: OfficialRegistration = {
      id: `reg-${Date.now()}`,
      fullName: formData.fullName,
      birthDate: formData.birthDate,
      gender: formData.gender,
      cccd: formData.cccd,
      cccdIssueDate: formData.cccdIssueDate || "22/06/2021",
      cccdIssuePlace: formData.cccdIssuePlace,
      phone: formData.phone,
      email: formData.email,
      villageId: formData.villageId,
      proposedRole: formData.proposedRole,
      status: "PENDING",
      frontCccdUrl: frontCccd || "",
      backCccdUrl: backCccd || "",
      portraitUrl: portrait || "",
      termsAccepted: true,
      createdAt: new Date().toLocaleString("vi-VN"),
      feedbackSMS: `UBND xa Hai Anh thong bao: Yeu cau dang ky tai khoan cua ong/ba ${formData.fullName} da duoc tiep nhan tren he thong VIMS. Trang thai hien tai: CHO DUYET.`,
      feedbackEmail: `Tài khoản của bạn đã được gửi đến UBND xã Hải Anh phê duyệt. Chúng tôi sẽ thông báo kết quả qua Email/SMS sau khi đối soát dữ liệu dân cư.`
    };

    onRegister(newReg);
    setSearchedReg(newReg);
    setActiveTab("status");
    setStep(1);
    
    // Clear form state
    setFormData({
      fullName: "",
      birthDate: "",
      gender: "Nam",
      cccd: "",
      cccdIssueDate: "",
      cccdIssuePlace: "Cục Cảnh sát Quản lý hành chính về trật tự xã hội",
      phone: "",
      email: "",
      villageId: "COMMUNE",
      proposedRole: UserRole.STAFF,
      subVillage: "",
      detailedAddress: "",
      termsAccepted: false
    });
    setFrontCccd(null);
    setBackCccd(null);
    setPortrait(null);
    setUploadProgress({});
  };

  const handleSearchStatus = () => {
    setSearchAttempted(true);
    const found = registrations.find(r => r.cccd === searchCCCD || r.phone === searchCCCD);
    if (found) {
      setSearchedReg(found);
    } else {
      setSearchedReg(null);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!loginInput) {
      setLoginError("Vui lòng điền Số điện thoại hoặc số CCCD.");
      return;
    }

    // Match in registrations with ACTIVE status
    const matched = registrations.find(
      r => (r.phone === loginInput || r.cccd === loginInput || r.email === loginInput)
    );

    if (!matched) {
      setLoginError("Không tìm thấy thông tin tài khoản cán bộ này trên hệ thống.");
      return;
    }

    if (matched.status !== "ACTIVE") {
      setLoginError(
        matched.status === "PENDING" ? "Tài khoản của bạn ĐANG CHỜ DUYỆT bởi UBND xã Hải Anh. Vui lòng quay lại sau." :
        matched.status === "REJECTED" ? `Tài khoản của bạn đã BỊ TỪ CHỐI. Lý do: ${matched.rejectionReason}` :
        `Tài khoản yêu cầu bổ sung thông tin. Chi tiết: ${matched.additionalInfoRequired}`
      );
      return;
    }

    // Login successfully
    onLogin(matched);
    onChangeRole(matched.proposedRole);
  };

  const handleQuickLogin = (acc: OfficialRegistration) => {
    onLogin(acc);
    onChangeRole(acc.proposedRole);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      {/* Banner introduction card */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-xl border border-indigo-500/25 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 transform translate-x-12 -translate-y-12">
          <Landmark className="w-96 h-96" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-indigo-300 font-extrabold text-xs tracking-wider uppercase mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse"></span>
            CỔNG THÔNG TIN QUẢN TRỊ NỘI BỘ
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">
            Cổng Kích Hoạt &amp; Phân Quyền Cán Bộ UBND Xã Hải Anh
          </h2>
          <p className="text-sm text-slate-300 max-w-2xl mt-2 leading-relaxed">
            Hệ thống quản trị và phân quyền bảo mật nhiều cấp (RBAC Matrix). Công dân được phép tra cứu tự do không cần tài khoản, tuy nhiên để thực hiện tác vụ biên tập, chỉ đạo hoặc phê duyệt, Cán bộ phải thực hiện đăng ký và được chính quyền xã đối soát, phê duyệt kích hoạt tài khoản.
          </p>
        </div>
      </div>

      {onOpenCitizenAuth && (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 p-4 rounded-2xl mb-6 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-start gap-2.5">
            <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200 block">Bạn là Người dân / Công dân xã Hải Anh?</span>
              <span className="text-slate-500 dark:text-slate-400">Trang này dành riêng cho Cán bộ Quản trị. Để đăng ký định danh công dân mới, vui lòng sử dụng Cổng Định danh Công dân.</span>
            </div>
          </div>
          <button
            onClick={() => {
              onChangeRole(UserRole.CUSTOMER);
              onOpenCitizenAuth("register");
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all whitespace-nowrap self-stretch sm:self-auto cursor-pointer flex items-center justify-center gap-1"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Đăng ký Công dân
          </button>
        </div>
      )}

      {/* Auth Tab Switching Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 mb-6 gap-4 pb-2 sm:pb-0">
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => { setActiveTab("login"); setLoginError(""); }}
            className={`pb-4 px-4 text-sm font-extrabold transition-all relative ${
              activeTab === "login" 
                ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400" 
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Đăng nhập Cán bộ
          </button>
          <button
            onClick={() => setActiveTab("register")}
            className={`pb-4 px-4 text-sm font-extrabold transition-all relative ${
              activeTab === "register" 
                ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400" 
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Đăng ký Tài khoản Cán bộ Mới
          </button>
          <button
            onClick={() => setActiveTab("status")}
            className={`pb-4 px-4 text-sm font-extrabold transition-all relative ${
              activeTab === "status" 
                ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400" 
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Tra cứu Tiến độ Duyệt
          </button>
        </div>
        
        <button
          onClick={() => onChangeRole(UserRole.CUSTOMER)}
          className="pb-4 px-4 text-xs font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-450 dark:hover:text-indigo-400 transition-colors flex items-center gap-1 hover:underline cursor-pointer"
        >
          &larr; Quay lại Trang chủ Người dân
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "login" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {/* Login form block */}
            <div className="md:col-span-3 space-y-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-indigo-500" /> Đăng nhập hệ thống
                </h3>
                <p className="text-xs text-slate-500 mt-1">Sử dụng Số điện thoại, Email hoặc số CCCD đã được kích hoạt thành công.</p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4 pt-2">
                {loginError && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-red-800 dark:text-red-300 rounded-xl text-xs flex items-start gap-2">
                    <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tài khoản định danh (SĐT, Email hoặc CCCD)</label>
                  <input
                    type="text"
                    value={loginInput}
                    onChange={(e) => setLoginInput(e.target.value)}
                    placeholder="Nhập SĐT (ví dụ: 0911223344) hoặc số CCCD..."
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Mật khẩu định danh</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    disabled
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 px-4 py-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none text-slate-400 font-mono"
                  />
                  <span className="text-[10px] text-slate-400 italic block mt-1">Mật khẩu đã được mã hóa OTP &amp; đồng bộ Sinh trắc học. Để mô phỏng nhanh, quý khách vui lòng nhập thông tin hoặc nhấn Login Nhanh.</span>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl transition-all shadow-md shadow-indigo-600/20 text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" /> Đăng nhập quản trị
                </button>
              </form>
            </div>

            {/* Quick simulation tester sidebar */}
            <div className="md:col-span-2 bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-900 dark:text-white uppercase mb-3">
                  <RefreshCw className="w-3.5 h-3.5 text-indigo-500 animate-spin" /> MÔ PHỎNG ĐĂNG NHẬP NHANH
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
                  Đánh giá viên có thể nhấp chọn trực tiếp các tài khoản cán bộ mẫu <strong>đã được kích hoạt phê duyệt</strong> bên dưới để truy cập nhanh các giao diện quản trị:
                </p>

                <div className="space-y-2">
                  {approvedAccounts.map((acc) => (
                    <button
                      key={acc.id}
                      onClick={() => handleQuickLogin(acc)}
                      className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:border-indigo-200 dark:hover:border-indigo-900 border border-slate-200 dark:border-slate-800 text-left transition-all group flex items-center gap-2.5"
                    >
                      <img 
                        src={acc.portraitUrl} 
                        alt={acc.fullName} 
                        className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700" 
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-800 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{acc.fullName}</div>
                        <div className="text-[9px] text-slate-500 flex items-center justify-between mt-0.5">
                          <span>SĐT: <strong className="text-slate-700 dark:text-slate-300 font-mono">{acc.phone}</strong></span>
                          <span className="px-1.5 py-0.2 bg-slate-100 dark:bg-slate-850 rounded font-bold text-slate-600 dark:text-slate-400">{acc.proposedRole}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-400">
                <Info className="w-3 h-3 text-indigo-500 inline mr-1" />
                <span>Quy trình phê duyệt hoạt động trực quan: Khi đăng ký mới một tài khoản, vui lòng đăng nhập tài khoản <strong>Nguyễn Văn Hoạt (Admin)</strong> để thực hiện đối soát và duyệt.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "register" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
          {/* Progress stepper indicators */}
          <div className="flex items-center justify-between mb-8 max-w-xl mx-auto text-xs font-bold">
            <div className="flex flex-col items-center gap-1 flex-1">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-slate-950 text-slate-400 border border-slate-200 dark:border-slate-800"}`}>1</span>
              <span className={step >= 1 ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}>Thông tin</span>
            </div>
            <div className={`h-0.5 flex-1 ${step >= 2 ? "bg-indigo-600" : "bg-slate-150 dark:bg-slate-800"}`}></div>
            <div className="flex flex-col items-center gap-1 flex-1">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-slate-950 text-slate-400 border border-slate-200 dark:border-slate-800"}`}>2</span>
              <span className={step >= 2 ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}>Liên hệ</span>
            </div>
            <div className={`h-0.5 flex-1 ${step >= 3 ? "bg-indigo-600" : "bg-slate-150 dark:bg-slate-800"}`}></div>
            <div className="flex flex-col items-center gap-1 flex-1">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-slate-950 text-slate-400 border border-slate-200 dark:border-slate-800"}`}>3</span>
              <span className={step >= 3 ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}>Tài liệu</span>
            </div>
            <div className={`h-0.5 flex-1 ${step >= 4 ? "bg-indigo-600" : "bg-slate-150 dark:bg-slate-800"}`}></div>
            <div className="flex flex-col items-center gap-1 flex-1">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 4 ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-slate-950 text-slate-400 border border-slate-200 dark:border-slate-800"}`}>4</span>
              <span className={step >= 4 ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}>Xác nhận</span>
            </div>
          </div>

          <form onSubmit={handleRegisterSubmit} className="space-y-6">
            
            {/* STEP 1: Personal info */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="border-b border-slate-150 dark:border-slate-800 pb-2">
                  <h4 className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-4 h-4" /> Bước 1: Khai báo thông tin cá nhân
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Họ và tên cán bộ (Ghi hoa có dấu) *</label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Ví dụ: NGUYỄN VĂN A"
                      required
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-sm outline-none text-slate-900 dark:text-white font-medium focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Ngày tháng năm sinh *</label>
                    <input
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                      required
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-sm outline-none text-slate-900 dark:text-white font-medium focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Giới tính</label>
                    <div className="flex gap-4 pt-1.5">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
                          checked={formData.gender === "Nam"}
                          onChange={() => setFormData({ ...formData, gender: "Nam" })}
                          className="text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                        />
                        Nam
                      </label>
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
                          checked={formData.gender === "Nữ"}
                          onChange={() => setFormData({ ...formData, gender: "Nữ" })}
                          className="text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                        />
                        Nữ
                      </label>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Số Căn cước công dân (12 số) *</label>
                    <input
                      type="text"
                      maxLength={12}
                      value={formData.cccd}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setFormData({ ...formData, cccd: val });
                      }}
                      placeholder="Ví dụ: 036085001234"
                      required
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-sm outline-none text-slate-900 dark:text-white font-mono focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Ngày cấp CCCD *</label>
                    <input
                      type="date"
                      value={formData.cccdIssueDate}
                      onChange={(e) => setFormData({ ...formData, cccdIssueDate: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-sm outline-none text-slate-900 dark:text-white font-medium focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Nơi cấp CCCD</label>
                    <input
                      type="text"
                      value={formData.cccdIssuePlace}
                      onChange={(e) => setFormData({ ...formData, cccdIssuePlace: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-sm outline-none text-slate-900 dark:text-white font-medium focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-1 shadow cursor-pointer"
                  >
                    Tiếp tục <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Contact & address */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="border-b border-slate-150 dark:border-slate-800 pb-2">
                  <h4 className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="w-4 h-4" /> Bước 2: Khai báo thông tin liên hệ &amp; Địa chỉ
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Số điện thoại liên lạc *</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Ví dụ: 0912345678"
                      required
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-sm outline-none text-slate-900 dark:text-white font-mono focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Thư điện tử (Email) *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Ví dụ: canbo@gmail.com"
                      required
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-sm outline-none text-slate-900 dark:text-white font-medium focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Địa bàn thôn/xóm cư trú &amp; công tác</label>
                    <select
                      value={formData.villageId}
                      onChange={(e) => setFormData({ ...formData, villageId: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-sm outline-none text-slate-900 dark:text-white font-medium focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="COMMUNE">Ủy ban nhân dân Xã (Cấp xã)</option>
                      {villages.map((v) => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tổ dân phố (nếu có)</label>
                    <input
                      type="text"
                      value={formData.subVillage}
                      onChange={(e) => setFormData({ ...formData, subVillage: e.target.value })}
                      placeholder="Ví dụ: Tổ dân phố số 2"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-sm outline-none text-slate-900 dark:text-white font-medium focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Địa chỉ cụ thể (Thôn, xóm, số nhà, đường phố)</label>
                    <input
                      type="text"
                      value={formData.detailedAddress}
                      onChange={(e) => setFormData({ ...formData, detailedAddress: e.target.value })}
                      placeholder="Ví dụ: Thôn 1, xã Hải Anh, Ninh Bình"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-sm outline-none text-slate-900 dark:text-white font-medium focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-extrabold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                  >
                    Quay lại
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-1 shadow cursor-pointer"
                  >
                    Tiếp tục <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Verification documents & role */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="border-b border-slate-150 dark:border-slate-800 pb-2">
                  <h4 className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Upload className="w-4 h-4" /> Bước 3: Tải lên hồ sơ, ảnh chụp xác minh tài khoản
                  </h4>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5 max-w-md">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Vai trò / Chức vụ mong muốn phân quyền *</label>
                    <select
                      value={formData.proposedRole}
                      onChange={(e) => setFormData({ ...formData, proposedRole: e.target.value as UserRole })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-sm outline-none text-slate-900 dark:text-white font-medium focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value={UserRole.STAFF}>Cán bộ Thôn xóm / Trưởng Thôn (STAFF)</option>
                      <option value={UserRole.MANAGER}>Trưởng ban ngành / Phó Chủ tịch UBND (MANAGER)</option>
                      <option value={UserRole.ADMIN}>Cán bộ quản trị cấp xã / Chủ tịch UBND (ADMIN)</option>
                      <option value={UserRole.SUPER_ADMIN}>Chuyên viên hệ thống tối cao (SUPER_ADMIN)</option>
                    </select>
                    <span className="text-[10px] text-slate-400 leading-normal block italic">Lưu ý: Bạn chỉ được cấp quyền này khi hồ sơ đính kèm và thông tin CCCD được đối soát trùng khớp bởi UBND xã.</span>
                  </div>

                  {/* Upload container boxes */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    {/* Front CCCD upload */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Ảnh CCCD mặt trước *</label>
                      <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50 dark:bg-slate-950/40 text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[160px]">
                        {frontCccd ? (
                          <div className="space-y-2">
                            <img src={frontCccd} alt="Mặt trước CCCD" className="w-full max-h-[100px] object-contain rounded-lg shadow-sm border border-slate-200 dark:border-slate-800" />
                            <div className="text-[10px] text-indigo-600 font-bold flex items-center justify-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> cccd_mat_truoc.jpg
                            </div>
                            <button type="button" onClick={() => setFrontCccd(null)} className="text-[9px] text-rose-500 font-bold hover:underline">Hủy và tải lại</button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                            <div className="text-xs text-slate-600 dark:text-slate-450">Kéo thả hoặc nhấp chọn ảnh</div>
                            <button
                              type="button"
                              onClick={() => handleSimulatedUpload("front")}
                              className="px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-extrabold rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-slate-100 transition-colors shadow-sm"
                            >
                              {uploadProgress["front"] ? `Đang tải ${uploadProgress["front"]}%` : "Mô phỏng chụp ảnh"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Back CCCD upload */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Ảnh CCCD mặt sau *</label>
                      <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50 dark:bg-slate-950/40 text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[160px]">
                        {backCccd ? (
                          <div className="space-y-2">
                            <img src={backCccd} alt="Mặt sau CCCD" className="w-full max-h-[100px] object-contain rounded-lg shadow-sm border border-slate-200 dark:border-slate-800" />
                            <div className="text-[10px] text-indigo-600 font-bold flex items-center justify-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> cccd_mat_sau.jpg
                            </div>
                            <button type="button" onClick={() => setBackCccd(null)} className="text-[9px] text-rose-500 font-bold hover:underline">Hủy và tải lại</button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                            <div className="text-xs text-slate-600 dark:text-slate-450">Kéo thả hoặc nhấp chọn ảnh</div>
                            <button
                              type="button"
                              onClick={() => handleSimulatedUpload("back")}
                              className="px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-extrabold rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-slate-100 transition-colors shadow-sm"
                            >
                              {uploadProgress["back"] ? `Đang tải ${uploadProgress["back"]}%` : "Mô phỏng chụp ảnh"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Portrait upload */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Ảnh chân dung đối chiếu *</label>
                      <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50 dark:bg-slate-950/40 text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[160px]">
                        {portrait ? (
                          <div className="space-y-2">
                            <img src={portrait} alt="Ảnh chân dung" className="w-16 h-16 rounded-full object-cover mx-auto shadow-sm border border-slate-200 dark:border-slate-800" />
                            <div className="text-[10px] text-indigo-600 font-bold flex items-center justify-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> chan_dung.jpg
                            </div>
                            <button type="button" onClick={() => setPortrait(null)} className="text-[9px] text-rose-500 font-bold hover:underline">Hủy và tải lại</button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <User className="w-6 h-6 text-slate-400 mx-auto" />
                            <div className="text-xs text-slate-600 dark:text-slate-450">Kéo thả hoặc nhấp chọn ảnh</div>
                            <button
                              type="button"
                              onClick={() => handleSimulatedUpload("portrait")}
                              className="px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-extrabold rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-slate-100 transition-colors shadow-sm"
                            >
                              {uploadProgress["portrait"] ? `Đang tải ${uploadProgress["portrait"]}%` : "Mô phỏng chụp ảnh"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-extrabold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                  >
                    Quay lại
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-1 shadow cursor-pointer"
                  >
                    Tiếp tục <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Confirmation & submit */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="border-b border-slate-150 dark:border-slate-800 pb-2">
                  <h4 className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Bước 4: Cam kết điều khoản và nộp hồ sơ
                  </h4>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <h5 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wide">Xem lại thông tin tóm tắt đăng ký:</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-xs font-medium text-slate-600 dark:text-slate-450">
                    <div>• Họ và tên: <strong className="text-slate-900 dark:text-white">{formData.fullName}</strong></div>
                    <div>• Số CCCD: <strong className="text-slate-900 dark:text-white font-mono">{formData.cccd}</strong></div>
                    <div>• Số điện thoại: <strong className="text-slate-900 dark:text-white font-mono">{formData.phone}</strong></div>
                    <div>• Email liên hệ: <strong className="text-slate-900 dark:text-white">{formData.email}</strong></div>
                    <div>• Địa bàn: <strong className="text-slate-900 dark:text-white">{formData.villageId === "COMMUNE" ? "UBND xã Hải Anh (Toàn xã)" : villages.find(v => v.id === formData.villageId)?.name}</strong></div>
                    <div>• Quyền hạn yêu cầu: <strong className="text-indigo-600 dark:text-indigo-400 font-extrabold">{formData.proposedRole}</strong></div>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-[11px] leading-relaxed text-amber-900 dark:text-amber-300 rounded-2xl flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                  <span>
                    <strong>Cảnh báo pháp lý quan trọng:</strong> Hệ thống VIMS đồng bộ định danh điện tử trực tiếp với Cơ sở dữ liệu dân cư của Bộ Công an. Mọi hành vi cố tình khai báo sai lệch thông tin cá nhân, giả mạo cán bộ chính quyền để can thiệp dữ liệu sẽ bị truy tố trách nhiệm hình sự trực tiếp trước pháp luật.
                  </span>
                </div>

                <div className="flex items-start gap-2.5 pt-2">
                  <input
                    type="checkbox"
                    id="termsAccepted"
                    checked={formData.termsAccepted}
                    onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                    required
                    className="rounded text-indigo-600 focus:ring-indigo-500 h-4.5 w-4.5 border-slate-300 mt-0.5"
                  />
                  <label htmlFor="termsAccepted" className="text-xs font-extrabold text-slate-800 dark:text-slate-200 select-none cursor-pointer">
                    Tôi cam kết và chịu trách nhiệm hoàn toàn trước pháp luật rằng toàn bộ thông tin cá nhân, số CCCD, số điện thoại, ảnh hồ sơ khai báo trên đây là chính xác, trung thực.
                  </label>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-extrabold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                  >
                    Quay lại
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-1 shadow cursor-pointer"
                  >
                    Gửi yêu cầu đăng ký tài khoản <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      )}

      {activeTab === "status" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-500 animate-pulse" /> Tra cứu tiến trình phê duyệt hồ sơ
            </h3>
            <p className="text-xs text-slate-500 mt-1">Vui lòng nhập Số CCCD (12 số) hoặc Số điện thoại để kiểm tra trạng thái phê duyệt từ ban lãnh đạo UBND xã Hải Anh.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={searchCCCD}
              onChange={(e) => setSearchCCCD(e.target.value)}
              placeholder="Nhập 12 số CCCD hoặc Số điện thoại cán bộ..."
              className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white font-semibold"
            />
            <button
              onClick={handleSearchStatus}
              className="py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-sm transition-all shadow cursor-pointer whitespace-nowrap"
            >
              Tra cứu hồ sơ
            </button>
          </div>

          {searchAttempted && searchedReg && (
            <div className="p-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-slate-250 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <img 
                    src={searchedReg.portraitUrl} 
                    alt={searchedReg.fullName} 
                    className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-sm"
                  />
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{searchedReg.fullName}</h4>
                    <span className="text-[10px] text-slate-500">Mã hồ sơ: <strong className="font-mono">{searchedReg.id}</strong></span>
                  </div>
                </div>

                <div>
                  {searchedReg.status === "PENDING" && (
                    <span className="px-3 py-1.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40 animate-pulse flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> ĐANG CHỜ PHÊ DUYỆT
                    </span>
                  )}
                  {searchedReg.status === "ACTIVE" && (
                    <span className="px-3 py-1.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/40 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> ĐÃ KÍCH HOẠT THÀNH CÔNG
                    </span>
                  )}
                  {searchedReg.status === "ADDITIONAL_REQUIRED" && (
                    <span className="px-3 py-1.5 rounded-full text-xs font-extrabold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/40 flex items-center gap-1">
                      <Info className="w-3.5 h-3.5 animate-bounce" /> YÊU CẦU BỔ SUNG HỒ SƠ
                    </span>
                  )}
                  {searchedReg.status === "REJECTED" && (
                    <span className="px-3 py-1.5 rounded-full text-xs font-extrabold bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900/40 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> TỪ CHỐI DUYỆT HỒ SƠ
                    </span>
                  )}
                </div>
              </div>

              {/* Status details card based on state */}
              <div className="space-y-3 text-xs font-medium text-slate-600 dark:text-slate-400">
                {searchedReg.status === "PENDING" && (
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-300 border border-amber-100 dark:border-amber-900/40 rounded-xl leading-relaxed">
                    <strong>Thông báo tiến trình:</strong> Đơn yêu cầu đăng ký của bạn đã được đối soát thành công với cơ sở dữ liệu quốc gia về dân cư của Bộ Công an. Hồ sơ hiện đã được chuyển giao cho **đồng chí Nguyễn Văn Hoạt (Chủ tịch UBND xã Hải Anh)** trực tiếp xem duyệt và ký duyệt số để phân quyền. Bạn sẽ nhận được thông báo SMS/Zalo ngay khi có quyết định.
                  </div>
                )}

                {searchedReg.status === "ACTIVE" && (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/40 rounded-xl leading-relaxed">
                    <strong>Thông báo kích hoạt:</strong> Hồ sơ của bạn đã được đối soát chính xác và được đồng chí **{searchedReg.approvedBy || "Chủ tịch UBND xã"}** duyệt kích hoạt tài khoản. Quyền quản trị cán bộ **{searchedReg.proposedRole}** đã sẵn sàng. Bạn có thể đăng nhập ngay lập tức bằng Số điện thoại **{searchedReg.phone}** ở tab Đăng nhập cán bộ phía trên để bắt đầu làm việc.
                  </div>
                )}

                {searchedReg.status === "ADDITIONAL_REQUIRED" && (
                  <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-950 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/40 rounded-xl space-y-2">
                    <p className="font-bold text-indigo-900 dark:text-indigo-200">Nội dung yêu cầu bổ sung từ UBND xã:</p>
                    <p className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-indigo-200 dark:border-indigo-900/50 italic">
                      "{searchedReg.additionalInfoRequired}"
                    </p>
                    <p className="text-[10px] leading-relaxed pt-1">Vui lòng liên hệ trực tiếp Văn phòng UBND xã Hải Anh qua hotline **02293.xxx.xxx** hoặc chuẩn bị tài liệu cập nhật để được cán bộ hỗ trợ sửa đổi đơn đăng ký trực tiếp trên hệ thống.</p>
                  </div>
                )}

                {searchedReg.status === "REJECTED" && (
                  <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-900 dark:text-red-300 border border-red-100 dark:border-red-900/40 rounded-xl space-y-2">
                    <p className="font-bold text-red-900 dark:text-red-200">Lý do từ chối quyết định cấp quyền:</p>
                    <p className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-red-250 dark:border-red-900/50 italic text-red-600 dark:text-red-400">
                      "{searchedReg.rejectionReason}"
                    </p>
                    <p className="text-[10px] leading-relaxed pt-1">Đơn đăng ký đã bị khép lại do không đủ điều kiện xét duyệt. Nếu có thắc mắc hoặc có sự sai lệch thông tin khi đối chiếu cư trú thực tế, bạn có thể gửi đơn khiếu nại trực tiếp tại Trụ sở tiếp công dân xã Hải Anh.</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-[11px] border-t border-slate-200 dark:border-slate-800">
                  <div>• CCCD đăng ký: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{searchedReg.cccd}</span></div>
                  <div>• SĐT đăng ký: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{searchedReg.phone}</span></div>
                  <div>• Vai trò đề xuất: <span className="font-bold text-slate-800 dark:text-slate-200">{searchedReg.proposedRole}</span></div>
                  <div>• Ngày nộp đơn: <span className="font-bold text-slate-800 dark:text-slate-200">{searchedReg.createdAt}</span></div>
                </div>

                {/* Simulated SMS Notification panel */}
                <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-1 text-[9px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">
                    <Phone className="w-3 h-3 text-emerald-500" /> NHẬT KÝ SMS ĐÃ GỬI (ĐỊA PHƯƠNG)
                  </div>
                  <div className="font-mono text-[10px] text-slate-600 dark:text-slate-400 leading-normal italic">
                    {searchedReg.feedbackSMS || "Chưa có tin nhắn SMS nào được gửi."}
                  </div>
                </div>
              </div>
            </div>
          )}

          {searchAttempted && !searchedReg && (
            <div className="p-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl text-center">
              <Clock className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <h4 className="text-sm font-extrabold text-slate-800 dark:text-white">Không tìm thấy hồ sơ đăng ký</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">Vui lòng kiểm tra kỹ số CCCD hoặc Số điện thoại. Bạn cũng có thể sang tab "Đăng ký tài khoản" để lập hồ sơ mới nếu chưa từng khai báo.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
