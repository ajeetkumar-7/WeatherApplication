package com.weather.app.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class OpenMeteoResponse {
    private double latitude;
    private double longitude;
    private String timezone;

    @JsonProperty("current")
    private CurrentData current;

    @JsonProperty("hourly")
    private HourlyData hourly;

    @JsonProperty("daily")
    private DailyData daily;

    // Getters and Setters
    public double getLatitude() { return latitude; }
    public void setLatitude(double latitude) { this.latitude = latitude; }

    public double getLongitude() { return longitude; }
    public void setLongitude(double longitude) { this.longitude = longitude; }

    public String getTimezone() { return timezone; }
    public void setTimezone(String timezone) { this.timezone = timezone; }

    public CurrentData getCurrent() { return current; }
    public void setCurrent(CurrentData current) { this.current = current; }

    public HourlyData getHourly() { return hourly; }
    public void setHourly(HourlyData hourly) { this.hourly = hourly; }

    public DailyData getDaily() { return daily; }
    public void setDaily(DailyData daily) { this.daily = daily; }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class CurrentData {
        private String time;
        @JsonProperty("temperature_2m")
        private double temp;
        @JsonProperty("relative_humidity_2m")
        private int humidity;
        @JsonProperty("apparent_temperature")
        private double apparentTemp;
        @JsonProperty("is_day")
        private int isDay;
        private double precipitation;
        private double rain;
        private double showers;
        private double snowfall;
        @JsonProperty("weather_code")
        private int weatherCode;
        @JsonProperty("cloud_cover")
        private int cloudCover;
        @JsonProperty("pressure_msl")
        private double pressure;
        @JsonProperty("wind_speed_10m")
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
        public int getIsDay() { return isDay; }
        public void setIsDay(int isDay) { this.isDay = isDay; }
        public double getPrecipitation() { return precipitation; }
        public void setPrecipitation(double precipitation) { this.precipitation = precipitation; }
        public double getRain() { return rain; }
        public void setRain(double rain) { this.rain = rain; }
        public double getShowers() { return showers; }
        public void setShowers(double showers) { this.showers = showers; }
        public double getSnowfall() { return snowfall; }
        public void setSnowfall(double snowfall) { this.snowfall = snowfall; }
        public int getWeatherCode() { return weatherCode; }
        public void setWeatherCode(int weatherCode) { this.weatherCode = weatherCode; }
        public int getCloudCover() { return cloudCover; }
        public void setCloudCover(int cloudCover) { this.cloudCover = cloudCover; }
        public double getPressure() { return pressure; }
        public void setPressure(double pressure) { this.pressure = pressure; }
        public double getWindSpeed() { return windSpeed; }
        public void setWindSpeed(double windSpeed) { this.windSpeed = windSpeed; }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class HourlyData {
        private List<String> time;
        @JsonProperty("temperature_2m")
        private List<Double> temp;
        @JsonProperty("relative_humidity_2m")
        private List<Integer> humidity;
        @JsonProperty("weather_code")
        private List<Integer> weatherCode;
        @JsonProperty("wind_speed_10m")
        private List<Double> windSpeed;

        // Getters and Setters
        public List<String> getTime() { return time; }
        public void setTime(List<String> time) { this.time = time; }
        public List<Double> getTemp() { return temp; }
        public void setTemp(List<Double> temp) { this.temp = temp; }
        public List<Integer> getHumidity() { return humidity; }
        public void setHumidity(List<Integer> humidity) { this.humidity = humidity; }
        public List<Integer> getWeatherCode() { return weatherCode; }
        public void setWeatherCode(List<Integer> weatherCode) { this.weatherCode = weatherCode; }
        public List<Double> getWindSpeed() { return windSpeed; }
        public void setWindSpeed(List<Double> windSpeed) { this.windSpeed = windSpeed; }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class DailyData {
        private List<String> time;
        @JsonProperty("weather_code")
        private List<Integer> weatherCode;
        @JsonProperty("temperature_2m_max")
        private List<Double> tempMax;
        @JsonProperty("temperature_2m_min")
        private List<Double> tempMin;
        @JsonProperty("apparent_temperature_max")
        private List<Double> apparentTempMax;
        @JsonProperty("apparent_temperature_min")
        private List<Double> apparentTempMin;
        private List<String> sunrise;
        private List<String> sunset;
        @JsonProperty("uv_index_max")
        private List<Double> uvIndexMax;

        // Getters and Setters
        public List<String> getTime() { return time; }
        public void setTime(List<String> time) { this.time = time; }
        public List<Integer> getWeatherCode() { return weatherCode; }
        public void setWeatherCode(List<Integer> weatherCode) { this.weatherCode = weatherCode; }
        public List<Double> getTempMax() { return tempMax; }
        public void setTempMax(List<Double> tempMax) { this.tempMax = tempMax; }
        public List<Double> getTempMin() { return tempMin; }
        public void setTempMin(List<Double> tempMin) { this.tempMin = tempMin; }
        public List<Double> getApparentTempMax() { return apparentTempMax; }
        public void setApparentTempMax(List<Double> apparentTempMax) { this.apparentTempMax = apparentTempMax; }
        public List<Double> getApparentTempMin() { return apparentTempMin; }
        public void setApparentTempMin(List<Double> apparentTempMin) { this.apparentTempMin = apparentTempMin; }
        public List<String> getSunrise() { return sunrise; }
        public void setSunrise(List<String> sunrise) { this.sunrise = sunrise; }
        public List<String> getSunset() { return sunset; }
        public void setSunset(List<String> sunset) { this.sunset = sunset; }
        public List<Double> getUvIndexMax() { return uvIndexMax; }
        public void setUvIndexMax(List<Double> uvIndexMax) { this.uvIndexMax = uvIndexMax; }
    }
}
