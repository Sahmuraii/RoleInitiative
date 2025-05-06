import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateCharacterComponent } from './create-character.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CreateCharacterService } from '../../services/create-character.service';
import { Class_Proficiency_Option } from '../../models/class_proficiency_option.type';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuillModule } from 'ngx-quill';

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
    "name": null, 
    "ruleset": "2014", 
    "levelMethod": "experience", 
    "encumberance": "false", 
    "race": null, 
    "classLevels": [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], 
    "primaryClass": "None", 
    "classProficiencies": [], 
    "statRuleset": "roll", 
    "rollDiceAmt": 4, 
    "rollDiceType": 6, 
    "rollDropAmt": 1, 
    "str": 8, 
    "dex": 8, 
    "con": 8, 
    "int": 8, 
    "wis": 8, 
    "cha": 8, 
    "spellsKnown": [], 
    "homebrewSpellsKnown": [], 
    "background": "", 
    "alignment": "", 
    "personality": "", 
    "faith": "", 
    "height": "", 
    "weight": "", 
    "skinColor": "", 
    "hairColor": "", 
    "eyeColor": "", 
    "age": "", 
    "appearance": "", 
    "backstory": "", 
    "bonds": "", 
    "miscDetails": "", 
    "equipment": "" 
  } 

  const mockRaces = [
    {
      "ability_bonuses": [""],
      "age_description": "",
      "alignment_description": "",
      "description": "",
      "is_official": true,
      "language_description": "",
      "languages": [""],
      "name": "Dragonborn",
      "race_id": 1,
      "size": "",
      "size_description": "",
      "speed": 0,
      "starting_proficiencies": [""],
      "subraces": [""],
      "traits": [""]
    },
    {
      "ability_bonuses": [""],
      "age_description": "",
      "alignment_description": "",
      "description": "",
      "is_official": true,
      "language_description": "",
      "languages": [""],
      "name": "Dwarf",
      "race_id": 2,
      "size": "",
      "size_description": "",
      "speed": 0,
      "starting_proficiencies": [""],
      "subraces": [""],
      "traits": [""]
    },
    {
      "ability_bonuses": [""],
      "age_description": "",
      "alignment_description": "",
      "description": "",
      "is_official": true,
      "language_description": "",
      "languages": [""],
      "name": "Elf",
      "race_id": 3,
      "size": "",
      "size_description": "",
      "speed": 0,
      "starting_proficiencies": [""],
      "subraces": [""],
      "traits": [""]
    },
    {
      "ability_bonuses": [""],
      "age_description": "",
      "alignment_description": "",
      "description": "",
      "is_official": true,
      "language_description": "",
      "languages": [""],
      "name": "Gnome",
      "race_id": 4,
      "size": "",
      "size_description": "",
      "speed": 0,
      "starting_proficiencies": [""],
      "subraces": [""],
      "traits": [""]
    },
    {
      "ability_bonuses": [""],
      "age_description": "",
      "alignment_description": "",
      "description": "",
      "is_official": true,
      "language_description": "",
      "languages": [""],
      "name": "Half-Elf",
      "race_id": 5,
      "size": "",
      "size_description": "",
      "speed": 0,
      "starting_proficiencies": [""],
      "subraces": [""],
      "traits": [""]
    },
    {
      "ability_bonuses": [""],
      "age_description": "",
      "alignment_description": "",
      "description": "",
      "is_official": true,
      "language_description": "",
      "languages": [""],
      "name": "Half-Orc",
      "race_id": 6,
      "size": "",
      "size_description": "",
      "speed": 0,
      "starting_proficiencies": [""],
      "subraces": [""],
      "traits": [""]
    },
    {
      "ability_bonuses": [""],
      "age_description": "",
      "alignment_description": "",
      "description": "",
      "is_official": true,
      "language_description": "",
      "languages": [""],
      "name": "Halfling",
      "race_id": 7,
      "size": "",
      "size_description": "",
      "speed": 0,
      "starting_proficiencies": [""],
      "subraces": [""],
      "traits": [""]
    },
    {
      "ability_bonuses": [""],
      "age_description": "",
      "alignment_description": "",
      "description": "",
      "is_official": true,
      "language_description": "",
      "languages": [""],
      "name": "Human",
      "race_id": 8,
      "size": "",
      "size_description": "",
      "speed": 0,
      "starting_proficiencies": [""],
      "subraces": [""],
      "traits": [""]
    },
    {
      "ability_bonuses": [""],
      "age_description": "",
      "alignment_description": "",
      "description": "",
      "is_official": true,
      "language_description": "",
      "languages": [""],
      "name": "Tiefling",
      "race_id": 9,
      "size": "",
      "size_description": "",
      "speed": 0,
      "starting_proficiencies": [""],
      "subraces": [""],
      "traits": [""]
    }
  ]

  beforeEach(async () => {
    mockCreateCharacterService = jasmine.createSpyObj('CreateCharacterService', ['createCharacter', 'getRaceData', 'getClassData', 'getClassProficiencyData', 'getSpellData', 'getUserSpellData']);
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
        ReactiveFormsModule,
        CommonModule,
        QuillModule.forRoot()
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

    mockAuthService.getCurrentUser.and.returnValue(mockUser);
    mockCreateCharacterService.createCharacter.and.returnValue(of({}));
    mockCreateCharacterService.getRaceData.and.returnValue(of(mockRaces));

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

  it('should initialize form with default values', () => {
    fixture.detectChanges();
    expect(component.characterForm).toBeTruthy();
    expect(component.characterForm.get('name')?.value).toBe('');
    expect(component.characterForm.get('ruleset')?.value).toBe('2014');
    expect(component.characterForm.get('levelMethod')?.value).toBe('experience');
    expect(component.characterForm.get('encumberance')?.value).toBe('false');
    expect(component.characterForm.get('race')?.value).toBe(null);
    expect(component.characterForm.get('classLevels')?.value).toBe([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]);
    expect(component.characterForm.get('primaryClass')?.value).toBe('None');
    expect(component.characterForm.get('classProficiencies')?.value).toBe([]);
    expect(component.characterForm.get('str')?.value).toBe(8);
    expect(component.characterForm.get('dex')?.value).toBe(8);
    expect(component.characterForm.get('con')?.value).toBe(8);
    expect(component.characterForm.get('int')?.value).toBe(8);
    expect(component.characterForm.get('wis')?.value).toBe(8);
    expect(component.characterForm.get('cha')?.value).toBe(8);
  });

  it('Should return the right class proficiency sets for Barbarian (class_id = 1)', () => {
    const result = component.getArrayOfProfTypes("1");
    console.log("Result:", result); // Inspect the result
    expect(result.length).toBe(1); // Expect 1 object for Barbarian
    expect(result[0].class_id).toBe(1); // Verify the class_id
    expect(result[0].name).toBe("Barbarian"); // Verify the name
  });
});