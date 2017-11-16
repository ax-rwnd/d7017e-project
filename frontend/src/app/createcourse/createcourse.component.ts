import { Component, OnInit } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { HeadService } from '../services/head.service';
import {FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import {CourseService} from '../services/course.service';

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
  window: Window;
  sidebarState: any;
  content: string;
  body: any;
  form: FormGroup;
  defaultForm = {
    name: ['', [Validators.required]],
    code: ['', ],
    progress: [false, []],
    map: [false, []],
    badges: [false, []],
    leaderboard: [false, []],
    hidden: ['', ]
  };
  errorMessage: string;

  constructor(private headService: HeadService, private courseService: CourseService, private fb: FormBuilder) {
    this.headService.stateChange.subscribe(sidebarState => { this.sidebarState = sidebarState; }); // subscribe to the state value head provides
  }

  onChange(c) {
    this.content = c;
  }

  submitCourse() { // will fix it so it looks better
    const name = this.form.value.name;
    const code = this.form.value.code;
    const desc = this.content;
    const prog = !!this.form.value.progress; // false if empty otherwise true
    const badg = !!this.form.value.badges;
    const map  = !!this.form.value.map;
    const lbrd = !!this.form.value.leaderboard;
    const hidd = !this.form.value.hidden; // true if empty, false if not
    if ( name === '' || desc === '' ) {
      this.errorMessage = '* Please fill in all required fields';
      window.scrollTo({ left: 0, top: 0, behavior: 'smooth' }); // go to top of page smoothly if error occur
    } else {
      this.body = {'name': name, 'desc': desc, 'hidden': hidd, 'course_code': code };
      console.log('Body created:', this.body);
    }
  }

  ngOnInit() {
    this.sidebarState = this.headService.getCurrentState();
    this.form = this.fb.group(this.defaultForm);
    this.content = '';
    this.body = '{}';
    this.errorMessage = '';
  }

}
