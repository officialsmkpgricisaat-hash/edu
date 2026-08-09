import React from 'react';
import { User, Role } from '../types';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  ClipboardCheck,
  Award,
  AlertTriangle,
  FileText,
  Settings,
  LogOut,
  ChevronRight,
  ShieldAlert,
  UserCheck,
  FolderOpen,
  CreditCard,
  NotebookPen,
  FileCheck2,
  MapPin,
  QrCode,
  Printer,
} from 'lucide-react';

interface SidebarProps {
  user: User;
  activeMenu: string;
  onSelectMenu: (menu: string) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  activeMenu,
  onSelectMenu,
  onLogout,
}) => {
  const isKepalaSekolah = user.role === 'KEPALA_SEKOLAH';

  // Menu items based on Role
  const getMenuItems = () => {
    switch (user.role) {
      case 'KEPALA_SEKOLAH':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'monitoring_guru', label: 'Monitoring Guru', icon: Users },
          { id: 'monitoring_siswa', label: 'Monitoring Siswa & Kelas', icon: GraduationCap },
          { id: 'monitoring_kehadiran', label: 'Monitoring Kehadiran', icon: ClipboardCheck },
          { id: 'monitoring_nilai', label: 'Monitoring Nilai', icon: Award },
          { id: 'monitoring_jurnal', label: 'Jurnal Mengajar Guru', icon: NotebookPen },
          { id: 'monitoring_walikelas', label: 'Jurnal & Catatan Wali', icon: UserCheck },
          { id: 'prestasi_pelanggaran', label: 'Prestasi & Kedisiplinan', icon: AlertTriangle },
          { id: 'siswa_perhatian', label: 'Siswa Perlu Perhatian', icon: ShieldAlert },
          { id: 'laporan_sekolah', label: 'Laporan Sekolah', icon: FileText },
        ];
      case 'ADMIN':
        return [
          { id: 'dashboard', label: 'Dashboard Admin', icon: LayoutDashboard },
          { id: 'kelola_guru', label: 'Kelola Data Guru', icon: Users },
          { id: 'kelola_siswa', label: 'Kelola Data Siswa', icon: GraduationCap },
          { id: 'kelola_kelas', label: 'Kelola Data Kelas', icon: FolderOpen },
          { id: 'kelola_mapel', label: 'Kelola Mata Pelajaran', icon: BookOpen },
          { id: 'kelola_jadwal', label: 'Kelola Jadwal Pelajaran', icon: Calendar },
          { id: 'pengaturan_user', label: 'Pengaturan User & Role', icon: UserCheck },
          { id: 'pengaturan_sekolah', label: 'Pengaturan Sekolah', icon: Settings },
        ];
      case 'GURU':
        return [
          { id: 'dashboard', label: 'Dashboard Guru', icon: LayoutDashboard },
          { id: 'presensi_guru_barcode', label: 'Presensi Barcode Guru (GPS)', icon: MapPin },
          { id: 'jadwal_mengajar', label: 'Jadwal Mengajar', icon: Calendar },
          { id: 'presensi_siswa', label: 'Presensi Siswa', icon: ClipboardCheck },
          { id: 'guru_piket', label: 'Guru Piket / Inval', icon: UserCheck },
          { id: 'manajemen_nilai', label: 'Manajemen Nilai', icon: Award },
          { id: 'materi_tugas', label: 'Materi & Tugas', icon: BookOpen },
          { id: 'jurnal_mengajar', label: 'Jurnal Mengajar', icon: NotebookPen },
          { id: 'bimbingan_wali', label: 'Bimbingan Siswa', icon: FileCheck2 },
          { id: 'prestasi_pelanggaran', label: 'Prestasi & Pelanggaran', icon: AlertTriangle },
        ];
      case 'WALI_KELAS':
        return [
          { id: 'dashboard', label: 'Dashboard Wali Kelas', icon: LayoutDashboard },
          { id: 'data_siswa_kelas', label: 'Data Siswa Kelas', icon: GraduationCap },
          { id: 'presensi_rekap_kelas', label: 'Presensi & Rekap Kehadiran', icon: ClipboardCheck },
          { id: 'kartu_siswa', label: 'Kartu Presensi Barcode Siswa', icon: CreditCard },
          { id: 'nilai_siswa_kelas', label: 'Nilai Siswa Kelas', icon: Award },
          { id: 'catatan_jurnal_wali', label: 'Catatan & Jurnal Wali', icon: NotebookPen },
          { id: 'prestasi_pelanggaran', label: 'Prestasi & Pelanggaran', icon: AlertTriangle },
          { id: 'laporan_kelas', label: 'Laporan Kelas', icon: FileText },
        ];
      case 'SISWA':
        return [
          { id: 'dashboard', label: 'Dashboard Saya', icon: LayoutDashboard },
          { id: 'kartu_barcode_siswa', label: 'Kartu Presensi Barcode', icon: CreditCard },
          { id: 'materi_tugas_saya', label: 'Materi & Tugas Saya', icon: BookOpen },
          { id: 'kehadiran_saya', label: 'Kehadiran Saya', icon: ClipboardCheck },
          { id: 'nilai_saya', label: 'Nilai & Rapor Saya', icon: Award },
          { id: 'cetak_rapor_saya', label: 'Cetak Rapor Akhir (PDF)', icon: Printer },
          { id: 'prestasi_pelanggaran_saya', label: 'Prestasi & Poin Disiplin', icon: AlertTriangle },
          { id: 'catatan_bimbingan_saya', label: 'Catatan Bimbingan', icon: FileCheck2 },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <aside className="w-64 min-h-[calc(100vh-4rem)] flex-shrink-0 bg-[#0f172a] text-slate-300 transition-all duration-200 flex flex-col print:hidden">
      <div className="p-4 flex flex-col h-full">
        {/* Profile Header Box in Sidebar */}
        <div className="p-3.5 rounded-xl mb-5 flex items-center space-x-3 bg-slate-800/60 border border-slate-700/50">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-xs flex-shrink-0">
            {user.nama.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <h2 className="text-xs font-bold text-white truncate">
              {user.nama}
            </h2>
            <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider truncate">
              {user.role.replace('_', ' ')}
            </p>
          </div>
        </div>

        {/* Section Label */}
        <div className="px-3 mb-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
          Menu Utama
        </div>

        {/* Menu Links */}
        <nav className="space-y-1 flex-1">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectMenu(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80 flex-shrink-0" />}
              </button>
            );
          })}
        </nav>

        {/* Bottom Logout */}
        <div className="pt-4 border-t border-slate-800 mt-4">
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span>Keluar Sistem</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
