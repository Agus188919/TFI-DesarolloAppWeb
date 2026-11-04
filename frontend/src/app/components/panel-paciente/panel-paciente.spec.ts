import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelPaciente } from './panel-paciente';

describe('PanelPaciente', () => {
  let component: PanelPaciente;
  let fixture: ComponentFixture<PanelPaciente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanelPaciente],
    }).compileComponents();

    fixture = TestBed.createComponent(PanelPaciente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
