import {AfterViewInit, Component, Input, ViewChild} from '@angular/core';
import {MatPaginator} from "@angular/material/paginator";

@Component({
  selector: 'app-paginator',
  templateUrl: './paginator.component.html'
})
export class PaginatorComponent implements AfterViewInit{
  @ViewChild('paginator') paginator!: MatPaginator;
  @Input() length!: number;
  @Input() pageSize!: number;
  @Input() pageSizeOptions!: number[];


  ngAfterViewInit() {
    console.log(this.paginator,'paginator');
  }


  public listenPage(event: any): void {
    console.log(event);
  }
}
