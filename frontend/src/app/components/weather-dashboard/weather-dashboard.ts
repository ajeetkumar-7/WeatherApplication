import { Component, OnInit, inject, computed } from '@angular/core';
import { WeatherService, CitySearchResult } from '../../services/weather.service';
import { SearchBarComponent } from '../search-bar/search-bar';
import { FavoriteCitiesComponent } from '../favorite-cities/favorite-cities';
import { WeatherChartComponent } from '../weather-chart/weather-chart';

@Component({
  selector: 'app-weather-dashboard',
  standalone: true,
  imports: [SearchBarComponent, FavoriteCitiesComponent, WeatherChartComponent],
  templateUrl: './weather-dashboard.html',
  styleUrl: './weather-dashboard.css'
})
export class WeatherDashboardComponent implements OnInit {
  public weatherService = inject(WeatherService);
  protected readonly Math = Math;

  // Computed property to check if current city is favorite
  isCurrentFavorite = computed(() => {
    const city = this.weatherService.currentCity();
    if (!city) return false;
    return this.weatherService.isFavorite(city);
  });

  // Computed properties for weather translations
  weatherInfo = computed(() => {
    const weather = this.weatherService.currentWeather();
    if (!weather || !weather.current) return null;
    return this.weatherService.getWeatherInfo(
      weather.current.weatherCode,
      weather.current.isDay
    );
  });

  ngOnInit() {
    // If there is a favorite city, fetch its weather on load
    const favs = this.weatherService.favorites();
    if (favs.length > 0) {
      this.weatherService.fetchWeather(favs[0]);
    } else {
      // Fallback geocode for London
      const london: CitySearchResult = {
        name: 'London',
        latitude: 51.50853,
        longitude: -0.12574,
        country: 'United Kingdom',
        countryCode: 'GB',
        timezone: 'Europe/London'
      };
      this.weatherService.fetchWeather(london);
    }
  }

  toggleFavorite() {
    const city = this.weatherService.currentCity();
    if (!city) return;

    if (this.isCurrentFavorite()) {
      this.weatherService.removeFavorite(city);
    } else {
      this.weatherService.addFavorite(city);
    }
  }

  // Format date helper
  formatDate(isoString: string): string {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  }

  // Format day name helper
  getDayName(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      // If it is today, return 'Today'
      const today = new Date();
      if (date.toDateString() === today.toDateString()) {
        return 'Today';
      }
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } catch {
      return dateStr;
    }
  }

  // Helper to extract time only from timestamp
  formatTime(isoString: string): string {
    if (!isoString) return '';
    return isoString.substring(11, 16);
  }
}
