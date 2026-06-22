import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { DatabaseState, GtkData, SekolahDb, PenggunaDb } from '../types';
import { generateId } from './dbSeed';

const SHEET_GTK = "GTK_Data";
const SHEET_SEKOLAH = "Sekolah_DB";
const SHEET_PENGGUNA = "Pengguna_DB";

// Parse a Date from Excel serial number or string
export const parseExcelDate = (val: any): string => {
  if (!val) return "";
  if (typeof val === 'number') {
    // Excel date serial number to YYYY-MM-DD
    const date = new Date(Math.round((val - 25569) * 86400 * 1000));
    return date.toISOString().split('T')[0];
  }
  if (val instanceof Date) {
    return val.toISOString().split('T')[0];
  }
  const str = String(val).trim();
  if (str.match(/^\d{4}-\d{2}-\d{2}/)) {
    return str.substring(0, 10);
  }
  return str;
};

// Force value to string safely
export const cleanStringVal = (val: any): string => {
  if (val === undefined || val === null) return "";
  return String(val).trim();
};

export const loadDatabaseFromExcel = (arrayBuffer: ArrayBuffer): DatabaseState => {
  const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
  
  let gtkList: GtkData[] = [];
  let sekolahList: SekolahDb[] = [];
  let penggunaList: PenggunaDb[] = [];

  // Parse GTK Sheet
  if (workbook.SheetNames.includes(SHEET_GTK)) {
    const sheet = workbook.Sheets[SHEET_GTK];
    const rawData = XLSX.utils.sheet_to_json<any>(sheet);
    gtkList = rawData.map((row) => ({
      ID: cleanStringVal(row["ID"] || row["id"]),
      Kecamatan: cleanStringVal(row["Kecamatan"] || row["kecamatan"]),
      Sekolah: cleanStringVal(row["Sekolah"] || row["sekolah"]),
      Nama: cleanStringVal(row["Nama"] || row["nama"]),
      NIP: cleanStringVal(row["NIP"] || row["nip"]),
      Status_Pegawai: cleanStringVal(row["Status_Pegawai"] || row["status_pegawai"] || row["Status Pegawai"]) as any || 'Honorer',
      NIK: cleanStringVal(row["NIK"] || row["nik"]),
      Golongan: cleanStringVal(row["Golongan"] || row["golongan"]),
      TMT_Golongan: parseExcelDate(row["TMT_Golongan"] || row["tmt_golongan"] || row["TMT Golongan"]),
      Jabatan: cleanStringVal(row["Jabatan"] || row["jabatan"]),
      Pendidikan: cleanStringVal(row["Pendidikan"] || row["pendidikan"]),
      Beban_Tugas: cleanStringVal(row["Beban_Tugas"] || row["beban_tugas"] || row["Beban Tugas"]),
      TMT_Kepsek: parseExcelDate(row["TMT_Kepsek"] || row["tmt_kepsek"] || row["TMT Kepsek"]),
      Sertifikasi: cleanStringVal(row["Sertifikasi"] || row["sertifikasi"]) as any || 'Belum',
      Mapel: cleanStringVal(row["Mapel"] || row["mapel"]),
      No_HP: cleanStringVal(row["No_HP"] || row["no_hp"] || row["No HP"]),
      Created_At: row["Created_At"] ? String(row["Created_At"]) : new Date().toISOString()
    }));
  }

  // Parse Sekolah Sheet
  if (workbook.SheetNames.includes(SHEET_SEKOLAH)) {
    const sheet = workbook.Sheets[SHEET_SEKOLAH];
    const rawData = XLSX.utils.sheet_to_json<any>(sheet);
    sekolahList = rawData.map((row) => ({
      ID: cleanStringVal(row["ID"] || row["id"]),
      Kecamatan: cleanStringVal(row["Kecamatan"] || row["kecamatan"]),
      Nama_Sekolah: cleanStringVal(row["Nama_Sekolah"] || row["nama_sekolah"] || row["Nama Sekolah"])
    }));
  }

  // Parse Pengguna Sheet
  if (workbook.SheetNames.includes(SHEET_PENGGUNA)) {
    const sheet = workbook.Sheets[SHEET_PENGGUNA];
    const rawData = XLSX.utils.sheet_to_json<any>(sheet);
    penggunaList = rawData.map((row) => ({
      Role: cleanStringVal(row["Role"] || row["role"]) as any || 'Sekolah',
      Identifier: cleanStringVal(row["Identifier"] || row["identifier"]),
      Password: cleanStringVal(row["Password"] || row["password"])
    }));
  }

  return { gtkList, sekolahList, penggunaList };
};

export const exportDatabaseToExcel = (state: DatabaseState): void => {
  const workbook = XLSX.utils.book_new();

  // Raw GTK Data Preparation
  const gtkRows = state.gtkList.map(item => ({
    "ID": item.ID || generateId(),
    "Kecamatan": item.Kecamatan,
    "Sekolah": item.Sekolah,
    "Nama": item.Nama,
    "NIP": item.NIP ? String(item.NIP) : "",
    "Status_Pegawai": item.Status_Pegawai,
    "NIK": item.NIK ? String(item.NIK) : "",
    "Golongan": item.Golongan || "",
    "TMT_Golongan": item.TMT_Golongan || "",
    "Jabatan": item.Jabatan || "",
    "Pendidikan": item.Pendidikan,
    "Beban_Tugas": item.Beban_Tugas,
    "TMT_Kepsek": item.TMT_Kepsek || "",
    "Sertifikasi": item.Sertifikasi || "Belum",
    "Mapel": item.Mapel || "",
    "No_HP": item.No_HP ? String(item.No_HP) : "",
    "Created_At": item.Created_At || new Date().toISOString()
  }));

  // Raw Sekolah Data Preparation
  const sekolahRows = state.sekolahList.map(item => ({
    "ID": item.ID || generateId(),
    "Kecamatan": item.Kecamatan,
    "Nama_Sekolah": item.Nama_Sekolah
  }));

  // Raw Pengguna Data Preparation
  const penggunaRows = state.penggunaList.map(item => ({
    "Role": item.Role,
    "Identifier": item.Identifier,
    "Password": item.Password
  }));

  const gtkWs = XLSX.utils.json_to_sheet(gtkRows);
  const sekolahWs = XLSX.utils.json_to_sheet(sekolahRows);
  const penggunaWs = XLSX.utils.json_to_sheet(penggunaRows);

  // Apply column numeric formatting specifically to protect leading zeros for NIP and NIK columns
  // In sheetjs, we can define the format as text using `t: 's'` or string type.
  XLSX.utils.book_append_sheet(workbook, gtkWs, SHEET_GTK);
  XLSX.utils.book_append_sheet(workbook, sekolahWs, SHEET_SEKOLAH);
  XLSX.utils.book_append_sheet(workbook, penggunaWs, SHEET_PENGGUNA);

  XLSX.writeFile(workbook, "SI_PTK_DIKBUD_DB.xlsx");
};

// Generate and export standard single-sheet master CSV file
export const exportDatabaseToCsvZip = (gtkList: GtkData[]): void => {
  const csvRows = gtkList.map((item, index) => ({
    "No": index + 1,
    "ID": item.ID,
    "Kecamatan": item.Kecamatan,
    "Sekolah": item.Sekolah,
    "Nama Lengkap": item.Nama,
    "NIP": item.NIP ? `'${item.NIP}` : "", // force string in Excel via prepended apostrophe
    "NIK": item.NIK ? `'${item.NIK}` : "",
    "Status": item.Status_Pegawai,
    "Golongan/Pangkat": item.Golongan || "",
    "TMT Golongan": item.TMT_Golongan || "",
    "Jabatan": item.Jabatan || "",
    "Pendidikan Terakhir": item.Pendidikan,
    "Beban Tugas": item.Beban_Tugas,
    "TMT Kepsek": item.TMT_Kepsek || "",
    "Sertifikasi": item.Sertifikasi,
    "Mapel Sertifikasi": item.Mapel || "",
    "No HP / WA": item.No_HP ? `'${item.No_HP}` : "",
    "Waktu Dibuat": item.Created_At
  }));

  const csvContent = Papa.unparse(csvRows);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `SI_PTK_DIKBUD_EXPORT_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
