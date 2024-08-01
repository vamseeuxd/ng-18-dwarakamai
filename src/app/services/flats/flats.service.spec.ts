import { TestBed } from '@angular/core/testing';

import { FlatsService } from './flats.service';

describe('FlatsService', () => {
  let service: FlatsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FlatsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
