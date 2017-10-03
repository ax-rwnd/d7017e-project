import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-head',
  templateUrl: './head.component.html',
  styleUrls: ['./head.component.css']
})

export class HeadComponent implements OnInit {

  //Det här är retarded. temporär lösning
  public isCollapsed:boolean = true;
  public subMenu1Collapsed:boolean = true;
  public mobileCollapse:boolean = false;

  public downArrow:string = "fa fa-fw fa-angle-down pull-right";
  public rightArrow:string = "fa fa-fw fa-angle-right pull-right";

  public angle:string = "down"

  public toggleMenu1(){
    if (this.subMenu1Collapsed == true) {
      this.subMenu1Collapsed = false;
    } else {
      this.subMenu1Collapsed = true;
    }
    this.toggleAngle()
  }

  public toggleAngle(){
    if (this.angle == 'down') {
      this.angle = "right"
    } else {
      this.angle = "down"
    }
  }


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
