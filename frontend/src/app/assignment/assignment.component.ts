import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import 'codemirror/mode/go/go';
import { BackendService, ObjectID } from '../services/backend.service';
import { AssignmentService } from '../services/assignment.service';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { HeadService } from '../services/head.service';
import { CourseService } from '../services/course.service';
import { UserService } from '../services/user.service';


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
  userid: string;
  feedback: string[];

  constructor(private backendService: BackendService,
              private assignmentService: AssignmentService,
              private headService: HeadService,
              private route: ActivatedRoute,
              private userService: UserService) {
    this.headService.stateChange.subscribe(sidebarState => {
        this.sidebarState = sidebarState;
    });
    this.route.params.subscribe( params => this.assignment = this.assignmentService.GetAssignment(params['course'], params['assignment']));
  }

  ngOnInit() {
    this.sidebarState = this.headService.getCurrentState();
    this.userid = this.userService.userInfo.id;
    this.languages = this.assignment['languages'];
    this.language = this.languages[0];
    this.themes = ['eclipse', 'monokai'];
    this.theme = 'eclipse'; // default theme for now, could be saved on backend
    this.content = '';
    this.status = 'Not Completed'; // hardcoded for now, endpoint to backend needed
    this.progress = { current: 0}; // this.assignmentService.progress; what even is this
  }

  submitCode() {
    const user_id = new ObjectID(this.userid);
    const assignment_id = this.assignment['id'];
    const course_id = new ObjectID(this.assignment['course_id']);
    this.backendService.submitAssignment(user_id, course_id, assignment_id, this.language, this.content).then(data => {
      this.HandleResponse(data);
    });
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
    value = JSON.parse(value);
    const results = value['results'];

    let passTests = true;
    // Check the IO tests
    for (let i = 0; i < results['io'].length; i++) {
      const test = results['io'][i];
      const testindex = i + 1;
      if (!test['ok']) {
        const failure = (test['stderr'] === '') ? 'Wrong output' : test['stderr'];
        feedback.push('Test ' + testindex + ' failure: ' + failure);
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

    if (value['passed']) {
      this.status = 'Completed';
    } else {
      this.status = 'Not Completed';
    }

  }

  setLanguage(language: string) {
    if (language.substr(0, 6) === 'python') {
      return 'python';
    } else if (language === 'C#') {
      return 'csharp';
    } else {
      return this.language;
    }
  }

}
