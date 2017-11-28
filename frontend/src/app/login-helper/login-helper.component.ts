import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import { environment } from '../../environments/environment';
import {BackendService} from '../services/backend.service';


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
  authURL: string;
  oldURL: string;

  constructor(private activatedRoute: ActivatedRoute, private router: Router,
              private backendService: BackendService) { }

  ngOnInit() {
    // Retrieving param from url
    // --TODO Update way of retrieving param, param.ticket?
    this.activatedRoute.queryParams.subscribe((params: Params) => {
      console.log('Params: ' + JSON.stringify(params));
      this.ticket = params.ticket;
      this.oldURL = params.urlPath || '';
      this.authURL = environment.frontend_ip + '/auth?urlPath=' + this.oldURL;
    });
    this.login();
  }
  login() {
    this.backendService.login(this.ticket, this.authURL)
      .then(data => {
        // TOKEN
        this.token = (data['token_type'] + ' ' + data['access_token']);
        localStorage.setItem('token', this.token);
        // REFRESH TOKEN
        this.refresh_token = (data['token_type'] + ' ' + data['refresh_token']);
        localStorage.setItem('refresh_token', this.refresh_token);
        // REDIRECT
        window.location.href = this.oldURL;
      }).catch(err => {
        console.error('Login failed', err);
        this.router.navigate(['/']);
      });
  }
}


