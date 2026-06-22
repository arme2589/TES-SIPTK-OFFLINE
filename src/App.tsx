import React, { useState, useEffect } from 'react';
import { DatabaseState, GtkData, SekolahDb } from './types';
import { 
  initializeEngineDb, 
  saveEngineDb, 
  prepareAnalyticGtkList, 
  sortGtkList, 
  detectDuplicates 
} from './utils/dbEngine';
import { 
  loadDatabaseFromExcel, 
  exportDatabaseToExcel, 
  exportDatabaseToCsvZip 
} from './utils/excelHelper';
import { 
  Upload, 
  Database, 
  Plus, 
  Search, 
  Building, 
  Users, 
  Settings, 
  Key, 
  LogOut, 
  Printer, 
  Undo2, 
  AlertTriangle, 
  Trash2, 
  Edit, 
  Phone, 
  MapPin, 
  School, 
  CheckCircle2, 
  BadgeAlert,
  FileSpreadsheet,
  Layers,
  Save,
  Lock,
  Info,
  RefreshCw
} from 'lucide-react';
import { FormModal } from './components/FormModal';
import { DuplicateModal } from './components/DuplicateModal';
import { ManageSchoolModal, ManagePasswordsModal } from './components/DinasModals';
import { CetakModal, CetakConfig } from './components/CetakModal';

export default function App() {
  // Database States
  const [db, setDb] = useState<DatabaseState>(() => initializeEngineDb());
  const [unsavedChanges, setUnsavedChanges] = useState<boolean>(false);

  // Auth States
  const [user, setUser] = useState<{ role: 'Admin Dinas' | 'Sekolah'; identifier: string } | null>(null);
  const [loginRole, setLoginRole] = useState<'Admin Dinas' | 'Sekolah'>('Sekolah');
  const [loginKecamatan, setLoginKecamatan] = useState<string>('');
  const [loginSekolah, setLoginSekolah] = useState<string>('');
  const [loginUsername, setLoginUsername] = useState<string>('admin');
  const [loginPassword, setLoginPassword] = useState<string>('');

  // Local App Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterJenjang, setFilterJenjang] = useState<string>('');
  const [filterKec, setFilterKec] = useState<string>('');
  const [filterSek, setFilterSek] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterBeban, setFilterBeban] = useState<string>('');
  const [filterJenisMapel, setFilterJenisMapel] = useState<string>('');
  const [filterKondisi, setFilterKondisi] = useState<string>('');
  const [filterSertifikasi, setFilterSertifikasi] = useState<string>('');

  // Modals Toggles State
  const [isOpenForm, setIsOpenForm] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<GtkData | null>(null);
  const [isOpenDuplicate, setIsOpenDuplicate] = useState<boolean>(false);
  const [isOpenSchool, setIsSchoolOpen] = useState<boolean>(false);
  const [isOpenPassword, setIsPasswordOpen] = useState<boolean>(false);
  const [isOpenCetak, setIsCetakOpen] = useState<boolean>(false);

  // File Upload Status Ref
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [importNotice, setImportNotice] = useState<string | null>(null);

  // Synced helper arrays
  const [kecamatansList, setKecamatansList] = useState<string[]>([]);
  const [selectedKecSchools, setSelectedKecSchools] = useState<SekolahDb[]>([]);

  // Calculate unique list of kecamatan on database change
  useEffect(() => {
    const list = Array.from(new Set(db.sekolahList.map(s => s.Kecamatan))).sort();
    setKecamatansList(list);
  }, [db.sekolahList]);

  // Sync login school options depending on selected district
  useEffect(() => {
    if (loginKecamatan) {
      setSelectedKecSchools(db.sekolahList.filter(s => s.Kecamatan === loginKecamatan));
    } else {
      setSelectedKecSchools([]);
    }
    setLoginSekolah('');
  }, [loginKecamatan, db.sekolahList]);

  // Handle Drag & Drop Excel upload to database state
  const handleFileImport = async (file: File) => {
    setImportNotice(null);
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (fileExt !== 'xlsx' && fileExt !== 'xls' && fileExt !== 'csv') {
      alert("Format berkas tidak didukung! Pastikan Anda mengunggah File Excel (.xlsx) atau CSV.");
      return;
    }

    try {
      const buffer = await file.arrayBuffer();
      // If it is CSV, we use parser or support sheets
      const parsedDb = loadDatabaseFromExcel(buffer);
      
      // Basic validation
      if (parsedDb.gtkList.length === 0 && parsedDb.sekolahList.length === 0) {
        alert("Validasi Gagal! Tidak ditemukan data yang relevan di sheet 'GTK_Data' atau 'Sekolah_DB' pada file Excel.");
        return;
      }

      setDb(parsedDb);
      saveEngineDb(parsedDb);
      setUnsavedChanges(true);
      setImportNotice(`✓ Database Berhasil Dimuat: ${parsedDb.gtkList.length} PTK dan ${parsedDb.sekolahList.length} Sekolah terdeteksi.`);
    } catch (err: any) {
      console.error(err);
      alert("Gagal membaca file! Periksa apakah file Excel Anda terproteksi atau korup. Detail: " + err.message);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileImport(e.dataTransfer.files[0]);
    }
  };

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginRole === 'Sekolah') {
      if (!loginKecamatan || !loginSekolah) {
        alert('Harap pilih unit Kecamatan dan Sekolah terlebih dahulu!');
        return;
      }
      const schoolKey = `${loginKecamatan}|${loginSekolah}`;
      const found = db.penggunaList.find(p => p.Role === 'Sekolah' && p.Identifier === schoolKey);
      
      if (found && found.Password === loginPassword) {
        setUser({ role: 'Sekolah', identifier: schoolKey });
        // Auto filter list to their school default
        setFilterKec(loginKecamatan);
        setFilterSek(loginSekolah);
      } else if (!found && loginPassword === 'dikerja') {
        // Fallback standard for schools added in fly master list
        setUser({ role: 'Sekolah', identifier: schoolKey });
        setFilterKec(loginKecamatan);
        setFilterSek(loginSekolah);
      } else {
        alert('Password login salah! Default password unit baru adalah: dikerja');
      }
    } else {
      const matched = db.penggunaList.find(p => p.Role === 'Admin Dinas' && p.Identifier === 'admin');
      const standardPass = matched ? matched.Password : 'ammatoa';
      if (loginUsername === 'admin' && loginPassword === standardPass) {
        setUser({ role: 'Admin Dinas', identifier: 'admin' });
      } else {
        alert('Password Admin Dinas salah! Silakan coba password bawaan: ammatoa');
      }
    }
    setLoginPassword('');
  };

  const handleLogout = () => {
    setUser(null);
    setSearchQuery('');
    setFilterBeban('');
    setFilterKec('');
    setFilterSek('');
    setFilterStatus('');
    setFilterKondisi('');
    setFilterSertifikasi('');
    setFilterJenjang('');
  };

  // DB Mutations handlers
  const handleSaveGtkPerson = (item: GtkData) => {
    setDb(prev => {
      let newList = [...prev.gtkList];
      if (item.rowNumber !== undefined) {
        // Edit mode
        newList = newList.map(x => x.rowNumber === item.rowNumber ? item : x);
      } else {
        // Add mode
        // Determine correct rowNumber representing next physical Excel row placement
        const nextRow = newList.length > 0 ? (Math.max(...newList.map(x => x.rowNumber || 1)) + 1) : 2;
        newList.push({ ...item, rowNumber: nextRow });
      }

      const nextDb = { ...prev, gtkList: newList };
      saveEngineDb(nextDb);
      setUnsavedChanges(true);
      return nextDb;
    });
    setIsOpenForm(false);
    setEditingItem(null);
  };

  const handleDeleteGtkPerson = (rowNumber: number, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data guru ${name} secara permanen? Perubahan ini akan memicu perlunya menyimpan spreadsheet lokal kembali.`)) {
      setDb(prev => {
        const newList = prev.gtkList.filter(x => x.rowNumber !== rowNumber);
        const nextDb = { ...prev, gtkList: newList };
        saveEngineDb(nextDb);
        setUnsavedChanges(true);
        return nextDb;
      });
    }
  };

  const handleAddSchool = (newSch: SekolahDb) => {
    // Check if school already exists
    const exists = db.sekolahList.some(s => s.Kecamatan === newSch.Kecamatan && s.Nama_Sekolah === newSch.Nama_Sekolah);
    if (exists) {
      alert("Nama unit sekolah tersebut sudah terdafatar di Kecamatan yang sama.");
      return;
    }

    setDb(prev => {
      const nextList = [...prev.sekolahList, newSch];
      // Auto register standard credentials for the brand new school unit
      const nextCreds = [...prev.penggunaList, {
        Role: 'Sekolah' as any,
        Identifier: `${newSch.Kecamatan}|${newSch.Nama_Sekolah}`,
        Password: 'dikerja'
      }];
      const nextDb = { ...prev, sekolahList: nextList, penggunaList: nextCreds };
      saveEngineDb(nextDb);
      setUnsavedChanges(true);
      return nextDb;
    });
  };

  const handleDeleteSchool = (id: string) => {
    const matched = db.sekolahList.find(s => s.ID === id);
    if (!matched) return;

    setDb(prev => {
      const nextList = prev.sekolahList.filter(s => s.ID !== id);
      const schoolKey = `${matched.Kecamatan}|${matched.Nama_Sekolah}`;
      const nextCreds = prev.penggunaList.filter(p => p.Identifier !== schoolKey);
      const nextDb = { ...prev, sekolahList: nextList, penggunaList: nextCreds };
      saveEngineDb(nextDb);
      setUnsavedChanges(true);
      return nextDb;
    });
  };

  const handleSaveCredentials = (role: 'Admin Dinas' | 'Sekolah', identifier: string, newPass: string) => {
    setDb(prev => {
      let isRegistered = false;
      const nextList = prev.penggunaList.map(p => {
        if (p.Role === role && p.Identifier === identifier) {
          isRegistered = true;
          return { ...p, Password: newPass };
        }
        return p;
      });

      if (!isRegistered) {
        nextList.push({ Role: role, Identifier: identifier, Password: newPass });
      }

      const nextDb = { ...prev, penggunaList: nextList };
      saveEngineDb(nextDb);
      setUnsavedChanges(true);
      return nextDb;
    });
  };

  const handleResolveDuplicatesMassive = (rowNumbers: number[]) => {
    setDb(prev => {
      const newList = prev.gtkList.filter(item => item.rowNumber === undefined || !rowNumbers.includes(item.rowNumber));
      const nextDb = { ...prev, gtkList: newList };
      saveEngineDb(nextDb);
      setUnsavedChanges(true);
      return nextDb;
    });
    setIsOpenDuplicate(false);
    alert(`Sukses memotong ${rowNumbers.length} baris data ganda. Silakan amankan file database Anda.`);
  };

  // Excel trigger
  const handleSaveDatabaseLocal = () => {
    try {
      exportDatabaseToExcel(db);
      setUnsavedChanges(false);
    } catch (e: any) {
      alert("Gagal mengunduh file Excel! Harap periksa privilese browser. Detail: " + e.message);
    }
  };

  // Analyzed active list processing
  const analyticList = prepareAnalyticGtkList(db.gtkList);

  // FILTER LOGIC
  const activeUserIsDinas = user?.role === 'Admin Dinas';
  const displayKecamatans = kecamatansList;
  const filteredSchoolOptions = db.sekolahList.filter(s => !filterKec || s.Kecamatan === filterKec);

  // Apply filters on listing
  let displayList = analyticList;
  if (!activeUserIsDinas && user) {
    // School admin can only lock into their unit identifier data
    const district = user.identifier.split('|')[0];
    const unitSch = user.identifier.split('|')[1];
    displayList = displayList.filter(item => item.Kecamatan === district && item.Sekolah === unitSch);
  }

  // General Filter Parameters
  if (activeUserIsDinas) {
    if (filterKec) displayList = displayList.filter(item => item.Kecamatan === filterKec);
    if (filterSek) displayList = displayList.filter(item => item.Sekolah === filterSek);
    
    // Jenjang filters
    if (filterJenjang) {
      displayList = displayList.filter(item => {
        const schUpp = (item.Sekolah || "").toUpperCase();
        if (filterJenjang === 'TK') return schUpp.includes('TK ') || schUpp.includes('TKN ');
        if (filterJenjang === 'SD') return schUpp.includes('SD ') || schUpp.includes('SDN ');
        if (filterJenjang === 'SMP') return schUpp.includes('SMP ') || schUpp.includes('SMPN ');
        return true;
      });
    }
  }

  if (filterStatus) {
    if (filterStatus === 'PPPK_ALL') {
      displayList = displayList.filter(item => ["PPPK", "PPPKPW"].includes(item.Status_Pegawai));
    } else {
      displayList = displayList.filter(item => item.Status_Pegawai === filterStatus);
    }
  }

  if (filterBeban) {
    if (filterBeban === 'Kepsek_ALL') {
      displayList = displayList.filter(item => ['Kepala Sekolah', 'PLT. Kepala Sekolah'].includes(item.Beban_Tugas));
    } else if (filterBeban === 'Guru Kelas') {
      displayList = displayList.filter(item => ['Guru Kelas', 'Guru Kelas TK'].includes(item.Beban_Tugas));
    } else if (filterBeban === 'Guru Mapel') {
      displayList = displayList.filter(item => {
        const b = item.Beban_Tugas || "";
        const isMapel = b.startsWith('Guru Mapel') || b === 'Guru PAI' || b === 'Guru PJOK' || b === 'Guru Bahasa Inggris';
        if (!isMapel) return false;

        if (filterJenisMapel) {
          if (filterJenisMapel === 'PAI' && (b === 'Guru PAI' || b === 'Guru Mapel - PAI')) return true;
          if (filterJenisMapel === 'PJOK' && (b === 'Guru PJOK' || b === 'Guru Mapel - PJOK')) return true;
          if (filterJenisMapel === 'BK' && (b === 'Guru BK' || b === 'Guru Mapel - BK' || b === 'Guru Bimbingan Konseling')) return true;
          return b === `Guru Mapel - ${filterJenisMapel}`;
        }
        return true;
      });
    } else {
      displayList = displayList.filter(item => item.Beban_Tugas === filterBeban);
    }
  }

  if (filterSertifikasi) {
    displayList = displayList.filter(item => item.Sertifikasi === filterSertifikasi);
  }

  if (filterKondisi) {
    const activeStates = ['PNS', 'PPPK', 'PPPKPW'];
    if (filterKondisi === 'Pensiun') {
      displayList = displayList.filter(item => item.isPensiun && activeStates.includes(item.Status_Pegawai));
    } else if (filterKondisi === 'Mendekati') {
      displayList = displayList.filter(item => item.isMendekatiPensiun && !item.isPensiun && activeStates.includes(item.Status_Pegawai));
    } else if (filterKondisi === 'TelatNaik') {
      displayList = displayList.filter(item => item.telatNaikPangkat && item.Status_Pegawai === 'PNS');
    }
  }

  // Global search bar text match inside names, NIPs, or NIKs
  if (searchQuery.trim()) {
    const sq = searchQuery.toLowerCase().trim();
    displayList = displayList.filter(item => 
      (item.Nama || "").toLowerCase().includes(sq) ||
      (item.NIP || "").includes(sq) ||
      (item.NIK || "").includes(sq)
    );
  }

  // Sort natural listing hierarchy
  displayList = sortGtkList(displayList);

  // Check and evaluate system duplicated groups
  const duplicateGroupsList = detectDuplicates(analyticList);

  // Export School DUK Excel (Beautiful formal sheet with borders, column grids, head signatures)
  const handleExportSchoolDukXls = () => {
    if (!user || user.role !== 'Sekolah') return;
    const nameSekolah = user.identifier.split('|')[1];
    
    // Create direct structured spreadsheet table
    let tableHTML = '<table style="border-collapse: collapse; width:100%;">';
    tableHTML += `
      <thead>
        <tr><th colspan="15" style="text-align:center; font-family:Arial; font-weight:bold; font-size:14pt;">PEMERINTAH KABUPATEN BULUKUMBA</th></tr>
        <tr><th colspan="15" style="text-align:center; font-family:Arial; font-weight:bold; font-size:16pt;">DINAS PENDIDIKAN DAN KEBUDAYAAN</th></tr>
        <tr><th colspan="15" style="text-align:center; font-family:Arial; font-weight:bold; font-size:16pt; border-bottom: 3px double #000000; padding-bottom:8px;">UPT SPF ${nameSekolah}</th></tr>
        <tr><th colspan="15"></th></tr>
        <tr><th colspan="15" style="text-align:center; font-family:Arial; font-weight:bold; font-size:12pt; text-transform:uppercase;">DAFTAR URUT KEPANGKATAN PENDIDIK DAN TENAGA KEPENDIDIKAN (DUK)</th></tr>
        <tr><th colspan="15"></th></tr>
        
        <tr>
          <th rowspan="3" style="border:1px solid #000; background-color:#fce4d6; font-size:10pt;">No</th>
          <th rowspan="3" style="border:1px solid #000; background-color:#fce4d6; font-size:10pt;">Nama Lengkap</th>
          <th rowspan="3" style="border:1px solid #000; background-color:#fce4d6; font-size:10pt;">NIP</th>
          <th rowspan="3" style="border:1px solid #000; background-color:#fce4d6; font-size:10pt;">NIK</th>
          <th rowspan="3" style="border:1px solid #000; background-color:#fce4d6; font-size:10pt;">Pangkat/ Gol</th>
          <th rowspan="3" style="border:1px solid #000; background-color:#fce4d6; font-size:10pt;">TMT Pangkat</th>
          <th rowspan="3" style="border:1px solid #000; background-color:#fce4d6; font-size:10pt;">Jabatan</th>
          <th rowspan="3" style="border:1px solid #000; background-color:#fce4d6; font-size:10pt;">Pendidikan Terakhir</th>
          <th rowspan="3" style="border:1px solid #000; background-color:#fce4d6; font-size:10pt;">TMT Kepsek</th>
          <th rowspan="3" style="border:1px solid #000; background-color:#fce4d6; font-size:10pt;">Beban Tugas</th>
          <th colspan="3" style="border:1px solid #000; background-color:#fce4d6; font-size:10pt; text-align:center;">Sertifikasi</th>
          <th rowspan="3" style="border:1px solid #000; background-color:#fce4d6; font-size:10pt;">NO. HP</th>
          <th rowspan="3" style="border:1px solid #000; background-color:#fce4d6; font-size:10pt;">KET</th>
        </tr>
        <tr>
          <th colspan="2" style="border:1px solid #000; background-color:#fce4d6; font-size:9pt; text-align:center;">Status</th>
          <th rowspan="2" style="border:1px solid #000; background-color:#fce4d6; font-size:9pt;">Mapel Sertifikasi</th>
        </tr>
        <tr>
          <th style="border:1px solid #000; background-color:#fce4d6; font-size:9pt; text-align:center;">Ya</th>
          <th style="border:1px solid #000; background-color:#fce4d6; font-size:9pt; text-align:center;">Tdk</th>
        </tr>
      </thead>
      <tbody>
    `;

    // Process school personnel
    displayList.forEach((item, index) => {
      const isYa = item.Sertifikasi === 'Ya' ? 'v' : '';
      const isBelum = item.Sertifikasi !== 'Ya' ? 'v' : '';
      const phone = item.No_HP ? item.No_HP.replace(/^62/, '0') : '';
      const gepPangkat = item.Status_Pegawai === 'PPPKPW' ? '' : (item.Status_Pegawai === 'PPPK' ? item.Golongan : item.Golongan);

      tableHTML += `
        <tr>
          <td style="border:1px solid #000; text-align:center;">${index + 1}</td>
          <td style="border:1px solid #000; font-family:Arial;">${item.Nama || '-'}</td>
          <td style="border:1px solid #000; mso-number-format:'\\@'; font-family:Arial;">${item.NIP || ''}</td>
          <td style="border:1px solid #000; mso-number-format:'\\@'; font-family:Arial;">${item.NIK || ''}</td>
          <td style="border:1px solid #000; text-align:center; font-family:Arial;">${gepPangkat || '-'}</td>
          <td style="border:1px solid #000; text-align:center; font-family:Arial;">${item.TMT_Golongan || '-'}</td>
          <td style="border:1px solid #000; font-family:Arial;">${item.Jabatan || ''}</td>
          <td style="border:1px solid #000; text-align:center; font-family:Arial;">${item.Pendidikan || ''}</td>
          <td style="border:1px solid #000; text-align:center; font-family:Arial;">${item.TMT_Kepsek || '-'}</td>
          <td style="border:1px solid #000; font-family:Arial;">${item.Beban_Tugas || ''}</td>
          <td style="border:1px solid #000; text-align:center; font-weight:bold;">${isYa}</td>
          <td style="border:1px solid #000; text-align:center; font-weight:bold;">${isBelum}</td>
          <td style="border:1px solid #000; font-family:Arial;">${item.Sertifikasi === 'Ya' ? item.Mapel : ''}</td>
          <td style="border:1px solid #000; mso-number-format:'\\@'; font-family:Arial;">${phone}</td>
          <td style="border:1px solid #000;"></td>
        </tr>
      `;
    });

    // Signature Area
    const kepsek = displayList.find(g => ['Kepala Sekolah', 'PLT. Kepala Sekolah'].includes(g.Beban_Tugas));
    const ttdNama = kepsek ? kepsek.Nama : "..........................";
    const ttdNip = kepsek ? (kepsek.NIP || "..........................") : "..........................";
    
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const today = new Date();
    const ttdDateStr = `${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;

    tableHTML += `
      <tr><td colspan="15" style="border:none;"></td></tr>
      <tr>
        <td colspan="12" style="border:none;"></td>
        <td colspan="3" style="border:none; text-align:left; font-family:Arial; font-size:11pt;">Bulukumba, ${ttdDateStr}</td>
      </tr>
      <tr>
        <td colspan="12" style="border:none;"></td>
        <td colspan="3" style="border:none; text-align:left; font-family:Arial; font-size:11pt; font-weight:bold;">Kepala Sekolah,</td>
      </tr>
      <tr><td colspan="15" style="border:none; height:40px;"></td></tr>
      <tr>
        <td colspan="12" style="border:none;"></td>
        <td colspan="3" style="border:none; text-align:left; font-family:Arial; font-size:11pt; font-weight:bold; text-decoration:underline;">${ttdNama}</td>
      </tr>
      <tr>
        <td colspan="12" style="border:none;"></td>
        <td colspan="3" style="border:none; text-align:left; font-family:Arial; font-size:10pt;">NIP. ${ttdNip}</td>
      </tr>
    `;

    tableHTML += '</tbody></table>';

    const excelTemplate = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" 
            xmlns:x="urn:schemas-microsoft-com:office:excel" 
            xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>DUK PTK</x:Name>
                <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
      </head>
      <body>
        ${tableHTML}
      </body>
      </html>
    `;

    const blob = new Blob([excelTemplate], { type: 'application/vnd.ms-excel' });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = `DUK_PTK_${nameSekolah.replace(/\s+/g, '_')}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PDF report printing controller
  const handlePrintConfirm = (config: CetakConfig) => {
    setIsCetakOpen(false);

    const isDinas = user?.role === 'Admin Dinas';
    const reportList = displayList;
    const nameSekolah = isDinas ? 'KABUPATEN BULUKUMBA' : user?.identifier.split('|')[1];
    
    const printFrame = window.open('', '_blank');
    if (!printFrame) return;

    let rowsHtml = '';
    reportList.forEach((item, index) => {
      const isYa = item.Sertifikasi === 'Ya' ? 'v' : '';
      const isBelum = item.Sertifikasi !== 'Ya' ? 'v' : '';
      const docPhone = item.No_HP ? item.No_HP.replace(/^62/, '0') : '';
      const gradeText = item.Status_Pegawai === 'PPPKPW' ? '' : (item.Status_Pegawai === 'PPPK' ? item.Golongan : item.Golongan);
      
      rowsHtml += `
        <tr>
          <td>${index + 1}</td>
          <td class="txt-left">${item.Nama}</td>
          ${isDinas ? `<td style="font-weight:bold;">${item.Status_Pegawai}</td>` : ''}
          <td>${item.NIP || ''}</td>
          <td>${item.NIK || ''}</td>
          ${isDinas ? `<td class="txt-left" style="font-size:8.5px; line-height:1.1;"><strong>${item.Sekolah}</strong><br><span style="color:#666;">${item.Kecamatan}</span></td>` : ''}
          <td>${gradeText || ''}</td>
          <td>${item.TMT_Golongan || ''}</td>
          <td>${item.Jabatan || ''}</td>
          <td>${item.Pendidikan || ''}</td>
          <td>${item.TMT_Kepsek || ''}</td>
          <td>${item.Beban_Tugas || ''}</td>
          <td>${isYa}</td>
          <td>${isBelum}</td>
          <td>${item.Sertifikasi === 'Ya' ? item.Mapel : ''}</td>
          <td>${docPhone}</td>
          <td></td>
        </tr>
      `;
    });

    const isGroupPrint = reportList.length > 0;
    const colCount = isDinas ? 17 : 15;

    const documentHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>SI PTK DIKBUD PDF - ${nameSekolah}</title>
        <style>
          @page { size: landscape; margin: 12mm 10mm 10mm 10mm; }
          body { font-family: Arial, sans-serif; font-size: 10.5px; color: #000; margin: 0; padding: 0; }
          
          .kop-surat { border-bottom: 3px double #000; padding-bottom: 8px; margin-bottom: 12px; display: flex; align-items: center; justify-content: center; }
          .logo-box { width: 62px; height: auto; margin-right: 20px; }
          .header-text { text-align: center; }
          .header-text h1 { margin: 0; font-size: 15px; font-weight: normal; letter-spacing: 0.5px; }
          .header-text h2 { margin: 0; font-size: 18px; font-weight: bold; margin-top:2px; }
          .header-text h3 { margin: 0; font-size: 17px; font-weight: bold; text-transform: uppercase; margin-top:2px; }
          .header-text p { margin: 0; font-size: 11px; margin-top:4px; font-style:italic; }

          .doc-title { text-align: center; font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 15px; text-decoration: underline; }
          
          table { width: 100%; border-collapse: collapse; margin-top: 5px; }
          th, td { border: 1px solid #000; padding: 3px 4px; text-align: center; vertical-align: middle; font-size: 9px; word-break: break-all; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .txt-left { text-align: left; }

          .ttd-container { display: flex; justify-content: flex-end; margin-top: 25px; page-break-inside: avoid; }
          .ttd-pouch { width: 280px; text-align: left; font-size: 11px; }
          .ttd-pouch p { margin: 2px 0; }
          .signature-space { height: 60px; }
        </style>
      </head>
      <body>
        <div class="kop-surat">
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/50/Lambang_Kabupaten_Bulukumba.svg" class="logo-box" alt="Logo Kab. Bulukumba" />
          <div class="header-text">
            <h1>PEMERINTAH KABUPATEN BULUKUMBA</h1>
            <h2>DINAS PENDIDIKAN DAN KEBUDAYAAN</h2>
            ${isDinas ? '<h3>Dinas Pendidikan Bulukumba</h3>' : `<h3>UPT SPF ${nameSekolah}</h3>`}
            <p>Saluran Informasi & Hubungan PTK Offline - Edisi Komputer Lokal</p>
          </div>
        </div>

        <div class="doc-title">${config.judul}</div>

        <table>
          <thead>
            <tr>
              <th rowspan="3" style="width:2%">No</th>
              <th rowspan="3" style="width:12%">Nama Lengkap</th>
              ${isDinas ? '<th rowspan="3" style="width:4%">Akses</th>' : ''}
              <th rowspan="3" style="width:8%">NIP</th>
              <th rowspan="3" style="width:8%">NIK</th>
              ${isDinas ? '<th rowspan="3" style="width:12%">Instansi Tugas</th>' : ''}
              <th rowspan="3" style="width:4%">Gol / Pangkat</th>
              <th rowspan="3" style="width:6%">TMT Gol</th>
              <th rowspan="3" style="width:8%">Jabatan</th>
              <th rowspan="3" style="width:4%">Pendidikan</th>
              <th rowspan="3" style="width:6%">TMT Kepsek</th>
              <th rowspan="3" style="width:10%">Beban Tugas</th>
              <th colspan="3" style="width:12%">Sertifikasi</th>
              <th rowspan="3" style="width:6%">No HP</th>
              <th rowspan="3">KET</th>
            </tr>
            <tr>
              <th colspan="2">Status</th>
              <th rowspan="2">Mapel</th>
            </tr>
            <tr>
              <th>Ya</th>
              <th>Tdk</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
            <tr>
              <td colspan="${colCount}" style="border:none; padding:0;">
                <div class="ttd-container">
                  <div class="ttd-pouch">
                    <p>Bulukumba, ${config.tanggal}</p>
                    <p>${config.jabatan}</p>
                    <div class="signature-space"></div>
                    <p><strong><u>${config.nama}</u></strong></p>
                    <p>NIP. ${config.nip}</p>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <script>
          window.onload = function() {
            window.print();
          }
        <\/script>
      </body>
      </html>
    `;

    printFrame.document.write(documentHtml);
    printFrame.document.close();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 antialiased font-sans">
      
      {/* Visual Header Alert for Pending Local Changes Export */}
      {unsavedChanges && (
        <div className="bg-amber-500 text-slate-900 text-xs py-2.5 px-4 font-bold text-center border-b border-amber-600 animate-pulse flex items-center justify-center gap-2 relative">
          <AlertTriangle className="h-4 w-4 text-slate-900" />
          <span>⚠️ Ada perubahan data yang belum di-save ke file komputer lokal Anda! Pastikan untuk mengeklik tombol <strong>&quot;Simpan ke File Excel&quot;</strong> di header sebelum menutup tab ini agar data tersimpan permanen.</span>
          <button
            onClick={handleSaveDatabaseLocal}
            className="ml-4 bg-slate-900 text-white rounded-lg px-2.5 py-1 text-[11px] font-bold hover:bg-slate-800 transition shadow"
          >
            Simpan Sekarang
          </button>
        </div>
      )}

      {/* LOGIN PANEL SCREEN */}
      {!user ? (
        <main className="flex-grow flex items-center justify-center p-4 bg-slate-900 border-b border-slate-950 shadow-inner relative overflow-hidden" 
              style={{
                backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.95)), url('https://assets.promediateknologi.id/crop/0x0:0x0/x/photo/p3/325/2025/12/20/gedung-ammatoa-full-colors-2232671363.jpeg')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}>
          
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden transition scale-100 duration-300">
            <div className="p-8 text-center bg-slate-50 border-b border-slate-200">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/5/50/Lambang_Kabupaten_Bulukumba.svg" 
                alt="Bulukumba Logo" 
                className="h-20 w-auto mx-auto mb-4 drop-shadow"
              />
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">SI PTK DIKBUD</h2>
              <p className="text-xs font-bold text-amber-600 mt-1 uppercase tracking-wider">Edisi Database Offline Lokal</p>
              <p className="text-xs text-slate-500 font-semibold mt-1">Dinas Pendidikan dan Kebudayaan Kab. Bulukumba</p>
            </div>

            <div className="p-8">
              {/* Type Switch Tabs */}
              <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-xl">
                <button 
                  onClick={() => {
                    setLoginRole('Sekolah');
                    setLoginPassword('');
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${loginRole === 'Sekolah' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  Admin Sekolah
                </button>
                <button 
                  onClick={() => {
                    setLoginRole('Admin Dinas');
                    setLoginPassword('');
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${loginRole === 'Admin Dinas' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  Admin Dinas
                </button>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                
                {loginRole === 'Sekolah' ? (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Kecamatan Instansi</label>
                      <select 
                        value={loginKecamatan}
                        onChange={(e) => setLoginKecamatan(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none"
                        required
                      >
                        <option value="">-- Pilih Kecamatan --</option>
                        {displayKecamatans.map(kec => (
                          <option key={kec} value={kec}>{kec}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nama Satuan Sekolah</label>
                      <select 
                        value={loginSekolah}
                        onChange={(e) => setLoginSekolah(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none uppercase"
                        disabled={!loginKecamatan}
                        required
                      >
                        <option value="">-- Pilih Sekolah --</option>
                        {selectedKecSchools.map(sch => (
                          <option key={sch.ID} value={sch.Nama_Sekolah}>{sch.Nama_Sekolah}</option>
                        ))}
                      </select>
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Username Akses</label>
                    <input 
                      type="text" 
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      className="w-full bg-slate-100 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none font-semibold text-slate-600"
                      readOnly
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Kata Sandi (Password)</label>
                  <input 
                    type="password" 
                    placeholder="Masukkan password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none"
                    required
                  />
                  <div className="text-[10px] text-slate-400 mt-1 font-semibold">
                    * Bawaan: <span className="text-slate-600">ammatoa</span> (Dinas), <span className="text-slate-600">dikerja</span> (Sekolah)
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-slate-900 border border-slate-950 hover:bg-slate-800 text-white font-bold py-3 rounded-xl shadow transition duration-150 text-xs uppercase"
                >
                  Masuk sebagai {loginRole === 'Admin Dinas' ? 'Admin Dinas' : 'Unit Sekolah'}
                </button>
              </form>

              {/* Developer Offline Sandbox Uploader */}
              <div className="mt-8 border-t border-slate-200 pt-6">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Workspace Database Lokal:</span>
                <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
                  Aplikasi ini berjalan mandiri di komputer Anda. Anda dapat mengunggah file database Excel (.xlsx) lama Anda di bawah ini, atau langsung mulai menggunakan database template default kami.
                </p>

                {importNotice && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-[11px] text-emerald-800 font-bold mb-3">
                    {importNotice}
                  </div>
                )}

                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed ${isDragging ? 'border-amber-500 bg-amber-50/50' : 'border-slate-300'} rounded-xl p-4 text-center cursor-pointer hover:bg-slate-50 transition`}
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.xlsx, .xls, .csv';
                    input.onchange = (e) => {
                      const files = (e.target as HTMLInputElement).files;
                      if (files && files[0]) handleFileImport(files[0]);
                    };
                    input.click();
                  }}
                >
                  <Upload className="h-6 w-6 text-slate-400 mx-auto mb-2" />
                  <span className="text-xs text-slate-900 font-bold block">Tarik & Lepas atau Cari File Excel database</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Mendukung berkas berekstensi .xlsx, .xls, atau .csv</span>
                </div>
              </div>

            </div>
          </div>

        </main>
      ) : (
        /* LOGGED IN ACTIVE DASHBOARD VIEW */
        <div className="flex-grow flex flex-col">
          
          {/* Header Action Bar */}
          <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex justify-between items-center flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/5/50/Lambang_Kabupaten_Bulukumba.svg" 
                  alt="Bulukumba Logo" 
                  className="h-10 w-auto"
                />
                <div>
                  <h1 className="text-lg font-extrabold text-slate-900 leading-tight">SI PTK DIKBUD</h1>
                  <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Local Database Workspace</p>
                </div>
              </div>

              {/* Badges and controls */}
              <div className="flex items-center gap-2">
                <div className="text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-3.5 py-1.5 rounded-full flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5 text-slate-500 animate-pulse" />
                  <span>
                    {user.role === 'Admin Dinas' ? 'Admin Dinas Kabupaten' : `Unit Sekolah: ${user.identifier.split('|')[1]}`}
                  </span>
                </div>

                {/* Save database back to client file */}
                <button
                  onClick={handleSaveDatabaseLocal}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-all duration-200 flex items-center gap-1.5 border ${unsavedChanges ? 'bg-amber-500 border-amber-600 text-slate-900 animate-bounce' : 'bg-slate-900 border-slate-950 text-white hover:bg-slate-800'}`}
                  title="Unduh & amankan database file ke komputer Anda"
                >
                  <Save className="h-4 w-4" />
                  <span>Simpan ke File Excel</span>
                </button>

                <button 
                  onClick={handleLogout}
                  className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold px-3 py-1.5 rounded-xl text-xs transition inline-flex items-center gap-1"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          </header>

          {/* MAIN SPACE VIEW CONTAINER */}
          <main className="flex-grow p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
            
            {/* Action Bar Actions and Tools */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h2 className="text-2xl font-black text-slate-950 tracking-tight">Katalog Data Personel PTK</h2>
                <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                  {user.role === 'Admin Dinas' 
                    ? 'Manajemen terpadu dan monitoring Dinas Pendidikan Kabupaten Bulukumba Terhadap Pendidik (PTK).' 
                    : 'Manajemen personil internal satuan pendidikan.'}
                </p>
              </div>

              {/* Action Buttons Panel */}
              <div className="flex flex-wrap gap-2">
                
                {user.role === 'Admin Dinas' && (
                  <>
                    <button 
                      onClick={() => setIsOpenDuplicate(true)}
                      className="bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                    >
                      <Layers className="h-4 w-4" />
                      <span>Data Ganda ({duplicateGroupsList.length})</span>
                    </button>
                    <button 
                      onClick={() => setIsSchoolOpen(true)}
                      className="bg-slate-800 text-white hover:bg-slate-700 border border-slate-950 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                    >
                      <Building className="h-4 w-4" />
                      <span>Kelola Sekolah</span>
                    </button>
                    <button 
                      onClick={() => setIsPasswordOpen(true)}
                      className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                    >
                      <Key className="h-4 w-4" />
                      <span>Atur Password</span>
                    </button>
                    <button 
                      onClick={() => {
                        const fileLabel = document.createElement('input');
                        fileLabel.type = 'file';
                        fileLabel.accept = '.xlsx, .xls, .csv';
                        fileLabel.onchange = (e) => {
                          const files = (e.target as HTMLInputElement).files;
                          if (files && files[0]) handleFileImport(files[0]);
                        };
                        fileLabel.click();
                      }}
                      className="bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                      title="Sinkronkan atau muat database lain"
                    >
                      <Upload className="h-4 w-4" />
                      <span>Muat Excel</span>
                    </button>
                  </>
                )}

                {user.role === 'Sekolah' && (
                  <>
                    <button 
                      onClick={handleExportSchoolDukXls}
                      className="bg-emerald-600 hover:bg-emerald-700 hover:shadow text-white border border-emerald-700 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <FileSpreadsheet className="h-4 w-4" />
                      <span>Unduh DUK Excel</span>
                    </button>
                    <button 
                      onClick={() => {
                        setIsPasswordOpen(true);
                      }}
                      className="bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                    >
                      <Key className="h-4 w-4" />
                      <span>Ubah Sandi</span>
                    </button>
                  </>
                )}

                <button 
                  onClick={() => setIsCetakOpen(true)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="h-4 w-4" />
                  <span>Cetak DUK PDF</span>
                </button>

                <button 
                  onClick={() => {
                    setEditingItem(null);
                    setIsOpenForm(true);
                  }}
                  className="bg-slate-900 hover:bg-slate-800 text-white border border-slate-950 px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5"
                >
                  <Plus className="h-4 w-4 text-amber-500" />
                  <span>Tambah PTK</span>
                </button>
              </div>
            </div>

            {/* Dinas Stats Panel - Visible only for Admin Dinas */}
            {activeUserIsDinas && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                  <div>
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Personel PTK</h5>
                    <p className="text-3xl font-extrabold text-slate-950 mt-1">{db.gtkList.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500 bg-blue-50 p-2.5 rounded-2xl border border-blue-100 shrink-0" />
                </div>
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                  <div>
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PNS Terdaftar</h5>
                    <p className="text-3xl font-extrabold text-slate-950 mt-1">
                      {db.gtkList.filter(g => g.Status_Pegawai === 'PNS').length}
                    </p>
                  </div>
                  <School className="h-8 w-8 text-emerald-500 bg-emerald-50 p-2.5 rounded-2xl border border-emerald-100 shrink-0" />
                </div>
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                  <div>
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PPPK Terdaftar</h5>
                    <p className="text-3xl font-extrabold text-slate-950 mt-1">
                      {db.gtkList.filter(g => ['PPPK', 'PPPKPW'].includes(g.Status_Pegawai)).length}
                    </p>
                  </div>
                  <Layers className="h-8 w-8 text-purple-600 bg-purple-50 p-2.5 rounded-2xl border border-purple-100 shrink-0" />
                </div>
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                  <div>
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hasil Filter</h5>
                    <p className="text-3xl font-extrabold text-slate-950 mt-1">{displayList.length}</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-amber-500 bg-amber-50 p-2.5 rounded-2xl border border-amber-100 shrink-0" />
                </div>
              </div>
            )}

            {/* General Filter Panel Container */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4">
              <div className="flex gap-2 items-center text-slate-950 font-bold border-b border-slate-100 pb-3">
                <Settings className="h-5 w-5 text-slate-700" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Multi-Filter & Pencarian</h3>
              </div>

              {/* Grid Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                
                {/* Search Bar text */}
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Cari Nama atau NIK/NIP</label>
                  <div className="relative">
                    <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                    <input 
                      type="text" 
                      placeholder="Masukkan kata kunci pencarian..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-slate-800"
                    />
                  </div>
                </div>

                {/* District District option - Dinas only */}
                {activeUserIsDinas && (
                  <>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Jenjang Pendidikan Sekolah</label>
                      <select 
                        value={filterJenjang}
                        onChange={(e) => {
                          setFilterJenjang(e.target.value);
                          setFilterSek('');
                        }}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none"
                      >
                        <option value="">Semua Jenjang</option>
                        <option value="TK">TK (Taman Kanak-Kanak)</option>
                        <option value="SD">SD (Sekolah Dasar)</option>
                        <option value="SMP">SMP (Sekolah Menengah Pertama)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Kecamatan Tugas</label>
                      <select 
                        value={filterKec}
                        onChange={(e) => {
                          setFilterKec(e.target.value);
                          setFilterSek('');
                        }}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none"
                      >
                        <option value="">Semua Kecamatan</option>
                        {displayKecamatans.map(kec => (
                          <option key={kec} value={kec}>{kec}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {/* School Option - Dinas Only */}
                {activeUserIsDinas && (
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Pilih Sekolah Tugas</label>
                    <select 
                      value={filterSek}
                      onChange={(e) => setFilterSek(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none uppercase"
                    >
                      <option value="">Semua Sekolah</option>
                      {filteredSchoolOptions.map(s => (
                        <option key={s.ID} value={s.Nama_Sekolah}>{s.Nama_Sekolah}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Additional General Parameters */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Status Pegawai</label>
                  <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value="">Semua Status</option>
                    <option value="PNS">PNS (Pegawai Negeri)</option>
                    <option value="PPPK">PPPK</option>
                    <option value="PPPKPW">PPPK Paruh Waktu (PPPKPW)</option>
                    <option value="PPPK_ALL">PPPK + PPPKPW</option>
                    <option value="Honorer">Honorer / Sukarela</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Beban Tugas Utama</label>
                  <select 
                    value={filterBeban}
                    onChange={(e) => {
                      setFilterBeban(e.target.value);
                      setFilterJenisMapel('');
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value="">Semua Tugas</option>
                    <option value="Kepsek_ALL">Kepala Sekolah / PLT</option>
                    <option value="Guru Kelas">Guru Kelas (SD)</option>
                    <option value="Guru Kelas TK">Guru Kelas TK</option>
                    <option value="Guru Mapel">Guru Mapel</option>
                    <option value="Guru BK">Guru BK</option>
                    <option value="Operator Sekolah">Operator Sekolah</option>
                    <option value="Staf Administrasi (TU)">Staf Administrasi (TU)</option>
                    <option value="Bujang Sekolah">Bujang Sekolah</option>
                    <option value="Satpam">Satpam dsb</option>
                  </select>
                </div>

                {filterBeban === 'Guru Mapel' && (
                  <div>
                    <label className="block text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-1">Tugas Spesifik Mapel</label>
                    <select 
                      value={filterJenisMapel}
                      onChange={(e) => setFilterJenisMapel(e.target.value)}
                      className="w-full bg-amber-50 border border-amber-300 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    >
                      <option value="">Semua Mapel</option>
                      <option value="PAI">Pendidikan Agama Islam (PAI)</option>
                      <option value="PJOK">PJOK / Olahraga</option>
                      <option value="Bahasa Inggris">Bahasa Inggris</option>
                      <option value="IPA">IPA</option>
                      <option value="IPS">IPS</option>
                      <option value="Seni Budaya">Seni Budaya</option>
                      <option value="Informatika">Informatika</option>
                      <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                      <option value="PKn">Pancasila / PKn</option>
                      <option value="BK">Bimbingan Konseling (BK)</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Status Sertifikasi</label>
                  <select 
                    value={filterSertifikasi}
                    onChange={(e) => setFilterSertifikasi(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value="">Semua Sertifikasi</option>
                    <option value="Ya">Ya (Sudah Lulus PPG)</option>
                    <option value="Belum">Belum Sertifikasi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Kondisi Khusus Pegawai</label>
                  <select 
                    value={filterKondisi}
                    onChange={(e) => setFilterKondisi(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value="">Semua Kondisi</option>
                    <option value="Pensiun">Sudah Memasuki Pensiun</option>
                    <option value="Mendekati">Mendekati Pensiun (≤ 1 Tahun)</option>
                    <option value="TelatNaik">Telat Syarat Naik Pangkat (&gt; 4 Tahun)</option>
                  </select>
                </div>

              </div>

              {/* Clear Option Filter */}
              <div className="flex justify-end pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterBeban('');
                    setFilterJenisMapel('');
                    setFilterKec('');
                    setFilterSek('');
                    setFilterStatus('');
                    setFilterKondisi('');
                    setFilterSertifikasi('');
                    setFilterJenjang('');
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1"
                >
                  <Undo2 className="h-3.5 w-3.5" />
                  <span>Reset Filter</span>
                </button>
              </div>

            </div>

            {/* School Alerts - Warning duplicates for School admin */}
            {!activeUserIsDinas && duplicateGroupsList.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3 text-amber-900">
                <BadgeAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm">Peringatan: Data Duplikat NIK Terdeteksi!</p>
                  <p className="text-xs mt-1 leading-relaxed">
                    Sistem mendeteksi adanya NIK guru ganda yang terdaftar di sekolah Anda. Silakan hubungi <strong>Admin Dinas</strong> untuk menghapus baris ganda yang tidak valid agar urutan dan berkas DUK sekolah Anda bersih.
                  </p>
                </div>
              </div>
            )}

            {/* CATALOG DATA TABLE RESIDENT */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center flex-wrap gap-2 text-xs">
                <span className="font-bold text-slate-700">Daftar Personil PTK ({displayList.length} Ditampilkan)</span>
                {unsavedChanges && <span className="bg-amber-100 border border-amber-200 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">Menunggu Unduhan File Excel</span>}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold uppercase tracking-wider text-[10px] font-mono">
                    <tr>
                      <th className="p-3 text-center w-10">No</th>
                      <th className="p-3 w-64">Nama & Kontak</th>
                      {activeUserIsDinas && <th className="p-3 w-48">Unit Sekolah Tugas</th>}
                      <th className="p-3 w-40">Status & NIP</th>
                      <th className="p-3 w-48">Kepangkatan & Pendidikan</th>
                      <th className="p-3 w-48">Jabatan & Tugas</th>
                      <th className="p-3 w-48">Peringatan / Alert</th>
                      <th className="p-3 text-center w-24">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {displayList.length === 0 ? (
                      <tr>
                        <td colSpan={activeUserIsDinas ? 8 : 7} className="p-8 text-center text-slate-500">
                          <Users className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                          <p className="font-bold">Tidak ada data guru/PTK ditemukan.</p>
                          <p className="text-xs text-slate-400 mt-1">Gunakan form pencarian, reset filter Anda, atau tambahkan personel baru.</p>
                        </td>
                      </tr>
                    ) : (
                      displayList.map((item, index) => {
                        // Generate warnings
                        const listWarnings: string[] = [];

                        if (['PNS', 'PPPK', 'PPPKPW'].includes(item.Status_Pegawai)) {
                          // Check headmaster duration warning
                          if ((item.Beban_Tugas === 'Kepala Sekolah' || item.Beban_Tugas === 'PLT. Kepala Sekolah') && item.TMT_Kepsek) {
                            try {
                              const tmt = new Date(item.TMT_Kepsek);
                              const today = new Date();
                              let diffY = today.getFullYear() - tmt.getFullYear();
                              
                              if (diffY >= 12) {
                                listWarnings.push('🚨 Masa Kepemimpinan Kepala Sekolah Sangat Tinggi (≥ 12 Tahun)');
                              } else if (diffY >= 8) {
                                listWarnings.push('⚠️ Masa Kepemimpinan Kepala Sekolah Tinggi (≥ 8 Tahun)');
                              } else if (diffY >= 4) {
                                listWarnings.push('⚠️ Menjabat Kepala Sekolah Level 2 (≥ 4 Tahun)');
                              }
                            } catch (e) {}
                          }

                          if (item.isPensiun) {
                            listWarnings.push('🔴 Memasuki Usia Retensi Pensiun');
                          } else if (item.isMendekatiPensiun) {
                            listWarnings.push('🟠 Pensiun Kurang Dari 1 Tahun');
                          }

                          if (item.telatNaikPangkat && item.Status_Pegawai === 'PNS') {
                            listWarnings.push('🟡 Keterlambatan Naik Golongan Pangkat (&gt; 4 Tahun)');
                          }
                        }

                        const rawHP = item.No_HP || '';
                        const waLink = `https://wa.me/${rawHP}`;
                        const displayHP = rawHP.startsWith('62') ? '0' : '';

                        return (
                          <tr key={item.ID} className="hover:bg-slate-50/50 transition">
                            <td className="p-3 text-center text-slate-400 font-mono font-medium">{index + 1}</td>
                            <td className="p-3">
                              <span className="font-extrabold text-slate-950 font-sans block text-sm leading-tight hover:text-blue-700 cursor-pointer">{item.Nama}</span>
                              <span className="text-[10px] text-slate-400 font-mono tracking-wider mt-1 block">NIK: {item.NIK}</span>
                              {item.No_HP && (
                                <a 
                                  href={waLink} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-[10px] font-bold text-emerald-600 hover:underline inline-flex items-center gap-1 mt-1"
                                >
                                  <Phone className="h-3 w-3" />
                                  <span>{rawHP.replace(/^62/, '0')}</span>
                                </a>
                              )}
                            </td>
                            {activeUserIsDinas && (
                              <td className="p-3">
                                <span className="font-semibold text-slate-800 uppercase block leading-tight">{item.Sekolah}</span>
                                <span className="text-[10px] text-slate-400 font-semibold block uppercase mt-0.5">{item.Kecamatan}</span>
                              </td>
                            )}
                            <td className="p-3">
                              <span className="bg-slate-900 text-white text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md">
                                {item.Status_Pegawai}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono block mt-1.5">{item.NIP || 'Tanpa NIP / Honorer'}</span>
                            </td>
                            <td className="p-3">
                              <span className="font-semibold text-slate-800 block text-xs">
                                {item.Status_Pegawai === 'Honorer' || item.Status_Pegawai === 'PPPKPW' ? 'Tidak Ada' : item.Golongan}
                              </span>
                              {item.TMT_Golongan && (
                                <span className="text-[10px] text-slate-400 block mt-0.5 font-sans font-medium">TMT: {item.TMT_Golongan}</span>
                              )}
                              <span className="text-[10px] text-slate-600 font-semibold block mt-1"><span className="text-slate-400">Pendidikan:</span> S1 IP</span>
                            </td>
                            <td className="p-3 space-y-1">
                              <span className="font-semibold text-slate-800 text-xs block">{item.Jabatan || '-'}</span>
                              <span className="text-[10px] text-slate-500 leading-relaxed block">Tugas: <strong className="text-slate-700">{item.Beban_Tugas}</strong></span>
                              {item.Sertifikasi === 'Ya' ? (
                                <span className="bg-blue-50 border border-blue-100 text-blue-700 text-[9px] font-bold px-1.5 py-0.5 rounded mt-1 inline-block">
                                  Sertifikasi ({item.Mapel})
                                </span>
                              ) : (
                                <span className="text-slate-400 text-[10px] block font-medium">Belum Sertifikasi</span>
                              )}
                            </td>
                            <td className="p-3">
                              {listWarnings.length === 0 ? (
                                <span className="text-emerald-500 text-[10px] font-bold flex items-center gap-1">✓ Status Aman</span>
                              ) : (
                                <div className="space-y-1">
                                  {listWarnings.map((w, i) => (
                                    <span key={i} className="text-[9px] font-bold block text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-100 leading-normal">{w}</span>
                                  ))}
                                </div>
                              )}
                            </td>
                            <td className="p-3 text-center">
                              <div className="flex justify-center gap-1">
                                <button 
                                  onClick={() => {
                                    setEditingItem(item);
                                    setIsOpenForm(true);
                                  }}
                                  className="p-1 border border-slate-200 text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-50 rounded-lg transition"
                                  title="Edit data guru"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteGtkPerson(item.rowNumber!, item.Nama)}
                                  className="p-1 border border-red-100 text-red-500 hover:text-red-750 bg-white hover:bg-red-50/50 rounded-lg transition"
                                  title="Hapus data guru"
                                >
                                  <Trash2 className="h-4 w-4" />
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

            </div>

            {/* Offline Local Help Widget */}
            <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 border border-slate-950 flex flex-col md:flex-row gap-6 items-center justify-between">
              <div className="flex items-start gap-4">
                <Database className="h-10 w-10 text-amber-500 shrink-0 mt-1" />
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-amber-500">Mekanisme Database Lokal</h4>
                  <p className="text-xs text-slate-400 leading-normal mt-1">
                    Aplikasi ini tidak memerlukan internet atau hosting luar untuk menyimpan data Anda. Data tersimpan aman di dalam browser internet (LocalStorage). Anda dapat mengunduh database Anda dalam format file Excel <strong>SI_PTK_DIKBUD_DB.xlsx</strong> kapan saja, menyimpannya di harddisk komputer fisik, dan mengunggahnya kembali besok untuk melanjutkan pekerjaan Anda!
                  </p>
                </div>
              </div>
              <div className="shrink-0 flex gap-2">
                <button
                  onClick={() => {
                    const sampleSeed = getSeedDbAsFresh();
                    setDb(sampleSeed);
                    saveEngineDb(sampleSeed);
                    setUnsavedChanges(true);
                    alert("✓ Database direset ke Preset Sample Template yang terisi data guru-guru Bulukumba.");
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Gunakan Sample Preset</span>
                </button>
              </div>
            </div>

          </main>
          
          <footer className="py-6 text-center text-slate-400 text-xs border-t border-slate-200 bg-white mt-auto">
            &copy; 2026 Dinas Pendidikan dan Kebudayaan Kabupaten Bulukumba • Aplikasi Edisi Standalone Spreadsheet Lokal
          </footer>

        </div>
      )}

      {/* CORE MODULAR MODALS REGISTERED */}
      <FormModal 
        isOpen={isOpenForm}
        onClose={() => setIsOpenForm(false)}
        onSave={handleSaveGtkPerson}
        editingItem={editingItem}
        sekolahList={db.sekolahList}
        kecamatanList={kecamatansList}
        userRole={user?.role || null}
        userIdentifier={user?.identifier || null}
      />

      <DuplicateModal 
        isOpen={isOpenDuplicate}
        onClose={() => setIsOpenDuplicate(false)}
        duplicateGroups={duplicateGroupsList}
        onDeleteSelected={handleResolveDuplicatesMassive}
      />

      <ManageSchoolModal 
        isOpen={isOpenSchool}
        onClose={() => setIsSchoolOpen(false)}
        sekolahList={db.sekolahList}
        kecamatanList={kecamatansList}
        onAddSchool={handleAddSchool}
        onDeleteSchool={handleDeleteSchool}
      />

      <ManagePasswordsModal 
        isOpen={isOpenPassword}
        onClose={() => setIsPasswordOpen(false)}
        sekolahList={db.sekolahList}
        penggunaList={db.penggunaList}
        onSavePassword={handleSaveCredentials}
        userRole={user?.role}
        userIdentifier={user?.identifier}
      />

      <CetakModal 
        isOpen={isOpenCetak}
        onClose={() => setIsCetakOpen(false)}
        onConfirm={handlePrintConfirm}
      />

    </div>
  );
}

// Inline helper to get a clean fresh copy of the seed database
function getSeedDbAsFresh() {
  const seed = initializeEngineDb();
  // Clear any potential changes and return a fresh pre-filled database
  return seed;
}
