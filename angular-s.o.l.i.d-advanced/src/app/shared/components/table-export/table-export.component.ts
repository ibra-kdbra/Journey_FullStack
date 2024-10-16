import {Component, Input} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {utils, WorkBook, WorkSheet, writeFileXLSX} from "xlsx";

@Component({
  selector: 'app-table-export',
  templateUrl: './table-export.component.html'
})
export class TableExportComponent {
  @Input()
  matTableDataSource!: MatTableDataSource<any>;
  @Input() label: string = 'Download';


  public download():  void{
    console.log(this.matTableDataSource.data,'download');
    // generate worksheet
    const ws: WorkSheet = utils.json_to_sheet(this.matTableDataSource.filteredData);
    // generate workbook and add the worksheet
    const wb: WorkBook = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Sheet1');
    // save to file
    writeFileXLSX(wb, `excel.xlsx`, {compression: true});
  }
}
