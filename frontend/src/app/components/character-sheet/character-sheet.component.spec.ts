import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CharacterSheetComponent } from './character-sheet.component';

describe('CharacterSheetComponent', () => {
  let component: CharacterSheetComponent;
  let fixture: ComponentFixture<CharacterSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CharacterSheetComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CharacterSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Should gather data', () => {
    expect(component.char_data).toBeDefined();
    expect(component.char_data.char_si).toBeDefined();
  });
});
