import { TestBed } from '@angular/core/testing';
import { AppModule } from './app.module';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    // The template composes app-table, app-table-filter, app-table-export and
    // app-paginator over Angular Material. Rather than restate that wiring,
    // import the module that already declares all of it.
    await TestBed.configureTestingModule({
      imports: [AppModule]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it(`should have as title 'app'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance.title).toEqual('app');
  });

  it('renders the page heading', () => {
    // The generated spec asserted `.content span` contained
    // "app app is running!" - scaffold text this template never had.
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('header span')?.textContent).toContain(
      'Principles SOLID And Advanced Angular'
    );
  });
});
