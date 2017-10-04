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

const appRoutes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'statistics', component: StatisticsComponent },
  { path: 'head', component: HeadComponent },
  { path: 'assignment', component: AssignmentComponent },
  { path: 'user', component: UserComponent }
];


@NgModule({
  declarations: [
    AppComponent,
    AssignmentComponent,
    AppComponent,
    StatisticsComponent,
    HeadComponent,
    LoginComponent,
    UserComponent,
    MainComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    CodemirrorModule,
    AlertModule.forRoot(),
    ButtonsModule.forRoot(),
    BsDropdownModule.forRoot(),
    CollapseModule.forRoot(),
    RouterModule.forRoot(
      appRoutes
    )
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
