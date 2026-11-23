import {AfterViewInit, Component, Input, OnChanges, OnInit, Optional, SimpleChanges, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {MatSort} from "@angular/material/sort";
import {MatPaginator} from "@angular/material/paginator";

@Component({
  standalone: false,
  selector: 'app-table',
  templateUrl: './table.component.html'})
export class TableComponent implements OnInit, OnChanges, AfterViewInit{
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @Input() displayedColumns: Array<string> = [];
  @Input() data: Array<any> = [];
  @Input() isSort: boolean = false;
  @Input() isPaginator: boolean = false;
  @Input() pageSizeOptions: number[] = [5, 10, 25, 100];
  public dataSource: MatTableDataSource<any>;
  constructor() {
    this.dataSource = new MatTableDataSource<any>();
    this.dataSource.data = [];
  }

  ngOnInit(): void {
    this.dataSource.data = this.data;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && !changes['data'].firstChange) {
      this.load(this.data);
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  public load(data: Array<any>): void {
    this.dataSource.data = data;
  }
}
