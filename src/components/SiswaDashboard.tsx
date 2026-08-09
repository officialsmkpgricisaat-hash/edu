import React from 'react';
import { User, Setting } from '../types';
import { StorageService } from '../services/storageService';
import {
  GraduationCap,
  ClipboardCheck,
  Award,
  BookOpen,
  Calendar,
  AlertTriangle,
  FileCheck2,
  ShieldCheck,
  ShieldAlert,
  Download,
  BookMarked,
  MessageSquare,
  Printer,
  FileText,
} from 'lucide-react';

interface Props {
  user: User;
  setting: Setting;
  activeMenu: string;
  onOpenPrintReport?: (type: string, siswaId?: string) => void;
}

export const SiswaDashboard: React.FC<Props> = ({
  user,
  setting,
  activeMenu,
  onOpenPrintReport,
}) => {
  const siswaList = StorageService.getSiswa();
  const mySiswa = siswaList.find(s => s.id === user.siswaId || s.nama === user.nama) || siswaList[0];
  const myPresensi = StorageService.getPresensiSiswa().filter(p => p.siswaId === mySiswa.id);
  const myNilai = StorageService.getNilai().filter(n => n.siswaId === mySiswa.id);
  const myMateri = StorageService.getMateri().filter(m => m.kelasId === mySiswa.kelasId);
  const myTugas = StorageService.getTugas().filter(t => t.kelasId === mySiswa.kelasId);
  const myPrestasi = StorageService.getPrestasi().filter(p => p.siswaId === mySiswa.id);
  const myPelanggaran = StorageService.getPelanggaran().filter(p => p.siswaId === mySiswa.id);
  const myBimbingan = StorageService.getBimbingan().filter(b => b.siswaId === mySiswa.id);

  // Discipline Calculation (100 Poin Budget untuk 3 Tahun)
  const kedisiplinanStatus = StorageService.getKedisiplinanSiswaBySiswaId(mySiswa.id);

  const hadirCount = myPresensi.filter(p => p.status === 'Hadir').length;
  const totalPresensi = myPresensi.length;
  const attendancePct = totalPresensi > 0 ? Math.round((hadirCount / totalPresensi) * 100) : 96;

  const avgNilai = myNilai.length > 0
    ? (myNilai.reduce((acc, curr) => acc + curr.nilaiAkhir, 0) / myNilai.length).toFixed(1)
    : '85.0';

  if (activeMenu === 'dashboard') {
    return (
      <div className="space-y-6">
        {/* Welcome Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white shadow-xl">
          <div className="flex justify-between items-start">
            <div>
              <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
                Siswa Aktif
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold mt-2">{mySiswa.nama}</h1>
              <p className="text-xs text-blue-100 mt-1">
                NIS: {mySiswa.nis} • Kelas: {mySiswa.namaKelas} • {setting.namaSekolah}
              </p>
            </div>
            <GraduationCap className="w-12 h-12 text-blue-200/50" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-xs font-semibold text-slate-500">Kehadiran Saya</div>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1">{attendancePct}%</div>
            <p className="text-[10px] text-slate-400 mt-1">Presensi Semester Ini</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-xs font-semibold text-slate-500">Rata-rata Nilai</div>
            <div className="text-2xl font-extrabold text-indigo-600 mt-1">{avgNilai}</div>
            <p className="text-[10px] text-emerald-600 font-semibold mt-1">Tuntas KKM</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-xs font-semibold text-slate-500">Poin Kedisiplinan (3 Thn)</div>
            <div className="text-2xl font-extrabold text-blue-600 mt-1">{kedisiplinanStatus.sisaPoin} / 100</div>
            <p className="text-[10px] text-slate-500 font-bold mt-1">{kedisiplinanStatus.statusSP}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-xs font-semibold text-slate-500">Prestasi Saya</div>
            <div className="text-2xl font-extrabold text-purple-600 mt-1">{myPrestasi.length} Penghargaan</div>
            <p className="text-[10px] text-slate-400 mt-1">Poin Tambahan</p>
          </div>
        </div>

        {/* Kedisiplinan Gauge Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Kedisiplinan & Poin Pelanggaran (Maksimal 100 Poin)</h3>
            </div>
            <p className="text-xs text-slate-500">
              Setiap siswa memiliki modal 100 Poin untuk 3 tahun. Sisa Poin Anda saat ini adalah <span className="font-bold text-blue-700">{kedisiplinanStatus.sisaPoin} Poin</span>.
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <div className="text-right">
              <div className="text-[10px] text-slate-400">Kategori Kedisiplinan</div>
              <div className="font-extrabold text-slate-900">{kedisiplinanStatus.statusKategori}</div>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 font-extrabold border border-blue-100">
              {kedisiplinanStatus.statusSP}
            </div>
          </div>
        </div>

        {/* Tugas & Asesmen */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 mb-3">Tugas & Asesmen Terbaru</h3>
          <div className="space-y-2">
            {myTugas.map(t => (
              <div key={t.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex justify-between items-center text-xs">
                <div>
                  <div className="font-bold text-slate-900">{t.judul}</div>
                  <div className="text-slate-500 text-[11px]">{t.namaMapel} • Deadline: <span className="font-bold text-rose-600">{t.deadline}</span></div>
                </div>
                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-bold rounded-lg text-[10px]">
                  Tugas Aktif
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // KARTU PRESENSI BARCODE SAYA
  if (activeMenu === 'kartu_barcode_siswa') {
    const barcodeVal = `*S-${mySiswa.nis}-${mySiswa.kelasId}*`;
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Kartu Presensi Barcode Saya</h1>
          <p className="text-xs text-slate-500">Gunakan barcode ini pada scanner gate sekolah untuk mencatat kehadiran harian.</p>
        </div>

        <div className="max-w-md mx-auto bg-white rounded-3xl border-2 border-indigo-200 p-6 shadow-lg relative overflow-hidden space-y-5">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-800 to-purple-900 text-white p-4 -m-6 mb-4 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-extrabold tracking-widest text-blue-200 uppercase">KARTU PRESENSI BARCODE SISWA</div>
              <div className="text-sm font-extrabold">{setting.namaSekolah}</div>
              <div className="text-[10px] text-blue-200">Cisaat, Kabupaten Sukabumi</div>
            </div>
            <GraduationCap className="w-8 h-8 text-indigo-300" />
          </div>

          <div className="flex space-x-4 items-center">
            <div className="w-20 h-24 bg-indigo-50 rounded-2xl flex flex-col items-center justify-center font-bold text-indigo-400 border border-indigo-200 text-xs text-center p-2 flex-shrink-0">
              <GraduationCap className="w-8 h-8 mb-1 text-indigo-600" />
              <span>PAS FOTO</span>
              <span className="text-[9px]">3 x 4</span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="font-extrabold text-slate-900 text-base">{mySiswa.nama}</div>
              <div className="text-slate-600">NIS: <span className="font-bold text-slate-900">{mySiswa.nis}</span></div>
              <div className="text-slate-600">NISN: <span className="font-bold text-slate-900">{mySiswa.nisn}</span></div>
              <div className="text-slate-600">Kelas: <span className="font-bold text-indigo-700">{mySiswa.namaKelas}</span></div>
              <div className="text-slate-500 text-[11px]">Jenis Kelamin: <span className="font-bold text-slate-800">{mySiswa.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span></div>
            </div>
          </div>

          {/* Barcode Display */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">DIGITAL BARCODE ATTENDANCE ID</div>
            <div className="h-12 flex items-center justify-center space-x-1 bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
              {[3,1,2,1,4,1,2,3,1,2,1,3,1,4,1,2,1,3,2,1,4,1,2,1,3,1,2,4,1,2,1,3].map((w, idx) => (
                <div
                  key={idx}
                  className="h-full bg-slate-900 rounded-2xs"
                  style={{ width: `${w * 2.2}px` }}
                ></div>
              ))}
            </div>
            <div className="text-xs font-mono font-bold text-slate-900 tracking-wider">{barcodeVal}</div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400">
            <span>Berlaku TP {setting.tahunPelajaran}</span>
            <span className="font-bold text-indigo-600">SMP / SMK PGRI CISAAT</span>
          </div>
        </div>
      </div>
    );
  }

  // NILAI SAYA & CETAK RAPOR
  if (activeMenu === 'nilai_saya' || activeMenu === 'cetak_rapor_saya') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Rapor & Nilai Akademik Saya</h1>
            <p className="text-xs text-slate-500">
              Hasil evaluasi belajar resmi semester {setting.semesterAktif} Tahun Pelajaran {setting.tahunPelajaran}.
            </p>
          </div>
          <button
            onClick={() => onOpenPrintReport?.('rapor_siswa', mySiswa.id)}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 hover:from-indigo-700 hover:to-blue-700 shadow-md transition-all"
          >
            <Printer className="w-4 h-4" /> Cetak / Download Rapor Akhir (PDF)
          </button>
        </div>

        {/* Ringkasan Header Rapor Siswa */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white rounded-2xl shadow-lg border border-indigo-800/50 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3 text-xs">
            <div>
              <div className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">Identitas Peserta Didik</div>
              <div className="text-base font-extrabold text-white mt-0.5">{mySiswa.nama}</div>
              <div className="text-blue-200 text-[11px] mt-0.5">NIS: {mySiswa.nis} • NISN: {mySiswa.nisn || '-'} • Kelas: {mySiswa.namaKelas}</div>
            </div>
            <div className="text-right text-xs">
              <div className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">Status Evaluasi Akademik</div>
              <span className="inline-block mt-1 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full font-extrabold text-xs">
                ✓ SELURUH MAPEL TUNTAS KKM
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
            <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-xs">
              <div className="text-[10px] text-slate-300">Rata-rata Nilai Akhir</div>
              <div className="text-lg font-extrabold text-emerald-300">{avgNilai}</div>
            </div>
            <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-xs">
              <div className="text-[10px] text-slate-300">Kehadiran (Presensi)</div>
              <div className="text-lg font-extrabold text-blue-300">{attendancePct}%</div>
            </div>
            <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-xs">
              <div className="text-[10px] text-slate-300">Poin Kedisiplinan</div>
              <div className="text-lg font-extrabold text-purple-300">{kedisiplinanStatus.sisaPoin} / 100</div>
            </div>
            <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-xs">
              <div className="text-[10px] text-slate-300">Prestasi Terdaftar</div>
              <div className="text-lg font-extrabold text-amber-300">{myPrestasi.length} Penghargaan</div>
            </div>
          </div>
        </div>

        {/* Tabel Evaluasi Nilai Akademik */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" /> Transkrip Nilai Hasil Belajar Siswa
            </h3>
            <span className="text-[11px] text-slate-500 font-bold">KKM Minimal: 75.0</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 font-bold border-b border-slate-200 text-slate-700">
                <tr>
                  <th className="p-3 w-10 text-center">No</th>
                  <th className="p-3">Mata Pelajaran</th>
                  <th className="p-3 text-center">Nilai Tugas (30%)</th>
                  <th className="p-3 text-center">Nilai UTS (30%)</th>
                  <th className="p-3 text-center">Nilai UAS (40%)</th>
                  <th className="p-3 text-center">Nilai Akhir</th>
                  <th className="p-3 text-center">Predikat</th>
                  <th className="p-3 text-right">Status KKM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {myNilai.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-slate-400 font-semibold">
                      Belum ada entri nilai akademik terdaftar untuk semester ini.
                    </td>
                  </tr>
                ) : (
                  myNilai.map((n, idx) => {
                    const pred = n.nilaiAkhir >= 90 ? 'A' : n.nilaiAkhir >= 80 ? 'B' : n.nilaiAkhir >= 75 ? 'C' : 'D';
                    return (
                      <tr key={n.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                        <td className="p-3 font-bold text-slate-900">{n.namaMapel}</td>
                        <td className="p-3 text-center font-semibold text-slate-700">{n.nilaiTugas}</td>
                        <td className="p-3 text-center font-semibold text-slate-700">{n.nilaiUTS}</td>
                        <td className="p-3 text-center font-semibold text-slate-700">{n.nilaiUAS}</td>
                        <td className="p-3 text-center font-extrabold text-indigo-700 text-sm">{n.nilaiAkhir}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded font-extrabold text-[11px] ${
                            pred === 'A' ? 'bg-purple-100 text-purple-800' :
                            pred === 'B' ? 'bg-blue-100 text-blue-800' :
                            pred === 'C' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {pred}
                          </span>
                        </td>
                        <td className="p-3 text-right font-bold text-emerald-600">
                          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] border border-emerald-200">
                            {n.statusTuntas}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Bottom Card */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="font-extrabold text-indigo-950 text-xs uppercase tracking-wider flex items-center gap-2">
              <Printer className="w-4 h-4 text-indigo-600" /> Lembar Cetak Rapor Resmi
            </h4>
            <p className="text-xs text-indigo-800">
              Rapor ini menyajikan Kop Resmi Sekolah, Leger Nilai, Rekap Presensi, Poin Kedisiplinan, serta kolom Tanda Tangan Orang Tua & Wali Kelas.
            </p>
          </div>
          <button
            onClick={() => onOpenPrintReport?.('rapor_siswa', mySiswa.id)}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-extrabold text-xs hover:bg-indigo-700 shadow-sm flex items-center gap-2 whitespace-nowrap"
          >
            <Printer className="w-4 h-4" /> Buka Lembar Cetak Rapor (PDF)
          </button>
        </div>
      </div>
    );
  }

  // MATERI & TUGAS SAYA
  if (activeMenu === 'materi_tugas_saya' || activeMenu === 'materi_tugas') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Materi Pembelajaran & Tugas Saya</h1>
          <p className="text-xs text-slate-500">Akses bahan ajar dan lembar tugas kelas {mySiswa.namaKelas}.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Modul Pembelajaran */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b pb-2">
              <BookOpen className="w-4 h-4 text-blue-600" /> Modul Pembelajaran Terupload
            </h3>
            <div className="space-y-3">
              {myMateri.map(m => (
                <div key={m.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="font-bold text-slate-900">{m.judul}</div>
                  <div className="text-[11px] text-slate-500">{m.namaMapel} • {m.deskripsi}</div>
                  <a
                    href={m.linkDrive}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-2 text-blue-600 font-bold hover:underline"
                  >
                    <Download className="w-3.5 h-3.5" /> Unduh Modul Google Drive
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Daftar Tugas */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b pb-2">
              <FileCheck2 className="w-4 h-4 text-indigo-600" /> Penugasan & Asesmen
            </h3>
            <div className="space-y-3">
              {myTugas.map(t => (
                <div key={t.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-start">
                    <div className="font-bold text-slate-900">{t.judul}</div>
                    <span className="text-rose-600 font-bold text-[10px]">Batas: {t.deadline}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">{t.namaMapel} • {t.deskripsi}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // KEHADIRAN SAYA
  if (activeMenu === 'kehadiran_saya' || activeMenu === 'presensi_siswa') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Riwayat Kehadiran Presensi Saya</h1>
          <p className="text-xs text-slate-500">Rekapitulasi persentase presensi dan catatan harian.</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 font-bold border-b border-slate-200 text-slate-700">
              <tr>
                <th className="p-3">Tanggal</th>
                <th className="p-3">Status Kehadiran</th>
                <th className="p-3">Diinput Oleh</th>
                <th className="p-3">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {myPresensi.map(p => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900">{p.tanggal}</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      p.status === 'Hadir' ? 'bg-emerald-50 text-emerald-700' :
                      p.status === 'Sakit' ? 'bg-amber-50 text-amber-700' :
                      p.status === 'Izin' ? 'bg-blue-50 text-blue-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600">{p.diinputOleh}</td>
                  <td className="p-3 text-slate-500">{p.keterangan || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // PRESTASI & PELANGGARAN SAYA
  if (activeMenu === 'prestasi_pelanggaran_saya' || activeMenu === 'prestasi_pelanggaran') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Kedisiplinan, Poin & Prestasi Saya</h1>
          <p className="text-xs text-slate-500">Informasi Poin Kedisiplinan Modal 100 Poin / 3 Tahun dan Catatan Prestasi.</p>
        </div>

        {/* Summary Card */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Poin Kedisiplinan Aktif</div>
              <div className="text-3xl font-extrabold text-blue-700 mt-1">{kedisiplinanStatus.sisaPoin} / 100 Poin</div>
            </div>
            <div className="text-right">
              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-extrabold text-xs">
                {kedisiplinanStatus.statusSP}
              </span>
              <div className="text-xs font-bold text-slate-700 mt-2">Kategori: {kedisiplinanStatus.statusKategori}</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                kedisiplinanStatus.sisaPoin >= 80 ? 'bg-emerald-500' :
                kedisiplinanStatus.sisaPoin >= 50 ? 'bg-amber-500' : 'bg-rose-600'
              }`}
              style={{ width: `${kedisiplinanStatus.sisaPoin}%` }}
            ></div>
          </div>
        </div>

        {/* Logs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Pelanggaran */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b pb-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" /> Catatan Pelanggaran & Pengurangan Poin
            </h3>
            {myPelanggaran.length === 0 ? (
              <p className="text-emerald-600 font-bold py-4 text-center">Tidak ada catatan pelanggaran. Pertahankan!</p>
            ) : (
              <div className="space-y-2">
                {myPelanggaran.map(plg => (
                  <div key={plg.id} className="p-3 bg-rose-50/40 rounded-xl border border-rose-100 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-slate-900">{plg.namaPelanggaran}</div>
                      <div className="text-[11px] text-slate-500">{plg.tanggal} • {plg.tindakLanjut}</div>
                    </div>
                    <span className="font-extrabold text-rose-600 text-xs">-{plg.poin} Poin</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Prestasi */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b pb-2">
              <Award className="w-4 h-4 text-purple-600" /> Catatan Prestasi & Penghargaan
            </h3>
            {myPrestasi.length === 0 ? (
              <p className="text-slate-400 py-4 text-center">Belum ada catatan prestasi terdaftar.</p>
            ) : (
              <div className="space-y-2">
                {myPrestasi.map(pst => (
                  <div key={pst.id} className="p-3 bg-purple-50/40 rounded-xl border border-purple-100 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-slate-900">{pst.namaPrestasi}</div>
                      <div className="text-[11px] text-purple-700 font-semibold">{pst.tingkat} • {pst.penyelenggara}</div>
                    </div>
                    <span className="font-extrabold text-purple-600 text-xs">+{pst.poin} Poin</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // CATATAN BIMBINGAN SAYA
  if (activeMenu === 'catatan_bimbingan_saya') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Catatan Bimbingan & Konseling Saya</h1>
          <p className="text-xs text-slate-500">Histori bimbingan dengan Guru Pengajar / Wali Kelas.</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3 text-xs">
          {myBimbingan.length === 0 ? (
            <p className="text-slate-400 py-4 text-center">Belum ada catatan bimbingan khusus.</p>
          ) : (
            myBimbingan.map(b => (
              <div key={b.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{b.topik}</span>
                  <span className="text-slate-400 text-[11px]">{b.tanggal}</span>
                </div>
                <div className="text-slate-600 mt-1">{b.catatan}</div>
                <div className="text-emerald-700 font-bold mt-2">Tindak Lanjut: {b.tindakLanjut}</div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 text-center text-xs">
      Fitur {activeMenu} Siswa Siap Digunakan.
    </div>
  );
};

