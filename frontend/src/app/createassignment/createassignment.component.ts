import { Component, OnInit, Input } from '@angular/core';
import { Location } from '@angular/common';
import {BackendService} from '../services/backend.service';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { HeadService } from '../services/head.service';
import {until} from 'selenium-webdriver';
import titleContains = until.titleContains;
import {FormBuilder, FormControl, FormGroup, NgForm, Validators} from '@angular/forms';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/modal-options.class';
import {ActivatedRoute, Router} from '@angular/router';
import { ToastService } from '../services/toast.service';
import {AssignmentService} from '../services/assignment.service';
import { Assignment } from '../../assignment';

@Component({
  selector: 'app-createassignment',
  templateUrl: './createassignment.component.html',
  styleUrls: ['./createassignment.component.css'],
  animations: [
    trigger('content', [
      state('inactive', style({marginLeft: '0%', width: '100%'})),
      state('active', style({marginLeft: '15%', width: '85%'})),
      transition('inactive => active', animate('300ms')),
      transition('active => inactive', animate('300ms'))
    ])
  ]
})
export class CreateassignmentComponent implements OnInit {
  errorMessage: string;
  assignmentName: string;
  supportedLanguages: any[];
  languages: string[];
  content: string;
  unitTests: any[];
  lintTest: boolean;
  courseId: string;
  markdownExampleCode: string;
  editT: any; // used for checking which test should be edited
  sidebarState; // state of sidebar
  modalRef: BsModalRef;
  testType: String;
  form: FormGroup;
  defaultForm = {
    type: String,
    testInfo: [],
    ioInput: String,
    ioOutput: String,
    python27: new FormControl(false),
    python3: new FormControl(false),
    java: new FormControl(false),
    c: new FormControl(false)
  };
  assignment: Assignment;
  oldUnitTests: any[];
  testArray: any[];
  python27: boolean;
  python3: boolean;
  java: boolean;
  c: boolean;

  constructor(private backendService: BackendService, private headService: HeadService,
              private modalService: BsModalService, private fb: FormBuilder, private route: ActivatedRoute,
              private toastService: ToastService, private _location: Location, private router: Router,
              private assignmentService: AssignmentService) {

    this.route.params.subscribe(params => {
      this.courseId = params['course'];
      this.assignment = this.assignmentService.getTeacherAssignment(this.courseId, params['assignment']);
      if (this.assignment) { // check if assignment if defined
        this.getAssignmentTests(params['course'], params['assignment']);
      }
    });
    this.headService.stateChange.subscribe(sidebarState => { this.sidebarState = sidebarState; });

  }

  ngOnInit() {
    this.sidebarState = this.headService.getCurrentState();
    this.markdownExampleCode = '### Headers\n```\n# h1\n## h2\n### h3\n#### h4\n##### h5\n###### h6\n\nAlternatively, for H1 and H2, an underline-ish style:\n\nAlt-H1\n======\n\nAlt-H2\n------\n```\n# h1\n## h2\n### h3\n#### h4\n##### h5\n###### h6\n\nAlt-H1\n======\n\nAlt-H2\n------\n\n### Emphasis\n```\nEmphasis, aka italics, with *asterisks* or _underscores_.\n\nStrong emphasis, aka bold, with **asterisks** or __underscores__.\n\nCombined emphasis with **asterisks and _underscores_**.\n\nStrikethrough uses two tildes. ~~Scratch this.~~\n```\n Emphasis, aka italics, with *asterisks* or _underscores_.\n\nStrong emphasis, aka bold, with **asterisks** or __underscores__.\n\nCombined emphasis with **asterisks and _underscores_**.\n\nStrikethrough uses two tildes. ~~Scratch this.~~\n### Lists\n```\n 1. First ordered list item\n 2. Another item\n\t* Unordered sub-list.\n 1. Actual numbers don\'t matter, just that it\'s a number\\n\t1. Ordered sub-list\n 4. And another item.\n\n* Unordered list can use asterisks\n- Or minuses\n + Or pluses\n```\n 1. First ordered list item\n 2. Another item\n\t* Unordered sub-list.\n 1. Actual numbers don\'t matter, just that it\'s a number\n\t1. Ordered sub-list\n 4. And another item.\n\n* Unordered list can use asterisks\n- Or minuses\n+ Or pluses\n\n### links\n```\n[I\'m an inline-style link](https://www.google.com)\n\n[I\'m an inline-style link with title](https://www.google.com "Google\'s Homepage")\n```\n[I\'m an inline-style link](https://www.google.com)\n\n[I\'m an inline-style link with title](https://www.google.com "Google\'s Homepage")\n\nURLs and URLs in angle brackets will automatically get turned into links. \n```\nhttp://www.google.com or <http://www.google.com>\n```\nhttp://www.google.com or <http://www.google.com>\n\n### Code and syntax highlighting\nBlocks of code are either fenced by lines with three back-ticks ` ``` ` , or are indented with four spaces. Only the fenced code blocks support syntax highlighting\n```\n```javascript\nvar s = "JavaScript syntax highlighting";\nalert(s);\n```\n \n```python\ndef myFunc():\n\tprint "Hello World!"\n```\n```\n\n```javascript\nvar s = "JavaScript syntax highlighting";\nalert(s);\n```\n \n```python\ndef myFunc():\n\tprint "Hello World!"\n```\n\n### Images\n```\nInline-style: \n![alt text](https://www.ltu.se/cms_fs/1.148872!/image/LTU_L_sve_bla.png_gen/derivatives/landscape_half/LTU_L_sve_bla.png "Logo Title Text 1")\n\nReference-style: \n![alt text][logo]\n\n[logo]: https://www.ltu.se/cms_fs/1.148872!/image/LTU_L_sve_bla.png_gen/derivatives/landscape_half/LTU_L_sve_bla.png "Logo Title Text 2"\n```\nInline-style: \n![alt text](https://www.ltu.se/cms_fs/1.148872!/image/LTU_L_sve_bla.png_gen/derivatives/landscape_half/LTU_L_sve_bla.png "Logo Title Text 1")\n\nReference-style: \n![alt text][logo]\n\n[logo]: https://www.ltu.se/cms_fs/1.148872!/image/LTU_L_sve_bla.png_gen/derivatives/landscape_half/LTU_L_sve_bla.png "Logo Title Text 2"\n\n### blockquotes \n```\n> Blockquotes are very handy in email to emulate reply text.\n> This line is part of the same quote.\n```\n\n> Quotes are really cool\n\n### Horizontal Rule\n```\nThree or more...\n\n---\n\nHyphens\n\n***\n\nAsterisks\n\n___\n\nUnderscores\n```\nThree or more...\n\n---\n\nHyphens\n\n***\n\nAsterisks\n\n___\n\nUnderscores\n\n### Inline HTML\nYou can ofcourse use raw HTML in your text.';
    this.content = this.assignment ? this.assignment.description : '';
    this.assignmentName = this.assignment ? this.assignment.name : '';
    this.oldUnitTests = [];
    this.languages = [];
    this.form = this.fb.group(this.defaultForm);
    this.unitTests = [];
    this.errorMessage = '';
    this.python27 = false;
    this.python3 = false;
    this.java = false;
    this.c = false;
  }

  goBack() {
    this._location.back();
  }

  onChange(c) {
    this.content = c;
  }

  getAssignmentTests(course_id: string, assignment_id: string) {
    this.backendService.getCourseAssignmentTests(course_id, assignment_id)
      .then(response => {
        console.log('Tests for assignment:', response);
        // Under that a list of io tests
        // A io test has, list args: [], then stdin and stdout and _id
        const tests = response['tests'];
        this.addIOTests(tests);
      });
  }

  addIOTests(tests: Object) {
    for (const test of tests['io']) {
      this.oldUnitTests.push(['io', test.stdin, test.stdout, test._id]); // Need id for put
    }
  }

  createTest() {
    this.unitTests.push(['io', this.form.value.ioInput, this.form.value.ioOutput]);
  }

  editExistingTest(e, array) { // need to add id if assignment
    if (this.testType === 'io') {
      if (this.assignment) { // should have id
        const id = array[e][3];
        array[e] = [this.testType, this.form.value.ioInput, this.form.value.ioOutput, id];
      } else {
        array[e] = [this.testType, this.form.value.ioInput, this.form.value.ioOutput];
      }
    } else {
      array[e] = [this.testType];
    }
    this.testType = '';
  }

  deleteTest(array, index) {
    if (confirm('Are you sure to delete test?')) {
      if (array === this.unitTests) {
        if (array.length < 2) {
          this.unitTests = [];
        } else {
          this.unitTests.splice(index, 1);
        }
      } else { // old value, call backend to remove
        const test = this.oldUnitTests[index];
        this.backendService.deleteTest(this.courseId, this.assignment.id, test[3])
          .then(resp => {
            if (array.length < 2) {
              this.oldUnitTests = [];
            } else {
              this.oldUnitTests.splice(index, 1);
            }
          })
          .catch(err => {
            console.log('Could not delete test', err);
          });
      }
    }
  }

  openModal(modal) {
    this.testType = '';
    this.form = this.fb.group(this.defaultForm);
    this.modalRef = this.modalService.show(modal);
  }

  openModalEdit(modal, testArray, index) {
    console.log('Array:', testArray[index]);
    console.log('Index:', index);
    this.form = this.fb.group({
      type: testArray[index][0],
      testInfo: [],
      ioInput: testArray[index][1],
      ioOutput: testArray[index][2],
    });
    this.modalRef = this.modalService.show(modal);
  }

  /*
  how I felt writing this:
  https://i.redd.it/3c86gua5n9201.jpg
  not a super nice, solution, but hey! it works
   */
  toggleLang ( lang ) {
    switch ( lang ) {
      case 'python27':
        this.python27 = !this.python27;
        break;
      case 'python3':
        this.python3 = !this.python3;
        break;
      case 'java':
        this.java = !this.java;
        break;
      case 'c':
        this.c = !this.c;
        break;
    }
  }

  setLanguages() {
    if (this.python27) {
      this.languages.push('python27');
    }
    if (this.python3) {
      this.languages.push('python3');
    }
    if (this.java) {
      this.languages.push('java');
    }
    if (this.c) {
      this.languages.push('c');
    }
  }

  testIo() {
    if (this.testType === 'io') { // asså, jag vet :p
      return true;
    } else {
      return false;
    }
  }

  testLint() {
    if (this.lintTest === true) {
      this.lintTest = false;
    } else {
      this.lintTest = true;
    }
  }

  submitAssignment() {
    // Submits the assignment to the backend
    // TODO: this function should work, but requires more testing, the backend
    //  could not serve the correct response
    if (this.assignmentName === '' || this.content === '') {
      this.errorMessage = '* Please fill in all required fields';
      window.scrollTo({left: 0, top: 0, behavior: 'smooth'});
    } else {
      this.errorMessage = '';
      this.setLanguages();
      if (this.assignment) {
        this.updateAssignment();
      } else {
        this.createAssignment();
      }
    }
  }

  updateAssignment() {
    this.backendService.updateAssignment(this.courseId, this.assignment.id, this.assignmentName, this.content, this.languages)
      .then(resp => {
        this.assignmentService.updateAssignment(this.courseId, this.assignment.id, this.assignmentName, this.content, this.languages);
        for (const test of this.oldUnitTests) {
          this.backendService.updateTest(this.courseId, test, this.assignment.id, this.lintTest);
        }
        for (const test of this.unitTests) {
          this.backendService.createTest(this.courseId, test, this.assignment.id, this.lintTest);
        }
        this.toastService.success('Assignment Updated!');
        window.scrollTo({left: 0, top: 0, behavior: 'smooth'});
      })
      .catch(err => console.error('Update assignment failed', err));
  }

  createAssignment() {
    this.backendService.createAssignment(this.courseId, this.assignmentName, this.content, this.languages)
      .then((response: any) => {
        const assignmentId = response._id;
        this.assignmentService.addAssignment(response, this.courseId);
        for (const test of this.unitTests) {
          this.backendService.createTest(this.courseId, test, assignmentId, this.lintTest);
        }
        this.toastService.success('Assignment Created!');
        this.router.navigate(['/teaching', this.courseId]);
      })
      .catch(err => console.error('Create assignment failed', err));
  }

  deleteAssignment() {
    if (confirm('Are you sure to delete ' + this.assignment.name + '?')) {
      this.backendService.deleteAssignment(this.courseId, this.assignment.id)
        .then(response => {
          console.log('Delete response:', response, 'removing id:', this.assignment.id);
          this.router.navigate(['/teaching/' + this.courseId])
            .then(done => {
              console.log('Routing, calling assignmentService');
              this.assignmentService.removeAssignment(this.courseId, this.assignment.id);
            });
        })
        .catch(err => {
          console.log('Error deleting assignment:', err);
        });
    }
  }
}

function languageForm() {
  return new FormGroup({
    python27: new FormControl(false),
    python3: new FormControl(false),
    java: new FormControl(false),
    c: new FormControl(false)
  });
}

interface UnitTests {
  type: string;
  input: string;
  output: string;
}
