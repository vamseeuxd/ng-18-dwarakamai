import { TestBed } from '@angular/core/testing';

import { ExpenseTypesService } from './expenses-type.service';

describe('ExpensesTypeService', () => {
  let service: ExpenseTypesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExpenseTypesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
