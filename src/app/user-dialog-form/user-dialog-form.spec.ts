import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserDialogForm } from './user-dialog-form';

describe('UserDialogForm', () => {
  let component: UserDialogForm;
  let fixture: ComponentFixture<UserDialogForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserDialogForm],
    }).compileComponents();

    fixture = TestBed.createComponent(UserDialogForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
