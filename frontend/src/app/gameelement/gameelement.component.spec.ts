import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GameelementComponent } from './gameelement.component';

describe('GameelementComponent', () => {
  let component: GameelementComponent;
  let fixture: ComponentFixture<GameelementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GameelementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GameelementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
