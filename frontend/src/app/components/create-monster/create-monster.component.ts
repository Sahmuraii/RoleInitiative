import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MonsterService } from '../../services/monster.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common'; 

@Component({
  selector: 'app-create-monster',
  standalone: true,
  templateUrl: './create-monster.component.html',
  styleUrls: ['./create-monster.component.css'],
  imports: [ReactiveFormsModule, CommonModule], 
})
export class CreateMonsterComponent implements OnInit {
  monsterForm: FormGroup;
  currentUserID: number | null = null;

  sizes = ['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan'];
  types = ['Aberration', 'Beast', 'Celestial', 'Construct', 'Dragon', 'Elemental', 'Fey', 'Fiend', 'Giant', 'Humanoid', 'Monstrosity', 'Ooze', 'Plant', 'Undead'];
  subtypes = ['None', 'Shapechanger', 'Swarm', 'Elemental', 'Fiend', 'Dragon', 'Fey', 'Giant', 'Undead', 'Construct', 'Monstrosity', 'Ooze', 'Plant', 'Beast'];
  alignments = ['Lawful Good', 'Neutral Good', 'Chaotic Good', 'Lawful Neutral', 'Neutral', 'Chaotic Neutral', 'Lawful Evil', 'Neutral Evil', 'Chaotic Evil', 'Unaligned'];
  armorTypes = ['Natural Armor', 'Light Armor', 'Medium Armor', 'Heavy Armor', 'None'];
  damageTypes = ['Acid', 'Bludgeoning', 'Cold', 'Fire', 'Force', 'Lightning', 'Necrotic', 'Piercing', 'Poison', 'Psychic', 'Radiant', 'Slashing', 'Thunder'];
  conditionTypes = ['Blinded', 'Charmed', 'Deafened', 'Frightened', 'Grappled', 'Incapacitated', 'Invisible', 'Paralyzed', 'Petrified', 'Poisoned', 'Prone', 'Restrained', 'Stunned', 'Unconscious'];
  skillTypes = ['Acrobatics', 'Animal Handling', 'Arcana', 'Athletics', 'Deception', 'History', 'Insight', 'Intimidation', 'Investigation', 'Medicine', 'Nature', 'Perception', 'Performance', 'Persuasion', 'Religion', 'Sleight of Hand', 'Stealth', 'Survival'];
  challengeRatings = ['0', '1/8', '1/4', '1/2', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30'];
  monsterHabitats = ['Any', 'Arctic', 'Coastal', 'Desert', 'Forest', 'Grassland', 'Hill', 'Mountain', 'Swamp', 'Underdark', 'Underwater', 'Urban'];
  damageAdjustmentTypes = ['Resist', 'Immune', 'Vulnerable'];
  hitDiceValues = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20'];

  skillCategories = [
    { name: 'Strength', skills: ['Athletics'] },
    { name: 'Dexterity', skills: ['Acrobatics', 'Sleight of Hand', 'Stealth'] },
    { name: 'Intelligence', skills: ['Arcana', 'History', 'Investigation', 'Nature', 'Religion'] },
    { name: 'Wisdom', skills: ['Animal Handling', 'Insight', 'Medicine', 'Perception', 'Survival'] },
    { name: 'Charisma', skills: ['Deception', 'Intimidation', 'Performance', 'Persuasion'] }
  ];

  constructor(
    private fb: FormBuilder,
    private monsterService: MonsterService,
    private router: Router,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.monsterForm = this.fb.group({
      name: [''], 
      size: [''],
      type: [''],
      subtype: [''],
      alignment: [''], 
      armorClass: [''], 
      armorType: [''], 
      hitPoints: [''], 
      hitDice: [''], 
      hitPointsDieCount: [''], 
      hitPointsValue: [''], 
      hitPointsModifier: [''], 
      averageHP: [''],
      speed: [''], 
      strength: [''], 
      dexterity: [''], 
      constitution: [''], 
      intelligence: [''], 
      wisdom: [''],
      charisma: [''], 
      initiativeBonus: [''], 
      passivePerception: [''], 
      savingThrows: this.fb.array([]), 
      skills: this.fb.array([]), 
      damageVulnerabilities: this.fb.array([]), 
      damageResistances: this.fb.array([]), 
      damageImmunities: this.fb.array([]), 
      conditionImmunities: this.fb.array([]), 
      senses: [''], 
      languages: [''],
      languageNotes: [''], 
      challengeRating: [''], 
      traits: this.fb.array([]), 
      specialAbilities: this.fb.array([]), 
      actions: this.fb.array([]), 
      bonusActions: this.fb.array([]), 
      reactions: this.fb.array([]),
      isLegendary: [false],
      legendaryActions: this.fb.array([]), 
      legendaryActionDescription: [''], 
      isMythic: [false], 
      mythicActions: this.fb.array([]), 
      mythicActionDescription: [''], 
      hasLair: [false], 
      lairXP: [''], 
      lairDescription: [''],
      lairActions: this.fb.array([]), 
      monsterHabitats: this.fb.array([]), 
      gear: [''], 
      damageAdjustments: this.fb.array([]),
      description: ['']
    });

    this.initializeSavingThrows();
    this.initializeSkills();
  }

  ngOnInit(): void {
      if (isPlatformBrowser(this.platformId)) {
        const currentUser = this.authService.getCurrentUser();
        if (currentUser && currentUser.id != null) {
          this.currentUserID = currentUser.id;
        } else {
          console.error('No user is logged in for Spells.');
          this.router.navigate(['/login']);
        }
      } else {
        console.warn('Running on the server. Skipping localStorage access.');
      }
    }

  initializeSavingThrows(): void {
    const savingThrowsArray = this.monsterForm.get('savingThrows') as FormArray;
    ['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma'].forEach(stat => {
      savingThrowsArray.push(this.fb.group({
        stat: [stat],
        value: ['']
      }));
    });
  }

  initializeSkills(): void {
    const skillsArray = this.monsterForm.get('skills') as FormArray;
    skillsArray.clear(); 
    skillsArray.push(this.fb.group({
      skill: [''], 
      customSkill: [''], 
      value: [''] 
    }));
  }

  onSkillChange(event: Event, index: number): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedValue = selectElement.value;
    const skillControl = this.skills.at(index);
  
    if (selectedValue === 'custom') {
      skillControl.get('customSkill')?.enable(); 
    } else {
      skillControl.get('customSkill')?.disable(); 
    }
  }

  addSkill(): void {
    const skillsArray = this.monsterForm.get('skills') as FormArray;
    skillsArray.push(this.fb.group({
      skill: [''], 
      customSkill: [''], 
      value: [''] 
    }));
  }

  removeSkill(index: number): void {
    const skillsArray = this.monsterForm.get('skills') as FormArray;
    skillsArray.removeAt(index); 
  }
  

  get savingThrows(): FormArray {
    return this.monsterForm.get('savingThrows') as FormArray;
  }

  get skills(): FormArray {
    return this.monsterForm.get('skills') as FormArray;
  }

  get damageVulnerabilities(): FormArray {
    return this.monsterForm.get('damageVulnerabilities') as FormArray;
  }

  get damageResistances(): FormArray {
    return this.monsterForm.get('damageResistances') as FormArray;
  }

  get damageImmunities(): FormArray {
    return this.monsterForm.get('damageImmunities') as FormArray;
  }

  get conditionImmunities(): FormArray {
    return this.monsterForm.get('conditionImmunities') as FormArray;
  }

  get traits(): FormArray {
    return this.monsterForm.get('traits') as FormArray;
  }

  get specialAbilities(): FormArray {
    return this.monsterForm.get('specialAbilities') as FormArray;
  }

  get actions(): FormArray {
    return this.monsterForm.get('actions') as FormArray;
  }

  get bonusActions(): FormArray {
    return this.monsterForm.get('bonusActions') as FormArray;
  }

  get reactions(): FormArray {
    return this.monsterForm.get('reactions') as FormArray;
  }

  get legendaryActions(): FormArray {
    return this.monsterForm.get('legendaryActions') as FormArray;
  }

  get mythicActions(): FormArray {
    return this.monsterForm.get('mythicActions') as FormArray;
  }

  get lairActions(): FormArray {
    return this.monsterForm.get('lairActions') as FormArray;
  }

  get monsterHabitatsArray(): FormArray {
    return this.monsterForm.get('monsterHabitats') as FormArray;
  }

  get damageAdjustments(): FormArray {
    return this.monsterForm.get('damageAdjustments') as FormArray;
  }

  getAvailableConditions(index: number): string[] {
    const selectedConditions = this.conditionImmunities.controls
      .map((control, i) => (i !== index ? control.get('condition')?.value : null))
      .filter(condition => condition !== null);
  
    return this.conditionTypes.filter(condition => !selectedConditions.includes(condition));
  }

  getAvailableHabitats(index: number): string[] {
    const selectedHabitats = this.monsterHabitatsArray.controls
      .map((control, i) => (i !== index ? control.get('habitat')?.value : null))
      .filter(habitat => habitat !== null);
  
    return this.monsterHabitats.filter(habitat => !selectedHabitats.includes(habitat));
  }

  addDamageVulnerability(): void {
    this.damageVulnerabilities.push(new FormControl(''));
  }

  removeDamageVulnerability(index: number): void {
    this.damageVulnerabilities.removeAt(index);
  }

  addDamageResistance(): void {
    this.damageResistances.push(new FormControl(''));
  }

  removeDamageResistance(index: number): void {
    this.damageResistances.removeAt(index);
  }

  addDamageImmunity(): void {
    this.damageImmunities.push(new FormControl(''));
  }

  removeDamageImmunity(index: number): void {
    this.damageImmunities.removeAt(index);
  }

  addConditionImmunity(): void {
    this.conditionImmunities.push(this.fb.group({
      condition: [''] 
    }));
  }

  removeConditionImmunity(index: number): void {
    this.conditionImmunities.removeAt(index);
  }

  addDamageAdjustment(): void {
    this.damageAdjustments.push(this.fb.group({
      type: [''], 
      adjustmentType: [''], 
      notes: [''] 
    }));
  }

  removeDamageAdjustment(index: number): void {
    this.damageAdjustments.removeAt(index);
  }

  addTrait(): void {
    this.traits.push(this.fb.group({
      name: [''], 
      description: [''] 
    }));
  }

  removeTrait(index: number): void {
    this.traits.removeAt(index);
  }

  addSpecialAbility(): void {
    this.specialAbilities.push(this.fb.group({
      name: [''], 
      description: ['']
    }));
  }

  removeSpecialAbility(index: number): void {
    this.specialAbilities.removeAt(index);
  }

  addAction(): void {
    this.actions.push(this.fb.group({
      name: [''], 
      description: [''] 
    }));
  }

  removeAction(index: number): void {
    this.actions.removeAt(index);
  }

  addBonusAction(): void {
    this.bonusActions.push(this.fb.group({
      name: [''], 
      description: [''] 
    }));
  }

  removeBonusAction(index: number): void {
    this.bonusActions.removeAt(index);
  }

  addReaction(): void {
    this.reactions.push(this.fb.group({
      name: [''],
      description: [''] 
    }));
  }

  removeReaction(index: number): void {
    this.reactions.removeAt(index);
  }

  addLegendaryAction(): void {
    this.legendaryActions.push(this.fb.group({
      name: [''],
      description: [''] 
    }));
  }

  removeLegendaryAction(index: number): void {
    this.legendaryActions.removeAt(index);
  }

  addMythicAction(): void {
    this.mythicActions.push(this.fb.group({
      name: [''],
      description: [''] 
    }));
  }

  removeMythicAction(index: number): void {
    this.mythicActions.removeAt(index);
  }

  addLairAction(): void {
    this.lairActions.push(this.fb.group({
      name: [''], 
      description: [''] 
    }));
  }

  removeLairAction(index: number): void {
    this.lairActions.removeAt(index);
  }

  addMonsterHabitat(): void {
    this.monsterHabitatsArray.push(this.fb.group({
      habitat: [''] 
    }));
  }

  removeMonsterHabitat(index: number): void {
    this.monsterHabitatsArray.removeAt(index);
  }

  onSubmit(): void {
    if (this.monsterForm.invalid || !this.currentUserID) {
      alert('Please fill out all required fields and ensure you are logged in.');
      return;
    }

    const monsterData = {
      ...this.monsterForm.value,
      userID: this.currentUserID
    };

    console.log('Monster data:', monsterData);

    this.monsterService.createMonster(monsterData).subscribe({
      next: (response) => {
        alert('Monster created successfully!');
        console.log('Monster created with response:', response);
        this.router.navigate(['/create_monster']);
      },
      error: (error) => {
        console.error('Error creating monster:', error);
        alert('Failed to create monster. Please try again.');
      }
    });
  }
}