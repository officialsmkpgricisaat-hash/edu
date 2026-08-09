import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, ExternalLink, CheckCircle2, LogOut, Download, Upload, AlertCircle, RefreshCw, FileCheck } from 'lucide-react';
import {
  initGoogleAuth,
  signInWithGoogleSheets,
  googleLogout,
  getGoogleAccessToken,
  getGoogleUser,
  exportLegerToGoogleSheets,
  exportPresensiToGoogleSheets,
  readGoogleSheetData,
} from '../services/googleSheets';
import { StorageService } from '../services/storageService';

interface GoogleSheetsBarProps {
  currentKelasId?: string;
  currentKelasName?: string;
  onSuccessNotification?: (msg: string) => void;
}

export const GoogleSheetsBar: React.FC<GoogleSheetsBarProps> = ({
  currentKelasId,
  currentKelasName,
  onSuccessNotification,
}) => {
  const [token, setToken] = useState<string | null>(getGoogleAccessToken());
  const [user, setUser] = useState<any>(getGoogleUser());
  const [loading, setLoading] = useState<boolean>(false);
  const [lastSheetUrl, setLastSheetUrl] = useState<string | null>(null);
  const [lastSheetTitle, setLastSheetTitle] = useState<string | null>(null);
  const [showConfirmExport, setShowConfirmExport] = useState<'leger' | 'presensi' | null>(null);

  // Import Modal State
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [importSpreadsheetId, setImportSpreadsheetId] = useState<string>('');
  const [importRange, setImportRange] = useState<string>('Sheet1!A1:H50');
  const [importedRows, setImportedRows] = useState<(string | number)[][] | null>(null);

  useEffect(() => {
    const unsubscribe = initGoogleAuth(
      (u, tok) => {
        setUser(u);
        setToken(tok);
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );
    return () => {
      unsubscribe();
    };
  }, []);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      const res = await signInWithGoogleSheets();
      if (res) {
        setToken(res.accessToken);
        setUser(res.user);
        if (onSuccessNotification) {
          onSuccessNotification(`Terhubung dengan Google Account: ${res.user.email || 'Google User'}`);
        }
      }
    } catch (err: any) {
      alert(`Gagal menghubungkan Google Sheets: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await googleLogout();
    setToken(null);
    setUser(null);
    setLastSheetUrl(null);
  };

  const handleExportLeger = async () => {
    if (!token) {
      handleSignIn();
      return;
    }
    setLoading(true);
    try {
      const kelasList = StorageService.getKelas();
      const targetKelas = currentKelasId ? kelasList.find(k => k.id === currentKelasId) : kelasList[0];
      const targetKelasName = targetKelas?.namaKelas || currentKelasName || 'Semua Kelas';

      const siswaList = StorageService.getSiswa().filter(s => targetKelas ? s.kelasId === targetKelas.id : true);
      const nilaiList = StorageService.getNilai();

      const result = await exportLegerToGoogleSheets(targetKelasName, siswaList, nilaiList);

      setLastSheetUrl(result.spreadsheetUrl);
      setLastSheetTitle(`Leger Nilai ${targetKelasName}`);
      setShowConfirmExport(null);

      if (onSuccessNotification) {
        onSuccessNotification(`Berhasil membuat Google Spreadsheet Leger Nilai ${targetKelasName}!`);
      }
      window.open(result.spreadsheetUrl, '_blank');
    } catch (err: any) {
      alert(`Gagal ekspor ke Google Sheets: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPresensi = async () => {
    if (!token) {
      handleSignIn();
      return;
    }
    setLoading(true);
    try {
      const kelasList = StorageService.getKelas();
      const targetKelas = currentKelasId ? kelasList.find(k => k.id === currentKelasId) : kelasList[0];
      const targetKelasName = targetKelas?.namaKelas || currentKelasName || 'Semua Kelas';

      const siswaList = StorageService.getSiswa().filter(s => targetKelas ? s.kelasId === targetKelas.id : true);
      const presensiList = StorageService.getPresensiSiswa();
      const today = new Date().toISOString().split('T')[0];

      const result = await exportPresensiToGoogleSheets(targetKelasName, today, siswaList, presensiList);

      setLastSheetUrl(result.spreadsheetUrl);
      setLastSheetTitle(`Presensi Siswa ${targetKelasName}`);
      setShowConfirmExport(null);

      if (onSuccessNotification) {
        onSuccessNotification(`Berhasil membuat Google Spreadsheet Presensi ${targetKelasName}!`);
      }
      window.open(result.spreadsheetUrl, '_blank');
    } catch (err: any) {
      alert(`Gagal ekspor ke Google Sheets: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchSheetData = async () => {
    if (!importSpreadsheetId.trim()) {
      alert('Masukkan Spreadsheet ID atau URL Google Sheets terlebih dahulu.');
      return;
    }

    // Extract ID from URL if pasted as full link
    let cleanId = importSpreadsheetId.trim();
    if (cleanId.includes('/d/')) {
      const match = cleanId.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        cleanId = match[1];
      }
    }

    setLoading(true);
    try {
      const rows = await readGoogleSheetData(cleanId, importRange);
      setImportedRows(rows);
      if (onSuccessNotification) {
        onSuccessNotification(`Berhasil membaca ${rows.length} baris dari Google Sheets!`);
      }
    } catch (err: any) {
      alert(`Gagal membaca data Google Sheets: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-4 shadow-lg border border-emerald-700/50 my-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left branding & status */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/20 rounded-xl border border-emerald-500/40 text-emerald-400">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-emerald-100">Integrasi Google Sheets & Drive</h3>
              {token ? (
                <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                  <AlertCircle className="w-3 h-3 text-amber-400" /> Offline Sync
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {token
                ? `Akun: ${user?.email || 'Google User'} • Ekspor otomatis e-Rapor & Leger ke Google Drive`
                : 'Hubungkan akun Google Anda untuk membuat & membaca Spreadsheet secara langsung.'}
            </p>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {token ? (
            <>
              <button
                onClick={() => setShowConfirmExport('leger')}
                className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" /> Ekspor Leger ke Sheets
              </button>
              <button
                onClick={() => setShowConfirmExport('presensi')}
                className="px-3.5 py-2 bg-teal-500 hover:bg-teal-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" /> Ekspor Presensi ke Sheets
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-4 h-4 text-emerald-300" /> Baca / Import Sheet
              </button>
              {lastSheetUrl && (
                <a
                  href={lastSheetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                >
                  <ExternalLink className="w-4 h-4" /> Buka Sheet {lastSheetTitle ? `(${lastSheetTitle})` : ''}
                </a>
              )}
              <button
                onClick={handleSignOut}
                title="Disconnect Google Sheets"
                className="p-2 text-slate-400 hover:text-rose-300 hover:bg-rose-500/20 rounded-xl transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={handleSignIn}
              disabled={loading}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer border border-slate-200"
            >
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              </svg>
              {loading ? 'Menghubungkan...' : 'Sign in with Google Sheets'}
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Modal Before Exporting (Mandatory Rule for User-Owned Data) */}
      {showConfirmExport && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-slate-900">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-emerald-700">
              <FileCheck className="w-8 h-8" />
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  {showConfirmExport === 'leger' ? 'Ekspor Leger Nilai ke Google Sheets' : 'Ekspor Presensi ke Google Sheets'}
                </h3>
                <p className="text-xs text-slate-500">Buat file Google Spreadsheet baru di Google Drive Anda.</p>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-950 space-y-1">
              <p className="font-bold">Rincian Akses:</p>
              <ul className="list-disc list-inside text-slate-700 space-y-0.5">
                <li>Membuat Google Spreadsheet baru berjudul: <span className="font-bold text-emerald-800">{showConfirmExport === 'leger' ? `Leger Nilai ${currentKelasName || 'Kelas'}` : `Presensi ${currentKelasName || 'Kelas'}`}</span></li>
                <li>Data dikirim secara langsung dengan autentikasi akun: <span className="font-bold text-slate-900">{user?.email}</span></li>
                <li>File spreadsheet dapat dibuka dan di-share langsung lewat Google Drive Anda.</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowConfirmExport(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={showConfirmExport === 'leger' ? handleExportLeger : handleExportPresensi}
                disabled={loading}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {loading ? 'Membuat Spreadsheet...' : 'Ya, Buat Google Sheet'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-slate-900">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2 text-emerald-700 font-extrabold text-base">
                <FileSpreadsheet className="w-5 h-5" /> Baca Data Dari Google Sheets
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Link Google Sheets / Spreadsheet ID:
                </label>
                <input
                  type="text"
                  value={importSpreadsheetId}
                  onChange={e => setImportSpreadsheetId(e.target.value)}
                  placeholder="misal: https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Rentang Sel (Range):
                </label>
                <input
                  type="text"
                  value={importRange}
                  onChange={e => setImportRange(e.target.value)}
                  placeholder="Sheet1!A1:H50"
                  className="w-full p-2 border border-slate-300 rounded-xl text-xs font-medium"
                />
              </div>

              <button
                onClick={handleFetchSheetData}
                disabled={loading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {loading ? 'Memuat Data Google Sheets...' : 'Ambil Data Baris Google Sheets'}
              </button>
            </div>

            {/* Render Preview Table */}
            {importedRows && importedRows.length > 0 && (
              <div className="space-y-2 pt-2">
                <h4 className="font-extrabold text-xs text-slate-800">Preview Data ({importedRows.length} baris):</h4>
                <div className="overflow-x-auto max-h-60 border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <tbody>
                      {importedRows.map((row, rIdx) => (
                        <tr key={rIdx} className={rIdx === 0 ? 'bg-slate-100 font-bold text-slate-800' : 'border-t border-slate-200'}>
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="p-2 border-r border-slate-200 whitespace-nowrap text-[11px]">
                              {String(cell)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
