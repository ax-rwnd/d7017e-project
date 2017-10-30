import {async, ComponentFixture, inject, TestBed} from '@angular/core/testing';
import { HeadComponent } from '../head/head.component';
import { HeadService } from '../services/head.service';
import { CourseService } from '../services/course.service';
import { CoursesComponent } from './courses.component';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from '../app.component';

/*test routeroutlet*/

describe('CoursesComponent', () => {
  let component: CoursesComponent;
  let fixture: ComponentFixture<CoursesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoursesComponent, HeadComponent ],
      providers: [ HeadService, CourseService, AppComponent ],
      imports: [ RouterTestingModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoursesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
});
