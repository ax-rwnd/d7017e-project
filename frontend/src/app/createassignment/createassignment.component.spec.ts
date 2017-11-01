import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AceEditorModule } from 'ng2-ace-editor';

import { FormsModule } from '@angular/forms';
import { BackendService } from '../services/backend.service';
import { RewardService} from '../services/reward.service';
import { HeadService } from '../services/head.service';
import { CourseService } from '../services/course.service';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { AppComponent } from '../app.component';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { CreateassignmentComponent } from './createassignment.component';

describe('CreateassignmentComponent', () => {
  let component: CreateassignmentComponent;
  let fixture: ComponentFixture<CreateassignmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateassignmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateassignmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
