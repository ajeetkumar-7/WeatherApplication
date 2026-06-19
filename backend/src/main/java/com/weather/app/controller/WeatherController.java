package com.weather.app.controller;

import com.weather.app.dto.CityWeatherDto;
import com.weather.app.dto.GeocodingResponse;
import com.weather.app.service.WeatherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class WeatherController {

    private final WeatherService weatherService;

    @Autowired
    public WeatherController(WeatherService weatherService) {
        this.weatherService = weatherService;
    }

    @GetMapping("/weather/search")
    public ResponseEntity<List<GeocodingResponse.CitySearchResult>> searchCities(@RequestParam String query) {
        if (query == null || query.trim().length() < 2) {
            return ResponseEntity.badRequest().build();
        }
        List<GeocodingResponse.CitySearchResult> results = weatherService.searchCities(query.trim());
        return ResponseEntity.ok(results);
    }

    @GetMapping("/weather")
    public ResponseEntity<CityWeatherDto> getWeather(
            @RequestParam double latitude,
            @RequestParam double longitude,
            @RequestParam(required = false) String timezone) {
        
        CityWeatherDto weatherDto = weatherService.getWeather(latitude, longitude, timezone);
        if (weatherDto == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(weatherDto);
    }
}
