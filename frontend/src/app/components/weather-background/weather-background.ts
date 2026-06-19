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

  // General theme scene classification for top-level selectors
  scene = computed<WeatherScene>(() => {
    const override = this.weatherService.backgroundOverride() as WeatherScene;
    if (override) return override;

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

  // Layered condition triggers (to allow overlapping states like rainy night with stars/clouds)
  isNight = computed<boolean>(() => {
    const override = this.weatherService.backgroundOverride();
    if (override) {
      return ['night-clear', 'night-cloudy'].includes(override);
    }
    const weather = this.weatherService.currentWeather();
    return weather ? !weather.current.isDay : false;
  });

  showSun = computed<boolean>(() => {
    const override = this.weatherService.backgroundOverride();
    if (override) {
      return override === 'sunny';
    }
    const weather = this.weatherService.currentWeather();
    if (!weather || !weather.current) return false;
    const code = weather.current.weatherCode;
    const isDay = weather.current.isDay;
    // Show sun if it's day and NOT completely overcast, foggy, raining, snowing, or stormy
    const overcastOrWorse = [3, 45, 48, 51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 71, 73, 75, 77, 85, 86, 95, 96, 99];
    return isDay && !overcastOrWorse.includes(code);
  });

  hasClouds = computed<boolean>(() => {
    const override = this.weatherService.backgroundOverride();
    if (override) {
      return ['cloudy', 'night-cloudy', 'rainy', 'snowy', 'stormy', 'foggy'].includes(override);
    }
    const weather = this.weatherService.currentWeather();
    if (!weather || !weather.current) return false;
    const code = weather.current.weatherCode;
    // Clouds exist for code 1 (mainly clear), 2 (partly cloudy), 3 (overcast), fog, rain, snow, storm
    return code > 0;
  });

  hasRain = computed<boolean>(() => {
    const override = this.weatherService.backgroundOverride();
    if (override) {
      return ['rainy', 'stormy'].includes(override);
    }
    const weather = this.weatherService.currentWeather();
    if (!weather || !weather.current) return false;
    const code = weather.current.weatherCode;
    return [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code);
  });

  hasSnow = computed<boolean>(() => {
    const override = this.weatherService.backgroundOverride();
    if (override) {
      return override === 'snowy';
    }
    const weather = this.weatherService.currentWeather();
    if (!weather || !weather.current) return false;
    const code = weather.current.weatherCode;
    return [71, 73, 75, 77, 85, 86].includes(code);
  });

  hasLightning = computed<boolean>(() => {
    const override = this.weatherService.backgroundOverride();
    if (override) {
      return override === 'stormy';
    }
    const weather = this.weatherService.currentWeather();
    if (!weather || !weather.current) return false;
    const code = weather.current.weatherCode;
    return [95, 96, 99].includes(code);
  });

  hasFog = computed<boolean>(() => {
    const override = this.weatherService.backgroundOverride();
    if (override) {
      return override === 'foggy';
    }
    const weather = this.weatherService.currentWeather();
    if (!weather || !weather.current) return false;
    const code = weather.current.weatherCode;
    return [45, 48].includes(code);
  });

  // Precomputed arrays for rendering styling to avoid method execution inside template loops
  rainDrops: { left: string; delay: string; duration: string; opacity: number }[] = [];
  snowFlakes: { left: string; delay: string; duration: string; width: string; height: string }[] = [];
  stars: { left: string; top: string; delay: string; duration: string; width: string; height: string }[] = [];
  clouds = [0, 1, 2, 3, 4];

  constructor() {
    // Generate rain drops
    this.rainDrops = Array.from({ length: 60 }, (_, i) => {
      const left = (i * 17 + 5) % 100;
      const delay = ((i * 7 + 3) % 20) / 10;
      const duration = 0.6 + ((i * 3) % 5) / 10;
      const opacity = 0.3 + ((i * 11) % 7) / 10;
      return {
        left: `${left}%`,
        delay: `${delay}s`,
        duration: `${duration}s`,
        opacity: Math.min(opacity, 0.8)
      };
    });

    // Generate snowflakes
    this.snowFlakes = Array.from({ length: 40 }, (_, i) => {
      const left = (i * 23 + 7) % 100;
      const delay = ((i * 11 + 2) % 30) / 10;
      const duration = 4 + ((i * 7) % 6);
      const size = 4 + ((i * 3) % 6);
      return {
        left: `${left}%`,
        delay: `${delay}s`,
        duration: `${duration}s`,
        width: `${size}px`,
        height: `${size}px`
      };
    });

    // Generate stars
    this.stars = Array.from({ length: 80 }, (_, i) => {
      const left = (i * 13 + 7) % 100;
      const top = (i * 19 + 3) % 70;
      const delay = ((i * 7 + 5) % 40) / 10;
      const duration = 2 + ((i * 3) % 4);
      const size = 1 + ((i * 11) % 3);
      return {
        left: `${left}%`,
        top: `${top}%`,
        delay: `${delay}s`,
        duration: `${duration}s`,
        width: `${size}px`,
        height: `${size}px`
      };
    });
  }
}
