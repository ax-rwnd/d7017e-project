import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {BackendService} from '../services/backend.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-join-course',
  templateUrl: './join-course.component.html',
  styleUrls: ['./join-course.component.css']
})
export class JoinCourseComponent implements OnInit {


  constructor(private activatedRoute: ActivatedRoute, private router: Router,
              private backendService: BackendService) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe( (params: any) => {
      console.log('Params: ' + JSON.stringify(params));
      this.joinCourse(params.courseID);
    });
  }
  joinCourse(courseID: string) {
    this.backendService.joinInviteLink(courseID).then((resp: any) => {
      this.router.navigate(['/courses/' + resp.course]);
    }).catch( (resp: any) => {
      this.router.navigate(['/user']);
    });
  }

}
