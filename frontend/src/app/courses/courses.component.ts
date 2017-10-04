import { Component, OnInit } from '@angular/core';
import { HeadComponent} from '../head/head.component';
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css']
})
export class CoursesComponent implements OnInit {
  course: string;
	available: string[];

  constructor(
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.course = this.route.snapshot.paramMap.get('course');
  	this.available = ['assignment 1', 'assignment 2', 'assignment 3', 'laboration 1', 'laboration 2'];
  }

}
