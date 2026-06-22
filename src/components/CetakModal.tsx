import React, { useState, useEffect } from 'react';
import { Printer, X, FileText } from 'lucide-react';

interface CetakModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (config: CetakConfig) => void;
}

export interface CetakConfig {
  judul: string;
  tanggal: string;
  jabatan: string;
  nama: string;
  nip: string;
}

export const CetakModal: React.FC<CetakModalProps> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
  if (!isOpen) return null;

  const [judul, setJudul] = useState<string>('LAPORAN DATA PENDIDIK DAN TENAGA KEPENDIDIKAN (PTK)');
  const [tanggal, setTanggal] = useState<string>('');
  const [jabatan, setJabatan] = useState<string>('Kepala Dinas Pendidikan dan Kebudayaan,');
  const [nama, setNama] = useState<string>('ANDI BUYUNG SAPUTRA, S.STP., M.M.');
  const [nip, setNip] = useState<string>('19811110 200012 1 012');

  useEffect(() => {
    // Generate default formatted date in Indonesian
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const today = new Date();
    setTanggal(`${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`);
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      judul,
      tanggal,
      jabatan,
      nama,
      nip
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
      <div className="bg-slate-900/45 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-white/10 scale-100 transition-all text-slate-150">
        
        {/* Header */}
        <div className="bg-emerald-500/10 border-b border-white/10 px-6 py-4 flex justify-between items-center text-white animate-fade-in">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Printer className="h-5 w-5 text-emerald-400" />
            <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">Pengaturan Cetak Dokumen / PDF</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Judul Lap / Kop Dokumen</label>
            <input
              type="text"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Tanggal Tanda Tangan</label>
            <input
              type="text"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              placeholder="Contoh: 1 April 2026"
              className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Jabatan Penandatangan</label>
            <input
              type="text"
              value={jabatan}
              onChange={(e) => setJabatan(e.target.value)}
              className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nama Pejabat</label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 uppercase font-bold"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">NIP Pejabat</label>
            <input
              type="text"
              value={nip}
              onChange={(e) => setNip(e.target.value)}
              className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          {/* Action Trigger */}
          <div className="flex gap-2 pt-2 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 py-3 rounded-lg text-xs font-bold uppercase transition text-center"
            >
              Batal
            </button>
            <button
              type="submit"
              className="w-2/3 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-lg text-xs font-bold uppercase transition flex items-center justify-center gap-2 border border-emerald-500/20 shadow-lg shadow-emerald-900/10"
            >
              <FileText className="h-4 w-4 text-emerald-200 animate-pulse" />
              Lanjutkan
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
