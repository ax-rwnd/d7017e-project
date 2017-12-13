import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserPanelsComponent } from './user-panels.component';

describe('UserPanelsComponent', () => {
  let component: UserPanelsComponent;
  let fixture: ComponentFixture<UserPanelsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserPanelsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserPanelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
