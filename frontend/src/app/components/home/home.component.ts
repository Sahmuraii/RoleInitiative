import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { API_URL } from '../../constants';
import { UpperCasePipe } from '@angular/common';
import { CapitalizePipe } from '../../capitalize.pipe';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, RouterModule, MatTooltipModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  char_data: any[] = [];
  currentUser: any = null;
  characters: any[] = [];
  filteredCharacters: any[] = [];
  searchTerm: string = '';
  isFocused: boolean = false;

  constructor(private http: HttpClient, public authService: AuthService) {}

  ngOnInit(): void {
    this.fetchCharacters();
    // Subscribe to auth state changes
    this.authService.isLoggedIn$.subscribe((isLoggedIn) => {
      if (isLoggedIn) {
        this.currentUser = this.authService.getCurrentUser();
        this.getAllCharactersFromUser(this.currentUser.id); // Load characters only if logged in
      } else {
        this.currentUser = null;
        this.char_data = []; // Clear data on logout
      }
    });
  }

  fetchCharacters() {
    this.http.get(`${API_URL}all_characters`).subscribe(
      (res: any) => {
        if (res.characters) {
          this.characters = res.characters;
          this.filteredCharacters = this.characters; // Initialize filtered list with all characters
          //console.log(this.characters);
        } else {
          console.error('No characters found in response');
        }
      },
      (error) => {
        console.error('Error fetching all character data:', error);
      }
    );
  }

  filterCharacters() {
    const term = this.searchTerm.toLowerCase();
    this.filteredCharacters = this.characters.filter(character =>
      character.character_name.toLowerCase().includes(term) ||
      character.owner_name.toLowerCase().includes(term) ||
      character.race.toLowerCase().includes(term) ||
      character.highest_class.toLowerCase().includes(term)
    );
  }

  // Show results only when input is focused
  onFocus() {
    this.isFocused = true;
  }

  // Hide results when clicking outside
  onBlur() {
    setTimeout(() => {
      this.isFocused = false;
    }, 200); // Delay to allow clicking on result before hiding
  }

  getAllCharactersFromUser(user_id: number): void {
    this.http.get(`${API_URL}characters/${user_id}`).subscribe(
      (res: any) => {
        if (res.characters) {
          this.char_data = res.characters;
          //console.log(this.char_data);
        } else {
          console.error('No characters found in response');
        }
      },
      (error) => {
        console.error('Error fetching character data:', error);
      }
    );
  }

  bookmarkCharacter(character: any) {
    console.log('Bookmarked:', character);
    // TODO: Implement Actual Function
  }

  getClassBreakdown(character: any): string {
    return character.classes
      .map((cls: string, i: number) => `Level ${character.levels[i]} ${cls}\n`) // Level 2 Barbarian (for example)
      .join('\n');
  }

  logout() {
    this.authService.logout();
  }
}
