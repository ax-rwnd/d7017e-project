import {Component, forwardRef, OnInit, Inject, HostListener, ViewChild} from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { HeadService } from '../services/head.service';
import {AppComponent} from '../app.component';
import {UserService} from '../services/user.service';

@Component({
  selector: 'app-head',
  templateUrl: './head.component.html',
  styleUrls: ['./head.component.css'],
  animations: [
    trigger('userOption', [
      state('false', style({display: 'none', border: 'none', overflow: 'hidden', opacity: '0'})),
      state('true', style({display: 'block', opacity: '1'})),
      transition('0 => 1', animate('80ms 200ms ease-in')),
      transition('1 => 0', animate('150ms ease-out'))
    ]),
    trigger('userDropBox', [
      state('false', style({display: 'none', height: '0'})),
      state('true', style({display: 'block', height: 'auto'})),
      transition('0 => 1', animate('200ms ease-in')),
      transition('1 => 0', animate('200ms ease-out'))
    ])
  ]
})

export class HeadComponent implements OnInit {
  sidebarState;
  user: any;
  stateDropDown: boolean;

  constructor(@Inject(forwardRef(() => AppComponent)) private appComponent: AppComponent, private headService: HeadService,
              private userService: UserService) {
    // shouldn't be inactive, should only get state from app component
  }

  toggleState($event) { // send to the sidebar in app component that it should toggle state
    $event.preventDefault();
    $event.stopPropagation();
    this.sidebarState = this.sidebarState === 'active' ? 'inactive' : 'active';
    this.headService.setState(this.sidebarState);
  }

  @HostListener('document:click', ['$event'])
  outsideDropDownClick($event) {
    this.stateDropDown = false;
  }

  toggleUserDropDown($event) {
    $event.preventDefault();
    $event.stopPropagation();
    this.stateDropDown = !this.stateDropDown;
  }

  isDropDown() {
    return this.stateDropDown;
  }

  resetSidebar() {
    this.headService.setState('inactive');
  }

  ngOnInit() {
    this.stateDropDown = false;
    this.user = this.userService.userInfo;
    this.sidebarState = this.appComponent.sidebarState;
    this.headService.setState(this.sidebarState);
   }
}

