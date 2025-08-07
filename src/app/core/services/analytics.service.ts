import { Injectable } from '@angular/core';
@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  getVisitsCount(): number {
    return parseInt(localStorage.getItem('iisa-visits') || '0');
  }

  incrementVisits(): void {
    const visits = this.getVisitsCount() + 1;
    localStorage.setItem('iisa-visits', visits.toString());
  }
} 