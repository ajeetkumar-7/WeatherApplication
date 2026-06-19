package com.weather.app.service;

import com.weather.app.dto.CityWeatherDto;
import com.weather.app.dto.GeocodingResponse;
import com.weather.app.dto.OpenMeteoResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class WeatherService {

    private static final Logger logger = LoggerFactory.getLogger(WeatherService.class);
    private final RestTemplate restTemplate = new RestTemplate();

    private static final String GEOCODING_API_URL = "https://geocoding-api.open-meteo.com/v1/search";
    private static final String FORECAST_API_URL = "https://api.open-meteo.com/v1/forecast";

    @Cacheable(value = "cityCache", key = "#query")
    public List<GeocodingResponse.CitySearchResult> searchCities(String query) {
        logger.info("Fetching city search results for query: {}", query);
        try {
            String url = UriComponentsBuilder.fromHttpUrl(GEOCODING_API_URL)
                    .queryParam("name", query)
                    .queryParam("count", 8)
                    .queryParam("language", "en")
                    .queryParam("format", "json")
                    .toUriString();

            GeocodingResponse response = restTemplate.getForObject(url, GeocodingResponse.class);
            if (response != null && response.getResults() != null) {
                return response.getResults();
            }
        } catch (Exception e) {
            logger.error("Error searching cities for query: " + query, e);
        }
        return Collections.emptyList();
    }

    @Cacheable(value = "weatherCache", key = "T(java.util.Objects).hash(#latitude, #longitude, #timezone)")
    public CityWeatherDto getWeather(double latitude, double longitude, String timezone) {
        logger.info("Fetching weather data for lat: {}, lon: {}, timezone: {}", latitude, longitude, timezone);
        try {
            String url = UriComponentsBuilder.fromHttpUrl(FORECAST_API_URL)
                    .queryParam("latitude", latitude)
                    .queryParam("longitude", longitude)
                    .queryParam("current", "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m")
                    .queryParam("hourly", "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m")
                    .queryParam("daily", "weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max")
                    .queryParam("timezone", timezone != null ? timezone : "auto")
                    .toUriString();

            OpenMeteoResponse response = restTemplate.getForObject(url, OpenMeteoResponse.class);
            if (response != null) {
                return convertToCityWeatherDto(response);
            }
        } catch (Exception e) {
            logger.error("Error fetching weather for lat: " + latitude + ", lon: " + longitude, e);
        }
        return null;
    }

    private CityWeatherDto convertToCityWeatherDto(OpenMeteoResponse response) {
        CityWeatherDto dto = new CityWeatherDto();
        dto.setLatitude(response.getLatitude());
        dto.setLongitude(response.getLongitude());
        dto.setTimezone(response.getTimezone());

        // Map Current Weather
        if (response.getCurrent() != null) {
            OpenMeteoResponse.CurrentData currentData = response.getCurrent();
            CityWeatherDto.CurrentForecast current = new CityWeatherDto.CurrentForecast();
            current.setTime(currentData.getTime());
            current.setTemp(currentData.getTemp());
            current.setHumidity(currentData.getHumidity());
            current.setApparentTemp(currentData.getApparentTemp());
            current.setIsDay(currentData.getIsDay() == 1);
            current.setPrecipitation(currentData.getPrecipitation());
            current.setWeatherCode(currentData.getWeatherCode());
            current.setCloudCover(currentData.getCloudCover());
            current.setPressure(currentData.getPressure());
            current.setWindSpeed(currentData.getWindSpeed());
            dto.setCurrent(current);
        }

        // Map Hourly Weather (limiting to next 24 hours to keep payload small and charts clean)
        if (response.getHourly() != null && response.getHourly().getTime() != null) {
            OpenMeteoResponse.HourlyData hourlyData = response.getHourly();
            List<CityWeatherDto.HourlyForecast> hourlyList = new ArrayList<>();
            int size = Math.min(24, hourlyData.getTime().size()); // Let's limit to 24 hours
            for (int i = 0; i < size; i++) {
                CityWeatherDto.HourlyForecast hour = new CityWeatherDto.HourlyForecast();
                hour.setTime(hourlyData.getTime().get(i));
                hour.setTemp(hourlyData.getTemp().get(i));
                hour.setHumidity(hourlyData.getHumidity().get(i));
                hour.setWeatherCode(hourlyData.getWeatherCode().get(i));
                hour.setWindSpeed(hourlyData.getWindSpeed().get(i));
                hourlyList.add(hour);
            }
            dto.setHourly(hourlyList);
        }

        // Map Daily Weather
        if (response.getDaily() != null && response.getDaily().getTime() != null) {
            OpenMeteoResponse.DailyData dailyData = response.getDaily();
            List<CityWeatherDto.DailyForecast> dailyList = new ArrayList<>();
            int size = dailyData.getTime().size();
            for (int i = 0; i < size; i++) {
                CityWeatherDto.DailyForecast day = new CityWeatherDto.DailyForecast();
                day.setDate(dailyData.getTime().get(i));
                day.setWeatherCode(dailyData.getWeatherCode().get(i));
                day.setTempMax(dailyData.getTempMax().get(i));
                day.setTempMin(dailyData.getTempMin().get(i));
                day.setApparentTempMax(dailyData.getApparentTempMax().get(i));
                day.setApparentTempMin(dailyData.getApparentTempMin().get(i));
                day.setSunrise(dailyData.getSunrise().get(i));
                day.setSunset(dailyData.getSunset().get(i));
                day.setUvIndexMax(dailyData.getUvIndexMax().get(i));
                dailyList.add(day);
            }
            dto.setDaily(dailyList);
        }

        return dto;
    }
}
