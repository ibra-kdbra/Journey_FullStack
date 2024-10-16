import {MatTableDataSource} from "@angular/material/table";

export class Table<T> {
  public dataSource: MatTableDataSource<T>;
  public displayedColumns: Array<string> = [];

  constructor(
  ) {
    this.displayedColumns = [];
    this.dataSource = new MatTableDataSource<T>();
  }
  public load(data: Array<T>): void {
    this.dataSource.data = data;
  }
}


export class TableFilter<T>{
  public table: Table<T>;
  constructor(
    table: Table<T>
  ) {
    this.table = table;
  }
  public setFilterPredicate(predicate: (item: T) => boolean): void{
    this.table.dataSource.filterPredicate = predicate;
  }

  public filter(filterValue: string): void {
    this.table.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
