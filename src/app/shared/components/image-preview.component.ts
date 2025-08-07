import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-image-preview',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <div class="image-preview-container" *ngIf="imageUrl">
      <img [src]="imageUrl" [alt]="altText" class="preview-image">
    </div>
  `,
  styles: [`
    .image-preview-container {
      max-width: 200px;
      max-height: 200px;
      overflow: hidden;
      border-radius: 4px;
      border: 1px solid #ddd;
      margin: 0 auto;
      
      @media (max-width: 600px) {
        max-width: 150px;
        max-height: 150px;
      }
    }
    
    .preview-image {
      width: 100%;
      height: auto;
      object-fit: cover;
    }
  `]
})
export class ImagePreviewComponent {
  @Input() imageUrl: string | null = null;
  @Input() altText: string = 'Image preview';
} 