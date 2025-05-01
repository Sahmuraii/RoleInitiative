import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { BackgroundService } from '../../services/background.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-create-background',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-background.component.html',
  styleUrls: ['./create-background.component.css']
})
export class CreateBackgroundComponent {
  @ViewChild('toastTemplate') toastTemplate!: TemplateRef<any>;
  toasts: any[] = [];
  backgroundForm: FormGroup;
  currentUserID: number | null = null;
  isEditMode = false;
  backgroundId: number | null = null;

  skillProficiencies = [
    'Acrobatics', 'Animal Handling', 'Arcana', 'Athletics', 'Deception', 
    'History', 'Insight', 'Intimidation', 'Investigation', 'Medicine', 
    'Nature', 'Perception', 'Performance', 'Persuasion', 'Religion', 
    'Sleight of Hand', 'Stealth', 'Survival'
  ];
  toolProficiencies = [
    'Alchemist\'s Supplies', 'Brewer\'s Supplies', 'Calligrapher\'s Supplies', 
    'Carpenter\'s Tools', 'Cartographer\'s Tools', 'Cobbler\'s Tools', 
    'Cook\'s Utensils', 'Glassblower\'s Tools', 'Herbalism Kit', 
    'Jeweler\'s Tools', 'Leatherworker\'s Tools', 'Mason\'s Tools', 
    'Painter\'s Supplies', 'Potter\'s Tools', 'Smith\'s Tools', 
    'Thieves\' Tools', 'Tinker\'s Tools', 'Weaver\'s Tools', 
    'Woodcarver\'s Tools', 'Disguise Kit', 'Forgery Kit', 
    'Navigator\'s Tools', 'Poisoner\'s Kit'
  ];
  languageProficiencies = [
    'Common', 'Dwarvish', 'Elvish', 'Giant', 'Gnomish', 'Goblin', 
    'Halfling', 'Orc', 'Abyssal', 'Celestial', 'Draconic', 'Deep Speech', 
    'Infernal', 'Primordial', 'Sylvan', 'Undercommon'
  ];

  skillCategories = [
    { name: 'Strength', skills: ['Athletics'] },
    { name: 'Dexterity', skills: ['Acrobatics', 'Sleight of Hand', 'Stealth'] },
    { name: 'Intelligence', skills: ['Arcana', 'History', 'Investigation', 'Nature', 'Religion'] },
    { name: 'Wisdom', skills: ['Animal Handling', 'Insight', 'Medicine', 'Perception', 'Survival'] },
    { name: 'Charisma', skills: ['Deception', 'Intimidation', 'Performance', 'Persuasion'] }
  ];

  constructor(
    private fb: FormBuilder,
    private backgroundService: BackgroundService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.backgroundForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      skillProficiencies: this.fb.array([]), 
      toolProficiencies: this.fb.array([]),  
      languageProficiencies: this.fb.array([]), 
      equipment: this.fb.array([]), 
      featureName: ['', Validators.required],
      featureDescription: ['', Validators.required],
      personalityTraits: this.fb.array([]), 
      ideals: this.fb.array([]),           
      bonds: this.fb.array([]),            
      flaws: this.fb.array([])             
    });
  }

  showToast(message: string, type: 'success' | 'error') {
    const toast = { message, type };
    this.toasts.push(toast);
    setTimeout(() => this.removeToast(toast), 3000);
  }

  removeToast(toast: any) {
    this.toasts = this.toasts.filter(t => t !== toast);
  }

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.id) {
      this.currentUserID = currentUser.id;
      
      this.route.params.subscribe(params => {
        if (params['id']) {
          this.isEditMode = true;
          this.backgroundId = +params['id'];
          this.loadBackgroundForEdit(this.backgroundId);
        }
      });
    } else {
      console.error('No user is logged in for Background.');
      this.router.navigate(['/login']);
    }
  }

  loadBackgroundForEdit(id: number): void {
    this.backgroundService.getBackgroundById(id).subscribe({
      next: (background) => {
        if (background.user_id !== this.currentUserID) {
          this.showToast('You do not have permission to edit this background', 'error');
          this.router.navigate(['/backgrounds']);
          return;
        }

        this.clearFormArrays();

        this.backgroundForm.patchValue({
          name: background.background_name,
          description: background.background_description,
          featureName: background.feature_name,
          featureDescription: background.feature_effect
        });

        if (background.skill_proficiencies) {
          background.skill_proficiencies.forEach((skill: string) => {
            this.skillProficienciesArray.push(this.fb.control(skill));
          });
        }

        if (background.tool_proficiencies) {
          background.tool_proficiencies.forEach((tool: string) => {
            this.toolProficienciesArray.push(this.fb.control(tool));
          });
        }

        if (background.language_proficiencies) {
          background.language_proficiencies.forEach((language: string) => {
            this.languageProficienciesArray.push(this.fb.control(language));
          });
        }

        if (background.equipment) {
          background.equipment.forEach((item: string) => {
            this.equipmentArray.push(this.fb.control(item));
          });
        }

        if (background.suggested_characteristics) {
          const traits = background.suggested_characteristics.personality_traits || [];
          const ideals = background.suggested_characteristics.ideals || [];
          const bonds = background.suggested_characteristics.bonds || [];
          const flaws = background.suggested_characteristics.flaws || [];

          traits.forEach((trait: string) => {
            this.personalityTraitsArray.push(this.fb.control(trait));
          });

          ideals.forEach((ideal: string) => {
            this.idealsArray.push(this.fb.control(ideal));
          });

          bonds.forEach((bond: string) => {
            this.bondsArray.push(this.fb.control(bond));
          });

          flaws.forEach((flaw: string) => {
            this.flawsArray.push(this.fb.control(flaw));
          });
        }
      },
      error: (error) => {
        this.showToast('Error loading background for editing', 'error');
        console.error('Error loading background:', error);
        this.router.navigate(['/backgrounds']);
      }
    });
  }

  private clearFormArrays(): void {
    while (this.skillProficienciesArray.length) this.skillProficienciesArray.removeAt(0);
    while (this.toolProficienciesArray.length) this.toolProficienciesArray.removeAt(0);
    while (this.languageProficienciesArray.length) this.languageProficienciesArray.removeAt(0);
    while (this.equipmentArray.length) this.equipmentArray.removeAt(0);
    while (this.personalityTraitsArray.length) this.personalityTraitsArray.removeAt(0);
    while (this.idealsArray.length) this.idealsArray.removeAt(0);
    while (this.bondsArray.length) this.bondsArray.removeAt(0);
    while (this.flawsArray.length) this.flawsArray.removeAt(0);
  }

  trackByFn(index: number, item: any): number {
    return index;
  }

  get skillProficienciesArray() {
    return this.backgroundForm.get('skillProficiencies') as FormArray;
  }

  get toolProficienciesArray() {
    return this.backgroundForm.get('toolProficiencies') as FormArray;
  }

  get languageProficienciesArray() {
    return this.backgroundForm.get('languageProficiencies') as FormArray;
  }

  get equipmentArray() {
    return this.backgroundForm.get('equipment') as FormArray;
  }

  get personalityTraitsArray() {
    return this.backgroundForm.get('personalityTraits') as FormArray;
  }

  get idealsArray() {
    return this.backgroundForm.get('ideals') as FormArray;
  }

  get bondsArray() {
    return this.backgroundForm.get('bonds') as FormArray;
  }

  get flawsArray() {
    return this.backgroundForm.get('flaws') as FormArray;
  }

  addPersonalityTrait() {
    this.personalityTraitsArray.push(this.fb.control(''));
  }

  addIdeal() {
    this.idealsArray.push(this.fb.control(''));
  }

  addBond() {
    this.bondsArray.push(this.fb.control(''));
  }

  addFlaw() {
    this.flawsArray.push(this.fb.control(''));
  }

  removePersonalityTrait(index: number) {
    this.personalityTraitsArray.removeAt(index);
  }

  removeIdeal(index: number) {
    this.idealsArray.removeAt(index);
  }

  removeBond(index: number) {
    this.bondsArray.removeAt(index);
  }

  removeFlaw(index: number) {
    this.flawsArray.removeAt(index);
  }

  addProficiency(type: 'skill' | 'tool' | 'language') {
    const array = type === 'skill' 
      ? this.skillProficienciesArray 
      : type === 'tool' 
        ? this.toolProficienciesArray 
        : this.languageProficienciesArray;
    
    array.push(this.fb.control(''));
  }

  removeProficiency(type: 'skill' | 'tool' | 'language', index: number) {
    const array = type === 'skill' 
      ? this.skillProficienciesArray 
      : type === 'tool' 
        ? this.toolProficienciesArray 
        : this.languageProficienciesArray;
    
    array.removeAt(index);
  }

  removeEquipment(index: number) {
    this.equipmentArray.removeAt(index);
  }

  addEquipment() {
    this.equipmentArray.push(this.fb.control(''));
  }

  onSubmit() {
    if (this.backgroundForm.invalid) {
      this.showToast('Please fill in all required fields', 'error');
      return;
    }

    const formData = this.backgroundForm.value;
    
    formData.skillProficiencies = formData.skillProficiencies?.filter((item: string) => item?.trim() !== '') || [];
    formData.toolProficiencies = formData.toolProficiencies?.filter((item: string) => item?.trim() !== '') || [];
    formData.languageProficiencies = formData.languageProficiencies?.filter((item: string) => item?.trim() !== '') || [];
    formData.equipment = formData.equipment?.filter((item: string) => item?.trim() !== '') || [];
    
    formData.suggested_characteristics = {
      personality_traits: formData.personalityTraits?.filter((item: string) => item?.trim() !== '') || [],
      ideals: formData.ideals?.filter((item: string) => item?.trim() !== '') || [],
      bonds: formData.bonds?.filter((item: string) => item?.trim() !== '') || [],
      flaws: formData.flaws?.filter((item: string) => item?.trim() !== '') || []
    };
    
    delete formData.personalityTraits;
    delete formData.ideals;
    delete formData.bonds;
    delete formData.flaws;
    
    formData.user_id = this.currentUserID;

    console.log('Sending data to backend:', formData); 

    if (this.isEditMode && this.backgroundId) {
      this.backgroundService.updateBackground(this.backgroundId, formData).subscribe({
        next: (updatedBackground) => {
          this.showToast('Background updated successfully!', 'success');
          this.loadBackgroundForEdit(updatedBackground.id);
          this.router.navigate(['/backgrounds']);
        },
        error: (error) => {
          this.showToast('Error updating background. Please try again.', 'error');
          console.error('Error updating background:', error);
        }
      });
    } else {
      this.backgroundService.createBackground(formData).subscribe({
        next: (newBackground) => {
          this.showToast('Background created successfully!', 'success');
          this.router.navigate(['/backgrounds']);
        },
        error: (error) => {
          this.showToast('Error saving background. Please try again.', 'error');
          console.error('Error creating background:', error);
        }
      });
    }
  }
}