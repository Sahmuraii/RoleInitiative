import { Component, Input, OnInit } from '@angular/core';
import { SpellService } from '../../services/spell.service';
import { BackgroundService } from '../../services/background.service';
import { MonsterService } from '../../services/monster.service';
import { HomebrewService } from '../../services/homebrew.service';
import { CommonModule } from '@angular/common'; // Import CommonModule for *ngIf and *ngFor
import { Router } from '@angular/router'; // Import Router

@Component({
  selector: 'app-saved-homebrew',
  standalone: true, // Ensure it's standalone
  imports: [CommonModule], // Import CommonModule for directives
  templateUrl: './saved-homebrew.component.html',
  styleUrls: ['./saved-homebrew.component.css']
})
export class SavedHomebrewComponent implements OnInit {
  @Input() userId: number | null = null; // Define the input property
  spells: any[] = [];
  backgrounds: any[] = [];
  monsters: any[] = [];
  magicItems: any[] = [];
  feats: any[] = [];
  collapsedDescriptions: {[key: number]: boolean} = {};

  constructor(
    private spellService: SpellService,
    private backgroundService: BackgroundService,
    private monsterService: MonsterService,
    private homebrewService: HomebrewService,
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
      this.homebrewService.getSavedHomebrew(this.userId!).subscribe({
        next: (data: any) => {
          console.log('UserID:', this.userId);
          this.spells = data.spell;
          this.backgrounds = data.background;
          this.monsters = data.monster;
          this.magicItems = data.magic_item;
          this.feats = data.feat;

          console.log('Saved Spells:', this.spells);
          console.log('Saved Backgrounds:', this.backgrounds);
          console.log('Saved Monsters:', this.monsters);
        },
        error: err => console.error(err)
      });
    }
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

  navigateToEditFeat(featId: number): void {
    this.router.navigate(['/edit-feat', featId]);
  }

  navigateToEditMagicItem(itemId: number): void {
    this.router.navigate(['/edit-magic-item', itemId]);
  }

  formatDescription(description: string): string {
    let formatted = description.replace(/&nbsp;/g, ' ');

    formatted = formatted.replace(/<p><\/p>/g, '<p>&nbsp;</p>');

    return formatted;
  }

  isDescriptionCollapsed(itemId: number): boolean {
    return this.collapsedDescriptions[itemId] !== false;
  }

  toggleDescription(itemId: number): void {
    this.collapsedDescriptions[itemId] = !this.isDescriptionCollapsed(itemId);
  }

  shouldShowToggle(description: string): boolean {
    if (!description || description.length < 50) return false;
    else return true
  }
}
