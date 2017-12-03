import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ToastModule, ToastOptions } from 'ng2-toastr/ng2-toastr';
import { CustomOptions } from './toastr-options';

// NG-BOOTSTRAP
import { AlertModule } from 'ngx-bootstrap';
import { ButtonsModule } from 'ngx-bootstrap';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ModalModule } from 'ngx-bootstrap';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { AngularFontAwesomeModule } from 'angular-font-awesome/angular-font-awesome';

import { AceEditorModule } from 'ng2-ace-editor';
import { MarkdownModule } from 'angular2-markdown';

import { AppComponent } from './app.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { RouterModule, Routes} from '@angular/router';
import { LoginComponent } from './login/login.component';
import { LoginHelperComponent} from './login-helper/login-helper.component';
import { HeadComponent } from './head/head.component';
import { UserComponent } from './user/user.component';
import { AssignmentComponent } from './assignment/assignment.component';
import { MainComponent } from './main/main.component';
import { CoursesComponent } from './courses/courses.component';
import { CreateassignmentComponent } from './createassignment/createassignment.component';

import { BackendService } from './services/backend.service';

// Animation
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HeadService } from './services/head.service';
import { UserService } from './services/user.service';
import { CourseService} from './services/course.service';
import { AssignmentService } from './services/assignment.service';
import { ToastService } from './services/toast.service';

// AUTH
import {AuthGuardService as AuthGuard} from './services/Auth/Auth-Guard.service';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {NoopInterceptor} from './Interceptors/Auth.interceptor';
import {EmptyResponseBodyErrorInterceptor} from './Interceptors/Backend.interceptor';

import {AuthService} from './services/Auth/Auth.service';
import {Http, HttpModule} from '@angular/http';
import { ScrollerDirective } from './scroller.directive';
import { AssignmentGroupComponent } from './assignment-group/assignment-group.component';
import { CreatecourseComponent } from './createcourse/createcourse.component';
import { UserPanelsComponent } from './user-panels/user-panels.component';

// Modular game components
import { GameelementComponent } from './gameelement/gameelement.component';
import { ModLeaderboardComponent } from './mod-leaderboard/mod-leaderboard.component';
import { ModProgressbarComponent } from './mod-progressbar/mod-progressbar.component';
import { ModAdventuremapComponent } from './mod-adventuremap/mod-adventuremap.component';
import { ModAdventuremapLargeComponent } from './mod-adventuremap/mod-adventuremap-large.component';
import { ModAdventuremapEditorComponent } from './mod-adventuremap/mod-adventuremap-editor.component';
import { ModBadgesComponent } from './mod-badges/mod-badges.component';
import { ModBadgesSingleComponent } from './mod-badges/mod-badges-single.component';


const appRoutes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'auth', component: LoginHelperComponent },
  { path: 'courses/:course/assignment/:assignment', component: AssignmentComponent, canActivate: [AuthGuard]},
  { path: 'user', component: UserComponent, canActivate: [AuthGuard]},
  { path: 'courses/:course', component: CoursesComponent, canActivate: [AuthGuard]},
  { path: 'createAssignmentTest', component: CreateassignmentComponent, canActivate: [AuthGuard]},
  { path: 'courses/:course/createNewAssignment', component: CreateassignmentComponent, canActivate: [AuthGuard]},
  { path: 'user/createCourse', component: CreatecourseComponent, canActivate: [AuthGuard]},
  { path: 'user/updateCourse/:course', component: CreatecourseComponent, canActivate: [AuthGuard]}
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
    ScrollerDirective,
    AssignmentGroupComponent,
    CreatecourseComponent,
    UserPanelsComponent,
    GameelementComponent,
    ModLeaderboardComponent,
    ModProgressbarComponent,
    ModBadgesComponent,
    ModBadgesSingleComponent,
    ModAdventuremapComponent,
    ModAdventuremapEditorComponent,
    ModAdventuremapLargeComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    AceEditorModule,
    MarkdownModule.forRoot(),
    AlertModule.forRoot(),
    ButtonsModule.forRoot(),
    BsDropdownModule.forRoot(),
    CollapseModule.forRoot(),
    TabsModule.forRoot(),
    TooltipModule.forRoot(),
    HttpClientModule,
    HttpModule,
    AngularFontAwesomeModule,
    ModalModule.forRoot(),
    RouterModule.forRoot(
      appRoutes
    ),
    ToastModule.forRoot()
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: NoopInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: EmptyResponseBodyErrorInterceptor,
      multi: true,
    },
    HeadService, // the state variable that head provides
    BackendService,
    UserService,
    CourseService,
    AssignmentService,
    ToastService,
    {
      provide: ToastOptions,
      useClass: CustomOptions,
    },
    // AUTHS
    AuthGuard,
    AuthService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
