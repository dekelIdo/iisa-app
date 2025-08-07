import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { Chart, registerables } from 'chart.js';
import { Candidate } from '../../../models/candidate.model';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { MatIcon } from "@angular/material/icon";

Chart.register(...registerables);

@Component({
  selector: 'app-charts',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIcon],
  templateUrl:'./charts.component.html',
  styleUrl: './charts.component.scss'
})
export class ChartsComponent implements OnInit, OnDestroy, OnChanges {
  @Input() candidates: Candidate[] = [];

  private ageChart: Chart | null = null;
  private cityChart: Chart | null = null;
  private visitsChart: Chart | null = null;

  constructor(private analyticsService: AnalyticsService) { }

  ngOnInit(): void {
    setTimeout(() => {
      this.updateCharts();
    }, 100);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['candidates'] && !changes['candidates'].firstChange) {
      setTimeout(() => {
        this.updateCharts();
      }, 100);
    }
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }

  private updateCharts(): void {
    this.updateAgeChart();
    this.updateCityChart();
    this.updateVisitsChart();
  }

  private updateAgeChart(): void {
    const ageGroups: { [key: string]: number } = {
      '18-25': 0,
      '26-35': 0,
      '36-45': 0,
      '46-55': 0,
      '55+': 0
    };

    this.candidates.forEach(candidate => {
      if (candidate.age >= 18 && candidate.age <= 25) ageGroups['18-25']++;
      else if (candidate.age >= 26 && candidate.age <= 35) ageGroups['26-35']++;
      else if (candidate.age >= 36 && candidate.age <= 45) ageGroups['36-45']++;
      else if (candidate.age >= 46 && candidate.age <= 55) ageGroups['46-55']++;
      else if (candidate.age > 55) ageGroups['55+']++;
    });

    const ctx = document.getElementById('ageChart') as HTMLCanvasElement;
    if (ctx) {
      if (this.ageChart) {
        this.ageChart.destroy();
        this.ageChart = null;
      }

      const totalCandidates = Object.values(ageGroups).reduce((sum, count) => sum + count, 0);

      if (totalCandidates === 0) {
        this.showNoDataMessage(ctx, 'No candidate data available');
        return;
      }

      this.ageChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: Object.keys(ageGroups),
          datasets: [{
            data: Object.values(ageGroups),
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });
    }
  }

  private updateCityChart(): void {
    const cityCounts: { [key: string]: number } = {};
    const validCities = this.getValidCities();

    this.candidates.forEach(candidate => {
      if (validCities.includes(candidate.city)) {
        cityCounts[candidate.city] = (cityCounts[candidate.city] || 0) + 1;
      }
    });

    const sortedCities = Object.entries(cityCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    const ctx = document.getElementById('cityChart') as HTMLCanvasElement;
    if (ctx) {
      if (this.cityChart) {
        this.cityChart.destroy();
        this.cityChart = null;
      }

      if (sortedCities.length === 0) {
        this.showNoDataMessage(ctx, 'No valid city data available');
        return;
      }

      const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'];

      this.cityChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: sortedCities.map(([city]) => city),
          datasets: [{
            data: sortedCities.map(([, count]) => count),
            backgroundColor: sortedCities.map((_, index) => colors[index % colors.length]),
            label: 'Candidates by City'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  }

  private updateVisitsChart(): void {
    const visits = this.analyticsService.getVisitsCount();
    const registrations = this.candidates.length;

    const ctx = document.getElementById('visitsChart') as HTMLCanvasElement;
    if (ctx) {
      if (this.visitsChart) {
        this.visitsChart.destroy();
        this.visitsChart = null;
      }

      if (visits === 0 && registrations === 0) {
        this.showNoDataMessage(ctx, 'No analytics data available');
        return;
      }

      this.visitsChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Visits', 'Registrations'],
          datasets: [{
            data: [visits, registrations],
            backgroundColor: ['#FF6384', '#36A2EB'],
            label: 'Visits vs Registrations'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });
    }
  }

  private destroyCharts(): void {
    if (this.ageChart) {
      this.ageChart.destroy();
      this.ageChart = null;
    }
    if (this.cityChart) {
      this.cityChart.destroy();
      this.cityChart = null;
    }
    if (this.visitsChart) {
      this.visitsChart.destroy();
      this.visitsChart = null;
    }
  }

  private getValidCities(): string[] {
    return [
      'Tel Aviv', 'Jerusalem', 'Haifa', 'Beer Sheva', 'Netanya',
      'Ashdod', 'Rishon LeZion', 'Petah Tikva', 'Holon', 'Bnei Brak',
      'Rehovot', 'Kfar Saba', 'Herzliya', 'Modiin', 'Ra\'anana',
      'Kiryat Gat', 'Lod', 'Nazareth', 'Tiberias', 'Eilat'
    ];
  }

  private showNoDataMessage(canvas: HTMLCanvasElement, message: string): void {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#666';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(message, canvas.width / 2, canvas.height / 2);
    }
  }
}
