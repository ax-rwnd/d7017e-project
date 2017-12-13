import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModLeaderboardComponent } from './mod-leaderboard.component';

describe('ModLeaderboardComponent', () => {
  let component: ModLeaderboardComponent;
  let fixture: ComponentFixture<ModLeaderboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModLeaderboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModLeaderboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
