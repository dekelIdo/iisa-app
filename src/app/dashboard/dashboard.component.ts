import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CandidateService } from '../core/services/candidate.service';
import { AnalyticsService } from '../core/services/analytics.service';
import { DashboardService } from '../core/services/dashboard.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CandidateDetailsComponent } from './components/candidate-details/candidate-details.component';
import { MapPreviewModalComponent } from '../shared/components/map-preview-modal.component';
import { ChartsComponent } from './components/charts/charts.component';
import { FiltersComponent } from './components/filters/filters.component';
import { CandidatesTableComponent } from './components/candidates-table/candidates-table.component';
import { MapPreviewComponent } from './components/map-preview/map-preview.component';
import { AUTH_CONSTANTS } from '../core/constants/auth.constants';
import { Candidate, FilterState } from '../models';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    ChartsComponent,
    FiltersComponent,
    CandidatesTableComponent,
    MapPreviewComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  selectedCandidate: Candidate | null = null;

  filters: FilterState = {
    searchTerm: '',
    selectedCity: '',
    selectedAgeRange: ''
  };

  candidates$!: Observable<Candidate[]>;
  filteredCandidates$!: Observable<Candidate[]>;
  cities$!: Observable<string[]>;

  constructor(
    private candidateService: CandidateService,
    private analyticsService: AnalyticsService,
    private dashboardService: DashboardService,
    private dialog: MatDialog,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.candidates$ = this.candidateService.candidates$;
    this.filteredCandidates$ = this.dashboardService.filteredCandidates$;
    this.cities$ = this.candidates$.pipe(
      map((candidates: Candidate[]) => this.dashboardService.getCities(candidates))
    );

    if (this.candidateService.getCandidates().length === 0) {
      this.dashboardService.addInitMockData();
    }
  }

  logout(): void {
    sessionStorage.removeItem(AUTH_CONSTANTS.SESSION_KEY);
    this.router.navigate(['/login']);
  }

  private loadData(): void {
    // Data is now automatically loaded through the candidate service stream
    // No manual update needed
  }

  onFiltersChange(filters: FilterState): void {
    this.filters = filters;
    this.dashboardService.updateFilters(filters);
  }

  onClearSearch(): void {
    this.filters.searchTerm = '';
    this.dashboardService.updateFilters(this.filters);
  }

  onClearCity(): void {
    this.filters.selectedCity = '';
    this.dashboardService.updateFilters(this.filters);
  }

  onClearAgeRange(): void {
    this.filters.selectedAgeRange = '';
    this.dashboardService.updateFilters(this.filters);
  }

  onResetAllFilters(): void {
    this.filters = {
      searchTerm: '',
      selectedCity: '',
      selectedAgeRange: ''
    };
    this.dashboardService.resetFilters();
  }

  onViewCandidate(candidate: Candidate): void {
    this.selectedCandidate = candidate;

    this.candidates$.pipe(
      take(1)
    ).subscribe((candidates: Candidate[]) => {
      const currentIndex = candidates.findIndex((c: Candidate) => c.id === candidate.id);

      const dialogRef = this.dialog.open(CandidateDetailsComponent, {
        width: '90vw',
        maxWidth: '800px',
        maxHeight: '90vh',
        data: {
          candidates: candidates,
          currentIndex: currentIndex >= 0 ? currentIndex : 0
        }
      });

      dialogRef.afterClosed().subscribe(() => {
        this.selectedCandidate = null;
      });
    });
  }

  onOpenMap(): void {
    this.candidates$.pipe(
      take(1)
    ).subscribe((candidates: Candidate[]) => {
      const dialogRef = this.dialog.open(MapPreviewModalComponent, {
        width: '90vw',
        maxWidth: '1200px',
        maxHeight: '90vh',
        data: { candidates: candidates },
        panelClass: 'map-preview-dialog'
      });
    });
  }
} 