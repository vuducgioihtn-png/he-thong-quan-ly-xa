/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { UserRole } from "../types";
import { SIMULATED_PERSONAS } from "./RoleSwitcher";
import { CheckSquare, XCircle, MapPin, X, Shield, ShieldAlert, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface PermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
}

export default function PermissionsModal({ isOpen, onClose, currentRole }: PermissionsModalProps) {
  const activePersona = SIMULATED_PERSONAS[currentRole];

  if (!activePersona) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/65 backdrop-blur-xs cursor-pointer"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative bg-white dark:bg-slate-950 rounded-2xl shadow-2xl border border-indigo-100 dark:border-slate-850 max-w-4xl w-full p-6 sm:p-8 space-y-6 overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            {/* Header / Title bar */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/50 rounded-lg">
                  <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                    Chi tiết Ma trận Phân quyền & Vai trò
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Tra cứu chức năng, quyền hạn và giới hạn thao tác của tài khoản hiện tại.
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg transition-colors cursor-pointer"
                title="Đóng cửa sổ"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated User Persona Badge (Enterprise Detail Panel - matching user second screenshot) */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-blue-150 dark:border-indigo-950/50 transition-all duration-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <img
                    src={activePersona.avatar}
                    alt={activePersona.name}
                    className="w-14 h-14 rounded-full border-2 border-white dark:border-slate-800 object-cover shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                  <span className={`absolute -bottom-1 -right-1 text-[9px] px-1.5 py-0.5 rounded-md font-extrabold uppercase shadow border ${activePersona.badgeColor}`}>
                    {activePersona.role}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-extrabold text-base text-slate-900 dark:text-white">{activePersona.name}</h4>
                    <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/50 dark:border-indigo-900/30 px-2 py-0.5 rounded-full font-bold text-indigo-700 dark:text-indigo-400">
                      {activePersona.title}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>Phạm vi: <strong>{activePersona.scope}</strong></span>
                  </p>
                </div>
              </div>

              {/* Context Options Block based on active simulated role */}
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto md:border-l md:border-slate-200 md:dark:border-slate-800 md:pl-5">
                <div className="text-xs text-slate-700 dark:text-slate-300 bg-indigo-50/55 dark:bg-slate-950/40 px-4 py-3 rounded-xl border border-indigo-100/60 dark:border-indigo-950/50 max-w-sm flex items-start gap-2 shadow-xs">
                  <CheckSquare className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Hệ thống Phê duyệt:</strong> Mọi cập nhật từ <strong>Staff</strong> sẽ ở dạng <strong>Dự thảo (Draft)</strong> cần bạn duyệt để xuất bản (Public) tới người dân.
                  </span>
                </div>
              </div>
            </div>

            {/* Info Grid (Allowed vs Restrictions - matching user second screenshot) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Allowed column */}
              <div className="space-y-3 bg-emerald-50/20 dark:bg-emerald-950/5 p-5 rounded-2xl border border-emerald-100/50 dark:border-emerald-950/30">
                <span className="font-extrabold text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <CheckSquare className="w-4 h-4" /> Quyền hạn (Allowed)
                </span>
                <ul className="space-y-2.5 text-slate-700 dark:text-slate-300 ml-1">
                  {activePersona.capabilities.map((cap, i) => (
                    <li key={i} className="text-xs flex items-start gap-2 leading-relaxed">
                      <span className="text-emerald-500 font-extrabold mt-0.5 shrink-0">•</span>
                      <span>{cap}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Restrictions column */}
              <div className="space-y-3 bg-rose-50/15 dark:bg-rose-950/5 p-5 rounded-2xl border border-rose-100/30 dark:border-rose-950/20">
                <span className="font-extrabold text-xs text-rose-500 dark:text-rose-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <XCircle className="w-4 h-4" /> Giới hạn / Cấm (Restrictions)
                </span>
                <ul className="space-y-2.5 text-slate-700 dark:text-slate-300 ml-1">
                  {activePersona.restrictions.map((res, i) => (
                    <li key={i} className="text-xs flex items-start gap-2 leading-relaxed text-rose-600 dark:text-rose-400 font-medium">
                      <span className="text-rose-400 font-extrabold mt-0.5 shrink-0">•</span>
                      <span>{res}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Footer banner */}
            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-3.5 border border-slate-100 dark:border-slate-850 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Dữ liệu mô phỏng theo cơ chế RBAC phân rã nghiệp vụ của Xã Hải Anh.
              </span>
              <button
                onClick={onClose}
                className="px-4 py-1.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-extrabold rounded-lg transition-colors cursor-pointer"
              >
                Đóng lại
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
