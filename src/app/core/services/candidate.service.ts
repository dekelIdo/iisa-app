import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Candidate } from '../../models/candidate.model';

@Injectable({
  providedIn: 'root'
})
export class CandidateService {
  private candidatesSubject = new BehaviorSubject<Candidate[]>([]);
  candidates$ = this.candidatesSubject.asObservable();

  constructor() {
    this.loadCandidates();
  }

  private loadCandidates(): void {
    const stored = localStorage.getItem('candidates');
    if (stored) {
      const candidates = JSON.parse(stored).map((c: any) => ({
        ...c,
        submissionDate: new Date(c.submissionDate),
        lastEditDate: c.lastEditDate ? new Date(c.lastEditDate) : undefined
      }));
      this.candidatesSubject.next(candidates);
    }
  }

  private saveCandidates(candidates: Candidate[]): void {
    localStorage.setItem('candidates', JSON.stringify(candidates));
    this.candidatesSubject.next(candidates);
  }

  addCandidate(candidate: Candidate): void {
    const candidates = this.getCandidates();
    candidates.push(candidate);
    this.saveCandidates(candidates);
  }

  updateCandidate(updatedCandidate: Candidate): void {
    const candidates = this.getCandidates();
    const index = candidates.findIndex(c => c.id === updatedCandidate.id);
    if (index !== -1) {
      candidates[index] = {
        ...updatedCandidate,
        lastEditDate: new Date()
      };
      this.saveCandidates(candidates);
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
} 