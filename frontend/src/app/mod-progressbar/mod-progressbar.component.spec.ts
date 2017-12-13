import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModProgressbarComponent } from './mod-progressbar.component';

describe('ModProgressbarComponent', () => {
  let component: ModProgressbarComponent;
  let fixture: ComponentFixture<ModProgressbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModProgressbarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModProgressbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
