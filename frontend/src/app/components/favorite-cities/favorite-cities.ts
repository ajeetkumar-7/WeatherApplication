import { Component, inject } from '@angular/core';
import { WeatherService, CitySearchResult } from '../../services/weather.service';

@Component({
  selector: 'app-favorite-cities',
  standalone: true,
  templateUrl: './favorite-cities.html',
  styleUrl: './favorite-cities.css'
})
export class FavoriteCitiesComponent {
  public weatherService = inject(WeatherService);

  selectCity(city: CitySearchResult) {
    this.weatherService.fetchWeather(city);
  }

  removeFavorite(event: Event, city: CitySearchResult) {
    event.stopPropagation(); // Avoid triggering selectCity
    this.weatherService.removeFavorite(city);
  }
}
