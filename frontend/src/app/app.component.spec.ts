import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { Router, RouterOutlet } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
      ],
      imports: [
      RouterTestingModule.withRoutes([])]
    }).compileComponents();
    //fixture = TestBed.creatComponent(AppComponent);
  }));
  it('1+1=2', async() => {
    //service = new AppComponent(new HeadService)
    expect(1+1).toBe(2);
  })
});
