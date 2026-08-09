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
  GuruPiketLog,
} from '../types';

export const initialSetting: Setting = {
  namaSekolah: 'SMK NEGERI 1 EDUADMIN',
  npsn: '20234567',
  alamat: 'Jl. Pendidikan No. 45, Kompleks Akademik',
  kepalaSekolah: 'Dr. H. Ahmad Dahlan, M.Pd.',
  nipKepalaSekolah: '19680512 199303 1 005',
  tahunPelajaran: '2025/2026',
  semesterAktif: 'Ganjil',
};

export const initialUsers: User[] = [
  {
    id: 'USR-001',
    username: 'admin',
    nama: 'Administrator Utama',
    role: 'ADMIN',
    status: 'Aktif',
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
  },
  {
    id: 'USR-002',
    username: 'kepala',
    nama: 'Dr. H. Ahmad Dahlan, M.Pd.',
    role: 'KEPALA_SEKOLAH',
    guruId: 'GRU-000',
    status: 'Aktif',
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
  },
  {
    id: 'USR-003',
    username: 'guru1',
    nama: 'Budi Santoso, S.Pd.',
    role: 'GURU',
    guruId: 'GRU-001',
    status: 'Aktif',
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
  },
  {
    id: 'USR-004',
    username: 'wali1',
    nama: 'Siti Rahma, S.Pd.',
    role: 'WALI_KELAS',
    guruId: 'GRU-002',
    kelasId: 'KLS-101',
    status: 'Aktif',
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
  },
  {
    id: 'USR-005',
    username: 'siswa1',
    nama: 'Andi Saputra',
    role: 'SISWA',
    siswaId: 'SSW-101',
    kelasId: 'KLS-101',
    status: 'Aktif',
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
  },
  {
    id: 'USR-006',
    username: 'siswa2',
    nama: 'Dewi Lestari',
    role: 'SISWA',
    siswaId: 'SSW-102',
    kelasId: 'KLS-101',
    status: 'Aktif',
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
  },
  {
    id: 'USR-007',
    username: 'wali2',
    nama: 'Dedi Kurniawan, M.T.',
    role: 'WALI_KELAS',
    guruId: 'GRU-003',
    kelasId: 'KLS-102',
    status: 'Aktif',
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
  },
];

export const initialGuru: Guru[] = [
  {
    id: 'GRU-001',
    nip: '19820315 200801 1 012',
    nama: 'Budi Santoso, S.Pd.',
    email: 'budi.santoso@eduadmin.sch.id',
    noHp: '081234567890',
    mapel: 'Matematika',
    status: 'PNS',
    jamMengajar: 24,
  },
  {
    id: 'GRU-002',
    nip: '19850720 201001 2 018',
    nama: 'Siti Rahma, S.Pd.',
    email: 'siti.rahma@eduadmin.sch.id',
    noHp: '081398765432',
    mapel: 'Bahasa Indonesia',
    status: 'PNS',
    jamMengajar: 28,
    kelasWali: 'X TO 1',
  },
  {
    id: 'GRU-003',
    nip: '19901105 201802 1 004',
    nama: 'Dedi Kurniawan, M.T.',
    email: 'dedi.kurniawan@eduadmin.sch.id',
    noHp: '082145678901',
    mapel: 'Teknik Otomotif',
    status: 'PNS',
    jamMengajar: 30,
    kelasWali: 'X TO 2',
  },
  {
    id: 'GRU-004',
    nip: '19940812 202203 2 009',
    nama: 'Rina Wijaya, S.Kom.',
    email: 'rina.wijaya@eduadmin.sch.id',
    noHp: '085712345678',
    mapel: 'Informatika',
    status: 'GTT',
    jamMengajar: 20,
    kelasWali: 'XI TO 1',
  },
  {
    id: 'GRU-005',
    nip: '19880425 201401 1 007',
    nama: 'Eko Prasetyo, S.Pd.',
    email: 'eko.prasetyo@eduadmin.sch.id',
    noHp: '081987654321',
    mapel: 'Bahasa Inggris',
    status: 'PNS',
    jamMengajar: 26,
  },
];

export const initialKelas: Kelas[] = [
  {
    id: 'KLS-101',
    namaKelas: 'X TO 1',
    tingkat: 'X',
    waliKelasId: 'GRU-002',
    namaWaliKelas: 'Siti Rahma, S.Pd.',
    jumlahSiswa: 32,
  },
  {
    id: 'KLS-102',
    namaKelas: 'X TO 2',
    tingkat: 'X',
    waliKelasId: 'GRU-003',
    namaWaliKelas: 'Dedi Kurniawan, M.T.',
    jumlahSiswa: 30,
  },
  {
    id: 'KLS-201',
    namaKelas: 'XI TO 1',
    tingkat: 'XI',
    waliKelasId: 'GRU-004',
    namaWaliKelas: 'Rina Wijaya, S.Kom.',
    jumlahSiswa: 31,
  },
  {
    id: 'KLS-202',
    namaKelas: 'XI TO 2',
    tingkat: 'XI',
    waliKelasId: 'GRU-001',
    namaWaliKelas: 'Budi Santoso, S.Pd.',
    jumlahSiswa: 29,
  },
];

export const initialSiswa: Siswa[] = [
  {
    id: 'SSW-101',
    nis: '251001',
    nisn: '0081234561',
    nama: 'Andi Saputra',
    gender: 'L',
    kelasId: 'KLS-101',
    namaKelas: 'X TO 1',
    alamat: 'Jl. Raya Cisaat No. 12, Sukabumi',
    noHpOrangtua: '081211112222',
    status: 'Aktif',
    alamatRumah: 'Jl. Raya Cisaat No. 12, RT 02/05, Desa Cisaat, Sukabumi',
    namaOrtu: 'Bpk. Bambang Saputra',
    kontakOrtu: '081211112222',
    pekerjaanOrtu: 'Wiraswasta',
    catatanKhusus: 'Penerima Program KIP Sekolah, Berbakat dalam bidang Praktik Mesin',
  },
  {
    id: 'SSW-102',
    nis: '251002',
    nisn: '0081234562',
    nama: 'Dewi Lestari',
    gender: 'P',
    kelasId: 'KLS-101',
    namaKelas: 'X TO 1',
    alamat: 'Jl. Melati No. 8, Cisaat Sukabumi',
    noHpOrangtua: '081233334444',
    status: 'Aktif',
    alamatRumah: 'Jl. Melati No. 8, RT 01/03, Kec. Cisaat, Sukabumi',
    namaOrtu: 'Ibu Ratna Lestari',
    kontakOrtu: '081233334444',
    pekerjaanOrtu: 'PNS / Guru',
    catatanKhusus: 'Aktif Pengurus OSIS, Juara LKS Tingkat Kabupaten',
  },
  {
    id: 'SSW-103',
    nis: '251003',
    nisn: '0081234563',
    nama: 'Fajar Nugraha',
    gender: 'L',
    kelasId: 'KLS-101',
    namaKelas: 'X TO 1',
    alamat: 'Jl. Anggrek No. 15, Sukabumi',
    noHpOrangtua: '081255556666',
    status: 'Aktif',
    alamatRumah: 'Jl. Anggrek No. 15, RT 04/02, Nagrak, Sukabumi',
    namaOrtu: 'Bpk. Surya Nugraha',
    kontakOrtu: '081255556666',
    pekerjaanOrtu: 'Karyawan Swasta',
  },
  {
    id: 'SSW-104',
    nis: '251004',
    nisn: '0081234564',
    nama: 'Gita Gutawa',
    gender: 'P',
    kelasId: 'KLS-101',
    namaKelas: 'X TO 1',
    alamat: 'Jl. Dahlia No. 3, Sukabumi',
    noHpOrangtua: '081277778888',
    status: 'Aktif',
    alamatRumah: 'Jl. Dahlia No. 3, RT 03/01, Cisaat, Sukabumi',
    namaOrtu: 'Bpk. Herman Gutawa',
    kontakOrtu: '081277778888',
    pekerjaanOrtu: 'Wiraswasta',
  },
  {
    id: 'SSW-105',
    nis: '251005',
    nisn: '0081234565',
    nama: 'Hendrik Pratama',
    gender: 'L',
    kelasId: 'KLS-102',
    namaKelas: 'X TO 2',
    alamat: 'Jl. Kenanga No. 22, Sukabumi',
    noHpOrangtua: '081299990000',
    status: 'Aktif',
    alamatRumah: 'Jl. Kenanga No. 22, RT 05/04, Cicantayan, Sukabumi',
    namaOrtu: 'Bpk. Wawan Pratama',
    kontakOrtu: '081299990000',
    pekerjaanOrtu: 'Petani / Perkebunan',
  },
  {
    id: 'SSW-106',
    nis: '251006',
    nisn: '0081234566',
    nama: 'Irfan Bachdim',
    gender: 'L',
    kelasId: 'KLS-102',
    namaKelas: 'X TO 2',
    alamat: 'Jl. Garuda No. 4',
    noHpOrangtua: '081312341234',
    status: 'Aktif',
  },
];

export const initialMataPelajaran: MataPelajaran[] = [
  { id: 'MP-001', kodeMapel: 'MAT', namaMapel: 'Matematika', kkm: 75, kelompok: 'Umum' },
  { id: 'MP-002', kodeMapel: 'BIN', namaMapel: 'Bahasa Indonesia', kkm: 75, kelompok: 'Umum' },
  { id: 'MP-003', kodeMapel: 'BIG', namaMapel: 'Bahasa Inggris', kkm: 75, kelompok: 'Umum' },
  { id: 'MP-004', kodeMapel: 'TKR', namaMapel: 'Teknik Otomotif', kkm: 78, kelompok: 'Kejuruan' },
  { id: 'MP-005', kodeMapel: 'INF', namaMapel: 'Informatika', kkm: 75, kelompok: 'Kejuruan' },
];

export const initialJadwal: Jadwal[] = [
  {
    id: 'JDW-001',
    hari: 'Senin',
    jamKe: '07.30 - 09.00',
    kelasId: 'KLS-101',
    namaKelas: 'X TO 1',
    mapelId: 'MP-001',
    namaMapel: 'Matematika',
    guruId: 'GRU-001',
    namaGuru: 'Budi Santoso, S.Pd.',
    ruang: 'R.101',
  },
  {
    id: 'JDW-002',
    hari: 'Senin',
    jamKe: '09.15 - 11.30',
    kelasId: 'KLS-101',
    namaKelas: 'X TO 1',
    mapelId: 'MP-002',
    namaMapel: 'Bahasa Indonesia',
    guruId: 'GRU-002',
    namaGuru: 'Siti Rahma, S.Pd.',
    ruang: 'R.101',
  },
  {
    id: 'JDW-003',
    hari: 'Selasa',
    jamKe: '07.30 - 12.00',
    kelasId: 'KLS-101',
    namaKelas: 'X TO 1',
    mapelId: 'MP-004',
    namaMapel: 'Teknik Otomotif',
    guruId: 'GRU-003',
    namaGuru: 'Dedi Kurniawan, M.T.',
    ruang: 'Bengkel TKR',
  },
  {
    id: 'JDW-004',
    hari: 'Rabu',
    jamKe: '07.30 - 09.45',
    kelasId: 'KLS-102',
    namaKelas: 'X TO 2',
    mapelId: 'MP-001',
    namaMapel: 'Matematika',
    guruId: 'GRU-001',
    namaGuru: 'Budi Santoso, S.Pd.',
    ruang: 'R.102',
  },
];

const todayStr = new Date().toISOString().split('T')[0];

export const initialPresensiGuru: PresensiGuru[] = [
  { id: 'PG-001', tanggal: todayStr, guruId: 'GRU-001', namaGuru: 'Budi Santoso, S.Pd.', status: 'Hadir', jamMasuk: '06.50', keterangan: 'Tepat Waktu' },
  { id: 'PG-002', tanggal: todayStr, guruId: 'GRU-002', namaGuru: 'Siti Rahma, S.Pd.', status: 'Hadir', jamMasuk: '07.02', keterangan: 'Hadir' },
  { id: 'PG-003', tanggal: todayStr, guruId: 'GRU-003', namaGuru: 'Dedi Kurniawan, M.T.', status: 'Hadir', jamMasuk: '06.55', keterangan: 'Hadir' },
  { id: 'PG-004', tanggal: todayStr, guruId: 'GRU-004', namaGuru: 'Rina Wijaya, S.Kom.', status: 'Izin', jamMasuk: '-', keterangan: 'Tugas Luar' },
  { id: 'PG-005', tanggal: todayStr, guruId: 'GRU-005', namaGuru: 'Eko Prasetyo, S.Pd.', status: 'Sakit', jamMasuk: '-', keterangan: 'Surat Dokter' },
];

export const initialPresensiSiswa: PresensiSiswa[] = [
  { id: 'PS-001', tanggal: todayStr, kelasId: 'KLS-101', siswaId: 'SSW-101', namaSiswa: 'Andi Saputra', status: 'Hadir', keterangan: '', diinputOleh: 'Siti Rahma, S.Pd.' },
  { id: 'PS-002', tanggal: todayStr, kelasId: 'KLS-101', siswaId: 'SSW-102', namaSiswa: 'Dewi Lestari', status: 'Hadir', keterangan: '', diinputOleh: 'Siti Rahma, S.Pd.' },
  { id: 'PS-003', tanggal: todayStr, kelasId: 'KLS-101', siswaId: 'SSW-103', namaSiswa: 'Fajar Nugraha', status: 'Sakit', keterangan: 'Demam', diinputOleh: 'Siti Rahma, S.Pd.' },
  { id: 'PS-004', tanggal: todayStr, kelasId: 'KLS-101', siswaId: 'SSW-104', namaSiswa: 'Gita Gutawa', status: 'Hadir', keterangan: '', diinputOleh: 'Siti Rahma, S.Pd.' },
  { id: 'PS-005', tanggal: todayStr, kelasId: 'KLS-102', siswaId: 'SSW-105', namaSiswa: 'Hendrik Pratama', status: 'Alpa', keterangan: 'Tanpa Keterangan', diinputOleh: 'Dedi Kurniawan, M.T.' },
  { id: 'PS-006', tanggal: todayStr, kelasId: 'KLS-102', siswaId: 'SSW-106', namaSiswa: 'Irfan Bachdim', status: 'Hadir', keterangan: '', diinputOleh: 'Dedi Kurniawan, M.T.' },
];

export const initialNilai: Nilai[] = [
  { id: 'NL-001', siswaId: 'SSW-101', namaSiswa: 'Andi Saputra', kelasId: 'KLS-101', mapelId: 'MP-001', namaMapel: 'Matematika', semester: 'Ganjil', tahunPelajaran: '2025/2026', nilaiTugas: 82, nilaiUTS: 80, nilaiUAS: 85, nilaiAkhir: 82.3, statusTuntas: 'Tuntas' },
  { id: 'NL-002', siswaId: 'SSW-101', namaSiswa: 'Andi Saputra', kelasId: 'KLS-101', mapelId: 'MP-002', namaMapel: 'Bahasa Indonesia', semester: 'Ganjil', tahunPelajaran: '2025/2026', nilaiTugas: 88, nilaiUTS: 85, nilaiUAS: 90, nilaiAkhir: 87.7, statusTuntas: 'Tuntas' },
  { id: 'NL-003', siswaId: 'SSW-102', namaSiswa: 'Dewi Lestari', kelasId: 'KLS-101', mapelId: 'MP-001', namaMapel: 'Matematika', semester: 'Ganjil', tahunPelajaran: '2025/2026', nilaiTugas: 95, nilaiUTS: 92, nilaiUAS: 96, nilaiAkhir: 94.3, statusTuntas: 'Tuntas' },
  { id: 'NL-004', siswaId: 'SSW-103', namaSiswa: 'Fajar Nugraha', kelasId: 'KLS-101', mapelId: 'MP-001', namaMapel: 'Matematika', semester: 'Ganjil', tahunPelajaran: '2025/2026', nilaiTugas: 65, nilaiUTS: 60, nilaiUAS: 68, nilaiAkhir: 64.3, statusTuntas: 'Belum Tuntas' },
];

export const initialMateri: Materi[] = [
  { id: 'MTR-001', judul: 'Sistem Persamaan Linear Dua Variabel (SPLDV)', mapelId: 'MP-001', namaMapel: 'Matematika', kelasId: 'KLS-101', deskripsi: 'Modul lengkap dan contoh soal matriks & SPLDV.', linkDrive: 'https://drive.google.com/file/d/example1', tanggalUpload: '2025-08-01', guruId: 'GRU-001' },
  { id: 'MTR-002', judul: 'Struktur Teks Laporan Hasil Observasi', mapelId: 'MP-002', namaMapel: 'Bahasa Indonesia', kelasId: 'KLS-101', deskripsi: 'Panduan menyusun LHO bidang teknik.', linkDrive: 'https://drive.google.com/file/d/example2', tanggalUpload: '2025-08-02', guruId: 'GRU-002' },
];

export const initialTugas: Tugas[] = [
  { id: 'TGS-001', judul: 'Latihan Soal Matriks & SPLDV', mapelId: 'MP-001', namaMapel: 'Matematika', kelasId: 'KLS-101', deadline: '2025-08-15', deskripsi: 'Kerjakan soal no 1-10 di buku tugas, foto dan kumpulkan.', guruId: 'GRU-001' },
  { id: 'TGS-002', judul: 'Analisis Teks LHO Bengkel Otomotif', mapelId: 'MP-002', namaMapel: 'Bahasa Indonesia', kelasId: 'KLS-101', deadline: '2025-08-18', deskripsi: 'Buatlah laporan observasi peralatan bengkel.', guruId: 'GRU-002' },
];

export const initialJurnal: Jurnal[] = [
  { id: 'JRN-001', tanggal: todayStr, guruId: 'GRU-001', namaGuru: 'Budi Santoso, S.Pd.', mapelId: 'MP-001', namaMapel: 'Matematika', kelasId: 'KLS-101', namaKelas: 'X TO 1', materi: 'SPLDV Metode Eliminasi & Substitusi', keterangan: 'Siswa aktif berdiskusi kelompok', status: 'Sudah Mengisi' },
  { id: 'JRN-002', tanggal: todayStr, guruId: 'GRU-002', namaGuru: 'Siti Rahma, S.Pd.', mapelId: 'MP-002', namaMapel: 'Bahasa Indonesia', kelasId: 'KLS-101', namaKelas: 'X TO 1', materi: 'Menyusun Kebahasaan Teks LHO', keterangan: 'Tugas mandiri berjalan lancar', status: 'Sudah Mengisi' },
];

export const initialBimbingan: Bimbingan[] = [
  { id: 'BMB-001', tanggal: '2025-08-05', siswaId: 'SSW-103', namaSiswa: 'Fajar Nugraha', kelasId: 'KLS-101', guruId: 'GRU-002', namaGuru: 'Siti Rahma, S.Pd.', topik: 'Peningkatan Motivasi Belajar Matematika', catatan: 'Siswa mengeluhkan kesulitan pemahaman materi matriks', tindakLanjut: 'Dijadwalkan remedial khusus' },
];

export const initialPrestasi: Prestasi[] = [
  { id: 'PRS-001', tanggal: '2025-07-28', siswaId: 'SSW-102', namaSiswa: 'Dewi Lestari', kelasId: 'KLS-101', namaPrestasi: 'Juara 1 LKS Otomotif Tingkat Kota', tingkat: 'Kabupaten', poin: 50, penyelenggara: 'Dinas Pendidikan Kota' },
  { id: 'PRS-002', tanggal: '2025-08-01', siswaId: 'SSW-101', namaSiswa: 'Andi Saputra', kelasId: 'KLS-101', namaPrestasi: 'Juara 2 Olimpiade Matematika SMK', tingkat: 'Provinsi', poin: 75, penyelenggara: 'Forum Guru Matematika' },
];

export const initialPelanggaran: Pelanggaran[] = [
  { id: 'PLG-001', tanggal: '2025-08-04', siswaId: 'SSW-105', namaSiswa: 'Hendrik Pratama', kelasId: 'KLS-102', namaPelanggaran: 'Terlambat Masuk Sekolah (>15 Menit)', kategori: 'Ringan', poin: 5, tindakLanjut: 'Teguran lisan & penataan disiplin' },
  { id: 'PLG-002', tanggal: '2025-08-07', siswaId: 'SSW-103', namaSiswa: 'Fajar Nugraha', kelasId: 'KLS-101', namaPelanggaran: 'Tidak Mengerjakan Tugas 3x Beruntun', kategori: 'Sedang', poin: 15, tindakLanjut: 'Pemanggilan orang tua oleh Wali Kelas' },
];

export const initialCatatanWaliKelas: CatatanWaliKelas[] = [
  { id: 'CWK-001', siswaId: 'SSW-101', namaSiswa: 'Andi Saputra', kelasId: 'KLS-101', semester: 'Ganjil', catatan: 'Prestasi akademik sangat baik, pertahankan kedisiplinan.', rekomendasi: 'Disarankan mengikuti lomba LKS nasional.', tanggal: '2025-08-01' },
];

export const initialJurnalWaliKelas: JurnalWaliKelas[] = [
  { id: 'JWK-001', tanggal: todayStr, kelasId: 'KLS-101', namaKelas: 'X TO 1', guruId: 'GRU-002', namaGuru: 'Siti Rahma, S.Pd.', kegiatan: 'Pembinaan Rutin Kebersihan & Kedisiplinan Kelas', absensiOverview: '30 Hadir, 1 Sakit, 1 Izin', catatan: 'Kondisi kelas kondusif.' },
];

export const initialGuruPiket: GuruPiketLog[] = [
  {
    id: 'PKT-001',
    tanggal: todayStr,
    guruPiketId: 'GRU-001',
    namaGuruPiket: 'Budi Santoso, S.Pd.',
    guruDigantikanId: 'GRU-005',
    namaGuruDigantikan: 'Eko Prasetyo, S.Pd.',
    kelasId: 'KLS-101',
    namaKelas: 'X TO 1',
    mapelId: 'MP-003',
    namaMapel: 'Bahasa Inggris',
    jamKe: '09.15 - 11.30',
    materiDisampaikan: 'Reading Comprehension Module & Task Assignment',
    alasanPenggantian: 'Guru Utama Sakit (Surat Dokter)',
    catatanKBM: 'KBM berjalan tertib, presensi siswa telah diinput oleh Guru Piket.',
    status: 'Selesai',
  },
];

