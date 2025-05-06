import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateCharacterComponent } from './create-character.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CreateCharacterService } from '../../services/create-character.service';
import { Class_Proficiency_Option } from '../../models/class_proficiency_option.type';
import { AuthService } from '../../services/auth.service';
import { FormArray, FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuillModule } from 'ngx-quill';
import { DND_Spell } from '../../models/dnd_spell.type';

describe('CreateCharacterComponent', () => {
  let component: CreateCharacterComponent;
  let fixture: ComponentFixture<CreateCharacterComponent>;
  let mockCreateCharacterService: jasmine.SpyObj<CreateCharacterService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;
  let formBuilder: FormBuilder;
  let defaultJson: object = {};


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

  const mockClasses = [
    { 
      "class_id": 1, 
      "description": "Barbarian", 
      "hit_die": 12, 
      "is_official": true, 
      "name": "Barbarian" 
    }, 
    { 
      "class_id": 2, 
      "description": "Bard", 
      "hit_die": 8, 
      "is_official": true, 
      "name": "Bard" 
    }, 
    { "class_id": 3, 
      "description": "Cleric", 
      "hit_die": 8, 
      "is_official": true, 
      "name": "Cleric" 
    }, 
    { 
      "class_id": 4, 
      "description": "Druid", 
      "hit_die": 8, 
      "is_official": true, 
      "name": "Druid" 
    }, 
    { 
      "class_id": 5, 
      "description": "Fighter", 
      "hit_die": 10, 
      "is_official": true, 
      "name": "Fighter" 
    }, 
    { 
      "class_id": 6, 
      "description": "Monk", 
      "hit_die": 8, 
      "is_official": true, 
      "name": "Monk" 
    }, 
    { 
      "class_id": 7, 
      "description": "Paladin", 
      "hit_die": 10, 
      "is_official": true, 
      "name": "Paladin" 
    }, 
    { 
      "class_id": 8, 
      "description": "Ranger", 
      "hit_die": 10, 
      "is_official": true, 
      "name": "Ranger" 
    }, 
    { 
      "class_id": 9, 
      "description": "Rogue", 
      "hit_die": 8, 
      "is_official": true, 
      "name": "Rogue" 
    }, 
    { 
      "class_id": 10, 
      "description": "Sorcerer", 
      "hit_die": 6, 
      "is_official": true, 
      "name": "Sorcerer" 
    }, 
    { 
      "class_id": 11, 
      "description": "Warlock", 
      "hit_die": 8, 
      "is_official": true, 
      "name": "Warlock" 
    }, 
    { 
      "class_id": 12, 
      "description": "Wizard", 
      "hit_die": 6, 
      "is_official": true, 
      "name": "Wizard" 
    }
  ]

  const mockClassProficiencies = [
    {
      "class_id": 1,
      "description": "A fierce warrior of primitive background who can enter a battle rage",
      "given_by_class": 1,
      "given_when_multiclass": false,
      "hit_die": 12,
      "is_official": true,
      "list_description": "Choose two from Animal Handling, Athletics, Intimidation, Nature, Perception, and Survival",
      "max_choices": 2,
      "name": "Barbarian",
      "proficiency_list_id": 1,
      "proficiency_options": [
        { "id": 86, "name": "Skill: Animal Handling", "type": 1 },
        { "id": 88, "name": "Skill: Athletics", "type": 1 },
        { "id": 92, "name": "Skill: Intimidation", "type": 1 },
        { "id": 95, "name": "Skill: Nature", "type": 1 },
        { "id": 96, "name": "Skill: Perception", "type": 1 },
        { "id": 102, "name": "Skill: Survival", "type": 1 },
      ],
    },
  ]

  const mockSpells = [{
    "spell_id": 1,
    "spell_name": "Acid Arrow",
    "spell_level": 2,
    "spell_school": "Evocation",
    "casting_time": "1 Action",
    "attack_type": "ranged",
    "damage_slot_level": [],
    "damage_char_level": null,
    "damage_type": "Acid",
    "heal_slot_level": null,
    "dc_type": null,
    "dc_success": null,
    "reaction_condition": "",
    "is_ritual": false,
    "is_concentration": false,
    "area_type": null,
    "area_size": null,
    "range": "90 feet",
    "components": ["V", "S", "M"],
    "material": "When you cast this spell using a spell slot of 3rd level or higher, the damage (both initial and later) increases by 1d4 for each slot level above 2nd.",
    "duration": "Instantaneous",
    "description": [""],
    "higher_level": null,
    "classes": ["Wizard"],
    "subclasses": ["Lore", "Land"],
  }]

  const mockUserSpells = [{
    "user_spell_id": 1,
    "user_id": 8295,
    "spell_name": "Luminous Verdict",
    "version": "",
    "spell_level": "3rd-Level",
    "spell_school": "Evocation",
    "casting_time": "Bonus Action",
    "reaction_condition": "",
    "components": ["V", "S"],
    "material": "",
    "spell_range_type": "Distance",
    "range": "Distance (30 feet Cylinder)",
    "area_length": "30 feet",
    "area_type": "Cylinder",
    "duration_type": "Concentration",
    "duration": "",
    "duration_time": "",
    "description": "You call down a radiant judgment upon a foe, empowering your strikes with divine energy. Choose one creature within range. For the duration, your weapon strikes against that creature deal an additional 1d8 radiant damage. The target must make a Constitution saving throw at the start of each of its turns. On a failed save, it is blinded until the start of its next turn. Additionally, once while the spell is active, you may expend the spell as a reaction when the target hits a creature with an attack: the attacker takes radiant damage equal to your Paladin level + your Charisma modifier, and must make a Dexterity saving throw or be knocked prone.",
    "ritual_spell": "",
    "higher_level_description": "",
    "higher_level_scaling": "",
    "classes": [""],
    "subclasses": [""],
    "isSaveOrAttack": "save",
    "save_stat": "Dexterity",
    "attack_type": "melee",
    "damage": "+1d8",
    "damage_type": "Radiant",
    "effect": "",
    "inflicts_conditions": true,
    "conditions": []
  }]

  const mockClassLevels = new FormArray([
    new FormControl(1),
    new FormControl(2),
  ])

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
    mockCreateCharacterService.getClassData.and.returnValue(of(mockClasses));
    mockCreateCharacterService.getClassProficiencyData.and.returnValue(of(mockClassProficiencies));
    mockCreateCharacterService.getSpellData.and.returnValue(of(mockSpells as unknown as DND_Spell[]));
    mockCreateCharacterService.getUserSpellData.and.returnValue(of(mockUserSpells));

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
    expect(component.characterForm.get('name')?.value).toBe(null);
    expect(component.characterForm.get('ruleset')?.value).toBe('2014');
    expect(component.characterForm.get('levelMethod')?.value).toBe('experience');
    expect(component.characterForm.get('encumberance')?.value).toBe('false');
    expect(component.characterForm.get('race')?.value).toBe(null);
    expect(component.characterForm.get('classLevels')?.value).toEqual([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]);
    expect(component.characterForm.get('primaryClass')?.value).toBe('None');
    expect(component.characterForm.get('classProficiencies')?.value).toEqual([]);
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

  it('Should return an array of all classes of the format { class_id: number, level: number }[]', () => {
    component.classLevels.setValue([1, 0])
    fixture.detectChanges()
    const result = component.getClassLevels();
    expect(result.length).toBe(12)
    expect(result[0]).toEqual({"class_id": 1, "level": 1})
  })
});