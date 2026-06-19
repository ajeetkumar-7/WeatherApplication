import { Component, inject, computed } from '@angular/core';
import { WeatherService } from '../../services/weather.service';

type WeatherScene = 'sunny' | 'night-clear' | 'cloudy' | 'night-cloudy' | 'rainy' | 'snowy' | 'stormy' | 'foggy' | 'default';

@Component({
  selector: 'app-weather-background',
  standalone: true,
  templateUrl: './weather-background.html',
  styleUrl: './weather-background.css'
})
export class WeatherBackgroundComponent {
  private weatherService = inject(WeatherService);

  scene = computed<WeatherScene>(() => {
    const weather = this.weatherService.currentWeather();
    if (!weather || !weather.current) return 'default';
    
    const code = weather.current.weatherCode;
    const isDay = weather.current.isDay;

    // Thunderstorm
    if ([95, 96, 99].includes(code)) return 'stormy';
    // Rain / Drizzle
    if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'rainy';
    // Snow
    if ([71, 73, 75, 77, 85, 86].includes(code)) return 'snowy';
    // Fog
    if ([45, 48].includes(code)) return 'foggy';
    // Cloudy
    if ([2, 3].includes(code)) return isDay ? 'cloudy' : 'night-cloudy';
    // Clear / Mainly Clear
    return isDay ? 'sunny' : 'night-clear';
  });

  // Generate arrays for template loops
  rainDrops = Array.from({ length: 60 }, (_, i) => i);
  snowFlakes = Array.from({ length: 40 }, (_, i) => i);
  stars = Array.from({ length: 80 }, (_, i) => i);
  clouds = [0, 1, 2, 3, 4];

  // Pseudo-random but deterministic positioning per index
  getDropStyle(i: number) {
    const left = (i * 17 + 5) % 100;
    const delay = ((i * 7 + 3) % 20) / 10;
    const duration = 0.6 + ((i * 3) % 5) / 10;
    const opacity = 0.3 + ((i * 11) % 7) / 10;
    return {
      left: left + '%',
      animationDelay: delay + 's',
      animationDuration: duration + 's',
      opacity: Math.min(opacity, 0.8)
    };
  }

  getSnowStyle(i: number) {
    const left = (i * 23 + 7) % 100;
    const delay = ((i * 11 + 2) % 30) / 10;
    const duration = 4 + ((i * 7) % 6);
    const size = 4 + ((i * 3) % 6);
    return {
      left: left + '%',
      animationDelay: delay + 's',
      animationDuration: duration + 's',
      width: size + 'px',
      height: size + 'px'
    };
  }

  getStarStyle(i: number) {
    const left = (i * 13 + 7) % 100;
    const top = (i * 19 + 3) % 70;
    const delay = ((i * 7 + 5) % 40) / 10;
    const duration = 2 + ((i * 3) % 4);
    const size = 1 + ((i * 11) % 3);
    return {
      left: left + '%',
      top: top + '%',
      animationDelay: delay + 's',
      animationDuration: duration + 's',
      width: size + 'px',
      height: size + 'px'
    };
  }
}
