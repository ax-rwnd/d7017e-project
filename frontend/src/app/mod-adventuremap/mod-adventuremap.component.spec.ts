import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModAdventuremapComponent } from './mod-adventuremap.component';

describe('ModAdventuremapComponent', () => {
  let component: ModAdventuremapComponent;
  let fixture: ComponentFixture<ModAdventuremapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModAdventuremapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModAdventuremapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
