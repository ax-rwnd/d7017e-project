import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { HeadService } from '../services/head.service';

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
  state = 'inactive'; // state of sidebar

  constructor(private route: ActivatedRoute, private headService: HeadService) {
    this.headService.stateChange.subscribe(state => { this.state = state; });
  }

  ngOnInit() {
    this.course = this.route.snapshot.paramMap.get('course');
    this.available = ['assignment 1', 'assignment 2', 'assignment 3', 'laboration 1', 'laboration 2'];
  }

}
