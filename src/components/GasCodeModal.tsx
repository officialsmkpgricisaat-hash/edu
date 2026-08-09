import React, { useState } from 'react';
import { GAS_KODE_GS, GAS_INDEX_HTML } from '../utils/gasCodeGenerator';
import { X, Copy, Check, Code2, FileCode, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const GasCodeModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'KODE_GS' | 'INDEX_HTML'>('KODE_GS');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const codeToDisplay = activeTab === 'KODE_GS' ? GAS_KODE_GS : GAS_INDEX_HTML;

  const handleCopy = () => {
    navigator.clipboard.writeText(codeToDisplay);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold">Source Code Google Apps Script Web App</h2>
              <p className="text-[11px] text-slate-400">Gunakan file ini untuk deployment langsung ke Spreadsheet Google Apps Script Editor.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab & Copy Action Bar */}
        <div className="bg-slate-100 p-2 border-b border-slate-200 flex items-center justify-between">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('KODE_GS')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'KODE_GS'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <FileCode className="w-4 h-4" /> Kode.gs (Backend)
            </button>
            <button
              onClick={() => setActiveTab('INDEX_HTML')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'INDEX_HTML'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <Code2 className="w-4 h-4" /> Index.html (Frontend)
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="px-4 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 flex items-center gap-1.5 shadow-xs transition-all"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-200" /> Tersalin ke Clipboard!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> Salin Seluruh Kode {activeTab === 'KODE_GS' ? 'Kode.gs' : 'Index.html'}
              </>
            )}
          </button>
        </div>

        {/* Instruction Banner */}
        <div className="p-3 bg-amber-50 text-amber-900 text-xs border-b border-amber-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            <strong>Instruksi Deployment Google Apps Script:</strong> Buka Google Spreadsheet &rarr; Extension &rarr; Apps Script. Tempelkan kode ke file <code className="font-bold bg-amber-100 px-1 rounded">Kode.gs</code> dan <code className="font-bold bg-amber-100 px-1 rounded">Index.html</code>. Lalu jalankan fungsi <code className="font-bold bg-amber-100 px-1 rounded">setupDatabase()</code> satu kali.
          </span>
        </div>

        {/* Code Content Editor Area */}
        <div className="flex-1 bg-slate-950 p-4 overflow-auto font-mono text-xs text-slate-200 leading-relaxed selection:bg-indigo-600 selection:text-white">
          <pre>{codeToDisplay}</pre>
        </div>
      </div>
    </div>
  );
};
