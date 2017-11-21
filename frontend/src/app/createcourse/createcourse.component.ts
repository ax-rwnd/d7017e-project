import {Component, OnInit, ViewChild, TemplateRef} from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { HeadService } from '../services/head.service';
import {FormGroup, FormControl, Validators } from '@angular/forms';
import {BackendService} from '../services/backend.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/modal-options.class';

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
  form: FormGroup;
  errorMessage: string;
  name: any;
  students: any[];
  modalRef: BsModalRef;
  badgesDesc = 'The student will receive badges for completing assignments or tasks.';
  progDesc = 'The student will be able to see progress depending on amount of completed assignments.';
  advmapDesc = 'The student will have an adventure map there different paths can be unlocked by completing assignments or tasks.'; //
  leadbDesc = 'The course will have a leaderboard that shows scores for each students in the course.';
  publicDesc = 'Make the course public on create. Can later be changed.';
  autojoinDesc = 'Students will be able to join the course freely.';

  @ViewChild('inviteStudentModal') inviteModal: TemplateRef<any>;

  constructor(private headService: HeadService, private backendService: BackendService, private modalService: BsModalService) {
    this.headService.stateChange.subscribe(sidebarState => { this.sidebarState = sidebarState; }); // subscribe to the state value head provides
  }
  // for the hypertext
  onChange(c) {
    this.content = c;
  }

  findCourseCode(event: KeyboardEvent) { // might be used to check if course-code already exist
    // if (e.which <= 90 && e.which >= 48)
    // a/A : 65, z/Z: 90, å/Å:221, ä/Ä: 222, ö/Ö:192
    //  || (event.which === 90 || event.which === 221 || event.which === 192
    if ((<HTMLInputElement>event.target).value.length > 5 && (event.which >= 65 && event.which <= 90)) { // start search first when entire code is written
      this.backendService.getSearch((<HTMLInputElement>event.target).value)
        .then(
          result => {
            console.log(result);
            displayStudents(result['courses']); // array of possible results
          })
        .catch(err => console.error('Something went wrong with getSearch', err));
    }
  }

  findStudent() {
    const search = this.form.value.search;
    // check so length is at least 3
    if (search.length > 2) {
      this.backendService.getSearch(search)
        .then(
          result => {
            console.log(result);
            this.students = result['users'];
            //displayStudents(result['users']); // array of possible results
          })
        .catch(err => console.error('Something went wrong with getSearch', err));
    }
  }

  submitCourse() { // checka course code
    // First check so no required fields are empty
    if ( this.form.value.name === '' || this.content === '' ) { // Since desc can't be in the form-group defined own required message
      this.errorMessage = '* Please fill in all required fields';
      window.scrollTo({ left: 0, top: 0, behavior: 'smooth' }); // go to top of page smoothly if error occur
    } else {
      this.errorMessage = '';
      // badges, progressbar, leaderboard, adventuremap
      const enabled_features: Object = {'progressbar': this.form.value.progress, 'badges': this.form.value.badges,
      'leaderboard': this.form.value.leaderboard, 'adventuremap': this.form.value.map};
      this.backendService.postNewCourse(this.form.value.name, this.content, !this.form.value.nothidden, this.form.value.code, enabled_features, this.form.value.autojoin)
        .then( response => {
          console.log('Course response:', response);
          console.log('Response type is:', typeof response);
          const resp: any = response;
          const body = JSON.parse(resp);
          const courseId = body['_id'];
          console.log('Got back id:', courseId);
          //this.form = createSearchForm(); // for invites, not yet implemented
          //this.openModal(this.inviteModal);
        })
        .catch(err => console.error('Something went wrong when creating the course:', err));
    }
  }
  openModal(modal) {
    this.modalRef = this.modalService.show(modal);
  }
  invite(id) {
    console.log(id);
  }
  ngOnInit() {
    this.sidebarState = this.headService.getCurrentState();
    this.form = createCourseForm();
    this.content = '';
    this.errorMessage = '';
    this.students = []; // should be empty list
  }
}

function createSearchForm() {
  return new FormGroup({
    search: new FormControl('')
  });
}

function createCourseForm() {
  return new FormGroup({
    name: new FormControl('', Validators.required),
    code: new FormControl(''),
    progress: new FormControl(false),
    badges: new FormControl(false),
    map: new FormControl(false),
    leaderboard: new FormControl(false),
    nothidden: new FormControl(false), // will by default be set to public
    autojoin: new FormControl(false),
  });
}

function displayStudents(result) {
  for (let i = 0; i < result.length; i++) {
    console.log('Found user:', result[i].username);
  }
}
