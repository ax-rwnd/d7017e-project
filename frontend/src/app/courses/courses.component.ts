import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css']
})
export class CoursesComponent implements OnInit {
	name:string;
	available: string[];

  constructor() { }

  ngOnInit() {
  	this.name = 'user1';
  	this.available = ['assignment 1', 'assignment 2', 'assignment 3', 'laboration 1', 'laboratio 2'];
  }

}
