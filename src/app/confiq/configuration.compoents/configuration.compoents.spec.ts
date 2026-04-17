import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigurationComponents} from './configuration.compoents';

describe('ConfigurationComponents', () => {
  let component: ConfigurationComponents;
  let fixture: ComponentFixture<ConfigurationComponents>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigurationComponents],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfigurationComponents);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
