import { Component, OnInit } from '@angular/core';
import { HomebrewService } from '../../services/homebrew.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { API_URL } from '../../constants';

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

  constructor(
    private homebrewService: HomebrewService,
    public authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.search(); // load initial results
  }

  search(): void {
    this.homebrewService.searchHomebrew(this.selectedType, this.searchQuery, this.currentPage).subscribe(data => {
      this.results = data.items;
      //console.log(this.results);

      this.hasMoreResults = data.hasMore;
    });
  }



  saveHomebrew(contentType: string, contentId: string): void {
    this.authService.isLoggedIn$.subscribe((isLoggedIn) => {
      if (isLoggedIn) {
        const body = {
          content_type: contentType, // info for database saying spell, monster, or whatever else
          content_id: contentId // spell_id for example. NOT userID, 13 for spell_id NOT EQUAL to 13 for monster_id
        };

        const params = new HttpParams().set(
          'userID',
          this.authService.getCurrentUser().id
        );

        this.http.post(`${API_URL}save-homebrew`, body, { params }).subscribe(
          (res: any) => {
            console.log('Saved!'); //TODO: Make homebrew save be a toggle
          },
          (error) => {
            console.error('Error saving homebrew:', error);
          }
        );
      }
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

  hoveredSpellIndex: number | null = null;

  hideDesc = true;

  onMouseEnter(index: number): void {
    this.hoveredSpellIndex = index;
  }

  onMouseExit(): void {
    this.hoveredSpellIndex = null;
  }

}
