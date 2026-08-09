import React, { useState } from 'react';
import { User, Setting, Guru, Siswa, Kelas, MataPelajaran, Jadwal } from '../types';
import { StorageService } from '../services/storageService';
import {
  Users,
  GraduationCap,
  FolderOpen,
  BookOpen,
  Calendar,
  Settings,
  Plus,
  Trash2,
  Edit2,
  UserCheck,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { GoogleSheetsBar } from './GoogleSheetsBar';

interface Props {
  user: User;
  setting: Setting;
  activeMenu: string;
  onRefreshSetting: () => void;
}

export const AdminDashboard: React.FC<Props> = ({
  user,
  setting,
  activeMenu,
  onRefreshSetting,
}) => {
  const [tick, setTick] = useState(0);
  const refresh = () => setTick(t => t + 1);

  const usersList = StorageService.getUsers();
  const guruList = StorageService.getGuru();
  const siswaList = StorageService.getSiswa();
  const kelasList = StorageService.getKelas();
  const mapelList = StorageService.getMapel();
  const jadwalList = StorageService.getJadwal();

  // Modals & Forms State
  const [showGuruModal, setShowGuruModal] = useState(false);
  const [showSiswaModal, setShowSiswaModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showKelasModal, setShowKelasModal] = useState(false);
  const [showMapelModal, setShowMapelModal] = useState(false);
  const [showJadwalModal, setShowJadwalModal] = useState(false);

  // Forms Data
  const [guruForm, setGuruForm] = useState<Partial<Guru>>({
    nama: '',
    nip: '',
    mapel: 'Matematika',
    status: 'PNS',
    jamMengajar: 24,
  });

  const [siswaForm, setSiswaForm] = useState<Partial<Siswa>>({
    nama: '',
    nis: '',
    nisn: '',
    kelasId: kelasList[0]?.id || 'KLS-101',
    gender: 'L',
  });

  const [userForm, setUserForm] = useState<Partial<User>>({
    username: '',
    password: '',
    nama: '',
    role: 'GURU',
    status: 'Aktif',
  });

  const [kelasForm, setKelasForm] = useState<Partial<Kelas>>({
    namaKelas: '',
    tingkat: 'X',
    waliKelasId: guruList[0]?.id || '',
    jumlahSiswa: 32,
  });

  const [mapelForm, setMapelForm] = useState<Partial<MataPelajaran>>({
    kodeMapel: '',
    namaMapel: '',
    kkm: 75,
    kelompok: 'Kejuruan',
  });

  const [jadwalForm, setJadwalForm] = useState<Partial<Jadwal>>({
    hari: 'Senin',
    jamKe: '07:00 - 08:30',
    kelasId: kelasList[0]?.id || '',
    mapelId: mapelList[0]?.id || '',
    guruId: guruList[0]?.id || '',
    ruang: 'R. KELAS',
  });

  const [schoolForm, setSchoolForm] = useState<Setting>(setting);

  // Handlers
  const handleSaveGuru = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guruForm.nama) return;
    StorageService.saveGuru({
      id: guruForm.id || `GRU-${Date.now().toString().slice(-4)}`,
      nip: guruForm.nip || '-',
      nama: guruForm.nama,
      email: `${guruForm.nama.toLowerCase().replace(/\s+/g, '.')}@eduadmin.sch.id`,
      noHp: '081234567890',
      mapel: guruForm.mapel || 'Matematika',
      status: guruForm.status || 'PNS',
      jamMengajar: Number(guruForm.jamMengajar) || 24,
    });
    setShowGuruModal(false);
    refresh();
    alert('Data Guru berhasil disimpan!');
  };

  const handleSaveSiswa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!siswaForm.nama) return;
    const selectedKelas = kelasList.find(k => k.id === siswaForm.kelasId);
    const alamatVal = siswaForm.alamatRumah || siswaForm.alamat || 'Jl. Raya Cisaat No. 12, Sukabumi';
    const kontakOrtuVal = siswaForm.kontakOrtu || siswaForm.noHpOrangtua || '081200001111';

    StorageService.saveSiswa({
      id: siswaForm.id || `SSW-${Date.now().toString().slice(-4)}`,
      nis: siswaForm.nis || '251009',
      nisn: siswaForm.nisn || '0081234999',
      nama: siswaForm.nama,
      gender: siswaForm.gender || 'L',
      kelasId: siswaForm.kelasId || 'KLS-101',
      namaKelas: selectedKelas ? selectedKelas.namaKelas : 'X TO 1',
      alamat: alamatVal,
      alamatRumah: alamatVal,
      noHpOrangtua: kontakOrtuVal,
      namaOrtu: siswaForm.namaOrtu || 'Orang Tua Siswa',
      kontakOrtu: kontakOrtuVal,
      pekerjaanOrtu: siswaForm.pekerjaanOrtu || 'Wiraswasta',
      catatanKhusus: siswaForm.catatanKhusus || '',
      status: siswaForm.status || 'Aktif',
    });
    setShowSiswaModal(false);
    refresh();
    alert('Data Siswa berhasil disimpan!');
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.username || !userForm.nama) return;
    const targetUser: User = {
      id: userForm.id || `USR-${Date.now().toString().slice(-4)}`,
      username: userForm.username,
      password: userForm.password || '123456',
      nama: userForm.nama,
      role: userForm.role || 'GURU',
      kelasId: userForm.kelasId || undefined,
      status: userForm.status || 'Aktif',
      createdAt: userForm.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    StorageService.saveUser(targetUser);

    // Synchronize class assignment for Wali Kelas
    if (targetUser.role === 'WALI_KELAS' && targetUser.kelasId) {
      const assignedKelas = kelasList.find(k => k.id === targetUser.kelasId);
      if (assignedKelas) {
        StorageService.saveKelas({
          ...assignedKelas,
          namaWaliKelas: targetUser.nama,
          waliKelasId: targetUser.guruId || targetUser.id,
        });
      }
    }

    setShowUserModal(false);
    refresh();
    alert(`User ${targetUser.nama} (${targetUser.role}) berhasil disimpan!`);
  };

  const handleSaveKelas = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kelasForm.namaKelas) return;
    const selectedGuru = guruList.find(g => g.id === kelasForm.waliKelasId);
    StorageService.saveKelas({
      id: kelasForm.id || `KLS-${Date.now().toString().slice(-4)}`,
      namaKelas: kelasForm.namaKelas,
      tingkat: kelasForm.tingkat || 'X',
      waliKelasId: kelasForm.waliKelasId || (guruList[0]?.id || '-'),
      namaWaliKelas: selectedGuru ? selectedGuru.nama : 'Belum Ditentukan',
      jumlahSiswa: Number(kelasForm.jumlahSiswa) || 30,
    });
    setShowKelasModal(false);
    refresh();
    alert('Data Kelas berhasil disimpan!');
  };

  const handleSaveMapel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mapelForm.namaMapel) return;
    StorageService.saveMapel({
      id: mapelForm.id || `MP-${Date.now().toString().slice(-4)}`,
      kodeMapel: mapelForm.kodeMapel || `MP-${Math.floor(100 + Math.random() * 900)}`,
      namaMapel: mapelForm.namaMapel,
      kkm: Number(mapelForm.kkm) || 75,
      kelompok: mapelForm.kelompok || 'Kejuruan',
    });
    setShowMapelModal(false);
    refresh();
    alert('Data Mata Pelajaran berhasil disimpan!');
  };

  const handleSaveJadwal = (e: React.FormEvent) => {
    e.preventDefault();
    const selKelas = kelasList.find(k => k.id === jadwalForm.kelasId);
    const selMapel = mapelList.find(m => m.id === jadwalForm.mapelId);
    const selGuru = guruList.find(g => g.id === jadwalForm.guruId);

    StorageService.saveJadwal({
      id: jadwalForm.id || `JDW-${Date.now().toString().slice(-4)}`,
      hari: jadwalForm.hari || 'Senin',
      jamKe: jadwalForm.jamKe || '07:00 - 08:30',
      kelasId: jadwalForm.kelasId || (kelasList[0]?.id || '-'),
      namaKelas: selKelas ? selKelas.namaKelas : 'X TO 1',
      mapelId: jadwalForm.mapelId || (mapelList[0]?.id || '-'),
      namaMapel: selMapel ? selMapel.namaMapel : 'Matematika',
      guruId: jadwalForm.guruId || (guruList[0]?.id || '-'),
      namaGuru: selGuru ? selGuru.nama : 'Guru Pengajar',
      ruang: jadwalForm.ruang || 'R. KELAS',
    });
    setShowJadwalModal(false);
    refresh();
    alert('Data Jadwal Pelajaran berhasil disimpan!');
  };

  const handleSaveSetting = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveSetting(schoolForm);
    onRefreshSetting();
    alert('Pengaturan sekolah berhasil diperbarui!');
  };

  // OVERVIEW DASHBOARD ADMIN
  if (activeMenu === 'dashboard') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Dashboard Administrator Master</h1>
          <p className="text-xs text-slate-500">Kelola master data, pengguna, serta konfigurasi sistem sekolah.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-xs font-semibold text-slate-500">Total User System</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2">{usersList.length} User</div>
            <p className="text-[10px] text-emerald-600 mt-1 font-semibold">5 Role Terdaftar</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-xs font-semibold text-slate-500">Data Guru</div>
            <div className="text-2xl font-extrabold text-indigo-600 mt-2">{guruList.length} Guru</div>
            <p className="text-[10px] text-slate-500 mt-1">Tenaga Pendidik</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-xs font-semibold text-slate-500">Data Siswa</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2">{siswaList.length} Siswa</div>
            <p className="text-[10px] text-slate-500 mt-1">Peserta Didik</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-xs font-semibold text-slate-500">Rombongan Belajar</div>
            <div className="text-2xl font-extrabold text-purple-600 mt-2">{kelasList.length} Kelas</div>
            <p className="text-[10px] text-slate-500 mt-1">Tingkat X, XI, XII</p>
          </div>
        </div>

        {/* Google Sheets Integration Bar */}
        <GoogleSheetsBar onSuccessNotification={msg => alert(msg)} />

        {/* Quick Access Overview */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900">Ringkasan Sistem Master Data</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="font-bold text-slate-900">Mata Pelajaran</div>
              <div className="text-lg font-extrabold text-indigo-700 mt-1">{mapelList.length} Mapel</div>
              <p className="text-[10px] text-slate-500">Kurikulum Merdeka / K13</p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="font-bold text-slate-900">Jadwal Terjadwal</div>
              <div className="text-lg font-extrabold text-blue-700 mt-1">{jadwalList.length} Slot Jam</div>
              <p className="text-[10px] text-slate-500">Senin - Sabtu</p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="font-bold text-slate-900">Status Server & Database</div>
              <div className="text-lg font-extrabold text-emerald-600 mt-1">Online & Normal</div>
              <p className="text-[10px] text-slate-500">Sheet LocalStorage Ready</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // KELOLA DATA GURU
  if (activeMenu === 'kelola_guru') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Kelola Data Guru</h1>
            <p className="text-xs text-slate-500">Tambah, ubah, dan kelola data master guru.</p>
          </div>
          <button
            onClick={() => {
              setGuruForm({ nama: '', nip: '', mapel: 'Matematika', status: 'PNS', jamMengajar: 24 });
              setShowGuruModal(true);
            }}
            className="px-3.5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Tambah Guru
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Nama Guru</th>
                <th className="p-3">NIP / NIK</th>
                <th className="p-3">Mapel Utama</th>
                <th className="p-3">Status</th>
                <th className="p-3">Jam Mengajar</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {guruList.map(g => (
                <tr key={g.id} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900">{g.nama}</td>
                  <td className="p-3 text-slate-500">{g.nip}</td>
                  <td className="p-3 font-semibold text-indigo-700">{g.mapel}</td>
                  <td className="p-3">{g.status}</td>
                  <td className="p-3 font-bold">{g.jamMengajar} Jam / Mgg</td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={() => {
                        setGuruForm(g);
                        setShowGuruModal(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-800 p-1"
                      title="Edit Guru"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus data guru ${g.nama}?`)) {
                          StorageService.deleteGuru(g.id);
                          refresh();
                        }
                      }}
                      className="text-rose-600 hover:text-rose-800 p-1"
                      title="Hapus Guru"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Guru */}
        {showGuruModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
              <h3 className="text-base font-bold text-slate-900 mb-4">{guruForm.id ? 'Edit Data Guru' : 'Tambah Guru Baru'}</h3>
              <form onSubmit={handleSaveGuru} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Guru</label>
                  <input
                    type="text"
                    required
                    value={guruForm.nama}
                    onChange={e => setGuruForm({ ...guruForm, nama: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">NIP / NIK</label>
                  <input
                    type="text"
                    value={guruForm.nip}
                    onChange={e => setGuruForm({ ...guruForm, nip: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mata Pelajaran Utama</label>
                  <input
                    type="text"
                    required
                    value={guruForm.mapel}
                    onChange={e => setGuruForm({ ...guruForm, mapel: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Kepegawaian</label>
                  <select
                    value={guruForm.status}
                    onChange={e => setGuruForm({ ...guruForm, status: e.target.value as any })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="PNS">PNS</option>
                    <option value="GTT">GTT</option>
                    <option value="Honor">Honor</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jam Mengajar / Minggu</label>
                  <input
                    type="number"
                    value={guruForm.jamMengajar}
                    onChange={e => setGuruForm({ ...guruForm, jamMengajar: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowGuruModal(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl"
                  >
                    Simpan Guru
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // KELOLA SISWA
  if (activeMenu === 'kelola_siswa') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Kelola Data Siswa</h1>
            <p className="text-xs text-slate-500">Master data peserta didik seluruh kelas.</p>
          </div>
          <button
            onClick={() => {
              setSiswaForm({ nama: '', nis: '', nisn: '', kelasId: kelasList[0]?.id || 'KLS-101', gender: 'L' });
              setShowSiswaModal(true);
            }}
            className="px-3.5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Tambah Siswa
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Nama Siswa</th>
                <th className="p-3">NIS / NISN</th>
                <th className="p-3">Kelas</th>
                <th className="p-3">Alamat Rumah</th>
                <th className="p-3">Kontak Orang Tua</th>
                <th className="p-3">Catatan Khusus</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {siswaList.map(s => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900">{s.nama}</td>
                  <td className="p-3 text-slate-500">{s.nis} / {s.nisn}</td>
                  <td className="p-3 font-semibold text-indigo-700">{s.namaKelas}</td>
                  <td className="p-3 text-slate-600 max-w-xs truncate">{s.alamatRumah || s.alamat || '-'}</td>
                  <td className="p-3">
                    <div className="font-bold text-slate-800">{s.namaOrtu || 'Orang Tua'}</div>
                    <div className="text-[11px] text-slate-500">{s.kontakOrtu || s.noHpOrangtua || '-'}</div>
                  </td>
                  <td className="p-3 max-w-xs">
                    {s.catatanKhusus ? (
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded text-[10px] font-semibold block truncate">
                        {s.catatanKhusus}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">-</span>
                    )}
                  </td>
                  <td className="p-3">{s.status}</td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={() => {
                        setSiswaForm(s);
                        setShowSiswaModal(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-800 p-1"
                      title="Edit Siswa"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus data siswa ${s.nama}?`)) {
                          StorageService.deleteSiswa(s.id);
                          refresh();
                        }
                      }}
                      className="text-rose-600 hover:text-rose-800 p-1"
                      title="Hapus Siswa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Siswa */}
        {showSiswaModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
              <h3 className="text-base font-bold text-slate-900 mb-4">{siswaForm.id ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}</h3>
              <form onSubmit={handleSaveSiswa} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Siswa</label>
                  <input
                    type="text"
                    required
                    value={siswaForm.nama || ''}
                    onChange={e => setSiswaForm({ ...siswaForm, nama: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">NIS</label>
                    <input
                      type="text"
                      value={siswaForm.nis || ''}
                      onChange={e => setSiswaForm({ ...siswaForm, nis: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">NISN</label>
                    <input
                      type="text"
                      value={siswaForm.nisn || ''}
                      onChange={e => setSiswaForm({ ...siswaForm, nisn: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Kelas</label>
                    <select
                      value={siswaForm.kelasId || kelasList[0]?.id || ''}
                      onChange={e => setSiswaForm({ ...siswaForm, kelasId: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      {kelasList.map(k => (
                        <option key={k.id} value={k.id}>{k.namaKelas}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Jenis Kelamin</label>
                    <select
                      value={siswaForm.gender || 'L'}
                      onChange={e => setSiswaForm({ ...siswaForm, gender: e.target.value as any })}
                      className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="L">Laki-laki (L)</option>
                      <option value="P">Perempuan (P)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Alamat Rumah Lengkap</label>
                  <textarea
                    rows={2}
                    value={siswaForm.alamatRumah || siswaForm.alamat || ''}
                    onChange={e => setSiswaForm({ ...siswaForm, alamatRumah: e.target.value, alamat: e.target.value })}
                    placeholder="Alamat rumah lengkap siswa..."
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nama Orang Tua / Wali</label>
                    <input
                      type="text"
                      value={siswaForm.namaOrtu || ''}
                      onChange={e => setSiswaForm({ ...siswaForm, namaOrtu: e.target.value })}
                      placeholder="Nama ayah/ibu/wali..."
                      className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Kontak / No HP Orang Tua</label>
                    <input
                      type="text"
                      value={siswaForm.kontakOrtu || siswaForm.noHpOrangtua || ''}
                      onChange={e => setSiswaForm({ ...siswaForm, kontakOrtu: e.target.value, noHpOrangtua: e.target.value })}
                      placeholder="0812xxxx..."
                      className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pekerjaan Orang Tua</label>
                  <input
                    type="text"
                    value={siswaForm.pekerjaanOrtu || ''}
                    onChange={e => setSiswaForm({ ...siswaForm, pekerjaanOrtu: e.target.value })}
                    placeholder="PNS / Wiraswasta / Karyawan..."
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Catatan Khusus Siswa</label>
                  <textarea
                    rows={2}
                    value={siswaForm.catatanKhusus || ''}
                    onChange={e => setSiswaForm({ ...siswaForm, catatanKhusus: e.target.value })}
                    placeholder="Catatan Beasiswa KIP, prestasi, riwayat kesehatan, atau perhatian khusus..."
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  ></textarea>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowSiswaModal(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl"
                  >
                    Simpan Siswa
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // KELOLA DATA KELAS
  if (activeMenu === 'kelola_kelas') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Kelola Data Kelas & Rombongan Belajar</h1>
            <p className="text-xs text-slate-500">Master rombel, penetapan Wali Kelas, dan kuota siswa.</p>
          </div>
          <button
            onClick={() => {
              setKelasForm({ namaKelas: '', tingkat: 'X', waliKelasId: guruList[0]?.id || '', jumlahSiswa: 32 });
              setShowKelasModal(true);
            }}
            className="px-3.5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Tambah Kelas
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Nama Kelas</th>
                <th className="p-3">Tingkat</th>
                <th className="p-3">Wali Kelas Assigned</th>
                <th className="p-3">Jumlah Siswa</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {kelasList.map(k => (
                <tr key={k.id} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-indigo-700">{k.namaKelas}</td>
                  <td className="p-3 font-semibold text-slate-700">{k.tingkat}</td>
                  <td className="p-3 font-bold text-slate-900">{k.namaWaliKelas}</td>
                  <td className="p-3 font-bold">{k.jumlahSiswa} Siswa</td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={() => {
                        setKelasForm(k);
                        setShowKelasModal(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-800 p-1"
                      title="Edit Kelas"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus kelas ${k.namaKelas}?`)) {
                          StorageService.deleteKelas(k.id);
                          refresh();
                        }
                      }}
                      className="text-rose-600 hover:text-rose-800 p-1"
                      title="Hapus Kelas"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Kelas */}
        {showKelasModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
              <h3 className="text-base font-bold text-slate-900 mb-4">{kelasForm.id ? 'Edit Data Kelas' : 'Tambah Kelas Baru'}</h3>
              <form onSubmit={handleSaveKelas} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Kelas (Contoh: X TO 1, XI TJKT 2)</label>
                  <input
                    type="text"
                    required
                    value={kelasForm.namaKelas}
                    onChange={e => setKelasForm({ ...kelasForm, namaKelas: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tingkat</label>
                    <select
                      value={kelasForm.tingkat}
                      onChange={e => setKelasForm({ ...kelasForm, tingkat: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="X">Tingkat X</option>
                      <option value="XI">Tingkat XI</option>
                      <option value="XII">Tingkat XII</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Kapasitas Siswa</label>
                    <input
                      type="number"
                      value={kelasForm.jumlahSiswa}
                      onChange={e => setKelasForm({ ...kelasForm, jumlahSiswa: Number(e.target.value) })}
                      className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Wali Kelas Assigned</label>
                  <select
                    value={kelasForm.waliKelasId}
                    onChange={e => setKelasForm({ ...kelasForm, waliKelasId: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    {guruList.map(g => (
                      <option key={g.id} value={g.id}>{g.nama} ({g.mapel})</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowKelasModal(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl"
                  >
                    Simpan Kelas
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // KELOLA MATA PELAJARAN
  if (activeMenu === 'kelola_mapel') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Kelola Mata Pelajaran</h1>
            <p className="text-xs text-slate-500">Master Kurikulum, Kode Mapel, KKM, dan Rumpun Pelajaran.</p>
          </div>
          <button
            onClick={() => {
              setMapelForm({ kodeMapel: '', namaMapel: '', kkm: 75, kelompok: 'Kejuruan' });
              setShowMapelModal(true);
            }}
            className="px-3.5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Tambah Mapel
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Kode Mapel</th>
                <th className="p-3">Nama Mata Pelajaran</th>
                <th className="p-3">Rumpun / Kelompok</th>
                <th className="p-3">KKM Minimal</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {mapelList.map(m => (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-indigo-700">{m.kodeMapel}</td>
                  <td className="p-3 font-bold text-slate-900">{m.namaMapel}</td>
                  <td className="p-3 font-semibold text-slate-700">{m.kelompok}</td>
                  <td className="p-3 font-extrabold text-emerald-600">{m.kkm} Poin</td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={() => {
                        setMapelForm(m);
                        setShowMapelModal(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-800 p-1"
                      title="Edit Mapel"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus mapel ${m.namaMapel}?`)) {
                          StorageService.deleteMapel(m.id);
                          refresh();
                        }
                      }}
                      className="text-rose-600 hover:text-rose-800 p-1"
                      title="Hapus Mapel"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Mapel */}
        {showMapelModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
              <h3 className="text-base font-bold text-slate-900 mb-4">{mapelForm.id ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran Baru'}</h3>
              <form onSubmit={handleSaveMapel} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kode Mapel</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: MP-001"
                    value={mapelForm.kodeMapel}
                    onChange={e => setMapelForm({ ...mapelForm, kodeMapel: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Mata Pelajaran</label>
                  <input
                    type="text"
                    required
                    value={mapelForm.namaMapel}
                    onChange={e => setMapelForm({ ...mapelForm, namaMapel: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Kelompok</label>
                    <select
                      value={mapelForm.kelompok}
                      onChange={e => setMapelForm({ ...mapelForm, kelompok: e.target.value as any })}
                      className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Umum">Umum</option>
                      <option value="Kejuruan">Kejuruan</option>
                      <option value="Pilihan">Pilihan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">KKM Minimal</label>
                    <input
                      type="number"
                      value={mapelForm.kkm}
                      onChange={e => setMapelForm({ ...mapelForm, kkm: Number(e.target.value) })}
                      className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowMapelModal(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl"
                  >
                    Simpan Mapel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // KELOLA JADWAL PELAJARAN
  if (activeMenu === 'kelola_jadwal') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Kelola Jadwal Pelajaran</h1>
            <p className="text-xs text-slate-500">Penjadwalan KBM mingguan per kelas, jam, dan guru pengajar.</p>
          </div>
          <button
            onClick={() => {
              setJadwalForm({
                hari: 'Senin',
                jamKe: '07:00 - 08:30',
                kelasId: kelasList[0]?.id || '',
                mapelId: mapelList[0]?.id || '',
                guruId: guruList[0]?.id || '',
                ruang: 'R. KELAS',
              });
              setShowJadwalModal(true);
            }}
            className="px-3.5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Tambah Jadwal
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Hari</th>
                <th className="p-3">Jam Ke / Waktu</th>
                <th className="p-3">Kelas</th>
                <th className="p-3">Mata Pelajaran</th>
                <th className="p-3">Guru Pengajar</th>
                <th className="p-3">Ruang</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {jadwalList.map(j => (
                <tr key={j.id} className="hover:bg-slate-50">
                  <td className="p-3 font-extrabold text-blue-700">{j.hari}</td>
                  <td className="p-3 text-slate-600 font-semibold">{j.jamKe}</td>
                  <td className="p-3 font-bold text-slate-900">{j.namaKelas}</td>
                  <td className="p-3 font-bold text-indigo-700">{j.namaMapel}</td>
                  <td className="p-3 font-semibold text-slate-800">{j.namaGuru}</td>
                  <td className="p-3 text-slate-500">{j.ruang}</td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={() => {
                        setJadwalForm(j);
                        setShowJadwalModal(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-800 p-1"
                      title="Edit Jadwal"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus jadwal ${j.hari} - ${j.namaMapel}?`)) {
                          StorageService.deleteJadwal(j.id);
                          refresh();
                        }
                      }}
                      className="text-rose-600 hover:text-rose-800 p-1"
                      title="Hapus Jadwal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Jadwal */}
        {showJadwalModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
              <h3 className="text-base font-bold text-slate-900 mb-4">{jadwalForm.id ? 'Edit Jadwal Pelajaran' : 'Tambah Jadwal Pelajaran Baru'}</h3>
              <form onSubmit={handleSaveJadwal} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Hari</label>
                    <select
                      value={jadwalForm.hari}
                      onChange={e => setJadwalForm({ ...jadwalForm, hari: e.target.value as any })}
                      className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Senin">Senin</option>
                      <option value="Selasa">Selasa</option>
                      <option value="Rabu">Rabu</option>
                      <option value="Kamis">Kamis</option>
                      <option value="Jumat">Jumat</option>
                      <option value="Sabtu">Sabtu</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Jam Ke / Waktu</label>
                    <input
                      type="text"
                      value={jadwalForm.jamKe}
                      placeholder="07:00 - 08:30"
                      onChange={e => setJadwalForm({ ...jadwalForm, jamKe: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kelas</label>
                  <select
                    value={jadwalForm.kelasId}
                    onChange={e => setJadwalForm({ ...jadwalForm, kelasId: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    {kelasList.map(k => (
                      <option key={k.id} value={k.id}>{k.namaKelas}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mata Pelajaran</label>
                  <select
                    value={jadwalForm.mapelId}
                    onChange={e => setJadwalForm({ ...jadwalForm, mapelId: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    {mapelList.map(m => (
                      <option key={m.id} value={m.id}>{m.namaMapel} ({m.kodeMapel})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Guru Pengajar</label>
                  <select
                    value={jadwalForm.guruId}
                    onChange={e => setJadwalForm({ ...jadwalForm, guruId: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    {guruList.map(g => (
                      <option key={g.id} value={g.id}>{g.nama}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ruangan</label>
                  <input
                    type="text"
                    value={jadwalForm.ruang}
                    placeholder="R. KELAS / LAB 1"
                    onChange={e => setJadwalForm({ ...jadwalForm, ruang: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowJadwalModal(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl"
                  >
                    Simpan Jadwal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // PENGATURAN USER & ROLE
  if (activeMenu === 'pengaturan_user' || activeMenu === 'manajemen_user') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Manajemen Pengguna & Hak Akses (User & Role)</h1>
            <p className="text-xs text-slate-500">Kelola akun kredensial login untuk 5 Role: Admin, Kepala Sekolah, Guru, Wali Kelas, dan Siswa.</p>
          </div>
          <button
            onClick={() => {
              setUserForm({ username: '', password: '', nama: '', role: 'GURU', status: 'Aktif' });
              setShowUserModal(true);
            }}
            className="px-3.5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Tambah User Baru
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Username Login</th>
                <th className="p-3">Nama Pengguna</th>
                <th className="p-3">Role Hak Akses</th>
                <th className="p-3">Pilihan Kelas</th>
                <th className="p-3">Status Akun</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {usersList.map(u => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-indigo-700">{u.username}</td>
                  <td className="p-3 font-bold text-slate-900">{u.nama}</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-1 rounded-full font-extrabold text-[10px] ${
                      u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                      u.role === 'KEPALA_SEKOLAH' ? 'bg-blue-100 text-blue-800' :
                      u.role === 'WALI_KELAS' ? 'bg-emerald-100 text-emerald-800' :
                      u.role === 'GURU' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3 font-semibold">
                    {u.kelasId ? (
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded text-[11px] font-bold">
                        {kelasList.find(k => k.id === u.kelasId)?.namaKelas || u.kelasId}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">-</span>
                    )}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      u.status === 'Aktif' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={() => {
                        setUserForm(u);
                        setShowUserModal(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-800 p-1"
                      title="Edit User"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus user ${u.username}?`)) {
                          StorageService.deleteUser(u.id);
                          refresh();
                        }
                      }}
                      className="text-rose-600 hover:text-rose-800 p-1"
                      title="Hapus User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* User Modal */}
        {showUserModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
              <h3 className="text-base font-bold text-slate-900 mb-4">{userForm.id ? 'Edit User' : 'Tambah User Baru'}</h3>
              <form onSubmit={handleSaveUser} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={userForm.nama}
                    onChange={e => setUserForm({ ...userForm, nama: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Username Login</label>
                  <input
                    type="text"
                    required
                    value={userForm.username}
                    onChange={e => setUserForm({ ...userForm, username: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Password</label>
                  <input
                    type="password"
                    placeholder={userForm.id ? 'Biarkan kosong jika tidak diubah' : 'Password'}
                    value={userForm.password || ''}
                    onChange={e => setUserForm({ ...userForm, password: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role Hak Akses</label>
                  <select
                    value={userForm.role}
                    onChange={e => setUserForm({ ...userForm, role: e.target.value as any })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 font-bold text-slate-800"
                  >
                    <option value="ADMIN">ADMINISTRATOR</option>
                    <option value="KEPALA_SEKOLAH">KEPALA SEKOLAH</option>
                    <option value="GURU">GURU</option>
                    <option value="WALI_KELAS">WALI KELAS</option>
                    <option value="SISWA">SISWA</option>
                  </select>
                </div>

                {/* Option to select class for Wali Kelas / Guru / Siswa */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Pilihan Kelas (Rombongan Belajar)</span>
                    {userForm.role === 'WALI_KELAS' && (
                      <span className="text-[10px] text-emerald-600 font-bold">*Wajib untuk Wali Kelas</span>
                    )}
                  </label>
                  <select
                    value={userForm.kelasId || ''}
                    onChange={e => setUserForm({ ...userForm, kelasId: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900"
                  >
                    <option value="">-- Tanpa Kelas / Pilih Kelas --</option>
                    {kelasList.map(k => (
                      <option key={k.id} value={k.id}>
                        {k.namaKelas} (Wali: {k.namaWaliKelas || 'Belum ditentukan'})
                      </option>
                    ))}
                  </select>
                  {userForm.role === 'WALI_KELAS' && (
                    <p className="text-[10px] text-indigo-600 mt-1 font-semibold">
                      💡 Penetapan kelas ini otomatis menghubungkan akun user dengan kelas binaan Wali Kelas.
                    </p>
                  )}
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Akun</label>
                  <select
                    value={userForm.status}
                    onChange={e => setUserForm({ ...userForm, status: e.target.value as any })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowUserModal(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl"
                  >
                    Simpan User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // PENGATURAN SEKOLAH
  if (activeMenu === 'pengaturan_sekolah') {
    return (
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Pengaturan Identitas Sekolah</h1>
          <p className="text-xs text-slate-500">Konfigurasi header dokumen, nama kepala sekolah, dan semester aktif.</p>
        </div>

        <form onSubmit={handleSaveSetting} className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Nama Sekolah</label>
            <input
              type="text"
              value={schoolForm.namaSekolah}
              onChange={e => setSchoolForm({ ...schoolForm, namaSekolah: e.target.value })}
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">NPSN</label>
            <input
              type="text"
              value={schoolForm.npsn}
              onChange={e => setSchoolForm({ ...schoolForm, npsn: e.target.value })}
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Alamat Lengkap</label>
            <input
              type="text"
              value={schoolForm.alamat}
              onChange={e => setSchoolForm({ ...schoolForm, alamat: e.target.value })}
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Nama Kepala Sekolah</label>
            <input
              type="text"
              value={schoolForm.kepalaSekolah}
              onChange={e => setSchoolForm({ ...schoolForm, kepalaSekolah: e.target.value })}
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">NIP Kepala Sekolah</label>
            <input
              type="text"
              value={schoolForm.nipKepalaSekolah}
              onChange={e => setSchoolForm({ ...schoolForm, nipKepalaSekolah: e.target.value })}
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tahun Pelajaran</label>
              <input
                type="text"
                value={schoolForm.tahunPelajaran}
                onChange={e => setSchoolForm({ ...schoolForm, tahunPelajaran: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Semester Aktif</label>
              <select
                value={schoolForm.semesterAktif}
                onChange={e => setSchoolForm({ ...schoolForm, semesterAktif: e.target.value as any })}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Ganjil">Ganjil</option>
                <option value="Genap">Genap</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-xs hover:bg-indigo-700 transition-colors"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Fallback
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 text-center text-xs">
      Menu Admin: {activeMenu}
    </div>
  );
};
