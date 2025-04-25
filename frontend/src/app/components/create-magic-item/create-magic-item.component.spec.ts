import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateMagicItemComponent } from './create-magic-item.component';

describe('CreateMagicItemComponent', () => {
  let component: CreateMagicItemComponent;
  let fixture: ComponentFixture<CreateMagicItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateMagicItemComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateMagicItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
