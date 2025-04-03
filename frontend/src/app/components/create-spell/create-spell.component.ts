import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, FormsModule } from '@angular/forms';
import { SpellService } from '../../services/spell.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-spell',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './create-spell.component.html',
  styleUrls: ['./create-spell.component.css']
})
export class CreateSpellComponent implements OnInit {
  spellForm: FormGroup;
  currentUserID: number | null = null;

  spellSchools = [
    'Abjuration', 'Conjuration', 'Divination', 'Enchantment', 'Evocation',
    'Illusion', 'Necromancy', 'Transmutation'
  ];

  spellLevels = [
    'Cantrip', '1st-level', '2nd-level', '3rd-level', '4th-level',
    '5th-level', '6th-level', '7th-level', '8th-level', '9th-level'
  ];

  spellComponents = ['V', 'S', 'M'];

  spellRituals = ['Yes', 'No'];

  spellCastingTimes = [
    'Action', 'Bonus Action', 'Reaction', 'Minute', 'Hour', 'No Action', 'Special'
  ];

  spellRange = ['Self', 'Touch', 'Distance', 'Sight', 'Unlimited'];

  DurationType = ['Instantaneous', 'Concentration', 'Time', 'Special', 'Until Dispelled', 'Until Dispelled or Triggered'];

  areaTypes = ['Square', 'Cone', 'Line', 'Sphere', 'Cube', 'Cylinder'];

  saveStats = ['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma'];
  attackTypes = ['Melee', 'Ranged'];
  damageTypes = ['Acid', 'Bludgeoning', 'Cold', 'Fire', 'Force', 'Lightning', 'Necrotic', 'Piercing', 'Poison', 'Psychic', 'Radiant', 'Slashing', 'Thunder'];
  conditions = ['Blinded', 'Charmed', 'Deafened', 'Frightened', 'Grappled', 'Incapacitated', 'Invisible', 'Paralyzed', 'Petrified', 'Poisoned', 'Prone', 'Restrained', 'Stunned', 'Unconscious'];

  constructor(
    private fb: FormBuilder,
    private spellService: SpellService,
    private router: Router,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.spellForm = this.fb.group({
      name: [''],
      version: [''],
      level: [''],
      school: [''],
      castingTime: [''],
      reactionDescription: [''],
      components: this.fb.array([]),
      materialsDescription: [''],
      spellRangeType: [''],
      range: [''],
      areaLength: [''],
      areaType: [''],
      durationType: [''],
      duration: [''],
      durationTime: [''],
      description: [''],
      ritualSpell: [''],
      higherLevelDescription: [''],
      HigherLevelScaling: [''],
      classes: this.fb.array([]),
      subclasses: this.fb.array([]),
      isSaveOrAttack: [''], 
      saveStat: [''], 
      attackType: [''], 
      hasDamage: [false], 
      damage: [''], 
      damageType: [''], 
      effect: [''],
      inflictsConditions: [false],
      conditions: this.fb.array([])
    });

    this.initializeComponents();
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

  initializeComponents(): void {
    const componentsArray = this.spellForm.get('components') as FormArray;
    this.spellComponents.forEach(component => {
      componentsArray.push(this.fb.control(false));
    });
  }

  get components(): FormArray {
    return this.spellForm.get('components') as FormArray;
  }

  get isMaterialSelected(): boolean {
    return this.components.at(2).value;
  }

  get classes(): FormArray {
    return this.spellForm.get('classes') as FormArray;
  }

  get subclasses(): FormArray {
    return this.spellForm.get('subclasses') as FormArray;
  }

  get conditionsArray(): FormArray {
    return this.spellForm.get('conditions') as FormArray;
  }

  addClass(): void {
    this.classes.push(new FormControl(''));
  }

  removeClass(index: number): void {
    this.classes.removeAt(index);
  }

  addSubclass(): void {
    this.subclasses.push(new FormControl(''));
  }

  removeSubclass(index: number): void {
    this.subclasses.removeAt(index);
  }

  addCondition(): void {
    this.conditionsArray.push(new FormControl(''));
  }

  removeCondition(index: number): void {
    this.conditionsArray.removeAt(index);
  }

  get requiresAreaDetails(): boolean {
    const range = this.spellForm.get('spellRangeType')?.value;
    return ['Self', 'Touch', 'Distance', 'Sight'].includes(range);
  }

  onSubmit(): void {
    if (this.spellForm.invalid || !this.currentUserID) {
      const missingFields = [];
      for (const controlName in this.spellForm.controls) {
        const control = this.spellForm.get(controlName);
        if (control?.invalid && control?.errors?.['required']) {
          missingFields.push(controlName);
        }
      }

      if (missingFields.length > 0) {
        alert(`The following fields are required: ${missingFields.join(', ')}`);
      } else {
        alert('Please ensure you are logged in and fill out all required fields.');
      }
      return;
    }

    const selectedComponents = this.spellComponents
      .filter((component, index) => this.components.at(index).value);

    const materialDescription = selectedComponents.includes('M') && this.isMaterialSelected
      ? ` (${this.spellForm.value.materialsDescription})`
      : '';

    const conditions = this.conditionsArray.value.join(', ');

    const range = this.spellForm.get('spellRangeType')?.value;
    const areaLength = this.spellForm.get('areaLength')?.value;
    const areaType = this.spellForm.get('areaType')?.value;
    const rangeDescription = areaLength && areaType ? `${range} (${areaLength} ${areaType})` : range;

    const spellData = {
      ...this.spellForm.value,
      components: selectedComponents,
      materialsDescription: materialDescription,
      conditions: conditions,
      range: rangeDescription,
      userID: this.currentUserID,
      classes: this.classes.value,
      subclasses: this.subclasses.value
    };

    console.log('Spell data:', spellData);

    this.spellService.createSpell(spellData).subscribe({
      next: (response) => {
        alert('Spell created successfully!');
        console.log('Spell created with response:', response);
        this.router.navigate(['/create_spell']);
      },
      error: (error) => {
        console.log('Error creating spell:', error);
        console.error('Error creating spell:', error);
        alert('Failed to create spell. Please try again.');
      }
    });
  }
}