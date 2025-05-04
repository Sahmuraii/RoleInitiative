import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateMonsterComponent } from './create-monster.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MonsterService } from '../../services/monster.service';
import { AuthService } from '../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { QuillModule } from 'ngx-quill';
import { CommonModule } from '@angular/common';

describe('CreateMonsterComponent', () => {
  let component: CreateMonsterComponent;
  let fixture: ComponentFixture<CreateMonsterComponent>;
  let mockMonsterService: jasmine.SpyObj<MonsterService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    mockMonsterService = jasmine.createSpyObj('MonsterService', [
      'getMonsterById', 
      'createMonster', 
      'updateMonster'
    ]);
    mockAuthService = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    
    mockActivatedRoute = {
      params: of({})
    };

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        CommonModule,
        QuillModule.forRoot(),
        CreateMonsterComponent
      ],
      providers: [
        FormBuilder,
        { provide: MonsterService, useValue: mockMonsterService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateMonsterComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Integration Test 1: Form initialization with default values
  it('should initialize form with default values', () => {
    mockAuthService.getCurrentUser.and.returnValue({ id: 1 });
    fixture.detectChanges();
    
    expect(component.monsterForm).toBeDefined();
    expect(component.monsterForm.get('name')?.value).toBe('');
    expect(component.monsterForm.get('isLegendary')?.value).toBe(false);
    expect(component.abilityScores.length).toBe(6);
    expect(component.savingThrows.length).toBe(6);
  });

  // Integration Test 2: Loading monster data in edit mode
  it('should load monster data when in edit mode', () => {
    const mockMonster = {
      id: 1,
      name: 'Test Monster',
      size: 'Medium',
      type: 'Beast',
      armorClass: 15,
      hitPointsDieCount: 5,
      hitPointsValue: 'd8',
      hitPointsModifier: 2,
      speed: 30,
      abilityScores: [],
      savingThrows: 'Strength +2, Dexterity +3',
      skills: 'Perception +4, Stealth +5',
      damageVulnerabilities: 'Fire',
      damageResistances: 'Cold',
      damageImmunities: 'Poison',
      conditionImmunities: 'Poisoned',
      senses: 'Darkvision 60',
      languages: 'Common, Elvish',
      challengeRating: '1',
      isLegendary: false,
      isMythic: false,
      hasLair: false
    };

    mockAuthService.getCurrentUser.and.returnValue({ id: 1 });
    mockActivatedRoute.params = of({ id: 1 });
    mockMonsterService.getMonsterById.and.returnValue(of(mockMonster));
    
    fixture.detectChanges();

    expect(component.editMode).toBeTrue();
    expect(component.monsterId).toBe(1);
    expect(mockMonsterService.getMonsterById).toHaveBeenCalledWith(1);
    expect(component.monsterForm.get('name')?.value).toBe('Test Monster');
    expect(component.monsterForm.get('armorClass')?.value).toBe(15);
    expect(component.savingThrows.length).toBe(6);
    expect(component.skills.length).toBeGreaterThan(0);
  });

  // Integration Test 3: Form submission in create mode
  it('should submit form data when creating a new monster', () => {
    mockAuthService.getCurrentUser.and.returnValue({ id: 1 });
    mockMonsterService.createMonster.and.returnValue(of({ success: true }));
    
    fixture.detectChanges();

    // Set form values
    component.monsterForm.patchValue({
      name: 'New Monster',
      size: 'Large',
      type: 'Dragon',
      armorClass: 18,
      hitPointsDieCount: 10,
      hitPointsValue: 'd10',
      hitPointsModifier: 5,
      speed: 40,
      challengeRating: '5'
    });

    component.onSubmit();

    expect(mockMonsterService.createMonster).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/monsters']);
  });

  // Integration Test 4: Form submission in edit mode
  it('should submit form data when updating an existing monster', () => {
    const mockMonster = {
      id: 1,
      name: 'Existing Monster',
      size: 'Medium',
      type: 'Beast'
    };

    mockAuthService.getCurrentUser.and.returnValue({ id: 1 });
    mockActivatedRoute.params = of({ id: 1 });
    mockMonsterService.getMonsterById.and.returnValue(of(mockMonster));
    mockMonsterService.updateMonster.and.returnValue(of({ success: true }));
    
    fixture.detectChanges();

    // Modify some values
    component.monsterForm.patchValue({
      name: 'Updated Monster',
      size: 'Large'
    });

    component.onSubmit();

    expect(component.editMode).toBeTrue();
    expect(mockMonsterService.updateMonster).toHaveBeenCalledWith(1, jasmine.any(Object));
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/monsters']);
  });

  // Integration Test 5: Handling of dynamic form arrays
  it('should correctly handle dynamic form arrays for skills and senses', () => {
    mockAuthService.getCurrentUser.and.returnValue({ id: 1 });
    fixture.detectChanges();

    // Test skills array
    component.addSkill();
    expect(component.skills.length).toBe(1);
    
    component.skills.at(0).patchValue({
      skill: 'Perception',
      value: 4
    });
    
    component.addSkill();
    expect(component.skills.length).toBe(2);
    
    component.removeSkill(0);
    expect(component.skills.length).toBe(1);

    // Test senses array
    component.addSense();
    expect(component.senses.length).toBe(1);
    
    component.senses.at(0).patchValue({
      type: 'Darkvision',
      value: '60'
    });
    
    component.addSense();
    expect(component.senses.length).toBe(2);
    
    component.removeSense(0);
    expect(component.senses.length).toBe(1);
  });

  // Additional unit tests
  it('should initialize ability scores with default values', () => {
    component.initializeAbilityScores();
    expect(component.abilityScores.length).toBe(6);
    expect(component.abilityScores.at(0).get('stat')?.value).toBe('Strength');
  });

  it('should initialize saving throws with default values', () => {
    component.initializeSavingThrows();
    expect(component.savingThrows.length).toBe(6);
    expect(component.savingThrows.at(0).get('stat')?.value).toBe('Strength');
  });

  it('should navigate to login if no user is logged in', () => {
    mockAuthService.getCurrentUser.and.returnValue(null);
    fixture.detectChanges();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should handle legendary checkbox change', () => {
    mockAuthService.getCurrentUser.and.returnValue({ id: 1 });
    fixture.detectChanges();
    
    const event = { target: { checked: false } } as unknown as Event;
    component.onLegendaryChange(event);
    expect(component.monsterForm.get('legendaryActionDescription')?.value).toBeNull();
  });
});