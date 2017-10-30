import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HeadComponent } from '../head/head.component';
import { HeadService } from '../services/head.service';
import { StatisticsComponent } from '../statistics/statistics.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { UserService } from '../services/user.service';
import { BsModalService } from 'ngx-bootstrap';
import { ComponentLoaderFactory } from 'ngx-bootstrap';
import { PositioningService } from 'ngx-bootstrap';
import { CourseService } from '../services/course.service';
import { AppComponent } from '../app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { UserComponent } from './user.component';

describe('UserComponent', () => {
  let component: UserComponent;
  let fixture: ComponentFixture<UserComponent>;
  class MockCourseService {}

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserComponent, HeadComponent, StatisticsComponent ],
      providers: [ HeadService, UserService, BsModalService, ComponentLoaderFactory, PositioningService,
        {provide: CourseService, useClass: MockCourseService}, AppComponent ],
      imports: [ FormsModule, ReactiveFormsModule, RouterTestingModule, BrowserAnimationsModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should make statistics the opposite of what it is', () => {
    const st = component.statistics;
    component.toggleStatistics();
    expect(component.statistics).toBe(!st);
  });

  it('should create a course without gamification elements', () => {
    component.form.controls['name'].setValue('name');
    component.form.controls['code'].setValue('code');
    component.form.controls['course_info'].setValue('course_info');
    // mock service, create course and see that the correct course is sent and stored
  });
});
