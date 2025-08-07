import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { Candidate } from '../../../models/candidate.model';

@Component({
  selector: 'app-candidates-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './candidates-table.component.html',
  styleUrl: './candidates-table.component.scss'
})
export class CandidatesTableComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {
  @Input() candidates: Candidate[] = [];
  @Input() filteredCandidates: Candidate[] = [];
  @Output() viewCandidate = new EventEmitter<Candidate>();

  displayedColumns: string[] = ['name', 'age', 'city', 'actions'];
  dataSource = new MatTableDataSource<Candidate>([]);

  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.updateDataSource();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filteredCandidates']) {
      this.updateDataSource();
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {}

  private updateDataSource(): void {
    this.dataSource.data = this.filteredCandidates;
  }

  onViewCandidate(candidate: Candidate): void {
    this.viewCandidate.emit(candidate);
  }

  getInitials(fullName: string): string {
    return fullName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}
