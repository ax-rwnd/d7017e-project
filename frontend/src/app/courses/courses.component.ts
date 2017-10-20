import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { HeadService } from '../services/head.service';
import {RewardService} from '../services/reward.service';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css'],
  animations: [
    trigger('content', [
      state('inactive', style({marginLeft: '0%', width: '100%'})),
      state('active', style({marginLeft: '15%', width: '85%'})),
      transition('inactive => active', animate('300ms')),
      transition('active => inactive', animate('300ms'))
    ])
  ]
})
export class CoursesComponent implements OnInit {
  course: string;
  available: string[];
  sidebarState; // state of sidebar
  progress: any;

  constructor(private route: ActivatedRoute, private headService: HeadService, private rewardService: RewardService) {
    this.headService.stateChange.subscribe(sidebarState => { this.sidebarState = sidebarState; });
    this.route.params.subscribe( params => this.course = params['course']);
  }

  ngOnInit() {
    this.sidebarState = this.headService.getCurrentState();
    this.available = ['assignment 1', 'assignment 2', 'assignment 3', 'laboration 1', 'laboration 2'];
    this.progress = this.rewardService.progress;
  }

}
