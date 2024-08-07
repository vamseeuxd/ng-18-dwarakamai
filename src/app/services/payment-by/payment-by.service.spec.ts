import { TestBed } from '@angular/core/testing';

import { PaymentByService } from './payment-by.service';

describe('FloorsService', () => {
  let service: PaymentByService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaymentByService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
