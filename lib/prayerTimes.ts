'use client';

import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';

const SEMARANG_LAT = -6.99306;
const SEMARANG_LNG = 110.42083;

function getNextPrayer(times: PrayerTimes): { name: string; time: Date } {
  const now = new Date();
  const prayers = [
    { name: 'Subuh', time: times.fajr },
    { name: 'Dzuhur', time: times.dhuhr },
    { name: 'Ashar', time: times.asr },
    { name: 'Maghrib', time: times.maghrib },
    { name: "Isya'", time: times.isha },
  ];

  for (const prayer of prayers) {
    if (prayer.time > now) {
      return prayer;
    }
  }

  // All prayers passed, return Fajr tomorrow
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const coords = new Coordinates(SEMARANG_LAT, SEMARANG_LNG);
  const params = CalculationMethod.Singapore();
  const tomorrowTimes = new PrayerTimes(coords, tomorrow, params);
  return { name: 'Subuh (Besok)', time: tomorrowTimes.fajr };
}

export async function getTimes(): Promise<{ name: string; time: Date }> {
  const coords = new Coordinates(SEMARANG_LAT, SEMARANG_LNG);
  const params = CalculationMethod.Singapore();
  const today = new Date();
  const prayerTimes = new PrayerTimes(coords, today, params);
  return getNextPrayer(prayerTimes);
}