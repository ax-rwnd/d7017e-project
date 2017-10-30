import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';
<<<<<<< HEAD
import { Router, RouterOutlet } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
=======
import { RouterTestingModule } from '@angular/router/testing';
import { HeadService } from './services/head.service';
import { CourseService } from './services/course.service';
>>>>>>> 8901c285f2c3f06a82bc98b1df82606c6ed84191

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
      ],
<<<<<<< HEAD
      imports: [
      RouterTestingModule.withRoutes([])]
=======
      providers: [HeadService, CourseService],
      imports: [RouterTestingModule]
>>>>>>> 8901c285f2c3f06a82bc98b1df82606c6ed84191
    }).compileComponents();
    //fixture = TestBed.creatComponent(AppComponent);
  }));
<<<<<<< HEAD
  it('1+1=2', async() => {
    //service = new AppComponent(new HeadService)
    expect(1+1).toBe(2);
  })
=======
  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
>>>>>>> 8901c285f2c3f06a82bc98b1df82606c6ed84191
});
