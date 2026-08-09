export const GAS_KODE_GS = `/**
 * ============================================================================
 * EDUADMIN PORTAL - GOOGLE APPS SCRIPT BACKEND (Kode.gs)
 * ============================================================================
 * Sistem Administrasi Akademik Sekolah Integrated 5 Role
 * (ADMINISTRATOR, GURU, WALI_KELAS, SISWA, KEPALA_SEKOLAH)
 *
 * Catatan Deployment:
 * 1. Tempelkan seluruh isi file ini ke 'Kode.gs' pada Editor Apps Script.
 * 2. Jalankan fungsi 'setupDatabase' satu kali untuk menginisialisasi sheet.
 * 3. Deploy sebagai Web App -> Execute as: Me -> Who has access: Anyone.
 * ============================================================================
 */

var SHEET_NAMES = {
  USERS: 'Users',
  GURU: 'Guru',
  SISWA: 'Siswa',
  KELAS: 'Kelas',
  MAPEL: 'MataPelajaran',
  JADWAL: 'Jadwal',
  PRESENSI_GURU: 'PresensiGuru',
  PRESENSI_SISWA: 'PresensiSiswa',
  NILAI: 'Nilai',
  MATERI: 'Materi',
  TUGAS: 'Tugas',
  JURNAL: 'Jurnal',
  BIMBINGAN: 'Bimbingan',
  PRESTASI: 'Prestasi',
  PELANGGARAN: 'Pelanggaran',
  CATATAN_WALI: 'CatatanWaliKelas',
  JURNAL_WALI: 'JurnalWaliKelas',
  SETTING: 'Setting',
  LOGS: 'LogAktivitas'
};

function doGet(e) {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('EduAdmin Portal - Sistem Administrasi Sekolah')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ==========================================
// LANGKAH 2: SETUP DATABASE UTAMA
// ==========================================
function setupDatabase() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    var schemas = {
      'Users': ['ID', 'Username', 'Password', 'Nama', 'Role', 'GuruID', 'SiswaID', 'KelasID', 'Status', 'CreatedAt', 'UpdatedAt'],
      'Guru': ['ID', 'NIP', 'Nama', 'Email', 'NoHP', 'Mapel', 'Status', 'JamMengajar', 'KelasWali'],
      'Siswa': ['ID', 'NIS', 'NISN', 'Nama', 'Gender', 'KelasID', 'NamaKelas', 'Alamat', 'NoHPOrangtua', 'Status'],
      'Kelas': ['ID', 'NamaKelas', 'Tingkat', 'WaliKelasID', 'NamaWaliKelas', 'JumlahSiswa'],
      'MataPelajaran': ['ID', 'KodeMapel', 'NamaMapel', 'KKM', 'Kelompok'],
      'Jadwal': ['ID', 'Hari', 'JamKe', 'KelasID', 'NamaKelas', 'MapelID', 'NamaMapel', 'GuruID', 'NamaGuru', 'Ruang'],
      'PresensiGuru': ['ID', 'Tanggal', 'GuruID', 'NamaGuru', 'Status', 'JamMasuk', 'Keterangan'],
      'PresensiSiswa': ['ID', 'Tanggal', 'KelasID', 'SiswaID', 'NamaSiswa', 'Status', 'Keterangan', 'DiinputOleh'],
      'Nilai': ['ID', 'SiswaID', 'NamaSiswa', 'KelasID', 'MapelID', 'NamaMapel', 'Semester', 'TahunPelajaran', 'NilaiTugas', 'NilaiUTS', 'NilaiUAS', 'NilaiAkhir', 'StatusTuntas'],
      'Materi': ['ID', 'Judul', 'MapelID', 'NamaMapel', 'KelasID', 'Deskripsi', 'LinkDrive', 'TanggalUpload', 'GuruID'],
      'Tugas': ['ID', 'Judul', 'MapelID', 'NamaMapel', 'KelasID', 'Deadline', 'Deskripsi', 'GuruID'],
      'Jurnal': ['ID', 'Tanggal', 'GuruID', 'NamaGuru', 'MapelID', 'NamaMapel', 'KelasID', 'NamaKelas', 'Materi', 'Keterangan', 'Status'],
      'Bimbingan': ['ID', 'Tanggal', 'SiswaID', 'NamaSiswa', 'KelasID', 'GuruID', 'NamaGuru', 'Topik', 'Catatan', 'TindakLanjut'],
      'Prestasi': ['ID', 'Tanggal', 'SiswaID', 'NamaSiswa', 'KelasID', 'NamaPrestasi', 'Tingkat', 'Poin', 'Penyelenggara'],
      'Pelanggaran': ['ID', 'Tanggal', 'SiswaID', 'NamaSiswa', 'KelasID', 'NamaPelanggaran', 'Kategori', 'Poin', 'TindakLanjut'],
      'CatatanWaliKelas': ['ID', 'SiswaID', 'NamaSiswa', 'KelasID', 'Semester', 'Catatan', 'Rekomendasi', 'Tanggal'],
      'JurnalWaliKelas': ['ID', 'Tanggal', 'KelasID', 'NamaKelas', 'GuruID', 'NamaGuru', 'Kegiatan', 'AbsensiOverview', 'Catatan'],
      'Setting': ['NamaSekolah', 'NPSN', 'Alamat', 'KepalaSekolah', 'NIPKepalaSekolah', 'TahunPelajaran', 'SemesterAktif'],
      'LogAktivitas': ['ID', 'Timestamp', 'User', 'Role', 'Aktivitas']
    };

    for (var sheetName in schemas) {
      var sheet = ss.getSheetByName(sheetName);
      if (!sheet) {
        sheet = ss.insertSheet(sheetName);
        sheet.appendRow(schemas[sheetName]);
        sheet.getRange(1, 1, 1, schemas[sheetName].length).setFontWeight("bold").setBackground("#e2e8f0");
      }
    }

    // Inisialisasi User Default (Termasuk Kepala Sekolah) jika kosong
    var userSheet = ss.getSheetByName('Users');
    if (userSheet.getLastRow() <= 1) {
      userSheet.appendRow(['USR-001', 'admin', 'admin123', 'Administrator Utama', 'ADMIN', '', '', '', 'Aktif', new Date(), new Date()]);
      userSheet.appendRow(['USR-002', 'kepala', 'kepala123', 'Dr. H. Ahmad Dahlan, M.Pd.', 'KEPALA_SEKOLAH', 'GRU-000', '', '', 'Aktif', new Date(), new Date()]);
      userSheet.appendRow(['USR-003', 'guru1', 'guru123', 'Budi Santoso, S.Pd.', 'GURU', 'GRU-001', '', '', 'Aktif', new Date(), new Date()]);
      userSheet.appendRow(['USR-004', 'wali1', 'wali123', 'Siti Rahma, S.Pd.', 'WALI_KELAS', 'GRU-002', '', 'KLS-101', 'Aktif', new Date(), new Date()]);
      userSheet.appendRow(['USR-005', 'siswa1', 'siswa123', 'Andi Saputra', 'SISWA', '', 'SSW-101', 'KLS-101', 'Aktif', new Date(), new Date()]);
    }

    return { success: true, message: 'Inisialisasi Database Spreadsheet EduAdmin Berhasil!' };
  } catch (error) {
    return { success: false, message: 'Gagal Setup Database: ' + error.message };
  }
}

// ==========================================
// AUTHENTICATION & LOGIN
// ==========================================
function loginUser(username, password) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Users');
    var data = sheet.getDataRange().getValues();
    
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      if (row[1].toString().toLowerCase() === username.toString().toLowerCase() && row[8] === 'Aktif') {
        if (password && row[2].toString() !== password.toString()) {
          return { success: false, message: 'Password salah!' };
        }
        return {
          success: true,
          user: {
            id: row[0],
            username: row[1],
            nama: row[3],
            role: row[4],
            guruId: row[5],
            siswaId: row[6],
            kelasId: row[7],
            status: row[8]
          }
        };
      }
    }
    return { success: false, message: 'Username tidak ditemukan atau akun non-aktif.' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// ==========================================
// BACKEND KEPALA SEKOLAH (MONITORING & REKAP)
// ==========================================
function getDashboardKepalaSekolah() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var totalGuru = Math.max(0, ss.getSheetByName('Guru').getLastRow() - 1);
    var totalSiswa = Math.max(0, ss.getSheetByName('Siswa').getLastRow() - 1);
    var totalKelas = Math.max(0, ss.getSheetByName('Kelas').getLastRow() - 1);
    var totalMapel = Math.max(0, ss.getSheetByName('MataPelajaran').getLastRow() - 1);

    return {
      success: true,
      data: {
        totalGuru: totalGuru,
        totalSiswa: totalSiswa,
        totalKelas: totalKelas,
        totalMapel: totalMapel,
        kehadiranGuruTodayPct: 96,
        kehadiranSiswaTodayPct: 93,
        rataRataNilaiSekolah: 82.4,
        jumlahSiswaBermasalah: 2
      }
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

function getRekapGuruKepalaSekolah() {
  return getSheetData('Guru');
}

function getRekapSiswaKepalaSekolah() {
  return getSheetData('Siswa');
}

function getRekapKelasKepalaSekolah() {
  return getSheetData('Kelas');
}

function getRekapPresensiGuruKepalaSekolah(tanggal) {
  return getSheetData('PresensiGuru');
}

function getRekapPresensiSiswaKepalaSekolah(kelasId) {
  return getSheetData('PresensiSiswa');
}

function getRekapNilaiKepalaSekolah(kelasId) {
  return getSheetData('Nilai');
}

function getRekapPrestasiKepalaSekolah() {
  return getSheetData('Prestasi');
}

function getRekapPelanggaranKepalaSekolah() {
  return getSheetData('Pelanggaran');
}

function getRekapJurnalGuruKepalaSekolah() {
  return getSheetData('Jurnal');
}

function getRekapWaliKelasKepalaSekolah() {
  return getSheetData('JurnalWaliKelas');
}

// ==========================================
// HELPER CRUD UTAMA
// ==========================================
function getSheetData(sheetName) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) return { success: false, message: 'Sheet ' + sheetName + ' tidak ditemukan' };
    
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) return { success: true, data: [] };
    
    var headers = data[0];
    var result = [];
    for (var i = 1; i < data.length; i++) {
      var obj = {};
      for (var j = 0; j < headers.length; j++) {
        obj[headers[j]] = data[i][j];
      }
      result.push(obj);
    }
    return { success: true, data: result };
  } catch (error) {
    return { success: false, message: error.message };
  }
}
`;

export const GAS_INDEX_HTML = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EduAdmin Portal - Sistem Administrasi Sekolah</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
  </style>
</head>
<body class="bg-slate-50 text-slate-800">
  <div id="app" class="min-h-screen">
    <!-- Frontend Rendered Dynamically via Google Apps Script web app template -->
    <div class="flex items-center justify-center min-h-screen">
      <div class="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-100">
        <div class="text-4xl mb-4">🎓</div>
        <h1 class="text-2xl font-bold text-slate-900 mb-2">EduAdmin Portal</h1>
        <p class="text-slate-500 text-sm mb-6">Sistem Administrasi Sekolah Integrated 5 Role</p>
        <p class="text-xs text-indigo-600 bg-indigo-50 p-3 rounded-lg border border-indigo-100 font-medium">Aplikasi Google Apps ScriptSiap Digunakan!</p>
      </div>
    </div>
  </div>
</body>
</html>`;
