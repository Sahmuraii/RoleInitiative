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
    this.authService.isLoggedIn$.subscribe((isLoggedIn) => {
      if (isLoggedIn && this.authService.getCurrentUser()) {
        this.search();
      }
    });
  }


  search(): void {
    this.homebrewService.searchHomebrew(this.selectedType, this.searchQuery, this.currentPage).subscribe(data => {
      this.results = data.items;
      this.hasMoreResults = data.hasMore;

      const user = this.authService.getCurrentUser();
      if (!user) {
        console.warn('User not loaded yet');
        return;
      }

      const params = new HttpParams().set('userID', user.id);

      this.http.get(`${API_URL}saved-homebrew-ids`, { params }).subscribe((res: any) => {
        const savedList = res.saved as { content_type: string, content_id: number }[];

        const savedIds = savedList
          .filter(item => item.content_type === this.selectedType)
          .map(item => item.content_id);

        this.results = this.results.map(item => ({
          ...item,
          saved: savedIds.includes(item.user_spell_id || item.id)
        }));
      });
    });
  }

  toggleSave(item: any, index: number): void {
    const isCurrentlySaved = item.saved;

    const body = {
      content_type: this.selectedType,
      content_id: item.user_spell_id || item.id
    };

    const user = this.authService.getCurrentUser();
    if (!user) {
      console.error('User not logged in');
      return;
    }

    const params = new HttpParams().set('userID', user.id);

    const url = `${API_URL}save-homebrew`;

    this.http.post(url, body, { params }).subscribe({
      next: () => {
        this.results[index].saved = !isCurrentlySaved;
      },
      error: (err) => {
        console.error(`Action failed:`, err);
      }
    });
  }


  saveHomebrew(contentType: string, contentId: string): void {
    this.authService.isLoggedIn$.subscribe((isLoggedIn) => {
      if (isLoggedIn) {
        const body = {
          content_type: contentType, // info for database saying spell, monster, or whatever else
          content_id: contentId // spell_id for example. NOT userID, 13 for spell_id NOT EQUAL to 13 for monster_id
        };

        const user = this.authService.getCurrentUser();
        if (!user) {
          console.error('User not logged in');
          return;
        }
        const params = new HttpParams().set('userID', user.id);

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

  formatList(value: string): string {
    if (!value) return '';
    return value.split(',').map(item => item.trim()).join(', ');
  }

formatModifier(value: number, noSpace = true): string {
    if (value === null || value === undefined) return '';
    const space = noSpace ? '' : ' ';
    return value >= 0 ? `${space}+${value}` : `${space}-${Math.abs(value)}`;
  }

  formatSavingThrows(savingThrows: string): string {
    if (!savingThrows) return '';
    return savingThrows
      .split(',')
      .map(throwStr => {
        const parts = throwStr.trim().split(' ');
        if (parts.length > 1 && !isNaN(Number(parts[1]))) {
          const modifier = Number(parts[1]);
          parts[1] = modifier >= 0 ? `+${modifier}` : modifier.toString();
        }
        return parts.join(' ');
      })
      .join(', ');
  }

  formatSkills(skills: string): string {
    if (!skills) return '';

    return skills
      .split(',')
      .map(skillStr => {
        skillStr = skillStr.trim();

        const lastSpaceIndex = skillStr.lastIndexOf(' ');
        if (lastSpaceIndex === -1) return skillStr;

        const skillName = skillStr.substring(0, lastSpaceIndex).trim();
        const modifierStr = skillStr.substring(lastSpaceIndex + 1).trim();

        if (!isNaN(Number(modifierStr))) {
          const modifier = Number(modifierStr);
          const formattedModifier = modifier >= 0 ? `+${modifier}` : modifier.toString();
          return `${skillName} ${formattedModifier}`;
        }

        return skillStr;
      })
      .join(', ');
  }

  getModifier(score: number): string {
    if (score === null || score === undefined) return '+0';
    const modifier = Math.floor((score - 10) / 2);
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  }

  calculateXP(cr: string): string {
    const xpValues: {[key: string]: string} = {
      '0': '0',
      '1/8': '25',
      '1/4': '50',
      '1/2': '100',
      '1': '200',
      '2': '450',
      '3': '700',
      '4': '1,100',
      '5': '1,800',
      '6': '2,300',
      '7': '2,900',
      '8': '3,900',
      '9': '5,000',
      '10': '5,900',
      '11': '7,200',
      '12': '8,400',
      '13': '10,000',
      '14': '11,500',
      '15': '13,000',
      '16': '15,000',
      '17': '18,000',
      '18': '20,000',
      '19': '22,000',
      '20': '25,000',
      '21': '33,000',
      '22': '41,000',
      '23': '50,000',
      '24': '62,000',
      '25': '75,000',
      '26': '90,000',
      '27': '105,000',
      '28': '120,000',
      '29': '135,000',
      '30': '155,000'
    };
    return xpValues[cr] || '0';
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
