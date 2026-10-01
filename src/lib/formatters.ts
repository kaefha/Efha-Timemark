import { CoordinateFormat, WeatherCondition } from '@/types/timemark';

export function toDMS(coordinate: number, isLatitude: boolean): string {
  const absolute = Math.abs(coordinate);
  const degrees = Math.floor(absolute);
  const minutesNotTruncated = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);
  const seconds = ((minutesNotTruncated - minutes) * 60).toFixed(1);

  let direction = '';
  if (isLatitude) {
    direction = coordinate >= 0 ? 'N' : 'S';
  } else {
    direction = coordinate >= 0 ? 'E' : 'W';
  }

  return `${degrees}°${minutes}'${seconds}"${direction}`;
}

export function formatCoordinates(
  lat: number,
  lng: number,
  format: CoordinateFormat
): string {
  if (format === 'dms') {
    return `${toDMS(lat, true)} ${toDMS(lng, false)}`;
  }
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

const INDONESIAN_DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const INDONESIAN_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const ENG_DAYS = ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'];
const ENG_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDateString(
  dateObj: Date,
  format: 'DD/MM/YYYY' | 'YYYY-MM-DD' | 'DD MMMM YYYY' | 'MM/DD/YYYY' | 'DAY_DD_MON_YYYY',
  showDayOfWeek: boolean
): string {
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const monthName = INDONESIAN_MONTHS[dateObj.getMonth()];
  const year = dateObj.getFullYear();
  const dayName = INDONESIAN_DAYS[dateObj.getDay()];

  let datePart = '';
  switch (format) {
    case 'DAY_DD_MON_YYYY':
      return `${ENG_DAYS[dateObj.getDay()]}, ${day} ${ENG_MONTHS[dateObj.getMonth()]} ${year}`;
    case 'DD/MM/YYYY':
      datePart = `${day}/${month}/${year}`;
      break;
    case 'YYYY-MM-DD':
      datePart = `${year}-${month}-${day}`;
      break;
    case 'DD MMMM YYYY':
      datePart = `${day} ${monthName} ${year}`;
      break;
    case 'MM/DD/YYYY':
      datePart = `${month}/${day}/${year}`;
      break;
  }

  return showDayOfWeek ? `${dayName}, ${datePart}` : datePart;
}

export function formatTimeString(
  hours: number,
  minutes: number,
  seconds: number,
  format: '24h' | '12h',
  showSeconds: boolean,
  timezone: string
): string {
  let h = hours;
  let ampm = '';

  if (format === '12h') {
    ampm = h >= 12 ? ' PM' : ' AM';
    h = h % 12 || 12;
  }

  const hStr = String(h).padStart(2, '0');
  const mStr = String(minutes).padStart(2, '0');
  const sStr = String(seconds).padStart(2, '0');

  const timeCore = showSeconds ? `${hStr}:${mStr}:${sStr}` : `${hStr}:${mStr}`;
  const tzStr = timezone && timezone !== 'LOCAL' ? ` ${timezone}` : '';

  return `${timeCore}${ampm}${tzStr}`;
}

export function getWeatherConditionName(condition: WeatherCondition): string {
  switch (condition) {
    case 'sunny':
      return 'Cerah';
    case 'partly_cloudy':
      return 'Cerah Berawan';
    case 'cloudy':
      return 'Berawan';
    case 'rainy':
      return 'Hujan Ringan/Sedang';
    case 'storm':
      return 'Hujan Petir';
    case 'snow':
      return 'Bersalju';
    case 'fog':
      return 'Berkabut';
    case 'windy':
      return 'Berangin';
    default:
      return 'Cerah';
  }
}
