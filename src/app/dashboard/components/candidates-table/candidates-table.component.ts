import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
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
export class CandidatesTableComponent implements OnInit, OnChanges, AfterViewInit {
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
    this.dataSource.sortingDataAccessor = this.sortingDataAccessor.bind(this);
  }

  private updateDataSource(): void {
    this.dataSource.data = this.filteredCandidates;
  }

  private sortingDataAccessor(item: Candidate, property: string): string | number {
    switch (property) {
      case 'age': // This is still the column name in displayedColumns
        return item.dateOfBirth ? new Date(item.dateOfBirth).getTime() : 0;
      case 'fullName':
        return item.fullName.toLowerCase();
      case 'city':
        return item.city.toLowerCase();
      default:
        return item[property as keyof Candidate] as string | number;
    }
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
