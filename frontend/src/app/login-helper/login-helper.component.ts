import { Component, OnInit } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {ActivatedRoute, Params, Router} from '@angular/router';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-login-helper',
  templateUrl: './login-helper.component.html',
  styleUrls: ['./login-helper.component.css']
})
export class LoginHelperComponent implements OnInit {
  token: string;
  ticket: string;

  constructor(private http: HttpClient, private activatedRoute: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe((params: Params) => {
      this.ticket = params['ticket'];
      console.log(this.ticket);
    });
    // this.http.get('http://130.240.5.119:8000/api/login/ltu?ticket=' + this.ticket).subscribe(
    this.http.get(environment.backend_ip + '/auth/login/ltu?ticket=' + this.ticket + '&service=' + environment.frontend_ip + '/auth').subscribe(
      data => {
        console.log(data);
        this.token = (data['token_type'] + ' ' + data['access_token']);
        localStorage.setItem('token', this.token);
        console.log(this.token);
        localStorage.setItem('refresh_token', data['refresh_token']);
        localStorage.setItem('token_type', data['token_type']);
        this.router.navigate(['/user']);
      },
      err => {
        console.log(err);
        console.log('something went shit in login-helper');
        this.router.navigate(['/']);
      }
    );
  }
}
