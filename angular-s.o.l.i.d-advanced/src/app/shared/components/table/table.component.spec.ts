import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { TableComponent } from './table.component';

describe('TableComponent', () => {
  let component: TableComponent;
  let fixture: ComponentFixture<TableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // mat-table, matSort and mat-paginator all appear in the template, and
      // the component takes MatSort and MatPaginator through @ViewChild.
      imports: [MatTableModule, MatSortModule, MatPaginatorModule, NoopAnimationsModule],
      declarations: [TableComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders a row per record once loaded', () => {
    fixture.componentRef.setInput('displayedColumns', ['name', 'age']);
    component.load([
      { name: 'John', age: 20 },
      { name: 'Pedro', age: 40 }
    ]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('tr[mat-row]').length).toBe(2);
  });

  it('shows the paginator only when asked for one', () => {
    expect(fixture.nativeElement.querySelector('mat-paginator')).toBeNull();

    // setInput rather than assigning to the instance: this project is on
    // Angular 22, where writing the property directly does not mark the view
    // dirty, so the *ngIf never re-evaluates and detectChanges is a no-op.
    fixture.componentRef.setInput('isPaginator', true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('mat-paginator')).toBeTruthy();
  });
});
