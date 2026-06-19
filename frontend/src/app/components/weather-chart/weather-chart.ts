import { Component, input, computed } from '@angular/core';
import { HourlyForecast } from '../../services/weather.service';

interface ChartPoint {
  x: number;
  y: number;
  temp: number;
  timeLabel: string;
}

@Component({
  selector: 'app-weather-chart',
  standalone: true,
  templateUrl: './weather-chart.html',
  styleUrl: './weather-chart.css'
})
export class WeatherChartComponent {
  // Signal input
  hourly = input<HourlyForecast[]>([]);

  // Dimensions of SVG viewBox
  width = 700;
  height = 180;
  paddingX = 40;
  paddingY = 35;

  chartPoints = computed<ChartPoint[]>(() => {
    const data = this.hourly();
    if (data.length === 0) return [];

    // Filter to show every 2nd hour (12 points total) for visual balance on small screens
    const filteredData: HourlyForecast[] = [];
    for (let i = 0; i < data.length; i += 2) {
      filteredData.push(data[i]);
    }

    const temps = filteredData.map(d => d.temp);
    const minTemp = Math.min(...temps);
    const maxTemp = Math.max(...temps);
    const tempRange = maxTemp - minTemp === 0 ? 1 : maxTemp - minTemp;

    const usableWidth = this.width - (this.paddingX * 2);
    const usableHeight = this.height - (this.paddingY * 2);
    const stepX = usableWidth / (filteredData.length - 1);

    return filteredData.map((d, index) => {
      const x = this.paddingX + (index * stepX);
      // Invert Y because SVG coordinates start from top-left (0,0)
      const ratio = (d.temp - minTemp) / tempRange;
      const y = this.height - this.paddingY - (ratio * usableHeight);
      
      // Parse time label (e.g. "2026-06-19T23:00" -> "23:00")
      const timeLabel = d.time.substring(11, 16);

      return { x, y, temp: Math.round(d.temp), timeLabel };
    });
  });

  linePath = computed<string>(() => {
    const points = this.chartPoints();
    if (points.length === 0) return '';
    return points.reduce((path, p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `${path} L ${p.x} ${p.y}`;
    }, '');
  });

  areaPath = computed<string>(() => {
    const points = this.chartPoints();
    if (points.length === 0) return '';
    const startPoint = points[0];
    const endPoint = points[points.length - 1];
    
    // Create closed path by drawing down to the bottom Y line, then to start Y line
    const bottomY = this.height - this.paddingY + 15;
    const path = points.reduce((path, p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `${path} L ${p.x} ${p.y}`;
    }, '');

    return `${path} L ${endPoint.x} ${bottomY} L ${startPoint.x} ${bottomY} Z`;
  });
}
