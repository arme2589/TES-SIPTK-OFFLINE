import React, { useState, useEffect } from 'react';
import { GtkData, SekolahDb } from '../types';
import { Plus, X, Search, Check, Save } from 'lucide-react';
import { generateId } from '../utils/dbSeed';

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: GtkData) => void;
  editingItem: GtkData | null;
  sekolahList: SekolahDb[];
  kecamatanList: string[];
  userRole: 'Admin Dinas' | 'Sekolah' | null;
  userIdentifier: string | null;
}

export const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
  sekolahList,
  kecamatanList,
  userRole,
  userIdentifier
}) => {
  if (!isOpen) return null;

  const isDinas = userRole === 'Admin Dinas';

  // Extract school context for school admins
  const defaultKec = !isDinas && userIdentifier ? userIdentifier.split('|')[0] : (kecamatanList[0] || '');
  const defaultSek = !isDinas && userIdentifier ? userIdentifier.split('|')[1] : '';

  // Form State
  const [rowNumber, setRowNumber] = useState<number | undefined>(undefined);
  const [id, setId] = useState<string>('');
  const [kecamatan, setKecamatan] = useState<string>(defaultKec);
  const [sekolah, setSekolah] = useState<string>(defaultSek);
  const [nama, setNama] = useState<string>('');
  const [nik, setNik] = useState<string>('');
  const [statusPegawai, setStatusPegawai] = useState<'PNS' | 'PPPK' | 'PPPKPW' | 'Honorer'>('Honorer');
  const [nip, setNip] = useState<string>('');
  const [golongan, setGolongan] = useState<string>('');
  const [tmtGolongan, setTmtGolongan] = useState<string>('');
  const [jabatan, setJabatan] = useState<string>('');
  const [pendidikan, setPendidikan] = useState<string>('');
  const [bebanTugas, setBebanTugas] = useState<string>('');
  const [tmtKepsek, setTmtKepsek] = useState<string>('');
  const [sertifikasi, setSertifikasi] = useState<'Ya' | 'Belum'>('Belum');
  const [mapel, setMapel] = useState<string>('');
  
  // Custom input states for optional "Lainnya" selections
  const [bebanTugasCategory, setBebanTugasCategory] = useState<string>('');
  const [jenisMapelSelect, setJenisMapelSelect] = useState<string>('');
  const [jenisMapelText, setJenisMapelText] = useState<string>('');
  const [mapelSertifikasiSelect, setMapelSertifikasiSelect] = useState<string>('');
  const [mapelSertifikasiText, setMapelSertifikasiText] = useState<string>('');
  const [noHp, setNoHp] = useState<string>('');

  const [validationError, setValidationError] = useState<string | null>(null);

  // Initialize form fields when opening or switching items
  useEffect(() => {
    if (editingItem) {
      setRowNumber(editingItem.rowNumber);
      setId(editingItem.ID);
      setKecamatan(editingItem.Kecamatan);
      setSekolah(editingItem.Sekolah);
      setNama(editingItem.Nama);
      setNik(editingItem.NIK);
      setStatusPegawai(editingItem.Status_Pegawai);
      setNip(editingItem.NIP);
      setGolongan(editingItem.Golongan || '');
      setTmtGolongan(editingItem.TMT_Golongan || '');
      setJabatan(editingItem.Jabatan || '');
      setPendidikan(editingItem.Pendidikan);
      setSertifikasi(editingItem.Sertifikasi);
      setNoHp(editingItem.No_HP ? editingItem.No_HP.replace(/^62/, '0') : '');
      
      // Parse Beban Tugas "Guru Mapel - xxx"
      const dbBeban = editingItem.Beban_Tugas || "";
      if (dbBeban.startsWith('Guru Mapel - ')) {
        const jenis = dbBeban.replace('Guru Mapel - ', '');
        setBebanTugasCategory('Guru Mapel');
        const standardMapels = ["PAI", "PJOK", "Bahasa Inggris", "IPA", "IPS", "Seni Budaya", "Informatika", "Bahasa Indonesia", "PKn", "Prakarya", "BK"];
        if (standardMapels.includes(jenis)) {
          setJenisMapelSelect(jenis);
          setJenisMapelText('');
        } else {
          setJenisMapelSelect('Lainnya');
          setJenisMapelText(jenis);
        }
      } else {
        setBebanTugasCategory(dbBeban);
        setJenisMapelSelect('');
        setJenisMapelText('');
      }

      // Parse Mapel Sertifikasi
      const dbMapel = editingItem.Mapel || "";
      if (editingItem.Sertifikasi === 'Ya') {
        const standardSertifs = [
          "Guru Kelas SD", "Guru Kelas TK", "PAI", "PJOK", "Bahasa Inggris", 
          "Seni Budaya", "Bahasa Indonesia", "Informatika", "IPS", "IPA", 
          "Pendidikan Pancasila", "Matematika", "Bimbingan dan Konseling", 
          "Geografi", "Ekonomi", "Sosiologi", "Antropologi", "Fisika", "Kimia", "Biologi", "Sejarah"
        ];
        if (standardSertifs.includes(dbMapel)) {
          setMapelSertifikasiSelect(dbMapel);
          setMapelSertifikasiText('');
        } else if (dbMapel) {
          setMapelSertifikasiSelect('Lainnya');
          setMapelSertifikasiText(dbMapel);
        } else {
          setMapelSertifikasiSelect('');
          setMapelSertifikasiText('');
        }
      } else {
        setMapelSertifikasiSelect('');
        setMapelSertifikasiText('');
      }

      setTmtKepsek(editingItem.TMT_Kepsek || '');
    } else {
      // Default Add Mode reset
      setRowNumber(undefined);
      setId('');
      setKecamatan(defaultKec);
      setSekolah(defaultSek);
      setNama('');
      setNik('');
      setStatusPegawai('Honorer');
      setNip('');
      setGolongan('');
      setTmtGolongan('');
      setJabatan('');
      setPendidikan('');
      setBebanTugasCategory('');
      setJenisMapelSelect('');
      setJenisMapelText('');
      setNoHp('');
      setSertifikasi('Belum');
      setMapelSertifikasiSelect('');
      setMapelSertifikasiText('');
      setTmtKepsek('');
    }
    setValidationError(null);
  }, [editingItem, isOpen, defaultKec, defaultSek]);

  // Clean values on status change
  useEffect(() => {
    if (statusPegawai === 'Honorer') {
      setNip('');
      setGolongan('');
      setTmtGolongan('');
      setJabatan('');
    } else if (statusPegawai === 'PPPKPW') {
      setGolongan('');
      setTmtGolongan('');
    }
  }, [statusPegawai]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Dynamic validations
    if (!nama.trim()) {
      setValidationError("Nama Lengkap wajib diisi!");
      return;
    }
    if (nik.length !== 16) {
      setValidationError("NIK wajib bernilai tepat 16 digit angka!");
      return;
    }
    if (['PNS', 'PPPK', 'PPPKPW'].includes(statusPegawai) && !nip.trim()) {
      setValidationError("NIP wajib bagi pegawai negeri / PPPK!");
      return;
    }
    if (['PNS', 'PPPK'].includes(statusPegawai) && !golongan) {
      setValidationError("Pangkat/Golongan harus dipilih bagi pendidik ASN PNS/PPPK!");
      return;
    }
    if (['PNS', 'PPPK'].includes(statusPegawai) && !tmtGolongan) {
      setValidationError("TMT Golongan harus dilampirkan bagi pendidik ASN PNS/PPPK!");
      return;
    }
    if (statusPegawai !== 'Honorer' && !jabatan) {
      setValidationError("Isian Jabatan Fungsional/Struktural wajib diisi bagi ASN!");
      return;
    }
    if (!pendidikan) {
      setValidationError("Pendidikan Terakhir wajib ditentukan!");
      return;
    }
    if (!bebanTugasCategory) {
      setValidationError("Beban Tugas harus dipilih salah satu!");
      return;
    }

    // Parse final Beban Tugas
    let finalBeban = bebanTugasCategory;
    if (bebanTugasCategory === 'Guru Mapel') {
      if (!jenisMapelSelect) {
        setValidationError("Mata pelajaran penugasan wajib dipilih!");
        return;
      }
      const specific = jenisMapelSelect === 'Lainnya' ? jenisMapelText.trim() : jenisMapelSelect;
      if (!specific) {
        setValidationError("Isi nama mata pelajaran penugasan khusus!");
        return;
      }
      finalBeban = `Guru Mapel - ${specific}`;
    }

    // Parse Headmaster validator TMT
    if (bebanTugasCategory === 'Kepala Sekolah' && !tmtKepsek) {
      setValidationError("TMT awal sebagai Kepala Sekolah wajib diisi!");
      return;
    }

    // Parse final Mapel Sertifikasi
    let finalMapel = '';
    if (sertifikasi === 'Ya') {
      if (!mapelSertifikasiSelect) {
        setValidationError("Mata pelajaran bidang sertifikasi wajib dipilih!");
        return;
      }
      finalMapel = mapelSertifikasiSelect === 'Lainnya' ? mapelSertifikasiText.trim() : mapelSertifikasiSelect;
      if (!finalMapel) {
        setValidationError("Isi nama bidang perlengkapan sertifikasi Anda!");
        return;
      }
    }

    // Format WhatsApp Phone
    let formattedPhone = noHp.trim();
    if (!formattedPhone) {
      setValidationError("Nomor Handphone wajib diisi!");
      return;
    }
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '62' + formattedPhone.slice(1);
    } else if (!formattedPhone.startsWith('62')) {
      formattedPhone = '62' + formattedPhone;
    }

    if (formattedPhone.length < 10) {
      setValidationError("Nomor Handphone penugasan tidak valid (terlalu pendek)!");
      return;
    }

    const payload: GtkData = {
      ID: id || generateId(),
      Kecamatan: kecamatan,
      Sekolah: sekolah,
      Nama: nama.trim(),
      NIP: nip.trim(),
      Status_Pegawai: statusPegawai,
      NIK: nik.trim(),
      Golongan: statusPegawai === 'Honorer' || statusPegawai === 'PPPKPW' ? '' : golongan,
      TMT_Golongan: statusPegawai === 'Honorer' || statusPegawai === 'PPPKPW' ? '' : tmtGolongan,
      Jabatan: statusPegawai === 'Honorer' ? '' : jabatan,
      Pendidikan: pendidikan,
      Beban_Tugas: finalBeban,
      TMT_Kepsek: bebanTugasCategory === 'Kepala Sekolah' ? tmtKepsek : '',
      Sertifikasi: sertifikasi,
      Mapel: sertifikasi === 'Ya' ? finalMapel : '',
      No_HP: formattedPhone,
      Created_At: editingItem?.Created_At || new Date().toISOString(),
      rowNumber: rowNumber
    };

    onSave(payload);
  };

  const filteredSekolahs = sekolahList.filter(s => s.Kecamatan === kecamatan);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-white/10 flex flex-col scale-100 transition-all text-slate-200">
        
        {/* Header */}
        <div className="bg-slate-950/40 px-6 py-4 flex justify-between items-center text-white border-b border-white/10">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Plus className="h-5 w-5 text-blue-400" />
              <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                {editingItem ? 'Edit Personel PTK' : 'Tambah Personel PTK Baru'}
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Database Lokal Offline SI PTK DIKBUD</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition duration-200">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
          {validationError && (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-200 text-sm">
              <p className="font-bold">⚠️ Gagal Validasi Form:</p>
              <p className="mt-1 font-sans">{validationError}</p>
            </div>
          )}

          {/* Location Assignment - For Admin Dinas */}
          {isDinas ? (
            <div className="bg-white/5 p-4 rounded-xl border border-white/10 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Penugasan Kecamatan</label>
                <select
                  value={kecamatan}
                  onChange={(e) => {
                    setKecamatan(e.target.value);
                    setSekolah('');
                  }}
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                >
                  <option value="" className="bg-slate-900 text-slate-100">-- Pilih Kecamatan --</option>
                  {kecamatanList.map(kec => (
                    <option key={kec} value={kec} className="bg-slate-900 text-slate-100">{kec}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nama Sekolah Instansi</label>
                <select
                  value={sekolah}
                  onChange={(e) => setSekolah(e.target.value)}
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                >
                  <option value="" className="bg-slate-900 text-slate-100">-- Pilih Sekolah --</option>
                  {filteredSekolahs.map(sek => (
                    <option key={sek.ID} value={sek.Nama_Sekolah} className="bg-slate-900 text-slate-100 uppercase">{sek.Nama_Sekolah}</option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider">Unit Penugasan Aktif:</span>
              <span className="text-sm font-bold text-white uppercase mt-0.5 block">{sekolah} ({kecamatan})</span>
            </div>
          )}

          {/* Identitas Pribadi */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nama Lengkap (Serta Gelar)</label>
              <input
                type="text"
                placeholder="Contoh: Drs. H. Andi Syamsul, M.Pd"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">NIK (KTP - 16 Digit)</label>
              <input
                type="text"
                maxLength={16}
                placeholder="73020xxxxxxxxxxx"
                value={nik}
                onChange={(e) => setNik(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono placeholder:text-slate-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Status Kepegawaian</label>
              <select
                value={statusPegawai}
                onChange={(e) => setStatusPegawai(e.target.value as any)}
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              >
                <option value="PNS" className="bg-slate-900 text-slate-100">PNS (Pegawai Negeri Sipil)</option>
                <option value="PPPK" className="bg-slate-900 text-slate-100">PPPK (Pegawai Pemerintah Perjanjian Kerja)</option>
                <option value="PPPKPW" className="bg-slate-900 text-slate-100">PPPKPW (PPPK Paruh Waktu)</option>
                <option value="Honorer" className="bg-slate-900 text-slate-100">Honorer / Sukarela</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                NIP (18 Digit)
                {['PNS', 'PPPK', 'PPPKPW'].includes(statusPegawai) && <span className="text-red-400 ml-1 font-bold">*</span>}
              </label>
              <input
                type="text"
                maxLength={18}
                placeholder={['PNS', 'PPPK', 'PPPKPW'].includes(statusPegawai) ? "19xxxxxxxxxxxxxxxx" : "Tidak wajib bagi honorer"}
                value={nip}
                onChange={(e) => setNip(e.target.value.replace(/[^0-9]/g, ''))}
                disabled={statusPegawai === 'Honorer'}
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono placeholder:text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed"
                required={['PNS', 'PPPK', 'PPPKPW'].includes(statusPegawai)}
              />
            </div>
          </div>

          {/* Kepangkatan & Pendidikan - Hidden for Honorer altogether */}
          {statusPegawai !== 'Honorer' && (
            <div className="border-t border-white/5 pt-5 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
              {statusPegawai !== 'PPPKPW' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Pangkat/Golongan Ruang</label>
                    <select
                      value={golongan}
                      onChange={(e) => setGolongan(e.target.value)}
                      className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    >
                      <option value="" className="bg-slate-900 text-slate-100">-- Pilih --</option>
                      {statusPegawai === 'PPPK' ? (
                        <>
                          <option value="XVII" className="bg-slate-900 text-slate-100">XVII (PPPK)</option>
                          <option value="XVI" className="bg-slate-900 text-slate-100">XVI (PPPK)</option>
                          <option value="XV" className="bg-slate-900 text-slate-100">XV (PPPK)</option>
                          <option value="XIV" className="bg-slate-900 text-slate-100">XIV (PPPK)</option>
                          <option value="XIII" className="bg-slate-900 text-slate-100">XIII (PPPK)</option>
                          <option value="XII" className="bg-slate-900 text-slate-100">XII (PPPK)</option>
                          <option value="XI" className="bg-slate-900 text-slate-100">XI (PPPK)</option>
                          <option value="X" className="bg-slate-900 text-slate-100">X (PPPK)</option>
                          <option value="IX" className="bg-slate-900 text-slate-100">IX (PPPK - S1 Standard)</option>
                          <option value="VIII" className="bg-slate-900 text-slate-100">VIII (PPPK)</option>
                          <option value="VII" className="bg-slate-900 text-slate-100">VII (PPPK)</option>
                          <option value="VI" className="bg-slate-900 text-slate-100">VI (PPPK)</option>
                          <option value="V" className="bg-slate-900 text-slate-100">V (PPPK)</option>
                          <option value="IV" className="bg-slate-900 text-slate-100">IV (PPPK)</option>
                          <option value="III" className="bg-slate-900 text-slate-100">III (PPPK)</option>
                          <option value="II" className="bg-slate-900 text-slate-100">II (PPPK)</option>
                          <option value="I" className="bg-slate-900 text-slate-100">I (PPPK)</option>
                        </>
                      ) : (
                        <>
                          <option value="IV/e" className="bg-slate-900 text-slate-100">Pembina Utama, IV/e</option>
                          <option value="IV/d" className="bg-slate-900 text-slate-100">Pembina Utama Madya, IV/d</option>
                          <option value="IV/c" className="bg-slate-900 text-slate-100">Pembina Utama Muda, IV/c</option>
                          <option value="IV/b" className="bg-slate-900 text-slate-100">Pembina Tingkat I, IV/b</option>
                          <option value="IV/a" className="bg-slate-900 text-slate-100">Pembina, IV/a</option>
                          <option value="III/d" className="bg-slate-900 text-slate-100">Penata Tingkat I, III/d</option>
                          <option value="III/c" className="bg-slate-900 text-slate-100">Penata, III/c</option>
                          <option value="III/b" className="bg-slate-900 text-slate-100">Penata Muda Tingkat I, III/b</option>
                          <option value="III/a" className="bg-slate-900 text-slate-100">Penata Muda, III/a</option>
                          <option value="II/d" className="bg-slate-900 text-slate-100">Pengatur Tingkat I, II/d</option>
                          <option value="II/c" className="bg-slate-900 text-slate-100">Pengatur, II/c</option>
                          <option value="II/b" className="bg-slate-900 text-slate-100">Pengatur Muda Tingkat I, II/b</option>
                          <option value="II/a" className="bg-slate-900 text-slate-100">Pengatur Muda, II/a</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">TMT Pangkat/Golongan</label>
                    <input
                      type="date"
                      value={tmtGolongan}
                      onChange={(e) => setTmtGolongan(e.target.value)}
                      className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                </>
              )}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Jabatan Fungsional / Struktural</label>
                <select
                  value={jabatan}
                  onChange={(e) => setJabatan(e.target.value)}
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                >
                  <option value="" className="bg-slate-900 text-slate-100">-- Pilih --</option>
                  <option value="Guru Ahli Pertama" className="bg-slate-900 text-slate-100">Guru Ahli Pertama</option>
                  <option value="Guru Ahli Muda" className="bg-slate-900 text-slate-100">Guru Ahli Muda</option>
                  <option value="Guru Ahli Madya" className="bg-slate-900 text-slate-100">Guru Ahli Madya</option>
                  <option value="Guru Ahli Utama" className="bg-slate-900 text-slate-100">Guru Ahli Utama</option>
                  <option value="Operator Layanan Operasional" className="bg-slate-900 text-slate-100">Operator Layanan Operasional</option>
                  <option value="Pengelola Layanan Operasional" className="bg-slate-900 text-slate-100">Pengelola Layanan Operasional</option>
                  <option value="Penata Layanan Operasional" className="bg-slate-900 text-slate-100">Penata Layanan Operasional</option>
                </select>
              </div>
            </div>
          )}

          {/* Pendidikan & Beban Tugas */}
          <div className="border-t border-white/5 pt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Pendidikan Terakhir</label>
              <select
                value={pendidikan}
                onChange={(e) => setPendidikan(e.target.value)}
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              >
                <option value="" className="bg-slate-900 text-slate-100">-- Pilih Pendidikan --</option>
                <option value="SMA" className="bg-slate-900 text-slate-100">SMA / Sederajat</option>
                <option value="D1" className="bg-slate-900 text-slate-100">D1</option>
                <option value="D2" className="bg-slate-900 text-slate-100">D2</option>
                <option value="D3" className="bg-slate-900 text-slate-100">D3</option>
                <option value="D4" className="bg-slate-900 text-slate-100">D4</option>
                <option value="S1" className="bg-slate-900 text-slate-100">S1 / Diploma IV (Standard)</option>
                <option value="S2" className="bg-slate-900 text-slate-100">S2 / Magister</option>
                <option value="S3" className="bg-slate-900 text-slate-100">S3 / Doktor</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Beban Tugas Penugasan</label>
              <select
                value={bebanTugasCategory}
                onChange={(e) => setBebanTugasCategory(e.target.value)}
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              >
                <option value="" className="bg-slate-900 text-slate-100">-- Pilih Tugas --</option>
                <option value="Kepala Sekolah" className="bg-slate-900 text-slate-100">Kepala Sekolah</option>
                <option value="PLT. Kepala Sekolah" className="bg-slate-900 text-slate-100">PLT. Kepala Sekolah</option>
                <option value="Guru Kelas" className="bg-slate-900 text-slate-100">Guru Kelas (SD)</option>
                <option value="Guru Kelas TK" className="bg-slate-900 text-slate-100">Guru Kelas TK</option>
                <option value="Guru Mapel" className="bg-slate-900 text-slate-100">Guru Mapel (PAI/PJOK/BK/Smp)</option>
                <option value="Guru BK" className="bg-slate-900 text-slate-100">Guru Bimbingan Konseling (BK)</option>
                <option value="Kepala Tata Usaha (TU)" className="bg-slate-900 text-slate-100">Kepala Tata Usaha (TU)</option>
                <option value="Staf Administrasi (TU)" className="bg-slate-900 text-slate-100">Staf Administrasi (TU)</option>
                <option value="Laboran" className="bg-slate-900 text-slate-100">Laboran</option>
                <option value="Pustakawan" className="bg-slate-900 text-slate-100">Pustakawan</option>
                <option value="Operator Sekolah" className="bg-slate-900 text-slate-100">Operator Sekolah</option>
                <option value="Bujang Sekolah" className="bg-slate-900 text-slate-100">Bujang Sekolah</option>
                <option value="Petugas Kebersihan" className="bg-slate-900 text-slate-100">Petugas Kebersihan</option>
                <option value="Satpam" className="bg-slate-900 text-slate-100 font-sans">Satpam (Petugas Keamanan)</option>
              </select>
            </div>

            {/* If Guru Mapel Selected - Show Subjects Subfields */}
            {bebanTugasCategory === 'Guru Mapel' && (
              <div className="md:col-span-2 bg-amber-500/10 p-4 rounded-xl border border-amber-500/20 text-slate-250 flex flex-col gap-3">
                <div>
                  <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">Kategori Mapel Tugas</label>
                  <select
                    value={jenisMapelSelect}
                    onChange={(e) => setJenisMapelSelect(e.target.value)}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-2.5 py-1.5 text-sm text-slate-200 focus:outline-none"
                    required
                  >
                    <option value="" className="bg-slate-900 text-slate-100">-- Pilih Mapel --</option>
                    <option value="PAI" className="bg-slate-900 text-slate-100">Pendidikan Agama Islam (PAI)</option>
                    <option value="PJOK" className="bg-slate-900 text-slate-100">Pend. Jasmani Olahraga Kesehatan (PJOK)</option>
                    <option value="Bahasa Inggris" className="bg-slate-900 text-slate-100">Bahasa Inggris</option>
                    <option value="IPA" className="bg-slate-900 text-slate-100 font-sans">Ilmu Pengetahuan Alam (IPA)</option>
                    <option value="IPS" className="bg-slate-900 text-slate-100 font-sans">Ilmu Pengetahuan Sosial (IPS)</option>
                    <option value="Seni Budaya" className="bg-slate-900 text-slate-100">Seni Budaya</option>
                    <option value="Informatika" className="bg-slate-900 text-slate-100">Informatika</option>
                    <option value="Bahasa Indonesia" className="bg-slate-900 text-slate-100">Bahasa Indonesia</option>
                    <option value="PKn" className="bg-slate-900 text-slate-100">Pendidikan Pancasila / PKn</option>
                    <option value="Prakarya" className="bg-slate-900 text-slate-100">Prakarya</option>
                    <option value="BK" className="bg-slate-900 text-slate-100">Bimbingan Konseling (BK)</option>
                    <option value="Lainnya" className="bg-slate-900 text-slate-100">Lainnya...</option>
                  </select>
                </div>
                {jenisMapelSelect === 'Lainnya' && (
                  <div>
                    <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">Nama Mapel Sampingan/Lainnya</label>
                    <input
                      type="text"
                      placeholder="Masukkan nama mata pelajaran..."
                      value={jenisMapelText}
                      onChange={(e) => setJenisMapelText(e.target.value)}
                      className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-2.5 py-1.5 text-sm text-slate-200 focus:outline-none placeholder:text-slate-555"
                      required
                    />
                  </div>
                )}
              </div>
            )}

            {/* If Headmaster Selected - Show TMT Kepsek Date Field */}
            {bebanTugasCategory === 'Kepala Sekolah' && (
              <div className="md:col-span-2 bg-blue-500/10 p-4 rounded-xl border border-blue-500/20 text-slate-250">
                <label className="block text-xs font-bold text-blue-300 uppercase tracking-wider mb-1">TMT Awal Sebagai Kepala Sekolah</label>
                <input
                  type="date"
                  value={tmtKepsek}
                  onChange={(e) => setTmtKepsek(e.target.value)}
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"
                  required
                />
                <span className="text-[10px] text-blue-350 font-medium mt-1.5 block leading-normal">TMT ini digunakan untuk menghitung batas masa jabatan Kepala Sekolah maksimum (berdasarkan kelipatan 4 tahun Dinas DIKBUD).</span>
              </div>
            )}
          </div>

          {/* Sertifikasi Pegawai */}
          {['Kepala Sekolah', 'PLT. Kepala Sekolah', 'Guru Kelas', 'Guru Kelas TK', 'Guru Mapel', 'Guru BK'].includes(bebanTugasCategory) && (
            <div className="border-t border-white/5 pt-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Apakah Sudah Sertifikasi Guru?</label>
                  <select
                    value={sertifikasi}
                    onChange={(e) => {
                      setSertifikasi(e.target.value as any);
                      if (e.target.value === 'Belum') {
                        setMapelSertifikasiSelect('');
                        setMapelSertifikasiText('');
                      }
                    }}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Belum" className="bg-slate-900 text-slate-100">Belum Sertifikasi</option>
                    <option value="Ya" className="bg-slate-900 text-slate-100">Ya (Sudah Lulus PPG/Sertifikasi)</option>
                  </select>
                </div>

                {sertifikasi === 'Ya' && (
                  <div className="animate-fade-in">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Mata Pelajaran Sertifikasi</label>
                    <select
                      value={mapelSertifikasiSelect}
                      onChange={(e) => setMapelSertifikasiSelect(e.target.value)}
                      className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    >
                      <option value="" className="bg-slate-900 text-slate-100 font-sans">-- Pilih Bidang Sertifikasi --</option>
                      <option value="Guru Kelas SD" className="bg-slate-900 text-slate-100">Guru Kelas SD</option>
                      <option value="Guru Kelas TK" className="bg-slate-900 text-slate-100">Guru Kelas TK</option>
                      <option value="PAI" className="bg-slate-900 text-slate-100">Pendidikan Agama Islam (PAI)</option>
                      <option value="PJOK" className="bg-slate-900 text-slate-100">PJOK / Olahraga</option>
                      <option value="Bahasa Inggris" className="bg-slate-900 text-slate-100">Bahasa Inggris</option>
                      <option value="Seni Budaya" className="bg-slate-900 text-slate-100">Seni Budaya</option>
                      <option value="Bahasa Indonesia" className="bg-slate-900 text-slate-100">Bahasa Indonesia</option>
                      <option value="Informatika" className="bg-slate-900 text-slate-100">Informatika</option>
                      <option value="IPS" className="bg-slate-900 text-slate-100">IPS</option>
                      <option value="IPA" className="bg-slate-900 text-slate-100">IPA</option>
                      <option value="Pendidikan Pancasila" className="bg-slate-900 text-slate-100">Pendidikan Pancasila</option>
                      <option value="Matematika" className="bg-slate-900 text-slate-100">Matematika</option>
                      <option value="Bimbingan dan Konseling" className="bg-slate-900 text-slate-100">Bimbingan dan Konseling</option>
                      <option value="Geografi" className="bg-slate-900 text-slate-100">Geografi</option>
                      <option value="Ekonomi" className="bg-slate-900 text-slate-100">Ekonomi</option>
                      <option value="Sosiologi" className="bg-slate-900 text-slate-100">Sosiologi</option>
                      <option value="Antropologi" className="bg-slate-900 text-slate-100">Antropologi</option>
                      <option value="Fisika" className="bg-slate-900 text-slate-100">Fisika</option>
                      <option value="Kimia" className="bg-slate-900 text-slate-100">Kimia</option>
                      <option value="Biologi" className="bg-slate-900 text-slate-100">Biologi</option>
                      <option value="Sejarah" className="bg-slate-900 text-slate-100 font-sans">Sejarah</option>
                      <option value="Lainnya" className="bg-slate-900 text-slate-100">Lainnya...</option>
                    </select>
                  </div>
                )}
              </div>

              {sertifikasi === 'Ya' && mapelSertifikasiSelect === 'Lainnya' && (
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 animate-fade-in text-slate-200">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Sebutkan Mapel Sertifikasi Lainnya</label>
                  <input
                    type="text"
                    placeholder="Contoh: Pendidikan Luar Biasa (PLB)"
                    value={mapelSertifikasiText}
                    onChange={(e) => setMapelSertifikasiText(e.target.value)}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-555"
                    required
                  />
                </div>
              )}
            </div>
          )}

          {/* Kontak Pegawai */}
          <div className="border-t border-white/5 pt-5">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">No. HP / WhatsApp Aktif</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold text-sm bg-white/5 border-r border-white/10 rounded-l-xl h-full px-3">
                +62 / 0
              </span>
              <input
                type="text"
                maxLength={13}
                placeholder="81244556677"
                value={noHp}
                onChange={(e) => setNoHp(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl pl-24 pr-3 py-2 text-sm text-slate-200 focus:outline-none font-mono placeholder:text-slate-500"
                required
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 leading-normal">Nomor HP akan diformat otomatis oleh sistem dengan kode negara Indonesia (62) untuk mendukung interaksi tombol obrolan WhatsApp Instan Admin Dinas.</p>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="bg-slate-950/40 px-6 py-4 flex justify-end gap-3 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 px-4 py-2 rounded-xl text-sm font-semibold transition"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 shadow-lg shadow-blue-900/10 border border-blue-500/20"
          >
            <Save className="h-4 w-4" />
            {editingItem ? 'Perbarui Data PTK' : 'Simpan Data PTK'}
          </button>
        </div>
      </div>
    </div>
  );
};
