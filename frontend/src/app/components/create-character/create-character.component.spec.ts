import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateCharacterComponent } from './create-character.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CreateCharacterService } from '../../services/create-character.service';
import { Class_Proficiency_Option } from '../../models/class_proficiency_option.type';
import { AuthService } from '../../services/auth.service';
import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';

describe('CreateCharacterComponent', () => {
  let component: CreateCharacterComponent;
  let fixture: ComponentFixture<CreateCharacterComponent>;
  let mockCreateCharacterService: jasmine.SpyObj<CreateCharacterService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;
  let formBuilder: FormBuilder;


  const mockUser = { id: 8295, name: 'Test_User' };
  const mockCharacter = {

  }

  beforeEach(async () => {
    mockCreateCharacterService = jasmine.createSpyObj('CreateCharacterService', ['createCharacter']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockActivatedRoute = {
      params: of({}),  
    };
    formBuilder = new FormBuilder();

    await TestBed.configureTestingModule({
      imports: [
        CreateCharacterComponent,
        HttpClientTestingModule,
      ],
      declarations: [],
      providers: [
        { provide: CreateCharacterService, useValue: mockCreateCharacterService},
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: FormBuilder, useValue: formBuilder }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateCharacterComponent);
    component = fixture.componentInstance;

    // Mock the classProficiencyOptions method to return only the Barbarian data
    component.classProficiencyOptions.set([
      {
        class_id: 1,
        description: "A fierce warrior of primitive background who can enter a battle rage",
        given_by_class: 1,
        given_when_multiclass: false,
        hit_die: 12,
        is_official: true,
        list_description: "Choose two from Animal Handling, Athletics, Intimidation, Nature, Perception, and Survival",
        max_choices: 2,
        name: "Barbarian",
        proficiency_list_id: 1,
        proficiency_options: [
          { id: 86, name: "Skill: Animal Handling", type: 1 },
          { id: 88, name: "Skill: Athletics", type: 1 },
          { id: 92, name: "Skill: Intimidation", type: 1 },
          { id: 95, name: "Skill: Nature", type: 1 },
          { id: 96, name: "Skill: Perception", type: 1 },
          { id: 102, name: "Skill: Survival", type: 1 },
        ],
      },
    ]);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Should initialize the form', () => {
    expect(component.characterForm).toBeDefined();
    expect(component.characterForm.get('classLevels')).toBeDefined();
    expect(component.characterForm.get('primaryClass')).toBeDefined();
    expect(component.characterForm.get('classProficiencies')).toBeDefined();
  });

  it('should initialize form with empty values', () => {
    fixture.detectChanges();
    expect(component.characterForm).toBeTruthy();
    expect(component.characterForm.get('name')?.value).toBe('');
    expect(component.characterForm.get('size')?.value).toBe('');
  });

  it('Should return the right class proficiency sets for Barbarian (class_id = 1)', () => {
    const result = component.getArrayOfProfTypes("1");
    console.log("Result:", result); // Inspect the result
    expect(result.length).toBe(1); // Expect 1 object for Barbarian
    expect(result[0].class_id).toBe(1); // Verify the class_id
    expect(result[0].name).toBe("Barbarian"); // Verify the name
  });
});