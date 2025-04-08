import { Component, OnInit } from '@angular/core';
import { HomebrewService } from '../../services/homebrew.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, RouterModule],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  selectedType: string = 'spell';
  searchQuery: string = '';
  results: any[] = [];
  currentPage: number = 1;
  hasMoreResults: boolean = false;
  itemsPerPage: number = 20;

  constructor(private homebrewService: HomebrewService) {}

  ngOnInit(): void {
    this.search(); // load initial results
  }

  search(): void {
    this.homebrewService.searchHomebrew(this.selectedType, this.searchQuery, this.currentPage).subscribe(data => {
      this.results = data.items;
      this.hasMoreResults = data.hasMore;
    });
  }

  onTypeChange(): void {
    this.currentPage = 1;
    this.search();
  }

  onPageChange(page: number): void {
    if (page < 1) return;
    this.currentPage = page;
    this.search();
  }
}
