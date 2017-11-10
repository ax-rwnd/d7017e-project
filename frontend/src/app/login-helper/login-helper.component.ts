import { Component, OnInit } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {ActivatedRoute, Params, Router} from '@angular/router';
import { environment } from '../../environments/environment';
import {BackendService} from '../services/backend.service';
import {CourseService} from '../services/course.service';

@Component({
  selector: 'app-login-helper',
  templateUrl: './login-helper.component.html',
  styleUrls: ['./login-helper.component.css']
})
export class LoginHelperComponent implements OnInit {
  token: string;
  refresh_token: string;
  token_type: string;
  ticket: string;

  constructor(private http: HttpClient, private activatedRoute: ActivatedRoute, private router: Router,
              private backendService: BackendService, private courseService: CourseService) { }

  ngOnInit() {
    // Retrieving param from url
    // --TODO Update way of retrieving param, param.ticket?
    this.activatedRoute.queryParams.subscribe((params: Params) => {
      this.ticket = params['ticket'];
      console.log(this.ticket);
    });
    // UGLY ass request to save tokens
    // --TODO can this be done cleaner? backend service?
    this.http.get(environment.backend_ip + '/auth/login/ltu?ticket=' + this.ticket + '&service=' + environment.frontend_ip + '/auth').subscribe(
      data => {
        console.log(data);
        // TOKEN
        this.token = (data['token_type'] + ' ' + data['access_token']);
        localStorage.setItem('token', this.token);
        // REFRESH TOKEN
        this.refresh_token = (data['token_type'] + ' ' + data['refresh_token']);
        localStorage.setItem('refresh_token', this.refresh_token);
        // FIX THIS SHIT TO NAVIGATE CORRECTLY
        this.courseService.GetAllCoursesForUser();
        this.router.navigate(['/user']);
        // --TODO add url support to not force /user
      },
      err => {
        // --TODO add error handling
        console.log(err);
        console.log('something went shit in login-helper');
        this.router.navigate(['/']);
      }
    );
  }
}


