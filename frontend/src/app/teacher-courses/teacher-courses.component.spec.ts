import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherCoursesComponent } from './teacher-courses.component';

describe('TeacherCoursesComponent', () => {
  let component: TeacherCoursesComponent;
  let fixture: ComponentFixture<TeacherCoursesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeacherCoursesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeacherCoursesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
