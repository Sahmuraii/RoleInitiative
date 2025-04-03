import { Component, Input, OnInit } from '@angular/core';
import { SpellService } from '../../services/spell.service';
import { BackgroundService } from '../../services/background.service';
import { MonsterService } from '../../services/monster.service';
import { CommonModule } from '@angular/common'; // Import CommonModule for *ngIf and *ngFor
import { Router } from '@angular/router'; // Import Router
 
@Component({
  selector: 'app-my-homebrew',
  standalone: true, // Ensure it's standalone
  imports: [CommonModule], // Import CommonModule for directives
  templateUrl: './my-homebrew.component.html',
  styleUrls: ['./my-homebrew.component.css']
})
export class MyHomebrewComponent implements OnInit {
  @Input() userId: number | null = null; // Define the input property
  spells: any[] = [];
  backgrounds: any[] = [];
  monsters: any[] = [];

  constructor(
    private spellService: SpellService,
    private backgroundService: BackgroundService,
    private monsterService: MonsterService,
    private router: Router 
  ) {}

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

  ngOnInit(): void {
    if (this.userId) {
      this.fetchSpells();
      this.fetchBackgrounds();
      this.fetchMonsters();
    }
  }

  fetchSpells(): void {
    this.spellService.getSpellsByUser(this.userId!).subscribe({
      next: (spells) => {
        console.log('Spells fetched:', spells); 
        if (spells.length > 0) console.log('First spell data:', JSON.stringify(spells[0]));
        this.spells = spells;
      },
      error: (error) => {
        console.error('Error fetching spells:', error);
      }
    });
  }

  fetchBackgrounds(): void {
    this.backgroundService.getBackgroundsByUser(this.userId!).subscribe({
      next: (backgrounds) => {
        console.log('Backgrounds fetched:', backgrounds); // Log the fetched backgrounds
        this.backgrounds = backgrounds;
      },
      error: (error) => {
        console.error('Error fetching backgrounds:', error);
        console.error('Full error response:', error.error); // Log the full error response
        alert('Failed to fetch backgrounds. Please check the console for details.');
      }
    });
  }

  fetchMonsters(): void {
    this.monsterService.getMonstersByUser(this.userId!).subscribe({
      next: (monsters) => {
        console.log('Monsters fetched:', monsters); // Log the fetched monsters
        this.monsters = monsters;
      },
      error: (error) => {
        console.error('Error fetching monsters:', error);
      }
    });
  }

  navigateToEditSpells(spellId: number): void {
    this.router.navigate(['/edit-spell', spellId]); // Navigate to the edit route
  }

  navigateToEditBackground(backgroundId: number): void {
    this.router.navigate(['/edit-background', backgroundId]); // Navigate to the edit route
  }

  navigateToEditMonster(monsterId: number): void {
    this.router.navigate(['/edit-monster', monsterId]); // Navigate to the edit route
  }
}