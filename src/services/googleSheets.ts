import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Siswa, Nilai, PresensiSiswa } from '../types';

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// Provider with Sheets & Drive Scopes
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/spreadsheets.readonly');
provider.addScope('https://www.googleapis.com/auth/drive.file');

let isSigningIn = false;
let cachedAccessToken: string | null = null;
let currentUser: User | null = null;

// Initialize auth state listener
export const initGoogleAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    currentUser = user;
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const signInWithGoogleSheets = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Gagal mendapatkan Access Token dari Google OAuth');
    }
    cachedAccessToken = credential.accessToken;
    currentUser = result.user;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign-In error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getGoogleAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const getGoogleUser = (): User | null => {
  return currentUser || auth.currentUser;
};

export const googleLogout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
  currentUser = null;
};

/**
 * Creates a Google Spreadsheet using Google Sheets REST API
 */
export const createGoogleSpreadsheet = async (title: string, sheetsData: Array<{ title: string; values: (string | number)[][] }>): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> => {
  const token = cachedAccessToken;
  if (!token) {
    throw new Error('Belum melakukan Sign In dengan akun Google. Silakan klik "Connect Google Sheets" terlebih dahulu.');
  }

  const payload = {
    properties: {
      title,
    },
    sheets: sheetsData.map(s => ({
      properties: {
        title: s.title,
      },
      data: [
        {
          startRow: 0,
          startColumn: 0,
          rowData: s.values.map(row => ({
            values: row.map(val => ({
              userEnteredValue: typeof val === 'number' ? { numberValue: val } : { stringValue: String(val) },
            })),
          })),
        },
      ],
    })),
  };

  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errJson = await response.json().catch(() => ({}));
    throw new Error(errJson.error?.message || `Gagal membuat Google Sheets (${response.statusText})`);
  }

  const result = await response.json();
  return {
    spreadsheetId: result.spreadsheetId,
    spreadsheetUrl: result.spreadsheetUrl,
  };
};

/**
 * Exports Leger Nilai Perkelas into a Google Spreadsheet
 */
export const exportLegerToGoogleSheets = async (
  kelasName: string,
  siswaList: Siswa[],
  nilaiList: Nilai[],
  customTitle?: string
) => {
  const title = customTitle || `Leger Nilai Kelas ${kelasName} - SMK PGRI Cisaat (${new Date().toLocaleDateString('id-ID')})`;

  const headers = [
    'No', 'NIS', 'NISN', 'Nama Siswa', 'Jenis Kelamin',
    'Rata Formatif (F1-F3)', 'Rata Sumatif (S1-S3)', 'Nilai STS', 'Nilai SAS/SAT',
    'Nilai Akhir', 'Predikat', 'Ketuntasan (≥75)'
  ];

  const rows: (string | number)[][] = [
    [`LEGER NILAI AKADEMIK KELAS ${kelasName.toUpperCase()}`],
    [`SMK PGRI CISAAT SUKABUMI - TAHUN AJARAN 2025/2026`],
    [`Tanggal Ekspor: ${new Date().toLocaleString('id-ID')}`],
    [], // empty row
    headers,
  ];

  siswaList.forEach((s, idx) => {
    const studentNilai = nilaiList.find(n => n.siswaId === s.id);
    const f1 = studentNilai?.f1 ?? 80;
    const f2 = studentNilai?.f2 ?? 85;
    const f3 = studentNilai?.f3 ?? 82;
    const avgF = Math.round((f1 + f2 + f3) / 3);

    const s1 = studentNilai?.s1 ?? 80;
    const s2 = studentNilai?.s2 ?? 82;
    const s3 = studentNilai?.s3 ?? 85;
    const avgS = Math.round((s1 + s2 + s3) / 3);

    const sts = studentNilai?.sts ?? 80;
    const sas = studentNilai?.sas ?? 85;

    const nilaiAkhir = studentNilai ? studentNilai.nilaiAkhir : Math.round((avgF * 0.2) + (avgS * 0.3) + (sts * 0.25) + (sas * 0.25));
    const predikat = nilaiAkhir >= 90 ? 'A' : nilaiAkhir >= 80 ? 'B' : nilaiAkhir >= 75 ? 'C' : 'D';
    const tuntas = nilaiAkhir >= 75 ? 'TUNTAS' : 'BELUM TUNTAS';

    rows.push([
      idx + 1,
      s.nis,
      s.nisn,
      s.nama,
      s.gender,
      avgF,
      avgS,
      sts,
      sas,
      nilaiAkhir,
      predikat,
      tuntas
    ]);
  });

  return await createGoogleSpreadsheet(title, [{ title: `Leger ${kelasName}`, values: rows }]);
};

/**
 * Exports Presensi Siswa to Google Sheets
 */
export const exportPresensiToGoogleSheets = async (
  kelasName: string,
  tanggal: string,
  siswaList: Siswa[],
  presensiList: PresensiSiswa[],
  customTitle?: string
) => {
  const title = customTitle || `Rekap Presensi Siswa Kelas ${kelasName} (${tanggal}) - SMK PGRI Cisaat`;

  const headers = ['No', 'NIS', 'NISN', 'Nama Siswa', 'L/P', 'Tanggal', 'Status Kehadiran', 'Keterangan'];

  const rows: (string | number)[][] = [
    [`REKAPITULASI PRESENSI SISWA KELAS ${kelasName.toUpperCase()}`],
    [`SMK PGRI CISAAT - TANGGAL: ${tanggal}`],
    [],
    headers,
  ];

  siswaList.forEach((s, idx) => {
    const p = presensiList.find(item => item.siswaId === s.id);
    const status = p ? p.status : 'Hadir';
    const ket = p ? p.keterangan || '-' : '-';

    rows.push([
      idx + 1,
      s.nis,
      s.nisn,
      s.nama,
      s.gender,
      tanggal,
      status,
      ket
    ]);
  });

  return await createGoogleSpreadsheet(title, [{ title: `Presensi ${kelasName}`, values: rows }]);
};

/**
 * Reads values from an existing Google Sheet range
 */
export const readGoogleSheetData = async (spreadsheetId: string, range: string = 'Sheet1!A1:Z100') => {
  const token = cachedAccessToken;
  if (!token) {
    throw new Error('Belum terhubung dengan Google OAuth.');
  }

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Gagal membaca data dari Google Sheets.');
  }

  const data = await response.json();
  return data.values as (string | number)[][];
};
