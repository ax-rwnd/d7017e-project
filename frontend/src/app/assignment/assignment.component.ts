import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import 'codemirror/mode/go/go';
import { BackendService } from '../services/backend.service';
import { AssignmentService } from '../services/assignment.service';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { HeadService } from '../services/head.service';
import { CourseService } from '../services/course.service';


@Component({
  selector: 'app-assignment',
  templateUrl: './assignment.component.html',
  styleUrls: ['./assignment.component.css'],
  animations: [
    trigger('content', [
      state('inactive', style({marginLeft: '0%', width: '100%'})),
      state('active', style({marginLeft: '15%', width: '85%'})),
      transition('inactive => active', animate('300ms')),
      transition('active => inactive', animate('300ms'))
    ])
  ]
})
export class AssignmentComponent implements OnInit {
  assignment: any;
  course: string;
  content: string;
  progress: any;
  themes: string[];
  theme: string;
  languages: string[];
  language: string;
  status: string;
  sidebarState; // state of sidebar
  feedback: string[];

  constructor(private backendService: BackendService,
              private assignmentService: AssignmentService,
              private headService: HeadService,
              private route: ActivatedRoute) {
    this.headService.stateChange.subscribe(sidebarState => {
        this.sidebarState = sidebarState;
    });
    this.route.params.subscribe( params => this.assignment = this.assignmentService.GetAssignment(params['course'], params['assignment']));
  }

  ngOnInit() {
    this.sidebarState = this.headService.getCurrentState();
    // TODO: reimplement when new code arrives in backend
    // this.backendService.getAssignment(courseId, assignmentId).then(data => {
    //   this.assignment = data;
    // });
    this.course = 'D0009E - Introduktion till programmering'; // endpoint needed, not used anymore
    //this.assignment = { name: 'Assignment1', description: 'this is the first assignment', languages: ['python', 'javascript']}; // temp
    this.languages = ['python', 'javascript'];
    this.language = this.languages[0];
    this.themes = ['eclipse', 'monokai'];
    this.theme = 'eclipse'; // default theme for now, could be saved on backend
    this.content = '';
    this.status = 'Not Completed'; // hardcoded for now, endpoint to backend needed
    this.progress = { current: 0}; // this.assignmentService.progress; what even is this
    console.log('assignment', this.assignment);
  }

  // SubmitCode should update status/progress.
  // Does submitAssignment give me that status or should i fetch the assignment again?
  submitCode() {
    // TODO: reimplement when new code arrives in backend
    // this.backendService.submitAssignment(assignment['id], this.language, this.content).then(data => {
    //   this.handleResponse(data);
    // });
  }

  setTheme(th) {
    this.theme = th;
  }

  setMode(th) {
    this.language = th;
  }

  onChange(c) {
    this.content = c;
  }

  setFeedback(fb) {
    this.feedback = fb;
  }

  // Update the feedback array
  HandleResponse(value) {
    const feedback = [];
    const results = value['results'];

    let passTests = true;
    // Check the IO tests
    for (let i = 0; i < results['io'].length; i++) {
      const test = results['io'][i];
      const testindex = i + 1;
      if (!test['ok']) {
        feedback.push('Test ' + testindex + ' failure: ' + test['stderr']);
        passTests = false;
      } else {
        feedback.push('Test ' + testindex + ' ok');
      }
    }
    if (passTests) {
      feedback.push('All I/O tests passed');
    }

    // Check lint test
    if (results['lint'] !== '') {
      feedback.push(results['lint']);
      passTests = false;
    }

    // Check prepare/compile step
    if (results['prepare'] !== '') {
      feedback.push(results['prepare']);
      passTests = false;
    }
    this.setFeedback(feedback);
  }

}
