import { TestBed } from '@angular/core/testing';

import { VehicleTypesService } from './vehicle-types.service';

describe('VehicleTypesService', () => {
  let service: VehicleTypesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VehicleTypesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
