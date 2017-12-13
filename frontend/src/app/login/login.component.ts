import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent {
  descriptions = [
    'A platform for learning new programming languages.',
    'Your next tool when evaluating gamified learning techniques.',
    'The nicest place yet to get started with your computer science degree.'];

  casLogin() {
    // Create a redirect URL for logging in

    const redirect = `https://weblogon.ltu.se/cas/login?service=${environment.frontend_ip}/auth?urlPath=/user`;
    window.location.href = redirect;
  }
}
