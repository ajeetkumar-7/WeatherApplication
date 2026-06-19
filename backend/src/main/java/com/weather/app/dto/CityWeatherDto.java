package com.weather.app.dto;

import java.util.List;

public class CityWeatherDto {
    private double latitude;
    private double longitude;
    private String timezone;
    private CurrentForecast current;
    private List<HourlyForecast> hourly;
    private List<DailyForecast> daily;

    // Getters and Setters
    public double getLatitude() { return latitude; }
    public void setLatitude(double latitude) { this.latitude = latitude; }

    public double getLongitude() { return longitude; }
    public void setLongitude(double longitude) { this.longitude = longitude; }

    public String getTimezone() { return timezone; }
    public void setTimezone(String timezone) { this.timezone = timezone; }

    public CurrentForecast getCurrent() { return current; }
    public void setCurrent(CurrentForecast current) { this.current = current; }

    public List<HourlyForecast> getHourly() { return hourly; }
    public void setHourly(List<HourlyForecast> hourly) { this.hourly = hourly; }

    public List<DailyForecast> getDaily() { return daily; }
    public void setDaily(List<DailyForecast> daily) { this.daily = daily; }

    public static class CurrentForecast {
        private String time;
        private double temp;
        private int humidity;
        private double apparentTemp;
        private boolean isDay;
        private double precipitation;
        private int weatherCode;
        private int cloudCover;
        private double pressure;
        private double windSpeed;

        // Getters and Setters
        public String getTime() { return time; }
        public void setTime(String time) { this.time = time; }
        public double getTemp() { return temp; }
        public void setTemp(double temp) { this.temp = temp; }
        public int getHumidity() { return humidity; }
        public void setHumidity(int humidity) { this.humidity = humidity; }
        public double getApparentTemp() { return apparentTemp; }
        public void setApparentTemp(double apparentTemp) { this.apparentTemp = apparentTemp; }
        public boolean getIsDay() { return isDay; }
        public void setIsDay(boolean day) { isDay = day; }
        public double getPrecipitation() { return precipitation; }
        public void setPrecipitation(double precipitation) { this.precipitation = precipitation; }
        public int getWeatherCode() { return weatherCode; }
        public void setWeatherCode(int weatherCode) { this.weatherCode = weatherCode; }
        public int getCloudCover() { return cloudCover; }
        public void setCloudCover(int cloudCover) { this.cloudCover = cloudCover; }
        public double getPressure() { return pressure; }
        public void setPressure(double pressure) { this.pressure = pressure; }
        public double getWindSpeed() { return windSpeed; }
        public void setWindSpeed(double windSpeed) { this.windSpeed = windSpeed; }
    }

    public static class HourlyForecast {
        private String time;
        private double temp;
        private int humidity;
        private int weatherCode;
        private double windSpeed;

        // Getters and Setters
        public String getTime() { return time; }
        public void setTime(String time) { this.time = time; }
        public double getTemp() { return temp; }
        public void setTemp(double temp) { this.temp = temp; }
        public int getHumidity() { return humidity; }
        public void setHumidity(int humidity) { this.humidity = humidity; }
        public int getWeatherCode() { return weatherCode; }
        public void setWeatherCode(int weatherCode) { this.weatherCode = weatherCode; }
        public double getWindSpeed() { return windSpeed; }
        public void setWindSpeed(double windSpeed) { this.windSpeed = windSpeed; }
    }

    public static class DailyForecast {
        private String date;
        private int weatherCode;
        private double tempMax;
        private double tempMin;
        private double apparentTempMax;
        private double apparentTempMin;
        private String sunrise;
        private String sunset;
        private double uvIndexMax;

        // Getters and Setters
        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
        public int getWeatherCode() { return weatherCode; }
        public void setWeatherCode(int weatherCode) { this.weatherCode = weatherCode; }
        public double getTempMax() { return tempMax; }
        public void setTempMax(double tempMax) { this.tempMax = tempMax; }
        public double getTempMin() { return tempMin; }
        public void setTempMin(double tempMin) { this.tempMin = tempMin; }
        public double getApparentTempMax() { return apparentTempMax; }
        public void setApparentTempMax(double apparentTempMax) { this.apparentTempMax = apparentTempMax; }
        public double getApparentTempMin() { return apparentTempMin; }
        public void setApparentTempMin(double apparentTempMin) { this.apparentTempMin = apparentTempMin; }
        public String getSunrise() { return sunrise; }
        public void setSunrise(String sunrise) { this.sunrise = sunrise; }
        public String getSunset() { return sunset; }
        public void setSunset(String sunset) { this.sunset = sunset; }
        public double getUvIndexMax() { return uvIndexMax; }
        public void setUvIndexMax(double uvIndexMax) { this.uvIndexMax = uvIndexMax; }
    }
}
