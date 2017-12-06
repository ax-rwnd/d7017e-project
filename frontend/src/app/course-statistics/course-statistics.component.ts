import { Component, OnInit } from '@angular/core';
import {BackendService} from '../services/backend.service';
import { HeadService } from '../services/head.service';
import {until} from 'selenium-webdriver';
import { trigger, state, style, animate, transition } from '@angular/animations';
import {FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { BsModalService } from 'ngx-bootstrap/modal';
import {ActivatedRoute} from '@angular/router';
import { ToastService } from '../services/toast.service';
import { CourseService } from '../services/course.service';
import { AssignmentService } from '../services/assignment.service';

@Component({
  selector: 'app-course-statistics',
  templateUrl: './course-statistics.component.html',
  styleUrls: ['./course-statistics.component.css'],
  animations: [
    trigger('content', [
      state('inactive', style({marginLeft: '0%', width: '100%'})),
      state('active', style({marginLeft: '15%', width: '85%'})),
      transition('inactive => active', animate('300ms')),
      transition('active => inactive', animate('300ms'))
    ])
  ]
})
export class CourseStatisticsComponent implements OnInit {

  courseId: string;
  courseUsers;
  sidebarState; // state of sidebar
  numberOfAssignments;
  listOfAssignments: any[];

  currentCourse: any;
  currentCourseSaved: any;

  public pieChartLabels: string[] = ['Not Completed', 'Completed'];
  public pieChartData: number[];
  public pieChartType = 'pie';

  constructor(private courseService: CourseService, private assignmentService: AssignmentService,
              private backendService: BackendService, private headService: HeadService,
              private modalService: BsModalService, private fb: FormBuilder, private route: ActivatedRoute,
              private toastService: ToastService) {
    this.route.params.subscribe(params => this.courseId = params['course']);
    this.headService.stateChange.subscribe(sidebarState => { this.sidebarState = sidebarState; });
  }

  ngOnInit() {
    this.route.params.subscribe( (params: any) => {
      this.currentCourse = this.courseService.GetCourse(params.course);
      this.currentCourseSaved = this.currentCourse;
    });
    this.numberOfAssignments = this.assignmentService.courseAssignments[this.courseId];
    this.listOfAssignments = [];
    this.backendService.getCourseStudents(this.courseId).then((response: any) => {
      console.log('response', response);
      this.courseUsers = response.members.length;
    });


    for (const i in this.numberOfAssignments[0].assignments) {
      // console.log(this.numberOfAssignments[0].assignments);
      this.listOfAssignments.push([this.numberOfAssignments[0].assignments[i].name, 0, 1]);
    }



    console.log('number of students', this.courseUsers);



    console.log('listOfAssignments', this.listOfAssignments);
    console.log('assignments in course', this.numberOfAssignments);

    console.log('features for course lul', this.backendService.getFeaturesCourse(this.courseId));
    this.backendService.getFeaturesCourse(this.courseId).then((response: any) => {
      console.log(response.features);
      for (const i in response.features) {
        // yooy
        if (response.features[i].progress.length === 0) {
          console.log('user has no progress');
        } else {
          for (const j in response.features[i].progress) {
            // console.log(response.features[i].progress[j].assignment.name);
            this.addUserToCompletedAssignment(response.features[i].progress[j].assignment.name);
          }
          // console.log(response.features[i].progress);
        }
        // console.log(response.features[i].progress);
      }
    });


    console.log(this.listOfAssignments);
    this.pieChartData = [3, 2];
  }
  public addUserToCompletedAssignment(name: string) {
    for (const i in this.listOfAssignments) {
      if (name === this.listOfAssignments[i][0]) {
        const c = this.listOfAssignments[i][1];
        this.listOfAssignments[i][1] = c + 1;
        this.listOfAssignments[i][2] = this.courseUsers - this.listOfAssignments[i][1];
        console.log('LOLXD', this.listOfAssignments[i][1]);
      }
    }
  }

  // events
  public chartClicked(e: any): void {
    console.log(e);
  }

  public chartHovered(e: any): void {
    console.log(e);
  }

}
