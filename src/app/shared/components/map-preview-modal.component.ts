import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Candidate } from '../../models/candidate.model';
import { CityCoordinates } from '../../models/map-location.model';
import * as L from 'leaflet';
import { DashboardService } from '../../core/services/dashboard.service';

@Component({
  selector: 'app-map-preview-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="map-modal-container">
      <div class="map-modal-header">
        <div class="header-content">
          <div class="header-title">
            <mat-icon>map</mat-icon>
            <div class="title-content">
              <h2>Candidate Locations in Israel</h2>
              <p>Geographic distribution of registered candidates</p>
            </div>
          </div>
          <button mat-icon-button (click)="close()" class="close-button">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      </div>
      
      <div class="map-modal-content">
        <div id="mapPreview" class="map-container"></div>
      </div>
    </div>
  `,
  styles: [`
    .map-modal-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: white;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .map-modal-header {
      background: #f8f9fa;
      border-bottom: 1px solid #e9ecef;
      padding: 16px 24px;
      
      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .header-title {
          display: flex;
          align-items: center;
          gap: 12px;
          
          mat-icon {
            font-size: 24px;
            width: 24px;
            height: 24px;
            color: #1976d2;
          }
          
          .title-content {
            h2 {
              font-size: 18px;
              font-weight: 600;
              color: #333;
              margin: 0 0 4px 0;
              
              @media (max-width: 768px) {
                font-size: 16px;
              }
            }
            
            p {
              font-size: 14px;
              color: #666;
              margin: 0;
              
              @media (max-width: 768px) {
                font-size: 12px;
              }
            }
          }
        }
        
        .close-button {
          color: #666;
          
          &:hover {
            background: rgba(0, 0, 0, 0.04);
          }
        }
      }
    }
    
    .map-modal-content {
      flex: 1;
      position: relative;
      
      .map-container {
        width: 100%;
        height: 100%;
        min-height: 400px;
        
        @media (max-width: 768px) {
          min-height: 300px;
        }
      }
    }
  `]
})
export class MapPreviewModalComponent implements OnInit, OnDestroy {
  candidates: Candidate[] = [];
  
  private map: L.Map | null = null;
  private markers: L.Marker[] = [];
  
  constructor(
    public dialogRef: MatDialogRef<MapPreviewModalComponent>,
    private dashboardService: DashboardService
    @Inject(MAT_DIALOG_DATA) public data: { candidates: Candidate[] }
  ) {
    this.candidates = data.candidates;
  }
  
  ngOnInit(): void {
    setTimeout(() => {
      this.initMap();
    }, 100);
  }
  
  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }
  
  close(): void {
    this.dialogRef.close();
  }
  
  private initMap(): void {
    this.map = L.map('mapPreview').setView([31.0461, 34.8516], 8);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    setTimeout(() => {
      this.updateMarkers();
    }, 100);
  }

  private updateMarkers(): void {
    this.clearMarkers();
    
    const validCities = this.dashboardService.getValidCities();
    let validCandidates = 0;
    
    this.candidates.forEach(candidate => {
      if (validCities.includes(candidate.city)) {
        const coords = this.dashboardService.getCoordinatesForCity(candidate.city);
        if (coords) {
          const marker = L.marker(coords)
            .addTo(this.map!)
            .bindPopup(`
              <strong>${candidate.fullName}</strong><br>
              ${candidate.email}<br>
              Age: ${candidate.age}<br>
              City: ${candidate.city}
            `);
          this.markers.push(marker);
          validCandidates++;
        }
      }
    });
    
    if (validCandidates === 0 && this.candidates.length > 0) {
      this.showNoValidLocationsMessage();
    }
  }

  private showNoValidLocationsMessage(): void {
    const mapContainer = document.getElementById('mapPreview');
    if (mapContainer) {
      const messageDiv = document.createElement('div');
      messageDiv.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255, 255, 255, 0.95);
        padding: 15px 20px;
        border-radius: 6px;
        z-index: 1000;
        font-size: 16px;
        color: #333;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        text-align: center;
        max-width: 300px;
      `;
      messageDiv.textContent = 'No candidates to display';
      mapContainer.appendChild(messageDiv);
      
      setTimeout(() => {
        if (messageDiv.parentNode) {
          messageDiv.parentNode.removeChild(messageDiv);
        }
      }, 5000);
    }
  }

  private clearMarkers(): void {
    this.markers.forEach(marker => {
      marker.remove();
    });
    this.markers = [];
  }

} 