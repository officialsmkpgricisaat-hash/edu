export type Role = 'ADMIN' | 'GURU' | 'WALI_KELAS' | 'SISWA' | 'KEPALA_SEKOLAH';

export interface User {
  id: string;
  username: string;
  password?: string;
  nama: string;
  role: Role;
  guruId?: string;
  siswaId?: string;
  kelasId?: string;
  status: 'Aktif' | 'Nonaktif';
  createdAt: string;
  updatedAt: string;
}

export interface Guru {
  id: string;
  nip: string;
  nama: string;
  email: string;
  noHp: string;
  mapel: string;
  status: 'PNS' | 'GTT' | 'Honor';
  jamMengajar: number;
  kelasWali?: string;
}

export interface Siswa {
  id: string;
  nis: string;
  nisn: string;
  nama: string;
  gender: 'L' | 'P';
  kelasId: string;
  namaKelas: string;
  alamat: string;
  noHpOrangtua: string;
  status: 'Aktif' | 'Lulus' | 'Pindah';
  // Additional fields for Wali Kelas & Student Detail
  alamatRumah?: string;
  namaOrtu?: string;
  kontakOrtu?: string;
  pekerjaanOrtu?: string;
  catatanKhusus?: string;
}

export interface Kelas {
  id: string;
  namaKelas: string;
  tingkat: string;
  waliKelasId: string;
  namaWaliKelas: string;
  jumlahSiswa: number;
}

export interface MataPelajaran {
  id: string;
  kodeMapel: string;
  namaMapel: string;
  kkm: number;
  kelompok: 'Umum' | 'Kejuruan' | 'Pilihan';
}

export interface Jadwal {
  id: string;
  hari: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu';
  jamKe: string;
  kelasId: string;
  namaKelas: string;
  mapelId: string;
  namaMapel: string;
  guruId: string;
  namaGuru: string;
  ruang: string;
}

export interface PresensiGuru {
  id: string;
  tanggal: string; // YYYY-MM-DD
  guruId: string;
  namaGuru: string;
  status: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa';
  jamMasuk: string;
  keterangan: string;
}

export interface PresensiSiswa {
  id: string;
  tanggal: string; // YYYY-MM-DD
  kelasId: string;
  mapelId?: string;
  namaMapel?: string;
  siswaId: string;
  namaSiswa: string;
  status: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa';
  keterangan: string;
  diinputOleh: string;
  // Presensi Barcode & Regional Lokasi
  barcodeCode?: string;
  lat?: number;
  lng?: number;
  jarakKeSekolahMeters?: number;
  statusRegional?: 'DI DALAM RADIUS' | 'DI LUAR RADIUS' | 'BERHASIL VERIFIKASI LOKASI' | 'DI LUAR LOKASI';
  waktuScan?: string;
}

export interface Nilai {
  id: string;
  siswaId: string;
  namaSiswa: string;
  kelasId: string;
  mapelId: string;
  namaMapel: string;
  semester: 'Ganjil' | 'Genap';
  tahunPelajaran: string;
  // Formatif (Formatif 1, 2, 3 / Tugas Harian)
  f1?: number;
  f2?: number;
  f3?: number;
  // Sumatif Lingkup Materi / TP (Sumatif 1, 2, 3)
  s1?: number;
  s2?: number;
  s3?: number;
  // Sumatif Tengah Semester (STS / UTS)
  sts?: number;
  // Sumatif Akhir Semester / Akhir Tahun (SAS / SAT / UAS)
  sas?: number;
  // Backwards compatible summary fields
  nilaiTugas: number; // Rata-rata Formatif
  nilaiUTS: number;   // STS / UTS
  nilaiUAS: number;   // SAS / SAT / UAS
  nilaiAkhir: number;
  statusTuntas: 'Tuntas' | 'Belum Tuntas';
}

export interface Materi {
  id: string;
  judul: string;
  mapelId: string;
  namaMapel: string;
  kelasId: string;
  deskripsi: string;
  linkDrive: string;
  tanggalUpload: string;
  guruId: string;
}

export interface Tugas {
  id: string;
  judul: string;
  mapelId: string;
  namaMapel: string;
  kelasId: string;
  deadline: string;
  deskripsi: string;
  guruId: string;
}

export interface Jurnal {
  id: string;
  tanggal: string;
  guruId: string;
  namaGuru: string;
  mapelId: string;
  namaMapel: string;
  kelasId: string;
  namaKelas: string;
  materi: string;
  keterangan: string;
  status: 'Sudah Mengisi' | 'Belum Mengisi';
}

export interface Bimbingan {
  id: string;
  tanggal: string;
  siswaId: string;
  namaSiswa: string;
  kelasId: string;
  guruId: string;
  namaGuru: string;
  topik: string;
  catatan: string;
  tindakLanjut: string;
}

export interface Prestasi {
  id: string;
  tanggal: string;
  siswaId: string;
  namaSiswa: string;
  kelasId: string;
  namaPrestasi: string;
  tingkat: 'Sekolah' | 'Kecamatan' | 'Kabupaten' | 'Provinsi' | 'Nasional';
  poin: number;
  penyelenggara: string;
}

export interface Pelanggaran {
  id: string;
  tanggal: string;
  siswaId: string;
  namaSiswa: string;
  kelasId: string;
  namaPelanggaran: string;
  kategori: 'Ringan' | 'Sedang' | 'Berat';
  poin: number;
  tindakLanjut: string;
}

export interface CatatanWaliKelas {
  id: string;
  siswaId: string;
  namaSiswa: string;
  kelasId: string;
  semester: string;
  catatan: string;
  rekomendasi: string;
  tanggal: string;
}

export interface JurnalWaliKelas {
  id: string;
  tanggal: string;
  kelasId: string;
  namaKelas: string;
  guruId: string;
  namaGuru: string;
  kegiatan: string;
  absensiOverview: string;
  catatan: string;
}

export interface Setting {
  namaSekolah: string;
  npsn: string;
  alamat: string;
  kepalaSekolah: string;
  nipKepalaSekolah: string;
  tahunPelajaran: string;
  semesterAktif: 'Ganjil' | 'Genap';
}

export interface SiswaPerluPerhatian {
  siswaId: string;
  nama: string;
  kelas: string;
  persentaseKehadiran: number;
  rataRataNilai: number;
  totalPelanggaran: number;
  status: 'Perlu Perhatian Administratif';
  alasan: string[];
}

export interface GuruPiketLog {
  id: string;
  tanggal: string; // YYYY-MM-DD
  guruPiketId: string;
  namaGuruPiket: string;
  guruDigantikanId?: string;
  namaGuruDigantikan?: string;
  kelasId: string;
  namaKelas: string;
  mapelId?: string;
  namaMapel?: string;
  jamKe: string;
  materiDisampaikan: string;
  alasanPenggantian: string; // e.g., 'Guru Utama Sakit', 'Tugas Luar', 'Izin Duka'
  catatanKBM: string;
  status: 'Selesai' | 'Berlangsung';
}

export interface KedisiplinanStatus {
  siswaId: string;
  namaSiswa: string;
  kelasId: string;
  namaKelas: string;
  poinMaksimal: number; // Always 100 for 3 years
  totalPoinPelanggaran: number;
  sisaPoin: number;
  statusKategori: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Kurang' | 'Kritis' | 'Poin Habis';
  statusSP: 'Aman' | 'Peringatan Lisan' | 'SP1 (Surat Peringatan 1)' | 'SP2 (Panggilan Ortu)' | 'SP3 (Skorsing)' | 'Rekomendasi Dikembalikan ke Ortu';
  riwayatPelanggaran: Pelanggaran[];
}

export interface PresensiGuruBarcodeLog {
  id: string;
  tanggal: string; // YYYY-MM-DD
  jamMasuk: string; // HH:mm:ss
  guruId: string;
  namaGuru: string;
  nip: string;
  barcodeCode: string;
  lat: number;
  lng: number;
  jarakKeSekolahMeters: number;
  statusRegional: 'DI DALAM RADIUS 100M' | 'DI LUAR RADIUS 100M';
  status: 'Hadir Verified' | 'Tolak (Luar Radius)';
  keterangan: string;
}


