import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatPaginatorModule } from '@angular/material/paginator';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { PaginatorComponent } from './paginator.component';

describe('PaginatorComponent', () => {
  let component: PaginatorComponent;
  let fixture: ComponentFixture<PaginatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // The template renders <mat-paginator>, so the module that declares it
      // has to be here. Without it the element is unknown and the fixture
      // throws NG0304 before any assertion runs.
      imports: [MatPaginatorModule, NoopAnimationsModule],
      declarations: [PaginatorComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PaginatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders a paginator', () => {
    expect(fixture.nativeElement.querySelector('mat-paginator')).toBeTruthy();
  });
});
