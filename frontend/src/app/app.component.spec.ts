import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { Router, RouterOutlet } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HeadService } from './services/head.service';
import { CourseService } from './services/course.service';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
      ],
      imports: [RouterTestingModule]
    }).compileComponents();
    //fixture = TestBed.creatComponent(AppComponent);
  }));
  it('1+1=2', async() => {
    //service = new AppComponent(new HeadService)
    expect(1+1).toBe(2);
  })
  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
});
