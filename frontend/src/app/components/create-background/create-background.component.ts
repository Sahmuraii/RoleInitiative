import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { BackgroundService } from '../../services/background.service';
import { Router } from '@angular/router';
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
      personalityTraits: this.fb.array(Array(8).fill(this.fb.control(''))),
      ideals: this.fb.array(Array(6).fill(this.fb.control(''))),
      bonds: this.fb.array(Array(6).fill(this.fb.control(''))),
      flaws: this.fb.array(Array(6).fill(this.fb.control('')))
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
    } else {
      console.error('No user is logged in for Background.');
      this.router.navigate(['/login']); 
    }
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

  addEquipment() {
    this.equipmentArray.push(this.fb.control(''));
  }

  removeEquipment(index: number) {
    this.equipmentArray.removeAt(index);
  }

  onSubmit() {
    if (this.backgroundForm.invalid) {
      this.showToast('Please fill in all required fields', 'error');
      return;
    }

    const formData = this.backgroundForm.value;
    formData.user_id = this.currentUserID;
    
    this.backgroundService.createBackground(formData).subscribe({
      next: (response) => {
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
