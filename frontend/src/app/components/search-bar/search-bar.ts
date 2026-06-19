import { Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { WeatherService, CitySearchResult } from '../../services/weather.service';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.css'
})
export class SearchBarComponent {
  private weatherService = inject(WeatherService);
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  query = signal<string>('');
  suggestions = signal<CitySearchResult[]>([]);
  showSuggestions = signal<boolean>(false);
  isSearching = signal<boolean>(false);

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
