import { Component, OnInit} from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { HeadService } from '../services/head.service';

@Component({
  selector: 'app-head',
  templateUrl: './head.component.html',
  styleUrls: ['./head.component.css'],
  animations: [
    trigger('sidebar', [
      state('inactive', style({display: 'none', transform: 'translateX(-100%)'})),
      state('active', style({display: 'block', transform: 'translateX(0)'})),
      transition('inactive => active', animate('300ms')),
      transition('active => inactive', animate('300ms'))
    ])
  ]
})

export class HeadComponent implements OnInit {
  state;

  constructor(private headService: HeadService) {
    this.state = 'inactive';
  }

  toggleState() {
    this.state = this.state === 'active' ? 'inactive' : 'active';
    this.headService.setState(this.state);
  }

   ngOnInit() {}
}

/*export class HeadComponent implements OnInit {

  //Det här är retarded. temporär lösning
  public isCollapsed:boolean = false;
  public subMenu1Collapsed:boolean = true;
  public mobileCollapse:boolean = false;
  public profileCollapse:boolean = true;

  public downArrow:string = "fa fa-fw fa-angle-down pull-right";
  public rightArrow:string = "fa fa-fw fa-angle-right pull-right";

  public angle:string = "down";
  public angleProfile:string = "down";

  public toggleMenu1(){
    if (this.subMenu1Collapsed == true) {
      this.subMenu1Collapsed = false;
    } else {
      this.subMenu1Collapsed = true;
    }
    this.toggleAngle();
  }

  public toggleProfile(){
    if (this.profileCollapse == true) {
      this.profileCollapse = false;
      this.angleProfile = "up"
    } else {
      this.profileCollapse = true;
      this.angleProfile = "down"
    }
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

}*/
