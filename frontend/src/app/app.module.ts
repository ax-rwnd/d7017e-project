import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

//NG-BOOTSTRAP
import { AlertModule } from 'ngx-bootstrap';
import { ButtonsModule } from 'ngx-bootstrap';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { CollapseModule } from 'ngx-bootstrap/collapse';

import { AppComponent } from './app.component';
import { StatisticsComponent } from './statistics/statistics.component';
import {RouterModule, Routes} from '@angular/router';
import { LoginComponent } from './login/login.component';
import {HeadComponent} from './head/head.component';
import {UserComponent} from './user/user.component';

const appRoutes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'statistics', component: StatisticsComponent },
  { path: 'head', component: HeadComponent },
  { path: 'user', component: UserComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    StatisticsComponent,
    HeadComponent,
    LoginComponent,
    UserComponent
  ],
  imports: [
    BrowserModule,
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
