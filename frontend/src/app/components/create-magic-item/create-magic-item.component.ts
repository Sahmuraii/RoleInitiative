import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { MagicItemService } from '../../services/magic-item.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { QuillModule } from 'ngx-quill';
import { ModifierType, ModifierSubtypes, MagicItemModifier, getModifierSubtypes, allModifierTypes, CurrencyType, WeaponCategory, WeaponRangeType } from './create-magic-item-types';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-create-magic-item',
  templateUrl: './create-magic-item.component.html',
  styleUrls: ['./create-magic-item.component.css'],
  standalone: true,
  imports: [
    CommonModule, 
    QuillModule, 
    ReactiveFormsModule]
})
export class CreateMagicItemComponent {
  quillConfig = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': 1 }, { 'header': 2 }, { 'header': 3 }], 
      [{ 'size': ['10px', '12px', '14px', '16px', '18px', '20px'] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ]
  };

  magicItemForm: FormGroup;
  currentUserID: number | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  
  rarities = ['None', 'Common', 'Uncommon', 'Rare', 'Very Rare', 'Legendary', 'Artifact', 'Other'];
  itemTypes = ['Item', 'Armor', 'Weapon', 'Custom'];
  magicItemTypes = ['None', 'Potion', 'Wondrous Item', 'Rod', 'Staff', 'Wand', 'Ring', 'Scroll', 'Armor', 'Weapon', 'Custom'];
  sizes = ['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan', 'Custom'];
  damageTypes = ['Acid', 'Bludgeoning', 'Cold', 'Fire', 'Force', 'Lightning', 'Necrotic', 'Piercing', 'Poison', 'Psychic', 'Radiant', 'Slashing', 'Thunder'];
  weaponTypes = ['Battleaxe', 'Longsword', 'Shortsword', 'Dagger', 'Greatsword', 'Rapier', 'Warhammer', 'Custom'];
  weaponProperties = ['Ammunition', 'Finesse', 'Heavy', 'Light', 'Loading', 'Reach', 'Special', 'Thrown', 'Two-Handed', 'Versatile', 'Custom'];
  conditionTypes = ['Blinded', 'Charmed', 'Deafened', 'Frightened', 'Grappled', 'Incapacitated', 'Invisible', 'Paralyzed', 'Petrified', 'Poisoned', 'Prone', 'Restrained', 'Stunned', 'Unconscious', 'All', 'None', 'Other'];
  abilities = ['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma'];
  spellList = ['Fireball', 'Magic Missile', 'Cure Wounds', 'Shield', 'Mage Armor', 'Invisibility', 'Fly'];
  modifierTypes: ModifierType[] = allModifierTypes;
  currentModifierSubtypes: string[] = []; 
  weightCategories = ['Light', 'Medium', 'Heavy', 'Varies'];
  currencyTypes: CurrencyType[] = ['CP', 'SP', 'EP', 'GP', 'PP', 'Custom'];
  weaponCategories: WeaponCategory[] = ['Simple', 'Martial'];
  weaponRangeTypes: WeaponRangeType[] = ['Melee', 'Ranged'];

  constructor(
    private fb: FormBuilder,
    private magicItemService: MagicItemService,
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.magicItemForm = this.fb.group({
      name: ['', Validators.required],
      rarity: ['', Validators.required],
      customRarity: [''],
      itemType: ['', Validators.required],
      magicItemType: [''],
      armorClass: [''],
      dexBonus: [''],
      strengthRequirement: [''],
      stealthCheck: ['none'],
      weaponType: [''],
      customWeaponType: [''],
      damageDice: [''],
      damageType: [''],
      weaponProperties: [[]],
      requiresAttunement: [false],
      attunementDescription: [''],
      modifiers: this.fb.array([]),
      conditionImmunities: this.fb.array([]),
      allowsSpellcasting: [false],
      spellcastingAbility: [''],
      spellSaveDC: [''],
      spellAttackBonus: [''],
      spells: this.fb.array([]),
      hasCharges: [false],
      maxCharges: [''],
      chargeResetCondition: [''],
      chargeResetDescription: [''],
      notes: [''],
      weightCategory: [''],
      description: [''],
      customItemType: [''],
      customMagicItemType: [''],
      size: [''],
      customSize: [''],
      cost: [''],
      currencyType: ['GP'],
      customCurrency: [''],
      weaponCategory: [''],
      weaponRangeType: [''],
      range: [''],
      customPropertyName: [''],
      customPropertyDescription: [''],
      ammoType: [''],
      ammoCapacity: ['']
      //image: [null]
    });

    this.magicItemForm.get('currencyType')?.valueChanges.subscribe(type => {
      if (type === 'Custom') {
        this.magicItemForm.get('customCurrency')?.setValidators([Validators.required]);
      } else {
        this.magicItemForm.get('customCurrency')?.clearValidators();
        this.magicItemForm.get('customCurrency')?.setValue('');
      }
      this.magicItemForm.get('customCurrency')?.updateValueAndValidity();
    });

    this.magicItemForm.get('rarity')?.valueChanges.subscribe(rarity => {
      if (rarity === 'Other') {
        this.magicItemForm.get('customRarity')?.setValidators([Validators.required]);
      } else {
        this.magicItemForm.get('customRarity')?.clearValidators();
        this.magicItemForm.get('customRarity')?.setValue('');
      }
      this.magicItemForm.get('customRarity')?.updateValueAndValidity();
    });

    this.magicItemForm.get('weaponType')?.valueChanges.subscribe(type => {
      if (type === 'Custom') {
        this.magicItemForm.get('customWeaponType')?.setValidators([Validators.required]);
      } else {
        this.magicItemForm.get('customWeaponType')?.clearValidators();
        this.magicItemForm.get('customWeaponType')?.setValue('');
      }
      this.magicItemForm.get('customWeaponType')?.updateValueAndValidity();
    });

    this.magicItemForm.get('itemType')?.valueChanges.subscribe(type => {
      if (type === 'Custom') {
        this.magicItemForm.get('customItemType')?.setValidators([Validators.required]);
      } else {
        this.magicItemForm.get('customItemType')?.clearValidators();
        this.magicItemForm.get('customItemType')?.setValue('');
      }
      this.magicItemForm.get('customItemType')?.updateValueAndValidity();
    });

    this.magicItemForm.get('magicItemType')?.valueChanges.subscribe(type => {
      if (type === 'Custom') {
        this.magicItemForm.get('customMagicItemType')?.setValidators([Validators.required]);
      } else {
        this.magicItemForm.get('customMagicItemType')?.clearValidators();
        this.magicItemForm.get('customMagicItemType')?.setValue('');
      }
      this.magicItemForm.get('customMagicItemType')?.updateValueAndValidity();
    });
    
    this.magicItemForm.get('size')?.valueChanges.subscribe(size => {
      if (size === 'Custom') {
        this.magicItemForm.get('customSize')?.setValidators([Validators.required]);
      } else {
        this.magicItemForm.get('customSize')?.clearValidators();
        this.magicItemForm.get('customSize')?.setValue('');
      }
      this.magicItemForm.get('customSize')?.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const currentUser = this.authService.getCurrentUser();
      if (currentUser && currentUser.id != null) {
        this.currentUserID = currentUser.id;
      } else {
        console.error('No user is logged in for Magic Items.');
        this.router.navigate(['/login']);
      }
    } else {
      console.warn('Running on the server. Skipping localStorage access.');
    }
  }

  get modifiers(): FormArray {
    return this.magicItemForm.get('modifiers') as FormArray;
  }

  get conditionImmunities(): FormArray {
    return this.magicItemForm.get('conditionImmunities') as FormArray;
  }

  get spells(): FormArray {
    return this.magicItemForm.get('spells') as FormArray;
  }

  isArmor(): boolean {
    return this.magicItemForm.get('itemType')?.value === 'Armor';
  }

  isWeapon(): boolean {
    return this.magicItemForm.get('itemType')?.value === 'Weapon';
  }

  onItemTypeChange(event: Event): void {
    const itemType = (event.target as HTMLSelectElement).value;
    if (itemType === 'Armor' || itemType === 'Weapon') {
      this.magicItemForm.get('magicItemType')?.setValue(itemType);
    } else {
      this.magicItemForm.get('magicItemType')?.setValue('');
    }
  }

  onModifierTypeChange(index: number): void {
    const modifierGroup = this.modifiers.at(index) as FormGroup;
    const selectedType = modifierGroup.get('type')?.value as ModifierType;
    this.currentModifierSubtypes = getModifierSubtypes(selectedType);
    modifierGroup.get('subtype')?.setValue('');
    modifierGroup.get('value')?.setValue('');
  }

  onImageUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
  
    const file = input.files[0];
    this.selectedFile = file;

    if (!file.type.match('image.*')) {
      alert('Only image files are allowed!');
      return;
    }
  
    if (file.size > 2 * 1024 * 1024) {
      alert('Maximum allowed image size is 2MB');
      return;
    }
  
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result;
      
      const img = new Image();
      img.onload = () => {
        if (img.width !== 256 || img.height !== 256) {
          alert('Image must be exactly 256x256 pixels');
          this.imagePreview = null;
          this.selectedFile = null;
          return;
        }
        this.magicItemForm.patchValue({ image: file });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
  
  removeImage(): void {
    this.imagePreview = null;
    this.selectedFile = null;
    this.magicItemForm.patchValue({ image: null });
    
    const fileInput = document.getElementById('magicItemImage') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  getModifierSubtypes(type: ModifierType): string[] {
    return getModifierSubtypes(type);
  }

  addModifier(): void {
    this.modifiers.push(this.fb.group({
      type: ['', Validators.required],
      subtype: [''],
      value: [''],
      description: [''],
      appliesTo: [''],
      condition: [''],
      customModifierName: [''],
      customModifierDescription: ['']
    }));
  }

  shouldShowValueField(modifier: AbstractControl): boolean {
    const type = modifier.get('type')?.value;
    return !!type && !['Advantage', 'Disadvantage'].includes(type);
  }

  removeModifier(index: number): void {
    this.modifiers.removeAt(index);
  }

  addConditionImmunity(): void {
    this.conditionImmunities.push(new FormControl(''));
  }

  removeConditionImmunity(index: number): void {
    this.conditionImmunities.removeAt(index);
  }

  addSpell(): void {
    this.spells.push(this.fb.group({
      spellName: [''],
      castingFrequency: [''],
      charges: ['']
    }));
  }

  removeSpell(index: number): void {
    this.spells.removeAt(index);
  }

  onSubmit(): void {
    if (this.magicItemForm.invalid || !this.currentUserID) {
      const missingFields = [];
      for (const controlName in this.magicItemForm.controls) {
        const control = this.magicItemForm.get(controlName);
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
  
    const rarity = this.magicItemForm.value.rarity === 'Other' 
      ? this.magicItemForm.value.customRarity 
      : this.magicItemForm.value.rarity;
  
    const weaponType = this.magicItemForm.value.weaponType === 'Custom'
      ? this.magicItemForm.value.customWeaponType
      : this.magicItemForm.value.weaponType;
  
    const itemType = this.magicItemForm.value.itemType === 'Custom'
      ? this.magicItemForm.value.customItemType
      : this.magicItemForm.value.itemType;
  
    const magicItemType = this.magicItemForm.value.magicItemType === 'Custom'
      ? this.magicItemForm.value.customMagicItemType
      : this.magicItemForm.value.magicItemType;
  
    const size = this.magicItemForm.value.size === 'Custom'
      ? this.magicItemForm.value.customSize
      : this.magicItemForm.value.size;
    
    const currency = this.magicItemForm.value.currencyType === 'Custom'
      ? this.magicItemForm.value.customCurrency
      : this.magicItemForm.value.currencyType;
  
    const formattedModifiers = this.modifiers.value
      .filter((mod: any) => mod.type)
      .map((mod: any) => ({
        type: mod.type,
        subtype: mod.subtype || undefined,
        value: mod.value || undefined,
        description: mod.type === 'Custom' 
          ? `${mod.customModifierName}: ${mod.customModifierDescription}`
          : mod.description || undefined,
        appliesTo: mod.appliesTo || undefined,
        condition: mod.condition || undefined
      }));
  
    const formattedSpells = this.spells.value
      .filter((spell: any) => spell.spellName)
      .map((spell: any) => `${spell.spellName} (${spell.castingFrequency}${spell.charges ? `, ${spell.charges} charges` : ''})`)
      .join(', ');
  
    const formattedData = {
      ...this.magicItemForm.value,
      rarity,
      weaponType,
      itemType,
      magicItemType,
      size,
      modifiers: formattedModifiers,
      conditionImmunities: this.conditionImmunities.value.filter(Boolean).join(', '),
      spells: formattedSpells,
      userID: this.currentUserID,
      cost: {
        amount: this.magicItemForm.value.cost,
        currency: currency
      },
      weaponDetails: this.magicItemForm.value.weaponType === 'Custom' ? {
        category: this.magicItemForm.value.weaponCategory,
        rangeType: this.magicItemForm.value.weaponRangeType,
        range: this.magicItemForm.value.range,
        properties: this.magicItemForm.value.weaponProperties,
        customProperty: this.magicItemForm.value.weaponProperties.includes('Custom') ? {
          name: this.magicItemForm.value.customPropertyName,
          description: this.magicItemForm.value.customPropertyDescription
        } : undefined,
        ammo: this.magicItemForm.value.weaponRangeType === 'Ranged' && 
              this.magicItemForm.value.weaponProperties.includes('Ammunition') ? {
          type: this.magicItemForm.value.ammoType,
          capacity: this.magicItemForm.value.ammoCapacity
        } : undefined
      } : undefined
    };
  
    delete formattedData.customRarity;
    delete formattedData.customWeaponType;
    delete formattedData.customItemType;
    delete formattedData.customMagicItemType;
    delete formattedData.customSize;
    delete formattedData.customModifierName;
    delete formattedData.customModifierDescription;
    delete formattedData.customCurrency;
    delete formattedData.weaponCategory;
    delete formattedData.weaponRangeType;
    delete formattedData.customPropertyName;
    delete formattedData.customPropertyDescription;
    delete formattedData.ammoType;
    delete formattedData.ammoCapacity;
  
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('image', this.selectedFile);
      formData.append('data', JSON.stringify(formattedData));
      
      this.magicItemService.createMagicItem(formData).subscribe({
        next: (response) => {
          alert('Magic item created successfully!');
          this.router.navigate(['/magic-items']);
        },
        error: (error) => {
          console.error('Error creating magic item:', error);
          alert('Failed to create magic item. Please try again.');
        }
      });
    } else {
      this.magicItemService.createMagicItem(formattedData).subscribe({
        next: (response) => {
          alert('Magic item created successfully!');
          this.router.navigate(['/magic-items']);
        },
        error: (error) => {
          console.error('Error creating magic item:', error);
          alert('Failed to create magic item. Please try again.');
        }
      });
    }
  }
}