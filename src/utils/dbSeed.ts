import { GtkData, SekolahDb, PenggunaDb, DatabaseState } from '../types';

export const DEFAULT_INTERNAL_KECAMATANS = [
  "KEC. BULUKUMPA",
  "KEC. GANGKANG",
  "KEC. HERLANG",
  "KEC. KAJANG",
  "KEC. KINDANG",
  "KEC. RILAU ALE",
  "KEC. BONTOBAHARI",
  "KEC. BONTOTIRO",
  "KEC. UJUNG BULU",
  "KEC. UJUNG LOE"
];

export const generateId = () => {
  return "IDX" + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
};

export const getSeedDatabase = (): DatabaseState => {
  const sekolahList: SekolahDb[] = [
    { ID: "S001", Kecamatan: "KEC. BULUKUMPA", Nama_Sekolah: "SDN 58 TANETE" },
    { ID: "S002", Kecamatan: "KEC. BULUKUMPA", Nama_Sekolah: "SDN 59 TANETE" },
    { ID: "S003", Kecamatan: "KEC. BULUKUMPA", Nama_Sekolah: "SMP NEGERI 19 BULUKUMPA" },
    { ID: "S004", Kecamatan: "KEC. UJUNG BULU", Nama_Sekolah: "SDN 2 TERANG-TERANG" },
    { ID: "S005", Kecamatan: "KEC. UJUNG BULU", Nama_Sekolah: "SMP NEGERI 1 BULUKUMBA" },
    { ID: "S006", Kecamatan: "KEC. BONTOBAHARI", Nama_Sekolah: "SDN 139 BIRA" },
    { ID: "S007", Kecamatan: "KEC. KAJANG", Nama_Sekolah: "SDN 170 KAJANG" }
  ];

  const penggunaList: PenggunaDb[] = [
    { Role: "Admin Dinas", Identifier: "admin", Password: "ammatoa" },
    { Role: "Sekolah", Identifier: "KEC. BULUKUMPA|SDN 58 TANETE", Password: "dikerja" },
    { Role: "Sekolah", Identifier: "KEC. BULUKUMPA|SDN 59 TANETE", Password: "dikerja" },
    { Role: "Sekolah", Identifier: "KEC. BULUKUMPA|SMP NEGERI 19 BULUKUMPA", Password: "dikerja" },
    { Role: "Sekolah", Identifier: "KEC. UJUNG BULU|SDN 2 TERANG-TERANG", Password: "dikerja" },
    { Role: "Sekolah", Identifier: "KEC. UJUNG BULU|SMP NEGERI 1 BULUKUMBA", Password: "dikerja" },
    { Role: "Sekolah", Identifier: "KEC. BONTOBAHARI|SDN 139 BIRA", Password: "dikerja" },
    { Role: "Sekolah", Identifier: "KEC. KAJANG|SDN 170 KAJANG", Password: "dikerja" }
  ];

  const gtkList: GtkData[] = [
    {
      ID: "G001",
      Kecamatan: "KEC. BULUKUMPA",
      Sekolah: "SDN 58 TANETE",
      Nama: "Drs. H. Andi Syamsul, M.Pd",
      NIP: "196612151988031002", // PNS, born Dec 1966, retires at 60 (late 2026/2027)
      Status_Pegawai: "PNS",
      NIK: "7302041512660001",
      Golongan: "IV/b",
      TMT_Golongan: "2018-04-01", // > 4 years, late promotion warning
      Jabatan: "Guru Ahli Madya",
      Pendidikan: "S2",
      Beban_Tugas: "Kepala Sekolah",
      TMT_Kepsek: "2014-06-12", // > 8 years, warning
      Sertifikasi: "Ya",
      Mapel: "Guru Kelas SD",
      No_HP: "6281244556677",
      Created_At: new Date().toISOString()
    },
    {
      ID: "G002",
      Kecamatan: "KEC. BULUKUMPA",
      Sekolah: "SDN 58 TANETE",
      Nama: "Andi Nirwana, S.Pd",
      NIP: "198205122009032014",
      Status_Pegawai: "PNS",
      NIK: "7302041205820003",
      Golongan: "III/c",
      TMT_Golongan: "2021-10-01",
      Jabatan: "Guru Ahli Muda",
      Pendidikan: "S1",
      Beban_Tugas: "Guru Kelas",
      TMT_Kepsek: "",
      Sertifikasi: "Ya",
      Mapel: "Guru Kelas SD",
      No_HP: "6285255667788",
      Created_At: new Date().toISOString()
    },
    {
      ID: "G003",
      Kecamatan: "KEC. BULUKUMPA",
      Sekolah: "SDN 58 TANETE",
      Nama: "Budi Santoso, S.Pd.I",
      NIP: "199104052023211012",
      Status_Pegawai: "PPPK",
      NIK: "7302040504910005",
      Golongan: "IX",
      TMT_Golongan: "2023-06-01",
      Jabatan: "Guru Ahli Pertama",
      Pendidikan: "S1",
      Beban_Tugas: "Guru Mapel - PAI",
      TMT_Kepsek: "",
      Sertifikasi: "Belum",
      Mapel: "",
      No_HP: "6282188990011",
      Created_At: new Date().toISOString()
    },
    {
      ID: "G004",
      Kecamatan: "KEC. BULUKUMPA",
      Sekolah: "SDN 59 TANETE",
      Nama: "Hasanuddin, S.Pd",
      NIP: "196504201990021003", // Born 1965, retired or near retirement (60 yrs old in 2025)
      Status_Pegawai: "PNS",
      NIK: "7302042004650001",
      Golongan: "IV/a",
      TMT_Golongan: "2019-10-01",
      Jabatan: "Guru Ahli Madya",
      Pendidikan: "S1",
      Beban_Tugas: "Kepala Sekolah",
      TMT_Kepsek: "2018-05-15",
      Sertifikasi: "Ya",
      Mapel: "Guru Kelas SD",
      No_HP: "6281355443322",
      Created_At: new Date().toISOString()
    },
    {
      ID: "G005",
      Kecamatan: "KEC. BULUKUMPA",
      Sekolah: "SDN 59 TANETE",
      Nama: "Siti Rahma, S.Pd",
      NIP: "",
      Status_Pegawai: "Honorer",
      NIK: "7302045508950002",
      Golongan: "",
      TMT_Golongan: "",
      Jabatan: "",
      Pendidikan: "S1",
      Beban_Tugas: "Guru Kelas",
      TMT_Kepsek: "",
      Sertifikasi: "Belum",
      Mapel: "",
      No_HP: "6285322112233",
      Created_At: new Date().toISOString()
    },
    {
      ID: "G006",
      Kecamatan: "KEC. UJUNG BULU",
      Sekolah: "SDN 2 TERANG-TERANG",
      Nama: "Andi Astuti, S.Pd",
      NIP: "197808252006042012",
      Status_Pegawai: "PNS",
      NIK: "7302012508780004",
      Golongan: "III/d",
      TMT_Golongan: "2020-04-01", // > 4 years, late promotion warning
      Jabatan: "Guru Ahli Muda",
      Pendidikan: "S1",
      Beban_Tugas: "Guru Kelas",
      TMT_Kepsek: "",
      Sertifikasi: "Ya",
      Mapel: "Guru Kelas SD",
      No_HP: "6281242998877",
      Created_At: new Date().toISOString()
    },
    {
      ID: "G007",
      Kecamatan: "KEC. UJUNG BULU",
      Sekolah: "SDN 2 TERANG-TERANG",
      Nama: "Asrul, S.Kom",
      NIP: "",
      Status_Pegawai: "Honorer",
      NIK: "7302011212920005",
      Golongan: "",
      TMT_Golongan: "",
      Jabatan: "",
      Pendidikan: "S1",
      Beban_Tugas: "Operator Sekolah",
      TMT_Kepsek: "",
      Sertifikasi: "Belum",
      Mapel: "",
      No_HP: "6285223344556",
      Created_At: new Date().toISOString()
    },
    {
      // Duplicate NIK and Name Entry for testing "Data Ganda" (NIK & Nama Identik)
      ID: "G008",
      Kecamatan: "KEC. BULUKUMPA",
      Sekolah: "SMP NEGERI 19 BULUKUMPA",
      Nama: "Budi Santoso, S.Pd.I",
      NIP: "199104052023211012",
      Status_Pegawai: "PPPK",
      NIK: "7302040504910005", // same NIK as G003 (Budi Santoso) but this has slightly different or less complete fields
      Golongan: "IX",
      TMT_Golongan: "2023-06-01",
      Jabatan: "", // Empty to simulate less complete
      Pendidikan: "S1",
      Beban_Tugas: "Guru Mapel - PAI",
      TMT_Kepsek: "",
      Sertifikasi: "Belum",
      Mapel: "",
      No_HP: "6282188990011",
      Created_At: new Date().toISOString()
    }
  ];

  return { gtkList, sekolahList, penggunaList };
};
export default getSeedDatabase;
