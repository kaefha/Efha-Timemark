export type CoordinateFormat = 'decimal' | 'dms';

export type WeatherCondition =
  | 'sunny'
  | 'partly_cloudy'
  | 'cloudy'
  | 'rainy'
  | 'storm'
  | 'snow'
  | 'fog'
  | 'windy';

export type LayerId =
  | 'minimap'
  | 'logo'
  | 'accentBar'
  | 'timestamp'
  | 'location'
  | 'coordinate'
  | 'photoCode'
  | 'branding'
  | 'verticalWatermark'
  | 'weather'
  | 'metadata';

export type BackgroundStyle =
  | 'none'
  | 'glass-dark'
  | 'glass-light'
  | 'pill'
  | 'solid-dark'
  | 'solid-white'
  | 'outline';

export interface LayerConfig {
  id: LayerId;
  name: string;
  category: 'content' | 'visual' | 'security';
  enabled: boolean;
  x: number; // Percentage 0 - 100 of image width
  y: number; // Percentage 0 - 100 of image height
  fontSize: number; // Base font size in px (scalable)
  textColor: string; // Color hex
  bgStyle: BackgroundStyle;
  bgOpacity: number; // 0 - 100
  accentColor?: string;
  width?: number; // Optional custom width for graphics/minimap
  height?: number; // Optional custom height for graphics/minimap
}

export interface MinimapConfig {
  streetName: string;
  style: 'apple-maps' | 'satellite' | 'dark' | 'simple';
  showRadarCone: boolean;
  showPin: boolean;
}

export interface LogoConfig {
  type: 'circular_badge' | 'custom_image';
  text: string; // e.g. "MAI"
  subText?: string;
  imageUrl?: string | null;
  primaryColor: string; // e.g. '#2563eb'
  secondaryColor: string; // e.g. '#dc2626'
  size: number;
}

export interface PhotoCodeConfig {
  code: string; // e.g. "3DCCRBEMM2TE9U"
  showShieldIcon: boolean;
  showPrefix: boolean; // "Photo Code: "
}

export interface BrandingConfig {
  prefix: string; // "Photo by"
  brandName: string; // "Time"
  brandSuffix: string; // "mark"
  suffixColor: string; // e.g. "#facc15"
}

export interface VerticalWatermarkConfig {
  text: string; // e.g. "© 3DCCRBEMM2TE9U Timemark Verified"
}

export interface TimestampConfig {
  mode: 'live' | 'manual';
  customDate: string; // YYYY-MM-DD
  customTime: string; // HH:mm:ss
  timezone: string; // 'WIB' | 'WITA' | 'WIT' | 'UTC' | 'LOCAL'
  dateFormat: 'DD/MM/YYYY' | 'YYYY-MM-DD' | 'DD MMMM YYYY' | 'MM/DD/YYYY' | 'DAY_DD_MON_YYYY';
  timeFormat: '24h' | '12h';
  showDayOfWeek: boolean;
  showSeconds: boolean;
  showTimezone: boolean;
}

export interface LocationConfig {
  placeName: string;
  address: string;
  city: string;
  country: string;
  showPlaceName: boolean;
  showAddress: boolean;
  showCity: boolean;
  isManuallyEdited: boolean;
}

export interface CoordinateConfig {
  enabled: boolean;
  latitude: number;
  longitude: number;
  altitude: number;
  accuracy: number;
  format: CoordinateFormat;
  showAltitude: boolean;
  showAccuracy: boolean;
}

export interface WeatherConfig {
  enabled: boolean;
  condition: WeatherCondition;
  temperature: number;
  humidity: number;
  windSpeed: string;
  airQuality: string;
  showTemperature: boolean;
  showHumidity: boolean;
  showAirQuality: boolean;
}

export interface MetadataConfig {
  projectName: string;
  authorName: string;
  notes: string;
  badgeType: 'none' | 'verified_gps' | 'safety_first' | 'iso_audit' | 'timemark_official' | 'custom';
  customBadgeText: string;
}

export interface TimemarkState {
  timestamp: TimestampConfig;
  location: LocationConfig;
  coordinate: CoordinateConfig;
  weather: WeatherConfig;
  metadata: MetadataConfig;
  minimap: MinimapConfig;
  logo: LogoConfig;
  photoCode: PhotoCodeConfig;
  branding: BrandingConfig;
  verticalWatermark: VerticalWatermarkConfig;
  layers: Record<LayerId, LayerConfig>;
  selectedLayerId: LayerId | null;
  globalFontFamily: 'Plus Jakarta Sans' | 'JetBrains Mono' | 'Arial' | 'Impact';
  globalScale: number;
  theme: 'light' | 'dark';
}
