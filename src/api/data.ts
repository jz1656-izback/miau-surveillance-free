export interface QuakeData {
  lat: number; lon: number; mag: number; place: string; depth: number;
}

export async function fetchQuakes(): Promise<QuakeData[]> {
  const res = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson');
  const data = await res.json();
  return (data.features || []).map((q: any) => {
    const [lon, lat, depth] = q.geometry.coordinates;
    return { lat, lon, mag: q.properties.mag, place: q.properties.place, depth };
  });
}

export interface DisasterData {
  lat: number; lon: number; title: string; categories: string;
}

export async function fetchDisasters(): Promise<DisasterData[]> {
  try {
    const res = await fetch('https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=20', { signal: AbortSignal.timeout(8000) });
    const data = await res.json();
    return (data.events || [])
      .filter((e: any) => e.geometry?.length)
      .map((e: any) => ({
        lat: e.geometry[0].coordinates[1],
        lon: e.geometry[0].coordinates[0],
        title: e.title,
        categories: e.categories.map((c: any) => c.title).join(', '),
      }));
  } catch {
    return [];
  }
}

export interface WeatherData {
  name: string; lat: number; lon: number;
  temp: number | null; feelsLike: number | null; humidity: number | null;
  wind: number | null; windDir: number | null;
  emoji: string; description: string;
  sunrise: string | null; sunset: string | null;
  hourly: { time: string; temp: number; precip: number }[];
}

const WEATHER_CITIES = [
  { n: 'Berlin', la: 52.52, lo: 13.41 }, { n: 'New York', la: 40.71, lo: -74.01 },
  { n: 'Tokyo', la: 35.68, lo: 139.76 }, { n: 'London', la: 51.51, lo: -0.13 },
  { n: 'Dubai', la: 25.2, lo: 55.27 }, { n: 'Singapore', la: 1.35, lo: 103.82 },
  { n: 'Sydney', la: -33.87, lo: 151.21 }, { n: 'Moscow', la: 55.75, lo: 37.62 },
  { n: 'Sao Paulo', la: -23.55, lo: -46.63 }, { n: 'Cairo', la: 30.04, lo: 31.24 },
  { n: 'Los Angeles', la: 34.05, lo: -118.24 }, { n: 'Mumbai', la: 19.08, lo: 72.88 },
  { n: 'Paris', la: 48.86, lo: 2.35 }, { n: 'Istanbul', la: 41.01, lo: 28.98 },
  { n: 'Seoul', la: 37.57, lo: 126.98 },
];

function weatherEmoji(code: number): string {
  if (code >= 95) return '⛈'; if (code >= 80) return '🌧'; if (code >= 60) return '🌦';
  if (code >= 40) return '☁'; if (code >= 1) return '⛅'; return '☀';
}

function weatherDesc(code: number): string {
  if (code >= 95) return 'Thunderstorm'; if (code >= 80) return 'Rain';
  if (code >= 60) return 'Drizzle'; if (code >= 40) return 'Fog/Cloudy';
  if (code >= 1) return 'Partly cloudy'; return 'Clear';
}

function tempColor(temp: number): string {
  if (temp >= 35) return '#ff2020'; if (temp >= 28) return '#ff6600';
  if (temp >= 20) return '#ffaa00'; if (temp >= 12) return '#88cc00';
  if (temp >= 5) return '#00cc66'; if (temp >= -5) return '#00cccc';
  return '#4488ff';
}

export { weatherEmoji, weatherDesc, tempColor };

export async function fetchWeather(): Promise<WeatherData[]> {
  const results = await Promise.allSettled(
    WEATHER_CITIES.map(async city => {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${city.la}&longitude=${city.lo}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,precipitation_probability&daily=sunrise,sunset&timezone=auto&forecast_hours=6`,
        { signal: AbortSignal.timeout(5000) }
      );
      const data = await res.json();
      const c = data.current || {};
      const d = data.daily || {};
      const h = data.hourly || {};
      const hourly = [];
      if (h.time && h.temperature_2m) {
        for (let i = 0; i < Math.min(6, h.time.length); i++) {
          hourly.push({
            time: h.time[i],
            temp: h.temperature_2m[i],
            precip: h.precipitation_probability?.[i] ?? 0,
          });
        }
      }
      return {
        name: city.n, lat: city.la, lon: city.lo,
        temp: c.temperature_2m ?? null,
        feelsLike: c.apparent_temperature ?? null,
        humidity: c.relative_humidity_2m ?? null,
        wind: c.wind_speed_10m ?? null,
        windDir: c.wind_direction_10m ?? null,
        emoji: weatherEmoji(c.weather_code || 0),
        description: weatherDesc(c.weather_code || 0),
        sunrise: d.sunrise?.[0]?.split('T')[1] || null,
        sunset: d.sunset?.[0]?.split('T')[1] || null,
        hourly,
      };
    })
  );
  return results
    .filter((r): r is PromiseFulfilledResult<WeatherData> => r.status === 'fulfilled')
    .map(r => r.value);
}
