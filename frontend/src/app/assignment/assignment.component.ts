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
  tests: any;
  testStrings: any;

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
    // this.getTests();
    // Use getTests as soon as backend routes are working
    this.tests = [
        {
        '_id': '59e4cb34d679e102ff66b865',
        'stdin': '',
        'stdout': 'hello world\n',
        'args': [],
        '__v': 0},
        {
          '_id': '59e4cb34d679e102ff66b865',
          'stdin': 'test',
          'stdout': 'hello world again\n',
          'args': [],
          '__v': 1},
      ];
      this.testStrings = this.formatTests(this.tests);
  }

  // Submit code to backend for testing
  submitCode() {
    const user_id = new ObjectID(this.userid);
    const assignment_id = new ObjectID(this.assignment['id']);
    const course_id = new ObjectID(this.assignment['course_id']);
    this.backendService.submitAssignment(user_id, course_id, assignment_id, this.language, this.content).then(data => {
      this.HandleResponse(data);
    });
  }

  getTests() {
    const assignment_id = new ObjectID(this.assignment['course_id']);
    const course_id = new ObjectID(this.assignment['course_id']);
    this.backendService.getCourseAssignmentTests(course_id, assignment_id).then(data => {
      this.tests = data;
    });
  }

  formatTests(tests) {
    let formattedTests = [];
    for (let test of tests) {
      formattedTests.push(this.formatTest(test));
    }
    return formattedTests;
  }

  // Takes a test and returns a markdown string for displaying the test
  formatTest(test) {
    const testMarkdown = '```text\nstdin: ' + test['stdin'] + '\nargs: ' + test['args'] + '\nstdout: ' + test['stdout'] + '```';
    return testMarkdown;
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

  // Handle the response from a code submission. Update the feedback div and update the course progress
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
      // TODO update course progress
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
