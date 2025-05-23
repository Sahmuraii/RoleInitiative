import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { SpeciesService } from '../../services/species.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { QuillModule } from 'ngx-quill';
import { ModifierType, getModifierSubtypes, allModifierTypes } from '../create-magic-item/create-magic-item-types'

@Component({
  selector: 'app-create-species',
  templateUrl: './create-species.component.html',
  styleUrls: ['./create-species.component.css'],
  standalone: true,
  imports: [CommonModule, QuillModule, ReactiveFormsModule]
})
export class CreateSpeciesComponent {
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

  speciesForm: FormGroup;
  currentUserID: number | null = null;
  sizes = ['Custom', 'Tiny', 'Small', 'Small or Medium', 'Medium', 'Large', 'Huge', 'Gargantuan'];
  speciesGroup = ['Custom', 'Dragonborn', 'Dwarf', 'Elf', 'Gnome', 'Half-Elf', 'Half-Orc', 'Halfling', 'Human', 'Tiefling'];
  featureType = ['Granted', 'Additional', 'Replacement'];
  modifierTypes: ModifierType[] = allModifierTypes;
  currentModifierSubtypes: string[] = [];
  actionTypes: string[] = ['General', 'Weapon', 'Spell'];
  abilityScores: string[] = ['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma'];
  levels: number[] = Array.from({ length: 20 }, (_, i) => i + 1);
  dieType = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'];
  damageTypes: string[] = ['Acid', 'Bludgeoning', 'Cold', 'Fire', 'Force', 'Lightning', 'Necrotic', 'Piercing', 'Poison', 'Psychic', 'Radiant', 'Slashing', 'Thunder'];
  activationType = ['Action', 'Bonus Action', 'Reaction', 'Minute', 'Hour', 'No Action', 'Special'];
  resetTypes = ['Short Rest', 'Long Rest', 'Day', 'Round', 'Minute', 'Hour', 'Day', 'Special', 'Custom'];
  spellLevels = ['Cantrip', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th'];
  spellClasses = ['Artificer', 'Bard', 'Cleric', 'Druid', 'Paladin', 'Ranger', 'Sorcerer', 'Warlock', 'Wizard'];
  spellSchools = ['Abjuration', 'Conjuration', 'Divination', 'Enchantment', 'Evocation', 'Illusion', 'Necromancy', 'Transmutation'];
  spellAttackTypes = ['Melee', 'Ranged', 'Area', 'Self', 'Touch'];
  spellRangeTypes = ['Self', 'Touch', 'Sight', 'Unlimited', 'Special', 'Feet', 'Miles'];
  spellResetTypes = ['Short Rest', 'Long Rest', 'Day', 'Special'];
  modifierOperators = ['+', '-', '*', '/', '='];
  attackRangeTypes = ['Melee', 'Ranged', 'Self', 'Touch', 'Sight', 'Special'];
  saveTypes = ['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma'];
  weaponAttackSubtypes = ['Simple', 'Martial', 'Improvised', 'Natural', 'Special'];
  spellAreaOfEffects = ['Cone', 'Cube', 'Cylinder', 'Line', 'Sphere', 'Square', 'Special'];
  creatureRuleTypes = ['Create A Rule', 'Choose Monsters'];
  creatureGroups = ['Custom', 'Wild Shape', 'Familiar', 'Beast Companion', 'Pet', 'Summoned', 'Battle Smith Defender', 'Sidekick'];
  monsterTypes = ['Custom', 'Aberration', 'Beast', 'Celestial', 'Construct', 'Dragon', 'Elemental', 'Fey', 'Fiend', 'Giant', 'Humanoid', 'Monstrosity', 'Ooze', 'Plant', 'Undead'];
  maxChallengeRating = ['Custom', '0', '1/8', '1/4', '1/2', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30'];
  movementTypes = ['Custom', 'Walking', 'Flying', 'Swimming', 'Burrowing', 'Climbing'];
  monsterSizes = ['Custom', 'Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan'];

  constructor(
    private fb: FormBuilder,
    private speciesService: SpeciesService,
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.speciesForm = this.fb.group({
      name: ['', Validators.required],
      size: ['', Validators.required],
      speedWalking: [0],
      speedBurrowing: [0],
      speedClimbing: [0],
      speedFlying: [0],
      speedSwimming: [0],
      shortdescription: [''],
      speciesGroup: [''],
      description: ['', Validators.required],
      speciesTraitIntroduction: [''],
      SpeciesOptionsBool: [false],
      customSize: [''],
      customSpeciesGroup: [''],

      speciesTraits: this.fb.array([]),
      speciesOptions: this.fb.array([]),
      speciesVariants: this.fb.array([])
    });
  }

  logActionChange(traitIndex: number, actionIndex: number, event: Event): void {
    const newValue = (event.target as HTMLSelectElement).value;
    console.log(`Action type changed in trait ${traitIndex}, action ${actionIndex}:`, newValue);
    console.log('Full action object:', this.getTraitActions(traitIndex).at(actionIndex).value);
  }

  logBeforeAddAction(traitIndex: number): void {
    console.log('Before adding new action to trait', traitIndex);
    console.log('Current actions:', this.getTraitActions(traitIndex).value);
  }

  onModifierTypeChange(modifierGroup: AbstractControl): void {
    const selectedType = modifierGroup.get('modifierType')?.value as ModifierType;
    if (selectedType) {
      modifierGroup.get('modifierSubtype')?.setValue('');
    }
  }

  get speciesTraits(): FormArray {
    return this.speciesForm.get('speciesTraits') as FormArray;
  }

  addSpeciesTrait(): void {
    this.speciesTraits.push(this.createSpeciesTraitFormGroup());
  }

  removeSpeciesTrait(index: number): void {
    this.speciesTraits.removeAt(index);
  }

  private createSpeciesTraitFormGroup(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      snippet: [''],
      description: [''],
      displayOrder: [0],
      hideInBuilderBool: [false],
      hideInSheetBool: [false],
      hideInDetailsPageBool: [false],
      isCalledOutBool: [false],
      featureType: [''],
      characterLevelsWhereOptionsisKnown: this.fb.array([]),
      requiredLevel: [0],
      showAdditionalInfo: [false], 
      modifiers: this.fb.array([]),
      spells: this.fb.array([]),
      actions: this.fb.array([]),
      creatures: this.fb.array([]),
      additionalSpells: this.fb.array([])
    });
  }

  toggleAdditionalInfo(traitIndex: number): void {
    const trait = this.speciesTraits.at(traitIndex);
    const currentValue = trait.get('showAdditionalInfo')?.value;
    trait.get('showAdditionalInfo')?.setValue(!currentValue);
  }

  get speciesOptions(): FormArray {
    return this.speciesForm.get('speciesOptions') as FormArray;
  }

  addSpeciesOption(): void {
    this.speciesOptions.push(this.CreateSpeciesOptionFormGroup());
  }

  removeSpeciesOption(index: number): void {
    this.speciesOptions.removeAt(index);
  }

  private CreateSpeciesOptionFormGroup(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      description: [''],
      speciesGroup: [''],
      isVariantBool: [false],
      requiredLevel: [0],
      speciesOptionTraits: this.fb.array([])
    });
  }

  get speciesVariants(): FormArray {
    return this.speciesForm.get('speciesVariants') as FormArray;
  }

  addSpeciesVariant(): void {
    this.speciesVariants.push(this.createSpeciesVariantFormGroup());
  }

  removeSpeciesVariant(index: number): void {
    this.speciesVariants.removeAt(index);
  }

  private createSpeciesVariantFormGroup(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      description: [''],
      speciesGroup: [''],
      requiredLevel: [0],
      speciesVariantTraits: this.fb.array([])
    });
  }

  getSpeciesOptionTraits(optionIndex: number): FormArray {
    return (this.speciesOptions.at(optionIndex).get('speciesOptionTraits') as FormArray);
  }

  addSpeciesOptionTrait(optionIndex: number): void {
    this.getSpeciesOptionTraits(optionIndex).push(this.createSpeciesTraitFormGroup());
  }

  removeSpeciesOptionTrait(optionIndex: number, traitIndex: number): void {
    this.getSpeciesOptionTraits(optionIndex).removeAt(traitIndex);
  }

  getSpeciesVariantTraits(variantIndex: number): FormArray {
    return (this.speciesVariants.at(variantIndex).get('speciesVariantTraits') as FormArray);
  }

  addSpeciesVariantTrait(variantIndex: number): void {
    this.getSpeciesVariantTraits(variantIndex).push(this.createSpeciesTraitFormGroup());
  }

  removeSpeciesVariantTrait(variantIndex: number, traitIndex: number): void {
    this.getSpeciesVariantTraits(variantIndex).removeAt(traitIndex);
  }

  getTraitModifiers(traitIndex: number): FormArray {
    return (this.speciesTraits.at(traitIndex).get('modifiers') as FormArray);
  }

  addTraitModifier(traitIndex: number): void {
    this.getTraitModifiers(traitIndex).push(this.createModifierGroup());
  }

  removeTraitModifier(traitIndex: number, modifierIndex: number): void {
    this.getTraitModifiers(traitIndex).removeAt(modifierIndex);
  }

  getTraitSpells(traitIndex: number): FormArray {
    return (this.speciesTraits.at(traitIndex).get('spells') as FormArray);
  }

  addTraitSpell(traitIndex: number): void {
    this.getTraitSpells(traitIndex).push(this.createSpellGroup());
  }

  removeTraitSpell(traitIndex: number, spellIndex: number): void {
    this.getTraitSpells(traitIndex).removeAt(spellIndex);
  }

  getTraitActions(traitIndex: number): FormArray {
    return (this.speciesTraits.at(traitIndex).get('actions') as FormArray);
  }

  addTraitAction(traitIndex: number): void {
    this.getTraitActions(traitIndex).push(this.createActionGroup());
  }

  removeTraitAction(traitIndex: number, actionIndex: number): void {
    this.getTraitActions(traitIndex).removeAt(actionIndex);
  }

  getTraitCreatures(traitIndex: number): FormArray {
    return (this.speciesTraits.at(traitIndex).get('creatures') as FormArray);
  }

  addTraitCreature(traitIndex: number): void {
    this.getTraitCreatures(traitIndex).push(this.createCreatureGroup());
  }

  removeTraitCreature(traitIndex: number, creatureIndex: number): void {
    this.getTraitCreatures(traitIndex).removeAt(creatureIndex);
  }

  getTraitAdditionalSpells(traitIndex: number): FormArray {
    return (this.speciesTraits.at(traitIndex).get('additionalSpells') as FormArray);
  }

  addTraitAdditionalSpell(traitIndex: number): void {
    this.getTraitAdditionalSpells(traitIndex).push(this.createSpellGroup());
  }

  removeTraitAdditionalSpell(traitIndex: number, spellIndex: number): void {
    this.getTraitAdditionalSpells(traitIndex).removeAt(spellIndex);
  }

  private createModifierGroup(): FormGroup {
    return this.fb.group({
      modifierType: [''],
      customModifierName: [''], 
      customModifierValue: [''], 
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

    private createSpellGroup(): FormGroup {
    return this.fb.group({
      spellName: [''],
      spellLevels: [[]],
      spellClass: [[]],
      spellSchool: [''],
      spellAttackType: [''],
      spellLevelDivisor: [''],
      onlyRitualSpells: [false],
      spellAbilityScore: [''],
      spellNumberOfUses: [0],
      spellModifierOperator: [''],
      spellAbilityModifier: [''],
      spellUseProfBonus: [false],
      spellProfBonusOperator: [''],
      spellResetType: [''],
      spellCastLevel: [''],
      spellCastingTime: [''],
      spellActivationType: [''],
      spellRange: [''],
      spellRangeDistance: [0],
      spellDescription: [''],
      spellIsInfinite: [false],
      consumesSpellSlot: [false],
      countsAsKnownSpell: [false],
      alwaysPrepared: [false],
      availableAtCharacterLevel: [0],
      minSpellChargesExpended: [0],
      maxSpellChargesExpended: [0],
      saveDC: [''],
      restriction: ['']
    });
  }

    private createActionGroup(): FormGroup {
      return this.fb.group({
        actionName: [''],
        actionType: [''],
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
        actionDescription: [''],
        actionNumberOfUses: [0],
        actionModifierOperator: [''],
        actionAbilityModifier: [''],
        actionUseProfBonus: [false],
        actionProfBonusOperator: [''],
        actionLevelDivisor: [''],
        limitedUses: this.fb.array([])
      });
  }

  createLimitedUseGroup(): FormGroup {
    return this.fb.group({
      actionNumberOfUses: [0],
      actionModifierOperator: [''],
      actionAbilityModifier: [''],
      actionUseProfBonus: [false],
      actionProfBonusOperator: [''],
      actionLevelDivisor: ['']
    });
  }

  getLimitedUses(traitIndex: number, actionIndex: number): FormArray {
    return (this.getTraitActions(traitIndex).at(actionIndex).get('limitedUses')) as FormArray;
  }

  addLimitedUse(traitIndex: number, actionIndex: number): void {
    this.getLimitedUses(traitIndex, actionIndex).push(this.createLimitedUseGroup());
  }

  removeLimitedUse(traitIndex: number, actionIndex: number, limitedUseIndex: number): void {
    this.getLimitedUses(traitIndex, actionIndex).removeAt(limitedUseIndex);
  }

  private createCreatureGroup(): FormGroup {
    return this.fb.group({
      creatureName: [''],
      creatureDescription: [''],
      creatureType: [''],
      ruleType: [''],
      creatureGroup: [''],
      monsterType: [''],
      maxChallengeRating: [0],
      maxChallenegeRatingDivisor: [0],
      restrictedMovementTypes: [[]],
      monsterSizes: [[]],
      customMonsters: this.fb.array([]),
      customCreatureGroup: [''],
      customMonsterType: [''],
      customMaxChallengeRating: [0],
      customMaxChallengeRatingDivisor: [0],
      customMovementTypes: [[]],
      customCreatureSizes: [[]]
    });
  }

  getCreatureCustomMonsters(traitIndex: number, creatureIndex: number): FormArray {
    return (this.getTraitCreatures(traitIndex).at(creatureIndex).get('customMonsters')) as FormArray;
  }

  addCreatureCustomMonster(traitIndex: number, creatureIndex: number): void {
    this.getCreatureCustomMonsters(traitIndex, creatureIndex).push(this.fb.control(''));
  }

  removeCreatureCustomMonster(traitIndex: number, creatureIndex: number, monsterIndex: number): void {
    this.getCreatureCustomMonsters(traitIndex, creatureIndex).removeAt(monsterIndex);
  }

  getFilteredMovementTypes(): string[] {
    return this.movementTypes.filter(m => m !== 'Custom');
  }

  getFilteredMonsterSizes(): string[] {
    return this.monsterSizes.filter(s => s !== 'Custom');
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

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const currentUser = this.authService.getCurrentUser();
      if (currentUser && currentUser.id != null) {
        this.currentUserID = currentUser.id;
      } else {
        console.error('No user is logged in for Species creation.');
        this.router.navigate(['/login']);
      }
    } else {
      console.warn('Running on the server. Skipping localStorage access.');
    }
  }

  onSubmit(): void {
    if (this.speciesForm.invalid || !this.currentUserID) {
      this.markFormGroupTouched(this.speciesForm);
      
      const missingFields: string[] = [];
      for (const controlName in this.speciesForm.controls) {
        const control = this.speciesForm.get(controlName);
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
    
    this.speciesService.createSpecies(formValue).subscribe({
      next: (response) => {
        this.router.navigate(['/species', response.id]);
      },
      error: (error) => {
        console.error('Error creating species:', error);
        alert('Failed to create species. Please try again.');
      }
    });
  }

  private prepareFormData(): any {
    const formValue = this.speciesForm.value;
    formValue.userId = this.currentUserID;
    
    formValue.speciesTraits = formValue.speciesTraits?.map((trait: any) => {
      if (trait.modifiers) {
        trait.modifiers = trait.modifiers.map((modifier: any) => {
          if (modifier.modifierType === 'Custom') {
            modifier.modifierSubtype = modifier.customModifierName;
            modifier.modifierFixedValue = modifier.customModifierValue;
          }
          return modifier;
        });
      }
      return trait;
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