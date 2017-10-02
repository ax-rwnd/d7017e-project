import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-head',
  templateUrl: './head.component.html',
  styleUrls: ['./head.component.css']
})
export class HeadComponent implements OnInit {

  public isCollapsed:boolean = false;

  public collapsed(event:any):void {
    console.log(event);
  }

  public expanded(event:any):void {
    console.log(event);
  }

  constructor() {

  }

  ngOnInit() {

  }

}
