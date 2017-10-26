import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HeadComponent } from '../head/head.component';
import { CodemirrorModule } from 'ng2-codemirror';
import { FormsModule } from '@angular/forms';
import { BackendService } from '../services/backend.service';
import { RewardService} from '../services/reward.service';
import { HeadService } from '../services/head.service';
import { CourseService } from '../services/course.service';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { AppComponent } from '../app.component';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AssignmentComponent } from './assignment.component';

describe('AssignmentComponent', () => {
  let component: AssignmentComponent;
  let fixture: ComponentFixture<AssignmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssignmentComponent, HeadComponent ],
      providers: [ BackendService, HeadService, RewardService, HttpClient, HttpHandler, AppComponent, CourseService ],
      imports: [ CodemirrorModule, FormsModule, RouterTestingModule, BrowserAnimationsModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
