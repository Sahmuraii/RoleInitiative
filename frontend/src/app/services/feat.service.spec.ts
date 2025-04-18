import { TestBed } from '@angular/core/testing';

import { FeatService } from './feat.service';

describe('FeatService', () => {
  let service: FeatService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FeatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
