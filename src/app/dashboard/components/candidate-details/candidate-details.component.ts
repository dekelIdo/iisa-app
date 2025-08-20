import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Candidate } from '../../../models/candidate.model';
import { ImageModalComponent } from '../../../shared/components/image-modal.component';

@Component({
  selector: 'app-candidate-details',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
    ImageModalComponent
  ],
  templateUrl: './candidate-details.component.html',
  styleUrl: './candidate-details.component.scss'
})
export class CandidateDetailsComponent implements OnInit {
  candidates: Candidate[] = [];
  currentIndex: number = 0;
  candidate: Candidate | null = null;
  showImageModal: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<CandidateDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { candidates: Candidate[], currentIndex: number }
  ) {
    this.candidates = data.candidates || [];
    this.currentIndex = data.currentIndex || 0;
    this.updateCurrentCandidate();
  }

  ngOnInit(): void {
    if (!this.candidate && this.candidates.length > 0) {
      this.currentIndex = 0;
      this.updateCurrentCandidate();
    }
  }

  private updateCurrentCandidate(): void {
    if (this.candidates.length > 0 && this.currentIndex >= 0 && this.currentIndex < this.candidates.length) {
      this.candidate = this.candidates[this.currentIndex];
    } else {
      this.candidate = null;
    }
  }

  previousCandidate(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.updateCurrentCandidate();
    }
  }

  nextCandidate(): void {
    if (this.currentIndex < this.candidates.length - 1) {
      this.currentIndex++;
      this.updateCurrentCandidate();
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  openImageModal(): void {
    if (this.candidate?.profileImage) {
      this.showImageModal = true;
    }
  }

  closeImageModal(): void {
    this.showImageModal = false;
  }

  getInitials(fullName: string): string {
    if (!fullName) return '';
    return fullName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}
