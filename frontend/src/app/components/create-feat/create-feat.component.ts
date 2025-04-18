import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { FeatService } from '../../services/feat.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { QuillModule } from 'ngx-quill';
import { ModifierType, getModifierSubtypes, allModifierTypes } from '../create-magic-item/create-magic-item-types'

@Component({
  selector: 'app-create-feat',
  templateUrl: './create-feat.component.html',
  styleUrls: ['./create-feat.component.css'],
  standalone: true,
  imports: [CommonModule, QuillModule, ReactiveFormsModule]
})
export class CreateFeatComponent {
  quillConfig = { 
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': 1 }, { 'header': 2 }, { 'header': 3 }], 
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ]
  };

  featForm: FormGroup;
  currentUserID: number | null = null;
  
  // Form options
  modifierTypes: ModifierType[] = allModifierTypes;
  currentModifierSubtypes: string[] = [];
  actionTypes: string[] = ['General', 'Weapon', 'Spell'];
  abilityScores: string[] = ['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma'];
  levels: number[] = Array.from({ length: 20 }, (_, i) => i + 1);
  attackRangeTypes: string[] = ['Melee', 'Ranged'];
  dieType = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'];
  damageTypes: string[] = ['Acid', 'Bludgeoning', 'Cold', 'Fire', 'Force', 'Lightning', 'Necrotic', 'Piercing', 'Poison', 'Psychic', 'Radiant', 'Slashing', 'Thunder'];
  weaponAttackSubtypes = ['Melee', 'Ranged'];
  spellRangeType = ['Self', 'Touch', 'Distance', 'Sight', 'Unlimited'];
  spellAreaofEffect = ['Cone', 'Cube', 'Cylinder', 'Emanation', 'Line', 'Sphere', 'Square', 'Square Feet', 'Wall'];
  activationType = ['Action', 'Bonus Action', 'Reaction', 'Minute', 'Hour', 'No Action', 'Reaction', 'Special'];
  resetTypes = ['Short Rest', 'Long Rest', 'Day', 'Round', 'Minute', 'Hour', 'Day', 'Special', 'Custom'];
  spellLevels = ['Cantrip', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th'];
  spellClass = ['Artificer', 'Bard', 'Cleric', 'Druid', 'Paladin', 'Ranger', 'Sorcerer', 'Warlock', 'Wizard'];
  spellSchools = ['Abjuration', 'Conjuration', 'Divination', 'Enchantment', 'Evocation', 'Illusion', 'Necromancy', 'Transmutation', 'Universal'];
  spellAttackType = ['Melee Attack', 'Ranged Attack', 'Melee and Ranged Attack'];
  levelDivisor = ['-', '2', '3', '4', '5'];
  ruleTypes = ['Create a Rule', 'Choose Monsters'];
  creatureGroup = ['Wild Shape', 'Familiar', 'Beast Companion', 'Mount', 'Pet', 'Summoned', 'Battle Smith Defender', 'Sidekick', 'Custom'];
  monsterType = ['Aberration', 'Beast', 'Celestial', 'Construct', 'Dragon', 'Elemental', 'Fey', 'Fiend', 'Giant', 'Humanoid', 'Monstrosity', 'Ooze', 'Plant', 'Undead'];
  maxChallengeRating = ['0', '1/8', '1/4', '1/2', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'];
  challengeLevelDivisor = ['-', '2', '3', '4'];
  restrictedMovementTypes = ['Walking', 'Swimming', 'Flying', 'Climbing', 'Burrowing'];
  monsterSizes = ['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan', 'Custom'];

  constructor(
    private fb: FormBuilder,
    private featService: FeatService,
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.featForm = this.fb.group({
      // Basic Feat Information
      name: ['', Validators.required],
      description: ['', Validators.required],
      prerequisiteDescription: [''],
      
      // Option fields
      optionName: [''],
      optionDescription: [''],
      
      // Modifier section
      modifierType: [''],
      modifierSubtype: [''],
      modifierAbilityScore: [''],
      modifierDiceCount: [0],
      modifierDiceType: [''],
      modifierFixedValue: [0],
      modifierAdditionalBonusTypes: this.fb.array([]),
      modifierDetails: [''],
      modifierDurationIntervalNum: [0],
      modifierDurationIntervalType: [''],
      
      // Spell-related fields
      featSpellName: [''],
      featSpellLevels: [[]],
      featSpellClass: [[]],
      featSpellSchool: [''],
      featSpellAttackType: [''],
      featSpellLevelDivisor: [''],
      featOnlyRitualSpells: [false],
      featSpellAbilityScore: [''],
      featSpellNumberOfUses: [0],
      featSpellModifierOperator: [''],
      featSpellAbilityModifier: [''],
      featSpellUseProfBonus: [false],
      featSpellProfBonusOperator: [''],
      featSpellResetType: [''],
      featSpellCastLevel: [''],
      featSpellCastingTime: [''],
      featSpellActivationType: [''],
      featSpellSpellRange: [''],
      featSpellRangeDistance: [0],
      featSpellDescription: [''],
      featSpellIsInfinite: [false]
    });
  }

  getModifierSubtypes(type: ModifierType): string[] {
    return getModifierSubtypes(type);
  }

  get modifierAdditionalBonusTypes(): FormArray {
    return this.featForm.get('modifierAdditionalBonusTypes') as FormArray;
  }

  addModifierBonusType(): void {
    this.modifierAdditionalBonusTypes.push(new FormControl('', Validators.required));
  }

  removeModifierBonusType(index: number): void {
    this.modifierAdditionalBonusTypes.removeAt(index);
  }

  getBonusTypesControls(): AbstractControl[] {
    return this.modifierAdditionalBonusTypes.controls;
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const currentUser = this.authService.getCurrentUser();
      if (currentUser && currentUser.id != null) {
        this.currentUserID = currentUser.id;
      } else {
        console.error('No user is logged in for Feats.');
        this.router.navigate(['/login']);
      }
    } else {
      console.warn('Running on the server. Skipping localStorage access.');
    }
  }

  onModifierTypeChange(): void {
  const selectedType = this.featForm.get('modifierType')?.value as ModifierType;
  if (selectedType) {
    this.currentModifierSubtypes = this.getModifierSubtypes(selectedType);
    this.featForm.get('modifierSubtype')?.setValue('');
  } else {
    this.currentModifierSubtypes = [];
  }
}

  onSubmit(): void {
    if (this.featForm.invalid || !this.currentUserID) {
      this.markFormGroupTouched(this.featForm);
      
      const missingFields: string[] = [];
      for (const controlName in this.featForm.controls) {
        const control = this.featForm.get(controlName);
        if (control?.invalid && control.errors?.['required']) {
          missingFields.push(controlName);
        }
      }
      
      if (missingFields.length > 0) {
        alert(`The following fields are required: ${missingFields.join(', ')}`);
      } else if (!this.currentUserID) {
        alert('Please ensure you are logged in.');
      }
      return;
    }

    const formValue = this.prepareFormData();
    
    this.featService.createFeat(formValue).subscribe({
      next: (response) => {
        this.router.navigate(['/feats', response.id]);
      },
      error: (error) => {
        console.error('Error creating feat:', error);
        alert('Failed to create feat. Please try again.');
      }
    });
  }

  private prepareFormData(): any {
    const formValue = this.featForm.value;
    formValue.userId = this.currentUserID;
    
    formValue.modifierAdditionalBonusTypes = formValue.modifierAdditionalBonusTypes.filter(Boolean);
    
    return formValue;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouched(arrayControl);
          } else {
            arrayControl.markAsTouched();
          }
        });
      }
    });
  }
}