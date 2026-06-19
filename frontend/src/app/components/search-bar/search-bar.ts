import { Component, ElementRef, HostListener, inject, signal, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { WeatherService, CitySearchResult } from '../../services/weather.service';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.css'
})
export class SearchBarComponent implements OnDestroy {
  public weatherService = inject(WeatherService);
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  query = signal<string>('');
  suggestions = signal<CitySearchResult[]>([]);
  showSuggestions = signal<boolean>(false);
  isSearching = signal<boolean>(false);
  focusedIndex = signal<number>(-1);

  constructor(private elementRef: ElementRef) {
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(q => {
        if (q.length >= 2) {
          this.isSearching.set(true);
        } else {
          this.suggestions.set([]);
          this.showSuggestions.set(false);
          this.focusedIndex.set(-1);
        }
      }),
      switchMap(q => {
        if (q.length < 2) return [];
        return this.weatherService.searchCities(q);
      })
    ).subscribe({
      next: (results) => {
        this.suggestions.set(results);
        this.showSuggestions.set(results.length > 0);
        this.focusedIndex.set(results.length > 0 ? 0 : -1); // Default to first item if available
        this.isSearching.set(false);
      },
      error: (err) => {
        console.error('Search error', err);
        this.isSearching.set(false);
      }
    });
  }

  onInput(event: Event) {
    const inputVal = (event.target as HTMLInputElement).value;
    this.query.set(inputVal);
    this.searchSubject.next(inputVal);
  }

  selectCity(city: CitySearchResult) {
    this.weatherService.fetchWeather(city);
    this.query.set('');
    this.suggestions.set([]);
    this.showSuggestions.set(false);
    this.focusedIndex.set(-1);
  }

  // Geolocation Access through browser system API
  locateMe() {
    if (navigator.geolocation) {
      this.isSearching.set(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          this.weatherService.fetchWeatherForCoordinates(lat, lon);
          this.isSearching.set(false);
          this.showSuggestions.set(false);
          this.query.set('');
          this.focusedIndex.set(-1);
        },
        (error) => {
          console.error('Geolocation error:', error);
          this.isSearching.set(false);
          // Set user facing error message
          let message = 'Location access denied or unavailable.';
          if (error.code === error.PERMISSION_DENIED) {
            message = 'Please allow location permission in your browser settings.';
          }
          this.weatherService.errorMsg.set(message);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      this.weatherService.errorMsg.set('Geolocation is not supported by your browser.');
    }
  }

  // Keyboard navigation for suggestions dropdown (Arrow keys + Enter + Escape)
  onKeyDown(event: KeyboardEvent) {
    const s = this.suggestions();
    if (!this.showSuggestions() || s.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const nextIndex = (this.focusedIndex() + 1) % s.length;
      this.focusedIndex.set(nextIndex);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      const prevIndex = (this.focusedIndex() - 1 + s.length) % s.length;
      this.focusedIndex.set(prevIndex);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const idx = this.focusedIndex();
      if (idx >= 0 && idx < s.length) {
        this.selectCity(s[idx]);
      } else if (s.length > 0) {
        // Default to first item if none is selected
        this.selectCity(s[0]);
      }
    } else if (event.key === 'Escape') {
      this.showSuggestions.set(false);
      (event.target as HTMLInputElement).blur();
    }
  }

  // Close suggestions when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showSuggestions.set(false);
    }
  }

  ngOnDestroy() {
    this.searchSubscription?.unsubscribe();
  }
}
