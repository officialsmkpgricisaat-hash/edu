import React, { useState } from 'react';
import { User, Setting } from '../types';
import { StorageService } from '../services/storageService';
import {
  Users,
  GraduationCap,
  FolderOpen,
  BookOpen,
  UserCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  Award,
  AlertTriangle,
  Printer,
  FileSpreadsheet,
  Calendar,
  Filter,
  Search,
  Check,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react';

interface Props {
  user: User;
  setting: Setting;
  activeMenu: string;
  onSelectMenu: (menu: string) => void;
  onOpenPrintReport: (reportType: string) => void;
}

export const KepalaSekolahDashboard: React.FC<Props> = ({
  user,
  setting,
  activeMenu,
  onSelectMenu,
  onOpenPrintReport,
}) => {
  // Realtime Data from Spreadsheet Storage
  const dashboardStats = StorageService.getDashboardKepalaSekolah();
  const guruList = StorageService.getGuru();
  const siswaList = StorageService.getSiswa();
  const kelasList = StorageService.getKelas();
  const mapelList = StorageService.getMapel();
  const presensiGuruData = StorageService.getRekapPresensiGuruKepalaSekolah();
  const presensiSiswaData = StorageService.getRekapPresensiSiswaKepalaSekolah();
  const rekapNilaiData = StorageService.getRekapNilaiKepalaSekolah();
  const rekapJurnalData = StorageService.getRekapJurnalGuruKepalaSekolah();
  const rekapWaliData = StorageService.getRekapWaliKelasKepalaSekolah();
  const catatanWaliList = StorageService.getCatatanWaliKelas();
  const jurnalWaliList = StorageService.getJurnalWaliKelas();
  const prestasiList = StorageService.getPrestasi();
  const pelanggaranList = StorageService.getPelanggaran();

  // Filters state
  const [filterTanggal, setFilterTanggal] = useState<string>(new Date().toISOString().split('T')[0]);
  const [filterKelas, setFilterKelas] = useState<string>('');
  const [filterMapel, setFilterMapel] = useState<string>('');
  const [searchGuru, setSearchGuru] = useState<string>('');
  const [searchSiswa, setSearchSiswa] = useState<string>('');
  const [selectedSiswaDetail, setSelectedSiswaDetail] = useState<any | null>(null);

  // -------------------------------------------------------------
  // RENDER: DASHBOARD OVERVIEW (Section E, G, H, U)
  // -------------------------------------------------------------
  if (activeMenu === 'dashboard') {
    return (
      <div className="space-y-6">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Kepala Sekolah</h1>
            <p className="text-xs font-semibold text-slate-500">
              Monitoring & Supervisi Real-time Akademik • {setting.namaSekolah}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenPrintReport('rekap_sekolah')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
            >
              <Printer className="w-4 h-4 text-indigo-600" /> Cetak Ringkasan
            </button>
          </div>
        </div>

        {/* Section H: Greeting Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="relative z-10 max-w-3xl">
            <span className="px-3 py-1 bg-indigo-500/30 text-indigo-200 rounded-full text-[10px] font-bold uppercase tracking-wider border border-indigo-400/30">
              Selamat Datang
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold mt-2 text-white">
              {user.nama}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
              Pantau perkembangan akademik, kehadiran, kedisiplinan, dan aktivitas pembelajaran sekolah melalui dashboard monitoring terpadu ini.
            </p>
          </div>
        </div>

        {/* Section G: Real-time Stats Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total Guru</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2">{dashboardStats.totalGuru}</div>
            <p className="text-[10px] font-medium text-emerald-600 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Aktif Mengajar
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total Siswa</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2">{dashboardStats.totalSiswa}</div>
            <p className="text-[10px] font-medium text-slate-500 mt-1">Terdaftar di Sistem</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total Kelas</span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <FolderOpen className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2">{dashboardStats.totalKelas}</div>
            <p className="text-[10px] font-medium text-purple-600 mt-1">Rombongan Belajar</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total Mata Pelajaran</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2">{dashboardStats.totalMapel}</div>
            <p className="text-[10px] font-medium text-slate-500 mt-1">Kurikulum Merdeka</p>
          </div>
        </div>

        {/* Section G Second Row: Key Monitoring Performance Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">Kehadiran Guru Hari Ini</span>
              <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                {dashboardStats.kehadiranGuruTodayPct}%
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${dashboardStats.kehadiranGuruTodayPct}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">Dihitung dari log kehadiran guru hari ini</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">Kehadiran Siswa Hari Ini</span>
              <span className="text-xs font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {dashboardStats.kehadiranSiswaTodayPct}%
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${dashboardStats.kehadiranSiswaTodayPct}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">Rekapitulasi dari seluruh kelas</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">Rata-rata Nilai Sekolah</span>
              <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                {dashboardStats.rataRataNilaiSekolah}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-3 text-indigo-600 font-extrabold text-lg">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
              <span>{dashboardStats.rataRataNilaiSekolah} / 100</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Sesuai KKM yang ditetapkan</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-rose-200/80 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">Siswa Perlu Perhatian</span>
              <span className="text-xs font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                {dashboardStats.jumlahSiswaBermasalah} Siswa
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-3 text-rose-600 font-bold text-xs">
              <ShieldAlert className="w-4 h-4" />
              <span>Perlu Perhatian Administratif</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Kehadiran / Nilai / Kedisiplinan</p>
          </div>
        </div>

        {/* Section R & S: Siswa Memerlukan Perhatian Administratif Card */}
        {dashboardStats.siswaPerluPerhatian.length > 0 && (
          <div className="bg-white rounded-xl border border-rose-200 shadow-2xs p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Siswa Memerlukan Perhatian Administratif</h3>
                  <p className="text-xs text-slate-500">Monitoring otomatis berbasis data kehadiran, rata-rata nilai, dan poin pelanggaran.</p>
                </div>
              </div>
              <button
                onClick={() => onSelectMenu('siswa_perhatian')}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
              >
                Lihat Detail <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {dashboardStats.siswaPerluPerhatian.map(s => (
                <div key={s.siswaId} className="p-3.5 rounded-lg bg-rose-50/50 border border-rose-100 flex justify-between items-start">
                  <div>
                    <div className="font-bold text-xs text-slate-900">{s.nama}</div>
                    <div className="text-[11px] font-semibold text-rose-700">{s.kelas}</div>
                    <div className="mt-2 space-y-0.5">
                      {s.alasan.map((al, idx) => (
                        <div key={idx} className="text-[10px] text-slate-600 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> {al}
                        </div>
                      ))}
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                    Perlu Perhatian
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section J & K: Quick Tables for Class Attendance & Academic Score */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Class Attendance Summary */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" /> Kehadiran Siswa Per Kelas
              </h3>
              <button
                onClick={() => onSelectMenu('monitoring_kehadiran')}
                className="text-xs font-bold text-indigo-600 hover:underline"
              >
                Selengkapnya
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Kelas</th>
                    <th className="p-2.5">Siswa</th>
                    <th className="p-2.5">Hadir</th>
                    <th className="p-2.5">S/I/A</th>
                    <th className="p-2.5 text-right">% Kehadiran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {presensiSiswaData.map(row => (
                    <tr key={row.kelasId} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-slate-900">{row.kelas}</td>
                      <td className="p-2.5">{row.jumlahSiswa}</td>
                      <td className="p-2.5 text-emerald-600 font-bold">{row.hadir}</td>
                      <td className="p-2.5 text-slate-500">{row.sakit + row.izin + row.alpa}</td>
                      <td className="p-2.5 text-right font-extrabold text-indigo-600">{row.persentase}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Academic Score Summary */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-600" /> Rata-rata Nilai Per Kelas
              </h3>
              <button
                onClick={() => onSelectMenu('monitoring_nilai')}
                className="text-xs font-bold text-indigo-600 hover:underline"
              >
                Selengkapnya
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Kelas</th>
                    <th className="p-2.5">Rata-rata</th>
                    <th className="p-2.5">Tuntas</th>
                    <th className="p-2.5">Belum Tuntas</th>
                    <th className="p-2.5 text-right">% Kelulusan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {rekapNilaiData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-slate-900">{row.kelas}</td>
                      <td className="p-2.5 font-bold text-indigo-600">{row.rataRata}</td>
                      <td className="p-2.5 text-emerald-600 font-bold">{row.tuntas}</td>
                      <td className="p-2.5 text-rose-600 font-bold">{row.belumTuntas}</td>
                      <td className="p-2.5 text-right font-extrabold text-slate-800">{row.persentaseKelulusan}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: MONITORING GURU (Section M)
  // -------------------------------------------------------------
  if (activeMenu === 'monitoring_guru') {
    const filteredGuru = guruList.filter(g =>
      g.nama.toLowerCase().includes(searchGuru.toLowerCase()) ||
      g.mapel.toLowerCase().includes(searchGuru.toLowerCase())
    );

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Monitoring Guru & Tenaga Pendidik</h1>
            <p className="text-xs text-slate-500">Supervisi status jam mengajar, keaktifan, dan kehadiran guru.</p>
          </div>
          <button
            onClick={() => onOpenPrintReport('rekap_guru')}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs"
          >
            <Printer className="w-4 h-4 text-indigo-600" /> Cetak Data Guru
          </button>
        </div>

        {/* Filter / Search */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div className="relative w-full max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari nama guru / mapel..."
              value={searchGuru}
              onChange={e => setSearchGuru(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Total {filteredGuru.length} Guru Terdaftar
          </span>
        </div>

        {/* Guru Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">No</th>
                  <th className="p-3">Nama Guru</th>
                  <th className="p-3">NIP / NIK</th>
                  <th className="p-3">Mata Pelajaran</th>
                  <th className="p-3">Jam / Mgg</th>
                  <th className="p-3">Tugas Wali Kelas</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {filteredGuru.map((g, idx) => (
                  <tr key={g.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-400">{idx + 1}</td>
                    <td className="p-3 font-bold text-slate-900">{g.nama}</td>
                    <td className="p-3 text-slate-500">{g.nip || '-'}</td>
                    <td className="p-3 font-semibold text-indigo-700">{g.mapel}</td>
                    <td className="p-3 font-bold text-slate-800">{g.jamMengajar} Jam</td>
                    <td className="p-3">
                      {g.kelasWali ? (
                        <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-100">
                          {g.kelasWali}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-100">
                        {g.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: MONITORING SISWA & KELAS
  // -------------------------------------------------------------
  if (activeMenu === 'monitoring_siswa') {
    const filteredSiswa = siswaList.filter(s => {
      const matchSearch =
        s.nama.toLowerCase().includes(searchSiswa.toLowerCase()) ||
        s.nis.toLowerCase().includes(searchSiswa.toLowerCase()) ||
        (s.nisn && s.nisn.toLowerCase().includes(searchSiswa.toLowerCase()));
      const matchKelas = !filterKelas || s.kelasId === filterKelas || s.namaKelas === filterKelas;
      return matchSearch && matchKelas;
    });

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Monitoring Siswa & Kelas</h1>
            <p className="text-xs text-slate-500">Supervisi data peserta didik, kelas, persentase kehadiran, dan poin disiplin.</p>
          </div>
          <button
            onClick={() => onOpenPrintReport('rekap_siswa')}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs"
          >
            <Printer className="w-4 h-4 text-indigo-600" /> Cetak Data Siswa
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari nama, NIS, NISN..."
                value={searchSiswa}
                onChange={e => setSearchSiswa(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <select
              value={filterKelas}
              onChange={e => setFilterKelas(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Semua Kelas</option>
              {kelasList.map(k => (
                <option key={k.id} value={k.id}>{k.namaKelas}</option>
              ))}
            </select>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Menampilkan {filteredSiswa.length} dari {siswaList.length} Siswa
          </span>
        </div>

        {/* Siswa Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">No</th>
                  <th className="p-3">Nama Siswa</th>
                  <th className="p-3">NIS / NISN</th>
                  <th className="p-3">Kelas</th>
                  <th className="p-3">L/P</th>
                  <th className="p-3">Sisa Poin Disiplin</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {filteredSiswa.map((s, idx) => {
                  const kedisiplinan = StorageService.getKedisiplinanSiswaBySiswaId(s.id);
                  return (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-400">{idx + 1}</td>
                      <td className="p-3 font-bold text-slate-900">{s.nama}</td>
                      <td className="p-3 text-slate-500">{s.nis} / {s.nisn}</td>
                      <td className="p-3 font-semibold text-indigo-700">{s.namaKelas}</td>
                      <td className="p-3 font-bold">{s.gender}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                          kedisiplinan.sisaPoin >= 90 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          kedisiplinan.sisaPoin >= 75 ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          kedisiplinan.sisaPoin >= 50 ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {kedisiplinan.sisaPoin} / 100 Poin
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                          {s.status || 'Aktif'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setSelectedSiswaDetail(s)}
                          className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-[11px] font-bold hover:bg-indigo-100 transition-colors"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Detail Siswa */}
        {selectedSiswaDetail && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedSiswaDetail.nama}</h3>
                  <p className="text-xs text-slate-500">NIS: {selectedSiswaDetail.nis} • NISN: {selectedSiswaDetail.nisn}</p>
                </div>
                <button
                  onClick={() => setSelectedSiswaDetail(null)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              {(() => {
                const kdi = StorageService.getKedisiplinanSiswaBySiswaId(selectedSiswaDetail.id);
                return (
                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div>
                        <span className="text-slate-500">Kelas:</span>
                        <div className="font-bold text-slate-900">{selectedSiswaDetail.namaKelas}</div>
                      </div>
                      <div>
                        <span className="text-slate-500">Jenis Kelamin:</span>
                        <div className="font-bold text-slate-900">{selectedSiswaDetail.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</div>
                      </div>
                      <div>
                        <span className="text-slate-500">Kontak Ortu:</span>
                        <div className="font-bold text-slate-900">{selectedSiswaDetail.noHpOrangtua || '-'}</div>
                      </div>
                      <div>
                        <span className="text-slate-500">Status Kedisiplinan:</span>
                        <div className="font-bold text-indigo-700">{kdi.statusKategori} ({kdi.statusSP})</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">Riwayat Pelanggaran:</h4>
                      {kdi.riwayatPelanggaran.length === 0 ? (
                        <p className="text-emerald-600 font-semibold text-[11px]">Tidak ada catatan pelanggaran (100 Poin Utuh).</p>
                      ) : (
                        <div className="space-y-1.5 max-h-32 overflow-y-auto">
                          {kdi.riwayatPelanggaran.map(p => (
                            <div key={p.id} className="p-2 bg-rose-50 rounded-lg border border-rose-100 flex justify-between items-center text-[11px]">
                              <div>
                                <span className="font-bold text-slate-900">{p.namaPelanggaran}</span>
                                <span className="text-slate-500 block">{p.tanggal} • {p.kategori}</span>
                              </div>
                              <span className="font-bold text-rose-600">-{p.poin} Poin</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedSiswaDetail(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: MONITORING KEHADIRAN GURU & SISWA (Section I & J)
  // -------------------------------------------------------------
  if (activeMenu === 'monitoring_kehadiran') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Monitoring Kehadiran Real-time</h1>
            <p className="text-xs text-slate-500">Rekapitulasi presensi harian guru dan siswa seluruh kelas.</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={filterTanggal}
              onChange={e => setFilterTanggal(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={() => onOpenPrintReport('rekap_kehadiran')}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs"
            >
              <Printer className="w-4 h-4 text-indigo-600" /> Cetak Presensi
            </button>
          </div>
        </div>

        {/* Section I: Kehadiran Guru Hari Ini */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-600" /> Kehadiran Guru ({filterTanggal})
            </h3>
            <span className="text-xs text-slate-500">Format Rekapitulasi Supervisi</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">No</th>
                  <th className="p-3">Nama Guru</th>
                  <th className="p-3">Status Presence</th>
                  <th className="p-3">Jam Masuk</th>
                  <th className="p-3 text-right">Persentase</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {presensiGuruData.map(row => (
                  <tr key={row.no} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-400">{row.no}</td>
                    <td className="p-3 font-bold text-slate-900">{row.guru}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        row.status === 'Hadir' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        row.status === 'Sakit' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        row.status === 'Izin' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 font-semibold">{row.jamMasuk}</td>
                    <td className="p-3 text-right font-extrabold text-indigo-600">{row.persentase}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section J: Rekap Kehadiran Siswa */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" /> Rekap Kehadiran Siswa Per Kelas
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Kelas</th>
                  <th className="p-3">Wali Kelas</th>
                  <th className="p-3">Jumlah Siswa</th>
                  <th className="p-3 text-emerald-600">Hadir</th>
                  <th className="p-3 text-amber-600">Sakit</th>
                  <th className="p-3 text-blue-600">Izin</th>
                  <th className="p-3 text-rose-600">Alpa</th>
                  <th className="p-3 text-right">Persentase</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {presensiSiswaData.map(row => (
                  <tr key={row.kelasId} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{row.kelas}</td>
                    <td className="p-3 text-slate-600">{row.waliKelas}</td>
                    <td className="p-3 font-semibold">{row.jumlahSiswa}</td>
                    <td className="p-3 text-emerald-600 font-bold">{row.hadir}</td>
                    <td className="p-3 text-amber-600 font-bold">{row.sakit}</td>
                    <td className="p-3 text-blue-600 font-bold">{row.izin}</td>
                    <td className="p-3 text-rose-600 font-bold">{row.alpa}</td>
                    <td className="p-3 text-right font-extrabold text-indigo-600">{row.persentase}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: MONITORING JURNAL GURU (Section N)
  // -------------------------------------------------------------
  if (activeMenu === 'monitoring_jurnal') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Monitoring Jurnal Mengajar Guru</h1>
            <p className="text-xs text-slate-500">Supervisi pengisian jurnal kegiatan belajar mengajar harian.</p>
          </div>
          <button
            onClick={() => onOpenPrintReport('rekap_jurnal')}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs"
          >
            <Printer className="w-4 h-4 text-indigo-600" /> Cetak Jurnal
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Tanggal</th>
                  <th className="p-3">Guru</th>
                  <th className="p-3">Mata Pelajaran</th>
                  <th className="p-3">Kelas</th>
                  <th className="p-3">Materi Pembelajaran</th>
                  <th className="p-3">Status Indikator</th>
                  <th className="p-3">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {rekapJurnalData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-3 text-slate-500">{row.tanggal}</td>
                    <td className="p-3 font-bold text-slate-900">{row.guru}</td>
                    <td className="p-3 font-semibold text-indigo-700">{row.mapel}</td>
                    <td className="p-3 font-bold text-slate-800">{row.kelas}</td>
                    <td className="p-3">{row.materi}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        row.status === 'Sudah Mengisi'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500 text-[11px]">{row.keterangan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: MONITORING JURNAL & CATATAN WALI KELAS
  // -------------------------------------------------------------
  if (activeMenu === 'monitoring_walikelas') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Monitoring Jurnal & Catatan Wali Kelas</h1>
            <p className="text-xs text-slate-500">Supervisi keaktifan pendampingan wali kelas, catatan bimbingan siswa, dan jurnal harian kelas.</p>
          </div>
          <button
            onClick={() => onOpenPrintReport('rekap_walikelas')}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs"
          >
            <Printer className="w-4 h-4 text-indigo-600" /> Cetak Rekap Wali Kelas
          </button>
        </div>

        {/* Summary Table: Keaktifan Wali Kelas */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-indigo-600" /> Rekapitulasi Keaktifan & Supervisi Wali Kelas
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Wali Kelas</th>
                  <th className="p-3">Kelas</th>
                  <th className="p-3">Siswa</th>
                  <th className="p-3">% Kehadiran Kelas</th>
                  <th className="p-3">Catatan Wali</th>
                  <th className="p-3">Jurnal Wali</th>
                  <th className="p-3 text-emerald-600">Prestasi</th>
                  <th className="p-3 text-rose-600">Pelanggaran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {rekapWaliData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{row.waliKelas}</td>
                    <td className="p-3 font-semibold text-indigo-700">{row.kelas}</td>
                    <td className="p-3">{row.siswa} Siswa</td>
                    <td className="p-3 font-bold text-emerald-600">{row.kehadiran}</td>
                    <td className="p-3 font-bold">{row.catatan} Catatan</td>
                    <td className="p-3 font-bold">{row.jurnal} Jurnal</td>
                    <td className="p-3 text-emerald-600 font-bold">+{row.prestasi}</td>
                    <td className="p-3 text-rose-600 font-bold">-{row.pelanggaran}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Catatan Bimbingan Wali Kelas */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-purple-600" /> Catatan Bimbingan Siswa Oleh Wali Kelas
            </h3>
          </div>

          {catatanWaliList.length === 0 ? (
            <p className="text-slate-400 text-xs py-3 text-center">Belum ada data catatan bimbingan wali kelas.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Tanggal</th>
                    <th className="p-3">Siswa</th>
                    <th className="p-3">Kelas</th>
                    <th className="p-3">Semester</th>
                    <th className="p-3">Catatan / Perkembangan Siswa</th>
                    <th className="p-3">Rekomendasi / Solusi Wali</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {catatanWaliList.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="p-3 text-slate-500">{c.tanggal}</td>
                      <td className="p-3 font-bold text-slate-900">{c.namaSiswa}</td>
                      <td className="p-3 font-semibold text-indigo-700">{c.kelasId}</td>
                      <td className="p-3 text-slate-600">{c.semester}</td>
                      <td className="p-3 text-slate-800">{c.catatan}</td>
                      <td className="p-3 text-indigo-900 font-medium">{c.rekomendasi}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Section 3: Jurnal Harian Wali Kelas */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" /> Jurnal Harian Pembinaan Wali Kelas
            </h3>
          </div>

          {jurnalWaliList.length === 0 ? (
            <p className="text-slate-400 text-xs py-3 text-center">Belum ada data jurnal harian wali kelas.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Tanggal</th>
                    <th className="p-3">Kelas</th>
                    <th className="p-3">Wali Kelas</th>
                    <th className="p-3">Kegiatan Pembinaan / Rapat</th>
                    <th className="p-3">Ringkasan Absensi</th>
                    <th className="p-3">Catatan Evaluasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {jurnalWaliList.map(j => (
                    <tr key={j.id} className="hover:bg-slate-50">
                      <td className="p-3 text-slate-500">{j.tanggal}</td>
                      <td className="p-3 font-bold text-indigo-700">{j.namaKelas}</td>
                      <td className="p-3 font-bold text-slate-900">{j.namaGuru}</td>
                      <td className="p-3 text-slate-800">{j.kegiatan}</td>
                      <td className="p-3 text-emerald-700 font-semibold">{j.absensiOverview}</td>
                      <td className="p-3 text-slate-600">{j.catatan}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: MONITORING NILAI AKADEMIK
  // -------------------------------------------------------------
  if (activeMenu === 'monitoring_nilai') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Monitoring Nilai & Capaian Akademik</h1>
            <p className="text-xs text-slate-500">Supervisi pencapaian rata-rata nilai, KKM, dan ketuntasan belajar per kelas.</p>
          </div>
          <button
            onClick={() => onOpenPrintReport('rekap_nilai')}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs"
          >
            <Printer className="w-4 h-4 text-indigo-600" /> Cetak Rekap Nilai
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Kelas</th>
                  <th className="p-3">Jumlah Siswa</th>
                  <th className="p-3">Rata-Rata Nilai</th>
                  <th className="p-3 text-emerald-600">Siswa Tuntas (&ge;75)</th>
                  <th className="p-3 text-rose-600">Belum Tuntas (&lt;75)</th>
                  <th className="p-3 text-right">Persentase Ketuntasan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {rekapNilaiData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{row.kelas}</td>
                    <td className="p-3 text-slate-600">{row.jumlahSiswa} Siswa</td>
                    <td className="p-3 font-extrabold text-indigo-600">{row.rataRata}</td>
                    <td className="p-3 text-emerald-600 font-bold">{row.tuntas} Siswa</td>
                    <td className="p-3 text-rose-600 font-bold">{row.belumTuntas} Siswa</td>
                    <td className="p-3 text-right font-extrabold text-slate-900">{row.persentaseKelulusan}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: PRESTASI & PELANGGARAN / KEDISIPLINAN (Section P & Q)
  // -------------------------------------------------------------
  if (activeMenu === 'prestasi_pelanggaran') {
    const guruPiketLogs = StorageService.getGuruPiketLogs();
    const allKedisiplinan = siswaList.map(s => StorageService.getKedisiplinanSiswaBySiswaId(s.id));

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Monitoring Prestasi, Kedisiplinan & Guru Piket</h1>
          <p className="text-xs text-slate-500">Evaluasi pencapaian prestasi, modal 100 poin kedisiplinan 3 tahun, dan supervisi Guru Piket / Inval.</p>
        </div>

        {/* Kedisiplinan Poin (Modal 100 Poin / 3 Tahun) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" /> Ringkasan Status Kedisiplinan Siswa (Maksimal 100 Poin)
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Nama Siswa</th>
                  <th className="p-3">Kelas</th>
                  <th className="p-3">Sisa Poin / 100</th>
                  <th className="p-3">Total Poin Pelanggaran</th>
                  <th className="p-3">Kategori Kedisiplinan</th>
                  <th className="p-3">Status Surat Peringatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {allKedisiplinan.map(k => (
                  <tr key={k.siswaId} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{k.namaSiswa}</td>
                    <td className="p-3 text-slate-600">{k.kelasId}</td>
                    <td className="p-3 font-extrabold text-blue-700">{k.sisaPoin} / 100</td>
                    <td className="p-3 font-bold text-rose-600">-{k.totalPoinPelanggaran} Poin</td>
                    <td className="p-3 font-bold">{k.statusKategori}</td>
                    <td className="p-3 font-extrabold text-slate-800">{k.statusSP}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section: Guru Piket / Inval Log Supervision */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" /> Log Guru Piket & Inval (Guru Pengganti)
            </h3>
          </div>
          {guruPiketLogs.length === 0 ? (
            <p className="text-slate-400 text-xs text-center py-3">Belum ada log penugasan guru piket/inval.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Tanggal</th>
                    <th className="p-3">Guru Piket (Pengganti)</th>
                    <th className="p-3">Guru Yang Digantikan</th>
                    <th className="p-3">Mata Pelajaran</th>
                    <th className="p-3">Kelas</th>
                    <th className="p-3">Jam Ke</th>
                    <th className="p-3">Alasan / Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {guruPiketLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="p-3 text-slate-500">{log.tanggal}</td>
                      <td className="p-3 font-bold text-indigo-700">{log.namaGuruPiket}</td>
                      <td className="p-3 text-slate-600">{log.namaGuruDigantikan}</td>
                      <td className="p-3 text-slate-800">{log.namaMapel}</td>
                      <td className="p-3 font-bold text-slate-900">{log.kelasId}</td>
                      <td className="p-3">{log.jamKe}</td>
                      <td className="p-3 text-slate-500">{log.alasanPenggantian || log.catatanKBM || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Section P: Prestasi */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" /> Prestasi Siswa Terdaftar
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Siswa</th>
                  <th className="p-3">Kelas</th>
                  <th className="p-3">Nama Prestasi</th>
                  <th className="p-3">Tingkat</th>
                  <th className="p-3">Tanggal</th>
                  <th className="p-3">Penyelenggara</th>
                  <th className="p-3 text-right">Poin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {prestasiList.map(row => (
                  <tr key={row.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{row.namaSiswa}</td>
                    <td className="p-3 text-slate-600">{row.kelasId}</td>
                    <td className="p-3 font-semibold text-emerald-700">{row.namaPrestasi}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 text-[10px]">
                        {row.tingkat}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">{row.tanggal}</td>
                    <td className="p-3 text-slate-600">{row.penyelenggara}</td>
                    <td className="p-3 text-right font-extrabold text-emerald-600">+{row.poin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section Q: Pelanggaran */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" /> Rekapitulasi Pelanggaran Kedisiplinan
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Siswa</th>
                  <th className="p-3">Kelas</th>
                  <th className="p-3">Bentuk Pelanggaran</th>
                  <th className="p-3">Kategori</th>
                  <th className="p-3">Poin</th>
                  <th className="p-3">Tindak Lanjut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {pelanggaranList.map(row => (
                  <tr key={row.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{row.namaSiswa}</td>
                    <td className="p-3 text-slate-600">{row.kelasId}</td>
                    <td className="p-3 text-slate-800">{row.namaPelanggaran}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        row.kategori === 'Ringan' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        row.kategori === 'Sedang' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                        'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {row.kategori}
                      </span>
                    </td>
                    <td className="p-3 font-extrabold text-rose-600">-{row.poin}</td>
                    <td className="p-3 text-slate-600 text-[11px]">{row.tindakLanjut}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: SISWA PERLU PERHATIAN (Section R & S)
  // -------------------------------------------------------------
  if (activeMenu === 'siswa_perhatian') {
    const listPerhatian = StorageService.getSiswaPerluPerhatian();

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Siswa Memerlukan Perhatian Administratif</h1>
          <p className="text-xs text-slate-500">
            Daftar indikator siswa berdasarkan ambang batas kehadiran (&lt;80%), rata-rata nilai KKM (&lt;75), atau poin pelanggaran tinggi (&ge;15).
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Nama Siswa</th>
                  <th className="p-3">Kelas</th>
                  <th className="p-3">% Kehadiran</th>
                  <th className="p-3">Rata-rata Nilai</th>
                  <th className="p-3">Poin Pelanggaran</th>
                  <th className="p-3">Catatan Indikator Administratif</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {listPerhatian.map(row => (
                  <tr key={row.siswaId} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{row.nama}</td>
                    <td className="p-3 font-semibold text-slate-700">{row.kelas}</td>
                    <td className={`p-3 font-extrabold ${row.persentaseKehadiran < 80 ? 'text-rose-600' : 'text-slate-800'}`}>
                      {row.persentaseKehadiran}%
                    </td>
                    <td className={`p-3 font-extrabold ${row.rataRataNilai < 75 ? 'text-rose-600' : 'text-slate-800'}`}>
                      {row.rataRataNilai}
                    </td>
                    <td className={`p-3 font-extrabold ${row.totalPelanggaran >= 15 ? 'text-rose-600' : 'text-slate-800'}`}>
                      {row.totalPelanggaran} Poin
                    </td>
                    <td className="p-3">
                      <div className="space-y-0.5">
                        {row.alasan.map((al, idx) => (
                          <span key={idx} className="block text-[10px] text-rose-700 font-semibold">
                            • {al}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-extrabold text-[10px]">
                        Perlu Perhatian
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: LAPORAN SEKOLAH (Section T)
  // -------------------------------------------------------------
  if (activeMenu === 'laporan_sekolah') {
    const laporanList = [
      { id: 'rekap_guru', title: '1. Rekap Data Guru & Tenaga Pendidik', desc: 'Daftar lengkap NIP, Mapel, dan Jam Mengajar Guru.' },
      { id: 'rekap_siswa', title: '2. Rekap Data Siswa Terdaftar', desc: 'Siswa per kelas, NISN, dan Kontak Orang Tua.' },
      { id: 'rekap_kelas', title: '3. Rekap Kelas & Wali Kelas', desc: 'Statistik siswa dan penugasan wali kelas.' },
      { id: 'rekap_kehadiran_guru', title: '4. Rekap Kehadiran Guru', desc: 'Presensi harian dan bulanan guru.' },
      { id: 'rekap_kehadiran_siswa', title: '5. Rekap Kehadiran Siswa', desc: 'Presensi per kelas (Hadir, Sakit, Izin, Alpa).' },
      { id: 'rekap_nilai', title: '6. Rekap Nilai Akademik Sekolah', desc: 'Nilai rata-rata dan ketuntasan KKM per kelas.' },
      { id: 'rekap_prestasi', title: '7. Rekap Prestasi Siswa', desc: 'Daftar prestasi tingkat Sekolah s.d. Nasional.' },
      { id: 'rekap_pelanggaran', title: '8. Rekap Pelanggaran Kedisiplinan', desc: 'Kategori pelanggaran dan poin tindak lanjut.' },
      { id: 'rekap_jurnal', title: '9. Rekap Jurnal Mengajar Guru', desc: 'Catatan materi dan keaktifan jurnal mengajar.' },
      { id: 'rekap_walikelas', title: '10. Rekap Aktivitas Wali Kelas', desc: 'Catatan bimbingan dan jurnal wali kelas.' },
    ];

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Laporan Resmi Sekolah</h1>
          <p className="text-xs text-slate-500">Cetak dan ekspor dokumen rekapitulasi sekolah berformat standar resmi.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {laporanList.map(lap => (
            <div key={lap.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-indigo-200 transition-all flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{lap.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{lap.desc}</p>
              </div>
              <div className="mt-4 flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => onOpenPrintReport(lap.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" /> Cetak / Export PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Fallback view
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 text-center">
      <h2 className="text-sm font-bold text-slate-800">Menu {activeMenu} Monitoring Kepala Sekolah</h2>
      <p className="text-xs text-slate-500 mt-1">Gunakan navigasi sidebar untuk memilih tampilan yang diinginkan.</p>
    </div>
  );
};
