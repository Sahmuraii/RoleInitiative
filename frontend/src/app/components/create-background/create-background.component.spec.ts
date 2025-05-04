import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateBackgroundComponent } from './create-background.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { BackgroundService } from '../../services/background.service';
import { AuthService } from '../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

describe('CreateBackgroundComponent', () => {
  let component: CreateBackgroundComponent;
  let fixture: ComponentFixture<CreateBackgroundComponent>;
  let backgroundService: BackgroundService;
  let authService: AuthService;
  let router: Router;
  let activatedRoute: ActivatedRoute;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        HttpClientTestingModule,
        CreateBackgroundComponent
      ],
      providers: [
        FormBuilder,
        {
          provide: BackgroundService,
          useValue: {
            createBackground: jasmine.createSpy('createBackground').and.returnValue(of({})),
            updateBackground: jasmine.createSpy('updateBackground').and.returnValue(of({})),
            getBackgroundById: jasmine.createSpy('getBackgroundById').and.returnValue(of({}))
          }
        },
        {
          provide: AuthService,
          useValue: {
            getCurrentUser: jasmine.createSpy('getCurrentUser').and.returnValue({ id: 1 })
          }
        },
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate')
          }
        },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({})
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateBackgroundComponent);
    component = fixture.componentInstance;
    backgroundService = TestBed.inject(BackgroundService);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    activatedRoute = TestBed.inject(ActivatedRoute);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form', () => {
    expect(component.backgroundForm).toBeDefined();
    expect(component.backgroundForm.get('name')).toBeDefined();
    expect(component.backgroundForm.get('description')).toBeDefined();
    expect(component.backgroundForm.get('skillProficiencies')).toBeDefined();
    expect(component.backgroundForm.get('toolProficiencies')).toBeDefined();
    expect(component.backgroundForm.get('languageProficiencies')).toBeDefined();
    expect(component.backgroundForm.get('equipment')).toBeDefined();
    expect(component.backgroundForm.get('featureName')).toBeDefined();
    expect(component.backgroundForm.get('featureDescription')).toBeDefined();
    expect(component.backgroundForm.get('personalityTraits')).toBeDefined();
    expect(component.backgroundForm.get('ideals')).toBeDefined();
    expect(component.backgroundForm.get('bonds')).toBeDefined();
    expect(component.backgroundForm.get('flaws')).toBeDefined();
  });

  it('should add proficiencies to the form', () => {
    component.addProficiency('skill');
    expect(component.skillProficienciesArray.length).toBe(1);

    component.addProficiency('tool');
    expect(component.toolProficienciesArray.length).toBe(1);

    component.addProficiency('language');
    expect(component.languageProficienciesArray.length).toBe(1);
  });

  it('should add equipment to the form', () => {
    component.addEquipment();
    expect(component.equipmentArray.length).toBe(1);
  });

  it('should remove proficiencies from the form', () => {
    component.addProficiency('skill');
    component.removeProficiency('skill', 0);
    expect(component.skillProficienciesArray.length).toBe(0);

    component.addProficiency('tool');
    component.removeProficiency('tool', 0);
    expect(component.toolProficienciesArray.length).toBe(0);

    component.addProficiency('language');
    component.removeProficiency('language', 0);
    expect(component.languageProficienciesArray.length).toBe(0);
  });

  it('should remove equipment from the form', () => {
    component.addEquipment();
    component.removeEquipment(0);
    expect(component.equipmentArray.length).toBe(0);
  });

  it('should submit the form with user_id in create mode', () => {
    component.backgroundForm.patchValue({
      name: 'Custom Pirate',
      description: 'A swashbuckling adventurer of the high seas.',
      featureName: 'Ship\'s Passage',
      featureDescription: 'You can secure free passage on a ship for you and your companions.'
    });

    component.addProficiency('skill');
    component.skillProficienciesArray.at(0).setValue('Athletics');
    
    component.addProficiency('tool');
    component.toolProficienciesArray.at(0).setValue('Navigator\'s Tools');
    
    component.addProficiency('language');
    component.languageProficienciesArray.at(0).setValue('Elvish');
    
    component.addEquipment();
    component.equipmentArray.at(0).setValue('Cutlass');

    component.onSubmit();

    const expectedFormData = jasmine.objectContaining({
      name: 'Custom Pirate',
      description: 'A swashbuckling adventurer of the high seas.',
      skillProficiencies: ['Athletics'],
      toolProficiencies: ['Navigator\'s Tools'],
      languageProficiencies: ['Elvish'],
      equipment: ['Cutlass'],
      featureName: 'Ship\'s Passage',
      featureDescription: 'You can secure free passage on a ship for you and your companions.',
      suggested_characteristics: {
        personality_traits: [],
        ideals: [],
        bonds: [],
        flaws: []
      },
      user_id: 1
    });

    expect(backgroundService.createBackground).toHaveBeenCalledWith(expectedFormData);
    expect(router.navigate).toHaveBeenCalledWith(['/backgrounds']);
  });

  it('should submit the form in edit mode', () => {
    component.isEditMode = true;
    component.backgroundId = 1;
    
    component.backgroundForm.patchValue({
      name: 'Updated Pirate',
      description: 'Updated description',
      featureName: 'Updated Feature',
      featureDescription: 'Updated feature description'
    });

    component.onSubmit();

    expect(backgroundService.updateBackground).toHaveBeenCalledWith(1, jasmine.any(Object));
    expect(router.navigate).toHaveBeenCalledWith(['/backgrounds']);
  });

  it('should handle form submission error', () => {
    (backgroundService.createBackground as jasmine.Spy).and.returnValue(throwError('Error'));

    component.backgroundForm.patchValue({
      name: 'Custom Pirate',
      description: 'A swashbuckling adventurer of the high seas.',
      featureName: 'Ship\'s Passage',
      featureDescription: 'You can secure free passage on a ship for you and your companions.'
    });

    component.onSubmit();

    expect(backgroundService.createBackground).toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to login if no user is logged in', () => {
    (authService.getCurrentUser as jasmine.Spy).and.returnValue(null);

    component.ngOnInit();

    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should load background for editing', () => {
    const mockBackground = {
      id: 1,
      background_name: 'Pirate',
      background_description: 'Swashbuckler',
      feature_name: 'Ship Passage',
      feature_effect: 'Free passage',
      skill_proficiencies: ['Athletics'],
      tool_proficiencies: ['Navigator\'s Tools'],
      language_proficiencies: ['Elvish'],
      equipment: ['Cutlass'],
      suggested_characteristics: {
        personality_traits: ['Bold'],
        ideals: ['Freedom'],
        bonds: ['Ship'],
        flaws: ['Greedy']
      },
      user_id: 1
    };

    (backgroundService.getBackgroundById as jasmine.Spy).and.returnValue(of(mockBackground));
    (activatedRoute as any).params = of({ id: '1' });

    component.ngOnInit();

    expect(component.isEditMode).toBeTrue();
    expect(component.backgroundId).toBe(1);
    expect(backgroundService.getBackgroundById).toHaveBeenCalledWith(1);
    expect(component.backgroundForm.get('name')?.value).toBe('Pirate');
    expect(component.skillProficienciesArray.length).toBe(1);
    expect(component.toolProficienciesArray.length).toBe(1);
    expect(component.languageProficienciesArray.length).toBe(1);
    expect(component.equipmentArray.length).toBe(1);
    expect(component.personalityTraitsArray.length).toBe(1);
    expect(component.idealsArray.length).toBe(1);
    expect(component.bondsArray.length).toBe(1);
    expect(component.flawsArray.length).toBe(1);
  });
});