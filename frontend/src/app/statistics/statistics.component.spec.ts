import { async, ComponentFixture, TestBed } from '@angular/core/testing';
<<<<<<< HEAD
import { Router, RouterOutlet } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
=======
import { RouterTestingModule } from '@angular/router/testing';
import { CourseService } from '../services/course.service';
>>>>>>> 8901c285f2c3f06a82bc98b1df82606c6ed84191

import { StatisticsComponent } from './statistics.component';

describe('StatisticsComponent', () => {
  let component: StatisticsComponent;
  let fixture: ComponentFixture<StatisticsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StatisticsComponent ],
<<<<<<< HEAD
      imports: [
      RouterTestingModule.withRoutes([])]
=======
      providers: [ CourseService ],
      imports: [ RouterTestingModule ]
>>>>>>> 8901c285f2c3f06a82bc98b1df82606c6ed84191
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(StatisticsComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
});
