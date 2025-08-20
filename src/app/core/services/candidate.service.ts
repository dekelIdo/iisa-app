import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Candidate } from '../../models/candidate.model';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class CandidateService {
  private candidatesSubject = new BehaviorSubject<Candidate[]>([]);
  candidates$ = this.candidatesSubject.asObservable();

  constructor(private notificationService: NotificationService) {
    this.loadCandidates();
  }

  private loadCandidates(): void {
    const stored = localStorage.getItem('candidates');
    if (stored) {
      const candidates = JSON.parse(stored).map((c: any) => {
        // Migration: Convert age to dateOfBirth if needed
        if (c.age && !c.dateOfBirth) {
          const today = new Date();
          const birthYear = today.getFullYear() - c.age;
          c.dateOfBirth = new Date(birthYear, today.getMonth(), today.getDate());
          delete c.age; // Remove old age property
        }
        
        return {
          ...c,
          submissionDate: new Date(c.submissionDate),
          lastEditDate: c.lastEditDate ? new Date(c.lastEditDate) : undefined,
          dateOfBirth: c.dateOfBirth ? new Date(c.dateOfBirth) : new Date('1990-01-01') // Default fallback
        };
      });
      this.candidatesSubject.next(candidates);
    }
  }

  private saveCandidates(candidates: Candidate[]): void {
    localStorage.setItem('candidates', JSON.stringify(candidates));
    this.candidatesSubject.next(candidates);
  }

  addCandidate(candidate: Candidate): boolean {
    try {
      const candidates = this.getCandidates();
      const existingCandidate = this.getCandidateByEmail(candidate.email);
      if (existingCandidate) {
        this.notificationService.duplicateEmailError();
        return false;
      }

      candidates.push(candidate);
      this.saveCandidates(candidates);
      this.notificationService.applicationSubmitted();
      return true;
    } catch (error) {
      this.notificationService.error('Failed to submit application. Please try again.');
      return false;
    }
  }

  updateCandidate(updatedCandidate: Candidate): boolean {
    try {
      const candidates = this.getCandidates();
      const index = candidates.findIndex(c => c.id === updatedCandidate.id);
      if (index === -1) {
        this.notificationService.error('Candidate not found. Please try again.');
        return false;
      }
      if (!this.canEditSubmission(updatedCandidate.email)) {
        this.notificationService.submissionExpired();
        return false;
      }

      candidates[index] = {
        ...updatedCandidate,
        lastEditDate: new Date()
      };
      this.saveCandidates(candidates);
      this.notificationService.applicationUpdated();
      return true;
    } catch (error) {
      this.notificationService.error('Failed to update application. Please try again.');
      return false;
    }
  }

  getCandidates(): Candidate[] {
    return this.candidatesSubject.value;
  }

  getCandidateById(id: string): Candidate | null {
    return this.getCandidates().find(c => c.id === id) || null;
  }

  getCandidateByEmail(email: string): Candidate | null {
    return this.getCandidates().find(c => c.email.toLowerCase() === email.toLowerCase()) || null;
  }

  canEditSubmission(email: string): boolean {
    const candidate = this.getCandidateByEmail(email);
    if (!candidate) return false;

    const submissionDate = new Date(candidate.submissionDate);
    const now = new Date();
    const daysDiff = (now.getTime() - submissionDate.getTime()) / (1000 * 60 * 60 * 24);

    return daysDiff <= 3;
  }

  getDaysRemaining(email: string): number {
    const candidate = this.getCandidateByEmail(email);
    if (!candidate) return 0;

    const submissionDate = new Date(candidate.submissionDate);
    const now = new Date();
    const daysDiff = (now.getTime() - submissionDate.getTime()) / (1000 * 60 * 60 * 24);

    return Math.max(0, Math.ceil(3 - daysDiff));
  }

  getSubmissionStatus(email: string): { canEdit: boolean; daysRemaining: number; message: string } {
    const candidate = this.getCandidateByEmail(email);

    if (!candidate) {
      return {
        canEdit: false,
        daysRemaining: 0,
        message: 'No registration found for this email address.'
      };
    }

    const canEdit = this.canEditSubmission(email);
    const daysRemaining = this.getDaysRemaining(email);

    if (canEdit) {
      return {
        canEdit: true,
        daysRemaining,
        message: `You can edit your submission. ${daysRemaining} day(s) remaining.`
      };
    } else {
      return {
        canEdit: false,
        daysRemaining: 0,
        message: 'The 3-day editing window has expired. You can no longer edit your submission.'
      };
    }
  }
  
  checkEmailAvailability(email: string): boolean {
    const existingCandidate = this.getCandidateByEmail(email);
    if (existingCandidate) {
      return false;
    }
    return true;
  }

  deleteCandidate(id: string): boolean {
    try {
      const candidates = this.getCandidates();
      const index = candidates.findIndex(c => c.id === id);
      
      if (index === -1) {
        this.notificationService.error('Candidate not found.');
        return false;
      }

      candidates.splice(index, 1);
      this.saveCandidates(candidates);
      this.notificationService.success('Application deleted successfully.');
      return true;
    } catch (error) {
      this.notificationService.error('Failed to delete application. Please try again.');
      return false;
    }
  }

  clearAllCandidates(): boolean {
    try {
      this.candidatesSubject.next([]);
      localStorage.removeItem('candidates');
      this.notificationService.success('All applications cleared successfully.');
      return true;
    } catch (error) {
      this.notificationService.error('Failed to clear applications. Please try again.');
      return false;
    }
  }
} 