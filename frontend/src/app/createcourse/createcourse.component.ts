import {Component, OnInit, ViewChild, TemplateRef} from '@angular/core';
import { Location } from '@angular/common';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { HeadService } from '../services/head.service';
import {FormGroup, FormControl, Validators } from '@angular/forms';
import {BackendService} from '../services/backend.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/modal-options.class';
import { ActivatedRoute, Router } from '@angular/router';
import {CourseService} from '../services/course.service';
import { ToastService } from '../services/toast.service';

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
  course: any;
  // Different descriptions for tooltip
  badgesDesc = 'The student will receive badges for completing assignments or tasks.';
  progDesc = 'The student will be able to see progress depending on amount of completed assignments.';
  advmapDesc = 'The student will have an adventure map there different paths can be unlocked by completing assignments or tasks.'; //
  leadbDesc = 'The course will have a leaderboard that shows scores for each students in the course.';
  publicDesc = 'Make the course public so students can see, request access or join the course.';
  autojoinDesc = 'Students will be able to join the course freely so no request is required.';

  @ViewChild('courseCreated') courseModal: TemplateRef<any>; // Temporary solution, modal will pop up after course is created

  constructor(private headService: HeadService, private backendService: BackendService, private modalService: BsModalService,
              private route: ActivatedRoute, private courseService: CourseService, private toastService: ToastService,
              private _location: Location, private router: Router) {
    this.headService.stateChange.subscribe(sidebarState => { // subscribe to the state value head provides
      this.sidebarState = sidebarState;
    });

    this.route.params.subscribe( (params: any) => {
      // Grab the current course
      this.course = this.courseService.GetCourse(params.course);
    });
  }

  goBack() {
    this._location.back();
  }

  // for the hypertext
  onChange(c) {
    this.content = c;
  }

  checkCourseCode(code) { // might be used to check if course-code already exist
    if (code.length > 5) { // start search first when entire code is written
      this.backendService.getSearch(code)
        .then(
          result => {
            console.log(result);
            // displayResult(result['courses']); // array of possible results
          })
        .catch(err => console.error('Something went wrong with getSearch', err));
    }
  }

  findStudent() { // for invite
    const search = this.form.value.search;
    // check so length is at least 3
    if (search.length > 2) {
      this.backendService.getSearch(search)
        .then(
          result => {
            console.log(result);
            this.students = result['users'];
            // displayStudents(result['users']); // array of possible results
          })
        .catch(err => console.error('Something went wrong with getSearch', err));
    }
  }

  submitCourse() { // Create a new course or update current course with some parameters from the page
    if (this.form.invalid || this.content === '') { // first check so form is valid and content isn't empty.
      // Since desc can't be in the form-group defined own required message
      this.errorMessage = '* Please fill in all required fields';
      window.scrollTo({left: 0, top: 0, behavior: 'smooth'}); // go to top of page smoothly if error occur
    } else {
      this.errorMessage = '';
      const enabled_features: Object = { // get values from form for badges, progressbar, leaderboard, adventuremap
        'progressbar': this.form.value.progress,
        'badges': this.form.value.badges,
        'leaderboard': this.form.value.leaderboard,
        'adventuremap': this.form.value.map
      };
      if (!this.course) {
        this.createCourse(enabled_features);
      } else {
        this.updateCourse(enabled_features);
      }
    }
  }
  createCourse(enabled_features: Object) {
    this.backendService.postNewCourse(this.form.value.name, this.content,
      !this.form.value.nothidden, this.form.value.code, enabled_features, this.form.value.autojoin)
      .then( (response: any) => {
        this.toastService.success('Course created!');
        // Handle response from backend
        // newTeachCourse(id, name, code, course_desc, hidden, en_feat, students, teachers, autojoin, assigs) { }
        const courseId = response._id;
        console.log('Got back id:', courseId);
        // this.form = createSearchForm(); // for invites, not yet implemented
        if (courseId) { // else undefined
          this.courseService.addTeacherCourse(response);
          this.router.navigate(['/user']);
        }
        // this.openModal(this.courseModal);
      })
      .catch(err => console.error('Create course failed', err));
  }

  updateCourse(enabled_features: Object) {
    this.backendService.updateCourse(this.course.id, this.form.value.name, this.content,
      !this.form.value.nothidden, this.form.value.code, enabled_features, this.form.value.autojoin)
      .then((response: any) => { // when put, should get back empty object
        location.reload();
        this.toastService.success('Course updated!');
        console.log(response);
      })
      .catch(err => console.error('Update course failed:', err));
  }

  openModal(modal) {
    this.modalRef = this.modalService.show(modal);
  }
  invite(id) {
    console.log(id);
  }
  setForm() {
    this.form = createCourseForm();
    this.form.setValue({
      name: this.course ? this.course.name : '',
      code: this.course ? this.course.code : '',
      progress: this.course ? this.course.enabled_features.progressbar : false,
      badges: this.course ? this.course.enabled_features.badges : false,
      map: this.course ? this.course.enabled_features.adventuremap : false,
      leaderboard: this.course ? this.course.enabled_features.leaderboard : false,
      nothidden: this.course ? !this.course.hidden : false, // if it's not hidden it is public
      autojoin: this.course ? this.course.autojoin : false,
    });
  }
  ngOnInit() {
    this.sidebarState = this.headService.getCurrentState();
    this.setForm();
    this.content = this.course ? this.course.course_info : '## Header';
    this.errorMessage = '';
    this.students = []; // should be empty list
  }
}

function createSearchForm() { // for invites
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
    nothidden: new FormControl(false),
    autojoin: new FormControl(false),
  });
}

function displayResult(result) {
  for (let i = 0; i < result.length; i++) {
    console.log('Found:', result[i]);
  }
}
