import { GtkData, SekolahDb, PenggunaDb, DatabaseState } from '../types';
import { getSeedDatabase, generateId } from './dbSeed';

const BACKUP_KEY = "SI_PTK_DIKBUD_LOCAL_STORAGE_DB";

// Load database from LocalStorage or fall back to default seed database
export const initializeEngineDb = (): DatabaseState => {
  try {
    const cached = localStorage.getItem(BACKUP_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed.gtkList && parsed.sekolahList && parsed.penggunaList) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to read from local storage cache:", e);
  }
  
  // Default to pre-populated seed database
  const defaultDb = getSeedDatabase();
  saveEngineDb(defaultDb);
  return defaultDb;
};

// Save state to LocalStorage for persistent local-browser cache
export const saveEngineDb = (state: DatabaseState): void => {
  try {
    localStorage.setItem(BACKUP_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save state to local storage cache:", e);
  }
};

// Clear LocalStorage cache
export const clearEngineDb = (): void => {
  localStorage.removeItem(BACKUP_KEY);
};

// Dynamic Pension and TMT check
export interface PensionStatus {
  isPensiun: boolean;
  isMendekatiPensiun: boolean;
  age: number;
}

export const evaluatePensionStatus = (nip: string, statusPegawai: string, bebanTugas: string): PensionStatus => {
  // Check if NIP is a valid number sequence and status is PNS/PPPK candidates
  const isPNSorPPPK = ["PNS", "PPPK", "PPPKPW"].includes(statusPegawai);
  if (!isPNSorPPPK || !nip || nip.trim().length < 8) {
    return { isPensiun: false, isMendekatiPensiun: false, age: 0 };
  }

  const nipStr = nip.trim();
  const yearStr = nipStr.substring(0, 4);
  const monthStr = nipStr.substring(4, 6);
  const dayStr = nipStr.substring(6, 8);

  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1; // zero-indexed
  const day = parseInt(dayStr, 10);

  if (isNaN(year) || isNaN(month) || isNaN(day) || month < 0 || month > 11 || day < 1 || day > 31) {
    return { isPensiun: false, isMendekatiPensiun: false, age: 0 };
  }

  const dob = new Date(year, month, day);
  const today = new Date();
  
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  // Teachers and headmasters retire at 60. Administrative staff at 58.
  const behavesAsTeacher = bebanTugas && (
    bebanTugas.toLowerCase().includes("guru") || 
    bebanTugas.toLowerCase().includes("kepala sekolah") || 
    bebanTugas.toLowerCase().includes("kepsek")
  );
  
  const retirementAge = behavesAsTeacher ? 60 : 58;
  const retirementDate = new Date(year + retirementAge, month, day);
  const cautionThresholdDate = new Date(year + retirementAge - 1, month, day); // 1 year warning

  const isPensiun = today >= retirementDate;
  const isMendekatiPensiun = today >= cautionThresholdDate && today < retirementDate;

  return { isPensiun, isMendekatiPensiun, age };
};

// Check if promotion is late (Status is PNS, and TMT promotion > 4 years ago)
export const evaluatePromotionDelay = (tmtGolongan: string, statusPegawai: string): boolean => {
  if (statusPegawai !== "PNS" || !tmtGolongan) return false;
  try {
    const tmtDate = new Date(tmtGolongan);
    if (isNaN(tmtDate.getTime())) return false;
    const today = new Date();
    const diffTime = today.getTime() - tmtDate.getTime();
    const diffYears = diffTime / (1000 * 3600 * 24 * 365.25);
    return diffYears > 4.0;
  } catch (e) {
    return false;
  }
};

// Parse items and attach dynamic ratings
export const prepareAnalyticGtkList = (list: GtkData[]): GtkData[] => {
  return list.map((item) => {
    const pension = evaluatePensionStatus(item.NIP, item.Status_Pegawai, item.Beban_Tugas);
    const telatNaikPangkat = evaluatePromotionDelay(item.TMT_Golongan, item.Status_Pegawai);
    return {
      ...item,
      isPensiun: pension.isPensiun,
      isMendekatiPensiun: pension.isMendekatiPensiun,
      telatNaikPangkat: telatNaikPangkat
    };
  });
};

// Sort GTK personnel list based on original hierarchy logic
export const sortGtkList = (list: GtkData[]): GtkData[] => {
  const statusWeight: Record<string, number> = { 'PNS': 1, 'PPPK': 2, 'PPPKPW': 3, 'Honorer': 4 };
  const golWeight: Record<string, number> = {
    // PNS Pangkat
    'IV/e': 1, 'IV/d': 2, 'IV/c': 3, 'IV/b': 4, 'IV/a': 5,
    'III/d': 6, 'III/c': 7, 'III/b': 8, 'III/a': 9,
    'II/d': 10, 'II/c': 11, 'II/b': 12, 'II/a': 13,
    // PPPK Golongan
    'XVII': 14, 'XVI': 15, 'XV': 16, 'XIV': 17, 'XIII': 18,
    'XII': 19, 'XI': 20, 'X': 21, 'IX': 22, 'VIII': 23,
    'VII': 24, 'VI': 25, 'V': 26, 'IV': 27, 'III': 28,
    'II': 29, 'I': 30
  };

  return [...list].sort((a, b) => {
    // 1. Kecamatan (A-Z)
    const kecA = (a.Kecamatan || "").trim().toUpperCase();
    const kecB = (b.Kecamatan || "").trim().toUpperCase();
    if (kecA !== kecB) return kecA.localeCompare(kecB);

    // 2. Sekolah (Natural Alphanumeric Sort)
    const sekA = (a.Sekolah || "").trim().toUpperCase();
    const sekB = (b.Sekolah || "").trim().toUpperCase();
    if (sekA !== sekB) {
      return sekA.localeCompare(sekB, undefined, { numeric: true, sensitivity: 'base' });
    }

    // 3. Status Kepegawaian (PNS > PPPK > PPPKPW > Honorer)
    const sA = statusWeight[a.Status_Pegawai] || 99;
    const sB = statusWeight[b.Status_Pegawai] || 99;
    if (sA !== sB) return sA - sB;

    // 4. Pangkat/Golongan
    const gA = golWeight[a.Golongan || ""] || 99;
    const gB = golWeight[b.Golongan || ""] || 99;
    if (gA !== gB) return gA - gB;

    // 5. NIP (Age-based: First 8 digits YYYYMMDD)
    const dobA = (a.NIP || "").trim().substring(0, 8) || "99999999";
    const dobB = (b.NIP || "").trim().substring(0, 8) || "99999999";
    if (dobA !== dobB) return dobA.localeCompare(dobB);

    // 6. Nama (A-Z)
    const nameA = (a.Nama || "").trim().toLowerCase();
    const nameB = (b.Nama || "").trim().toLowerCase();
    return nameA.localeCompare(nameB);
  });
};

// Calculate completeness score of GTK records for automated duplicate detection
export const getCompletenessScore = (item: GtkData): number => {
  let score = 0;
  const fields: (keyof GtkData)[] = [
    'Nama', 'Sekolah', 'Kecamatan', 'Status_Pegawai', 'NIP',
    'Golongan', 'TMT_Golongan', 'Jabatan', 'Pendidikan',
    'Beban_Tugas', 'Sertifikasi', 'Mapel', 'No_HP'
  ];
  
  fields.forEach(f => {
    const val = item[f];
    if (val && String(val).trim() !== '' && String(val).trim() !== '-') {
      score++;
    }
  });
  return score;
};

// Scans database for GtkData with identical NIK & Nama
export interface DuplicateGroup {
  key: string;
  items: (GtkData & { _score: number; _autoCheck: boolean })[];
}

export const detectDuplicates = (list: GtkData[]): DuplicateGroup[] => {
  const groups: Record<string, GtkData[]> = {};

  list.forEach(item => {
    const nik = (item.NIK || "").trim();
    const name = (item.Nama || "").trim().toLowerCase();
    
    if (nik.length === 16 && name !== "") {
      const key = `${nik}|${name}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    }
  });

  const duplicateGroups: DuplicateGroup[] = [];

  Object.entries(groups).forEach(([key, groupItems]) => {
    if (groupItems.length > 1) {
      // Calculate scores for completeness
      const scoredItems = groupItems.map(item => {
        const score = getCompletenessScore(item);
        return {
          ...item,
          _score: score,
          _autoCheck: false
        };
      });

      // Find best scoring item in group
      let maxScore = -1;
      let bestIndex = 0;
      scoredItems.forEach((item, idx) => {
        if (item._score > maxScore) {
          maxScore = item._score;
          bestIndex = idx;
        }
      });

      // Mark other duplicates as auto-checked for deletion
      scoredItems.forEach((item, idx) => {
        if (idx !== bestIndex) {
          item._autoCheck = true;
        }
      });

      // Sort scored items: highest score first
      scoredItems.sort((a, b) => b._score - a._score);

      duplicateGroups.push({
        key,
        items: scoredItems
      });
    }
  });

  return duplicateGroups;
};
