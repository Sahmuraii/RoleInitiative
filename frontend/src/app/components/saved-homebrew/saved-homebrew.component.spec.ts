import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavedHomebrewComponent } from './saved-homebrew.component';

describe('SavedHomebrewComponent', () => {
  let component: SavedHomebrewComponent;
  let fixture: ComponentFixture<SavedHomebrewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SavedHomebrewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SavedHomebrewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
