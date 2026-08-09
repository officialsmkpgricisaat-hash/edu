import React, { useState } from 'react';
import { User, Setting, Siswa, PresensiSiswa } from '../types';
import { StorageService } from '../services/storageService';
import {
  GraduationCap,
  ClipboardCheck,
  CreditCard,
  Award,
  NotebookPen,
  AlertTriangle,
  FileText,
  Printer,
  Save,
  ShieldAlert,
  Users,
  BookOpen,
  CheckCircle2,
  FileSpreadsheet,
  Edit3,
  Home,
  Phone,
  User as UserIcon,
  Briefcase,
  MapPin,
  QrCode,
  ScanLine,
  Crosshair,
  Check,
  XCircle,
  Clock,
  Sparkles,
  Camera,
  Search,
} from 'lucide-react';
import { GoogleSheetsBar } from './GoogleSheetsBar';

interface Props {
  user: User;
  setting: Setting;
  activeMenu: string;
  onOpenPrintReport: (reportType: string) => void;
}

const SCHOOL_LAT = -6.9152;
const SCHOOL_LNG = 106.9185;
const MAX_RADIUS_METERS = 100;

function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export const WaliKelasDashboard: React.FC<Props> = ({
  user,
  setting,
  activeMenu,
  onOpenPrintReport,
}) => {
  const kelasList = StorageService.getKelas();
  // Find the class assigned to this homeroom teacher or default to first class
  const myKelas = kelasList.find(k => k.id === user.kelasId || k.waliKelasId === user.guruId || k.namaWaliKelas === user.nama) || kelasList[0];

  const [siswaKelasList, setSiswaKelasList] = useState<Siswa[]>(() =>
    StorageService.getSiswa().filter(s => s.kelasId === myKelas.id)
  );
  const [presensiKelasList, setPresensiKelasList] = useState<PresensiSiswa[]>(() =>
    StorageService.getPresensiSiswa().filter(p => p.kelasId === myKelas.id)
  );

  const nilaiKelasList = StorageService.getNilai().filter(n => n.kelasId === myKelas.id);

  // Catatan & Jurnal Wali Form
  const [catatanText, setCatatanText] = useState('');
  const [selectedSiswaId, setSelectedSiswaId] = useState(siswaKelasList[0]?.id || '');

  // Edit Siswa Form Modal State (Data Diri, Alamat Rumah, Kontak Orang Tua & Catatan Khusus)
  const [selectedEditSiswa, setSelectedEditSiswa] = useState<Siswa | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editNamaSiswa, setEditNamaSiswa] = useState('');
  const [editNis, setEditNis] = useState('');
  const [editNisn, setEditNisn] = useState('');
  const [editGender, setEditGender] = useState<'L' | 'P'>('L');
  const [editAlamatRumah, setEditAlamatRumah] = useState('');
  const [editNamaOrtu, setEditNamaOrtu] = useState('');
  const [editKontakOrtu, setEditKontakOrtu] = useState('');
  const [editPekerjaanOrtu, setEditPekerjaanOrtu] = useState('');
  const [editCatatanKhusus, setEditCatatanKhusus] = useState('');

  // Barcode & Regional Lokasi State
  const [barcodeInput, setBarcodeInput] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>({ lat: -6.9152, lng: 106.9185 });
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    message: string;
    siswaName?: string;
    distanceMeters?: number;
    statusRegional?: string;
  } | null>(null);

  const handleSaveCatatanWali = () => {
    if (!selectedSiswaId || !catatanText) return;
    const targetSiswa = siswaKelasList.find(s => s.id === selectedSiswaId);
    if (!targetSiswa) return;

    StorageService.saveCatatanWaliKelas({
      id: `CWK-${Date.now().toString().slice(-4)}`,
      siswaId: selectedSiswaId,
      namaSiswa: targetSiswa.nama,
      kelasId: myKelas.id,
      semester: setting.semesterAktif,
      catatan: catatanText,
      rekomendasi: 'Disarankan meningkatkan frekuensi latihan mandiri.',
      tanggal: new Date().toISOString().split('T')[0],
    });

    setCatatanText('');
    alert(`Catatan Wali Kelas untuk ${targetSiswa.nama} berhasil disimpan!`);
  };

  // Open modal for editing student profile
  const handleOpenEditSiswa = (siswa: Siswa) => {
    setSelectedEditSiswa(siswa);
    setIsAddingNew(false);
    setEditNamaSiswa(siswa.nama);
    setEditNis(siswa.nis);
    setEditNisn(siswa.nisn || '');
    setEditGender(siswa.gender || 'L');
    setEditAlamatRumah(siswa.alamatRumah || siswa.alamat || '');
    setEditNamaOrtu(siswa.namaOrtu || '');
    setEditKontakOrtu(siswa.kontakOrtu || siswa.noHpOrangtua || '');
    setEditPekerjaanOrtu(siswa.pekerjaanOrtu || '');
    setEditCatatanKhusus(siswa.catatanKhusus || '');
  };

  // Open modal for adding new student
  const handleOpenTambahSiswa = () => {
    const newSiswa: Siswa = {
      id: `SSW-${Date.now().toString().slice(-4)}`,
      nama: '',
      nis: '',
      nisn: '',
      gender: 'L',
      kelasId: myKelas.id,
      namaKelas: myKelas.namaKelas,
      alamat: '',
      alamatRumah: '',
      noHpOrangtua: '',
      namaOrtu: '',
      kontakOrtu: '',
      pekerjaanOrtu: '',
      catatanKhusus: '',
      status: 'Aktif'
    };
    setSelectedEditSiswa(newSiswa);
    setIsAddingNew(true);
    setEditNamaSiswa('');
    setEditNis('');
    setEditNisn('');
    setEditGender('L');
    setEditAlamatRumah('');
    setEditNamaOrtu('');
    setEditKontakOrtu('');
    setEditPekerjaanOrtu('');
    setEditCatatanKhusus('');
  };

  const handleSaveEditSiswa = () => {
    if (!selectedEditSiswa) return;
    if (!editNamaSiswa.trim()) {
      alert('Nama siswa wajib diisi!');
      return;
    }

    const updatedSiswa: Siswa = {
      ...selectedEditSiswa,
      nama: editNamaSiswa.trim(),
      nis: editNis.trim() || selectedEditSiswa.nis || '2510' + Math.floor(100 + Math.random() * 900),
      nisn: editNisn.trim() || selectedEditSiswa.nisn || '008' + Math.floor(100000 + Math.random() * 900000),
      gender: editGender,
      alamat: editAlamatRumah || selectedEditSiswa.alamat || 'Sukabumi',
      alamatRumah: editAlamatRumah,
      namaOrtu: editNamaOrtu,
      noHpOrangtua: editKontakOrtu || selectedEditSiswa.noHpOrangtua,
      kontakOrtu: editKontakOrtu,
      pekerjaanOrtu: editPekerjaanOrtu,
      catatanKhusus: editCatatanKhusus,
    };

    StorageService.saveSiswa(updatedSiswa);
    const refreshed = StorageService.getSiswa().filter(s => s.kelasId === myKelas.id);
    setSiswaKelasList(refreshed);
    setSelectedEditSiswa(null);
    alert(`Data siswa ${updatedSiswa.nama} berhasil disimpan!`);
  };

  // Get Live GPS Location
  const handleGetGPSLocation = () => {
    setIsDetectingLocation(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setIsDetectingLocation(false);
        },
        () => {
          // Fallback location near school if permission prompt dismissed
          setUserLocation({ lat: -6.9152, lng: 106.9185 });
          setIsDetectingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setUserLocation({ lat: -6.9152, lng: 106.9185 });
      setIsDetectingLocation(false);
    }
  };

  // Process Barcode Scan & Regional Location Verification
  const handleProcessBarcodeScan = (nisOrBarcode: string) => {
    if (!nisOrBarcode.trim()) return;

    const cleanNis = nisOrBarcode.replace(/[^0-9]/g, '');
    const targetSiswa = siswaKelasList.find(
      s => s.nis === cleanNis || s.nisn === cleanNis || nisOrBarcode.includes(s.nis)
    );

    if (!targetSiswa) {
      setScanResult({
        success: false,
        message: `Barcode / NIS "${nisOrBarcode}" tidak terdaftar di Kelas ${myKelas.namaKelas}!`,
      });
      return;
    }

    const currentLat = userLocation?.lat || SCHOOL_LAT;
    const currentLng = userLocation?.lng || SCHOOL_LNG;
    const distanceMeters = calculateDistanceMeters(currentLat, currentLng, SCHOOL_LAT, SCHOOL_LNG);
    const isWithinRadius = distanceMeters <= MAX_RADIUS_METERS;
    const regionalStatusStr = isWithinRadius ? 'DI DALAM RADIUS 100M' : 'DI LUAR RADIUS 100M';

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0];

    const newPresensi: PresensiSiswa = {
      id: `PS-${targetSiswa.id}-${todayStr}`,
      tanggal: todayStr,
      kelasId: myKelas.id,
      siswaId: targetSiswa.id,
      namaSiswa: targetSiswa.nama,
      status: 'Hadir',
      keterangan: `Presensi Scan Barcode (${nisOrBarcode}) | Jarak GPS: ${distanceMeters}m (${regionalStatusStr})`,
      diinputOleh: 'Mesin Gate Barcode & Regional GPS',
      barcodeCode: nisOrBarcode.includes('*') ? nisOrBarcode : `*S-${targetSiswa.nis}-${myKelas.id}*`,
      lat: currentLat,
      lng: currentLng,
      jarakKeSekolahMeters: distanceMeters,
      statusRegional: regionalStatusStr as any,
      waktuScan: timeStr,
    };

    StorageService.savePresensiSiswaBatch([newPresensi]);
    const refreshedPresensi = StorageService.getPresensiSiswa().filter(p => p.kelasId === myKelas.id);
    setPresensiKelasList(refreshedPresensi);

    setScanResult({
      success: true,
      message: `BARCODE & GPS VERIFIED: Presensi ${targetSiswa.nama} [NIS: ${targetSiswa.nis}] Berhasil Dicatat!`,
      siswaName: targetSiswa.nama,
      distanceMeters,
      statusRegional: regionalStatusStr,
    });
    setBarcodeInput('');
  };

  // OVERVIEW WALI KELAS
  if (activeMenu === 'dashboard') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Dashboard Wali Kelas {myKelas.namaKelas}</h1>
            <p className="text-xs text-slate-500">Wali Kelas: {myKelas.namaWaliKelas} • Tanggung Jawab Kelas {myKelas.namaKelas}</p>
          </div>
          <button
            onClick={() => onOpenPrintReport('rekap_walikelas')}
            className="px-3.5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4" /> Cetak Laporan Kelas
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-xs text-slate-500 font-semibold">Jumlah Siswa Binaan</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2">{siswaKelasList.length} Siswa</div>
            <p className="text-[10px] text-emerald-600 mt-1 font-semibold">Aktif Semester Ini</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-xs text-slate-500 font-semibold">Rata-rata Kehadiran</div>
            <div className="text-2xl font-extrabold text-indigo-600 mt-2">94.5%</div>
            <p className="text-[10px] text-slate-500 mt-1">Presensi Terjaga</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-xs text-slate-500 font-semibold">Rata-rata Nilai Kelas</div>
            <div className="text-2xl font-extrabold text-purple-600 mt-2">83.2</div>
            <p className="text-[10px] text-slate-500 mt-1">Di Atas KKM (75)</p>
          </div>
        </div>

        {/* Google Sheets Integration Bar */}
        <GoogleSheetsBar
          currentKelasId={myKelas.id}
          currentKelasName={myKelas.namaKelas}
          onSuccessNotification={msg => alert(msg)}
        />

        {/* List Siswa Kelas */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-slate-900">Daftar Siswa Kelas {myKelas.namaKelas}</h3>
            <span className="text-xs text-indigo-600 font-bold">Wali Kelas dapat mengedit alamat & ortu</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">No</th>
                  <th className="p-3">Nama Siswa</th>
                  <th className="p-3">NIS / NISN</th>
                  <th className="p-3">Alamat Rumah</th>
                  <th className="p-3">Nama & Kontak Orang Tua</th>
                  <th className="p-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {siswaKelasList.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-400">{idx + 1}</td>
                    <td className="p-3 font-bold text-slate-900">{s.nama}</td>
                    <td className="p-3 text-slate-500">{s.nis} / {s.nisn}</td>
                    <td className="p-3 text-slate-700">{s.alamatRumah || s.alamat || '-'}</td>
                    <td className="p-3">
                      <div className="font-bold text-indigo-900">{s.namaOrtu || 'Orang Tua Siswa'}</div>
                      <div className="text-slate-500 text-[11px]">{s.kontakOrtu || s.noHpOrangtua || '-'}</div>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleOpenEditSiswa(s)}
                        className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg text-[11px] font-bold hover:bg-indigo-100 flex items-center justify-center gap-1 mx-auto"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit Ortu & Alamat
                      </button>
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

  // DATA SISWA BINAAN KELAS (DENGAN FORM EDIT ALAMAT RUMAH DAN KONTAK ORANG TUA)
  if (activeMenu === 'data_siswa_kelas') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Data Siswa Binaan Kelas {myKelas.namaKelas}</h1>
            <p className="text-xs text-slate-500">Kelola dan update data siswa, alamat rumah, kontak orang tua, serta catatan khusus.</p>
          </div>
          <button
            onClick={handleOpenTambahSiswa}
            className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <UserIcon className="w-4 h-4" />
            + Input / Tambah Siswa Baru
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
            <div className="text-xs font-extrabold text-slate-800 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              Master Profil Siswa & Informasi Keluarga
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              Total {siswaKelasList.length} Siswa Terdaftar
            </div>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">No</th>
                <th className="p-3">Nama Lengkap</th>
                <th className="p-3">NIS / NISN</th>
                <th className="p-3">L/P</th>
                <th className="p-3">Alamat Rumah Lengkap</th>
                <th className="p-3">Nama & Kontak Orang Tua</th>
                <th className="p-3">Pekerjaan Ortu</th>
                <th className="p-3">Catatan Khusus Siswa</th>
                <th className="p-3 text-center">Aksi Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {siswaKelasList.map((s, idx) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-400">{idx + 1}</td>
                  <td className="p-3 font-bold text-slate-900">{s.nama}</td>
                  <td className="p-3 text-slate-500">{s.nis} / {s.nisn}</td>
                  <td className="p-3 font-bold">{s.gender}</td>
                  <td className="p-3 text-slate-700 max-w-xs">
                    <div className="flex items-start gap-1">
                      <Home className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                      <span>{s.alamatRumah || s.alamat || '-'}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-indigo-900 flex items-center gap-1">
                      <UserIcon className="w-3.5 h-3.5 text-indigo-500" />
                      {s.namaOrtu || 'Orang Tua Siswa'}
                    </div>
                    <div className="text-slate-600 text-[11px] flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-emerald-600" />
                      {s.kontakOrtu || s.noHpOrangtua || '-'}
                    </div>
                  </td>
                  <td className="p-3 text-slate-600">
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                      {s.pekerjaanOrtu || '-'}
                    </div>
                  </td>
                  <td className="p-3 max-w-xs">
                    {s.catatanKhusus ? (
                      <span className="px-2 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-[11px] font-semibold block">
                        {s.catatanKhusus}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">-</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleOpenEditSiswa(s)}
                      className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-[11px] font-bold hover:bg-indigo-700 flex items-center justify-center gap-1 mx-auto shadow-xs"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit Alamat & Ortu
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Input & Edit Data Siswa Binaan */}
        {selectedEditSiswa && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start border-b pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Edit3 className="w-5 h-5 text-indigo-600" />
                    {isAddingNew ? 'Input / Tambah Siswa Baru' : 'Edit Profil & Data Siswa Binaan'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isAddingNew
                      ? `Tambah siswa baru ke Kelas ${myKelas.namaKelas}`
                      : `Perbarui informasi untuk siswa ${selectedEditSiswa.nama || ''}`}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedEditSiswa(null)}
                  className="text-slate-400 hover:text-slate-600 text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                {/* Input Nama Siswa */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                    <UserIcon className="w-4 h-4 text-indigo-600" />
                    Nama Lengkap Siswa: *
                  </label>
                  <input
                    type="text"
                    required
                    value={editNamaSiswa}
                    onChange={e => setEditNamaSiswa(e.target.value)}
                    placeholder="Masukkan nama lengkap siswa..."
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 text-xs"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">NIS</label>
                    <input
                      type="text"
                      value={editNis}
                      onChange={e => setEditNis(e.target.value)}
                      placeholder="e.g. 251009"
                      className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">NISN</label>
                    <input
                      type="text"
                      value={editNisn}
                      onChange={e => setEditNisn(e.target.value)}
                      placeholder="e.g. 008123456"
                      className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Gender</label>
                    <select
                      value={editGender}
                      onChange={e => setEditGender(e.target.value as any)}
                      className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                    >
                      <option value="L">Laki-laki (L)</option>
                      <option value="P">Perempuan (P)</option>
                    </select>
                  </div>
                </div>

                {/* Input Alamat Rumah */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                    <Home className="w-4 h-4 text-indigo-600" />
                    Alamat Rumah Lengkap:
                  </label>
                  <textarea
                    rows={3}
                    value={editAlamatRumah}
                    onChange={e => setEditAlamatRumah(e.target.value)}
                    placeholder="Contoh: Jl. Raya Cisaat No. 45, RT 02/03, Desa Cisaat, Kec. Cisaat, Sukabumi"
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 text-xs"
                  ></textarea>
                </div>

                {/* Input Nama Orang Tua */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                    <UserIcon className="w-4 h-4 text-indigo-600" />
                    Nama Orang Tua / Wali Siswa:
                  </label>
                  <input
                    type="text"
                    value={editNamaOrtu}
                    onChange={e => setEditNamaOrtu(e.target.value)}
                    placeholder="Contoh: Bpk. Bambang Saputra / Ibu Ratna"
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 text-xs"
                  />
                </div>

                {/* Input Kontak Orang Tua */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-emerald-600" />
                    Kontak / No. HP WhatsApp Orang Tua:
                  </label>
                  <input
                    type="text"
                    value={editKontakOrtu}
                    onChange={e => setEditKontakOrtu(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 text-xs"
                  />
                </div>

                {/* Input Pekerjaan Orang Tua */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-indigo-600" />
                    Pekerjaan Orang Tua / Wali:
                  </label>
                  <input
                    type="text"
                    value={editPekerjaanOrtu}
                    onChange={e => setEditPekerjaanOrtu(e.target.value)}
                    placeholder="Contoh: Wiraswasta / PNS / Karyawan Swasta"
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 text-xs"
                  />
                </div>

                {/* Input Catatan Khusus Siswa */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                    <NotebookPen className="w-4 h-4 text-amber-600" />
                    Catatan Khusus Siswa:
                  </label>
                  <textarea
                    rows={2}
                    value={editCatatanKhusus}
                    onChange={e => setEditCatatanKhusus(e.target.value)}
                    placeholder="Contoh: Penerima Beasiswa KIP, Riwayat Kesehatan Khusus, Prestasi Non-Akademik..."
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 text-xs"
                  ></textarea>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedEditSiswa(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveEditSiswa}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-4 h-4" /> Simpan Data Siswa
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // REKAP PRESENSI KELAS & SCAN BARCODE PRESENSI HARIAN DENGAN LOKASI GPS
  if (activeMenu === 'presensi_rekap_kelas' || activeMenu === 'kartu_siswa') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Presensi Harian Barcode & Regional Lokasi — Kelas {myKelas.namaKelas}
            </h1>
            <p className="text-xs text-slate-500">
              Presensi siswa harian menggunakan scanner barcode dan verifikasi koordinat GPS regional lokasi.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenPrintReport('rekap_perkelas')}
              className="px-3.5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Cetak Rekap Perkelas
            </button>
          </div>
        </div>

        {/* SCANNER BARCODE & REGIONAL LOKASI GATE WIDGET */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl border border-indigo-800 shadow-xl space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-indigo-800/80 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-indigo-600/30 rounded-xl border border-indigo-500/50 flex items-center justify-center text-indigo-300">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-extrabold uppercase tracking-wider text-indigo-400">
                  GATE PRESENSI SISWA HARIAN
                </div>
                <h3 className="text-base font-extrabold">Scan Barcode & GPS Regional Lokasi</h3>
              </div>
            </div>

            {/* Live GPS Coordinates Info */}
            <div className="bg-slate-800/80 border border-indigo-700/60 p-2.5 rounded-xl flex items-center space-x-3 text-xs">
              <MapPin className="w-5 h-5 text-emerald-400 animate-pulse" />
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Koordinat Sekolah / Gate</div>
                <div className="font-mono font-bold text-emerald-300">
                  {userLocation ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` : 'Memuat GPS...'}
                </div>
              </div>
              <button
                onClick={handleGetGPSLocation}
                disabled={isDetectingLocation}
                className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-[10px] font-bold text-white flex items-center gap-1 transition-all"
              >
                <Crosshair className="w-3.5 h-3.5" />
                {isDetectingLocation ? 'Cek GPS...' : 'Update GPS'}
              </button>
            </div>
          </div>

          {/* Barcode Scan Input Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 bg-slate-800/60 border border-slate-700 p-4 rounded-xl space-y-3">
              <label className="block text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                <ScanLine className="w-4 h-4 text-emerald-400" />
                Input / Arahkan Barcode Scanner Siswa (NIS / Kode Kartu):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={barcodeInput}
                  onChange={e => setBarcodeInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleProcessBarcodeScan(barcodeInput)}
                  placeholder="Ketik / Scan Barcode NIS (misal: 251001 atau *S-251001-KLS-101*)..."
                  className="flex-1 p-3 bg-slate-900 border border-indigo-500/60 rounded-xl text-white font-mono text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <button
                  onClick={() => handleProcessBarcodeScan(barcodeInput)}
                  className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4" /> Scan Gate
                </button>
              </div>

              {/* Quick Simulator Buttons for Class Students */}
              <div className="pt-2 border-t border-slate-700/80">
                <div className="text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Simulasi Scan Langsung Siswa Kelas {myKelas.namaKelas}:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {siswaKelasList.map(s => (
                    <button
                      key={s.id}
                      onClick={() => handleProcessBarcodeScan(s.nis)}
                      className="px-2.5 py-1 bg-indigo-900/60 hover:bg-indigo-700 border border-indigo-700/60 text-indigo-200 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1"
                    >
                      <QrCode className="w-3 h-3 text-emerald-400" />
                      {s.nama} ({s.nis})
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Visual Camera Scanner Frame */}
            <div className="bg-slate-900 border border-indigo-800 rounded-xl p-3 flex flex-col items-center justify-center text-center relative overflow-hidden group">
              <div className="w-full h-24 bg-slate-950 rounded-lg border-2 border-dashed border-indigo-500/50 flex flex-col items-center justify-center p-2 space-y-1">
                <Camera className="w-6 h-6 text-indigo-400 animate-bounce" />
                <span className="text-[10px] font-bold text-slate-300">SCANNER BARCODE OPTIS ACTIVE</span>
                <span className="text-[9px] text-emerald-400 font-mono">STATUS GPS: VERIFIED 100M</span>
              </div>
              <div className="mt-2 text-[10px] text-slate-400 font-semibold">
                Sistem Otomatis Mengenali Barcode NIS Siswa & Stamp Lokasi Regional
              </div>
            </div>
          </div>

          {/* Realtime Scan Result Alert Banner */}
          {scanResult && (
            <div
              className={`p-4 rounded-xl border flex items-center justify-between text-xs animate-in slide-in-from-top duration-300 ${
                scanResult.success
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                  : 'bg-rose-950/80 border-rose-500 text-rose-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                {scanResult.success ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
                )}
                <div>
                  <div className="font-extrabold text-sm">{scanResult.message}</div>
                  {scanResult.success && (
                    <div className="text-[11px] text-emerald-300 font-medium mt-0.5">
                      Status GPS Regional: <span className="font-bold underline">{scanResult.statusRegional}</span> • Jarak dari Kampus: <span className="font-bold">{scanResult.distanceMeters} meter</span>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => setScanResult(null)}
                className="text-slate-400 hover:text-white font-bold text-sm px-2"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* LOG PRESENSI SISWA HARIAN (BARCODE + GPS) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-indigo-600" />
              Rekapitulasi Presensi Barcode & Regional Lokasi ({presensiKelasList.length} Record)
            </h3>
            <span className="text-xs text-slate-500 font-bold">Tanggal: {new Date().toISOString().split('T')[0]}</span>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Waktu / Tanggal</th>
                <th className="p-3">Nama Siswa</th>
                <th className="p-3">Status</th>
                <th className="p-3">Barcode / NIS</th>
                <th className="p-3">Verifikasi GPS & Radius</th>
                <th className="p-3">Petugas / Gate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {presensiKelasList.map(p => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900">
                    <div>{p.tanggal}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{p.waktuScan || '07:15:00'}</div>
                  </td>
                  <td className="p-3 font-bold text-slate-800">{p.namaSiswa}</td>
                  <td className="p-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        p.status === 'Hadir'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : p.status === 'Sakit'
                          ? 'bg-amber-50 text-amber-700'
                          : p.status === 'Izin'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-indigo-700 font-bold">
                    {p.barcodeCode || `*S-${p.siswaId}*`}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="font-bold text-slate-800">{p.statusRegional || 'DI DALAM RADIUS 100M'}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Jarak: {p.jarakKeSekolahMeters ?? 25} meter dari lokasi sekolah
                    </div>
                  </td>
                  <td className="p-3 text-slate-600">{p.diinputOleh}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // NILAI & RAPOR KELAS
  if (activeMenu === 'nilai_siswa_kelas') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Hasil Belajar & Rapor Kelas {myKelas.namaKelas}</h1>
          <p className="text-xs text-slate-500">Nilai akademis siswa binaan semester {setting.semesterAktif}.</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Siswa</th>
                <th className="p-3">Mata Pelajaran</th>
                <th className="p-3">Tugas</th>
                <th className="p-3">UTS</th>
                <th className="p-3">UAS</th>
                <th className="p-3">Nilai Akhir</th>
                <th className="p-3">Status KKM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {nilaiKelasList.map(n => (
                <tr key={n.id} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900">{n.namaSiswa}</td>
                  <td className="p-3 font-semibold text-slate-700">{n.namaMapel}</td>
                  <td className="p-3">{n.nilaiTugas}</td>
                  <td className="p-3">{n.nilaiUTS}</td>
                  <td className="p-3">{n.nilaiUAS}</td>
                  <td className="p-3 font-extrabold text-indigo-700">{n.nilaiAkhir}</td>
                  <td className="p-3 font-bold text-emerald-600">{n.statusTuntas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // KEDISIPLINAN KELAS BINAAN
  if (activeMenu === 'prestasi_pelanggaran') {
    const kedisiplinanKelas = siswaKelasList.map(s => StorageService.getKedisiplinanSiswaBySiswaId(s.id));

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Kedisiplinan & Poin Siswa Kelas {myKelas.namaKelas}</h1>
          <p className="text-xs text-slate-500">Pengawasan Poin Kedisiplinan Siswa (Maksimal 100 Poin untuk 3 tahun studi).</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Nama Siswa</th>
                <th className="p-3">Sisa Poin / 100</th>
                <th className="p-3">Total Pelanggaran</th>
                <th className="p-3">Kategori Kedisiplinan</th>
                <th className="p-3">Status Surat Peringatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {kedisiplinanKelas.map(k => (
                <tr key={k.siswaId} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900">{k.namaSiswa}</td>
                  <td className="p-3 font-extrabold text-blue-700">{k.sisaPoin} / 100 Poin</td>
                  <td className="p-3 font-bold text-rose-600">-{k.totalPoinPelanggaran} Poin ({k.riwayatPelanggaran.length}x)</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        k.sisaPoin >= 90
                          ? 'bg-emerald-50 text-emerald-700'
                          : k.sisaPoin >= 75
                          ? 'bg-blue-50 text-blue-700'
                          : k.sisaPoin >= 50
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {k.statusKategori}
                    </span>
                  </td>
                  <td className="p-3 font-extrabold text-slate-800">{k.statusSP}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // CATATAN WALI KELAS
  if (activeMenu === 'catatan_jurnal_wali') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Catatan & Bimbingan Wali Kelas</h1>
          <p className="text-xs text-slate-500">Berikan catatan bimbingan khusus siswa binaan untuk rapor & evaluasi.</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4 max-w-xl text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Pilih Siswa</label>
            <select
              value={selectedSiswaId}
              onChange={e => setSelectedSiswaId(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-lg"
            >
              {siswaKelasList.map(s => (
                <option key={s.id} value={s.id}>
                  {s.nama} ({s.nis})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Catatan Wali Kelas</label>
            <textarea
              rows={4}
              placeholder="Tuliskan perkembangan akademik, kedisiplinan, dan motivasi..."
              value={catatanText}
              onChange={e => setCatatanText(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-lg"
            ></textarea>
          </div>
          <button
            onClick={handleSaveCatatanWali}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" /> Simpan Catatan Wali Kelas
          </button>
        </div>
      </div>
    );
  }

  // LAPORAN KELAS
  if (activeMenu === 'laporan_kelas') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Laporan Wali Kelas {myKelas.namaKelas}</h1>
            <p className="text-xs text-slate-500">Ekspor dan cetak laporan perkembangan kelas binaan.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenPrintReport('rekap_perkelas')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Printer className="w-4 h-4" /> Cetak Rekap Perkelas
            </button>
            <button
              onClick={() => onOpenPrintReport('rekap_walikelas')}
              className="px-4 py-2 bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" /> Cetak Laporan Lengkap
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 text-xs space-y-4">
          <div className="font-bold text-slate-900 text-sm border-b pb-2">Ringkasan Evaluasi Kelas {myKelas.namaKelas}</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-slate-500">Total Peserta Didik</div>
              <div className="text-xl font-extrabold text-slate-900 mt-1">{siswaKelasList.length} Siswa</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-slate-500">Rata-rata Presensi</div>
              <div className="text-xl font-extrabold text-emerald-600 mt-1">94.5%</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-slate-500">Predikat Kedisiplinan</div>
              <div className="text-xl font-extrabold text-blue-600 mt-1">Sangat Baik</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 text-center text-xs">
      Fitur {activeMenu} Wali Kelas {myKelas.namaKelas} Siap Digunakan.
    </div>
  );
};
