import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModBadgesComponent } from './mod-badges.component';

describe('ModBadgesComponent', () => {
  let component: ModBadgesComponent;
  let fixture: ComponentFixture<ModBadgesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModBadgesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModBadgesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
