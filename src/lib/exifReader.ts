import exifr from 'exifr';

export interface ExifExtractionResult {
  hasExif: boolean;
  date?: Date;
  latitude?: number;
  longitude?: number;
  altitude?: number;
  cameraMake?: string;
  cameraModel?: string;
}

export async function extractExifFromBlob(file: File | Blob): Promise<ExifExtractionResult> {
  try {
    const data = await exifr.parse(file, {
      tiff: true,
      xmp: true,
      icc: false,
      jfif: false,
      ihdr: false,
      gps: true,
    });

    if (!data) {
      return { hasExif: false };
    }

    const result: ExifExtractionResult = {
      hasExif: true,
      date: data.DateTimeOriginal || data.CreateDate || data.ModifyDate,
      latitude: data.latitude,
      longitude: data.longitude,
      altitude: data.GPSAltitude,
      cameraMake: data.Make,
      cameraModel: data.Model,
    };

    return result;
  } catch (error) {
    console.warn('Could not parse EXIF:', error);
    return { hasExif: false };
  }
}
