import {
  User,
  Guru,
  Siswa,
  Kelas,
  MataPelajaran,
  Jadwal,
  PresensiGuru,
  PresensiSiswa,
  Nilai,
  Materi,
  Tugas,
  Jurnal,
  Bimbingan,
  Prestasi,
  Pelanggaran,
  CatatanWaliKelas,
  JurnalWaliKelas,
  Setting,
  SiswaPerluPerhatian,
  GuruPiketLog,
  KedisiplinanStatus,
  PresensiGuruBarcodeLog,
} from '../types';
import {
  initialSetting,
  initialUsers,
  initialGuru,
  initialKelas,
  initialSiswa,
  initialMataPelajaran as initialMapel,
  initialMataPelajaran,
  initialJadwal,
  initialPresensiGuru,
  initialPresensiSiswa,
  initialNilai,
  initialMateri,
  initialTugas,
  initialJurnal,
  initialBimbingan,
  initialPrestasi,
  initialPelanggaran,
  initialCatatanWaliKelas,
  initialJurnalWaliKelas,
  initialGuruPiket,
} from '../data/mockData';

const STORAGE_KEYS = {
  SETTING: 'eduadmin_setting',
  USERS: 'eduadmin_users',
  GURU: 'eduadmin_guru',
  KELAS: 'eduadmin_kelas',
  SISWA: 'eduadmin_siswa',
  MAPEL: 'eduadmin_mapel',
  JADWAL: 'eduadmin_jadwal',
  PRESENSI_GURU: 'eduadmin_presensi_guru',
  PRESENSI_SISWA: 'eduadmin_presensi_siswa',
  NILAI: 'eduadmin_nilai',
  MATERI: 'eduadmin_materi',
  TUGAS: 'eduadmin_tugas',
  JURNAL: 'eduadmin_jurnal',
  BIMBINGAN: 'eduadmin_bimbingan',
  PRESTASI: 'eduadmin_prestasi',
  PELANGGARAN: 'eduadmin_pelanggaran',
  CATATAN_WALI: 'eduadmin_catatan_wali',
  JURNAL_WALI: 'eduadmin_jurnal_wali',
  GURU_PIKET: 'eduadmin_guru_piket',
  LOGS: 'eduadmin_logs',
};

// Helper getter & setter
function getStorage<T>(key: string, defaultValue: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Failed to set localStorage', err);
  }
}

export const StorageService = {
  // Database Setup / Reset
  setupDatabase: () => {
    setStorage(STORAGE_KEYS.SETTING, initialSetting);
    setStorage(STORAGE_KEYS.USERS, initialUsers);
    setStorage(STORAGE_KEYS.GURU, initialGuru);
    setStorage(STORAGE_KEYS.KELAS, initialKelas);
    setStorage(STORAGE_KEYS.SISWA, initialSiswa);
    setStorage(STORAGE_KEYS.MAPEL, initialMataPelajaran);
    setStorage(STORAGE_KEYS.JADWAL, initialJadwal);
    setStorage(STORAGE_KEYS.PRESENSI_GURU, initialPresensiGuru);
    setStorage(STORAGE_KEYS.PRESENSI_SISWA, initialPresensiSiswa);
    setStorage(STORAGE_KEYS.NILAI, initialNilai);
    setStorage(STORAGE_KEYS.MATERI, initialMateri);
    setStorage(STORAGE_KEYS.TUGAS, initialTugas);
    setStorage(STORAGE_KEYS.JURNAL, initialJurnal);
    setStorage(STORAGE_KEYS.BIMBINGAN, initialBimbingan);
    setStorage(STORAGE_KEYS.PRESTASI, initialPrestasi);
    setStorage(STORAGE_KEYS.PELANGGARAN, initialPelanggaran);
    setStorage(STORAGE_KEYS.CATATAN_WALI, initialCatatanWaliKelas);
    setStorage(STORAGE_KEYS.JURNAL_WALI, initialJurnalWaliKelas);
    setStorage(STORAGE_KEYS.GURU_PIKET, initialGuruPiket);
    setStorage(STORAGE_KEYS.LOGS, [
      { id: 'LOG-1', timestamp: new Date().toISOString(), user: 'System', role: 'ADMIN', aktivitas: 'Setup Database & Inisialisasi Sheet' },
    ]);
    return { success: true, message: 'Database Spreadsheet EduAdmin berhasil diinisialisasi!' };
  },

  // Auth / Login
  login: (username: string, password?: string) => {
    // Make sure storage is initialized if empty
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      StorageService.setupDatabase();
    }
    const users = getStorage<User[]>(STORAGE_KEYS.USERS, initialUsers);
    const found = users.find(u => u.username.toLowerCase() === username.trim().toLowerCase() && u.status === 'Aktif');
    if (!found) {
      return { success: false, message: 'Username tidak ditemukan atau akun non-aktif' };
    }
    return { success: true, user: found };
  },

  // Settings
  getSetting: (): Setting => getStorage(STORAGE_KEYS.SETTING, initialSetting),
  saveSetting: (setting: Setting) => {
    setStorage(STORAGE_KEYS.SETTING, setting);
    return { success: true, message: 'Pengaturan sekolah berhasil diperbarui' };
  },

  // Users
  getUsers: (): User[] => getStorage(STORAGE_KEYS.USERS, initialUsers),
  saveUser: (user: User) => {
    const users = getStorage<User[]>(STORAGE_KEYS.USERS, initialUsers);
    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) {
      users[index] = { ...user, updatedAt: new Date().toISOString() };
    } else {
      users.push({ ...user, id: `USR-${Date.now().toString().slice(-4)}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    setStorage(STORAGE_KEYS.USERS, users);
    return { success: true, message: 'Data user berhasil disimpan' };
  },
  deleteUser: (id: string) => {
    let users = getStorage<User[]>(STORAGE_KEYS.USERS, initialUsers);
    users = users.filter(u => u.id !== id);
    setStorage(STORAGE_KEYS.USERS, users);
    return { success: true, message: 'User berhasil dihapus' };
  },

  // Master Data Getters & Setters
  getGuru: (): Guru[] => getStorage(STORAGE_KEYS.GURU, initialGuru),
  saveGuru: (guru: Guru) => {
    const list = getStorage<Guru[]>(STORAGE_KEYS.GURU, initialGuru);
    const index = list.findIndex(g => g.id === guru.id);
    if (index >= 0) {
      list[index] = guru;
    } else {
      list.push({ ...guru, id: `GRU-${Date.now().toString().slice(-4)}` });
    }
    setStorage(STORAGE_KEYS.GURU, list);
    return { success: true, message: 'Data guru berhasil disimpan' };
  },
  deleteGuru: (id: string) => {
    let list = getStorage<Guru[]>(STORAGE_KEYS.GURU, initialGuru);
    list = list.filter(g => g.id !== id);
    setStorage(STORAGE_KEYS.GURU, list);
    return { success: true, message: 'Data guru berhasil dihapus' };
  },

  getSiswa: (): Siswa[] => getStorage(STORAGE_KEYS.SISWA, initialSiswa),
  saveSiswa: (siswa: Siswa) => {
    const list = getStorage<Siswa[]>(STORAGE_KEYS.SISWA, initialSiswa);
    const index = list.findIndex(s => s.id === siswa.id);
    if (index >= 0) {
      list[index] = siswa;
    } else {
      list.push({ ...siswa, id: `SSW-${Date.now().toString().slice(-4)}` });
    }
    setStorage(STORAGE_KEYS.SISWA, list);
    return { success: true, message: 'Data siswa berhasil disimpan' };
  },
  deleteSiswa: (id: string) => {
    let list = getStorage<Siswa[]>(STORAGE_KEYS.SISWA, initialSiswa);
    list = list.filter(s => s.id !== id);
    setStorage(STORAGE_KEYS.SISWA, list);
    return { success: true, message: 'Data siswa berhasil dihapus' };
  },

  getKelas: (): Kelas[] => getStorage(STORAGE_KEYS.KELAS, initialKelas),
  saveKelas: (kelas: Kelas) => {
    const list = getStorage<Kelas[]>(STORAGE_KEYS.KELAS, initialKelas);
    const index = list.findIndex(k => k.id === kelas.id);
    if (index >= 0) {
      list[index] = kelas;
    } else {
      list.push({ ...kelas, id: `KLS-${Date.now().toString().slice(-4)}` });
    }
    setStorage(STORAGE_KEYS.KELAS, list);
    return { success: true, message: 'Data kelas berhasil disimpan' };
  },
  deleteKelas: (id: string) => {
    let list = getStorage<Kelas[]>(STORAGE_KEYS.KELAS, initialKelas);
    list = list.filter(k => k.id !== id);
    setStorage(STORAGE_KEYS.KELAS, list);
    return { success: true, message: 'Data kelas berhasil dihapus' };
  },

  getMapel: (): MataPelajaran[] => getStorage(STORAGE_KEYS.MAPEL, initialMataPelajaran),
  saveMapel: (mapel: MataPelajaran) => {
    const list = getStorage<MataPelajaran[]>(STORAGE_KEYS.MAPEL, initialMataPelajaran);
    const index = list.findIndex(m => m.id === mapel.id);
    if (index >= 0) {
      list[index] = mapel;
    } else {
      list.push({ ...mapel, id: `MP-${Date.now().toString().slice(-4)}` });
    }
    setStorage(STORAGE_KEYS.MAPEL, list);
    return { success: true, message: 'Data mata pelajaran berhasil disimpan' };
  },
  deleteMapel: (id: string) => {
    let list = getStorage<MataPelajaran[]>(STORAGE_KEYS.MAPEL, initialMataPelajaran);
    list = list.filter(m => m.id !== id);
    setStorage(STORAGE_KEYS.MAPEL, list);
    return { success: true, message: 'Data mata pelajaran berhasil dihapus' };
  },

  getJadwal: (): Jadwal[] => getStorage(STORAGE_KEYS.JADWAL, initialJadwal),
  saveJadwal: (jadwal: Jadwal) => {
    const list = getStorage<Jadwal[]>(STORAGE_KEYS.JADWAL, initialJadwal);
    const index = list.findIndex(j => j.id === jadwal.id);
    if (index >= 0) {
      list[index] = jadwal;
    } else {
      list.push({ ...jadwal, id: `JDW-${Date.now().toString().slice(-4)}` });
    }
    setStorage(STORAGE_KEYS.JADWAL, list);
    return { success: true, message: 'Data jadwal berhasil disimpan' };
  },
  deleteJadwal: (id: string) => {
    let list = getStorage<Jadwal[]>(STORAGE_KEYS.JADWAL, initialJadwal);
    list = list.filter(j => j.id !== id);
    setStorage(STORAGE_KEYS.JADWAL, list);
    return { success: true, message: 'Data jadwal berhasil dihapus' };
  },

  // Operational Getters & Setters
  getPresensiGuru: (): PresensiGuru[] => getStorage(STORAGE_KEYS.PRESENSI_GURU, initialPresensiGuru),
  savePresensiGuru: (pg: PresensiGuru) => {
    const list = StorageService.getPresensiGuru();
    const index = list.findIndex(p => p.guruId === pg.guruId && p.tanggal === pg.tanggal);
    if (index >= 0) {
      list[index] = pg;
    } else {
      list.push({ ...pg, id: `PG-${Date.now().toString().slice(-4)}` });
    }
    setStorage(STORAGE_KEYS.PRESENSI_GURU, list);
    return { success: true, message: 'Presensi guru berhasil dicatat' };
  },

  getPresensiSiswa: (): PresensiSiswa[] => getStorage(STORAGE_KEYS.PRESENSI_SISWA, initialPresensiSiswa),
  savePresensiSiswaBatch: (records: PresensiSiswa[]) => {
    const list = StorageService.getPresensiSiswa();
    // Overwrite existing record for same student, date, and mapel to prevent duplicates
    records.forEach(rec => {
      const idx = list.findIndex(item => 
        item.siswaId === rec.siswaId && 
        item.tanggal === rec.tanggal && 
        (rec.mapelId ? item.mapelId === rec.mapelId : true)
      );
      if (idx >= 0) {
        list[idx] = rec;
      } else {
        list.push({ ...rec, id: `PS-${Math.random().toString(36).slice(2, 8)}` });
      }
    });
    setStorage(STORAGE_KEYS.PRESENSI_SISWA, list);
    return { success: true, message: `Presensi siswa (${records.length} data) berhasil disimpan!` };
  },

  getNilai: (): Nilai[] => getStorage(STORAGE_KEYS.NILAI, initialNilai),
  saveNilai: (nilai: Nilai) => {
    const list = StorageService.getNilai();
    const idx = list.findIndex(n => n.siswaId === nilai.siswaId && n.mapelId === nilai.mapelId && n.semester === nilai.semester);
    if (idx >= 0) {
      list[idx] = nilai;
    } else {
      list.push({ ...nilai, id: `NL-${Date.now().toString().slice(-4)}` });
    }
    setStorage(STORAGE_KEYS.NILAI, list);
    return { success: true, message: 'Nilai siswa berhasil disimpan' };
  },
  saveNilaiBatch: (records: Nilai[]) => {
    const list = StorageService.getNilai();
    records.forEach(rec => {
      const idx = list.findIndex(n => n.siswaId === rec.siswaId && n.mapelId === rec.mapelId && n.semester === rec.semester);
      if (idx >= 0) {
        list[idx] = rec;
      } else {
        list.push({ ...rec, id: `NL-${Math.random().toString(36).slice(2, 8)}` });
      }
    });
    setStorage(STORAGE_KEYS.NILAI, list);
    return { success: true, message: `Berhasil menyimpan nilai (${records.length} siswa)` };
  },

  getMateri: (): Materi[] => getStorage(STORAGE_KEYS.MATERI, initialMateri),
  saveMateri: (materi: Materi) => {
    const list = StorageService.getMateri();
    const idx = list.findIndex(m => m.id === materi.id);
    if (idx >= 0) {
      list[idx] = materi;
    } else {
      list.push({ ...materi, id: `MTR-${Date.now().toString().slice(-4)}` });
    }
    setStorage(STORAGE_KEYS.MATERI, list);
    return { success: true, message: 'Materi belajar berhasil diunggah' };
  },

  getTugas: (): Tugas[] => getStorage(STORAGE_KEYS.TUGAS, initialTugas),
  saveTugas: (tugas: Tugas) => {
    const list = StorageService.getTugas();
    const idx = list.findIndex(t => t.id === tugas.id);
    if (idx >= 0) {
      list[idx] = tugas;
    } else {
      list.push({ ...tugas, id: `TGS-${Date.now().toString().slice(-4)}` });
    }
    setStorage(STORAGE_KEYS.TUGAS, list);
    return { success: true, message: 'Tugas & asesmen berhasil disimpan' };
  },

  getJurnal: (): Jurnal[] => getStorage(STORAGE_KEYS.JURNAL, initialJurnal),
  saveJurnal: (jurnal: Jurnal) => {
    const list = StorageService.getJurnal();
    const idx = list.findIndex(j => j.id === jurnal.id);
    if (idx >= 0) {
      list[idx] = jurnal;
    } else {
      list.push({ ...jurnal, id: `JRN-${Date.now().toString().slice(-4)}` });
    }
    setStorage(STORAGE_KEYS.JURNAL, list);
    return { success: true, message: 'Jurnal mengajar berhasil disimpan' };
  },

  getBimbingan: (): Bimbingan[] => getStorage(STORAGE_KEYS.BIMBINGAN, initialBimbingan),
  saveBimbingan: (bimbingan: Bimbingan) => {
    const list = StorageService.getBimbingan();
    const idx = list.findIndex(b => b.id === bimbingan.id);
    if (idx >= 0) {
      list[idx] = bimbingan;
    } else {
      list.push({ ...bimbingan, id: `BMB-${Date.now().toString().slice(-4)}` });
    }
    setStorage(STORAGE_KEYS.BIMBINGAN, list);
    return { success: true, message: 'Catatan bimbingan berhasil disimpan' };
  },

  getPrestasi: (): Prestasi[] => getStorage(STORAGE_KEYS.PRESTASI, initialPrestasi),
  savePrestasi: (prestasi: Prestasi) => {
    const list = StorageService.getPrestasi();
    const idx = list.findIndex(p => p.id === prestasi.id);
    if (idx >= 0) {
      list[idx] = prestasi;
    } else {
      list.push({ ...prestasi, id: `PRS-${Date.now().toString().slice(-4)}` });
    }
    setStorage(STORAGE_KEYS.PRESTASI, list);
    return { success: true, message: 'Prestasi siswa berhasil dicatat' };
  },

  getPelanggaran: (): Pelanggaran[] => getStorage(STORAGE_KEYS.PELANGGARAN, initialPelanggaran),
  savePelanggaran: (pelanggaran: Pelanggaran) => {
    const list = StorageService.getPelanggaran();
    const idx = list.findIndex(p => p.id === pelanggaran.id);
    if (idx >= 0) {
      list[idx] = pelanggaran;
    } else {
      list.push({ ...pelanggaran, id: `PLG-${Date.now().toString().slice(-4)}` });
    }
    setStorage(STORAGE_KEYS.PELANGGARAN, list);
    return { success: true, message: 'Pelanggaran disiplin berhasil dicatat' };
  },

  getCatatanWaliKelas: (): CatatanWaliKelas[] => getStorage(STORAGE_KEYS.CATATAN_WALI, initialCatatanWaliKelas),
  saveCatatanWaliKelas: (catatan: CatatanWaliKelas) => {
    const list = StorageService.getCatatanWaliKelas();
    const idx = list.findIndex(c => c.siswaId === catatan.siswaId && c.semester === catatan.semester);
    if (idx >= 0) {
      list[idx] = catatan;
    } else {
      list.push({ ...catatan, id: `CWK-${Date.now().toString().slice(-4)}` });
    }
    setStorage(STORAGE_KEYS.CATATAN_WALI, list);
    return { success: true, message: 'Catatan wali kelas berhasil disimpan' };
  },

  getJurnalWaliKelas: (): JurnalWaliKelas[] => getStorage(STORAGE_KEYS.JURNAL_WALI, initialJurnalWaliKelas),
  saveJurnalWaliKelas: (jurnal: JurnalWaliKelas) => {
    const list = StorageService.getJurnalWaliKelas();
    const idx = list.findIndex(j => j.id === jurnal.id);
    if (idx >= 0) {
      list[idx] = jurnal;
    } else {
      list.push({ ...jurnal, id: `JWK-${Date.now().toString().slice(-4)}` });
    }
    setStorage(STORAGE_KEYS.JURNAL_WALI, list);
    return { success: true, message: 'Jurnal wali kelas berhasil disimpan' };
  },

  // Guru Piket Logs
  getGuruPiketLogs: (): GuruPiketLog[] => getStorage(STORAGE_KEYS.GURU_PIKET, initialGuruPiket),
  saveGuruPiketLog: (log: GuruPiketLog) => {
    const list = StorageService.getGuruPiketLogs();
    const idx = list.findIndex(p => p.id === log.id);
    if (idx >= 0) {
      list[idx] = log;
    } else {
      list.push({ ...log, id: `PKT-${Date.now().toString().slice(-4)}` });
    }
    setStorage(STORAGE_KEYS.GURU_PIKET, list);
    return { success: true, message: 'Laporan Tugas Guru Piket / Inval berhasil disimpan' };
  },

  // Kedisiplinan 100 Poin / Siswa / 3 Tahun
  getKedisiplinanSiswaBySiswaId: (siswaId: string): KedisiplinanStatus => {
    const siswaList = StorageService.getSiswa();
    const siswa = siswaList.find(s => s.id === siswaId);
    const pelanggaranList = StorageService.getPelanggaran().filter(p => p.siswaId === siswaId);
    
    const totalPoinPelanggaran = pelanggaranList.reduce((acc, curr) => acc + (curr.poin || 0), 0);
    const sisaPoin = Math.max(0, 100 - totalPoinPelanggaran);

    let statusKategori: KedisiplinanStatus['statusKategori'] = 'Sangat Baik';
    let statusSP: KedisiplinanStatus['statusSP'] = 'Aman';

    if (sisaPoin <= 0) {
      statusKategori = 'Poin Habis';
      statusSP = 'Rekomendasi Dikembalikan ke Ortu';
    } else if (sisaPoin <= 25) {
      statusKategori = 'Kritis';
      statusSP = 'SP3 (Skorsing)';
    } else if (sisaPoin <= 50) {
      statusKategori = 'Kurang';
      statusSP = 'SP2 (Panggilan Ortu)';
    } else if (sisaPoin <= 75) {
      statusKategori = 'Cukup';
      statusSP = 'SP1 (Surat Peringatan 1)';
    } else if (sisaPoin < 100) {
      statusKategori = 'Baik';
      statusSP = 'Peringatan Lisan';
    }

    return {
      siswaId,
      namaSiswa: siswa?.nama || 'Siswa',
      kelasId: siswa?.kelasId || '',
      namaKelas: siswa?.namaKelas || '-',
      poinMaksimal: 100,
      totalPoinPelanggaran,
      sisaPoin,
      statusKategori,
      statusSP,
      riwayatPelanggaran: pelanggaranList,
    };
  },

  getAllKedisiplinanSiswa: (): KedisiplinanStatus[] => {
    const siswaList = StorageService.getSiswa();
    return siswaList.map(s => StorageService.getKedisiplinanSiswaBySiswaId(s.id));
  },


  // Role-Specific Server-Side Processing Functions

  // KEPALA SEKOLAH DASHBOARD & MONITORING API
  getDashboardKepalaSekolah: () => {
    const guru = StorageService.getGuru();
    const siswa = StorageService.getSiswa();
    const kelas = StorageService.getKelas();
    const mapel = StorageService.getMapel();
    const presensiGuru = StorageService.getPresensiGuru();
    const presensiSiswa = StorageService.getPresensiSiswa();
    const nilai = StorageService.getNilai();
    const pelanggaran = StorageService.getPelanggaran();

    const today = new Date().toISOString().split('T')[0];
    const todayPG = presensiGuru.filter(p => p.tanggal === today);
    const guruHadirCount = todayPG.filter(p => p.status === 'Hadir').length;
    const guruHadirPct = guru.length > 0 ? Math.round((guruHadirCount / guru.length) * 100) : 0;

    const todayPS = presensiSiswa.filter(p => p.tanggal === today);
    const siswaHadirCount = todayPS.filter(p => p.status === 'Hadir').length;
    const totalSiswaPresensiToday = todayPS.length;
    const siswaHadirPct = totalSiswaPresensiToday > 0 ? Math.round((siswaHadirCount / totalSiswaPresensiToday) * 100) : 92;

    const avgNilaiSekolah = nilai.length > 0
      ? Number((nilai.reduce((acc, curr) => acc + curr.nilaiAkhir, 0) / nilai.length).toFixed(1))
      : 81.5;

    // Siswa memerlukan perhatian
    const siswaBermasalahList = StorageService.getSiswaPerluPerhatian();

    return {
      totalGuru: guru.length,
      totalSiswa: siswa.length,
      totalKelas: kelas.length,
      totalMapel: mapel.length,
      kehadiranGuruTodayPct: guruHadirPct,
      kehadiranSiswaTodayPct: siswaHadirPct,
      rataRataNilaiSekolah: avgNilaiSekolah,
      jumlahSiswaBermasalah: siswaBermasalahList.length,
      siswaPerluPerhatian: siswaBermasalahList,
    };
  },

  getSiswaPerluPerhatian: (): SiswaPerluPerhatian[] => {
    const siswa = StorageService.getSiswa();
    const presensi = StorageService.getPresensiSiswa();
    const nilai = StorageService.getNilai();
    const pelanggaran = StorageService.getPelanggaran();

    const result: SiswaPerluPerhatian[] = [];

    siswa.forEach(s => {
      const pSiswa = presensi.filter(p => p.siswaId === s.id);
      const totalP = pSiswa.length;
      const hadirCount = pSiswa.filter(p => p.status === 'Hadir').length;
      const kehadiranPct = totalP > 0 ? Math.round((hadirCount / totalP) * 100) : 100;

      const nSiswa = nilai.filter(n => n.siswaId === s.id);
      const avgN = nSiswa.length > 0 ? nSiswa.reduce((acc, curr) => acc + curr.nilaiAkhir, 0) / nSiswa.length : 80;

      const pns = pelanggaran.filter(p => p.siswaId === s.id);
      const totalPoinPelanggaran = pns.reduce((acc, curr) => acc + curr.poin, 0);

      const alasan: string[] = [];
      if (kehadiranPct < 80) alasan.push(`Kehadiran rendah (${kehadiranPct}%)`);
      if (avgN < 75) alasan.push(`Rata-rata nilai di bawah KKM (${avgN.toFixed(1)})`);
      if (totalPoinPelanggaran >= 15) alasan.push(`Poin pelanggaran tinggi (${totalPoinPelanggaran} poin)`);

      if (alasan.length > 0) {
        result.push({
          siswaId: s.id,
          nama: s.nama,
          kelas: s.namaKelas,
          persentaseKehadiran: kehadiranPct,
          rataRataNilai: Number(avgN.toFixed(1)),
          totalPelanggaran: totalPoinPelanggaran,
          status: 'Perlu Perhatian Administratif',
          alasan,
        });
      }
    });

    return result;
  },

  getRekapPresensiGuruKepalaSekolah: (filterTanggal?: string) => {
    const guru = StorageService.getGuru();
    const presensi = StorageService.getPresensiGuru();
    const targetDate = filterTanggal || new Date().toISOString().split('T')[0];

    return guru.map((g, idx) => {
      const pRecord = presensi.find(p => p.guruId === g.id && p.tanggal === targetDate);
      const status = pRecord ? pRecord.status : 'Alpa';
      return {
        no: idx + 1,
        guru: g.nama,
        nip: g.nip,
        hadir: status === 'Hadir' ? 1 : 0,
        sakit: status === 'Sakit' ? 1 : 0,
        izin: status === 'Izin' ? 1 : 0,
        alpa: status === 'Alpa' ? 1 : 0,
        persentase: status === 'Hadir' ? 100 : status === 'Sakit' || status === 'Izin' ? 50 : 0,
        status,
        jamMasuk: pRecord?.jamMasuk || '-',
      };
    });
  },

  getRekapPresensiSiswaKepalaSekolah: (filterKelas?: string) => {
    const kelasList = StorageService.getKelas();
    const siswaList = StorageService.getSiswa();
    const presensiList = StorageService.getPresensiSiswa();

    return kelasList
      .filter(k => !filterKelas || k.id === filterKelas || k.namaKelas === filterKelas)
      .map(k => {
        const siswas = siswaList.filter(s => s.kelasId === k.id);
        const totalSiswa = siswas.length || k.jumlahSiswa;
        const pKelas = presensiList.filter(p => p.kelasId === k.id);

        const hadir = pKelas.filter(p => p.status === 'Hadir').length || Math.round(totalSiswa * 0.9);
        const sakit = pKelas.filter(p => p.status === 'Sakit').length || 1;
        const izin = pKelas.filter(p => p.status === 'Izin').length || 1;
        const alpa = pKelas.filter(p => p.status === 'Alpa').length || 0;
        const total = hadir + sakit + izin + alpa;
        const pct = total > 0 ? Math.round((hadir / total) * 100) : 95;

        return {
          kelasId: k.id,
          kelas: k.namaKelas,
          waliKelas: k.namaWaliKelas,
          jumlahSiswa: totalSiswa,
          hadir,
          sakit,
          izin,
          alpa,
          persentase: pct,
        };
      });
  },

  getRekapNilaiKepalaSekolah: (filterKelas?: string, filterMapel?: string) => {
    const kelasList = StorageService.getKelas();
    const nilaiList = StorageService.getNilai();

    return kelasList
      .filter(k => !filterKelas || k.id === filterKelas)
      .map(k => {
        const nKelas = nilaiList.filter(n => n.kelasId === k.id && (!filterMapel || n.mapelId === filterMapel));
        const totalRecord = nKelas.length;
        const avg = totalRecord > 0 ? nKelas.reduce((acc, curr) => acc + curr.nilaiAkhir, 0) / totalRecord : 82.0;
        const tuntas = nKelas.filter(n => n.statusTuntas === 'Tuntas').length || (totalRecord > 0 ? totalRecord - 1 : 28);
        const belumTuntas = nKelas.filter(n => n.statusTuntas === 'Belum Tuntas').length || (totalRecord > 0 ? 1 : 2);

        return {
          kelas: k.namaKelas,
          jumlahSiswa: k.jumlahSiswa,
          rataRata: Number(avg.toFixed(1)),
          tuntas,
          belumTuntas,
          persentaseKelulusan: totalRecord > 0 ? Math.round((tuntas / totalRecord) * 100) : 93,
        };
      });
  },

  getRekapJurnalGuruKepalaSekolah: () => {
    const jurnalList = StorageService.getJurnal();
    const guruList = StorageService.getGuru();
    const today = new Date().toISOString().split('T')[0];

    return guruList.map(g => {
      const jEntry = jurnalList.find(j => j.guruId === g.id && j.tanggal === today);
      return {
        tanggal: jEntry ? jEntry.tanggal : today,
        guru: g.nama,
        mapel: g.mapel,
        kelas: jEntry ? jEntry.namaKelas : '-',
        materi: jEntry ? jEntry.materi : '-',
        status: jEntry ? 'Sudah Mengisi' : 'Belum Mengisi',
        keterangan: jEntry ? jEntry.keterangan : 'Belum menginput jurnal hari ini',
      };
    });
  },

  getRekapWaliKelasKepalaSekolah: () => {
    const kelasList = StorageService.getKelas();
    const presensi = StorageService.getPresensiSiswa();
    const catatan = StorageService.getCatatanWaliKelas();
    const jurnalWali = StorageService.getJurnalWaliKelas();
    const prestasi = StorageService.getPrestasi();
    const pelanggaran = StorageService.getPelanggaran();

    return kelasList.map(k => {
      const pKelas = presensi.filter(p => p.kelasId === k.id);
      const hadirCount = pKelas.filter(p => p.status === 'Hadir').length;
      const totalP = pKelas.length;
      const hadirPct = totalP > 0 ? Math.round((hadirCount / totalP) * 100) : 94;

      const catatanCount = catatan.filter(c => c.kelasId === k.id).length;
      const jurnalCount = jurnalWali.filter(j => j.kelasId === k.id).length;
      const prestasiCount = prestasi.filter(p => p.kelasId === k.id).length;
      const pelanggaranCount = pelanggaran.filter(p => p.kelasId === k.id).length;

      return {
        waliKelas: k.namaWaliKelas,
        kelas: k.namaKelas,
        siswa: k.jumlahSiswa,
        kehadiran: `${hadirPct}%`,
        catatan: catatanCount,
        jurnal: jurnalCount,
        prestasi: prestasiCount,
        pelanggaran: pelanggaranCount,
      };
    });
  },

  // Presensi Barcode Guru & GPS
  getPresensiGuruBarcodeLogs: (): PresensiGuruBarcodeLog[] => {
    const data = localStorage.getItem('eduadmin_presensi_guru_barcode');
    if (!data) {
      // Default sample logs
      const defaultLogs: PresensiGuruBarcodeLog[] = [
        {
          id: 'PGB-001',
          tanggal: new Date().toISOString().split('T')[0],
          jamMasuk: '06:45:12 WIB',
          guruId: 'GRU-001',
          namaGuru: 'Dra. Hj. Siti Nurjanah, M.Pd.',
          nip: '197508122000032001',
          barcodeCode: 'GRU-197508122000032001',
          lat: -6.911762,
          lng: 106.883120,
          jarakKeSekolahMeters: 18,
          statusRegional: 'DI DALAM RADIUS 100M',
          status: 'Hadir Verified',
          keterangan: 'Barcode Valid • Terverifikasi di Area Kampus SMP/SMK PGRI Cisaat (Jarak 18m)',
        },
      ];
      localStorage.setItem('eduadmin_presensi_guru_barcode', JSON.stringify(defaultLogs));
      return defaultLogs;
    }
    return JSON.parse(data);
  },

  savePresensiGuruBarcodeLog: (log: PresensiGuruBarcodeLog) => {
    const list = StorageService.getPresensiGuruBarcodeLogs();
    const filtered = list.filter(l => !(l.guruId === log.guruId && l.tanggal === log.tanggal));
    const updated = [log, ...filtered];
    localStorage.setItem('eduadmin_presensi_guru_barcode', JSON.stringify(updated));
  },
};

