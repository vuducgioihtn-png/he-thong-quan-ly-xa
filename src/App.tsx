/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { UserRole, WardTenant, Village, Official, AdministrativeOffice, Announcement, FieldReflection, AuditLog, OfficialRegistration } from "./types";
import { 
  SEEDED_TENANTS, SEEDED_VILLAGES, SEEDED_OFFICIALS, 
  SEEDED_OFFICES, SEEDED_ANNOUNCEMENTS, SEEDED_REFLECTIONS 
} from "./data";
import RoleSwitcher from "./components/RoleSwitcher";
import CitizenView from "./components/CitizenView";
import VillageOfficialView from "./components/VillageOfficialView";
import CommuneOfficialView from "./components/CommuneOfficialView";
import SuperAdminView from "./components/SuperAdminView";
import OfficialAuthPortal from "./components/OfficialAuthPortal";
import PermissionsModal from "./components/PermissionsModal";
import { ShieldCheck, UserCheck, RefreshCw, Sun, Moon, Download, Upload, LogOut, Clock, CloudSun, Thermometer } from "lucide-react";

const SEEDED_REGISTRATIONS: OfficialRegistration[] = [
  {
    id: "reg-hoat",
    fullName: "Nguyễn Văn Hoạt",
    birthDate: "1974-05-18",
    gender: "Nam",
    cccd: "036074001234",
    cccdIssueDate: "2016-03-24",
    cccdIssuePlace: "Cục Cảnh sát ĐKQL cư trú và DLQG về dân cư",
    phone: "0911223344",
    email: "nguyenvanhoat.haianh@gmail.com",
    villageId: "COMMUNE",
    proposedRole: UserRole.ADMIN,
    status: "ACTIVE",
    frontCccdUrl: "https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=600&auto=format&fit=crop&q=60",
    backCccdUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=60",
    portraitUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    termsAccepted: true,
    createdAt: "10/06/2026, 08:00:00"
  },
  {
    id: "reg-duc",
    fullName: "Trần Minh Đức",
    birthDate: "1980-11-05",
    gender: "Nam",
    cccd: "036080004567",
    cccdIssueDate: "2017-09-12",
    cccdIssuePlace: "Cục Cảnh sát ĐKQL cư trú và DLQG về dân cư",
    phone: "0922334455",
    email: "tranminhduc.haianh@gmail.com",
    villageId: "COMMUNE",
    proposedRole: UserRole.MANAGER,
    status: "ACTIVE",
    frontCccdUrl: "https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=600&auto=format&fit=crop&q=60",
    backCccdUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=60",
    portraitUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    termsAccepted: true,
    createdAt: "10/06/2026, 09:15:00"
  },
  {
    id: "reg-nam",
    fullName: "Phạm Văn Nam",
    birthDate: "1985-08-20",
    gender: "Nam",
    cccd: "036085001245",
    cccdIssueDate: "2018-07-30",
    cccdIssuePlace: "Cục Cảnh sát ĐKQL cư trú và DLQG về dân cư",
    phone: "0933445566",
    email: "phamvannam.haianh@gmail.com",
    villageId: "v-kt-1",
    proposedRole: UserRole.STAFF,
    status: "ACTIVE",
    frontCccdUrl: "https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=600&auto=format&fit=crop&q=60",
    backCccdUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=60",
    portraitUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    termsAccepted: true,
    createdAt: "11/06/2026, 10:45:00"
  },
  {
    id: "reg-super",
    fullName: "Quản trị viên DGMarketing",
    birthDate: "1990-01-01",
    gender: "Nữ",
    cccd: "036090001111",
    cccdIssueDate: "2020-01-01",
    cccdIssuePlace: "Cục Cảnh sát ĐKQL cư trú và DLQG về dân cư",
    phone: "0999999999",
    email: "superadmin.haianh@gmail.com",
    villageId: "COMMUNE",
    proposedRole: UserRole.SUPER_ADMIN,
    status: "ACTIVE",
    frontCccdUrl: "https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=600&auto=format&fit=crop&q=60",
    backCccdUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=60",
    portraitUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    termsAccepted: true,
    createdAt: "01/06/2026, 00:00:00"
  },
  {
    id: "reg-1",
    fullName: "Nguyễn Thị Mai",
    birthDate: "1992-05-12",
    gender: "Nữ",
    cccd: "036092004567",
    cccdIssueDate: "2018-08-15",
    cccdIssuePlace: "Cục Cảnh sát ĐKQL cư trú và DLQG về dân cư",
    phone: "0912345678",
    email: "nguyenthimai.haianh@gmail.com",
    villageId: "v-kt-1",
    proposedRole: UserRole.STAFF,
    status: "PENDING",
    frontCccdUrl: "https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=600&auto=format&fit=crop&q=60",
    backCccdUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=60",
    portraitUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    termsAccepted: true,
    createdAt: "15/07/2026, 09:30:00"
  },
  {
    id: "reg-2",
    fullName: "Trần Quốc Khánh",
    birthDate: "1988-10-22",
    gender: "Nam",
    cccd: "036088001245",
    cccdIssueDate: "2020-04-10",
    cccdIssuePlace: "Cục Cảnh sát Quản lý hành chính về trật tự xã hội",
    phone: "0987654321",
    email: "tranqkhanh.ubnd@gmail.com",
    villageId: "COMMUNE",
    proposedRole: UserRole.MANAGER,
    status: "PENDING",
    frontCccdUrl: "https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=600&auto=format&fit=crop&q=60",
    backCccdUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=60",
    portraitUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    termsAccepted: true,
    createdAt: "15/07/2026, 14:15:22"
  },
  {
    id: "reg-3",
    fullName: "Lê Văn Thắng",
    birthDate: "1985-03-30",
    gender: "Nam",
    cccd: "036085006789",
    cccdIssueDate: "2019-11-20",
    cccdIssuePlace: "Cục Cảnh sát Quản lý hành chính về trật tự xã hội",
    phone: "0966554433",
    email: "lethang90.haianh@gmail.com",
    villageId: "v-kt-2",
    proposedRole: UserRole.STAFF,
    status: "ADDITIONAL_REQUIRED",
    additionalInfoRequired: "Thiếu ảnh chân dung rõ nét mặt mộc để đối chiếu CCCD, vui lòng tải lên lại ảnh khác rõ ràng hơn.",
    frontCccdUrl: "https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=600&auto=format&fit=crop&q=60",
    backCccdUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=60",
    portraitUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    termsAccepted: true,
    createdAt: "14/07/2026, 08:12:05"
  },
  {
    id: "reg-4",
    fullName: "Phạm Thành Long",
    birthDate: "1979-07-15",
    gender: "Nam",
    cccd: "036079008899",
    cccdIssueDate: "2017-12-05",
    cccdIssuePlace: "Cục Cảnh sát ĐKQL cư trú và DLQG về dân cư",
    phone: "0977889900",
    email: "phamthanhlong.haianh@gmail.com",
    villageId: "COMMUNE",
    proposedRole: UserRole.ADMIN,
    status: "REJECTED",
    rejectionReason: "Qua kiểm tra đối chiếu dữ liệu nhân khẩu, đồng chí không thuộc danh sách cán bộ, công chức điều chuyển về xã Hải Anh.",
    frontCccdUrl: "https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=600&auto=format&fit=crop&q=60",
    backCccdUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=60",
    portraitUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    termsAccepted: true,
    createdAt: "13/07/2026, 17:45:10"
  }
];

const getWeatherDesc = (code: number) => {
  if (code === 0) return { label: "Trời quang mây", icon: "☀️" };
  if ([1, 2, 3].includes(code)) return { label: "Nhiều mây", icon: "⛅" };
  if ([45, 48].includes(code)) return { label: "Có sương mù", icon: "🌫️" };
  if ([51, 53, 55, 56, 57].includes(code)) return { label: "Mưa phùn", icon: "🌧️" };
  if ([61, 63, 65, 66, 67].includes(code)) return { label: "Mưa rào", icon: "🌧️" };
  if ([71, 73, 75, 77].includes(code)) return { label: "Có tuyết", icon: "❄️" };
  if ([80, 81, 82].includes(code)) return { label: "Mưa lớn", icon: "🌧️" };
  if ([95, 96, 99].includes(code)) return { label: "Có dông", icon: "⛈️" };
  return { label: "Có mây", icon: "☁️" };
};

export default function App() {
  // Real-time clock state
  const [currentTime, setCurrentTime] = useState(new Date());

  // Real-time weather state
  const [weather, setWeather] = useState<{ temp: number; desc: string } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=20.25&longitude=105.97&current=temperature_2m,weather_code");
        if (res.ok) {
          const data = await res.json();
          if (data && data.current) {
            const temp = Math.round(data.current.temperature_2m);
            const code = data.current.weather_code;
            const descInfo = getWeatherDesc(code);
            setWeather({
              temp,
              desc: descInfo.label
            });
            return;
          }
        }
      } catch (e) {
        console.error("Lỗi tải thời tiết", e);
      }
      setWeather({
        temp: 29,
        desc: "Trời quang mây"
      });
    };
    fetchWeather();
    const interval = setInterval(fetchWeather, 600000); // 10 mins
    return () => clearInterval(interval);
  }, []);

  const formatVietnameseDate = (date: Date) => {
    const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
    const dayName = days[date.getDay()];
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");
    return `${dayName}, ${dd}/${mm}/${yyyy} | ${hh}:${min}:${ss}`;
  };

  // 1. Role State & active simulation configs
  const [role, setRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem("vims_role");
    if (saved && Object.values(UserRole).includes(saved as UserRole)) {
      return saved as UserRole;
    }
    return UserRole.CUSTOMER;
  });

  const [registrations, setRegistrations] = useState<OfficialRegistration[]>(() => {
    const saved = localStorage.getItem("vims_db_registrations");
    return saved ? JSON.parse(saved) : SEEDED_REGISTRATIONS;
  });

  const [loggedInOfficial, setLoggedInOfficial] = useState<OfficialRegistration | null>(() => {
    const saved = localStorage.getItem("vims_logged_in_official");
    return saved ? JSON.parse(saved) : null;
  });

  const [isCustomerLoggedIn, setIsCustomerLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem("vims_customer_logged_in") === "true";
  });

  const [loggedInCitizen, setLoggedInCitizen] = useState<any>(() => {
    const saved = localStorage.getItem("vims_logged_in_citizen");
    return saved ? JSON.parse(saved) : null;
  });

  // Shared Citizen Auth Modal State
  const [showCitizenAuthModal, setShowCitizenAuthModal] = useState(false);
  const [citizenAuthTab, setCitizenAuthTab] = useState<"login" | "register">("login");

  const handleOpenCitizenAuth = (tab: "login" | "register") => {
    setShowCitizenAuthModal(true);
    setCitizenAuthTab(tab);
  };

  const handleLoginCitizen = (citizen: any) => {
    setLoggedInCitizen(citizen);
    setIsCustomerLoggedIn(true);
    localStorage.setItem("vims_customer_logged_in", "true");
    localStorage.setItem("vims_logged_in_citizen", JSON.stringify(citizen));
  };

  const handleLogoutCitizen = () => {
    setLoggedInCitizen(null);
    setIsCustomerLoggedIn(false);
    localStorage.removeItem("vims_customer_logged_in");
    localStorage.removeItem("vims_logged_in_citizen");
  };

  const handleToggleCustomerLogin = () => {
    if (isCustomerLoggedIn) {
      handleLogoutCitizen();
    } else {
      const defaultCitizen = {
        fullName: "Vũ Đức Giới",
        phone: "0912.345.678",
        cccd: "037096001234",
        birthDate: "1990-08-15",
        gender: "Nam",
        villageId: "v-kt-1",
        address: "Thôn Hải Anh, Xã Hải Anh"
      };
      handleLoginCitizen(defaultCitizen);
    }
  };

  const [activeTenantId, setActiveTenantId] = useState<string>(() => {
    const saved = localStorage.getItem("vims_active_tenant");
    if (saved === "ninh-binh-khanh-thien" || saved === "ninh-binh-hai-anh") {
      localStorage.setItem("vims_active_tenant", "hai-anh-ninh-binh");
      return "hai-anh-ninh-binh";
    }
    return saved || "hai-anh-ninh-binh";
  });

  const [activeVillageId, setActiveVillageId] = useState<string>(() => {
    const saved = localStorage.getItem("vims_active_village");
    return saved || "v-kt-1";
  });

  // Dark mode state
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("vims_theme");
    return (saved as "light" | "dark") || "light";
  });

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const [showPermissionsModal, setShowPermissionsModal] = useState(false);

  // 2. Local State for Administrative Database (with LocalStorage fallbacks for full sandbox simulation persistence)
  const [tenants, setTenants] = useState<WardTenant[]>(() => {
    const saved = localStorage.getItem("vims_db_tenants");
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migrate old tenant IDs to "hai-anh-ninh-binh"
      const migrated = parsed.map((t: any) => {
        let updated = { ...t };
        let changed = false;
        if (updated.id === "ninh-binh-khanh-thien" || updated.id === "ninh-binh-hai-anh") {
          updated.id = "hai-anh-ninh-binh";
          changed = true;
        }
        if (updated.id === "hai-anh-ninh-binh" && (updated.district === "Huyện Yên Khánh" || updated.address.includes("Huyện Yên Khánh"))) {
          updated.district = "";
          updated.address = "Xã Hải Anh, Tỉnh Ninh Bình";
          changed = true;
        }
        if (updated.id === "hai-anh-ninh-binh" && updated.email === "haianh.yenkhanh@ninhbinh.gov.vn") {
          updated.email = "xahaianh.nb@ninhbinh.gov.vn";
          changed = true;
        }
        if (changed) {
          return updated;
        }
        return t;
      });

      if (migrated.some((t: any) => t.id !== "hai-anh-ninh-binh")) {
        return SEEDED_TENANTS;
      }
      
      localStorage.setItem("vims_db_tenants", JSON.stringify(migrated));
      return migrated;
    }
    return SEEDED_TENANTS;
  });

  const [villages, setVillages] = useState<Village[]>(() => {
    const saved = localStorage.getItem("vims_db_villages");
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migrate wardId
      const migrated = parsed.map((v: any) => {
        if (v.wardId === "ninh-binh-khanh-thien" || v.wardId === "ninh-binh-hai-anh") {
          return { ...v, wardId: "hai-anh-ninh-binh" };
        }
        return v;
      });

      // If old mock data detected (e.g. fewer than 10 villages, or containing old "Thôn Tăng Phong")
      if (migrated.some((v: any) => v.wardId !== "hai-anh-ninh-binh" || v.name === "Thôn Tăng Phong") || migrated.length < 10) {
        localStorage.removeItem("vims_db_villages");
        localStorage.removeItem("vims_db_officials");
        localStorage.removeItem("vims_db_announcements");
        localStorage.removeItem("vims_db_reflections");
        return SEEDED_VILLAGES;
      }
      
      // Migrate "2024-11-01" to "22/6/2026" and fix broken Unsplash images seamlessly in-place to protect user edits from being lost
      let needMigration = false;
      const migratedDates = migrated.map((v: any) => {
        let updated = { ...v };
        if (updated.establishedDate === "2024-11-01") {
          updated.establishedDate = "22/6/2026";
          needMigration = true;
        }
        
        // Find corresponding seeded village to ensure images are perfectly synced if they are broken/old
        const seeded = SEEDED_VILLAGES.find((sv) => sv.id === v.id);
        if (seeded) {
          const isBrokenOrOld = !updated.imageUrl || 
            updated.imageUrl.includes("1500627869374") || 
            updated.imageUrl.includes("1528164344705") || 
            updated.imageUrl.includes("1500382017468") || 
            updated.imageUrl.includes("1501785888041");
          
          if (isBrokenOrOld) {
            updated.imageUrl = seeded.imageUrl;
            updated.bannerUrl = seeded.bannerUrl;
            needMigration = true;
          }
        }
        return updated;
      });
      localStorage.setItem("vims_db_villages", JSON.stringify(migratedDates));
      return migratedDates;
    }
    return SEEDED_VILLAGES;
  });

  const [officials, setOfficials] = useState<Official[]>(() => {
    const saved = localStorage.getItem("vims_db_officials");
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migrate wardId
      const migratedWard = parsed.map((o: any) => {
        if (o.wardId === "ninh-binh-khanh-thien" || o.wardId === "ninh-binh-hai-anh") {
          return { ...o, wardId: "hai-anh-ninh-binh" };
        }
        return o;
      });

      if (migratedWard.some((o: any) => o.wardId !== "hai-anh-ninh-binh") || !localStorage.getItem("vims_db_villages")) {
        return SEEDED_OFFICIALS;
      }
      
      // In-place database migration for Thôn 1, Thôn 2, Thôn 3, Thôn 4, Thôn 5, Thôn 6, Thôn 7, Thôn 8, Thôn 9, Thôn 10, Thôn 11, Thôn 12, Thôn 13, Thôn 14, Thôn 15, Thôn 16, Thôn 17, Thôn 18, Thôn 19, and Thôn 20 officials list
      // Checks and migrates Thôn 1, Thôn 2, Thôn 3, Thôn 4, Thôn 5, Thôn 6, Thôn 7, Thôn 8, Thôn 9, Thôn 10, Thôn 11, Thôn 12, Thôn 13, Thôn 14, Thôn 15, Thôn 16, Thôn 17, Thôn 18, Thôn 19, and Thôn 20 rosters while retaining other customized values.
      let migrated = [...parsed];
      let needSave = false;

      if (!migrated.some((o: any) => o.id === "o-kt-v1-7")) {
        migrated = [
          ...migrated.filter((o: any) => o.villageId !== "v-kt-1"),
          ...SEEDED_OFFICIALS.filter((o: any) => o.villageId === "v-kt-1")
        ];
        needSave = true;
      }

      if (!migrated.some((o: any) => o.id === "o-kt-v2-1")) {
        migrated = [
          ...migrated.filter((o: any) => o.villageId !== "v-kt-2"),
          ...SEEDED_OFFICIALS.filter((o: any) => o.villageId === "v-kt-2")
        ];
        needSave = true;
      }

      if (!migrated.some((o: any) => o.id === "o-kt-v3-1")) {
        migrated = [
          ...migrated.filter((o: any) => o.villageId !== "v-kt-3"),
          ...SEEDED_OFFICIALS.filter((o: any) => o.villageId === "v-kt-3")
        ];
        needSave = true;
      }

      if (!migrated.some((o: any) => o.id === "o-kt-v4-1")) {
        migrated = [
          ...migrated.filter((o: any) => o.villageId !== "v-kt-4"),
          ...SEEDED_OFFICIALS.filter((o: any) => o.villageId === "v-kt-4")
        ];
        needSave = true;
      }

      if (!migrated.some((o: any) => o.id === "o-kt-v5-1")) {
        migrated = [
          ...migrated.filter((o: any) => o.villageId !== "v-kt-5"),
          ...SEEDED_OFFICIALS.filter((o: any) => o.villageId === "v-kt-5")
        ];
        needSave = true;
      }

      if (!migrated.some((o: any) => o.id === "o-kt-v6-1")) {
        migrated = [
          ...migrated.filter((o: any) => o.villageId !== "v-kt-6"),
          ...SEEDED_OFFICIALS.filter((o: any) => o.villageId === "v-kt-6")
        ];
        needSave = true;
      }

      if (!migrated.some((o: any) => o.id === "o-kt-v7-1")) {
        migrated = [
          ...migrated.filter((o: any) => o.villageId !== "v-kt-7"),
          ...SEEDED_OFFICIALS.filter((o: any) => o.villageId === "v-kt-7")
        ];
        needSave = true;
      }

      if (!migrated.some((o: any) => o.id === "o-kt-v8-1")) {
        migrated = [
          ...migrated.filter((o: any) => o.villageId !== "v-kt-8"),
          ...SEEDED_OFFICIALS.filter((o: any) => o.villageId === "v-kt-8")
        ];
        needSave = true;
      }

      if (!migrated.some((o: any) => o.id === "o-kt-v9-1")) {
        migrated = [
          ...migrated.filter((o: any) => o.villageId !== "v-kt-9"),
          ...SEEDED_OFFICIALS.filter((o: any) => o.villageId === "v-kt-9")
        ];
        needSave = true;
      }

      if (!migrated.some((o: any) => o.id === "o-kt-v10-1")) {
        migrated = [
          ...migrated.filter((o: any) => o.villageId !== "v-kt-10"),
          ...SEEDED_OFFICIALS.filter((o: any) => o.villageId === "v-kt-10")
        ];
        needSave = true;
      }

      if (!migrated.some((o: any) => o.id === "o-kt-v11-1")) {
        migrated = [
          ...migrated.filter((o: any) => o.villageId !== "v-kt-11"),
          ...SEEDED_OFFICIALS.filter((o: any) => o.villageId === "v-kt-11")
        ];
        needSave = true;
      }

      if (!migrated.some((o: any) => o.id === "o-kt-v12-1")) {
        migrated = [
          ...migrated.filter((o: any) => o.villageId !== "v-kt-12"),
          ...SEEDED_OFFICIALS.filter((o: any) => o.villageId === "v-kt-12")
        ];
        needSave = true;
      }

      if (!migrated.some((o: any) => o.id === "o-kt-v13-1")) {
        migrated = [
          ...migrated.filter((o: any) => o.villageId !== "v-kt-13"),
          ...SEEDED_OFFICIALS.filter((o: any) => o.villageId === "v-kt-13")
        ];
        needSave = true;
      }

      if (!migrated.some((o: any) => o.id === "o-kt-v14-1")) {
        migrated = [
          ...migrated.filter((o: any) => o.villageId !== "v-kt-14"),
          ...SEEDED_OFFICIALS.filter((o: any) => o.villageId === "v-kt-14")
        ];
        needSave = true;
      }

      if (!migrated.some((o: any) => o.id === "o-kt-v15-1")) {
        migrated = [
          ...migrated.filter((o: any) => o.villageId !== "v-kt-15"),
          ...SEEDED_OFFICIALS.filter((o: any) => o.villageId === "v-kt-15")
        ];
        needSave = true;
      }

      if (!migrated.some((o: any) => o.id === "o-kt-v16-1")) {
        migrated = [
          ...migrated.filter((o: any) => o.villageId !== "v-kt-16"),
          ...SEEDED_OFFICIALS.filter((o: any) => o.villageId === "v-kt-16")
        ];
        needSave = true;
      }

      if (!migrated.some((o: any) => o.id === "o-kt-v17-1")) {
        migrated = [
          ...migrated.filter((o: any) => o.villageId !== "v-kt-17"),
          ...SEEDED_OFFICIALS.filter((o: any) => o.villageId === "v-kt-17")
        ];
        needSave = true;
      }

      if (!migrated.some((o: any) => o.id === "o-kt-v18-1")) {
        migrated = [
          ...migrated.filter((o: any) => o.villageId !== "v-kt-18"),
          ...SEEDED_OFFICIALS.filter((o: any) => o.villageId === "v-kt-18")
        ];
        needSave = true;
      }

      if (!migrated.some((o: any) => o.id === "o-kt-v19-1")) {
        migrated = [
          ...migrated.filter((o: any) => o.villageId !== "v-kt-19"),
          ...SEEDED_OFFICIALS.filter((o: any) => o.villageId === "v-kt-19")
        ];
        needSave = true;
      }

      if (!migrated.some((o: any) => o.id === "o-kt-v20-1")) {
        migrated = [
          ...migrated.filter((o: any) => o.villageId !== "v-kt-20"),
          ...SEEDED_OFFICIALS.filter((o: any) => o.villageId === "v-kt-20")
        ];
        needSave = true;
      }

      if (needSave) {
        localStorage.setItem("vims_db_officials", JSON.stringify(migrated));
        return migrated;
      }
      
      return parsed;
    }
    return SEEDED_OFFICIALS;
  });

  const [offices, setOffices] = useState<AdministrativeOffice[]>(() => {
    const saved = localStorage.getItem("vims_db_offices");
    if (saved) {
      const parsed = JSON.parse(saved);
      const migrated = parsed.map((of: any) => {
        if (of.wardId === "ninh-binh-khanh-thien" || of.wardId === "ninh-binh-hai-anh") {
          return { ...of, wardId: "hai-anh-ninh-binh" };
        }
        return of;
      });
      if (migrated.some((of: any) => of.wardId !== "hai-anh-ninh-binh")) {
        return SEEDED_OFFICES;
      }
      return migrated;
    }
    return SEEDED_OFFICES;
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem("vims_db_announcements");
    if (saved) {
      const parsed = JSON.parse(saved);
      const migrated = parsed.map((ann: any) => {
        if (ann.wardId === "ninh-binh-khanh-thien" || ann.wardId === "ninh-binh-hai-anh") {
          return { ...ann, wardId: "hai-anh-ninh-binh" };
        }
        return ann;
      });
      if (migrated.some((ann: any) => ann.wardId !== "hai-anh-ninh-binh") || !localStorage.getItem("vims_db_villages")) {
        return SEEDED_ANNOUNCEMENTS;
      }
      return migrated;
    }
    return SEEDED_ANNOUNCEMENTS;
  });

  const [reflections, setReflections] = useState<FieldReflection[]>(() => {
    const saved = localStorage.getItem("vims_db_reflections");
    if (saved) {
      const parsed = JSON.parse(saved);
      const migrated = parsed.map((ref: any) => {
        if (ref.wardId === "ninh-binh-khanh-thien" || ref.wardId === "ninh-binh-hai-anh") {
          return { ...ref, wardId: "hai-anh-ninh-binh" };
        }
        return ref;
      });
      if (migrated.some((ref: any) => ref.wardId !== "hai-anh-ninh-binh") || !localStorage.getItem("vims_db_villages")) {
        return SEEDED_REFLECTIONS;
      }
      return migrated;
    }
    return SEEDED_REFLECTIONS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem("vims_db_audit_logs");
    return saved ? JSON.parse(saved) : [];
  });

  // Persist structural boundaries whenever databases modify
  useEffect(() => {
    localStorage.setItem("vims_role", role);
    localStorage.setItem("vims_active_tenant", activeTenantId);
    localStorage.setItem("vims_active_village", activeVillageId);
    localStorage.setItem("vims_theme", theme);
    localStorage.setItem("vims_db_tenants", JSON.stringify(tenants));
    localStorage.setItem("vims_db_villages", JSON.stringify(villages));
    localStorage.setItem("vims_db_officials", JSON.stringify(officials));
    localStorage.setItem("vims_db_offices", JSON.stringify(offices));
    localStorage.setItem("vims_db_announcements", JSON.stringify(announcements));
    localStorage.setItem("vims_db_reflections", JSON.stringify(reflections));
    localStorage.setItem("vims_db_audit_logs", JSON.stringify(auditLogs));
    localStorage.setItem("vims_db_registrations", JSON.stringify(registrations));
    localStorage.setItem("vims_logged_in_official", loggedInOfficial ? JSON.stringify(loggedInOfficial) : "");
  }, [role, activeTenantId, activeVillageId, theme, tenants, villages, officials, offices, announcements, reflections, auditLogs, registrations, loggedInOfficial]);

  // Determine active WardTenant meta
  const activeTenant = useMemo(() => {
    return tenants.find(t => t.id === activeTenantId) || tenants[0];
  }, [tenants, activeTenantId]);

  // Handle active village simulation pointer sync when changing active tenant
  useEffect(() => {
    const firstVillageOfTenant = villages.find(v => v.wardId === activeTenantId);
    if (firstVillageOfTenant) {
      setActiveVillageId(firstVillageOfTenant.id);
    }
  }, [activeTenantId, villages]);

  // Audit trail helper
  const handleLogAudit = (action: string, details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString("vi-VN"),
      userId: role === UserRole.SUPER_ADMIN ? "SUPER_ADMIN" : "OFFICIAL",
      userRole: role,
      action,
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // State Mutators passed to child views
  // Tenant adjustments (Super Admin scope)
  const handleAddTenant = (t: WardTenant) => {
    setTenants(prev => [...prev, t]);
    handleLogAudit("SÁP NHẬP ĐỊA BÀN MỚI", `Khởi tạo hệ thống SaaS cho xã: ${t.name}, thuộc ${t.province}`);
  };

  const handleUpdateTenant = (t: WardTenant) => {
    setTenants(prev => prev.map(item => item.id === t.id ? t : item));
    handleLogAudit("SỬA THÔNG TIN ĐỊA BÀN", `Cập nhật tham số cấu hình chính quyền ${t.name}`);
  };

  // Village adjustments
  const handleAddVillage = (v: Village) => {
    setVillages(prev => [...prev, v]);
  };

  const handleUpdateVillage = (v: Village) => {
    setVillages(prev => prev.map(item => item.id === v.id ? v : item));
  };

  const handleDeleteVillage = (id: string) => {
    setVillages(prev => prev.filter(item => item.id !== id));
    // Clear associated officials or reassign
    setOfficials(prev => prev.filter(item => item.villageId !== id));
  };

  // Officials adjustments
  const handleAddOfficial = (o: Official) => {
    setOfficials(prev => [...prev, o]);
  };

  const handleUpdateOfficial = (o: Official) => {
    setOfficials(prev => prev.map(item => item.id === o.id ? o : item));
  };

  const handleDeleteOfficial = (id: string) => {
    setOfficials(prev => prev.filter(item => item.id !== id));
  };

  // Office adjustments
  const handleAddOffice = (of: AdministrativeOffice) => {
    setOffices(prev => [...prev, of]);
  };

  const handleUpdateOffice = (of: AdministrativeOffice) => {
    setOffices(prev => prev.map(item => item.id === of.id ? of : item));
  };

  const handleDeleteOffice = (id: string) => {
    setOffices(prev => prev.filter(item => item.id !== id));
  };

  // Announcement adjustments
  const handleAddAnnouncement = (ann: Announcement) => {
    setAnnouncements(prev => [ann, ...prev]);
  };

  const handleUpdateAnnouncement = (ann: Announcement) => {
    setAnnouncements(prev => prev.map(item => item.id === ann.id ? ann : item));
  };

  // Citizen reflections submissions
  const handleSubmitReflection = (ref: Omit<FieldReflection, "id" | "createdAt" | "status">) => {
    const newRef: FieldReflection = {
      ...ref,
      id: `ref-${Date.now()}`,
      status: "PENDING",
      createdAt: new Date().toISOString()
    };
    setReflections(prev => [newRef, ...prev]);
    handleLogAudit("GỬI PHẢN ÁNH", `Công dân ${ref.citizenName} gửi phản ánh về tiêu đề: ${ref.title}`);
  };

  const handleResolveReflection = (id: string, status: "RESOLVED" | "REJECTED") => {
    setReflections(prev => prev.map(item => item.id === id ? { ...item, status } : item));
  };

  // Export entire database as JSON file for manual backup
  const handleExportDatabase = () => {
    const dataStr = JSON.stringify({
      version: "vims-1.0",
      tenants,
      villages,
      officials,
      offices,
      announcements,
      reflections,
      auditLogs
    }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `vims_backup_${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    handleLogAudit("SAO LƯU DỮ LIỆU", `Sao lưu toàn bộ dữ liệu ra tệp: ${exportFileDefaultName}`);
  };

  // Import and restore entire database from JSON file
  const handleImportDatabase = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && parsed.villages && parsed.tenants) {
            setTenants(parsed.tenants);
            setVillages(parsed.villages);
            setOfficials(parsed.officials || []);
            setOffices(parsed.offices || []);
            setAnnouncements(parsed.announcements || []);
            setReflections(parsed.reflections || []);
            setAuditLogs(parsed.auditLogs || []);
            
            // Save to local storage right away to ensure persistence
            localStorage.setItem("vims_db_tenants", JSON.stringify(parsed.tenants));
            localStorage.setItem("vims_db_villages", JSON.stringify(parsed.villages));
            localStorage.setItem("vims_db_officials", JSON.stringify(parsed.officials || []));
            localStorage.setItem("vims_db_offices", JSON.stringify(parsed.offices || []));
            localStorage.setItem("vims_db_announcements", JSON.stringify(parsed.announcements || []));
            localStorage.setItem("vims_db_reflections", JSON.stringify(parsed.reflections || []));
            localStorage.setItem("vims_db_audit_logs", JSON.stringify(parsed.auditLogs || []));

            alert("Khôi phục dữ liệu thành công! Hệ thống sẽ tự động tải lại trang.");
            window.location.reload();
          } else {
            alert("Định dạng tệp sao lưu không hợp lệ. Vui lòng chọn tệp tin JSON được xuất từ hệ thống.");
          }
        } catch (error) {
          alert("Lỗi khi đọc tệp dữ liệu: " + (error instanceof Error ? error.message : "Định dạng không hợp lệ"));
        }
      };
    }
  };

  // Reset demo back to seeded values
  const handleResetDatabase = () => {
    if (confirm("Bạn có chắc chắn muốn cài đặt lại toàn bộ cơ sở dữ liệu mẫu ban đầu? Mọi chỉnh sửa của bạn sẽ bị xóa.")) {
      localStorage.removeItem("vims_db_tenants");
      localStorage.removeItem("vims_db_villages");
      localStorage.removeItem("vims_db_officials");
      localStorage.removeItem("vims_db_offices");
      localStorage.removeItem("vims_db_announcements");
      localStorage.removeItem("vims_db_reflections");
      localStorage.removeItem("vims_db_audit_logs");
      
      setTenants(SEEDED_TENANTS);
      setVillages(SEEDED_VILLAGES);
      setOfficials(SEEDED_OFFICIALS);
      setOffices(SEEDED_OFFICES);
      setAnnouncements(SEEDED_ANNOUNCEMENTS);
      setReflections(SEEDED_REFLECTIONS);
      setAuditLogs([]);
      
      handleLogAudit("RESET DATABASE", "Khôi phục dữ liệu hệ thống sáp nhập về mặc định");
      window.location.reload();
    }
  };

  // Dark mode inline stylesheet sync
  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  const isAuthorized = useMemo(() => {
    return loggedInOfficial !== null && loggedInOfficial.proposedRole === role && loggedInOfficial.status === "ACTIVE";
  }, [loggedInOfficial, role]);

  return (
    <div className={`min-h-screen transition-all duration-150 ${theme === "dark" ? "dark bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-800"}`}>
      
      {/* SaaS Global top helper utility rail */}
      <div className="bg-slate-950 text-slate-400 text-[10px] px-4 py-2 border-b border-slate-900 flex justify-between items-center font-mono font-semibold">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2 text-indigo-400">
            <Clock className="w-3.5 h-3.5 animate-pulse text-indigo-400" />
            <span className="text-slate-300 font-sans text-xs tracking-wide">
              {formatVietnameseDate(currentTime)}
            </span>
          </span>
          <span className="text-slate-700 font-normal">|</span>
          <span className="flex items-center gap-2 text-amber-400">
            <CloudSun className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-300 font-sans text-xs tracking-wide flex items-center gap-1.5">
              <span>Ninh Bình:</span>
              <span className="font-bold text-white font-mono">{weather ? `${weather.temp}°C` : "29°C"}</span>
              <span className="text-slate-400 text-[11px]">({weather ? weather.desc : "Trời quang mây"})</span>
            </span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme switcher */}
          <button 
            onClick={toggleTheme}
            className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
            title={theme === "light" ? "Bật Dark Mode" : "Bật Light Mode"}
            id="theme-toggle-btn"
          >
            {theme === "light" ? (
              <>
                <Moon className="w-3 h-3 text-indigo-400" /> Dark Mode
              </>
            ) : (
              <>
                <Sun className="w-3 h-3 text-amber-400" /> Light Mode
              </>
            )}
          </button>

          {loggedInOfficial && (
            <>
              <span>|</span>
              <div className="flex items-center gap-2 text-[10px] text-indigo-300 font-extrabold tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>CÁN BỘ: <span className="text-white">{loggedInOfficial.fullName.toUpperCase()}</span> ({loggedInOfficial.proposedRole})</span>
                <button 
                  onClick={() => { setLoggedInOfficial(null); setRole(UserRole.CUSTOMER); }} 
                  className="text-rose-400 hover:text-rose-300 font-extrabold flex items-center gap-0.5 hover:underline cursor-pointer ml-1 bg-rose-950/20 px-1.5 py-0.5 rounded border border-rose-900/40"
                >
                  <LogOut className="w-2.5 h-2.5" /> Đăng xuất
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Persistent Multi-Role Toggle Deck */}
      <RoleSwitcher
        currentRole={role}
        onChangeRole={setRole}
        activeTenant={activeTenant}
        activeVillageId={activeVillageId}
        onChangeActiveVillageId={setActiveVillageId}
        villages={villages}
        isCustomerLoggedIn={isCustomerLoggedIn}
        onToggleCustomerLogin={handleToggleCustomerLogin}
        loggedInOfficial={loggedInOfficial}
        loggedInCitizen={loggedInCitizen}
        onLoginCitizen={handleLoginCitizen}
        onLogoutCitizen={handleLogoutCitizen}
        showAuthModal={showCitizenAuthModal}
        setShowAuthModal={setShowCitizenAuthModal}
        authTab={citizenAuthTab}
        setAuthTab={setCitizenAuthTab}
      />

      {/* Main Dynamic View Coordinates */}
      <div>
        {role === UserRole.CUSTOMER && (
          <CitizenView
            activeTenant={activeTenant}
            villages={villages}
            officials={officials}
            offices={offices}
            announcements={announcements}
            reflections={reflections}
            onSubmitReflection={handleSubmitReflection}
            isCustomerLoggedIn={isCustomerLoggedIn}
            onToggleCustomerLogin={handleToggleCustomerLogin}
            loggedInCitizen={loggedInCitizen}
            onLoginCitizen={handleLoginCitizen}
            onLogoutCitizen={handleLogoutCitizen}
            onOpenCitizenAuth={handleOpenCitizenAuth}
          />
        )}

        {role !== UserRole.CUSTOMER && !isAuthorized ? (
          <OfficialAuthPortal
            villages={villages}
            registrations={registrations}
            onRegister={(newReg) => setRegistrations(prev => [newReg, ...prev])}
            onLogin={(account) => setLoggedInOfficial(account)}
            loggedInOfficial={loggedInOfficial}
            onLogout={() => { setLoggedInOfficial(null); setRole(UserRole.CUSTOMER); }}
            activeRole={role}
            onChangeRole={setRole}
            onOpenCitizenAuth={handleOpenCitizenAuth}
          />
        ) : (
          <>
            {role === UserRole.STAFF && (
               <VillageOfficialView
                 activeTenant={activeTenant}
                 activeVillageId={activeVillageId}
                 villages={villages}
                 officials={officials}
                 announcements={announcements}
                 reflections={reflections}
                 onUpdateVillage={handleUpdateVillage}
                 onAddAnnouncement={handleAddAnnouncement}
                 onUpdateAnnouncement={handleUpdateAnnouncement}
                 onUpdateOfficial={handleUpdateOfficial}
                 onAddOfficial={handleAddOfficial}
                 onResolveReflection={handleResolveReflection}
                 onLogAudit={handleLogAudit}
                 loggedInOfficial={loggedInOfficial || undefined}
                 onLogout={() => { setLoggedInOfficial(null); setRole(UserRole.CUSTOMER); }}
                 onExportDatabase={handleExportDatabase}
                 onShowPermissions={() => setShowPermissionsModal(true)}
               />
            )}

            {(role === UserRole.ADMIN || role === UserRole.MANAGER) && (
               <CommuneOfficialView
                 currentRole={role}
                 activeTenant={activeTenant}
                 villages={villages}
                 officials={officials}
                 offices={offices}
                 announcements={announcements}
                 reflections={reflections}
                 auditLogs={auditLogs}
                 registrations={registrations}
                 onAddVillage={handleAddVillage}
                 onUpdateVillage={handleUpdateVillage}
                 onDeleteVillage={handleDeleteVillage}
                 onAddOfficial={handleAddOfficial}
                 onUpdateOfficial={handleUpdateOfficial}
                 onDeleteOfficial={handleDeleteOfficial}
                 onAddOffice={handleAddOffice}
                 onUpdateOffice={handleUpdateOffice}
                 onDeleteOffice={handleDeleteOffice}
                 onAddAnnouncement={handleAddAnnouncement}
                 onUpdateAnnouncement={handleUpdateAnnouncement}
                 onResolveReflection={handleResolveReflection}
                 onUpdateRegistration={(reg) => setRegistrations(prev => prev.map(item => item.id === reg.id ? reg : item))}
                 onUpdateTenant={handleUpdateTenant}
                 onLogAudit={handleLogAudit}
                 loggedInOfficial={loggedInOfficial || undefined}
                 onLogout={() => { setLoggedInOfficial(null); setRole(UserRole.CUSTOMER); }}
                 onExportDatabase={handleExportDatabase}
                 onShowPermissions={() => setShowPermissionsModal(true)}
               />
            )}

            {role === UserRole.SUPER_ADMIN && (
               <SuperAdminView
                 tenants={tenants}
                 activeTenantId={activeTenantId}
                 onSelectTenant={setActiveTenantId}
                 onUpdateTenant={handleUpdateTenant}
                 onAddTenant={handleAddTenant}
                 villages={villages}
                 officials={officials}
                 loggedInOfficial={loggedInOfficial || undefined}
                 onLogout={() => { setLoggedInOfficial(null); setRole(UserRole.CUSTOMER); }}
                 onExportDatabase={handleExportDatabase}
                 onShowPermissions={() => setShowPermissionsModal(true)}
               />
            )}
          </>
        )}
      </div>

      {/* Permissions matrix modal layer */}
      <PermissionsModal
        isOpen={showPermissionsModal}
        onClose={() => setShowPermissionsModal(false)}
        currentRole={role}
      />

      {/* Professional Polish Footer */}
      <footer className="h-10 bg-slate-900 text-slate-400 text-[10px] flex flex-col sm:flex-row items-center justify-between px-6 border-t border-slate-800/80 gap-2 py-2 sm:py-0 shrink-0 font-mono">
        <div className="flex items-center gap-3 uppercase font-medium tracking-widest">
          <span>Village Information Management System v2.4.1</span>
          <span className="text-slate-700 hidden sm:inline">|</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Đang kết nối Real-time</span>
        </div>
        <div className="text-center sm:text-right text-slate-500 font-sans">
          © 2026 Village Information Management System — Thiết kế bởi Vũ Đức Giới
        </div>
      </footer>

    </div>
  );
}
