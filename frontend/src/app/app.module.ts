import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// NG-BOOTSTRAP
import { AlertModule } from 'ngx-bootstrap';
import { ButtonsModule } from 'ngx-bootstrap';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { ModalModule } from 'ngx-bootstrap';
import { AngularFontAwesomeModule } from 'angular-font-awesome/angular-font-awesome';

import { CodemirrorModule } from 'ng2-codemirror';
import { AceEditorModule } from 'ng2-ace-editor';
import { MarkdownModule } from 'angular2-markdown';

import { AppComponent } from './app.component';
import { StatisticsComponent } from './statistics/statistics.component';
import {RouterModule, Routes} from '@angular/router';
import { LoginComponent } from './login/login.component';
import { LoginHelperComponent} from './login-helper/login-helper.component';
import {HeadComponent} from './head/head.component';
import {UserComponent} from './user/user.component';
import { AssignmentComponent } from './assignment/assignment.component';
import { MainComponent } from './main/main.component';
import { CoursesComponent } from './courses/courses.component';
import { CreateassignmentComponent } from './createassignment/createassignment.component';

import {BackendService} from './services/backend.service';
import {RewardService} from './services/reward.service';

// Animation
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HeadService } from './services/head.service';
import {UserService} from './services/user.service';
import {CourseService} from './services/course.service';
import { AssignmentService } from './services/assignment.service';

// AUTH
import {AuthGuardService as AuthGuard} from './services/Auth/Auth-Guard.service';
import {AuthGuardService as LoginGuard} from './services/Auth/Login-Guard.service';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {NoopInterceptor} from './Interceptors/Auth.interceptor';

import {AuthService} from './services/Auth/Auth.service';
import {Http, HttpModule} from '@angular/http';
import { AssignmentGroupComponent } from './assignment-group/assignment-group.component';


const appRoutes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'auth', component: LoginHelperComponent },
  { path: 'courses/:course/assignment', component: AssignmentComponent },
  { path: 'user', component: UserComponent, canActivate: [AuthGuard]},
  { path: 'courses/:course', component: CoursesComponent},
  { path: 'createAssignmentTest', component: CreateassignmentComponent}
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
    LoginHelperComponent,
    UserComponent,
    MainComponent,
    CreateassignmentComponent,
    AssignmentGroupComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    CodemirrorModule,
    AceEditorModule,
    MarkdownModule.forRoot(),
    AlertModule.forRoot(),
    ButtonsModule.forRoot(),
    BsDropdownModule.forRoot(),
    CollapseModule.forRoot(),
    HttpClientModule,
    HttpModule,
    AngularFontAwesomeModule,
    ModalModule.forRoot(),
    RouterModule.forRoot(
      appRoutes
    )
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: NoopInterceptor,
      multi: true,
    },
    HeadService, // the state variable that head provides
    BackendService,
    RewardService,
    UserService,
    CourseService,
    AssignmentService,
    // AUTHS
    AuthGuard,
    LoginGuard,
    AuthService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
