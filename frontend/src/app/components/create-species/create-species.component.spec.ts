import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSpeciesComponent } from './create-species.component';

describe('CreateSpeciesComponent', () => {
  let component: CreateSpeciesComponent;
  let fixture: ComponentFixture<CreateSpeciesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateSpeciesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateSpeciesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
