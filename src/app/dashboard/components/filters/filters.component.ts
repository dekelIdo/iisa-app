import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { FilterState } from '../../../models/filter-state.model';

@Component({
  selector: 'app-filters',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    FormsModule
  ],
  templateUrl: './filters.component.html',
  styleUrl: './filters.component.scss'
})
export class FiltersComponent {
  @Input() filters: FilterState = {
    searchTerm: '',
    selectedCity: '',
    selectedAgeRange: ''
  };
  @Input() cities: string[] = [];

  @Output() filtersChange = new EventEmitter<FilterState>();
  @Output() clearSearch = new EventEmitter<void>();
  @Output() clearCity = new EventEmitter<void>();
  @Output() clearAgeRange = new EventEmitter<void>();
  @Output() resetAllFilters = new EventEmitter<void>();

  onFiltersChange(): void {
    this.filtersChange.emit(this.filters);
  }

  onClearSearch(): void {
    this.filters.searchTerm = '';
    this.clearSearch.emit();
  }

  onClearCity(): void {
    this.filters.selectedCity = '';
    this.clearCity.emit();
  }

  onClearAgeRange(): void {
    this.filters.selectedAgeRange = '';
    this.clearAgeRange.emit();
  }

  onResetAllFilters(): void {
    this.filters = {
      searchTerm: '',
      selectedCity: '',
      selectedAgeRange: ''
    };
    this.resetAllFilters.emit();
  }
}
