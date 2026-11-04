import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelMedico } from './panel-medico';

describe('PanelMedico', () => {
  let component: PanelMedico;
  let fixture: ComponentFixture<PanelMedico>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanelMedico],
    }).compileComponents();

    fixture = TestBed.createComponent(PanelMedico);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
