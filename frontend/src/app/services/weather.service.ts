import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap, switchMap } from 'rxjs/operators';

export interface CitySearchResult {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
  countryCode?: string;
  timezone: string;
}

export interface CurrentForecast {
  time: string;
  temp: number;
  humidity: number;
  apparentTemp: number;
  isDay: boolean;
  precipitation: number;
  weatherCode: number;
  cloudCover: number;
  pressure: number;
  windSpeed: number;
}

export interface HourlyForecast {
  time: string;
  temp: number;
  humidity: number;
  weatherCode: number;
  windSpeed: number;
}

export interface DailyForecast {
  date: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  apparentTempMax: number;
  apparentTempMin: number;
  sunrise: string;
  sunset: string;
  uvIndexMax: number;
}

export interface CityWeatherDto {
  latitude: number;
  longitude: number;
  timezone: string;
  current: CurrentForecast;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
}

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api';

  // Signals
  currentCity = signal<CitySearchResult | null>(null);
  currentWeather = signal<CityWeatherDto | null>(null);
  favorites = signal<CitySearchResult[]>([]);
  isLoading = signal<boolean>(false);
  errorMsg = signal<string | null>(null);
  backgroundOverride = signal<string | null>(null);

  constructor() {
    this.loadFavorites();
  }

  searchCities(query: string): Observable<CitySearchResult[]> {
    if (!query || query.trim().length < 2) return of([]);
    return this.http.get<CitySearchResult[]>(`${this.apiUrl}/weather/search`, {
      params: { query: query.trim() }
    }).pipe(
      catchError(err => {
        console.error('Error searching cities:', err);
        return of([]);
      })
    );
  }

  fetchWeather(city: CitySearchResult) {
    this.isLoading.set(true);
    this.errorMsg.set(null);
    this.currentCity.set(city);

    const params: any = {
      latitude: city.latitude.toString(),
      longitude: city.longitude.toString()
    };
    if (city.timezone) {
      params.timezone = city.timezone;
    }

    this.http.get<CityWeatherDto>(`${this.apiUrl}/weather`, { params }).pipe(
      tap(weather => {
        this.currentWeather.set(weather);
        this.isLoading.set(false);
      }),
      catchError(err => {
        console.error('Error fetching weather:', err);
        this.errorMsg.set('Failed to load weather data. Please try again.');
        this.currentWeather.set(null);
        this.isLoading.set(false);
        return of(null);
      })
    ).subscribe();
  }

  fetchWeatherForCoordinates(lat: number, lon: number) {
    this.isLoading.set(true);
    this.errorMsg.set(null);

    // Default placeholder in case reverse geocode fails
    const fallbackCity: CitySearchResult = {
      name: 'Current Location',
      latitude: lat,
      longitude: lon,
      country: '',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
    this.currentCity.set(fallbackCity);

    // Fetch locality and country details via open reverse geocoding client
    this.http.get<any>(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`)
      .pipe(
        tap(res => {
          if (res) {
            const resolvedCity: CitySearchResult = {
              name: res.city || res.locality || 'Current Location',
              latitude: lat,
              longitude: lon,
              country: res.countryName || '',
              admin1: res.principalSubdivision || undefined,
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            };
            this.currentCity.set(resolvedCity);
          }
        }),
        catchError(err => {
          console.warn('Reverse geocoding failed, using fallback name:', err);
          return of(null);
        }),
        switchMap(() => {
          const city = this.currentCity() || fallbackCity;
          const params: any = {
            latitude: lat.toString(),
            longitude: lon.toString()
          };
          if (city.timezone) {
            params.timezone = city.timezone;
          }
          return this.http.get<CityWeatherDto>(`${this.apiUrl}/weather`, { params });
        }),
        tap(weather => {
          this.currentWeather.set(weather);
          this.isLoading.set(false);
        }),
        catchError(err => {
          console.error('Error fetching weather for coordinates:', err);
          this.errorMsg.set('Failed to load weather for your location.');
          this.currentWeather.set(null);
          this.isLoading.set(false);
          return of(null);
        })
      ).subscribe();
  }

  // Favorites Management
  private loadFavorites() {
    try {
      const stored = localStorage.getItem('weather_favorites');
      if (stored) {
        this.favorites.set(JSON.parse(stored));
      } else {
        // Add a default favorite (e.g. London) if none exists
        const defaultCity: CitySearchResult = {
          name: 'London',
          latitude: 51.50853,
          longitude: -0.12574,
          country: 'United Kingdom',
          countryCode: 'GB',
          timezone: 'Europe/London'
        };
        this.favorites.set([defaultCity]);
        this.saveFavoritesToStorage([defaultCity]);
      }
    } catch (e) {
      console.error('Failed to load favorites from localStorage', e);
    }
  }

  private saveFavoritesToStorage(favs: CitySearchResult[]) {
    try {
      localStorage.setItem('weather_favorites', JSON.stringify(favs));
    } catch (e) {
      console.error('Failed to save favorites to localStorage', e);
    }
  }

  addFavorite(city: CitySearchResult) {
    const current = this.favorites();
    if (!current.some(c => c.latitude === city.latitude && c.longitude === city.longitude)) {
      const updated = [...current, city];
      this.favorites.set(updated);
      this.saveFavoritesToStorage(updated);
    }
  }

  removeFavorite(city: CitySearchResult) {
    const updated = this.favorites().filter(c => !(c.latitude === city.latitude && c.longitude === city.longitude));
    this.favorites.set(updated);
    this.saveFavoritesToStorage(updated);
  }

  isFavorite(city: CitySearchResult): boolean {
    return this.favorites().some(c => c.latitude === city.latitude && c.longitude === city.longitude);
  }

  // Helper to translate weather codes to description, icon class (FontAwesome-like SVGs or CSS classes)
  getWeatherInfo(code: number, isDay: boolean = true) {
    switch (code) {
      case 0:
        return {
          description: isDay ? 'Sunny' : 'Clear Night',
          icon: isDay ? '☀️' : '🌙',
          class: isDay ? 'sunny-theme' : 'night-theme',
          bgGradient: isDay
            ? 'linear-gradient(160deg, #1ca7ec 0%, #4adede 25%, #7ce5f0 50%, #f9d423 85%, #ff6b35 100%)'
            : 'linear-gradient(160deg, #020111 0%, #0a0e2a 30%, #191970 60%, #1a1145 100%)'
        };
      case 1:
      case 2:
      case 3:
        return {
          description: code === 1 ? 'Mainly Clear' : code === 2 ? 'Partly Cloudy' : 'Overcast',
          icon: code === 1 ? (isDay ? '🌤️' : '🌙') : code === 2 ? '⛅' : '☁️',
          class: isDay ? 'cloudy-theme' : 'night-cloudy-theme',
          bgGradient: isDay
            ? 'linear-gradient(160deg, #3a8fd8 0%, #87afc7 40%, #9fb8c4 60%, #c4cfd6 100%)'
            : 'linear-gradient(160deg, #070b1a 0%, #111d3a 40%, #1b2a50 70%, #0f1628 100%)'
        };
      case 45:
      case 48:
        return {
          description: 'Foggy',
          icon: '🌫️',
          class: 'foggy-theme',
          bgGradient: isDay
            ? 'linear-gradient(160deg, #8e9eab 0%, #b8c6db 40%, #c9d6df 70%, #eef2f3 100%)'
            : 'linear-gradient(160deg, #1a1f2e 0%, #2d3548 40%, #3d4558 100%)'
        };
      case 51:
      case 53:
      case 55:
      case 56:
      case 57:
        return {
          description: 'Drizzle',
          icon: '🌧️',
          class: 'rainy-theme',
          bgGradient: isDay
            ? 'linear-gradient(160deg, #4a6d8c 0%, #5f8a9e 35%, #7fa3b5 65%, #94b3c4 100%)'
            : 'linear-gradient(160deg, #0a1628 0%, #152238 40%, #1e3050 100%)'
        };
      case 61:
      case 63:
      case 65:
      case 66:
      case 67:
      case 80:
      case 81:
      case 82:
        return {
          description: 'Rainy',
          icon: '🌧️',
          class: 'rainy-theme',
          bgGradient: isDay
            ? 'linear-gradient(160deg, #3b5a7c 0%, #4a6e8c 30%, #637f94 60%, #7a96a8 100%)'
            : 'linear-gradient(160deg, #080e1a 0%, #101c30 35%, #1a2d48 70%, #0d1520 100%)'
        };
      case 71:
      case 73:
      case 75:
      case 77:
      case 85:
      case 86:
        return {
          description: 'Snowy',
          icon: '❄️',
          class: 'snowy-theme',
          bgGradient: isDay
            ? 'linear-gradient(160deg, #a8c0d0 0%, #c5d5e0 30%, #dce6ec 60%, #e8eff4 100%)'
            : 'linear-gradient(160deg, #121a2e 0%, #1e2a42 40%, #2a3856 100%)'
        };
      case 95:
      case 96:
      case 99:
        return {
          description: 'Thunderstorm',
          icon: '⛈️',
          class: 'stormy-theme',
          bgGradient: 'linear-gradient(160deg, #0a0a12 0%, #1a1030 25%, #2d1b4e 50%, #1a1530 75%, #0a0a15 100%)'
        };
      default:
        return {
          description: 'Unknown',
          icon: '🌡️',
          class: 'default-theme',
          bgGradient: isDay
            ? 'linear-gradient(160deg, #2980b9 0%, #6dd5fa 50%, #ffffff 100%)'
            : 'linear-gradient(160deg, #020111 0%, #0a0e2a 50%, #191970 100%)'
        };
    }
  }

  getOverrideGradient(override: string): string {
    switch (override) {
      case 'sunny':
        return 'linear-gradient(160deg, #1ca7ec 0%, #4adede 25%, #7ce5f0 50%, #f9d423 85%, #ff6b35 100%)';
      case 'night-clear':
        return 'linear-gradient(160deg, #020111 0%, #0a0e2a 30%, #191970 60%, #1a1145 100%)';
      case 'cloudy':
        return 'linear-gradient(160deg, #3a8fd8 0%, #87afc7 40%, #9fb8c4 60%, #c4cfd6 100%)';
      case 'night-cloudy':
        return 'linear-gradient(160deg, #070b1a 0%, #111d3a 40%, #1b2a50 70%, #0f1628 100%)';
      case 'rainy':
        return 'linear-gradient(160deg, #080e1a 0%, #101c30 35%, #1a2d48 70%, #0d1520 100%)';
      case 'snowy':
        return 'linear-gradient(160deg, #121a2e 0%, #1e2a42 40%, #2a3856 100%)';
      case 'stormy':
        return 'linear-gradient(160deg, #0a0a12 0%, #1a1030 25%, #2d1b4e 50%, #1a1530 75%, #0a0a15 100%)';
      case 'foggy':
        return 'linear-gradient(160deg, #1a1f2e 0%, #2d3548 40%, #3d4558 100%)';
      default:
        return 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)';
    }
  }
}
