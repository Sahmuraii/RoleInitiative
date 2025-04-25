import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { BackgroundService } from '../../services/background.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-create-background',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-background.component.html',
  styleUrls: ['./create-background.component.css']
})
export class CreateBackgroundComponent {
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

  constructor(
    private fb: FormBuilder,
    private backgroundService: BackgroundService,
    private router: Router,
    private authService: AuthService
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
      alert('Please fill in all required fields');
      return;
    }

    const formData = this.backgroundForm.value;
    formData.user_id = this.currentUserID;
    
    this.backgroundService.createBackground(formData).subscribe({
      next: (response) => {
        console.log('Background created successfully!', response);
        alert('Background saved!');
        this.router.navigate(['/backgrounds']);
      },
      error: (error) => {
        console.error('Error creating background:', error);
        alert('Error saving background. Please try again.');
      }
    });
  }
}