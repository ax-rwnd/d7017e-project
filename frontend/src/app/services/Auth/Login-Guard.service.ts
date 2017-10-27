import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRoute  } from '@angular/router';
import { AuthService } from './Auth.service';


@Injectable()
export class AuthGuardService implements CanActivate {

  url: string;

  constructor(public auth: AuthService,
              public router: Router,
              private route: ActivatedRoute, ) {}
  canActivate(): boolean {
    this.url = this.route.snapshot.queryParams['returnUrl'] || '/';
    return true;
  }
}
