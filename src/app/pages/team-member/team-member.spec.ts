import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamMember } from './team-member';

describe('TeamMember', () => {
  let component: TeamMember;
  let fixture: ComponentFixture<TeamMember>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamMember],
    }).compileComponents();

    fixture = TestBed.createComponent(TeamMember);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
