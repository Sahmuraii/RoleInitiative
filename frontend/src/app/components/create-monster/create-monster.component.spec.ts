import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CreateMonsterComponent } from './create-monster.component';
import { MonsterService } from '../../services/monster.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { QuillModule } from 'ngx-quill';
import { FormArray } from '@angular/forms';

describe('CreateMonsterComponent', () => {
  let component: CreateMonsterComponent;
  let fixture: ComponentFixture<CreateMonsterComponent>;
  let mockMonsterService: jasmine.SpyObj<MonsterService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;
  let formBuilder: FormBuilder;

  const mockUser = { id: 123, name: 'Test User' };
  const mockMonster = {
    id: 1,
    name: 'Test Monster',
    size: 'Medium',
    type: 'Beast',
    subtype: 'None',
    alignment: 'Neutral',
    armorClass: 15,
    armorType: 'Natural Armor',
    hitPointsDieCount: 3,
    hitPointsValue: 'd8',
    hitPointsModifier: 6,
    averageHP: 19,
    speed: '30 ft.',
    strength: 14,
    dexterity: 16,
    constitution: 12,
    intelligence: 8,
    wisdom: 10,
    charisma: 6,
    initiativeBonus: 3,
    proficiencyBonus: 2,
    passivePerception: 12,
    savingThrows: 'Dexterity +5, Constitution +3',
    skills: 'Stealth +5, Perception +2',
    damageVulnerabilities: 'Fire',
    damageResistances: 'Cold',
    damageImmunities: 'Poison',
    conditionImmunities: 'Poisoned, Prone',
    senses: 'Darkvision 60 ft.',
    languages: 'Common, Elvish',
    challengeRating: '2',
    traits: [{ name: 'Keen Senses', description: 'The monster has advantage on Wisdom (Perception) checks.' }],
    specialAbilities: [],
    actions: [{ name: 'Bite', description: 'Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 7 (1d8 + 3) piercing damage.' }],
    bonusActions: [],
    reactions: [],
    isLegendary: false,
    isMythic: false,
    hasLair: false,
    monsterHabitats: 'Forest, Mountain',
    languageNotes: '',
    traitsDescription: '',
    actionsDescription: '',
    bonusActionsDescription: '',
    reactionsDescription: '',
    monsterCharacteristicsDescription: ''
  };

  beforeEach(async () => {
    mockMonsterService = jasmine.createSpyObj('MonsterService', ['createMonster', 'updateMonster', 'getMonsterById']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockActivatedRoute = {
      params: of({}),  
    };
    formBuilder = new FormBuilder();

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, CommonModule, QuillModule.forRoot()],
      declarations: [],
      providers: [
        { provide: MonsterService, useValue: mockMonsterService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: FormBuilder, useValue: formBuilder }
      ]
    }).compileComponents();

    mockAuthService.getCurrentUser.and.returnValue(mockUser);
    mockMonsterService.createMonster.and.returnValue(of({}));
    mockMonsterService.updateMonster.and.returnValue(of({}));

    fixture = TestBed.createComponent(CreateMonsterComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    fixture.detectChanges();
    expect(component.monsterForm).toBeTruthy();
    expect(component.monsterForm.get('name')?.value).toBe('');
    expect(component.monsterForm.get('size')?.value).toBe('');
    expect(component.abilityScores.length).toBe(6);
    expect(component.savingThrows.length).toBe(6);
  });

  it('should set currentUserID from auth service', () => {
    fixture.detectChanges();
    expect(component.currentUserID).toBe(mockUser.id);
  });

  it('should navigate to login if user is not logged in', () => {
    mockAuthService.getCurrentUser.and.returnValue(null);
    fixture.detectChanges();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should load monster data in edit mode', fakeAsync(() => {
    mockActivatedRoute.params = of({ id: '1' });
    mockMonsterService.getMonsterById.and.returnValue(of(mockMonster));
    
    fixture.detectChanges();
    tick();
    
    expect(component.editMode).toBe(true);
    expect(component.monsterId).toBe(1);
    expect(component.monsterForm.get('name')?.value).toBe('Test Monster');
    expect(component.monsterForm.get('size')?.value).toBe('Medium');
    expect(component.monsterForm.get('type')?.value).toBe('Beast');
  }));

  it('should handle error when loading monster data', fakeAsync(() => {
    mockActivatedRoute.params = of({ id: '1' });
    mockMonsterService.getMonsterById.and.returnValue(throwError(() => new Error('Test error')));
    spyOn(console, 'error');
    spyOn(window, 'alert');
    
    fixture.detectChanges();
    tick();
    
    expect(console.error).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Failed to load monster data');
  }));

  it('should add a new skill', () => {
    fixture.detectChanges();
    const initialLength = component.skills.length;
    component.addSkill();
    expect(component.skills.length).toBe(initialLength + 1);
  });

  it('should remove a skill', () => {
    fixture.detectChanges();
    component.addSkill();
    const initialLength = component.skills.length;
    component.removeSkill(0);
    expect(component.skills.length).toBe(initialLength - 1);
  });

  it('should update form control on skill selection change', () => {
    fixture.detectChanges();
    component.addSkill();
    
    const index = 0;
    const skillControl = component.skills.at(index);
    
    const mockEvent = {
      target: { value: 'custom' } as HTMLSelectElement
    } as unknown as Event;
    
    spyOn(skillControl.get('customSkill')!, 'enable');
    component.onSkillChange(mockEvent, index);
    expect(skillControl.get('customSkill')?.enable).toHaveBeenCalled();
    
    const standardEvent = {
      target: { value: 'Stealth' } as HTMLSelectElement
    } as unknown as Event;
    
    spyOn(skillControl.get('customSkill')!, 'disable');
    component.onSkillChange(standardEvent, index);
    expect(skillControl.get('customSkill')?.disable).toHaveBeenCalled();
  });

  it('should add a new sense', () => {
    fixture.detectChanges();
    const initialLength = component.senses.length;
    component.addSense();
    expect(component.senses.length).toBe(initialLength + 1);
  });

  it('should remove a sense', () => {
    fixture.detectChanges();
    component.addSense();
    const initialLength = component.senses.length;
    component.removeSense(0);
    expect(component.senses.length).toBe(initialLength - 1);
  });

  it('should add a new language', () => {
    fixture.detectChanges();
    const initialLength = component.languages.length;
    component.addLanguage();
    expect(component.languages.length).toBe(initialLength + 1);
  });

  it('should remove a language', () => {
    fixture.detectChanges();
    component.addLanguage();
    const initialLength = component.languages.length;
    component.removeLanguage(0);
    expect(component.languages.length).toBe(initialLength - 1);
  });

  it('should add a new damage adjustment', () => {
    fixture.detectChanges();
    const initialLength = component.damageAdjustments.length;
    component.addDamageAdjustment();
    expect(component.damageAdjustments.length).toBe(initialLength + 1);
  });

  it('should remove a damage adjustment', () => {
    fixture.detectChanges();
    component.addDamageAdjustment();
    const initialLength = component.damageAdjustments.length;
    component.removeDamageAdjustment(0);
    expect(component.damageAdjustments.length).toBe(initialLength - 1);
  });

  it('should add a new condition immunity', () => {
    fixture.detectChanges();
    const initialLength = component.conditionImmunities.length;
    component.addConditionImmunity();
    expect(component.conditionImmunities.length).toBe(initialLength + 1);
  });

  it('should remove a condition immunity', () => {
    fixture.detectChanges();
    component.addConditionImmunity();
    const initialLength = component.conditionImmunities.length;
    component.removeConditionImmunity(0);
    expect(component.conditionImmunities.length).toBe(initialLength - 1);
  });

  it('should add a new habitat', () => {
    fixture.detectChanges();
    const initialLength = component.monsterHabitatsArray.length;
    component.addMonsterHabitat();
    expect(component.monsterHabitatsArray.length).toBe(initialLength + 1);
  });

  it('should remove a habitat', () => {
    fixture.detectChanges();
    component.addMonsterHabitat();
    const initialLength = component.monsterHabitatsArray.length;
    component.removeMonsterHabitat(0);
    expect(component.monsterHabitatsArray.length).toBe(initialLength - 1);
  });

  it('should add a new trait', () => {
    fixture.detectChanges();
    const initialLength = component.traits.length;
    component.addTrait();
    expect(component.traits.length).toBe(initialLength + 1);
  });

  it('should remove a trait', () => {
    fixture.detectChanges();
    component.addTrait();
    const initialLength = component.traits.length;
    component.removeTrait(0);
    expect(component.traits.length).toBe(initialLength - 1);
  });

  it('should add a new special ability', () => {
    fixture.detectChanges();
    const initialLength = component.specialAbilities.length;
    component.addSpecialAbility();
    expect(component.specialAbilities.length).toBe(initialLength + 1);
  });

  it('should remove a special ability', () => {
    fixture.detectChanges();
    component.addSpecialAbility();
    const initialLength = component.specialAbilities.length;
    component.removeSpecialAbility(0);
    expect(component.specialAbilities.length).toBe(initialLength - 1);
  });

  it('should add a new action', () => {
    fixture.detectChanges();
    const initialLength = component.actions.length;
    component.addAction();
    expect(component.actions.length).toBe(initialLength + 1);
  });

  it('should remove an action', () => {
    fixture.detectChanges();
    component.addAction();
    const initialLength = component.actions.length;
    component.removeAction(0);
    expect(component.actions.length).toBe(initialLength - 1);
  });

  it('should add a new bonus action', () => {
    fixture.detectChanges();
    const initialLength = component.bonusActions.length;
    component.addBonusAction();
    expect(component.bonusActions.length).toBe(initialLength + 1);
  });

  it('should remove a bonus action', () => {
    fixture.detectChanges();
    component.addBonusAction();
    const initialLength = component.bonusActions.length;
    component.removeBonusAction(0);
    expect(component.bonusActions.length).toBe(initialLength - 1);
  });

  it('should add a new reaction', () => {
    fixture.detectChanges();
    const initialLength = component.reactions.length;
    component.addReaction();
    expect(component.reactions.length).toBe(initialLength + 1);
  });

  it('should remove a reaction', () => {
    fixture.detectChanges();
    component.addReaction();
    const initialLength = component.reactions.length;
    component.removeReaction(0);
    expect(component.reactions.length).toBe(initialLength - 1);
  });

  it('should reset form fields when legendary checkbox is unchecked', () => {
    fixture.detectChanges();
    
    component.monsterForm.get('legendaryActionDescription')?.setValue('Test description');
    
    const mockEvent = {
      target: { checked: false } as HTMLInputElement
    } as unknown as Event;
    
    component.onLegendaryChange(mockEvent);
    
    expect(component.monsterForm.get('legendaryActionDescription')?.value).toBe(null);
  });

  it('should reset form fields when mythic checkbox is unchecked', () => {
    fixture.detectChanges();
    
    component.monsterForm.get('mythicActionDescription')?.setValue('Test description');
    
    const mockEvent = {
      target: { checked: false } as HTMLInputElement
    } as unknown as Event;
    
    component.onMythicChange(mockEvent);
    
    expect(component.monsterForm.get('mythicActionDescription')?.value).toBe(null);
  });

  it('should reset form fields when lair checkbox is unchecked', () => {
    fixture.detectChanges();
    
    component.monsterForm.get('lairXP')?.setValue(500);
    component.monsterForm.get('lairDescription')?.setValue('Test description');
    
    const mockEvent = {
      target: { checked: false } as HTMLInputElement
    } as unknown as Event;
    
    component.onLairChange(mockEvent);
    
    expect(component.monsterForm.get('lairXP')?.value).toBe(null);
    expect(component.monsterForm.get('lairDescription')?.value).toBe(null);
  });

  it('should filter available conditions correctly', () => {
    fixture.detectChanges();
    
    component.addConditionImmunity();
    component.addConditionImmunity();
    
    component.conditionImmunities.at(0).get('condition')?.setValue('Blinded');
    
    const availableForSecond = component.getAvailableConditions(1);
    expect(availableForSecond).not.toContain('Blinded');
    expect(availableForSecond.length).toBe(component.conditionTypes.length - 1);
  });

  it('should filter available habitats correctly', () => {
    fixture.detectChanges();
    
    component.addMonsterHabitat();
    component.addMonsterHabitat();
    
    component.monsterHabitatsArray.at(0).get('habitat')?.setValue('Forest');
    
    const availableForSecond = component.getAvailableHabitats(1);
    expect(availableForSecond).not.toContain('Forest');
    expect(availableForSecond.length).toBe(component.monsterHabitats.length - 1);
  });

  it('should create a new monster successfully', fakeAsync(() => {
    fixture.detectChanges();
    
    component.monsterForm.get('name')?.setValue('New Monster');
    
    mockMonsterService.createMonster.and.returnValue(of({ id: 2, name: 'New Monster' }));
    spyOn(window, 'alert');
    
    component.onSubmit();
    tick();
    
    expect(mockMonsterService.createMonster).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Monster created successfully!');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/monsters']);
  }));

  it('should update an existing monster successfully', fakeAsync(() => {
    mockActivatedRoute.params = of({ id: '1' });
    mockMonsterService.getMonsterById.and.returnValue(of(mockMonster));
    mockMonsterService.updateMonster.and.returnValue(of({ id: 1, name: 'Updated Monster' }));
    
    fixture.detectChanges();
    tick();
    
    component.monsterForm.get('name')?.setValue('Updated Monster');
    
    spyOn(window, 'alert');
    
    component.onSubmit();
    tick();
    
    expect(mockMonsterService.updateMonster).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Monster updated successfully!');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/monsters']);
  }));

  it('should handle file uploads when creating a monster', fakeAsync(() => {
    fixture.detectChanges();
    
    component.monsterForm.get('name')?.setValue('New Monster with Image');
    
    const mockFile = new File(['test'], 'test-image.jpg', { type: 'image/jpeg' });
    component.selectedFile = mockFile;
    
    mockMonsterService.createMonster.and.returnValue(of({ id: 3, name: 'New Monster with Image' }));
    spyOn(window, 'alert');
    
    component.onSubmit();
    tick();
    
    expect(mockMonsterService.createMonster).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Monster created successfully!');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/monsters']);
  }));

  it('should handle errors when creating a monster', fakeAsync(() => {
    fixture.detectChanges();
    
    component.monsterForm.get('name')?.setValue('Failed Monster');
    
    mockMonsterService.createMonster.and.returnValue(throwError(() => new Error('Server error')));
    spyOn(console, 'error');
    spyOn(window, 'alert');
    
    component.onSubmit();
    tick();
    
    expect(console.error).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Failed to create monster. Please try again.');
  }));

  it('should handle errors when updating a monster', fakeAsync(() => {
    mockActivatedRoute.params = of({ id: '1' });
    mockMonsterService.getMonsterById.and.returnValue(of(mockMonster));
    mockMonsterService.updateMonster.and.returnValue(throwError(() => new Error('Server error')));
    
    fixture.detectChanges();
    tick();
    
    spyOn(console, 'error');
    spyOn(window, 'alert');
    
    component.onSubmit();
    tick();
    
    expect(console.error).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Failed to update monster. Please try again.');
    
    flush();
  }));

  it('should validate the form on submit', () => {
    fixture.detectChanges();
    
    component.monsterForm.get('name')?.setValue(''); 
    
    mockMonsterService.createMonster.and.returnValue(of({}));
    mockMonsterService.updateMonster.and.returnValue(of({}));
    
    component.currentUserID = 123; 
    spyOn(window, 'alert');
    spyOnProperty(component.monsterForm, 'invalid', 'get').and.returnValue(true);
    
    component.onSubmit();
    
    expect(window.alert).toHaveBeenCalled();
    expect(mockMonsterService.createMonster).not.toHaveBeenCalled();
    expect(mockMonsterService.updateMonster).not.toHaveBeenCalled();
  });
  
  it('should show alert when user is not logged in on submit', () => {
    fixture.detectChanges();
    component.currentUserID = null; 
    
    spyOn(window, 'alert');
    component.onSubmit();
    
    expect(window.alert).toHaveBeenCalledWith('Please ensure you are logged in and fill out all required fields.');
  });

  it('should alert with missing fields when form has required errors', () => {
    fixture.detectChanges();
    
    const nameControl = component.monsterForm.get('name');
    nameControl?.setErrors({ 'required': true });
    
    spyOn(window, 'alert');
    spyOnProperty(component.monsterForm, 'invalid', 'get').and.returnValue(true);
    
    component.onSubmit();
    
    expect(window.alert).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith(jasmine.stringMatching(/name/));
  });
  
  it('should test patchFormWithMonsterData with different data formats', () => {
    fixture.detectChanges();
    
    const complexMonster = {
      ...mockMonster,
      savingThrows: 'Strength +3, Wisdom +2',
      senses: 'Darkvision 60 ft., Blindsight 30 ft.',
      languages: 'Common, Elvish, Orc',
      skills: 'Perception +4, Stealth +5, Survival +3',
      damageVulnerabilities: 'Fire, Cold',
      damageResistances: 'Lightning, Thunder',
      damageImmunities: 'Poison, Acid',
      conditionImmunities: 'Frightened, Charmed'
    };
    
    component.patchFormWithMonsterData(complexMonster);
    
    expect(component.savingThrows.length).toBe(6);
    expect(component.senses.length).toBe(2);
    expect(component.languages.length).toBe(3);
    expect(component.skills.length).toBe(3);
    
    expect(component.monsterForm.get('name')?.value).toBe('Test Monster');
    expect(component.monsterForm.get('size')?.value).toBe('Medium');
  });
  
  it('should handle file upload when updating a monster', fakeAsync(() => {
    mockActivatedRoute.params = of({ id: '1' });
    mockMonsterService.getMonsterById.and.returnValue(of(mockMonster));
    
    fixture.detectChanges();
    tick();
    
    const mockFile = new File(['test'], 'test-image.jpg', { type: 'image/jpeg' });
    component.selectedFile = mockFile;
    
    mockMonsterService.updateMonster.and.returnValue(of({ id: 1, name: 'Updated Monster' }));
    
    spyOn(window, 'alert');
    
    component.onSubmit();
    tick();
    
    expect(mockMonsterService.updateMonster).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Monster updated successfully!');
    
    flush();
  }));
  
  it('should handle file upload errors when creating a monster', fakeAsync(() => {
    fixture.detectChanges();
    
    component.monsterForm.get('name')?.setValue('New Monster with Image');
    
    const mockFile = new File(['test'], 'test-image.jpg', { type: 'image/jpeg' });
    component.selectedFile = mockFile;
    
    mockMonsterService.createMonster.and.returnValue(throwError(() => new Error('File upload error')));
    
    spyOn(console, 'error');
    spyOn(window, 'alert');
    
    component.onSubmit();
    tick();
    
    expect(console.error).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Failed to create monster. Please try again.');
    
    flush();
  }));
  
  it('should handle empty strings in parsed data', () => {
    fixture.detectChanges();
    
    const sparseMonster = {
      ...mockMonster,
      savingThrows: '',
      senses: '',
      languages: '', 
      skills: '',
      damageVulnerabilities: '',
      damageResistances: '',
      damageImmunities: '',
      conditionImmunities: '',
      monsterHabitats: ''
    };
    
    component.patchFormWithMonsterData(sparseMonster);
    
    expect(component.languages.length).toBe(0);
    expect(component.senses.length).toBe(0);
    expect(component.monsterForm.get('name')?.value).toBe('Test Monster');
  });
  
  it('should handle null image URL', () => {
    fixture.detectChanges();
    
    const monsterWithoutImage = { ...mockMonster, imageUrl: null };
    component.patchFormWithMonsterData(monsterWithoutImage);
    
    expect(component.imagePreview).toBe(null);
  });
  
  it('should initialize form correctly when not in edit mode', () => {
    mockActivatedRoute.params = of({});
    
    fixture.detectChanges();
    
    expect(component.editMode).toBe(false);
    expect(component.monsterId).toBe(null);
    expect(component.abilityScores.length).toBe(6);
    expect(component.savingThrows.length).toBe(6);
  });
  
  it('should handle server-side platform', () => {
    TestBed.resetTestingModule();
    
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, CommonModule, QuillModule.forRoot()],
      providers: [
        { provide: MonsterService, useValue: mockMonsterService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: PLATFORM_ID, useValue: 'server' }, 
        { provide: FormBuilder, useValue: formBuilder }
      ]
    }).compileComponents();
    
    spyOn(console, 'warn');
    
    fixture = TestBed.createComponent(CreateMonsterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    
    expect(console.warn).toHaveBeenCalledWith('Running on the server. Skipping localStorage access.');
  });
  
  it('should add and remove damage vulnerabilities', () => {
    fixture.detectChanges();
    
    const initialLength = component.damageVulnerabilities.length;
    component.addDamageVulnerability();
    expect(component.damageVulnerabilities.length).toBe(initialLength + 1);
    
    component.removeDamageVulnerability(0);
    expect(component.damageVulnerabilities.length).toBe(initialLength);
  });
  
  it('should add and remove damage resistances', () => {
    fixture.detectChanges();
    
    const initialLength = component.damageResistances.length;
    component.addDamageResistance();
    expect(component.damageResistances.length).toBe(initialLength + 1);
    
    component.removeDamageResistance(0);
    expect(component.damageResistances.length).toBe(initialLength);
  });
  
  it('should add and remove damage immunities', () => {
    fixture.detectChanges();
    
    const initialLength = component.damageImmunities.length;
    component.addDamageImmunity();
    expect(component.damageImmunities.length).toBe(initialLength + 1);
    
    component.removeDamageImmunity(0);
    expect(component.damageImmunities.length).toBe(initialLength);
  });
  
  it('should initialize ability scores correctly', () => {
    const abilityScoresArray = component.monsterForm.get('abilityScores');
    abilityScoresArray?.reset();
    
    component.initializeAbilityScores();
    
    expect(component.abilityScores.length).toBe(6);
    expect(component.abilityScores.at(0).get('stat')?.value).toBe('Strength');
    expect(component.abilityScores.at(1).get('stat')?.value).toBe('Dexterity');
    expect(component.abilityScores.at(2).get('stat')?.value).toBe('Constitution');
    expect(component.abilityScores.at(3).get('stat')?.value).toBe('Intelligence');
    expect(component.abilityScores.at(4).get('stat')?.value).toBe('Wisdom');
    expect(component.abilityScores.at(5).get('stat')?.value).toBe('Charisma');
  });
  
  it('should initialize saving throws correctly', () => {
    const savingThrowsArray = component.monsterForm.get('savingThrows');
    savingThrowsArray?.reset();
    
    component.initializeSavingThrows();
    
    expect(component.savingThrows.length).toBe(6);
    expect(component.savingThrows.at(0).get('stat')?.value).toBe('Strength');
    expect(component.savingThrows.at(5).get('stat')?.value).toBe('Charisma');
  });
  
  it('should initialize skills array', () => {
    fixture.detectChanges();
    
    const skillsFormArray = component.monsterForm.get('skills') as FormArray;
    while (skillsFormArray.length > 0) {
        component.removeSkill(0);
    }
    
    component.initializeSkills();
    
    expect(component.skills.length).toBe(1);
    expect(component.skills.at(0).get('skill')?.value).toBe('');
    expect(component.skills.at(0).get('value')?.value).toBe('');
  });
});