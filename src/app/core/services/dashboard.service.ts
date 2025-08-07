import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Candidate } from '../../models/candidate.model';
import { FilterState } from '../../models/filter-state.model';

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

  constructor() {}

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
} 