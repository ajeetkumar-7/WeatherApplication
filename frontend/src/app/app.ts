import { Component, inject, computed } from '@angular/core';
import { WeatherDashboardComponent } from './components/weather-dashboard/weather-dashboard';
import { WeatherBackgroundComponent } from './components/weather-background/weather-background';
import { WeatherService } from './services/weather.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [WeatherDashboardComponent, WeatherBackgroundComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  public weatherService = inject(WeatherService);

  // Dynamic gradient based on current weather code
  backgroundStyle = computed(() => {
    const override = this.weatherService.backgroundOverride();
    if (override) {
      return this.weatherService.getOverrideGradient(override);
    }

    const weather = this.weatherService.currentWeather();
    if (!weather || !weather.current) {
      // Default slate blue gradient
      return 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)';
    }
    
    const info = this.weatherService.getWeatherInfo(
      weather.current.weatherCode,
      weather.current.isDay
    );
    return info.bgGradient;
  });
}
