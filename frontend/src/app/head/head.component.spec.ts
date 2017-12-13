import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from '../app.component';
import { HeadService } from '../services/head.service';
import { HeadComponent } from './head.component';
import { CourseService } from '../services/course.service';
import { RouterTestingModule } from '@angular/router/testing';

describe('HeadComponent', () => {
  let component: HeadComponent;
  let fixture: ComponentFixture<HeadComponent>;
  let service: HeadService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeadComponent ],
      providers: [ AppComponent, HeadService, CourseService ],
      imports: [RouterTestingModule],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should check toggle function', () => {
    const tg = component.sidebarState;
    component.toggleState();
    expect(tg).toBe('active');
  });
});
