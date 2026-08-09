import React, { useState, useEffect } from 'react';
import { User, Setting, PresensiSiswa, Nilai, Jurnal, Materi, Tugas, GuruPiketLog, Bimbingan, Prestasi, Pelanggaran } from '../types';
import { StorageService } from '../services/storageService';
import {
  ClipboardCheck,
  Award,
  BookOpen,
  NotebookPen,
  Calendar,
  Save,
  CheckCircle,
  CheckCircle2,
  AlertCircle,
  Plus,
  FileText,
  UserCheck,
  ShieldAlert,
  Search,
  MessageSquare,
  MapPin,
  QrCode,
  Compass,
  Locate,
  Navigation,
  RefreshCw,
  Printer,
  AlertTriangle,
  Calculator,
  X,
  Edit,
  TrendingUp,
  Percent,
  BarChart2,
  PieChart,
  Target,
  Users,
} from 'lucide-react';

import { GoogleSheetsBar } from './GoogleSheetsBar';

interface Props {
  user: User;
  setting: Setting;
  activeMenu: string;
  onOpenPrintReport?: (reportType: string) => void;
}

export const GuruDashboard: React.FC<Props> = ({
  user,
  setting,
  activeMenu,
  onOpenPrintReport,
}) => {
  const kelasList = StorageService.getKelas();
  const siswaList = StorageService.getSiswa();
  const mapelList = StorageService.getMapel();
  const jadwalList = StorageService.getJadwal();
  const guruList = StorageService.getGuru();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Presensi State
  const [selectedKelasPresensi, setSelectedKelasPresensi] = useState<string>('KLS-101');
  const [selectedMapelPresensi, setSelectedMapelPresensi] = useState<string>('MP-001');
  const [presensiTanggal, setPresensiTanggal] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState<{ [siswaId: string]: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa' }>({});
  const [attendanceNotes, setAttendanceNotes] = useState<{ [siswaId: string]: string }>({});
  const [searchSiswaPresensi, setSearchSiswaPresensi] = useState<string>('');
  const [isPresensiPiket, setIsPresensiPiket] = useState<boolean>(false);
  const [guruPiketDigantikanId, setGuruPiketDigantikanId] = useState<string>('');

  // Modal Input Presensi Pop-up State
  const [showPresensiModal, setShowPresensiModal] = useState<boolean>(false);
  const [presensiModalKelas, setPresensiModalKelas] = useState<string>('KLS-101');
  const [presensiModalMapel, setPresensiModalMapel] = useState<string>('MP-001');
  const [presensiModalTanggal, setPresensiModalTanggal] = useState<string>(new Date().toISOString().split('T')[0]);
  const [presensiModalRecords, setPresensiModalRecords] = useState<{ [siswaId: string]: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa' }>({});
  const [presensiModalNotes, setPresensiModalNotes] = useState<{ [siswaId: string]: string }>({});

  // Auto-sync presensi records per kelas, mapel, & tanggal
  useEffect(() => {
    const existing = StorageService.getPresensiSiswa();
    const studentsInClass = siswaList.filter(s => s.kelasId === selectedKelasPresensi);
    const newRecords: { [siswaId: string]: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa' } = {};
    const newNotes: { [siswaId: string]: string } = {};

    studentsInClass.forEach(s => {
      const rec = existing.find(p => p.siswaId === s.id && p.tanggal === presensiTanggal && p.mapelId === selectedMapelPresensi);
      if (rec) {
        newRecords[s.id] = rec.status;
        newNotes[s.id] = rec.keterangan || '';
      } else {
        newRecords[s.id] = 'Hadir';
        newNotes[s.id] = '';
      }
    });

    setAttendanceRecords(newRecords);
    setAttendanceNotes(newNotes);
  }, [selectedKelasPresensi, selectedMapelPresensi, presensiTanggal, refreshTrigger]);

  // Auto-sync modal presensi state when modal selections change
  useEffect(() => {
    if (showPresensiModal) {
      const existing = StorageService.getPresensiSiswa();
      const studentsInClass = siswaList.filter(s => s.kelasId === presensiModalKelas);
      const newRecords: { [siswaId: string]: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa' } = {};
      const newNotes: { [siswaId: string]: string } = {};

      studentsInClass.forEach(s => {
        const rec = existing.find(p => p.siswaId === s.id && p.tanggal === presensiModalTanggal && p.mapelId === presensiModalMapel);
        if (rec) {
          newRecords[s.id] = rec.status;
          newNotes[s.id] = rec.keterangan || '';
        } else {
          newRecords[s.id] = 'Hadir';
          newNotes[s.id] = '';
        }
      });

      setPresensiModalRecords(newRecords);
      setPresensiModalNotes(newNotes);
    }
  }, [presensiModalKelas, presensiModalMapel, presensiModalTanggal, showPresensiModal]);

  // Nilai State (Kurikulum Merdeka Formatif & Sumatif Per Tugas)
  const [selectedKelasNilai, setSelectedKelasNilai] = useState<string>('KLS-101');
  const [selectedMapelNilai, setSelectedMapelNilai] = useState<string>('MP-001');
  const [gradeInputMode, setGradeInputMode] = useState<'detail' | 'ringkas'>('detail');
  const [gradeInput, setGradeInput] = useState<{
    [siswaId: string]: {
      f1: number;
      f2: number;
      f3: number;
      s1: number;
      s2: number;
      s3: number;
      sts: number;
      sas: number;
    }
  }>({});
  const [searchSiswaNilai, setSearchSiswaNilai] = useState<string>('');
  const [showInputNilaiModal, setShowInputNilaiModal] = useState<boolean>(false);
  const [modalNilaiSiswa, setModalNilaiSiswa] = useState<{
    siswaId: string;
    namaSiswa: string;
    f1: number;
    f2: number;
    f3: number;
    s1: number;
    s2: number;
    s3: number;
    sts: number;
    sas: number;
    keterangan: string;
  }>({
    siswaId: '',
    namaSiswa: '',
    f1: 80,
    f2: 82,
    f3: 85,
    s1: 80,
    s2: 82,
    s3: 84,
    sts: 80,
    sas: 82,
    keterangan: 'Kinerja belajar stabil dan sangat aktif dalam pembelajaran.',
  });

  // Modal Input Nilai Per Jenis Tugas & Kelas State
  const [showTaskInputModal, setShowTaskInputModal] = useState<boolean>(false);
  const [taskModalKelas, setTaskModalKelas] = useState<string>('KLS-101');
  const [taskModalMapel, setTaskModalMapel] = useState<string>('MP-001');
  const [taskModalJenis, setTaskModalJenis] = useState<'formatif' | 'sumatif' | 'sts' | 'sas' | string>('formatif');
  const [taskModalTp, setTaskModalTp] = useState<string>('TP 1.1');
  const [taskModalJudul, setTaskModalJudul] = useState<string>('Penilaian Formatif Harian');
  const [taskModalScores, setTaskModalScores] = useState<{ [siswaId: string]: number }>({});

  // Sync scores in task modal when modal options change
  useEffect(() => {
    if (showTaskInputModal) {
      const studentsInClass = siswaList.filter(s => s.kelasId === taskModalKelas);
      const initialScores: { [siswaId: string]: number } = {};
      const keyMap: Record<string, keyof typeof gradeInput[string]> = {
        formatif: 'f1',
        sumatif: 's1',
        f1: 'f1', f2: 'f2', f3: 'f3',
        s1: 's1', s2: 's2', s3: 's3',
        sts: 'sts',
        sas: 'sas',
      };
      const targetKey = keyMap[taskModalJenis] || 'f1';

      studentsInClass.forEach(s => {
        const current = gradeInput[s.id];
        if (current) {
          initialScores[s.id] = current[targetKey] ?? 80;
        } else {
          initialScores[s.id] = 80;
        }
      });
      setTaskModalScores(initialScores);
    }
  }, [taskModalKelas, taskModalMapel, taskModalJenis, showTaskInputModal]);

  // Jurnal State
  const [jurnalForm, setJurnalForm] = useState({
    kelasId: 'KLS-101',
    mapelId: 'MP-001',
    materi: '',
    keterangan: 'KBM berjalan dengan lancar.',
    isPiketInval: false,
    guruDigantikanId: '',
  });

  // Guru Piket / Inval Form State
  const [piketForm, setPiketForm] = useState({
    guruDigantikanId: guruList.find(g => g.id !== user.guruId)?.id || '',
    kelasId: 'KLS-101',
    mapelId: 'MP-001',
    jamKe: '07.30 - 09.00',
    materiDisampaikan: '',
    alasanPenggantian: 'Guru Utama Sakit',
    catatanKBM: 'Materi disampaikan sesuai RPP, kelas tertib dan kondusif.',
  });

  // Materi & Tugas Form State
  const [materiForm, setMateriForm] = useState({
    judul: '',
    mapelId: 'MP-001',
    kelasId: 'KLS-101',
    deskripsi: '',
    linkDrive: '',
  });
  const [tugasForm, setTugasForm] = useState({
    judul: '',
    mapelId: 'MP-001',
    kelasId: 'KLS-101',
    deadline: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    deskripsi: '',
  });

  // Bimbingan State
  const [bimbinganForm, setBimbinganForm] = useState({
    siswaId: siswaList[0]?.id || '',
    topik: '',
    catatan: '',
    tindakLanjut: '',
  });

  // Pelanggaran & Prestasi State
  const [pelanggaranForm, setPelanggaranForm] = useState({
    siswaId: siswaList[0]?.id || '',
    namaPelanggaran: '',
    kategori: 'Ringan' as 'Ringan' | 'Sedang' | 'Berat',
    poin: 5,
    tindakLanjut: 'Teguran Lisan',
  });

  // Teacher Barcode & GPS State
  const myGuru = guruList.find(g => g.id === user.guruId || g.nama === user.nama) || guruList[0];
  const [userGps, setUserGps] = useState<{ lat: number; lng: number; isLocating: boolean; error: string | null }>({
    lat: -6.911762, // Default: SMP/SMK PGRI Cisaat (18m radius)
    lng: 106.883120,
    isLocating: false,
    error: null,
  });

  // Calculate distance in meters using Haversine formula
  const calculateDistanceInMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371000; // Radius of Earth in meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  };

  const currentDistanceToSchool = calculateDistanceInMeters(-6.911762, 106.883120, userGps.lat, userGps.lng);
  const isWithin100mRadius = currentDistanceToSchool <= 100;

  const handleGetRealGps = () => {
    if (!navigator.geolocation) {
      setUserGps(prev => ({ ...prev, error: 'Fitur GPS Geolocation tidak didukung oleh browser Anda.' }));
      return;
    }
    setUserGps(prev => ({ ...prev, isLocating: true, error: null }));
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserGps({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          isLocating: false,
          error: null,
        });
      },
      err => {
        setUserGps(prev => ({
          ...prev,
          isLocating: false,
          error: `Gagal membaca GPS: ${err.message}. Menggunakan koordinat default SMP/SMK PGRI Cisaat.`,
        }));
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleProcessBarcodeGuru = () => {
    const dateToday = new Date().toISOString().split('T')[0];
    const timeNow = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';

    if (!isWithin100mRadius) {
      alert(`[PRESENSI GURU DITOLAK]\n\nPosisi Anda terdeteksi ${currentDistanceToSchool} meter dari lokasi SMP/SMK PGRI Cisaat.\nBatas maksimum radius adalah 100 meter.\nMohon lakukan presensi harian saat berada di area kampus sekolah.`);
      return;
    }

    const newLog = {
      id: `PGB-${Date.now().toString().slice(-5)}`,
      tanggal: dateToday,
      jamMasuk: timeNow,
      guruId: myGuru.id,
      namaGuru: myGuru.nama,
      nip: myGuru.nip || '197508122000032001',
      barcodeCode: `GRU-${myGuru.nip || myGuru.id}`,
      lat: userGps.lat,
      lng: userGps.lng,
      jarakKeSekolahMeters: currentDistanceToSchool,
      statusRegional: 'DI DALAM RADIUS 100M' as const,
      status: 'Hadir Verified' as const,
      keterangan: `Presensi Berhasil • Barcode Valid & Terverifikasi ${currentDistanceToSchool}m dari SMP/SMK PGRI Cisaat`,
    };

    StorageService.savePresensiGuruBarcodeLog(newLog);
    setRefreshTrigger(prev => prev + 1);
    alert(`[PRESENSI HARIAN BARCODE GURU BERHASIL]\n\nTerverifikasi untuk: ${myGuru.nama}\nJam Masuk: ${timeNow}\nJarak ke SMP/SMK PGRI Cisaat: ${currentDistanceToSchool} Meter (Dalam Radius 100m).`);
  };

  // Filtered Siswa for Presensi
  const siswaForPresensi = siswaList.filter(s => s.kelasId === selectedKelasPresensi);

  const handleStatusChange = (siswaId: string, status: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa') => {
    setAttendanceRecords(prev => ({ ...prev, [siswaId]: status }));
  };

  const handleMassSetStatus = (status: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa') => {
    const newRecords: { [id: string]: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa' } = {};
    siswaForPresensi.forEach(s => {
      newRecords[s.id] = status;
    });
    setAttendanceRecords(newRecords);
  };

  // Save Attendance (Inline)
  const handleSavePresensi = () => {
    const existing = StorageService.getPresensiSiswa();
    const mapelObj = mapelList.find(m => m.id === selectedMapelPresensi);
    const mapelName = mapelObj ? mapelObj.namaMapel : 'Mata Pelajaran';
    const alreadyExists = existing.some(p => p.kelasId === selectedKelasPresensi && p.mapelId === selectedMapelPresensi && p.tanggal === presensiTanggal);

    const replacedGuru = guruList.find(g => g.id === guruPiketDigantikanId);
    const diinputOlehStr = isPresensiPiket && replacedGuru 
      ? `${user.nama} (Guru Piket mgg: ${replacedGuru.nama})`
      : user.nama;

    const batch: PresensiSiswa[] = siswaForPresensi.map(s => ({
      id: `PS-${s.id}-${selectedMapelPresensi}-${presensiTanggal}`,
      tanggal: presensiTanggal,
      kelasId: selectedKelasPresensi,
      mapelId: selectedMapelPresensi,
      namaMapel: mapelName,
      siswaId: s.id,
      namaSiswa: s.nama,
      status: attendanceRecords[s.id] || 'Hadir',
      keterangan: attendanceNotes[s.id] || (isPresensiPiket ? 'Dicatat oleh Guru Piket' : ''),
      diinputOleh: diinputOlehStr,
    }));

    StorageService.savePresensiSiswaBatch(batch);
    setRefreshTrigger(prev => prev + 1);
    if (alreadyExists) {
      alert(`Data presensi mata pelajaran ${mapelName} tanggal ${presensiTanggal} untuk kelas ini diperbarui.`);
    } else {
      alert(`Presensi ${batch.length} siswa untuk mapel ${mapelName} berhasil disimpan!`);
    }
  };

  // Open Pop-up Modal Presensi
  const openPresensiModal = () => {
    setPresensiModalKelas(selectedKelasPresensi);
    setPresensiModalMapel(selectedMapelPresensi);
    setPresensiModalTanggal(presensiTanggal);

    const existing = StorageService.getPresensiSiswa();
    const students = siswaList.filter(s => s.kelasId === selectedKelasPresensi);
    const recs: { [id: string]: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa' } = {};
    const notes: { [id: string]: string } = {};

    students.forEach(s => {
      const r = existing.find(p => p.siswaId === s.id && p.tanggal === presensiTanggal && p.mapelId === selectedMapelPresensi);
      recs[s.id] = r ? r.status : 'Hadir';
      notes[s.id] = r ? (r.keterangan || '') : '';
    });

    setPresensiModalRecords(recs);
    setPresensiModalNotes(notes);
    setShowPresensiModal(true);
  };

  // Save Modal Presensi
  const handleSavePresensiModal = (e: React.FormEvent) => {
    e.preventDefault();
    const students = siswaList.filter(s => s.kelasId === presensiModalKelas);
    const mapelObj = mapelList.find(m => m.id === presensiModalMapel);
    const mapelName = mapelObj ? mapelObj.namaMapel : 'Mata Pelajaran';

    const batch: PresensiSiswa[] = students.map(s => ({
      id: `PS-${s.id}-${presensiModalMapel}-${presensiModalTanggal}`,
      tanggal: presensiModalTanggal,
      kelasId: presensiModalKelas,
      mapelId: presensiModalMapel,
      namaMapel: mapelName,
      siswaId: s.id,
      namaSiswa: s.nama,
      status: presensiModalRecords[s.id] || 'Hadir',
      keterangan: presensiModalNotes[s.id] || '',
      diinputOleh: user.nama,
    }));

    StorageService.savePresensiSiswaBatch(batch);
    setRefreshTrigger(prev => prev + 1);
    setShowPresensiModal(false);
    alert(`[SIMPAN POP-UP PRESENSI BERHASIL]\n\nData presensi ${students.length} siswa untuk kelas ${presensiModalKelas} (${mapelName}) tanggal ${presensiModalTanggal} berhasil disimpan!`);
  };

  // Helper: Calculate Kurikulum Merdeka Grade Averages and Final Score
  const computeStudentScore = (input: { f1?: number; f2?: number; f3?: number; s1?: number; s2?: number; s3?: number; sts?: number; sas?: number; tugas?: number; uts?: number; uas?: number }) => {
    const f1 = input?.f1 ?? input?.tugas ?? 80;
    const f2 = input?.f2 ?? input?.tugas ?? 82;
    const f3 = input?.f3 ?? input?.tugas ?? 85;
    const s1 = input?.s1 ?? input?.tugas ?? 80;
    const s2 = input?.s2 ?? input?.tugas ?? 82;
    const s3 = input?.s3 ?? input?.tugas ?? 84;
    const sts = input?.sts ?? input?.uts ?? 80;
    const sas = input?.sas ?? input?.uas ?? 82;

    const avgF = Number(((f1 + f2 + f3) / 3).toFixed(1));
    const avgS = Number(((s1 + s2 + s3) / 3).toFixed(1));
    const finalScore = Number(((avgF * 0.20) + (avgS * 0.30) + (sts * 0.25) + (sas * 0.25)).toFixed(1));

    return { f1, f2, f3, s1, s2, s3, sts, sas, avgF, avgS, finalScore };
  };

  // Save Nilai Single
  const handleSaveNilaiSingle = (siswaId: string, namaSiswa: string) => {
    const input = gradeInput[siswaId] || { f1: 80, f2: 82, f3: 85, s1: 80, s2: 82, s3: 84, sts: 80, sas: 82 };
    const { f1, f2, f3, s1, s2, s3, sts, sas, avgF, avgS, finalScore } = computeStudentScore(input);
    const isTuntas = finalScore >= 75 ? 'Tuntas' : 'Belum Tuntas';

    const mapelObj = mapelList.find(m => m.id === selectedMapelNilai);

    const record: Nilai = {
      id: `NL-${siswaId}-${selectedMapelNilai}`,
      siswaId,
      namaSiswa,
      kelasId: selectedKelasNilai,
      mapelId: selectedMapelNilai,
      namaMapel: mapelObj ? mapelObj.namaMapel : 'Mata Pelajaran',
      semester: setting.semesterAktif,
      tahunPelajaran: setting.tahunPelajaran,
      f1, f2, f3,
      s1, s2, s3,
      sts,
      sas,
      nilaiTugas: avgF,
      nilaiUTS: sts,
      nilaiUAS: sas,
      nilaiAkhir: finalScore,
      statusTuntas: isTuntas,
    };

    StorageService.saveNilai(record);
    setRefreshTrigger(prev => prev + 1);
    alert(`Nilai ${namaSiswa} berhasil disimpan!\n(Formatif: ${avgF} | Sumatif Materi: ${avgS} | STS: ${sts} | SAS: ${sas} => Nilai Akhir: ${finalScore} - ${isTuntas})`);
  };

  // Sync gradeInput with saved storage values when class/mapel changes
  useEffect(() => {
    const allNilai = StorageService.getNilai();
    const studentsInClass = siswaList.filter(s => s.kelasId === selectedKelasNilai);
    const newGradeInput: {
      [siswaId: string]: {
        f1: number; f2: number; f3: number;
        s1: number; s2: number; s3: number;
        sts: number; sas: number;
      }
    } = {};

    studentsInClass.forEach(s => {
      const existing = allNilai.find(
        n => n.siswaId === s.id && n.mapelId === selectedMapelNilai && n.semester === setting.semesterAktif
      );
      if (existing) {
        newGradeInput[s.id] = {
          f1: existing.f1 ?? existing.nilaiTugas ?? 80,
          f2: existing.f2 ?? existing.nilaiTugas ?? 82,
          f3: existing.f3 ?? existing.nilaiTugas ?? 85,
          s1: existing.s1 ?? existing.nilaiTugas ?? 80,
          s2: existing.s2 ?? existing.nilaiTugas ?? 82,
          s3: existing.s3 ?? existing.nilaiTugas ?? 84,
          sts: existing.sts ?? existing.nilaiUTS ?? 80,
          sas: existing.sas ?? existing.nilaiUAS ?? 82,
        };
      } else {
        newGradeInput[s.id] = { f1: 80, f2: 82, f3: 85, s1: 80, s2: 82, s3: 84, sts: 80, sas: 82 };
      }
    });

    setGradeInput(newGradeInput);
  }, [selectedKelasNilai, selectedMapelNilai, refreshTrigger, setting.semesterAktif]);

  // Save All Nilai Batch
  const handleSaveNilaiBatch = () => {
    const studentsInClass = siswaList.filter(s => s.kelasId === selectedKelasNilai);
    const mapelObj = mapelList.find(m => m.id === selectedMapelNilai);

    const batchRecords: Nilai[] = studentsInClass.map(s => {
      const input = gradeInput[s.id] || { f1: 80, f2: 82, f3: 85, s1: 80, s2: 82, s3: 84, sts: 80, sas: 82 };
      const { f1, f2, f3, s1, s2, s3, sts, sas, avgF, avgS, finalScore } = computeStudentScore(input);
      const isTuntas = finalScore >= 75 ? 'Tuntas' : 'Belum Tuntas';

      return {
        id: `NL-${s.id}-${selectedMapelNilai}`,
        siswaId: s.id,
        namaSiswa: s.nama,
        kelasId: selectedKelasNilai,
        mapelId: selectedMapelNilai,
        namaMapel: mapelObj ? mapelObj.namaMapel : 'Mata Pelajaran',
        semester: setting.semesterAktif,
        tahunPelajaran: setting.tahunPelajaran,
        f1, f2, f3,
        s1, s2, s3,
        sts,
        sas,
        nilaiTugas: avgF,
        nilaiUTS: sts,
        nilaiUAS: sas,
        nilaiAkhir: finalScore,
        statusTuntas: isTuntas,
      };
    });

    StorageService.saveNilaiBatch(batchRecords);
    setRefreshTrigger(prev => prev + 1);
    alert(`[MANAJEMEN NILAI BERHASIL DISIMPAN BATCH]\n\nData Nilai Formatif, Sumatif Materi, STS, & SAS/SAT untuk ${batchRecords.length} siswa kelas ${selectedKelasNilai} (${mapelObj?.namaMapel || ''}) berhasil diperbarui!`);
  };

  // Save Modal Nilai Single
  const handleSaveNilaiModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalNilaiSiswa.siswaId) return;

    const mapelObj = mapelList.find(m => m.id === selectedMapelNilai);
    const { f1, f2, f3, s1, s2, s3, sts, sas, avgF, avgS, finalScore } = computeStudentScore(modalNilaiSiswa);
    const isTuntas = finalScore >= 75 ? 'Tuntas' : 'Belum Tuntas';

    const record: Nilai = {
      id: `NL-${modalNilaiSiswa.siswaId}-${selectedMapelNilai}`,
      siswaId: modalNilaiSiswa.siswaId,
      namaSiswa: modalNilaiSiswa.namaSiswa,
      kelasId: selectedKelasNilai,
      mapelId: selectedMapelNilai,
      namaMapel: mapelObj ? mapelObj.namaMapel : 'Mata Pelajaran',
      semester: setting.semesterAktif,
      tahunPelajaran: setting.tahunPelajaran,
      f1, f2, f3,
      s1, s2, s3,
      sts,
      sas,
      nilaiTugas: avgF,
      nilaiUTS: sts,
      nilaiUAS: sas,
      nilaiAkhir: finalScore,
      statusTuntas: isTuntas,
    };

    StorageService.saveNilai(record);
    setGradeInput(prev => ({
      ...prev,
      [modalNilaiSiswa.siswaId]: { f1, f2, f3, s1, s2, s3, sts, sas }
    }));
    setRefreshTrigger(prev => prev + 1);
    setShowInputNilaiModal(false);
    alert(`Nilai untuk ${modalNilaiSiswa.namaSiswa} berhasil disimpan!\nNilai Akhir: ${finalScore} (${isTuntas ? 'Tuntas KKM' : 'Belum Tuntas'})`);
  };

  const openTaskInputModal = (jenis: string = 'formatif') => {
    setTaskModalKelas(selectedKelasNilai);
    setTaskModalMapel(selectedMapelNilai);

    const validJenis = (jenis === 'f1' || jenis === 'f2' || jenis === 'f3')
      ? 'formatif'
      : (jenis === 's1' || jenis === 's2' || jenis === 's3')
      ? 'sumatif'
      : jenis;

    setTaskModalJenis(validJenis);

    const jenisLabelMap: Record<string, string> = {
      formatif: 'Penilaian Formatif Harian',
      sumatif: 'Penilaian Sumatif Lingkup Materi',
      sts: 'Sumatif Tengah Semester (STS)',
      sas: 'Sumatif Akhir Semester (SAS/SAT)',
    };
    setTaskModalJudul(jenisLabelMap[validJenis] || 'Penilaian Harian');
    setTaskModalTp(validJenis === 'formatif' ? 'TP 1.1' : validJenis === 'sumatif' ? 'TP 1.2' : 'TP 1');

    const studentsInClass = siswaList.filter(s => s.kelasId === selectedKelasNilai);
    const initialScores: { [siswaId: string]: number } = {};
    const keyMap: Record<string, string> = {
      formatif: 'f1',
      sumatif: 's1',
      sts: 'sts',
      sas: 'sas',
    };
    const targetKey = keyMap[validJenis] || 'f1';

    studentsInClass.forEach(s => {
      const current = gradeInput[s.id];
      if (current) {
        initialScores[s.id] = (current as any)[targetKey] ?? 80;
      } else {
        initialScores[s.id] = 80;
      }
    });
    setTaskModalScores(initialScores);
    setShowTaskInputModal(true);
  };

  const handleSaveTaskModal = (e: React.FormEvent) => {
    e.preventDefault();
    const studentsInClass = siswaList.filter(s => s.kelasId === taskModalKelas);
    const mapelObj = mapelList.find(m => m.id === taskModalMapel);

    const keyMap: Record<string, string> = {
      formatif: 'f1',
      sumatif: 's1',
      sts: 'sts',
      sas: 'sas',
    };
    const targetKey = keyMap[taskModalJenis] || 'f1';

    const updatedGradeInput = { ...gradeInput };
    studentsInClass.forEach(s => {
      const current = updatedGradeInput[s.id] || { f1: 80, f2: 82, f3: 85, s1: 80, s2: 82, s3: 84, sts: 80, sas: 82 };
      const val = taskModalScores[s.id] !== undefined ? taskModalScores[s.id] : 80;
      updatedGradeInput[s.id] = {
        ...current,
        [targetKey]: Math.min(100, Math.max(0, val)),
      };
    });
    setGradeInput(updatedGradeInput);

    const batchRecords: Nilai[] = studentsInClass.map(s => {
      const input = updatedGradeInput[s.id];
      const { f1, f2, f3, s1, s2, s3, sts, sas, avgF, avgS, finalScore } = computeStudentScore(input);
      const isTuntas = finalScore >= 75 ? 'Tuntas' : 'Belum Tuntas';

      return {
        id: `NL-${s.id}-${taskModalMapel}`,
        siswaId: s.id,
        namaSiswa: s.nama,
        kelasId: taskModalKelas,
        mapelId: taskModalMapel,
        namaMapel: mapelObj ? mapelObj.namaMapel : 'Mata Pelajaran',
        semester: setting.semesterAktif,
        tahunPelajaran: setting.tahunPelajaran,
        f1, f2, f3,
        s1, s2, s3,
        sts,
        sas,
        nilaiTugas: avgF,
        nilaiUTS: sts,
        nilaiUAS: sas,
        nilaiAkhir: finalScore,
        statusTuntas: isTuntas,
      };
    });

    StorageService.saveNilaiBatch(batchRecords);
    setRefreshTrigger(prev => prev + 1);
    setShowTaskInputModal(false);

    const jenisLabelMap: Record<string, string> = {
      f1: 'Formatif 1', f2: 'Formatif 2', f3: 'Formatif 3',
      s1: 'Sumatif 1', s2: 'Sumatif 2', s3: 'Sumatif 3',
      sts: 'STS', sas: 'SAS/SAT',
    };

    alert(`[SIMPAN MANUAL BERHASIL]\n\nNilai ${jenisLabelMap[taskModalJenis]} untuk ${studentsInClass.length} siswa di Kelas ${taskModalKelas} (${mapelObj?.namaMapel || ''}) berhasil diperbarui!`);
  };

  // Save Jurnal
  const handleSaveJurnal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jurnalForm.materi) return;

    const kelasObj = kelasList.find(k => k.id === jurnalForm.kelasId);
    const mapelObj = mapelList.find(m => m.id === jurnalForm.mapelId);
    const replacedGuru = guruList.find(g => g.id === jurnalForm.guruDigantikanId);

    const keteranganFinal = jurnalForm.isPiketInval && replacedGuru
      ? `[GURU PIKET / INVAL] Menggantikan ${replacedGuru.nama}. ${jurnalForm.keterangan}`
      : jurnalForm.keterangan;

    const newJurnal: Jurnal = {
      id: `JRN-${Date.now().toString().slice(-4)}`,
      tanggal: new Date().toISOString().split('T')[0],
      guruId: user.guruId || 'GRU-001',
      namaGuru: user.nama,
      mapelId: jurnalForm.mapelId,
      namaMapel: mapelObj ? mapelObj.namaMapel : 'Matematika',
      kelasId: jurnalForm.kelasId,
      namaKelas: kelasObj ? kelasObj.namaKelas : 'X TO 1',
      materi: jurnalForm.materi,
      keterangan: keteranganFinal,
      status: 'Sudah Mengisi',
    };

    StorageService.saveJurnal(newJurnal);
    setJurnalForm({ ...jurnalForm, materi: '' });
    alert('Jurnal mengajar berhasil disimpan!');
  };

  // Save Guru Piket / Inval
  const handleSaveGuruPiket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!piketForm.materiDisampaikan) {
      alert('Mohon isi materi pembelajaran yang disampaikan saat jam piket.');
      return;
    }

    const replacedGuru = guruList.find(g => g.id === piketForm.guruDigantikanId);
    const kelasObj = kelasList.find(k => k.id === piketForm.kelasId);
    const mapelObj = mapelList.find(m => m.id === piketForm.mapelId);

    const log: GuruPiketLog = {
      id: `PKT-${Date.now().toString().slice(-4)}`,
      tanggal: new Date().toISOString().split('T')[0],
      guruPiketId: user.guruId || 'GRU-001',
      namaGuruPiket: user.nama,
      guruDigantikanId: piketForm.guruDigantikanId,
      namaGuruDigantikan: replacedGuru?.nama || 'Guru Absen',
      kelasId: piketForm.kelasId,
      namaKelas: kelasObj?.namaKelas || 'X TO 1',
      mapelId: piketForm.mapelId,
      namaMapel: mapelObj?.namaMapel || 'Mata Pelajaran',
      jamKe: piketForm.jamKe,
      materiDisampaikan: piketForm.materiDisampaikan,
      alasanPenggantian: piketForm.alasanPenggantian,
      catatanKBM: piketForm.catatanKBM,
      status: 'Selesai',
    };

    StorageService.saveGuruPiketLog(log);

    // Automatically create a Jurnal entry for this substitute teaching
    const newJurnal: Jurnal = {
      id: `JRN-PKT-${Date.now().toString().slice(-4)}`,
      tanggal: log.tanggal,
      guruId: user.guruId || 'GRU-001',
      namaGuru: `${user.nama} (Guru Piket)`,
      mapelId: log.mapelId || 'MP-001',
      namaMapel: log.namaMapel || 'Mapel Inval',
      kelasId: log.kelasId,
      namaKelas: log.namaKelas,
      materi: `[INVAL/PIKET] ${log.materiDisampaikan}`,
      keterangan: `Menggantikan ${log.namaGuruDigantikan} (${log.alasanPenggantian}). ${log.catatanKBM}`,
      status: 'Sudah Mengisi',
    };
    StorageService.saveJurnal(newJurnal);

    setPiketForm({ ...piketForm, materiDisampaikan: '' });
    setRefreshTrigger(prev => prev + 1);
    alert('Laporan Guru Piket / Inval berhasil disimpan ke database & terhubung ke Jurnal Mengajar!');
  };

  // Save Materi
  const handleSaveMateri = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materiForm.judul) return;
    const mapelObj = mapelList.find(m => m.id === materiForm.mapelId);
    StorageService.saveMateri({
      id: `MTR-${Date.now().toString().slice(-4)}`,
      judul: materiForm.judul,
      mapelId: materiForm.mapelId,
      namaMapel: mapelObj?.namaMapel || 'Mata Pelajaran',
      kelasId: materiForm.kelasId,
      deskripsi: materiForm.deskripsi,
      linkDrive: materiForm.linkDrive || 'https://drive.google.com/file/d/example',
      tanggalUpload: new Date().toISOString().split('T')[0],
      guruId: user.guruId || 'GRU-001',
    });
    setMateriForm({ ...materiForm, judul: '', deskripsi: '', linkDrive: '' });
    alert('Materi pembelajaran berhasil diunggah!');
  };

  // Save Tugas
  const handleSaveTugas = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tugasForm.judul) return;
    const mapelObj = mapelList.find(m => m.id === tugasForm.mapelId);
    StorageService.saveTugas({
      id: `TGS-${Date.now().toString().slice(-4)}`,
      judul: tugasForm.judul,
      mapelId: tugasForm.mapelId,
      namaMapel: mapelObj?.namaMapel || 'Mata Pelajaran',
      kelasId: tugasForm.kelasId,
      deadline: tugasForm.deadline,
      deskripsi: tugasForm.deskripsi,
      guruId: user.guruId || 'GRU-001',
    });
    setTugasForm({ ...tugasForm, judul: '', deskripsi: '' });
    alert('Tugas / Asesmen baru berhasil diterbitkan!');
  };

  // Save Bimbingan
  const handleSaveBimbingan = (e: React.FormEvent) => {
    e.preventDefault();
    const siswa = siswaList.find(s => s.id === bimbinganForm.siswaId);
    if (!siswa || !bimbinganForm.topik) return;

    StorageService.saveBimbingan({
      id: `BMB-${Date.now().toString().slice(-4)}`,
      tanggal: new Date().toISOString().split('T')[0],
      siswaId: siswa.id,
      namaSiswa: siswa.nama,
      kelasId: siswa.kelasId,
      guruId: user.guruId || 'GRU-001',
      namaGuru: user.nama,
      topik: bimbinganForm.topik,
      catatan: bimbinganForm.catatan,
      tindakLanjut: bimbinganForm.tindakLanjut,
    });
    setBimbinganForm({ ...bimbinganForm, topik: '', catatan: '', tindakLanjut: '' });
    alert(`Catatan bimbingan untuk ${siswa.nama} berhasil disimpan!`);
  };

  // Save Pelanggaran
  const handleSavePelanggaran = (e: React.FormEvent) => {
    e.preventDefault();
    const siswa = siswaList.find(s => s.id === pelanggaranForm.siswaId);
    if (!siswa || !pelanggaranForm.namaPelanggaran) return;

    StorageService.savePelanggaran({
      id: `PLG-${Date.now().toString().slice(-4)}`,
      tanggal: new Date().toISOString().split('T')[0],
      siswaId: siswa.id,
      namaSiswa: siswa.nama,
      kelasId: siswa.kelasId,
      namaPelanggaran: pelanggaranForm.namaPelanggaran,
      kategori: pelanggaranForm.kategori,
      poin: Number(pelanggaranForm.poin),
      tindakLanjut: pelanggaranForm.tindakLanjut,
    });

    const kedis = StorageService.getKedisiplinanSiswaBySiswaId(siswa.id);
    setPelanggaranForm({ ...pelanggaranForm, namaPelanggaran: '' });
    alert(`Pelanggaran dicatat! ${siswa.nama} kini memiliki sisa poin kedisiplinan: ${kedis.sisaPoin}/100 Poin (${kedis.statusSP}).`);
  };

  // OVERVIEW GURU
  if (activeMenu === 'dashboard') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Dashboard Guru Pengajar</h1>
          <p className="text-xs text-slate-500">Selamat datang, {user.nama}. Kelola KBM, presensi, tugas, dan piket guru.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-semibold">Jadwal Mengajar</div>
              <div className="text-sm font-bold text-slate-900">{jadwalList.length} Sesi Aktif</div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-semibold">Status Jurnal</div>
              <div className="text-sm font-bold text-emerald-600">Sudah Mengisi</div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-semibold">Tugas Guru Piket</div>
              <div className="text-sm font-bold text-indigo-700">{StorageService.getGuruPiketLogs().length} Laporan Inval</div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-semibold">Materi Terupload</div>
              <div className="text-sm font-bold text-slate-900">{StorageService.getMateri().length} Modul</div>
            </div>
          </div>
        </div>

        {/* Google Sheets Integration Bar */}
        <GoogleSheetsBar
          currentKelasId={selectedKelasNilai || selectedKelasPresensi}
          onSuccessNotification={msg => alert(msg)}
        />

        {/* Schedule list */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 mb-3">Jadwal Mengajar Hari Ini & Minggu Ini</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 font-bold border-b border-slate-200 text-slate-700">
                <tr>
                  <th className="p-3">Hari</th>
                  <th className="p-3">Waktu</th>
                  <th className="p-3">Kelas</th>
                  <th className="p-3">Mata Pelajaran</th>
                  <th className="p-3">Ruang</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {jadwalList.map(j => (
                  <tr key={j.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{j.hari}</td>
                    <td className="p-3 text-slate-500">{j.jamKe}</td>
                    <td className="p-3 font-semibold text-blue-700">{j.namaKelas}</td>
                    <td className="p-3 font-semibold">{j.namaMapel}</td>
                    <td className="p-3 text-slate-600">{j.ruang}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // PRESENSI BARCODE GURU & GEOLOCATION GPS (100M REGIONAL SMP/SMK PGRI CISAAT)
  if (activeMenu === 'presensi_guru_barcode') {
    const barcodeLogs = StorageService.getPresensiGuruBarcodeLogs();
    const barcodeCodeVal = `GRU-${myGuru.nip || myGuru.id}`;

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <QrCode className="w-6 h-6 text-blue-600" />
              Input Presensi Harian Barcode Guru & GPS Regional
            </h1>
            <p className="text-xs text-slate-500">
              Validasi Kehadiran Barcode Guru khusus Zona Kampus <span className="font-bold text-blue-700">SMP / SMK PGRI Cisaat</span> (Radius Maksimal 100 Meter).
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <span className={`px-3 py-1.5 rounded-xl font-extrabold flex items-center gap-1.5 border ${
              isWithin100mRadius 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}>
              <Compass className="w-4 h-4 animate-pulse" />
              {isWithin100mRadius 
                ? `VERIFIED: ${currentDistanceToSchool}m dari SMP/SMK PGRI Cisaat (<= 100m)` 
                : `DITOLAK: ${currentDistanceToSchool}m dari SMP/SMK PGRI Cisaat (> 100m)`}
            </span>
          </div>
        </div>

        {/* GPS Location & Barcode Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
          {/* Left Column: Google Maps Regional 100m & GPS Control */}
          <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-rose-600" />
                  <div>
                    <h2 className="font-extrabold text-slate-900 text-sm">Peta Regional 100m — SMP/SMK PGRI Cisaat</h2>
                    <p className="text-[11px] text-slate-500">Jl. Raya Cisaat No. 126, Cisaat, Sukabumi • Lat: -6.911762, Lng: 106.883120</p>
                  </div>
                </div>
                <button
                  onClick={handleGetRealGps}
                  disabled={userGps.isLocating}
                  className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl font-bold hover:bg-blue-100 flex items-center gap-1.5"
                >
                  <Locate className={`w-3.5 h-3.5 ${userGps.isLocating ? 'animate-spin' : ''}`} />
                  {userGps.isLocating ? 'Membaca GPS...' : 'Cek GPS Saya'}
                </button>
              </div>

              {/* Embedded Google Map */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 h-64 bg-slate-100">
                <iframe
                  title="Google Map SMP SMK PGRI Cisaat"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  src={`https://maps.google.com/maps?q=${userGps.lat},${userGps.lng}&z=17&output=embed`}
                ></iframe>
                <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-xs p-2 rounded-xl shadow-md border border-slate-200 text-[10px] space-y-0.5">
                  <div className="font-extrabold text-slate-900">📍 SMP / SMK PGRI CISAAT</div>
                  <div className="text-slate-600">Batas Zona: <span className="font-bold text-blue-700">100 Meter Circle</span></div>
                  <div className="text-slate-600">Jarak Terdeteksi: <span className={`font-bold ${isWithin100mRadius ? 'text-emerald-600' : 'text-rose-600'}`}>{currentDistanceToSchool} Meter</span></div>
                </div>
              </div>

              {/* GPS Readout & Simulator Buttons */}
              <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">KOORDINAT SAYA SAAT INI</div>
                  <div className="font-mono font-extrabold text-slate-800 text-xs">
                    {userGps.lat.toFixed(6)}, {userGps.lng.toFixed(6)}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setUserGps({ lat: -6.911762, lng: 106.883120, isLocating: false, error: null })}
                    className="px-2.5 py-1.5 bg-emerald-600 text-white rounded-lg font-bold text-[10px] hover:bg-emerald-700 shadow-2xs"
                  >
                    Simulasi: Di Kampus PGRI (18m)
                  </button>
                  <button
                    onClick={() => setUserGps({ lat: -6.915000, lng: 106.887000, isLocating: false, error: null })}
                    className="px-2.5 py-1.5 bg-rose-600 text-white rounded-lg font-bold text-[10px] hover:bg-rose-700 shadow-2xs"
                  >
                    Simulasi: Luar Area (420m)
                  </button>
                </div>
              </div>
            </div>

            {userGps.error && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-[11px] font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
                <span>{userGps.error}</span>
              </div>
            )}
          </div>

          {/* Right Column: Teacher Digital Barcode & Scan Verification */}
          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                <QrCode className="w-5 h-5 text-indigo-600" />
                <h2 className="font-extrabold text-slate-900 text-sm">Kartu Digital Barcode Presensi Guru</h2>
              </div>

              {/* Teacher ID Card Preview */}
              <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-4 rounded-2xl border border-slate-800 shadow-md space-y-3">
                <div className="flex justify-between items-start border-b border-slate-800 pb-2">
                  <div>
                    <div className="text-[9px] font-extrabold text-blue-400 uppercase tracking-widest">KARTU PRESENSI GURU</div>
                    <div className="text-xs font-extrabold">{setting.namaSekolah}</div>
                  </div>
                  <UserCheck className="w-5 h-5 text-indigo-400" />
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-12 h-14 bg-indigo-600/30 border border-indigo-400/50 rounded-xl flex items-center justify-center font-bold text-indigo-300 text-sm flex-shrink-0">
                    {myGuru.nama.charAt(0)}
                  </div>
                  <div className="space-y-0.5 overflow-hidden">
                    <div className="font-extrabold text-white text-xs truncate">{myGuru.nama}</div>
                    <div className="text-[11px] text-blue-300 truncate">NIP: {myGuru.nip || '197508122000032001'}</div>
                    <div className="text-[10px] text-slate-400 truncate">Guru: {myGuru.mapel}</div>
                  </div>
                </div>

                {/* Simulated Barcode Graphic */}
                <div className="p-2.5 bg-white text-slate-900 rounded-xl text-center space-y-1">
                  <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">BARCODE NIP GURU TERDAFTAR</div>
                  <div className="h-8 flex items-center justify-center space-x-0.5">
                    {[4,1,2,3,1,2,4,1,3,1,2,3,1,4,1,2,1,3,2,1,4,1,2,1,3,2,4,1,2].map((w, idx) => (
                      <div
                        key={idx}
                        className="h-full bg-slate-900 rounded-2xs"
                        style={{ width: `${w * 1.6}px` }}
                      ></div>
                    ))}
                  </div>
                  <div className="text-[10px] font-mono font-extrabold text-slate-900 tracking-wider">
                    *{barcodeCodeVal}*
                  </div>
                </div>
              </div>

              {/* Status Radius Info Banner */}
              <div className={`p-3.5 rounded-xl border text-xs font-bold space-y-1 ${
                isWithin100mRadius 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}>
                <div className="flex items-center justify-between">
                  <span>Status Lokasi Regional:</span>
                  <span className="uppercase font-extrabold">{isWithin100mRadius ? 'DI DALAM RADIUS 100M' : 'DI LUAR RADIUS 100M'}</span>
                </div>
                <div className="text-[11px] font-medium opacity-90">
                  {isWithin100mRadius 
                    ? `✓ Posisi Anda ${currentDistanceToSchool}m dari SMP/SMK PGRI Cisaat. Sistem mengizinkan presensi barcode!`
                    : `✕ Posisi Anda ${currentDistanceToSchool}m dari SMP/SMK PGRI Cisaat. Presensi dikunci hingga Anda masuk radius 100m.`}
                </div>
              </div>
            </div>

            {/* Action Submit Presensi Button */}
            <button
              onClick={handleProcessBarcodeGuru}
              className={`w-full py-3 rounded-xl font-extrabold text-xs shadow-md flex items-center justify-center gap-2 transition-all ${
                isWithin100mRadius
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>{isWithin100mRadius ? 'SCAN BARCODE & INPUT PRESENSI HARIAN' : 'AKSES PRESENSI DILOCK (DILUAR RADIUS 100M)'}</span>
            </button>
          </div>
        </div>

        {/* History Presensi Barcode Guru */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 text-xs">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-blue-600" />
              Riwayat Log Presensi Barcode Guru & GPS
            </h3>
            <span className="text-slate-400 text-[11px]">SMP / SMK PGRI CISAAT</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 font-bold border-b border-slate-200 text-slate-700">
                <tr>
                  <th className="p-3">Tanggal & Jam</th>
                  <th className="p-3">Nama Guru & NIP</th>
                  <th className="p-3">Kode Barcode</th>
                  <th className="p-3">Jarak ke Sekolahan</th>
                  <th className="p-3">Status Regional</th>
                  <th className="p-3">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {barcodeLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">
                      <div>{log.tanggal}</div>
                      <div className="text-[10px] text-slate-400">{log.jamMasuk}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-extrabold text-slate-900">{log.namaGuru}</div>
                      <div className="text-[10px] text-slate-500">NIP: {log.nip}</div>
                    </td>
                    <td className="p-3 font-mono font-bold text-blue-700 text-[11px]">{log.barcodeCode}</td>
                    <td className="p-3 font-bold text-slate-800">{log.jarakKeSekolahMeters} Meter</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-full font-extrabold text-[10px] ${
                        log.jarakKeSekolahMeters <= 100 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {log.statusRegional}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 max-w-xs">{log.keterangan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // GURU PIKET / INVAL ENTRY & HISTORY
  if (activeMenu === 'guru_piket') {
    const piketLogs = StorageService.getGuruPiketLogs();

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Input & Laporan Guru Piket / Inval</h1>
          <p className="text-xs text-slate-500">Mencatat pendampingan kelas & penggantian guru yang berhalangan hadir.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Input Guru Piket */}
          <div className="lg:col-span-1 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4 text-xs">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <UserCheck className="w-5 h-5 text-blue-600" />
              <h2 className="font-bold text-slate-900 text-sm">Form Tugas Guru Piket</h2>
            </div>

            <form onSubmit={handleSaveGuruPiket} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Guru Yang Digantikan</label>
                <select
                  value={piketForm.guruDigantikanId}
                  onChange={e => setPiketForm({ ...piketForm, guruDigantikanId: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {guruList.filter(g => g.id !== user.guruId).map(g => (
                    <option key={g.id} value={g.id}>{g.nama} ({g.mapel})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Alasan Penggantian</label>
                <select
                  value={piketForm.alasanPenggantian}
                  onChange={e => setPiketForm({ ...piketForm, alasanPenggantian: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Guru Utama Sakit">Guru Utama Sakit (Surat Dokter)</option>
                  <option value="Tugas Luar / Dinas">Tugas Luar / Dinas Sekolah</option>
                  <option value="Izin Duka / Keluarga">Izin Duka / Keperluan Keluarga</option>
                  <option value="Cuti Alasan Penting">Cuti Alasan Penting</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kelas</label>
                  <select
                    value={piketForm.kelasId}
                    onChange={e => setPiketForm({ ...piketForm, kelasId: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {kelasList.map(k => (
                      <option key={k.id} value={k.id}>{k.namaKelas}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mata Pelajaran</label>
                  <select
                    value={piketForm.mapelId}
                    onChange={e => setPiketForm({ ...piketForm, mapelId: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {mapelList.map(m => (
                      <option key={m.id} value={m.id}>{m.namaMapel}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Jam / Sesi Mengajar</label>
                <input
                  type="text"
                  value={piketForm.jamKe}
                  onChange={e => setPiketForm({ ...piketForm, jamKe: e.target.value })}
                  placeholder="Contoh: 07.30 - 09.45"
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Materi Yang Disampaikan</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Contoh: Pembahasan Modul Bab 3 & Pengerjaan Soal Latihan..."
                  value={piketForm.materiDisampaikan}
                  onChange={e => setPiketForm({ ...piketForm, materiDisampaikan: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan Keadaan Kelas</label>
                <textarea
                  rows={2}
                  value={piketForm.catatanKBM}
                  onChange={e => setPiketForm({ ...piketForm, catatanKBM: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 shadow-sm flex items-center justify-center gap-1.5"
              >
                <Save className="w-4 h-4" /> Simpan Laporan Guru Piket
              </button>
            </form>
          </div>

          {/* Table History Guru Piket */}
          <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Riwayat Tugas Guru Piket & Inval Sekolah</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Tanggal</th>
                    <th className="p-3">Guru Piket</th>
                    <th className="p-3">Menggantikan Guru</th>
                    <th className="p-3">Kelas & Mapel</th>
                    <th className="p-3">Materi Disampaikan</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {piketLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{log.tanggal}</td>
                      <td className="p-3 font-bold text-blue-700">{log.namaGuruPiket}</td>
                      <td className="p-3 text-slate-800">
                        <div className="font-semibold">{log.namaGuruDigantikan}</div>
                        <div className="text-[10px] text-slate-400">{log.alasanPenggantian}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{log.namaKelas}</div>
                        <div className="text-[10px] text-slate-500">{log.namaMapel} ({log.jamKe})</div>
                      </td>
                      <td className="p-3 text-slate-600 max-w-xs">{log.materiDisampaikan}</td>
                      <td className="p-3">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                          {log.status}
                        </span>
                      </td>
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

  // JADWAL MENGAJAR
  if (activeMenu === 'jadwal_mengajar') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Jadwal Mengajar Saya</h1>
          <p className="text-xs text-slate-500">Daftar kelas dan jam tatap muka semester aktif.</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 font-bold border-b border-slate-200 text-slate-700">
              <tr>
                <th className="p-3">Hari</th>
                <th className="p-3">Waktu</th>
                <th className="p-3">Kelas</th>
                <th className="p-3">Mata Pelajaran</th>
                <th className="p-3">Ruang Belajar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {jadwalList.map(j => (
                <tr key={j.id} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900">{j.hari}</td>
                  <td className="p-3 text-slate-500">{j.jamKe}</td>
                  <td className="p-3 font-bold text-blue-700">{j.namaKelas}</td>
                  <td className="p-3 font-bold text-slate-800">{j.namaMapel}</td>
                  <td className="p-3 text-slate-600">{j.ruang}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // PRESENSI SISWA ENTRY & REKAP PERSENTASE
  if (activeMenu === 'presensi_siswa') {
    const currentKelasObj = kelasList.find(k => k.id === selectedKelasPresensi);
    const allStoredPresensi = StorageService.getPresensiSiswa();

    // Calculations for selected class live status
    const totSelectedSiswa = siswaForPresensi.length || 1;
    const countHadir = siswaForPresensi.filter(s => (attendanceRecords[s.id] || 'Hadir') === 'Hadir').length;
    const countSakit = siswaForPresensi.filter(s => (attendanceRecords[s.id] || 'Hadir') === 'Sakit').length;
    const countIzin = siswaForPresensi.filter(s => (attendanceRecords[s.id] || 'Hadir') === 'Izin').length;
    const countAlpa = siswaForPresensi.filter(s => (attendanceRecords[s.id] || 'Hadir') === 'Alpa').length;

    const pctHadir = Number(((countHadir / totSelectedSiswa) * 100).toFixed(1));
    const pctSakit = Number(((countSakit / totSelectedSiswa) * 100).toFixed(1));
    const pctIzin = Number(((countIzin / totSelectedSiswa) * 100).toFixed(1));
    const pctAlpa = Number(((countAlpa / totSelectedSiswa) * 100).toFixed(1));

    // Calculate percentage breakdown for ALL classes from stored history + current input
    const classAttendanceStats = kelasList.map(k => {
      const kSiswa = siswaList.filter(s => s.kelasId === k.id);
      const kTotSiswa = kSiswa.length || 1;

      // Filter stored presensi for class
      const kRecords = allStoredPresensi.filter(p => p.kelasId === k.id);

      if (kRecords.length > 0) {
        const h = kRecords.filter(r => r.status === 'Hadir').length;
        const s = kRecords.filter(r => r.status === 'Sakit').length;
        const i = kRecords.filter(r => r.status === 'Izin').length;
        const a = kRecords.filter(r => r.status === 'Alpa').length;
        const totRec = kRecords.length;

        return {
          kelasId: k.id,
          namaKelas: k.namaKelas,
          totalSiswa: kTotSiswa,
          totalRecords: totRec,
          pHadir: Math.round((h / totRec) * 100),
          pSakit: Math.round((s / totRec) * 100),
          pIzin: Math.round((i / totRec) * 100),
          pAlpa: Math.round((a / totRec) * 100),
        };
      } else {
        // Fallback or default stats if no records saved yet
        return {
          kelasId: k.id,
          namaKelas: k.namaKelas,
          totalSiswa: kTotSiswa,
          totalRecords: kTotSiswa,
          pHadir: 95,
          pSakit: 3,
          pIzin: 2,
          pAlpa: 0,
        };
      }
    });

    return (
      <div className="space-y-6">
        {/* Header Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <ClipboardCheck className="w-6 h-6 text-emerald-600" />
              Input & Persentase Presensi Siswa
            </h1>
            <p className="text-xs text-slate-500">
              Mencatat presensi harian, menganalisis persentase kehadiran tiap kelas, dan mencetak laporan resmi.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              onClick={openPresensiModal}
              className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold rounded-xl hover:from-emerald-700 hover:to-teal-700 flex items-center gap-1.5 shadow-md"
            >
              <ClipboardCheck className="w-4 h-4" /> Input Pop-up Presensi Manual
            </button>
            <button
              onClick={() => {
                if (onOpenPrintReport) {
                  onOpenPrintReport('rekap_perkelas');
                } else {
                  window.print();
                }
              }}
              className="px-3.5 py-2 bg-indigo-600 text-white font-extrabold rounded-xl hover:bg-indigo-700 flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Cetak Rekap Perkelas
            </button>
            <button
              onClick={() => {
                if (onOpenPrintReport) {
                  onOpenPrintReport('rekap_kehadiran_siswa');
                } else {
                  window.print();
                }
              }}
              className="px-3.5 py-2 bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-200 flex items-center gap-1.5 shadow-2xs"
            >
              <Printer className="w-4 h-4" /> Cetak Rekap & Persentase Presensi
            </button>
            <button
              onClick={handleSavePresensi}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-extrabold hover:bg-emerald-700 shadow-md flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" /> Simpan Presensi Batch
            </button>
          </div>
        </div>

        {/* Selected Class Live Percentage Summary Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider">
                Rangkuman Persentase Kehadiran Kelas
              </span>
              <h2 className="text-base font-extrabold text-slate-900">
                {currentKelasObj?.namaKelas} • Tanggal {presensiTanggal}
              </h2>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-extrabold text-xs">
                Tingkat Kehadiran: {pctHadir}%
              </span>
            </div>
          </div>

          {/* Segmented Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-bold text-slate-600">
              <span>Distribusi Kehadiran ({totSelectedSiswa} Siswa)</span>
              <span>{countHadir} Hadir • {countSakit} Sakit • {countIzin} Izin • {countAlpa} Alpa</span>
            </div>
            <div className="flex h-3.5 rounded-full overflow-hidden bg-slate-100 border border-slate-200 p-0.5">
              <div style={{ width: `${pctHadir}%` }} className="bg-emerald-500 rounded-l-full transition-all duration-500" title={`Hadir ${pctHadir}%`} />
              <div style={{ width: `${pctSakit}%` }} className="bg-amber-400 transition-all duration-500" title={`Sakit ${pctSakit}%`} />
              <div style={{ width: `${pctIzin}%` }} className="bg-blue-500 transition-all duration-500" title={`Izin ${pctIzin}%`} />
              <div style={{ width: `${pctAlpa}%` }} className="bg-rose-500 rounded-r-full transition-all duration-500" title={`Alpa ${pctAlpa}%`} />
            </div>
          </div>

          {/* Metric Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl space-y-0.5">
              <div className="text-[10px] font-bold text-emerald-600">Hadir</div>
              <div className="text-lg font-extrabold text-emerald-900">{countHadir} Siswa</div>
              <div className="text-[10px] font-bold text-emerald-700">{pctHadir}%</div>
            </div>
            <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-xl space-y-0.5">
              <div className="text-[10px] font-bold text-amber-600">Sakit</div>
              <div className="text-lg font-extrabold text-amber-900">{countSakit} Siswa</div>
              <div className="text-[10px] font-bold text-amber-700">{pctSakit}%</div>
            </div>
            <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl space-y-0.5">
              <div className="text-[10px] font-bold text-blue-600">Izin</div>
              <div className="text-lg font-extrabold text-blue-900">{countIzin} Siswa</div>
              <div className="text-[10px] font-bold text-blue-700">{pctIzin}%</div>
            </div>
            <div className="p-3 bg-rose-50/60 border border-rose-100 rounded-xl space-y-0.5">
              <div className="text-[10px] font-bold text-rose-600">Alpa</div>
              <div className="text-lg font-extrabold text-rose-900">{countAlpa} Siswa</div>
              <div className="text-[10px] font-bold text-rose-700">{pctAlpa}%</div>
            </div>
          </div>
        </div>

        {/* Tabel Persentase Kehadiran Tiap Kelas (All Classes Comparison) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 text-xs">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Percent className="w-4 h-4 text-indigo-600" />
              Tabel Rekapitulasi Persentase Presensi Siswa Tiap Kelas
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">Semester {setting.semesterAktif} • SMP / SMK PGRI CISAAT</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-100/70 text-slate-700 font-extrabold border-b border-slate-200">
                <tr>
                  <th className="p-3">Nama Kelas</th>
                  <th className="p-3 text-center">Jumlah Siswa</th>
                  <th className="p-3 text-center text-emerald-700">Hadir (%)</th>
                  <th className="p-3 text-center text-amber-700">Sakit (%)</th>
                  <th className="p-3 text-center text-blue-700">Izin (%)</th>
                  <th className="p-3 text-center text-rose-700">Alpa (%)</th>
                  <th className="p-3 text-center">Status Kehadiran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {classAttendanceStats.map(stat => (
                  <tr key={stat.kelasId} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-extrabold text-slate-900">{stat.namaKelas}</td>
                    <td className="p-3 text-center font-bold text-slate-600">{stat.totalSiswa} Siswa</td>
                    <td className="p-3 text-center font-extrabold text-emerald-700 bg-emerald-50/30">{stat.pHadir}%</td>
                    <td className="p-3 text-center font-bold text-amber-700">{stat.pSakit}%</td>
                    <td className="p-3 text-center font-bold text-blue-700">{stat.pIzin}%</td>
                    <td className="p-3 text-center font-bold text-rose-700">{stat.pAlpa}%</td>
                    <td className="p-3 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        stat.pHadir >= 90 ? 'bg-emerald-100 text-emerald-800' :
                        stat.pHadir >= 80 ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {stat.pHadir >= 90 ? 'Sangat Baik' : stat.pHadir >= 80 ? 'Baik' : 'Perlu Perhatian'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Filter Controls & Guru Piket Toggle */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Pilih Kelas</label>
              <select
                value={selectedKelasPresensi}
                onChange={e => setSelectedKelasPresensi(e.target.value)}
                className="p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold bg-slate-50/50"
              >
                {kelasList.map(k => (
                  <option key={k.id} value={k.id}>{k.namaKelas}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Mata Pelajaran</label>
              <select
                value={selectedMapelPresensi}
                onChange={e => setSelectedMapelPresensi(e.target.value)}
                className="p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold bg-slate-50/50"
              >
                {mapelList.map(m => (
                  <option key={m.id} value={m.id}>{m.namaMapel} ({m.kodeMapel})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tanggal Presensi</label>
              <input
                type="date"
                value={presensiTanggal}
                onChange={e => setPresensiTanggal(e.target.value)}
                className="p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold bg-slate-50/50"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center space-x-3">
            <label className="inline-flex items-center space-x-2 cursor-pointer font-bold text-slate-800">
              <input
                type="checkbox"
                checked={isPresensiPiket}
                onChange={e => setIsPresensiPiket(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <span className="text-blue-700 font-extrabold">Input Sebagai Guru Piket / Inval (Menggantikan Guru Absen)</span>
            </label>

            {isPresensiPiket && (
              <select
                value={guruPiketDigantikanId}
                onChange={e => setGuruPiketDigantikanId(e.target.value)}
                className="p-1.5 border border-blue-200 bg-blue-50/50 rounded-lg text-xs font-bold text-slate-800"
              >
                <option value="">-- Pilih Guru Yang Digantikan --</option>
                {guruList.filter(g => g.id !== user.guruId).map(g => (
                  <option key={g.id} value={g.id}>{g.nama} ({g.mapel})</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Form List Student Attendance Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-3.5 bg-slate-50/80 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
            <span className="font-extrabold text-slate-800">
              Form Input Presensi Siswa — {currentKelasObj?.namaKelas} ({mapelList.find(m => m.id === selectedMapelPresensi)?.namaMapel})
            </span>
            <span className="text-[11px] text-slate-500 font-medium">Klik pilihan status atau gunakan tombol 'Set Semua' untuk perubahan cepat</span>
          </div>

          {/* Quick Toolbar: Search & Mass-Set Buttons */}
          <div className="p-3 bg-slate-50/50 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama atau NIS siswa..."
                value={searchSiswaPresensi}
                onChange={e => setSearchSiswaPresensi(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl font-medium bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-extrabold text-slate-600 mr-1">Set Massal Semua Siswa:</span>
              <button
                type="button"
                onClick={() => handleMassSetStatus('Hadir')}
                className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-600 hover:text-white text-emerald-800 font-extrabold rounded-lg transition-colors border border-emerald-200 shadow-2xs"
              >
                ✓ Set Hadir
              </button>
              <button
                type="button"
                onClick={() => handleMassSetStatus('Sakit')}
                className="px-2.5 py-1 bg-amber-100 hover:bg-amber-600 hover:text-white text-amber-800 font-extrabold rounded-lg transition-colors border border-amber-200 shadow-2xs"
              >
                ✚ Set Sakit
              </button>
              <button
                type="button"
                onClick={() => handleMassSetStatus('Izin')}
                className="px-2.5 py-1 bg-blue-100 hover:bg-blue-600 hover:text-white text-blue-800 font-extrabold rounded-lg transition-colors border border-blue-200 shadow-2xs"
              >
                ✍ Set Izin
              </button>
              <button
                type="button"
                onClick={() => handleMassSetStatus('Alpa')}
                className="px-2.5 py-1 bg-rose-100 hover:bg-rose-600 hover:text-white text-rose-800 font-extrabold rounded-lg transition-colors border border-rose-200 shadow-2xs"
              >
                ✕ Set Alpa
              </button>
            </div>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 text-slate-700 font-extrabold border-b border-slate-200">
              <tr>
                <th className="p-3 w-12 text-center">No</th>
                <th className="p-3">Nama Siswa</th>
                <th className="p-3">NIS</th>
                <th className="p-3 text-center">Status Kehadiran</th>
                <th className="p-3">Catatan / Alasan (Opsional)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {siswaForPresensi
                .filter(s =>
                  s.nama.toLowerCase().includes(searchSiswaPresensi.toLowerCase()) ||
                  s.nis.includes(searchSiswaPresensi)
                )
                .map((s, idx) => {
                  const currentStatus = attendanceRecords[s.id] || 'Hadir';
                  return (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 text-center font-bold text-slate-400">{idx + 1}</td>
                      <td className="p-3 font-extrabold text-slate-900">{s.nama}</td>
                      <td className="p-3 font-bold text-slate-500">{s.nis}</td>
                      <td className="p-3 text-center">
                        <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-100 gap-1 text-[11px]">
                          {(['Hadir', 'Sakit', 'Izin', 'Alpa'] as const).map(st => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => handleStatusChange(s.id, st)}
                              className={`px-3 py-1 rounded-md font-bold transition-all ${
                                currentStatus === st
                                  ? st === 'Hadir' ? 'bg-emerald-600 text-white' :
                                    st === 'Sakit' ? 'bg-amber-500 text-white' :
                                    st === 'Izin' ? 'bg-blue-600 text-white' :
                                    'bg-rose-600 text-white'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          placeholder="misal: Demam, Izin Keluarga..."
                          value={attendanceNotes[s.id] || ''}
                          onChange={e => setAttendanceNotes(prev => ({ ...prev, [s.id]: e.target.value }))}
                          className="w-full p-1.5 border border-slate-200 rounded-lg text-xs font-medium bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                        />
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>

          {/* Action Footer below Presensi Input Table */}
          <div className="p-4 bg-slate-50/90 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-600 font-medium flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Pastikan status kehadiran seluruh <strong>{siswaForPresensi.length} siswa</strong> sudah sesuai sebelum menyimpan.
              </span>
            </div>
            <button
              type="button"
              onClick={handleSavePresensi}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-extrabold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Save className="w-4 h-4" /> Simpan Presensi Batch (Semua Siswa)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // MANAJEMEN NILAI ENTRY & REKAP PERSENTASE
  if (activeMenu === 'manajemen_nilai') {
    const studentsInClass = siswaList.filter(s => s.kelasId === selectedKelasNilai);
    const filteredStudents = studentsInClass.filter(s =>
      s.nama.toLowerCase().includes(searchSiswaNilai.toLowerCase()) ||
      s.nis.includes(searchSiswaNilai)
    );

    // Calculate class statistics with Kurikulum Merdeka weighting
    const calculatedGrades = studentsInClass.map(s => {
      const input = gradeInput[s.id] || { f1: 80, f2: 82, f3: 85, s1: 80, s2: 82, s3: 84, sts: 80, sas: 82 };
      const { finalScore } = computeStudentScore(input);
      return { siswaId: s.id, avg: finalScore, isTuntas: finalScore >= 75 };
    });

    const totalStudents = calculatedGrades.length;
    const avgClassGrade = totalStudents > 0
      ? (calculatedGrades.reduce((acc, curr) => acc + curr.avg, 0) / totalStudents).toFixed(1)
      : '0.0';
    const tuntasCount = calculatedGrades.filter(g => g.isTuntas).length;
    const tuntasPercent = totalStudents > 0 ? Math.round((tuntasCount / totalStudents) * 100) : 0;
    const maxGrade = totalStudents > 0 ? Math.max(...calculatedGrades.map(g => g.avg)) : 0;
    const minGrade = totalStudents > 0 ? Math.min(...calculatedGrades.map(g => g.avg)) : 0;

    // Predicate Distribution percentages for selected class
    const countPredA = calculatedGrades.filter(g => g.avg >= 90).length;
    const countPredB = calculatedGrades.filter(g => g.avg >= 80 && g.avg < 90).length;
    const countPredC = calculatedGrades.filter(g => g.avg >= 75 && g.avg < 80).length;
    const countPredD = calculatedGrades.filter(g => g.avg < 75).length;

    const pctPredA = totalStudents > 0 ? Math.round((countPredA / totalStudents) * 100) : 0;
    const pctPredB = totalStudents > 0 ? Math.round((countPredB / totalStudents) * 100) : 0;
    const pctPredC = totalStudents > 0 ? Math.round((countPredC / totalStudents) * 100) : 0;
    const pctPredD = totalStudents > 0 ? Math.round((countPredD / totalStudents) * 100) : 0;

    const currentMapelObj = mapelList.find(m => m.id === selectedMapelNilai);
    const currentKelasObj = kelasList.find(k => k.id === selectedKelasNilai);
    const allStoredNilai = StorageService.getNilai();

    // Calculate percentage breakdown across ALL classes for selected Mapel
    const classGradeStats = kelasList.map(k => {
      const kSiswa = siswaList.filter(s => s.kelasId === k.id);
      const totS = kSiswa.length || 1;

      const grades = kSiswa.map(s => {
        const stored = allStoredNilai.find(n => n.siswaId === s.id && n.mapelId === selectedMapelNilai && n.semester === setting.semesterAktif);
        if (stored) {
          return stored.nilaiAkhir;
        }
        const input = gradeInput[s.id] || { f1: 80, f2: 82, f3: 85, s1: 80, s2: 82, s3: 84, sts: 80, sas: 82 };
        return computeStudentScore(input).finalScore;
      });

      const avg = Number((grades.reduce((a, b) => a + b, 0) / totS).toFixed(1));
      const tuntas = grades.filter(g => g >= 75).length;
      const pctT = Math.round((tuntas / totS) * 100);
      const cA = grades.filter(g => g >= 90).length;
      const cB = grades.filter(g => g >= 80 && g < 90).length;
      const cC = grades.filter(g => g >= 75 && g < 80).length;
      const cD = grades.filter(g => g < 75).length;

      return {
        kelasId: k.id,
        namaKelas: k.namaKelas,
        totalSiswa: totS,
        avg,
        pctTuntas: pctT,
        pctA: Math.round((cA / totS) * 100),
        pctB: Math.round((cB / totS) * 100),
        pctC: Math.round((cC / totS) * 100),
        pctD: Math.round((cD / totS) * 100),
      };
    });

    const openInputModalForSiswa = (siswaId: string, namaSiswa: string) => {
      const current = gradeInput[siswaId] || { f1: 80, f2: 82, f3: 85, s1: 80, s2: 82, s3: 84, sts: 80, sas: 82 };
      setModalNilaiSiswa({
        siswaId,
        namaSiswa,
        f1: current.f1 ?? 80,
        f2: current.f2 ?? 82,
        f3: current.f3 ?? 85,
        s1: current.s1 ?? 80,
        s2: current.s2 ?? 82,
        s3: current.s3 ?? 84,
        sts: current.sts ?? 80,
        sas: current.sas ?? 82,
        keterangan: 'Kinerja belajar stabil. Pertahankan keaktifan di kelas.',
      });
      setShowInputNilaiModal(true);
    };

    return (
      <div className="space-y-6">
        {/* Header & Primary Action Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-6 h-6 text-blue-600" />
              Manajemen, Persentase & Leger Nilai Siswa
            </h1>
            <p className="text-xs text-slate-500">
              Input nilai Tugas (30%), UTS (30%), UAS (40%), persentase ketuntasan KKM (75), dan cetak leger resmi.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              onClick={() => openTaskInputModal('f1')}
              className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold rounded-xl hover:from-purple-700 hover:to-indigo-700 flex items-center gap-1.5 shadow-md"
            >
              <NotebookPen className="w-4 h-4" /> Input Pop-up Per Jenis Tugas
            </button>
            <button
              onClick={() => {
                if (studentsInClass.length > 0) {
                  openInputModalForSiswa(studentsInClass[0].id, studentsInClass[0].nama);
                } else {
                  alert('Tidak ada siswa di kelas ini.');
                }
              }}
              className="px-3.5 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold rounded-xl hover:bg-indigo-100 flex items-center gap-1.5 shadow-2xs"
            >
              <Plus className="w-4 h-4" /> Form Input Single Siswa
            </button>
            <button
              onClick={handleSaveNilaiBatch}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold rounded-xl hover:from-blue-700 hover:to-indigo-700 flex items-center gap-1.5 shadow-md"
            >
              <Save className="w-4 h-4" /> Simpan Semua Nilai Batch
            </button>
            <button
              onClick={() => {
                if (onOpenPrintReport) {
                  onOpenPrintReport('rekap_perkelas');
                } else {
                  window.print();
                }
              }}
              className="px-3.5 py-2 bg-indigo-600 text-white font-extrabold rounded-xl hover:bg-indigo-700 flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Cetak Rekap Perkelas
            </button>
            <button
              onClick={() => {
                if (onOpenPrintReport) {
                  onOpenPrintReport('leger_nilai');
                } else {
                  window.print();
                }
              }}
              className="px-3.5 py-2 bg-slate-100 text-slate-700 border border-slate-200 font-bold rounded-xl hover:bg-slate-200 flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" /> Cetak Leger & Persentase Nilai
            </button>
          </div>
        </div>

        {/* Google Sheets Integration Bar */}
        <GoogleSheetsBar
          currentKelasId={selectedKelasNilai}
          onSuccessNotification={msg => alert(msg)}
        />

        {/* Summary Metric Cards with Predicate Percentages */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Siswa Kelas</div>
            <div className="text-xl font-extrabold text-slate-900">{totalStudents} Siswa</div>
            <div className="text-[10px] text-slate-500">{currentKelasObj?.namaKelas} • Semester {setting.semesterAktif}</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rata-rata Nilai Kelas</div>
            <div className="text-xl font-extrabold text-blue-700">{avgClassGrade}</div>
            <div className="text-[10px] text-blue-600 font-bold">Mata Pelajaran: {currentMapelObj?.namaMapel}</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ketuntasan (KKM ≥ 75)</div>
            <div className="text-xl font-extrabold text-emerald-600">{tuntasPercent}%</div>
            <div className="text-[10px] text-emerald-700 font-bold">{tuntasCount} dari {totalStudents} Siswa Tuntas</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rentang Nilai Max / Min</div>
            <div className="text-xl font-extrabold text-slate-800">{maxGrade} / {minGrade}</div>
            <div className="text-[10px] text-slate-500">Bobot: Tugas 30% • UTS 30% • UAS 40%</div>
          </div>
        </div>

        {/* Predicate Breakdown Cards for Selected Class */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 text-xs">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <span className="font-extrabold text-slate-800 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-indigo-600" />
              Persentase Distribusi Predikat Nilai — {currentKelasObj?.namaKelas} ({currentMapelObj?.namaMapel})
            </span>
            <span className="text-[11px] text-slate-500">Skala Predikat: A (≥90), B (80-89), C (75-79), D (&lt;75)</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-purple-50/60 border border-purple-100 rounded-xl">
              <div className="text-[10px] font-bold text-purple-700">Predikat A (Sangat Baik)</div>
              <div className="text-lg font-extrabold text-purple-900">{countPredA} Siswa</div>
              <div className="text-[10px] font-bold text-purple-700">{pctPredA}%</div>
            </div>
            <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl">
              <div className="text-[10px] font-bold text-blue-700">Predikat B (Baik)</div>
              <div className="text-lg font-extrabold text-blue-900">{countPredB} Siswa</div>
              <div className="text-[10px] font-bold text-blue-700">{pctPredB}%</div>
            </div>
            <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-xl">
              <div className="text-[10px] font-bold text-amber-700">Predikat C (Cukup)</div>
              <div className="text-lg font-extrabold text-amber-900">{countPredC} Siswa</div>
              <div className="text-[10px] font-bold text-amber-700">{pctPredC}%</div>
            </div>
            <div className="p-3 bg-rose-50/60 border border-rose-100 rounded-xl">
              <div className="text-[10px] font-bold text-rose-700">Predikat D (Perlu Bimbingan)</div>
              <div className="text-lg font-extrabold text-rose-900">{countPredD} Siswa</div>
              <div className="text-[10px] font-bold text-rose-700">{pctPredD}%</div>
            </div>
          </div>
        </div>

        {/* Tabel Rekapitulasi Persentase Nilai Seluruh Kelas (Subject Comparison) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 text-xs">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-blue-600" />
              Tabel Rekapitulasi Persentase Nilai Seluruh Kelas ({currentMapelObj?.namaMapel})
            </h3>
            <span className="text-[11px] text-slate-500">Semester {setting.semesterAktif} • SMP / SMK PGRI CISAAT</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-100/70 text-slate-700 font-extrabold border-b border-slate-200">
                <tr>
                  <th className="p-3">Nama Kelas</th>
                  <th className="p-3 text-center">Jumlah Siswa</th>
                  <th className="p-3 text-center">Rata-rata Nilai</th>
                  <th className="p-3 text-center text-emerald-700">% Tuntas (≥75)</th>
                  <th className="p-3 text-center text-purple-700">Predikat A (%)</th>
                  <th className="p-3 text-center text-blue-700">Predikat B (%)</th>
                  <th className="p-3 text-center text-amber-700">Predikat C (%)</th>
                  <th className="p-3 text-center text-rose-700">Predikat D (%)</th>
                  <th className="p-3 text-center">Status Performa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {classGradeStats.map(stat => (
                  <tr key={stat.kelasId} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-extrabold text-slate-900">{stat.namaKelas}</td>
                    <td className="p-3 text-center font-bold text-slate-600">{stat.totalSiswa} Siswa</td>
                    <td className="p-3 text-center font-extrabold text-blue-700">{stat.avg}</td>
                    <td className="p-3 text-center font-extrabold text-emerald-700 bg-emerald-50/30">{stat.pctTuntas}%</td>
                    <td className="p-3 text-center font-bold text-purple-700">{stat.pctA}%</td>
                    <td className="p-3 text-center font-bold text-blue-700">{stat.pctB}%</td>
                    <td className="p-3 text-center font-bold text-amber-700">{stat.pctC}%</td>
                    <td className="p-3 text-center font-bold text-rose-700">{stat.pctD}%</td>
                    <td className="p-3 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        stat.pctTuntas >= 85 ? 'bg-emerald-100 text-emerald-800' :
                        stat.pctTuntas >= 70 ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {stat.pctTuntas >= 85 ? 'Sangat Baik' : stat.pctTuntas >= 70 ? 'Cukup Baik' : 'Tingkatkan'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Filters & Mode Control */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Pilih Kelas</label>
              <select
                value={selectedKelasNilai}
                onChange={e => setSelectedKelasNilai(e.target.value)}
                className="p-2 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
              >
                {kelasList.map(k => (
                  <option key={k.id} value={k.id}>{k.namaKelas}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Pilih Mata Pelajaran</label>
              <select
                value={selectedMapelNilai}
                onChange={e => setSelectedMapelNilai(e.target.value)}
                className="p-2 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
              >
                {mapelList.map(m => (
                  <option key={m.id} value={m.id}>{m.namaMapel}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tampilan Input Tabel</label>
              <div className="inline-flex rounded-xl border border-slate-200 p-0.5 bg-slate-100 font-bold">
                <button
                  type="button"
                  onClick={() => setGradeInputMode('detail')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    gradeInputMode === 'detail' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Detail (Formatif & Sumatif Per Tugas)
                </button>
                <button
                  type="button"
                  onClick={() => setGradeInputMode('ringkas')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    gradeInputMode === 'ringkas' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Ringkas
                </button>
              </div>
            </div>
          </div>

          {/* Search Box */}
          <div className="w-full sm:w-64 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari Nama Siswa / NIS..."
              value={searchSiswaNilai}
              onChange={e => setSearchSiswaNilai(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 text-xs"
            />
          </div>
        </div>

        {/* Table Student Grade Management */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex justify-between items-center text-xs">
            <span className="font-extrabold text-slate-800">
              Daftar Input Nilai Siswa — {currentKelasObj?.namaKelas} ({currentMapelObj?.namaMapel})
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              Bobot: Formatif (20%) + Sumatif Materi (30%) + STS (25%) + SAS/SAT (25%)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-700 font-extrabold border-b border-slate-200">
                {gradeInputMode === 'detail' ? (
                  <tr>
                    <th className="p-3 w-10 text-center">No</th>
                    <th className="p-3">Nama Siswa & NIS</th>
                    <th className="p-3 text-center bg-blue-50/50 border-x border-blue-100">
                      Nilai Formatif (20%)
                      <div className="text-[9px] font-normal text-blue-600">F1 | F2 | F3</div>
                    </th>
                    <th className="p-3 text-center bg-emerald-50/50 border-x border-emerald-100">
                      Sumatif Lingkup Materi (30%)
                      <div className="text-[9px] font-normal text-emerald-600">S1 | S2 | S3</div>
                    </th>
                    <th className="p-3 text-center bg-amber-50/50 border-x border-amber-100">
                      STS (25%)
                      <div className="text-[9px] font-normal text-amber-600">Tengah Semester</div>
                    </th>
                    <th className="p-3 text-center bg-purple-50/50 border-x border-purple-100">
                      SAS / SAT (25%)
                      <div className="text-[9px] font-normal text-purple-600">Akhir Semester</div>
                    </th>
                    <th className="p-3 text-center">Nilai Akhir</th>
                    <th className="p-3 text-center">Predikat</th>
                    <th className="p-3 text-center">Status KKM</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                ) : (
                  <tr>
                    <th className="p-3 w-12 text-center">No</th>
                    <th className="p-3">Nama Siswa & NIS</th>
                    <th className="p-3 text-center">Rata Formatif</th>
                    <th className="p-3 text-center">Rata Sumatif Materi</th>
                    <th className="p-3 text-center">Nilai STS</th>
                    <th className="p-3 text-center">Nilai SAS / SAT</th>
                    <th className="p-3 text-center">Nilai Akhir</th>
                    <th className="p-3 text-center">Predikat</th>
                    <th className="p-3 text-center">Status KKM</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-6 text-center text-slate-400 italic">
                      Tidak ada data siswa ditemukan untuk kelas ini.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s, idx) => {
                    const current = gradeInput[s.id] || { f1: 80, f2: 82, f3: 85, s1: 80, s2: 82, s3: 84, sts: 80, sas: 82 };
                    const { f1, f2, f3, s1, s2, s3, sts, sas, avgF, avgS, finalScore } = computeStudentScore(current);
                    const isTuntas = finalScore >= 75;

                    let predikat = 'C';
                    if (finalScore >= 90) predikat = 'A';
                    else if (finalScore >= 80) predikat = 'B';
                    else if (finalScore >= 75) predikat = 'C';
                    else predikat = 'D';

                    const updateField = (field: string, val: number) => {
                      const clamped = Math.min(100, Math.max(0, val));
                      setGradeInput({
                        ...gradeInput,
                        [s.id]: {
                          ...current,
                          [field]: clamped,
                        }
                      });
                    };

                    return (
                      <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 text-center font-bold text-slate-400">{idx + 1}</td>
                        <td className="p-3">
                          <div className="font-extrabold text-slate-900">{s.nama}</div>
                          <div className="text-[10px] text-slate-500">NIS: {s.nis}</div>
                        </td>

                        {gradeInputMode === 'detail' ? (
                          <>
                            {/* Formatif F1, F2, F3 */}
                            <td className="p-2 text-center bg-blue-50/20 border-x border-blue-100/60">
                              <div className="flex items-center justify-center gap-1">
                                <input
                                  type="number" min={0} max={100} value={f1}
                                  onChange={e => updateField('f1', Number(e.target.value))}
                                  title="Formatif 1 (Tugas 1)"
                                  className="w-11 p-1 border border-slate-200 rounded text-center font-bold bg-white text-slate-800 text-[11px]"
                                />
                                <input
                                  type="number" min={0} max={100} value={f2}
                                  onChange={e => updateField('f2', Number(e.target.value))}
                                  title="Formatif 2 (Tugas 2)"
                                  className="w-11 p-1 border border-slate-200 rounded text-center font-bold bg-white text-slate-800 text-[11px]"
                                />
                                <input
                                  type="number" min={0} max={100} value={f3}
                                  onChange={e => updateField('f3', Number(e.target.value))}
                                  title="Formatif 3 (Tugas 3)"
                                  className="w-11 p-1 border border-slate-200 rounded text-center font-bold bg-white text-slate-800 text-[11px]"
                                />
                              </div>
                              <div className="text-[9px] font-extrabold text-blue-700 mt-0.5">Rata: {avgF}</div>
                            </td>

                            {/* Sumatif S1, S2, S3 */}
                            <td className="p-2 text-center bg-emerald-50/20 border-x border-emerald-100/60">
                              <div className="flex items-center justify-center gap-1">
                                <input
                                  type="number" min={0} max={100} value={s1}
                                  onChange={e => updateField('s1', Number(e.target.value))}
                                  title="Sumatif 1 (Materi 1)"
                                  className="w-11 p-1 border border-slate-200 rounded text-center font-bold bg-white text-slate-800 text-[11px]"
                                />
                                <input
                                  type="number" min={0} max={100} value={s2}
                                  onChange={e => updateField('s2', Number(e.target.value))}
                                  title="Sumatif 2 (Materi 2)"
                                  className="w-11 p-1 border border-slate-200 rounded text-center font-bold bg-white text-slate-800 text-[11px]"
                                />
                                <input
                                  type="number" min={0} max={100} value={s3}
                                  onChange={e => updateField('s3', Number(e.target.value))}
                                  title="Sumatif 3 (Materi 3)"
                                  className="w-11 p-1 border border-slate-200 rounded text-center font-bold bg-white text-slate-800 text-[11px]"
                                />
                              </div>
                              <div className="text-[9px] font-extrabold text-emerald-700 mt-0.5">Rata: {avgS}</div>
                            </td>

                            {/* STS */}
                            <td className="p-2 text-center bg-amber-50/20 border-x border-amber-100/60">
                              <input
                                type="number" min={0} max={100} value={sts}
                                onChange={e => updateField('sts', Number(e.target.value))}
                                title="Sumatif Tengah Semester (STS)"
                                className="w-14 p-1.5 border border-slate-200 rounded-lg text-center font-extrabold bg-white text-slate-900 text-xs"
                              />
                            </td>

                            {/* SAS */}
                            <td className="p-2 text-center bg-purple-50/20 border-x border-purple-100/60">
                              <input
                                type="number" min={0} max={100} value={sas}
                                onChange={e => updateField('sas', Number(e.target.value))}
                                title="Sumatif Akhir Semester / Tahun (SAS/SAT)"
                                className="w-14 p-1.5 border border-slate-200 rounded-lg text-center font-extrabold bg-white text-slate-900 text-xs"
                              />
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="p-3 text-center font-bold text-blue-700">{avgF}</td>
                            <td className="p-3 text-center font-bold text-emerald-700">{avgS}</td>
                            <td className="p-3 text-center font-bold text-amber-700">{sts}</td>
                            <td className="p-3 text-center font-bold text-purple-700">{sas}</td>
                          </>
                        )}

                        <td className="p-3 text-center font-extrabold text-blue-900 text-sm">
                          {finalScore}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded font-extrabold text-[10px] ${
                            predikat === 'A' ? 'bg-purple-100 text-purple-700' :
                            predikat === 'B' ? 'bg-blue-100 text-blue-700' :
                            predikat === 'C' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                          }`}>
                            Nilai {predikat}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            isTuntas ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {isTuntas ? '✓ Tuntas' : '✕ Belum Tuntas'}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => openInputModalForSiswa(s.id, s.nama)}
                              className="p-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
                              title="Form Input Detil / Lengkap"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleSaveNilaiSingle(s.id, s.nama)}
                              className="px-2.5 py-1 bg-blue-600 text-white rounded-lg font-bold text-[11px] hover:bg-blue-700"
                            >
                              Simpan
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Action Footer below Nilai Input Table */}
          <div className="p-4 bg-slate-50/90 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-600 font-medium flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>
                Simpan seluruh perubahan nilai formatif, sumatif, STS, dan SAS untuk <strong>{studentsInClass.length} siswa</strong> di kelas ini.
              </span>
            </div>
            <button
              type="button"
              onClick={handleSaveNilaiBatch}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Save className="w-4 h-4" /> Simpan Semua Nilai Kelas
            </button>
          </div>
        </div>

        {/* Modal Pop-up Input Nilai Lengkap Siswa */}
        {showInputNilaiModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white w-full max-w-xl rounded-3xl p-6 shadow-xl border border-slate-200 space-y-4 text-xs max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-indigo-600" />
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">Form Input Nilai Per Tugas & Evaluasi Siswa</h3>
                    <p className="text-[11px] text-slate-500">{currentMapelObj?.namaMapel} • Kelas {currentKelasObj?.namaKelas}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowInputNilaiModal(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveNilaiModal} className="space-y-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pilih Nama Siswa</label>
                  <select
                    value={modalNilaiSiswa.siswaId}
                    onChange={e => {
                      const targetSiswa = siswaList.find(s => s.id === e.target.value);
                      if (targetSiswa) {
                        const current = gradeInput[targetSiswa.id] || { f1: 80, f2: 82, f3: 85, s1: 80, s2: 82, s3: 84, sts: 80, sas: 82 };
                        setModalNilaiSiswa({
                          ...modalNilaiSiswa,
                          siswaId: targetSiswa.id,
                          namaSiswa: targetSiswa.nama,
                          f1: current.f1 ?? 80,
                          f2: current.f2 ?? 82,
                          f3: current.f3 ?? 85,
                          s1: current.s1 ?? 80,
                          s2: current.s2 ?? 82,
                          s3: current.s3 ?? 84,
                          sts: current.sts ?? 80,
                          sas: current.sas ?? 82,
                        });
                      }
                    }}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-bold text-slate-800 bg-slate-50"
                  >
                    {studentsInClass.map(s => (
                      <option key={s.id} value={s.id}>{s.nama} (NIS: {s.nis})</option>
                    ))}
                  </select>
                </div>

                {/* 1. Formatif Section */}
                <div className="p-3.5 bg-blue-50/50 border border-blue-200 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-blue-900 text-xs flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      1. Nilai Formatif / Tugas Harian (Bobot 20%)
                    </span>
                    <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                      Rata-rata: {computeStudentScore(modalNilaiSiswa).avgF}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Formatif 1</label>
                      <input
                        type="number" min={0} max={100} value={modalNilaiSiswa.f1}
                        onChange={e => setModalNilaiSiswa({ ...modalNilaiSiswa, f1: Math.min(100, Math.max(0, Number(e.target.value))) })}
                        className="w-full p-2 border border-slate-200 rounded-xl text-center font-extrabold text-slate-900 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Formatif 2</label>
                      <input
                        type="number" min={0} max={100} value={modalNilaiSiswa.f2}
                        onChange={e => setModalNilaiSiswa({ ...modalNilaiSiswa, f2: Math.min(100, Math.max(0, Number(e.target.value))) })}
                        className="w-full p-2 border border-slate-200 rounded-xl text-center font-extrabold text-slate-900 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Formatif 3</label>
                      <input
                        type="number" min={0} max={100} value={modalNilaiSiswa.f3}
                        onChange={e => setModalNilaiSiswa({ ...modalNilaiSiswa, f3: Math.min(100, Math.max(0, Number(e.target.value))) })}
                        className="w-full p-2 border border-slate-200 rounded-xl text-center font-extrabold text-slate-900 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Sumatif Lingkup Materi Section */}
                <div className="p-3.5 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-emerald-900 text-xs flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-emerald-600" />
                      2. Nilai Sumatif Lingkup Materi (Bobot 30%)
                    </span>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      Rata-rata: {computeStudentScore(modalNilaiSiswa).avgS}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Sumatif Materi 1</label>
                      <input
                        type="number" min={0} max={100} value={modalNilaiSiswa.s1}
                        onChange={e => setModalNilaiSiswa({ ...modalNilaiSiswa, s1: Math.min(100, Math.max(0, Number(e.target.value))) })}
                        className="w-full p-2 border border-slate-200 rounded-xl text-center font-extrabold text-slate-900 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Sumatif Materi 2</label>
                      <input
                        type="number" min={0} max={100} value={modalNilaiSiswa.s2}
                        onChange={e => setModalNilaiSiswa({ ...modalNilaiSiswa, s2: Math.min(100, Math.max(0, Number(e.target.value))) })}
                        className="w-full p-2 border border-slate-200 rounded-xl text-center font-extrabold text-slate-900 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Sumatif Materi 3</label>
                      <input
                        type="number" min={0} max={100} value={modalNilaiSiswa.s3}
                        onChange={e => setModalNilaiSiswa({ ...modalNilaiSiswa, s3: Math.min(100, Math.max(0, Number(e.target.value))) })}
                        className="w-full p-2 border border-slate-200 rounded-xl text-center font-extrabold text-slate-900 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* 3 & 4. STS & SAS Section */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 bg-amber-50/50 border border-amber-200 rounded-2xl space-y-1">
                    <label className="block font-extrabold text-amber-900 text-xs">
                      3. Sumatif Tengah Semester / STS (25%)
                    </label>
                    <input
                      type="number" min={0} max={100} value={modalNilaiSiswa.sts}
                      onChange={e => setModalNilaiSiswa({ ...modalNilaiSiswa, sts: Math.min(100, Math.max(0, Number(e.target.value))) })}
                      className="w-full p-2 border border-slate-200 rounded-xl text-center font-extrabold text-slate-900 bg-white text-sm"
                    />
                  </div>
                  <div className="p-3.5 bg-purple-50/50 border border-purple-200 rounded-2xl space-y-1">
                    <label className="block font-extrabold text-purple-900 text-xs">
                      4. Sumatif Akhir Semester / SAS/SAT (25%)
                    </label>
                    <input
                      type="number" min={0} max={100} value={modalNilaiSiswa.sas}
                      onChange={e => setModalNilaiSiswa({ ...modalNilaiSiswa, sas: Math.min(100, Math.max(0, Number(e.target.value))) })}
                      className="w-full p-2 border border-slate-200 rounded-xl text-center font-extrabold text-slate-900 bg-white text-sm"
                    />
                  </div>
                </div>

                {/* Live Calculation Preview Box */}
                {(() => {
                  const { avgF, avgS, sts, sas, finalScore } = computeStudentScore(modalNilaiSiswa);
                  const isTuntas = finalScore >= 75;
                  return (
                    <div className="p-3.5 bg-slate-900 text-white rounded-2xl flex justify-between items-center shadow-sm">
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Kalkulasi Kurikulum Merdeka
                        </div>
                        <div className="text-xl font-extrabold text-emerald-400">
                          {finalScore} <span className="text-xs text-slate-300 font-normal">/ 100</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          ({avgF} × 20%) + ({avgS} × 30%) + ({sts} × 25%) + ({sas} × 25%)
                        </div>
                      </div>
                      <span className={`px-3 py-1.5 rounded-xl font-extrabold text-xs ${
                        isTuntas ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                      }`}>
                        {isTuntas ? '✓ TUNTAS KKM' : '✕ BELUM TUNTAS'}
                      </span>
                    </div>
                  );
                })()}

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Catatan Evaluasi Guru</label>
                  <textarea
                    rows={2}
                    value={modalNilaiSiswa.keterangan}
                    onChange={e => setModalNilaiSiswa({ ...modalNilaiSiswa, keterangan: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl font-medium"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowInputNilaiModal(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-sm flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" /> Simpan Nilai Lengkap
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Pop-up Input Manual Per Jenis Tugas & Kelas (All Students) */}
        {showTaskInputModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white w-full max-w-3xl rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 text-xs max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                    <NotebookPen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">
                      Form Input Manual Nilai Per Jenis Tugas & Kelas
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Pilih jenis penilaian dan kelas untuk menampilkan seluruh siswa secara langsung.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTaskInputModal(false)}
                  className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveTaskModal} className="space-y-4">
                {/* Select Controls: Kelas, Mapel, & Jenis Tugas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">1. Pilih Kelas</label>
                    <select
                      value={taskModalKelas}
                      onChange={e => setTaskModalKelas(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-xl font-bold text-slate-800 bg-white"
                    >
                      {kelasList.map(k => (
                        <option key={k.id} value={k.id}>{k.namaKelas}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">2. Pilih Mata Pelajaran</label>
                    <select
                      value={taskModalMapel}
                      onChange={e => setTaskModalMapel(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-xl font-bold text-slate-800 bg-white"
                    >
                      {mapelList.map(m => (
                        <option key={m.id} value={m.id}>{m.namaMapel}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">3. Kategori Penilaian</label>
                    <select
                      value={taskModalJenis}
                      onChange={e => {
                        const val = e.target.value;
                        setTaskModalJenis(val);
                        const labelMap: Record<string, string> = {
                          formatif: 'Penilaian Formatif Harian',
                          sumatif: 'Penilaian Sumatif Lingkup Materi',
                          sts: 'Sumatif Tengah Semester (STS)',
                          sas: 'Sumatif Akhir Semester (SAS/SAT)',
                        };
                        setTaskModalJudul(labelMap[val] || 'Penilaian Harian');
                        setTaskModalTp(val === 'formatif' ? 'TP 1.1' : val === 'sumatif' ? 'TP 1.2' : 'TP 1');
                      }}
                      className="w-full p-2 border border-indigo-200 text-indigo-900 rounded-xl font-extrabold bg-indigo-50/50"
                    >
                      <option value="formatif">FORMATIF</option>
                      <option value="sumatif">SUMATIF</option>
                      <option value="sts">STS (Sumatif Tengah Semester)</option>
                      <option value="sas">SAS/SAT (Sumatif Akhir Semester/Tahun)</option>
                    </select>
                  </div>
                </div>

                {/* TP & Judul Penilaian Input Box */}
                <div className="bg-indigo-50/80 p-3.5 rounded-2xl border border-indigo-200/80 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* TP Field */}
                    <div>
                      <label className="block text-xs font-extrabold text-indigo-950 mb-1 flex items-center gap-1.5">
                        <Target className="w-4 h-4 text-indigo-600" />
                        Tujuan Pembelajaran (TP):
                      </label>
                      <input
                        type="text"
                        required
                        value={taskModalTp}
                        onChange={e => setTaskModalTp(e.target.value)}
                        placeholder="misal: TP 1 / TP 2.1 - Menjelaskan Konsep Sintaks"
                        className="w-full p-2.5 border border-indigo-300 rounded-xl font-bold bg-white text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500 shadow-xs"
                      />
                    </div>

                    {/* Judul Penilaian Field */}
                    <div>
                      <label className="block text-xs font-extrabold text-indigo-950 mb-1 flex items-center gap-1.5">
                        <NotebookPen className="w-4 h-4 text-indigo-600" />
                        Judul Penilaian / Nama Tugas:
                      </label>
                      <input
                        type="text"
                        required
                        value={taskModalJudul}
                        onChange={e => setTaskModalJudul(e.target.value)}
                        placeholder="Ketik Judul Penilaian disini... (misal: Tugas Latihan CSS Grid)"
                        className="w-full p-2.5 border border-indigo-300 rounded-xl font-bold bg-white text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500 shadow-xs"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-indigo-100">
                    <span className="text-[10px] text-indigo-800 font-bold">
                      Isi Otomatis Nilai Semua Siswa:
                    </span>
                    <div className="flex items-center gap-1.5">
                      {[80, 85, 90, 100].map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => {
                            const studentsInClass = siswaList.filter(s => s.kelasId === taskModalKelas);
                            const filled: { [id: string]: number } = {};
                            studentsInClass.forEach(s => { filled[s.id] = val; });
                            setTaskModalScores(filled);
                          }}
                          className="px-2.5 py-1 bg-white border border-indigo-200 hover:bg-indigo-600 hover:text-white rounded-lg text-[10px] font-extrabold text-indigo-700 transition-colors shadow-2xs cursor-pointer"
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Daftar Nama Siswa Table */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                  <div className="p-3 bg-slate-100/80 border-b border-slate-200 flex justify-between items-center text-xs">
                    <span className="font-extrabold text-slate-800 flex items-center gap-2">
                      <Users className="w-4 h-4 text-indigo-600" />
                      Daftar Siswa Kelas {kelasList.find(k => k.id === taskModalKelas)?.namaKelas} ({siswaList.filter(s => s.kelasId === taskModalKelas).length} Siswa)
                    </span>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full">
                      Input untuk: {taskModalJudul}
                    </span>
                  </div>

                  <div className="max-h-[320px] overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-700 font-extrabold sticky top-0 border-b border-slate-200">
                        <tr>
                          <th className="p-2.5 w-10 text-center">No</th>
                          <th className="p-2.5 w-28">NIS</th>
                          <th className="p-2.5">Nama Lengkap Siswa</th>
                          <th className="p-2.5 text-center w-36">Input Nilai (0-100)</th>
                          <th className="p-2.5 text-center w-28">Keterangan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {siswaList.filter(s => s.kelasId === taskModalKelas).length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-6 text-center text-slate-400 italic">
                              Tidak ada siswa terdaftar di kelas ini.
                            </td>
                          </tr>
                        ) : (
                          siswaList.filter(s => s.kelasId === taskModalKelas).map((s, idx) => {
                            const score = taskModalScores[s.id] !== undefined ? taskModalScores[s.id] : 80;
                            const isTuntas = score >= 75;

                            return (
                              <tr key={s.id} className="hover:bg-indigo-50/30 transition-colors">
                                <td className="p-2.5 text-center font-bold text-slate-400">{idx + 1}</td>
                                <td className="p-2.5 font-bold text-slate-500">{s.nis}</td>
                                <td className="p-2.5 font-extrabold text-slate-900">{s.nama}</td>
                                <td className="p-2.5 text-center">
                                  <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={score}
                                    onChange={e => {
                                      const val = Math.min(100, Math.max(0, Number(e.target.value)));
                                      setTaskModalScores(prev => ({
                                        ...prev,
                                        [s.id]: val
                                      }));
                                    }}
                                    className="w-20 p-1.5 border border-slate-300 rounded-xl text-center font-extrabold text-slate-900 bg-white focus:ring-2 focus:ring-indigo-500"
                                  />
                                </td>
                                <td className="p-2.5 text-center">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                    isTuntas ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                  }`}>
                                    {isTuntas ? '✓ Tuntas' : '✕ Belum'}
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

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="text-[11px] text-slate-500">
                    Sistem akan menghitung nilai akhir secara otomatis sesuai bobot Kurikulum Merdeka.
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowTaskInputModal(false)}
                      className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-extrabold hover:from-indigo-700 hover:to-blue-700 shadow-md flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" /> Simpan Nilai (Semua Siswa)
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // MATERI & TUGAS
  if (activeMenu === 'materi_tugas') {
    const materiList = StorageService.getMateri();
    const tugasList = StorageService.getTugas();

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Materi Pembelajaran & Tugas Siswa</h1>
          <p className="text-xs text-slate-500">Unggah bahan ajar dan terbitkan penugasan untuk siswa.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Form Unggah Materi */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm border-b pb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" /> Unggah Materi Pembelajaran
            </h3>
            <form onSubmit={handleSaveMateri} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Judul Materi</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Modul Matriks & Vektor"
                  value={materiForm.judul}
                  onChange={e => setMateriForm({ ...materiForm, judul: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mata Pelajaran</label>
                  <select
                    value={materiForm.mapelId}
                    onChange={e => setMateriForm({ ...materiForm, mapelId: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  >
                    {mapelList.map(m => (
                      <option key={m.id} value={m.id}>{m.namaMapel}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Kelas</label>
                  <select
                    value={materiForm.kelasId}
                    onChange={e => setMateriForm({ ...materiForm, kelasId: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  >
                    {kelasList.map(k => (
                      <option key={k.id} value={k.id}>{k.namaKelas}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Link Drive / Modul</label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/..."
                  value={materiForm.linkDrive}
                  onChange={e => setMateriForm({ ...materiForm, linkDrive: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  value={materiForm.deskripsi}
                  onChange={e => setMateriForm({ ...materiForm, deskripsi: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700"
              >
                Upload Materi
              </button>
            </form>
          </div>

          {/* Form Terbitkan Tugas */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm border-b pb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" /> Terbitkan Tugas & Asesmen
            </h3>
            <form onSubmit={handleSaveTugas} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Judul Tugas</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Latihan Soal Matriks 10 Nomor"
                  value={tugasForm.judul}
                  onChange={e => setTugasForm({ ...tugasForm, judul: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kelas</label>
                  <select
                    value={tugasForm.kelasId}
                    onChange={e => setTugasForm({ ...tugasForm, kelasId: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  >
                    {kelasList.map(k => (
                      <option key={k.id} value={k.id}>{k.namaKelas}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Deadline Pengumpulan</label>
                  <input
                    type="date"
                    value={tugasForm.deadline}
                    onChange={e => setTugasForm({ ...tugasForm, deadline: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Petunjuk & Instruksi Tugas</label>
                <textarea
                  rows={3}
                  value={tugasForm.deskripsi}
                  onChange={e => setTugasForm({ ...tugasForm, deskripsi: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700"
              >
                Terbitkan Tugas
              </button>
            </form>
          </div>
        </div>

        {/* Existing List */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <h3 className="font-bold text-slate-900 text-sm mb-3">Daftar Materi & Tugas Terbit</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tugasList.map(t => (
              <div key={t.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{t.judul}</span>
                  <span className="text-rose-600">Deadline: {t.deadline}</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">{t.namaMapel} • {t.deskripsi}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // JURNAL MENGAJAR
  if (activeMenu === 'jurnal_mengajar') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Jurnal Mengajar Guru</h1>
          <p className="text-xs text-slate-500">Isi catatan pembelajaran harian untuk pemantauan Kepala Sekolah.</p>
        </div>

        <form onSubmit={handleSaveJurnal} className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4 text-xs max-w-2xl">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Kelas</label>
              <select
                value={jurnalForm.kelasId}
                onChange={e => setJurnalForm({ ...jurnalForm, kelasId: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg"
              >
                {kelasList.map(k => (
                  <option key={k.id} value={k.id}>{k.namaKelas}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Mata Pelajaran</label>
              <select
                value={jurnalForm.mapelId}
                onChange={e => setJurnalForm({ ...jurnalForm, mapelId: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg"
              >
                {mapelList.map(m => (
                  <option key={m.id} value={m.id}>{m.namaMapel}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 flex items-center space-x-3">
            <label className="inline-flex items-center space-x-2 cursor-pointer font-bold text-slate-800">
              <input
                type="checkbox"
                checked={jurnalForm.isPiketInval}
                onChange={e => setJurnalForm({ ...jurnalForm, isPiketInval: e.target.checked })}
                className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <span className="text-blue-700 font-extrabold">Isi Sebagai Guru Piket / Inval</span>
            </label>

            {jurnalForm.isPiketInval && (
              <select
                value={jurnalForm.guruDigantikanId}
                onChange={e => setJurnalForm({ ...jurnalForm, guruDigantikanId: e.target.value })}
                className="p-1.5 border border-blue-200 bg-white rounded-lg text-xs font-bold text-slate-800"
              >
                <option value="">-- Guru Yang Digantikan --</option>
                {guruList.filter(g => g.id !== user.guruId).map(g => (
                  <option key={g.id} value={g.id}>{g.nama}</option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Materi Pembelajaran Hari Ini</label>
            <input
              type="text"
              required
              placeholder="Contoh: Sistem Persamaan Linear Tiga Variabel"
              value={jurnalForm.materi}
              onChange={e => setJurnalForm({ ...jurnalForm, materi: e.target.value })}
              className="w-full p-2 border border-slate-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Keterangan / Catatan KBM</label>
            <textarea
              rows={3}
              value={jurnalForm.keterangan}
              onChange={e => setJurnalForm({ ...jurnalForm, keterangan: e.target.value })}
              className="w-full p-2 border border-slate-200 rounded-lg"
            ></textarea>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700"
          >
            Simpan Jurnal KBM
          </button>
        </form>
      </div>
    );
  }

  // BIMBINGAN SISWA
  if (activeMenu === 'bimbingan_wali') {
    const bimbinganList = StorageService.getBimbingan();

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Catatan Bimbingan Siswa</h1>
          <p className="text-xs text-slate-500">Pencatatan bimbingan akademis, konseling, dan tindak lanjut siswa.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm border-b pb-2">Form Tambah Bimbingan</h3>
            <form onSubmit={handleSaveBimbingan} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pilih Siswa</label>
                <select
                  value={bimbinganForm.siswaId}
                  onChange={e => setBimbinganForm({ ...bimbinganForm, siswaId: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                >
                  {siswaList.map(s => (
                    <option key={s.id} value={s.id}>{s.nama} ({s.namaKelas})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Topik Bimbingan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kesulitan Belajar Matematika"
                  value={bimbinganForm.topik}
                  onChange={e => setBimbinganForm({ ...bimbinganForm, topik: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan Bimbingan</label>
                <textarea
                  rows={2}
                  value={bimbinganForm.catatan}
                  onChange={e => setBimbinganForm({ ...bimbinganForm, catatan: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tindak Lanjut</label>
                <input
                  type="text"
                  placeholder="Contoh: Remedial & Pendampingan Khusus"
                  value={bimbinganForm.tindakLanjut}
                  onChange={e => setBimbinganForm({ ...bimbinganForm, tindakLanjut: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700"
              >
                Simpan Catatan Bimbingan
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <h3 className="font-bold text-slate-900 text-sm mb-3">Riwayat Bimbingan Siswa</h3>
            <div className="space-y-3">
              {bimbinganList.map(b => (
                <div key={b.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>{b.namaSiswa}</span>
                    <span className="text-slate-400 font-normal">{b.tanggal}</span>
                  </div>
                  <div className="text-blue-700 font-semibold mt-1">Topik: {b.topik}</div>
                  <div className="text-slate-600 text-[11px] mt-1">{b.catatan}</div>
                  <div className="text-emerald-700 font-bold text-[10px] mt-1">Tindak Lanjut: {b.tindakLanjut}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PRESTASI & PELANGGARAN (DENGAN KEDISIPLINAN 100 POIN / 3 TAHUN)
  if (activeMenu === 'prestasi_pelanggaran') {
    const kedisiplinanList = StorageService.getAllKedisiplinanSiswa();

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Kedisiplinan & Pelanggaran Siswa</h1>
          <p className="text-xs text-slate-500">Pencatatan pelanggaran dengan Poin Kedisiplinan Awal = 100 Poin untuk 3 tahun / masa studi.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
          {/* Form Input Pelanggaran */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm border-b pb-2 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" /> Input Pelanggaran Siswa
            </h3>
            <form onSubmit={handleSavePelanggaran} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pilih Siswa</label>
                <select
                  value={pelanggaranForm.siswaId}
                  onChange={e => setPelanggaranForm({ ...pelanggaranForm, siswaId: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                >
                  {siswaList.map(s => (
                    <option key={s.id} value={s.id}>{s.nama} ({s.namaKelas})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama / Bentuk Pelanggaran</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Terlambat Masuk Sekolah / Tidak Pakai Seragam"
                  value={pelanggaranForm.namaPelanggaran}
                  onChange={e => setPelanggaranForm({ ...pelanggaranForm, namaPelanggaran: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={pelanggaranForm.kategori}
                    onChange={e => {
                      const kat = e.target.value as 'Ringan' | 'Sedang' | 'Berat';
                      const defaultPoin = kat === 'Ringan' ? 5 : kat === 'Sedang' ? 15 : 30;
                      setPelanggaranForm({ ...pelanggaranForm, kategori: kat, poin: defaultPoin });
                    }}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  >
                    <option value="Ringan">Ringan (5 Poin)</option>
                    <option value="Sedang">Sedang (15 Poin)</option>
                    <option value="Berat">Berat (30 Poin)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Poin Pengurangan</label>
                  <input
                    type="number"
                    value={pelanggaranForm.poin}
                    onChange={e => setPelanggaranForm({ ...pelanggaranForm, poin: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-200 rounded-lg text-rose-600 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tindak Lanjut / Sanksi</label>
                <input
                  type="text"
                  placeholder="Contoh: Teguran lisan & pemanggilan wali kelas"
                  value={pelanggaranForm.tindakLanjut}
                  onChange={e => setPelanggaranForm({ ...pelanggaranForm, tindakLanjut: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700"
              >
                Kurangi Poin Kedisiplinan
              </button>
            </form>
          </div>

          {/* Table Sisa Poin Kedisiplinan Siswa (Maksimal 100 Poin) */}
          <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Status Kedisiplinan Siswa (Modal 100 Poin / 3 Tahun)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Nama Siswa</th>
                    <th className="p-3">Kelas</th>
                    <th className="p-3">Sisa Poin / 100</th>
                    <th className="p-3">Status Kedisiplinan</th>
                    <th className="p-3">Status Surat Peringatan (SP)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {kedisiplinanList.map(k => (
                    <tr key={k.siswaId} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{k.namaSiswa}</td>
                      <td className="p-3 text-slate-500">{k.namaKelas}</td>
                      <td className="p-3 font-extrabold text-blue-700">
                        {k.sisaPoin} / 100 Poin
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          k.sisaPoin >= 90 ? 'bg-emerald-50 text-emerald-700' :
                          k.sisaPoin >= 75 ? 'bg-blue-50 text-blue-700' :
                          k.sisaPoin >= 50 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {k.statusKategori}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-slate-700">{k.statusSP}</td>
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

  // Fallback & Global Pop-up Modals
  return (
    <>
      <div className="bg-white p-6 rounded-xl border border-slate-200 text-center text-xs">
        Fitur {activeMenu} Guru Siap Digunakan.
      </div>

      {/* POP-UP MODAL INPUT PRESENSI MANUAL */}
      {showPresensiModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-700 to-teal-800 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl">
                  <ClipboardCheck className="w-6 h-6 text-emerald-200" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold">Pop-up Input Presensi Manual Per Kelas</h2>
                  <p className="text-xs text-emerald-100">Pencatatan presensi kilat dengan fitur Set Massal & Catatan Alasan</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPresensiModal(false)}
                className="p-1.5 rounded-xl hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Controls */}
            <form onSubmit={handleSavePresensiModal} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">Pilih Kelas</label>
                  <select
                    value={presensiModalKelas}
                    onChange={e => setPresensiModalKelas(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-xl font-extrabold bg-white"
                  >
                    {kelasList.map(k => (
                      <option key={k.id} value={k.id}>{k.namaKelas}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">Mata Pelajaran</label>
                  <select
                    value={presensiModalMapel}
                    onChange={e => setPresensiModalMapel(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-xl font-extrabold bg-white"
                  >
                    {mapelList.map(m => (
                      <option key={m.id} value={m.id}>{m.namaMapel} ({m.kodeMapel})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-extrabold text-slate-700 mb-1">Tanggal Presensi</label>
                  <input
                    type="date"
                    value={presensiModalTanggal}
                    onChange={e => setPresensiModalTanggal(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-xl font-extrabold bg-white"
                  />
                </div>
              </div>

              {/* Quick Toolbar inside Modal */}
              <div className="p-3 bg-emerald-50/60 border-b border-emerald-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-extrabold text-emerald-900">
                  Ubah Massal ({siswaList.filter(s => s.kelasId === presensiModalKelas).length} Siswa):
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const students = siswaList.filter(s => s.kelasId === presensiModalKelas);
                      const updated: { [id: string]: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa' } = {};
                      students.forEach(s => { updated[s.id] = 'Hadir'; });
                      setPresensiModalRecords(updated);
                    }}
                    className="px-3 py-1 bg-emerald-600 text-white font-extrabold rounded-lg hover:bg-emerald-700 shadow-2xs"
                  >
                    Set Semua Hadir
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const students = siswaList.filter(s => s.kelasId === presensiModalKelas);
                      const updated: { [id: string]: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa' } = {};
                      students.forEach(s => { updated[s.id] = 'Sakit'; });
                      setPresensiModalRecords(updated);
                    }}
                    className="px-3 py-1 bg-amber-500 text-white font-extrabold rounded-lg hover:bg-amber-600 shadow-2xs"
                  >
                    Set Semua Sakit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const students = siswaList.filter(s => s.kelasId === presensiModalKelas);
                      const updated: { [id: string]: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa' } = {};
                      students.forEach(s => { updated[s.id] = 'Izin'; });
                      setPresensiModalRecords(updated);
                    }}
                    className="px-3 py-1 bg-blue-600 text-white font-extrabold rounded-lg hover:bg-blue-700 shadow-2xs"
                  >
                    Set Semua Izin
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const students = siswaList.filter(s => s.kelasId === presensiModalKelas);
                      const updated: { [id: string]: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa' } = {};
                      students.forEach(s => { updated[s.id] = 'Alpa'; });
                      setPresensiModalRecords(updated);
                    }}
                    className="px-3 py-1 bg-rose-600 text-white font-extrabold rounded-lg hover:bg-rose-700 shadow-2xs"
                  >
                    Set Semua Alpa
                  </button>
                </div>
              </div>

              {/* Student List in Modal */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-extrabold sticky top-0 z-10 border-b border-slate-200">
                    <tr>
                      <th className="p-2.5 w-10 text-center">No</th>
                      <th className="p-2.5">Nama Siswa</th>
                      <th className="p-2.5">NIS</th>
                      <th className="p-2.5 text-center">Status Kehadiran</th>
                      <th className="p-2.5">Keterangan / Alasan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {siswaList.filter(s => s.kelasId === presensiModalKelas).map((s, idx) => {
                      const curSt = presensiModalRecords[s.id] || 'Hadir';
                      return (
                        <tr key={s.id} className="hover:bg-slate-50">
                          <td className="p-2.5 text-center font-bold text-slate-400">{idx + 1}</td>
                          <td className="p-2.5 font-extrabold text-slate-900">{s.nama}</td>
                          <td className="p-2.5 font-bold text-slate-500">{s.nis}</td>
                          <td className="p-2.5 text-center">
                            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-100 gap-1 text-[11px]">
                              {(['Hadir', 'Sakit', 'Izin', 'Alpa'] as const).map(st => (
                                <button
                                  key={st}
                                  type="button"
                                  onClick={() => setPresensiModalRecords(prev => ({ ...prev, [s.id]: st }))}
                                  className={`px-2.5 py-1 rounded-md font-extrabold transition-all ${
                                    curSt === st
                                      ? st === 'Hadir' ? 'bg-emerald-600 text-white' :
                                        st === 'Sakit' ? 'bg-amber-500 text-white' :
                                        st === 'Izin' ? 'bg-blue-600 text-white' :
                                        'bg-rose-600 text-white'
                                      : 'text-slate-600 hover:text-slate-900'
                                  }`}
                                >
                                  {st}
                                </button>
                              ))}
                            </div>
                          </td>
                          <td className="p-2.5">
                            <input
                              type="text"
                              placeholder="Alasan / Catatan..."
                              value={presensiModalNotes[s.id] || ''}
                              onChange={e => setPresensiModalNotes(prev => ({ ...prev, [s.id]: e.target.value }))}
                              className="w-full p-1.5 border border-slate-200 rounded-lg text-xs font-medium bg-slate-50 focus:bg-white"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowPresensiModal(false)}
                  className="px-4 py-2 bg-white border border-slate-300 font-extrabold text-slate-700 rounded-xl hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white font-extrabold rounded-xl hover:bg-emerald-700 shadow-md flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" /> Simpan Presensi Modal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

