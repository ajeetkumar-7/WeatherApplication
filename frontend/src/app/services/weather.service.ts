import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

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

    this.http.get<CityWeatherDto>(`${this.apiUrl}/weather`, {
      params: {
        latitude: city.latitude.toString(),
        longitude: city.longitude.toString(),
        timezone: city.timezone
      }
    }).pipe(
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
            ? 'linear-gradient(135deg, #FF9900 0%, #FF5E62 100%)'
            : 'linear-gradient(135deg, #0c1445 0%, #1a1a4e 50%, #0d0d2b 100%)'
        };
      case 1:
      case 2:
      case 3:
        return {
          description: code === 1 ? 'Mainly Clear' : code === 2 ? 'Partly Cloudy' : 'Overcast',
          icon: code === 1 ? (isDay ? '🌤️' : '🌙') : code === 2 ? '⛅' : '☁️',
          class: isDay ? 'cloudy-theme' : 'night-cloudy-theme',
          bgGradient: isDay
            ? 'linear-gradient(135deg, #5D8AA8 0%, #4682B4 100%)'
            : 'linear-gradient(135deg, #0f1b3d 0%, #1c2951 50%, #141e3d 100%)'
        };
      case 45:
      case 48:
        return {
          description: 'Foggy',
          icon: '🌫️',
          class: 'foggy-theme',
          bgGradient: isDay
            ? 'linear-gradient(135deg, #708090 0%, #A9A9A9 100%)'
            : 'linear-gradient(135deg, #2c3e50 0%, #4a5568 100%)'
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
            ? 'linear-gradient(135deg, #4a6fa5 0%, #6b8cae 100%)'
            : 'linear-gradient(135deg, #1a2a4a 0%, #2c3e60 100%)'
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
            ? 'linear-gradient(135deg, #3a5f8a 0%, #556b82 100%)'
            : 'linear-gradient(135deg, #101d30 0%, #1a2d45 100%)'
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
            ? 'linear-gradient(135deg, #bcc6d0 0%, #8faabe 100%)'
            : 'linear-gradient(135deg, #1a2340 0%, #2a3550 100%)'
        };
      case 95:
      case 96:
      case 99:
        return {
          description: 'Thunderstorm',
          icon: '⛈️',
          class: 'stormy-theme',
          bgGradient: 'linear-gradient(135deg, #0F2027 0%, #18303a 50%, #1a2f3f 100%)'
        };
      default:
        return {
          description: 'Unknown',
          icon: '🌡️',
          class: 'default-theme',
          bgGradient: isDay
            ? 'linear-gradient(135deg, #3A6073 0%, #3A7BD5 100%)'
            : 'linear-gradient(135deg, #0c1445 0%, #1a1a4e 100%)'
        };
    }
  }
}
