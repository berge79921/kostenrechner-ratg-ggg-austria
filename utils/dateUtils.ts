
import { DurationUnit, DeadlineResult } from '../types';

// Helper to calculate Easter Sunday (Gaussian algorithm)
function getEasterSunday(year: number): Date {
  const f = Math.floor;
  const G = year % 19;
  const C = f(year / 100);
  const H = (C - f(C / 4) - f((8 * C + 13) / 25) + 19 * G + 15) % 30;
  const I = H - f(H / 28) * (1 - f(29 / (H + 1)) * f((21 - G) / 11));
  const J = (year + f(year / 4) + I + 2 - C + f(C / 4)) % 7;
  const L = I - J;
  const month = 3 + f((L + 40) / 44);
  const day = L + 28 - 31 * f(month / 4);
  return new Date(year, month - 1, day);
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function isAustrianHoliday(date: Date): string | null {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  const fixedHolidays: Record<string, string> = {
    "0-1": "Neujahr",
    "0-6": "Heilige Drei Könige",
    "4-1": "Staatsfeiertag",
    "7-15": "Mariä Himmelfahrt",
    "9-26": "Nationalfeiertag",
    "10-1": "Allerheiligen",
    "11-8": "Mariä Empfängnis",
    "11-25": "Christtag",
    "11-26": "Stefanitag",
  };

  const key = `${month}-${day}`;
  if (fixedHolidays[key]) return fixedHolidays[key];

  const easter = getEasterSunday(year);
  const goodFriday = addDays(easter, -2);
  const easterMonday = addDays(easter, 1);
  const ascensionDay = addDays(easter, 39);
  const whitMonday = addDays(easter, 50);
  const corpusChristi = addDays(easter, 60);

  const compare = (d1: Date, d2: Date) => 
    d1.getFullYear() === d2.getFullYear() && 
    d1.getMonth() === d2.getMonth() && 
    d1.getDate() === d2.getDate();

  if (compare(date, goodFriday)) return "Karfreitag";
  if (compare(date, easterMonday)) return "Ostermontag";
  if (compare(date, ascensionDay)) return "Christi Himmelfahrt";
  if (compare(date, whitMonday)) return "Pfingstmontag";
  if (compare(date, corpusChristi)) return "Fronleichnam";

  return null;
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/**
 * § 222 ZPO Gerichtsferien:
 * Sommer: 15. Juli bis 17. August
 * Winter: 24. Dezember bis 6. Jänner
 */
export function isSuspensionDay(date: Date): boolean {
  const month = date.getMonth();
  const day = date.getDate();

  if (month === 6 && day >= 15) return true; // Juli ab 15.
  if (month === 7 && day <= 17) return true; // August bis 17.
  if (month === 11 && day >= 24) return true; // Dezember ab 24.
  if (month === 0 && day <= 6) return true; // Jänner bis 6.

  return false;
}

export function calculateDeadline(
  startDateStr: string,
  amount: number,
  unit: DurationUnit,
  useSuspension: boolean
): DeadlineResult {
  const start = new Date(startDateStr);
  start.setHours(12, 0, 0, 0);

  let trace: string[] = [];
  trace.push(`Beginn der Frist (Dies a quo): ${formatDateGerman(start)}`);

  let nominalEnd = new Date(start);
  if (unit === DurationUnit.DAYS) {
    nominalEnd.setDate(nominalEnd.getDate() + amount);
  } else if (unit === DurationUnit.WEEKS) {
    nominalEnd.setDate(nominalEnd.getDate() + amount * 7);
  } else if (unit === DurationUnit.MONTHS) {
    const targetDay = start.getDate();
    nominalEnd.setMonth(nominalEnd.getMonth() + amount);
    if (nominalEnd.getDate() !== targetDay) {
      nominalEnd.setDate(0); // Clamp to last day of month
    }
  }

  trace.push(`Nominales Ende der Frist (${amount} ${unit}): ${formatDateGerman(nominalEnd)}`);

  let finalEnd = new Date(nominalEnd);
  let suspensionDaysAdded = 0;

  if (useSuspension) {
    let cursor = new Date(start);
    cursor.setDate(cursor.getDate() + 1); // Dies a quo not counted

    let extraDays = 0;
    while (cursor <= finalEnd) {
      if (isSuspensionDay(cursor)) {
        extraDays++;
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    suspensionDaysAdded = extraDays;
    if (extraDays > 0) {
      trace.push(`§ 222 ZPO Hemmung: ${extraDays} Tage gefunden.`);
      // Extend end date. If the added days themselves fall into suspension, keep extending.
      for (let i = 0; i < extraDays; i++) {
        finalEnd.setDate(finalEnd.getDate() + 1);
        if (isSuspensionDay(finalEnd)) {
          extraDays++;
          suspensionDaysAdded++;
        }
      }
      trace.push(`Neues Ende nach Hemmung: ${formatDateGerman(finalEnd)}`);
    }
  }

  // Final Shift: if deadline ends on Sat/Sun/Holiday, move to next working day
  let isShifted = false;
  let shiftReason = null;
  let safety = 0;
  
  while (safety < 31) {
    const holiday = isAustrianHoliday(finalEnd);
    const weekend = isWeekend(finalEnd);
    
    if (!holiday && !weekend) break;

    isShifted = true;
    shiftReason = holiday || (finalEnd.getDay() === 6 ? "Samstag" : "Sonntag");
    finalEnd.setDate(finalEnd.getDate() + 1);
    safety++;
  }

  if (isShifted) {
    trace.push(`Letzter Tag war ein ${shiftReason}. Fristende verschoben auf den nächsten Werktag: ${formatDateGerman(finalEnd)}`);
  } else {
    trace.push(`Fristende fällt auf einen Werktag: ${formatDateGerman(finalEnd)}`);
  }

  return {
    startDate: start,
    nominalEnd,
    finalEnd,
    isShifted,
    shiftReason,
    suspensionDaysAdded,
    trace
  };
}

export function formatDateGerman(date: Date): string {
  return date.toLocaleDateString('de-AT', {
    weekday: 'long',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}
