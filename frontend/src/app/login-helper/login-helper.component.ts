import { Component, OnInit } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {ActivatedRoute, Params} from '@angular/router';

@Component({
  selector: 'app-login-helper',
  templateUrl: './login-helper.component.html',
  styleUrls: ['./login-helper.component.css']
})
export class LoginHelperComponent implements OnInit {
  results: string[];
  ticket: string;

  constructor(private http: HttpClient, private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe((params: Params) => {
      this.ticket = params['ticket'];
      console.log(this.ticket);
      localStorage.setItem('ticket', this.ticket);
    });
    this.http.get('http://130.240.5.119:8000/api/login/ltu?ticket=' + this.ticket).subscribe(
      data => {
        this.results = data['results'];
        console.log(this.results);
      },
      err => {
        localStorage.setItem('token', 'ERROR_TOKEN');
      }
    );
  }
}
