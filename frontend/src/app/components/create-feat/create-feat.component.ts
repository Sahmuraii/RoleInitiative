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
  weaponAttackSubtypes = ['Natural', 'Unarmed'];
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
  creatureGroups = ['Wild Shape', 'Familiar', 'Beast Companion', 'Mount', 'Pet', 'Summoned', 'Battle Smith Defender', 'Sidekick', 'Custom'];
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
      
      modifiers: this.fb.array([this.createModifierGroup()]),
      spells: this.fb.array([this.createSpellGroup()]),
      actions: this.fb.array([this.createActionGroup()]),
      creatures: this.fb.array([this.createCreatureGroup()]),
    });
  }

  get modifiers(): FormArray {
  return this.featForm.get('modifiers') as FormArray;
}

addModifier(): void {
  this.modifiers.push(this.createModifierGroup());
}

removeModifier(index: number): void {
  this.modifiers.removeAt(index);
}

private createModifierGroup(): FormGroup {
  return this.fb.group({
    modifierType: [''],
    modifierSubtype: [''],
    modifierAbilityScore: [''],
    modifierDiceCount: [0],
    modifierDiceType: [''],
    modifierFixedValue: [0],
    modifierAdditionalBonusTypes: this.fb.array([]),
    modifierDetails: [''],
    modifierDurationIntervalNum: [0],
    modifierDurationIntervalType: ['']
  });
}

// For Spells
get spells(): FormArray {
  return this.featForm.get('spells') as FormArray;
}

addSpell(): void {
  this.spells.push(this.createSpellGroup());
}

removeSpell(index: number): void {
  this.spells.removeAt(index);
}

private createSpellGroup(): FormGroup {
  return this.fb.group({
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

// For Actions
get actions(): FormArray {
  return this.featForm.get('actions') as FormArray;
}

addAction(): void {
  this.actions.push(this.createActionGroup());
}

removeAction(index: number): void {
  this.actions.removeAt(index);
}

private createActionGroup(): FormGroup {
  return this.fb.group({
    actionType: [''],
    actionName: [''],
    actionAbilityScoreType: [''],
    actionLevel: [0],
    actionIsProficient: [false],
    actionAttackRangeType: [''],
    actionSaveType: [''],
    actionSaveDC: [0],
    actionDiceCount: [0],
    actionDieType: [''],
    actionFixedValue: [0],
    actionEffectOnMiss: [''],
    actionEffectOnSaveSuccess: [''],
    actionEffectOnSaveFail: [''],
    actionWeaponAttackSubtype: [''],
    actionDamageType: [''],
    actionDisplayAsAttack: [false],
    actionAffectedbyMartialArts: [false],
    actionSpellRangeType: [''],
    actionSpellRange: [0],
    actionSpellLongRange: [0],
    actionSpellAreaofEffect: [''],
    actionSpellAreaofEffectSize: [0],
    actionSpellAreaofEffectSpecialFlag: [false],
    actionActivationType: [''],
    actionActivationTime: [''],
    actionResetType: [''],
    actionDescription: ['']
  });
}

// For Creatures
get creatures(): FormArray {
  return this.featForm.get('creatures') as FormArray;
}

addCreature(): void {
  this.creatures.push(this.createCreatureGroup());
}

removeCreature(index: number): void {
  this.creatures.removeAt(index);
}

private createCreatureGroup(): FormGroup {
  return this.fb.group({
    creatureRuleType: [''],
    creatureGroup: [''],
    creatureMonsterType: [''],
    creatureMaxChallengeRating: [''],
    creatureRatingDivisor: [''],
    creatureRestrictedMovement: [''],
    creatureRestrictedMovementTypes: [[]],
    creatureSize: ['']
  });
}


  openSections: {[key: string]: boolean} = {};

  toggleSection(section: string): void {
    this.openSections[section] = !this.openSections[section];
  }

  isSectionOpen(section: string): boolean {
    return this.openSections[section] || false;
  }

  getModifierSubtypes(type: ModifierType): string[] {
    return getModifierSubtypes(type);
  }

  get modifierAdditionalBonusTypes(): FormArray {
    return this.featForm.get('modifierAdditionalBonusTypes') as FormArray;
  }

  addModifierBonusType(modifierIndex: number): void {
    const bonusTypesArray = (this.modifiers.at(modifierIndex).get('modifierAdditionalBonusTypes') as FormArray);
    bonusTypesArray.push(new FormControl('', Validators.required));
  }

  removeModifierBonusType(modifierIndex: number, bonusIndex: number): void {
    const bonusTypesArray = (this.modifiers.at(modifierIndex).get('modifierAdditionalBonusTypes') as FormArray);
    bonusTypesArray.removeAt(bonusIndex);
  }

  getBonusTypesControls(modifierGroup: AbstractControl): AbstractControl[] {
    return (modifierGroup.get('modifierAdditionalBonusTypes') as FormArray).controls;
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

  onModifierTypeChange(modifierGroup: AbstractControl): void {
    const selectedType = modifierGroup.get('modifierType')?.value as ModifierType;
    if (selectedType) {
      modifierGroup.get('modifierSubtype')?.setValue('');
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
    
    formValue.modifiers = formValue.modifiers.map((modifier: any) => {
      return {
        ...modifier,
        modifierAdditionalBonusTypes: modifier.modifierAdditionalBonusTypes.filter(Boolean)
      };
    });
    
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