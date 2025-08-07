import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Candidate } from '../../../models/candidate.model';

@Component({
  selector: 'app-map-preview',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './map-preview.component.html',
  styleUrl: './map-preview.component.scss'
})
export class MapPreviewComponent {
  @Input() candidates: Candidate[] = [];
  @Output() openMap = new EventEmitter<void>();

  onOpenMap(): void {
    this.openMap.emit();
  }
}
