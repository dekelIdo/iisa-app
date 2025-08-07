import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CandidateService } from '../core/services/candidate.service';
import { AnalyticsService } from '../core/services/analytics.service';
import { DashboardService } from '../core/services/dashboard.service';
import { Subscription, interval } from 'rxjs';
import { CandidateDetailsComponent } from './components/candidate-details/candidate-details.component';
import { MapPreviewModalComponent } from '../shared/components/map-preview-modal.component';
import { ChartsComponent } from './components/charts/charts.component';
import { FiltersComponent } from './components/filters/filters.component';
import { CandidatesTableComponent } from './components/candidates-table/candidates-table.component';
import { MapPreviewComponent } from './components/map-preview/map-preview.component';
import { AUTH_CONSTANTS } from '../core/constants/auth.constants';
import { Candidate, FilterState } from '../models';

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
export class DashboardComponent implements OnInit, OnDestroy {
  candidates: Candidate[] = [];
  filteredCandidates: Candidate[] = [];
  selectedCandidate: Candidate | null = null;

  filters: FilterState = {
    searchTerm: '',
    selectedCity: '',
    selectedAgeRange: ''
  };

  private subscription = new Subscription();

  constructor(
    private candidateService: CandidateService,
    private analyticsService: AnalyticsService,
    private dashboardService: DashboardService,
    private dialog: MatDialog,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadData();

    this.subscription.add(
      this.candidateService.candidates$.subscribe(() => {
        this.loadData();
      })
    );

    this.subscription.add(
      this.dashboardService.filteredCandidates$.subscribe(filteredCandidates => {
        this.filteredCandidates = filteredCandidates;
      })
    );

    this.subscription.add(
      interval(5000).subscribe(() => {
        this.loadData();
      })
    );

    if (this.candidates.length === 0) {
      this.addTestData();
      this.loadData();
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  logout(): void {
    sessionStorage.removeItem(AUTH_CONSTANTS.SESSION_KEY);
    this.router.navigate(['/login']);
  }

  private loadData(): void {
    this.candidates = this.candidateService.getCandidates();
    this.dashboardService.updateCandidates(this.candidates);
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

  getCities(): string[] {
    return this.dashboardService.getCities(this.candidates);
  }

  onViewCandidate(candidate: Candidate): void {
    this.selectedCandidate = candidate;

    const currentIndex = this.candidates.findIndex(c => c.id === candidate.id);

    const dialogRef = this.dialog.open(CandidateDetailsComponent, {
      width: '90vw',
      maxWidth: '800px',
      maxHeight: '90vh',
      data: {
        candidates: this.candidates,
        currentIndex: currentIndex >= 0 ? currentIndex : 0
      }
    });

    dialogRef.afterClosed().subscribe(() => {
      this.selectedCandidate = null;
    });
  }

  onOpenMap(): void {
    const dialogRef = this.dialog.open(MapPreviewModalComponent, {
      width: '90vw',
      maxWidth: '1200px',
      maxHeight: '90vh',
      data: { candidates: this.candidates },
      panelClass: 'map-preview-dialog'
    });
  }

  private addTestData(): void {
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
        fullName: 'Eli Yaho Smith',
        email: 'Eli.smith@leumi.com',
        phone: '+972-52-987-6543',
        age: 32,
        city: 'Jerusalem',
        hobbies: 'Space Science, Yoga, Reading',
        whyPerfect: 'My background in physics and passion for space exploration makes me an ideal candidate for this mission.',
        profileImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNDAiIHI9IjE1IiBmaWxsPSIjQ0NDIi8+CjxyZWN0IHg9IjMwIiB5PSI2MCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjQ0NDIi8+Cjwvc3ZnPgo=',
        submissionDate: new Date('2024-01-16T14:45:00Z')
      }
    ];

    testCandidates.forEach(candidate => {
      this.candidateService.addCandidate(candidate);
    });
  }
} 