import { Component, inject, Inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common'; 
import { MyHomebrewComponent } from '../my-homebrew/my-homebrew.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list'
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../constants';
import { RouterLink } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-profile',
  standalone: true, 
  imports: [CommonModule, MyHomebrewComponent, MatSidenavModule, MatListModule, RouterLink, MatTooltipModule], 
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  char_data: any[] = [];
  username: string = '';
  userId: number | null = null;
  email: string = '';
  selectedTab: string = 'overview';
  hiddenArray = [false, true, true];
  currentUser: any;
  authService = inject(AuthService);

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    this.username = this.route.snapshot.paramMap.get('username') || '';
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser && this.currentUser.id && this.currentUser.email) {
      this.email = this.currentUser.email;
      this.userId = this.currentUser.id;
      this.getAllCharactersFromUser(this.currentUser.id)
    }
  }


  public showTab(tabId: string) {
    switch(tabId) {
      case "myProfile": {
        this.hiddenArray = [false, true, true];
        break;
      }
      case "myCharacters": {
        this.hiddenArray = [true, false, true];
        break;
      }
      case "myHomebrew": {
        this.hiddenArray = [true, true, false];
        break;
      }
    }
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

  getClassBreakdown(character: any): string {
    return character.classes
      .map((cls: string, i: number) => `Level ${character.levels[i]} ${cls}\n`) // Level 2 Barbarian (for example)
      .join('\n');
  }
}