import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateFeatComponent } from './create-feat.component';

describe('CreateFeatComponent', () => {
  let component: CreateFeatComponent;
  let fixture: ComponentFixture<CreateFeatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateFeatComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateFeatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
