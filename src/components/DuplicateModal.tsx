import React, { useState, useEffect } from 'react';
import { DuplicateGroup } from '../utils/dbEngine';
import { GtkData } from '../types';
import { Trash2, X, CheckSquare, Square, ShieldAlert, BadgeAlert } from 'lucide-react';

interface DuplicateModalProps {
  isOpen: boolean;
  onClose: () => void;
  duplicateGroups: DuplicateGroup[];
  onDeleteSelected: (rowNumbers: number[]) => void;
}

export const DuplicateModal: React.FC<DuplicateModalProps> = ({
  isOpen,
  onClose,
  duplicateGroups,
  onDeleteSelected
}) => {
  if (!isOpen) return null;

  const [checkedRows, setCheckedRows] = useState<number[]>([]);

  // Auto-fill checked rows with standard suggested check rows from groups on open
  useEffect(() => {
    const list: number[] = [];
    duplicateGroups.forEach(group => {
      group.items.forEach(item => {
        if (item._autoCheck && item.rowNumber !== undefined) {
          list.push(item.rowNumber);
        }
      });
    });
    setCheckedRows(list);
  }, [duplicateGroups, isOpen]);

  const handleToggleCheck = (rowNumber: number) => {
    setCheckedRows(prev => {
      if (prev.includes(rowNumber)) {
        return prev.filter(r => r !== rowNumber);
      } else {
        return [...prev, rowNumber];
      }
    });
  };

  const handleToggleAll = () => {
    const allAutoChecked: number[] = [];
    duplicateGroups.forEach(group => {
      group.items.forEach(item => {
        if (item.rowNumber !== undefined) {
          allAutoChecked.push(item.rowNumber);
        }
      });
    });

    if (checkedRows.length === allAutoChecked.length) {
      setCheckedRows([]);
    } else {
      setCheckedRows(allAutoChecked);
    }
  };

  const handleDelete = () => {
    if (checkedRows.length === 0) return;
    if (confirm(`Apakah Anda yakin ingin menghapus ${checkedRows.length} data duplicate terpilih secara permanen? Setelah dihapus, simpan database Anda untuk menyimpan file final.`)) {
      onDeleteSelected(checkedRows);
    }
  };

  const totalGroups = duplicateGroups.length;
  const totalSecondaryCount = duplicateGroups.reduce((acc, g) => acc + (g.items.length - 1), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col scale-100 transition-all border border-white/10 text-slate-200">
        
        {/* Header */}
        <div className="bg-slate-950/40 px-6 py-4 flex justify-between items-center text-white border-b border-white/10">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-purple-400" />
              <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">Kelola Data Ganda (NIK & Nama Identik)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Mendeteksi kesamaan data personel di seluruh satuan sekolah</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition duration-200">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="bg-purple-500/10 p-4 border-b border-white/10 text-sm text-purple-200 flex gap-3 items-start backdrop-blur-sm">
          <BadgeAlert className="h-5 w-5 text-purple-400 shrink-0 mt-0.5 animate-pulse" />
          <div>
            Sistem memindai database secara offline dan mendeteksi adanya data dengan <strong>NIK (16 Digit) dan Nama identik</strong>. 
            Sistem secara otomatis memberikan tanda rekomendasi centang pada data yang <strong>kurang lengkap</strong> (isian kolom lebih sedikit). Anda dapat menyunting tanda centang dan melakukan pembersihan massal.
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {totalGroups === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <div className="h-16 w-16 bg-white/5 border border-white/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckSquare className="h-8 w-8" />
              </div>
              <p className="font-bold text-lg text-white">Database Bersih dari Duplikat!</p>
              <p className="text-sm mt-1">Tidak terdeteksi NIK atau Nama ganda yang mencurigakan di sistem Anda saat ini.</p>
            </div>
          ) : (
            <div className="border border-white/10 bg-slate-950/20 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-sm whitespace-nowrap table-fixed">
                <thead className="bg-white/5 text-slate-300 border-b border-white/10 uppercase text-xs font-bold font-mono">
                  <tr>
                    <th className="p-3 text-center w-12">
                      <button onClick={handleToggleAll} className="text-slate-300 hover:text-white font-bold" title="Centang Semua">
                        {checkedRows.length > 0 ? '✓' : '☐'}
                      </button>
                    </th>
                    <th className="p-3 w-40">NIK Peserta</th>
                    <th className="p-3 w-48">Nama Lengkap</th>
                    <th className="p-3 w-48">Sekolah Instansi</th>
                    <th className="p-3 w-40">Status Kepegawaian</th>
                    <th className="p-3 w-28 text-center">Kelengkapan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-transparent">
                  {duplicateGroups.map((group, groupIdx) => {
                    const groupBg = groupIdx % 2 === 0 ? "bg-transparent" : "bg-white/[0.02]";
                    return (
                      <React.Fragment key={group.key}>
                        {group.items.map((item, itemIdx) => {
                          const isSel = item.rowNumber !== undefined && checkedRows.includes(item.rowNumber);
                          return (
                            <tr key={item.ID} className={`${groupBg} hover:bg-white/5 transition duration-150`}>
                              <td className="p-3 text-center">
                                {item.rowNumber !== undefined ? (
                                  <input
                                    type="checkbox"
                                    checked={isSel}
                                    onChange={() => handleToggleCheck(item.rowNumber!)}
                                    className="h-4 w-4 bg-slate-950 border-white/20 text-purple-600 focus:ring-purple-500 rounded cursor-pointer"
                                  />
                                ) : '-'}
                              </td>
                              <td className="p-3 font-mono text-slate-200 tracking-wider">
                                <span>{item.NIK}</span>
                                {itemIdx === 0 ? (
                                  <span className="bg-emerald-500/15 text-emerald-300 text-[9px] px-1.5 py-0.5 rounded font-bold ml-2 border border-emerald-500/20">Asli</span>
                                ) : (
                                  <span className="bg-red-500/15 text-red-300 text-[9px] px-1.5 py-0.5 rounded font-bold ml-2 border border-red-500/20">Ganda</span>
                                )}
                              </td>
                              <td className="p-3 font-bold text-white truncate">{item.Nama}</td>
                              <td className="p-3 text-slate-300 truncate">
                                <div>{item.Sekolah}</div>
                                <span className="text-xs text-slate-400 block">{item.Kecamatan}</span>
                              </td>
                              <td className="p-3">
                                <span className="bg-blue-500/15 text-blue-300 text-xs font-semibold px-2.5 py-1 rounded border border-blue-500/20">
                                  {item.Status_Pegawai}
                                </span>
                              </td>
                              <td className="p-3 text-center text-xs font-medium text-slate-400 font-mono">
                                {item._score} / 13 kolom
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-950/40 px-6 py-4 flex flex-col sm:flex-row gap-4 justify-between items-center border-t border-white/10 font-sans">
          <span className="text-xs font-semibold text-slate-400">
            Terdeteksi <span className="text-purple-350 font-bold">{totalGroups}</span> grup ganda ({totalSecondaryCount} data ganda disarankan hapus).
          </span>
          <div className="flex gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 px-4 py-2 rounded-xl text-sm font-semibold transition"
            >
              Tutup
            </button>
            <button
              onClick={handleDelete}
              disabled={checkedRows.length === 0}
              className="bg-red-600 hover:bg-red-500 text-white px-5 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 shadow-lg shadow-red-900/20 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Trash2 className="h-4 w-4" />
              Hapus Terpilih ({checkedRows.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
