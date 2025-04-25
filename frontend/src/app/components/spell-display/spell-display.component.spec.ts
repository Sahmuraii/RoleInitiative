import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpellDisplayComponent } from './spell-display.component';

describe('SpellDisplayComponent', () => {
  let component: SpellDisplayComponent;
  let fixture: ComponentFixture<SpellDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpellDisplayComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SpellDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
