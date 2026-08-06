import { searchCity, CityResult } from '../api/geocode';
import { fetchWeather, WeatherData, tempColor, weatherEmoji, weatherDesc } from '../api/data';
import { flyTo } from '../map/core';
import { toast } from './toast';

let currentCity: { lat: number; lon: number; name: string } | null = null;

export async function searchAndSelect(query: string) {
  const results = await searchCity(query);
  if (results.length === 0) { toast('City not found', 2000); return; }
  const city = results[0]!;
  currentCity = { lat: city.lat, lon: city.lon, name: city.name };
  flyTo(city.lat, city.lon, 9);
  toast(`Flying to ${city.name}`, 1500);
  updateCityPanel(city);
}

async function updateCityPanel(city: CityResult) {
  const panel = document.getElementById('city-panel');
  if (!panel) return;

  panel.innerHTML = `<div class="ld">Loading ${city.name}...</div>`;

  // Fetch weather for this city
  let weather: WeatherData | null = null;
  try {
    const results = await fetchWeatherForCity(city.lat, city.lon);
    weather = results;
  } catch { /* */ }

  // Fetch news
  let news: string[] = [];
  try {
    const res = await fetch(
      `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(city.name)}&format=json&maxrecords=5&sort=datedesc`,
      { signal: AbortSignal.timeout(5000) }
    );
    const data = await res.json();
    news = (data.articles || []).slice(0, 4).map((a: any) => a.title || '');
  } catch { /* */ }

  renderCityPanel(panel, city, weather, news);
}

async function fetchWeatherForCity(lat: number, lon: number): Promise<WeatherData | null> {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,pressure_msl&hourly=temperature_2m,precipitation_probability&daily=sunrise,sunset&timezone=auto&forecast_hours=6`,
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
      name: '',
      lat, lon,
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
  } catch {
    return null;
  }
}

function renderCityPanel(panel: HTMLElement, city: CityResult, weather: WeatherData | null, news: string[]) {
  panel.style.display = ''; // Make visible
  const col = weather?.temp != null ? tempColor(weather.temp) : '#888';

  let weatherHTML = '<div class="ld">Weather unavailable</div>';
  if (weather) {
    const hourlyHTML = weather.hourly.length > 0
      ? `<div class="hourly-row">${weather.hourly.map(h => {
        const time = h.time.split('T')[1]?.substring(0, 5) || h.time;
        return `<div class="hourly-item"><div>${time}</div><div style="color:${tempColor(h.temp)}">${Math.round(h.temp)}°</div><div style="font-size:7px;color:var(--dim)">${h.precip > 0 ? h.precip + '%' : ''}</div></div>`;
      }).join('')}</div>`
      : '';

    weatherHTML = `
      <div class="city-weather-card">
        <div class="city-temp-row">
          <span class="city-temp" style="color:${col}">${Math.round(weather.temp!)}°C</span>
          <span>${weather.emoji} ${weather.description}</span>
        </div>
        <div class="city-details">
          <div>🌡 Feels ${weather.feelsLike != null ? Math.round(weather.feelsLike) + '°' : '?'}</div>
          <div>💧 ${weather.humidity != null ? weather.humidity + '%' : '?'} humidity</div>
          <div>💨 Wind ${weather.wind != null ? Math.round(weather.wind) + ' km/h' : '?'} ${weather.windDir != null ? '(' + weather.windDir + '°)' : ''}</div>
          <div>🌅 ↑ ${weather.sunrise || '?'}  🌇 ↓ ${weather.sunset || '?'}</div>
        </div>
        ${hourlyHTML}
      </div>`;
  }

  const newsHTML = news.length > 0
    ? `<div class="section-hd">📰 ${city.name} News</div>${news.map(n => `<div class="item"><div class="i-h"><span class="i-t o">📰</span><span class="i-n">${n}</span></div></div>`).join('')}`
    : '';

  panel.innerHTML = `
    <div class="p-title" style="color:#09f">📍 ${city.name}
      <span class="badge">${city.lat.toFixed(1)}, ${city.lon.toFixed(1)}</span>
    </div>
    <div class="p-body">${weatherHTML}${newsHTML}</div>
  `;
}

export function initCitySearch() {
  const input = document.getElementById('city-search') as HTMLInputElement;
  const results = document.getElementById('city-results')!;

  let timer: ReturnType<typeof setTimeout>;
  input?.addEventListener('input', () => {
    clearTimeout(timer);
    const q = input.value.trim();
    if (q.length < 2) { results.innerHTML = ''; return; }
    timer = setTimeout(async () => {
      const cities = await searchCity(q);
      if (cities.length === 0) { results.innerHTML = '<div class="cmd-item">No cities found</div>'; return; }
      results.innerHTML = cities.map(c =>
        `<div class="cmd-item" data-lat="${c.lat}" data-lon="${c.lon}" data-name="${c.name}">📍 ${c.display}</div>`
      ).join('');
      results.querySelectorAll('.cmd-item').forEach(el => {
        el.addEventListener('click', () => {
          const lat = parseFloat((el as HTMLElement).dataset.lat!);
          const lon = parseFloat((el as HTMLElement).dataset.lon!);
          const name = (el as HTMLElement).dataset.name!;
          input.value = name;
          results.innerHTML = '';
          searchAndSelect(name);
        });
      });
    }, 300);
  });

  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { searchAndSelect(input.value.trim()); results.innerHTML = ''; }
    if (e.key === 'Escape') results.innerHTML = '';
  });

  // Close results on click outside
  document.addEventListener('click', (e) => {
    if (!(e.target as HTMLElement).closest('#city-search-wrap')) results.innerHTML = '';
  });
}
