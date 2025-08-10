import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Candidate } from '../../models/candidate.model';
import { FilterState } from '../../models/filter-state.model';
import { CandidateService } from '../services/candidate.service'
import { CityCoordinates } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private candidatesSubject = new BehaviorSubject<Candidate[]>([]);
  private filtersSubject = new BehaviorSubject<FilterState>({
    searchTerm: '',
    selectedCity: '',
    selectedAgeRange: ''
  });

  candidates$ = this.candidatesSubject.asObservable();
  filters$ = this.filtersSubject.asObservable();

  filteredCandidates$ = combineLatest([
    this.candidates$,
    this.filters$
  ]).pipe(
    map(([candidates, filters]) => this.applyFilters(candidates, filters))
  );

  constructor(private CandidateService: CandidateService) { }

  updateCandidates(candidates: Candidate[]): void {
    this.candidatesSubject.next(candidates);
  }

  updateFilters(filters: Partial<FilterState>): void {
    const currentFilters = this.filtersSubject.value;
    this.filtersSubject.next({ ...currentFilters, ...filters });
  }

  resetFilters(): void {
    this.filtersSubject.next({
      searchTerm: '',
      selectedCity: '',
      selectedAgeRange: ''
    });
  }

  private applyFilters(candidates: Candidate[], filters: FilterState): Candidate[] {
    return candidates.filter(candidate => {
      const matchesSearch = !filters.searchTerm ||
        candidate.fullName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        candidate.email.toLowerCase().includes(filters.searchTerm.toLowerCase());

      const matchesCity = !filters.selectedCity || candidate.city === filters.selectedCity;

      const matchesAge = !filters.selectedAgeRange || this.matchesAgeRange(candidate.age, filters.selectedAgeRange);

      return matchesSearch && matchesCity && matchesAge;
    });
  }

  private matchesAgeRange(age: number, ageRange: string): boolean {
    switch (ageRange) {
      case '18-25': return age >= 18 && age <= 25;
      case '26-35': return age >= 26 && age <= 35;
      case '36-45': return age >= 36 && age <= 45;
      case '46-55': return age >= 46 && age <= 55;
      case '55+': return age > 55;
      default: return true;
    }
  }

  getCities(candidates: Candidate[]): string[] {
    return [...new Set(candidates.map(c => c.city))];
  }

  addInitMockData(): void {
    const testCandidates: Candidate[] = [
      {
        id: '1',
        fullName: 'Dekel Ido',
        email: 'Dekel-ido-@iisa.com',
        phone: '+972-50-123-4567',
        age: 25,
        city: 'Tel Aviv',
        hobbies: 'Astronomy, Hiking, Photography',
        whyPerfect: 'I have always been fascinated by space exploration and have extensive experience in scientific research.',
        profileImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNDAiIHI9IjE1IiBmaWxsPSIjQ0NDIi8+CjxyZWN0IHg9IjMwIiB5PSI2MCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjQ0NDIi8+Cjwvc3ZnPgo=',
        submissionDate: new Date('2024-01-15T10:30:00Z')
      },
      {
        id: '2',
        fullName: 'Dekel Ido2',
        email: 'Dekel-ido2@iisa.com',
        phone: '+972-50-123-4567',
        age: 25,
        city: 'Tel Aviv',
        hobbies: 'Astronomy, Hiking, Photography',
        whyPerfect: 'I have always been fascinated by space exploration and have extensive experience in scientific research.',
        profileImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNDAiIHI9IjE1IiBmaWxsPSIjQ0NDIi8+CjxyZWN0IHg9IjMwIiB5PSI2MCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjQ0NDIi8+Cjwvc3ZnPgo=',
        submissionDate: new Date('2024-01-15T10:30:00Z')
      },
      {
        id: '3',
        fullName: 'Maya Levi',
        email: 'Maya.levi@gmail.com',
        phone: '+972-52-987-6543',
        age: 32,
        city: 'Jerusalem',
        hobbies: 'Space and computer science',
        whyPerfect: 'Ideal candidate for this mission.',
        profileImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNDAiIHI9IjE1IiBmaWxsPSIjQ0NDIi8+CjxyZWN0IHg9IjMwIiB5PSI2MCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjQ0NDIi8+Cjwvc3ZnPgo=',
        submissionDate: new Date('2024-01-16T14:45:00Z')
      }
    ];

    testCandidates.forEach(candidate => {
      this.CandidateService.addCandidate(candidate);
    });
  }

  getValidCities(): string[] {
    return [
      'Tel Aviv', 'Jerusalem', 'Haifa', 'Beer Sheva', 'Netanya',
      'Ashdod', 'Rishon LeZion', 'Petah Tikva', 'Holon', 'Bnei Brak',
      'Rehovot', 'Kfar Saba', 'Herzliya', 'Modiin', 'Ra\'anana',
      'Kiryat Gat', 'Lod', 'Nazareth', 'Tiberias', 'Eilat'
    ];
  }


  getCoordinatesForCity(city: string): [number, number] | null {
    const cityCoords: CityCoordinates = {
      'Tel Aviv': [32.0853, 34.7818],
      'Jerusalem': [31.7683, 35.2137],
      'Haifa': [32.7940, 34.9896],
      'Beer Sheva': [31.2518, 34.7913],
      'Netanya': [32.3328, 34.8600],
      'Ashdod': [31.8044, 34.6500],
      'Rishon LeZion': [31.9686, 34.7983],
      'Petah Tikva': [32.0840, 34.8878],
      'Holon': [32.0167, 34.7792],
      'Bnei Brak': [32.0807, 34.8338],
      'Rehovot': [31.8969, 34.8167],
      'Kfar Saba': [32.1750, 34.9070],
      'Herzliya': [32.1667, 34.8167],
      'Modiin': [31.8928, 35.0153],
      'Ra\'anana': [32.1833, 34.8667],
      'Kiryat Gat': [31.6100, 34.7642],
      'Lod': [31.9514, 34.8953],
      'Nazareth': [32.7000, 35.3000],
      'Tiberias': [32.7947, 35.5322],
      'Eilat': [29.5581, 34.9482]
    };

    return cityCoords[city] || null;
  }

} 