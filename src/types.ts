export interface GtkData {
  ID: string;
  Kecamatan: string;
  Sekolah: string;
  Nama: string;
  NIP: string;
  Status_Pegawai: 'PNS' | 'PPPK' | 'PPPKPW' | 'Honorer';
  NIK: string;
  Golongan: string;
  TMT_Golongan: string; // YYYY-MM-DD
  Jabatan: string;
  Pendidikan: string;
  Beban_Tugas: string;
  TMT_Kepsek: string; // YYYY-MM-DD
  Sertifikasi: 'Ya' | 'Belum';
  Mapel: string;
  No_HP: string;
  Created_At: string; // ISO date or datetime string
  
  // Dynamic fields parsed for search & analysis
  rowNumber?: number; // for tracking inside database
  isPensiun?: boolean;
  isMendekatiPensiun?: boolean;
  telatNaikPangkat?: boolean;
}

export interface SekolahDb {
  ID: string;
  Kecamatan: string;
  Nama_Sekolah: string;
}

export interface PenggunaDb {
  Role: 'Admin Dinas' | 'Sekolah';
  Identifier: string; // "admin" or "KECAMATAN|SEKOLAH"
  Password: string;
}

export interface DatabaseState {
  gtkList: GtkData[];
  sekolahList: SekolahDb[];
  penggunaList: PenggunaDb[];
}

export interface LoginResult {
  success: boolean;
  role?: 'Admin Dinas' | 'Sekolah';
  identifier?: string;
  message?: string;
}
