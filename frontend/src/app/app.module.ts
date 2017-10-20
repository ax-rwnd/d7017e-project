import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

// NG-BOOTSTRAP
import { AlertModule } from 'ngx-bootstrap';
import { ButtonsModule } from 'ngx-bootstrap';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { CollapseModule } from 'ngx-bootstrap/collapse';

import { CodemirrorModule } from 'ng2-codemirror';

import { AppComponent } from './app.component';
import { StatisticsComponent } from './statistics/statistics.component';
import {RouterModule, Routes} from '@angular/router';
import { LoginComponent } from './login/login.component';
import {HeadComponent} from './head/head.component';
import {UserComponent} from './user/user.component';
import { AssignmentComponent } from './assignment/assignment.component';
import { MainComponent } from './main/main.component';
import { CoursesComponent } from './courses/courses.component';

import {BackendService} from './services/backend.service';
import {RewardService} from './services/reward.service';

import {HttpClientModule} from '@angular/common/http';

// Animation
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HeadService } from './services/head.service';
import {UserService} from './services/user.service';
import {CourseService} from './services/course.service';

const appRoutes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'courses/:course/assignment', component: AssignmentComponent },
  { path: 'user', component: UserComponent },
  { path: 'courses/:course', component: CoursesComponent }
];


@NgModule({
  declarations: [
    AppComponent,
    AssignmentComponent,
    AppComponent,
    CoursesComponent,
    StatisticsComponent,
    HeadComponent,
    LoginComponent,
    UserComponent,
    MainComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    BrowserAnimationsModule,
    CodemirrorModule,
    AlertModule.forRoot(),
    ButtonsModule.forRoot(),
    BsDropdownModule.forRoot(),
    CollapseModule.forRoot(),
    HttpClientModule,
    RouterModule.forRoot(
      appRoutes
    )
  ],
  providers: [
    HeadService, // the state variable that head provides
    BackendService,
    RewardService,
    UserService,
    CourseService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
