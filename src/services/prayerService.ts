import {
  Coordinates,
  CalculationMethod,
  PrayerTimes,
  SunnahTimes,
  Prayer
} from 'adhan';
import { formatInTimeZone } from 'date-fns-tz';

export interface PrayerTimeInfo {
  name: string;
  time: Date;
  id: any;
}

export const getPrayerTimes = (
  latitude: number,
  longitude: number,
  methodName: keyof typeof CalculationMethod = 'MuslimWorldLeague'
) => {
  const coords = new Coordinates(latitude, longitude);
  const date = new Date();
  const params = CalculationMethod[methodName]();
  const prayerTimes = new PrayerTimes(coords, date, params);
  
  const prayers = [
    { id: Prayer.Fajr, name: 'Fajr' },
    { id: Prayer.Dhuhr, name: 'Dhuhr' },
    { id: Prayer.Asr, name: 'Asr' },
    { id: Prayer.Maghrib, name: 'Maghrib' },
    { id: Prayer.Isha, name: 'Isha' },
  ];

  return prayers.map(p => ({
    id: p.id,
    name: p.name,
    time: prayerTimes.timeForPrayer(p.id)!
  }));
};

export const getNextPrayer = (prayers: PrayerTimeInfo[]) => {
  const now = new Date();
  return prayers.find(p => p.time > now) || prayers[0];
};

export const formatPrayerTime = (date: Date, timeZone: string = Intl.DateTimeFormat().resolvedOptions().timeZone) => {
  return formatInTimeZone(date, timeZone, 'h:mm a');
};
