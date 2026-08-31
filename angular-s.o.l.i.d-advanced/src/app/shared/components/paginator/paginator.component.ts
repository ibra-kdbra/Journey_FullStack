import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {MatPaginator, PageEvent} from "@angular/material/paginator";

@Component({
  standalone: false,
  selector: 'app-paginator',
  templateUrl: './paginator.component.html'
})
export class PaginatorComponent {
  @ViewChild('paginator') paginator!: MatPaginator;
  @Input() length!: number;
  @Input() pageSize!: number;
  @Input() pageSizeOptions!: number[];

  /**
   * Re-emitted so a parent can react to paging. listenPage previously only
   * logged the event, which meant the component swallowed every page change.
   */
  @Output() page = new EventEmitter<PageEvent>();

  public listenPage(event: PageEvent): void {
    this.page.emit(event);
  }
}
