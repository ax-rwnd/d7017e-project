import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModBadgesTeacherComponent } from './mod-badges-teacher.component';

describe('ModBadgesTeacherComponent', () => {
  let component: ModBadgesTeacherComponent;
  let fixture: ComponentFixture<ModBadgesTeacherComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModBadgesTeacherComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModBadgesTeacherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
