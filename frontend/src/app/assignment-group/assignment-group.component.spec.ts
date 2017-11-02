import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmentGroupComponent } from './assignment-group.component';

describe('AssignmentGroupComponent', () => {
  let component: AssignmentGroupComponent;
  let fixture: ComponentFixture<AssignmentGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssignmentGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignmentGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
