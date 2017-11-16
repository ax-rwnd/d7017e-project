import { Component, OnInit } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { HeadService } from '../services/head.service';
import {FormGroup, FormControl, Validators } from '@angular/forms';
import {BackendService} from '../services/backend.service';

@Component({
  selector: 'app-createcourse',
  templateUrl: './createcourse.component.html',
  styleUrls: ['./createcourse.component.css'],
  animations: [
    trigger('content', [
      state('inactive', style({marginLeft: '0%', width: '100%'})),
      state('active', style({marginLeft: '15%', width: '85%'})),
      transition('inactive => active', animate('300ms')),
      transition('active => inactive', animate('300ms'))
    ])
  ]
})

export class CreatecourseComponent implements OnInit {
  sidebarState: any;
  content: string;
  body: any;
  form: FormGroup;
  errorMessage: string;

  constructor(private headService: HeadService, private backendService: BackendService) {
    this.headService.stateChange.subscribe(sidebarState => { this.sidebarState = sidebarState; }); // subscribe to the state value head provides
  }

  onChange(c) {
    this.content = c;
  }

  submitCourse() {
    // First check so no required fields are empty
    if ( this.form.value.name === '' || this.content === '' ) { // Since desc can't be in the form-group defined own required message
      this.errorMessage = '* Please fill in all required fields';
      window.scrollTo({ left: 0, top: 0, behavior: 'smooth' }); // go to top of page smoothly if error occur
    } else {
      const enabled_features = {'badges': this.form.value.badges, 'progress': this.form.value.progress};
      const courseID = this.backendService.postNewCourse(this.form.value.name, this.content, !this.form.value.hidden, this.form.value.code, enabled_features);
      console.log('Post course, got back:', courseID);
    }
  }

  ngOnInit() {
    this.sidebarState = this.headService.getCurrentState();
    this.form = createForm();
    this.content = '';
    this.body = '{}';
    this.errorMessage = '';
  }
}

function createForm() {
  return new FormGroup({
    name: new FormControl('', Validators.required),
    code: new FormControl(''),
    progress: new FormControl(false),
    badges: new FormControl(false),
    map: new FormControl({value: false, disabled: true}), // temporary disabled, not implemented in database yet?
    leaderboard: new FormControl({value: false, disabled: true}), // temporary disabled, not implemented in database yet?
    hidden: new FormControl(true), // will by default be set true
  });
}
