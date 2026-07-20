/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  STAFF = "STAFF",
  CUSTOMER = "CUSTOMER"
}

export interface UserAccount {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  status: "ACTIVE" | "LOCKED";
  villageId?: string; // assigned village scope for Staff
  createdAt: string;
}

export interface OfficialRegistration {
  id: string;
  fullName: string;
  birthDate: string;
  gender: "Nam" | "Nữ";
  cccd: string;
  cccdIssueDate: string;
  cccdIssuePlace: string;
  phone: string;
  email: string;
  villageId: string;
  proposedRole: UserRole;
  status: "PENDING" | "ACTIVE" | "ADDITIONAL_REQUIRED" | "REJECTED";
  rejectionReason?: string;
  additionalInfoRequired?: string;
  frontCccdUrl: string;
  backCccdUrl: string;
  portraitUrl: string;
  termsAccepted: boolean;
  createdAt: string;
  approvedBy?: string;
  feedbackSMS?: string;
  feedbackEmail?: string;
}

export interface SystemSettings {
  systemName: string;
  logoUrl: string;
  bannerUrl: string;
  smtpServer: string;
  smsProvider: string;
  zaloOaKey: string;
  googleMapsApiKey: string;
  activeMenus: {
    dashboard: boolean;
    villages: boolean;
    officials: boolean;
    offices: boolean;
    announcements: boolean;
    reflections: boolean;
    logs: boolean;
    settings: boolean;
  };
}

export interface WardTenant {
  id: string;
  name: string;
  district: string;
  province: string;
  address: string;
  logo: string;
  banner: string;
  introduction: string;
  phone: string;
  email: string;
  naturalArea?: number;
}

export interface Village {
  id: string;
  wardId: string;
  name: string;
  formerNames: string; // Thôn cũ trước sáp nhập
  establishedDate: string;
  householdCount: number;
  population: number;
  area: number; // Diện tích (ha)
  hasCultureHouse: boolean;
  cultureHouseAddress: string;
  latitude: number;
  longitude: number;
  googleMapUrl: string;
  imageUrl: string;
  bannerUrl: string;
  introduction: string;
  mapIframe?: string;
  status?: "DRAFT" | "PENDING" | "APPROVED" | "PUBLISHED" | "REJECTED";
  createdBy?: string;
}

export interface Official {
  id: string;
  wardId: string;
  villageId: string | "COMMUNE"; // "COMMUNE" means works at the commune level (UBND, etc.)
  name: string;
  birthDate: string;
  gender: "Nam" | "Nữ";
  phone: string;
  email: string;
  avatar: string;
  position: string; // Chức vụ (Bí thư, Trưởng thôn, Chủ tịch UBND, Công an xã,...)
  address: string;
  formerVillage?: string; // Đơn vị thôn cũ
  education?: string; // Trình độ văn hóa (ví dụ: 10/10, 12/12)
  specialization?: string; // Chuyên môn (ví dụ: TC, CĐ, ĐH)
  politicalTheory?: string; // Lý luận chính trị (ví dụ: SC, TC, CC)
  isPartyMember?: boolean; // Đảng viên (true/false)
  notes?: string; // Ghi chú
  status?: "DRAFT" | "PENDING" | "APPROVED" | "PUBLISHED" | "REJECTED";
  createdBy?: string;
}

export interface AdministrativeOffice {
  id: string;
  wardId: string;
  name: string; // UBND, Đảng ủy, Công an, Quân sự, Trạm y tế, Trường học
  address: string;
  latitude: number;
  longitude: number;
  googleMapUrl: string;
  description: string;
  imageUrl: string;
  phone: string;
}

export interface Announcement {
  id: string;
  wardId: string;
  villageId: string | "ALL"; // Specific village or global
  title: string;
  content: string;
  publishedDate: string;
  author: string;
  category: "Thông báo" | "Tin tức" | "Văn bản pháp lý";
  status?: "DRAFT" | "PENDING" | "APPROVED" | "PUBLISHED" | "REJECTED";
  createdBy?: string;
}

export interface FieldReflection {
  id: string;
  wardId: string;
  villageId: string;
  citizenName: string;
  citizenPhone: string;
  title: string;
  content: string;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
  status: "PENDING" | "RESOLVED" | "REJECTED";
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userRole: string;
  action: string;
  details: string;
}
