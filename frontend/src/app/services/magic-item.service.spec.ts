import { TestBed } from '@angular/core/testing';

import { MagicItemService } from './magic-item.service';

describe('MagicItemService', () => {
  let service: MagicItemService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MagicItemService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
