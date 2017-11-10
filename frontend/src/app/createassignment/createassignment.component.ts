import { Component, OnInit } from '@angular/core';
import {BackendService} from '../services/backend.service';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { HeadService } from '../services/head.service';
import {until} from 'selenium-webdriver';
import titleContains = until.titleContains;
import {FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/modal-options.class';

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

  assignmentName: string;
  supportedLanguages: any[];
  content: string;
  unitTests: any[];


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
  };

  constructor(private backendService: BackendService, private headService: HeadService,
              private modalService: BsModalService, private fb: FormBuilder) {
    this.headService.stateChange.subscribe(sidebarState => { this.sidebarState = sidebarState; });
  }

  ngOnInit() {
    this.sidebarState = this.headService.getCurrentState();
    this.content = '';
    this.form = this.fb.group(this.defaultForm);
    this.unitTests = [];
  }

  onChangeAssignmentName(aN) {
    this.assignmentName = aN;
  }

  onChange(c) {
    this.content = c;
  }

  createTest() {
    if (this.testType === 'io') {
      this.unitTests.push([this.testType, this.form.value.ioInput, this.form.value.ioOutput]);
    } else {
      this.unitTests.push([this.testType]);
    }
    this.testType = '';
  }

  editExistingTest(e) {
    if (this.testType === 'io') {
      this.unitTests[e] = [this.testType, this.form.value.ioInput, this.form.value.ioOutput];
      console.log(this.unitTests);
    } else {
      this.unitTests[e] = [this.testType];
    }
    this.testType = '';
  }

  openModal(modal) {
    this.testType = '';
    this.form = this.fb.group(this.defaultForm);
    this.modalRef = this.modalService.show(modal);
  }

  openModalEdit(modal) {
    this.form = this.fb.group(this.defaultForm);
    this.modalRef = this.modalService.show(modal);
  }

  testIo() {
    if (this.testType === 'io') { // asså, jag vet :p
      return true;
    } else {
      return false;
    }
  }

  submitNewAssignment() {
    this.backendService.createAssignment(this.content, this.unitTests)
    return;
  }
}

interface UnitTests {
  type: string;
  input: string;
  output: string;
}
