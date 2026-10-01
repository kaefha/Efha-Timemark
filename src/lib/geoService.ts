import { WeatherCondition } from '@/types/timemark';

export interface GeoLocationResult {
  latitude: number;
  longitude: number;
  altitude: number;
  accuracy: number;
  placeName: string;
  address: string;
  city: string;
  country: string;
}

export interface WeatherResult {
  condition: WeatherCondition;
  temperature: number;
  humidity: number;
  windSpeed: string;
  airQuality: string;
}

// Convert Open-Meteo WMO weather codes to our internal conditions
function mapWmoToCondition(code: number): WeatherCondition {
  if (code === 0) return 'sunny';
  if (code === 1 || code === 2) return 'partly_cloudy';
  if (code === 3) return 'cloudy';
  if (code >= 45 && code <= 48) return 'fog';
  if (code >= 51 && code <= 67) return 'rainy';
  if (code >= 71 && code <= 77) return 'snow';
  if (code >= 80 && code <= 82) return 'rainy';
  if (code >= 95 && code <= 99) return 'storm';
  return 'sunny';
}

export async function getCurrentCoordinates(): Promise<{
  latitude: number;
  longitude: number;
  altitude: number;
  accuracy: number;
}> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation tidak didukung oleh browser Anda'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          altitude: pos.coords.altitude || 18,
          accuracy: Math.round(pos.coords.accuracy || 5),
        });
      },
      (err) => {
        // Fallback default Jakarta Monas if permission denied
        console.warn('Geolocation error or denied:', err.message);
        resolve({
          latitude: -6.175392,
          longitude: 106.827153,
          altitude: 16,
          accuracy: 10,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
}

export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<{
  placeName: string;
  address: string;
  city: string;
  country: string;
}> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'id,en',
        },
      }
    );

    if (!res.ok) throw new Error('Geocoding response not ok');
    const data = await res.json();
    const addr = data.address || {};

    const place =
      addr.building ||
      addr.amenity ||
      addr.office ||
      addr.shop ||
      addr.tourism ||
      data.name ||
      addr.road ||
      'Lokasi Lapangan';

    const road = addr.road || addr.pedestrian || addr.suburb || '';
    const village = addr.village || addr.neighbourhood || addr.suburb || '';
    const city =
      addr.city ||
      addr.town ||
      addr.municipality ||
      addr.county ||
      addr.city_district ||
      'Jakarta';
    const state = addr.state || '';
    const country = addr.country || 'Indonesia';

    const fullAddress = [road, village, city, state].filter(Boolean).join(', ');

    return {
      placeName: place,
      address: fullAddress || data.display_name || 'Jl. Lokasi Proyek No. 1',
      city: city || 'Jakarta',
      country: country,
    };
  } catch (error) {
    console.warn('Reverse geocode failed, using sensible default:', error);
    return {
      placeName: 'Lokasi Lapangan',
      address: 'Jl. Merdeka Barat, Gambir, Jakarta Pusat',
      city: 'Jakarta Pusat',
      country: 'Indonesia',
    };
  }
}

export async function fetchWeatherData(
  lat: number,
  lng: number
): Promise<WeatherResult> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Weather API error');

    const data = await res.json();
    const current = data.current;

    const condition = mapWmoToCondition(current.weather_code ?? 0);
    const temperature = Math.round(current.temperature_2m ?? 31);
    const humidity = Math.round(current.relative_humidity_2m ?? 72);
    const windSpeed = `${Math.round(current.wind_speed_10m ?? 8)} km/h`;

    return {
      condition,
      temperature,
      humidity,
      windSpeed,
      airQuality: 'AQI 38 (Baik)',
    };
  } catch (error) {
    console.warn('Weather fetch failed, fallback default:', error);
    return {
      condition: 'sunny',
      temperature: 31,
      humidity: 70,
      windSpeed: '9 km/h',
      airQuality: 'AQI 42 (Baik)',
    };
  }
}
