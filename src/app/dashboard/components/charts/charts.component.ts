import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { Chart, registerables } from 'chart.js';
import { Candidate } from '../../../models/candidate.model';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { MatIcon } from "@angular/material/icon";
import { DashboardService } from '../../../core/services/dashboard.service';

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

  constructor(private analyticsService: AnalyticsService, private dashboardService: DashboardService) { }

  ngOnInit(): void {
      this.updateCharts();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['candidates'] && !changes['candidates'].firstChange) {
        this.updateCharts();
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
      const age = this.calculateAge(candidate.dateOfBirth);
      if (age >= 18 && age <= 25) ageGroups['18-25']++;
      else if (age >= 26 && age <= 35) ageGroups['26-35']++;
      else if (age >= 36 && age <= 45) ageGroups['36-45']++;
      else if (age >= 46 && age <= 55) ageGroups['46-55']++;
      else if (age > 55) ageGroups['55+']++;
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

      // Modern color palette
      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
      
      this.ageChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: Object.keys(ageGroups),
          datasets: [{
            data: Object.values(ageGroups),
            backgroundColor: colors,
            borderColor: colors.map(color => this.adjustBrightness(color, -20)),
            borderWidth: 2,
            borderRadius: 8,
            borderSkipped: false,
            label: 'Candidates by Age'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: '#fff',
              bodyColor: '#fff',
              borderColor: '#3B82F6',
              borderWidth: 1,
              cornerRadius: 8,
              displayColors: false,
              callbacks: {
                label: function(context) {
                  const value = context.parsed.y;
                  const total = context.dataset.data.reduce((a: any, b: any) => (a || 0) + (b || 0), 0);
                  const percentage = ((value / total) * 100).toFixed(1);
                  return `${value} candidates (${percentage}%)`;
                }
              }
            }
          },
          scales: {
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: '#6B7280',
                font: {
                  size: 12,
                  weight: 'bold'
                }
              }
            },
            y: {
              beginAtZero: true,
              grid: {
                color: '#E5E7EB'
              },
              ticks: {
                color: '#6B7280',
                font: {
                  size: 12
                },
                stepSize: 1
              }
            }
          }
        }
      });
    }
  }

  private updateCityChart(): void {
    const cityCounts: { [key: string]: number } = {};
    const validCities = this.dashboardService.getValidCities();

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

      // Modern color palette for cities
      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

      this.cityChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: sortedCities.map(([city]) => city),
          datasets: [{
            data: sortedCities.map(([, count]) => count),
            backgroundColor: sortedCities.map((_, index) => colors[index % colors.length]),
            borderColor: sortedCities.map((_, index) => this.adjustBrightness(colors[index % colors.length], -20)),
            borderWidth: 2,
            borderRadius: 8,
            borderSkipped: false,
            label: 'Candidates by City'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: '#fff',
              bodyColor: '#fff',
              borderColor: '#3B82F6',
              borderWidth: 1,
              cornerRadius: 8,
              displayColors: false,
              callbacks: {
                label: function(context) {
                  return `${context.parsed.y} candidates`;
                }
              }
            }
          },
          scales: {
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: '#6B7280',
                font: {
                  size: 12,
                  weight: 'bold'
                }
              }
            },
            y: {
              beginAtZero: true,
              grid: {
                color: '#E5E7EB'
              },
              ticks: {
                color: '#6B7280',
                font: {
                  size: 12
                },
                stepSize: 1
              }
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
            backgroundColor: ['#3B82F6', '#10B981'],
            borderColor: ['#2563EB', '#059669'],
            borderWidth: 3,
            label: 'Visits vs Registrations'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: '#6B7280',
                font: {
                  size: 12,
                  weight: 'bold'
                },
                padding: 20,
                usePointStyle: true,
                pointStyle: 'circle'
              }
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: '#fff',
              bodyColor: '#fff',
              borderColor: '#3B82F6',
              borderWidth: 1,
              cornerRadius: 8,
              displayColors: false,
              callbacks: {
                label: function(context) {
                  const value = context.parsed;
                  const total = visits + registrations;
                  const percentage = ((value / total) * 100).toFixed(1);
                  return `${context.label}: ${value} (${percentage}%)`;
                }
              }
            }
          },
          cutout: '60%'
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

  private showNoDataMessage(canvas: HTMLCanvasElement, message: string): void {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Set background
      ctx.fillStyle = '#F9FAFB';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw message
      ctx.fillStyle = '#6B7280';
      ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Add icon
      const iconSize = 24;
      ctx.font = `${iconSize}px Material Icons`;
      ctx.fillText('📊', canvas.width / 2, canvas.height / 2 - 20);
      
      // Add message
      ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(message, canvas.width / 2, canvas.height / 2 + 20);
    }
  }

  private calculateAge(dateOfBirth: Date | undefined | null): number {
    if (!dateOfBirth) return 0;
    
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  private adjustBrightness(hex: string, percent: number): string {
    let R = parseInt(hex.slice(1, 3), 16);
    let G = parseInt(hex.slice(3, 5), 16);
    let B = parseInt(hex.slice(5, 7), 16);

    R = Math.round(R * (100 + percent) / 100);
    G = Math.round(G * (100 + percent) / 100);
    B = Math.round(B * (100 + percent) / 100);

    R = Math.min(255, Math.max(0, R));
    G = Math.min(255, Math.max(0, G));
    B = Math.min(255, Math.max(0, B));

    const RR = R.toString(16).length === 1 ? "0" + R.toString(16) : R.toString(16);
    const GG = G.toString(16).length === 1 ? "0" + G.toString(16) : G.toString(16);
    const BB = B.toString(16).length === 1 ? "0" + B.toString(16) : B.toString(16);

    return "#" + RR + GG + BB;
  }
}
