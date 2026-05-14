import { format } from 'date-fns';

export const getDayAndHijri = (date: Date = new Date()) => {
  return format(date, 'EEEE, d MMMM yyyy');
};
