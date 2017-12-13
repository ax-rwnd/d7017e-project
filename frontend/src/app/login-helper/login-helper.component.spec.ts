import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginHelperComponent } from './login-helper.component';

describe('LoginHelperComponent', () => {
  let component: LoginHelperComponent;
  let fixture: ComponentFixture<LoginHelperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginHelperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginHelperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
