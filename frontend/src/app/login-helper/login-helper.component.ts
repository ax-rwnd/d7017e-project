import { Component, OnInit } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {ActivatedRoute, Params, Router} from '@angular/router';

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
    this.http.get('https://127.0.0.1:8000/auth/login/ltu?ticket=' + this.ticket + '&service=http://127.0.0.1:4200/auth').subscribe(
      data => {
        localStorage.setItem('token', data['access_token']);
        this.router.navigate(['/user']);
      },
      err => {
        console.log(err);
        console.log('something went shit');
        this.router.navigate(['/']);
      }
    );
  }
}
