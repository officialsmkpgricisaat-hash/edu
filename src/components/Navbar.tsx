import React from 'react';
import { User, Setting } from '../types';
import { LogOut, GraduationCap, Code2, Database, ShieldCheck, UserCheck } from 'lucide-react';

interface NavbarProps {
  user: User;
  setting: Setting;
  onLogout: () => void;
  onOpenCodeModal: () => void;
  onRunDatabaseSetup: () => void;
  activeRole: string;
  onChangeRolePreview: (newRole: any) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  setting,
  onLogout,
  onOpenCodeModal,
  onRunDatabaseSetup,
  activeRole,
  onChangeRolePreview,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Left Brand Info */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-800 leading-tight">
                {setting.namaSekolah}
              </h1>
              <p className="text-xs font-medium text-slate-500">
                EduAdmin Portal • TP {setting.tahunPelajaran} ({setting.semesterAktif})
              </p>
            </div>
          </div>

          {/* Right Tools & Profile */}
          <div className="flex items-center space-x-3">
            {/* Quick Role Switcher Preview dropdown for testing all 5 roles */}
            <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <span className="px-2 font-semibold text-slate-500 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-indigo-600" /> Switch Role:
              </span>
              <select
                value={activeRole}
                onChange={e => onChangeRolePreview(e.target.value)}
                className="bg-white font-bold text-slate-800 rounded-lg px-2 py-1 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="ADMIN">ADMINISTRATOR</option>
                <option value="KEPALA_SEKOLAH">KEPALA SEKOLAH</option>
                <option value="GURU">GURU</option>
                <option value="WALI_KELAS">WALI KELAS</option>
                <option value="SISWA">SISWA</option>
              </select>
            </div>

            {/* Database Setup Button */}
            <button
              onClick={onRunDatabaseSetup}
              title="Inisialisasi Database Spreadsheet"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
            >
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Setup Spreadsheet DB</span>
            </button>

            {/* Gas Code Modal View */}
            <button
              onClick={onOpenCodeModal}
              title="Lihat & Salin Kode Google Apps Script (Kode.gs & Index.html)"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors"
            >
              <Code2 className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Kode.gs & Index.html</span>
            </button>

            {/* User Profile Badge */}
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs border border-indigo-200">
                {user.nama.charAt(0)}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-bold text-slate-800 line-clamp-1">{user.nama}</div>
                <div className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider">
                  {user.role}
                </div>
              </div>
              <button
                onClick={onLogout}
                title="Keluar Sistem"
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
