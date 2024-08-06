import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddOrEditDialogComponent } from './add-or-edit-dialog.component';

describe('AddOrEditDialogComponent', () => {
  let component: AddOrEditDialogComponent;
  let fixture: ComponentFixture<AddOrEditDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddOrEditDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddOrEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
