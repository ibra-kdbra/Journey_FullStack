import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { TableExportComponent } from './table-export.component';

describe('TableExportComponent', () => {
  let component: TableExportComponent;
  let fixture: ComponentFixture<TableExportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatButtonModule, NoopAnimationsModule],
      declarations: [TableExportComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TableExportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the export button', () => {
    expect(fixture.nativeElement.querySelector('button')).toBeTruthy();
  });
});
