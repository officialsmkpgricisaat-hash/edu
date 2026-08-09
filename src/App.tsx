import React, { useState, useEffect } from 'react';
import { User, Setting, Role } from './types';
import { StorageService } from './services/storageService';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { KepalaSekolahDashboard } from './components/KepalaSekolahDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { GuruDashboard } from './components/GuruDashboard';
import { WaliKelasDashboard } from './components/WaliKelasDashboard';
import { SiswaDashboard } from './components/SiswaDashboard';
import { GasCodeModal } from './components/GasCodeModal';
import { PrintReportView } from './components/PrintReportView';
import { GraduationCap, LogIn, Database, KeyRound, ShieldCheck, CheckCircle2, Code2 } from 'lucide-react';

export default function App() {
  // Ensure database is initialized on boot
  useEffect(() => {
    if (!localStorage.getItem('eduadmin_users')) {
      StorageService.setupDatabase();
    }
  }, []);

  // Application State
  const [user, setUser] = useState<User | null>(null);
  const [setting, setSetting] = useState<Setting>(StorageService.getSetting());
  const [activeMenu, setActiveMenu] = useState<string>('dashboard');

  // Modals & Printable view state
  const [showCodeModal, setShowCodeModal] = useState<boolean>(false);
  const [printReportType, setPrintReportType] = useState<string | null>(null);
  const [printTargetSiswaId, setPrintTargetSiswaId] = useState<string | null>(null);

  const handleOpenPrintReport = (type: string, siswaId?: string) => {
    setPrintReportType(type);
    setPrintTargetSiswaId(siswaId || null);
  };

  // Login Form State
  const [loginUsername, setLoginUsername] = useState<string>('kepala');
  const [loginPassword, setLoginPassword] = useState<string>('kepala123');
  const [loginError, setLoginError] = useState<string>('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const res = StorageService.login(loginUsername, loginPassword);
    if (res.success && res.user) {
      setUser(res.user);
      setActiveMenu('dashboard');
    } else {
      setLoginError(res.message || 'Login gagal.');
    }
  };

  const handleQuickLogin = (roleUsername: string) => {
    const res = StorageService.login(roleUsername);
    if (res.success && res.user) {
      setUser(res.user);
      setActiveMenu('dashboard');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setPrintReportType(null);
  };

  const handleChangeRolePreview = (newRole: Role) => {
    if (!user) return;
    const users = StorageService.getUsers();
    const targetUser = users.find(u => u.role === newRole) || {
      ...user,
      role: newRole,
      nama: `${newRole.replace('_', ' ')} Preview`,
    };
    setUser(targetUser as User);
    setActiveMenu('dashboard');
  };

  const handleRunDatabaseSetup = () => {
    const res = StorageService.setupDatabase();
    setSetting(StorageService.getSetting());
    alert(res.message);
  };

  // If viewing printable report page
  if (printReportType && user) {
    return (
      <PrintReportView
        reportType={printReportType}
        setting={setting}
        onBack={() => {
          setPrintReportType(null);
          setPrintTargetSiswaId(null);
        }}
        targetSiswaId={printTargetSiswaId || user.siswaId}
        currentUser={user}
      />
    );
  }

  // LOGIN SCREEN
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
        {/* Background Decorative Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-slate-100 relative z-10">
          {/* Header Branding */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-indigo-300 mb-3">
              <GraduationCap className="w-9 h-9" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">EduAdmin Portal</h1>
            <p className="text-xs font-semibold text-slate-500 mt-1">Sistem Administrasi Sekolah Terpadu (5 Role)</p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-semibold">
              {loginError}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs font-medium">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Username Akun</label>
              <input
                type="text"
                required
                value={loginUsername}
                onChange={e => setLoginUsername(e.target.value)}
                placeholder="Masukkan username..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Password</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                placeholder="Masukkan password..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 font-bold"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" /> Masuk Aplikasi EduAdmin
            </button>
          </form>

          {/* Quick Demo Accounts Selection */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center mb-3">
              Uji Coba 5 Role (1-Click Login Demo)
            </div>
            <div className="grid grid-cols-1 gap-1.5 text-xs font-semibold">
              <button
                onClick={() => handleQuickLogin('kepala')}
                className="p-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-left flex items-center justify-between border border-slate-800 transition-colors"
              >
                <span>1. Kepala Sekolah</span>
                <span className="text-[10px] font-mono opacity-80">kepala</span>
              </button>
              <button
                onClick={() => handleQuickLogin('admin')}
                className="p-2 rounded-xl bg-slate-100 text-slate-800 hover:bg-slate-200 text-left flex items-center justify-between border border-slate-200 transition-colors"
              >
                <span>2. Administrator</span>
                <span className="text-[10px] font-mono opacity-80">admin</span>
              </button>
              <button
                onClick={() => handleQuickLogin('guru1')}
                className="p-2 rounded-xl bg-slate-100 text-slate-800 hover:bg-slate-200 text-left flex items-center justify-between border border-slate-200 transition-colors"
              >
                <span>3. Guru Pengajar</span>
                <span className="text-[10px] font-mono opacity-80">guru1</span>
              </button>
              <button
                onClick={() => handleQuickLogin('wali1')}
                className="p-2 rounded-xl bg-slate-100 text-slate-800 hover:bg-slate-200 text-left flex items-center justify-between border border-slate-200 transition-colors"
              >
                <span>4. Wali Kelas (X TO 1)</span>
                <span className="text-[10px] font-mono opacity-80">wali1</span>
              </button>
              <button
                onClick={() => handleQuickLogin('siswa1')}
                className="p-2 rounded-xl bg-slate-100 text-slate-800 hover:bg-slate-200 text-left flex items-center justify-between border border-slate-200 transition-colors"
              >
                <span>5. Siswa</span>
                <span className="text-[10px] font-mono opacity-80">siswa1</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => setShowCodeModal(true)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:underline"
            >
              <Code2 className="w-4 h-4" /> Lihat & Salin Kode.gs / Index.html
            </button>
          </div>
        </div>

        <GasCodeModal isOpen={showCodeModal} onClose={() => setShowCodeModal(false)} />
      </div>
    );
  }

  // MAIN DASHBOARD APPLICATION LAYOUT (LOGGED IN)
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navbar */}
      <Navbar
        user={user}
        setting={setting}
        onLogout={handleLogout}
        onOpenCodeModal={() => setShowCodeModal(true)}
        onRunDatabaseSetup={handleRunDatabaseSetup}
        activeRole={user.role}
        onChangeRolePreview={handleChangeRolePreview}
      />

      {/* Main Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Role-Specific Sidebar */}
        <Sidebar
          user={user}
          activeMenu={activeMenu}
          onSelectMenu={m => setActiveMenu(m)}
          onLogout={handleLogout}
        />

        {/* Dashboard Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {user.role === 'KEPALA_SEKOLAH' && (
            <KepalaSekolahDashboard
              user={user}
              setting={setting}
              activeMenu={activeMenu}
              onSelectMenu={setActiveMenu}
              onOpenPrintReport={(type, siswaId) => handleOpenPrintReport(type, siswaId)}
            />
          )}

          {user.role === 'ADMIN' && (
            <AdminDashboard
              user={user}
              setting={setting}
              activeMenu={activeMenu}
              onRefreshSetting={() => setSetting(StorageService.getSetting())}
            />
          )}

          {user.role === 'GURU' && (
            <GuruDashboard
              user={user}
              setting={setting}
              activeMenu={activeMenu}
              onOpenPrintReport={(type, siswaId) => handleOpenPrintReport(type, siswaId)}
            />
          )}

          {user.role === 'WALI_KELAS' && (
            <WaliKelasDashboard
              user={user}
              setting={setting}
              activeMenu={activeMenu}
              onOpenPrintReport={(type, siswaId) => handleOpenPrintReport(type, siswaId)}
            />
          )}

          {user.role === 'SISWA' && (
            <SiswaDashboard
              user={user}
              setting={setting}
              activeMenu={activeMenu}
              onOpenPrintReport={(type, siswaId) => handleOpenPrintReport(type, siswaId)}
            />
          )}
        </main>
      </div>

      {/* Source Code Viewer Modal */}
      <GasCodeModal
        isOpen={showCodeModal}
        onClose={() => setShowCodeModal(false)}
      />
    </div>
  );
}
