import {Component, forwardRef, OnInit, Inject} from '@angular/core';
import { Router } from '@angular/router';
import { HeadService } from '../services/head.service';
import {AppComponent} from '../app.component';
import {UserService} from '../services/user.service';
import {AuthService} from '../services/Auth/Auth.service';

@Component({
  selector: 'app-head',
  templateUrl: './head.component.html',
  styleUrls: ['./head.component.css'],
})

export class HeadComponent implements OnInit {
  sidebarState: any; // state of the sidebar
  user: any;
  stateDropDown: boolean;

  constructor(@Inject(forwardRef(() => AppComponent)) private appComponent: AppComponent, private headService: HeadService,
              private userService: UserService, private auth: AuthService, private router: Router) {
  }

  toggleState() { // send to the sidebar in app component that it should toggle state
    this.sidebarState = this.sidebarState === 'active' ? 'inactive' : 'active';
    this.headService.setState(this.sidebarState); // send to the service that the state is updated
  }

  logout() { // this is used when log out so the sidebar doesn't stay active & to log out
    this.headService.setState('inactive');
    this.auth.logout();
    this.router.navigate(['/']);
  }

  ngOnInit() {
    this.stateDropDown = false;
    this.user = this.userService.userInfo;
    this.sidebarState = this.appComponent.sidebarState;
    this.headService.setState(this.sidebarState);
   }
}

