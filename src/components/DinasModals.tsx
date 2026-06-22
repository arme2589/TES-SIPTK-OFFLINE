import React, { useState, useEffect } from 'react';
import { SekolahDb, PenggunaDb } from '../types';
import { Building, X, Key, Plus, Trash2, ShieldCheck, RefreshCw } from 'lucide-react';
import { generateId } from '../utils/dbSeed';

interface ManageSchoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  sekolahList: SekolahDb[];
  kecamatanList: string[];
  onAddSchool: (school: SekolahDb) => void;
  onDeleteSchool: (id: string) => void;
}

export const ManageSchoolModal: React.FC<ManageSchoolModalProps> = ({
  isOpen,
  onClose,
  sekolahList,
  kecamatanList,
  onAddSchool,
  onDeleteSchool
}) => {
  if (!isOpen) return null;

  const [kecamatan, setKecamatan] = useState<string>(kecamatanList[0] || '');
  const [namaSekolah, setNamaSekolah] = useState<string>('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaSekolah.trim()) return;

    onAddSchool({
      ID: "S" + Date.now().toString().slice(-4),
      Kecamatan: kecamatan.toUpperCase(),
      Nama_Sekolah: namaSekolah.toUpperCase().trim()
    });
    setNamaSekolah('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden border border-white/10 flex flex-col scale-100 text-slate-200">
        
        {/* Header */}
        <div className="bg-slate-950/40 px-6 py-4 flex justify-between items-center text-white border-b border-white/10">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Building className="h-5 w-5 text-blue-400" />
            <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">Kelola Master Data Sekolah</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content Split Body */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-white/10">
          
          {/* Add New Form */}
          <div className="w-full md:w-1/3 p-6 bg-white/[0.02] flex flex-col justify-start">
            <h4 className="font-bold text-slate-250 text-sm mb-4 uppercase tracking-wider">Tambah Sekolah Baru</h4>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Pilih Kecamatan</label>
                <select
                  value={kecamatan}
                  onChange={(e) => setKecamatan(e.target.value)}
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 uppercase"
                  required
                >
                  {kecamatanList.map(kec => (
                    <option key={kec} value={kec} className="bg-slate-900 text-slate-100">{kec}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Nama Unit Sekolah</label>
                <input
                  type="text"
                  placeholder="Contoh: SDN 58 TANETE"
                  value={namaSekolah}
                  onChange={(e) => setNamaSekolah(e.target.value)}
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 uppercase placeholder:text-slate-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl text-xs font-bold uppercase transition flex items-center justify-center gap-2 shadow-lg shadow-blue-900/15"
              >
                <Plus className="h-4 w-4" />
                Daftarkan Unit
              </button>
            </form>
          </div>

          {/* List Table */}
          <div className="flex-1 p-6 overflow-y-auto">
            <h4 className="font-bold text-slate-255 text-sm mb-4 uppercase tracking-wider">Daftar Unit Sekolah ({sekolahList.length} Terdaftar)</h4>
            
            <div className="border border-white/10 rounded-xl overflow-hidden bg-slate-950/20">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-slate-300 border-b border-white/10 text-xs uppercase font-mono font-bold">
                  <tr>
                    <th className="p-3">Kecamatan</th>
                    <th className="p-3">Nama Sekolah</th>
                    <th className="p-3 text-center w-20">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-transparent">
                  {sekolahList.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-4 text-center text-slate-550">Belum ada sekolah terdaftar. Silakan tambahkan satu.</td>
                    </tr>
                  ) : (
                    sekolahList.map(s => (
                      <tr key={s.ID} className="hover:bg-white/[0.04] transition">
                        <td className="p-3 text-xs text-slate-400 font-medium">{s.Kecamatan}</td>
                        <td className="p-3 text-sm font-semibold text-slate-200 uppercase">{s.Nama_Sekolah}</td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => {
                              if (confirm(`Apakah Anda yakin ingin menghapus Unit ${s.Nama_Sekolah}? Hubungan data PTK sekolah tersebut dapat terpengaruh.`)) {
                                onDeleteSchool(s.ID);
                              }
                            }}
                            className="p-1.5 hover:bg-red-500/10 text-red-400 hover:text-red-300 rounded-lg transition"
                            title="Hapus Unit"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};


interface ManagePasswordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sekolahList: SekolahDb[];
  penggunaList: PenggunaDb[];
  onSavePassword: (role: 'Admin Dinas' | 'Sekolah', identifier: string, newPass: string) => void;
  userRole?: 'Admin Dinas' | 'Sekolah' | null;
  userIdentifier?: string | null;
}

export const ManagePasswordsModal: React.FC<ManagePasswordsModalProps> = ({
  isOpen,
  onClose,
  sekolahList,
  penggunaList,
  onSavePassword,
  userRole,
  userIdentifier
}) => {
  if (!isOpen) return null;

  const [role, setRole] = useState<'Admin Dinas' | 'Sekolah'>('Sekolah');
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');

  const [districtMap, setDistrictMap] = useState<Record<string, string[]>>({});

  // Auto initialize values depending on user context
  useEffect(() => {
    if (isOpen) {
      if (userRole === 'Sekolah' && userIdentifier) {
        setRole('Sekolah');
        setSelectedSchool(userIdentifier);
      } else {
        setRole('Sekolah');
        setSelectedSchool('');
      }
    }
  }, [isOpen, userRole, userIdentifier]);

  useEffect(() => {
    // Group schools by district to build clean structured display
    const group: Record<string, string[]> = {};
    sekolahList.forEach(s => {
      if (!group[s.Kecamatan]) group[s.Kecamatan] = [];
      group[s.Kecamatan].push(s.Nama_Sekolah);
    });
    setDistrictMap(group);
  }, [sekolahList]);

  // Hook to lookup active database password on account choice change
  useEffect(() => {
    let lookupId = "admin";
    if (role === 'Sekolah') {
      lookupId = selectedSchool; // format: "KECAMATAN|SEKOLAH"
    }

    const matched = penggunaList.find(p => p.Role === role && p.Identifier === lookupId);
    if (matched) {
      setCurrentPassword(matched.Password);
    } else {
      setCurrentPassword('(Belum Diatur - Default Password "dikerja" akan berlaku jika di-save)');
    }
  }, [role, selectedSchool, penggunaList]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) return;

    let identifier = "admin";
    if (role === 'Sekolah') {
      if (!selectedSchool) return alert('Silakan pilih akun sekolah terlebih dahulu!');
      identifier = selectedSchool;
    }

    onSavePassword(role, identifier, newPassword.trim());
    setNewPassword('');
    alert('Password akun berhasil diperbarui. Klik tombol save database di header untuk menyimpan file Excel!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
      <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-white/10 text-slate-200">
        
        {/* Header */}
        <div className="bg-slate-950/40 px-6 py-4 flex justify-between items-center text-white border-b border-white/10">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Key className="h-5 w-5 text-indigo-400" />
            <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">Kelola Password & Akses Akun</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {userRole !== 'Sekolah' ? (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Pilih Jenis Akses</label>
                <select
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value as any);
                    setSelectedSchool('');
                  }}
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"
                >
                  <option value="Sekolah" className="bg-slate-900 text-slate-100">Admin Sekolah (Kecamatan / Unit)</option>
                  <option value="Admin Dinas" className="bg-slate-900 text-slate-100">Admin Dinas Kabupaten (Total)</option>
                </select>
              </div>

              {role === 'Sekolah' && (
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Akun Instansi Sekolah</label>
                  <select
                    value={selectedSchool}
                    onChange={(e) => setSelectedSchool(e.target.value)}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none uppercase"
                    required
                  >
                    <option value="" className="bg-slate-900 text-slate-100">-- Hubungkan Akun --</option>
                    {(Object.entries(districtMap) as [string, string[]][]).map(([district, schools]) => (
                      <optgroup key={district} label={district} className="font-bold text-slate-400 bg-slate-900">
                        {schools.map(schName => (
                          <option key={schName} value={`${district}|${schName}`} className="bg-slate-900 text-slate-100 font-sans">{schName}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              )}
            </>
          ) : (
            <div className="bg-purple-500/10 p-3 rounded-xl text-xs text-purple-200 border border-purple-500/20">
              <span className="font-bold block">Akses Akun Terkunci:</span>
              <span className="block mt-0.5 font-mono text-purple-300 font-extrabold uppercase">{userIdentifier ? userIdentifier.split('|')[1] : ''}</span>
            </div>
          )}

          <div className="bg-white/[0.02] p-4 rounded-xl border border-white/10">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Password Lama Saat Ini:</span>
            <div className="text-sm font-bold text-slate-200 mt-1 font-mono">{currentPassword || '-'}</div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Ketik Password Baru</label>
            <input
              type="text"
              placeholder="Contoh: ammatoa2026 / dikerja_baru"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"
              required
            />
          </div>

          <div className="flex gap-2 pt-2 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 py-2.5 rounded-lg text-xs font-bold uppercase transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="w-2/3 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-lg text-xs font-bold uppercase transition inline-flex items-center justify-center gap-2 border border-indigo-500/20 shadow-lg shadow-indigo-900/10"
            >
              <ShieldCheck className="h-4 w-4 text-amber-400" />
              Simpan Sandi
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
