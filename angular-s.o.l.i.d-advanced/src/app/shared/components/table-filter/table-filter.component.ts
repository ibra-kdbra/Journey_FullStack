import {Component, Input, OnInit} from '@angular/core';

import {MatTableDataSource} from "@angular/material/table";
import {FormBuilder, FormGroup} from "@angular/forms";
import {IItemForm} from "./table-filter.interface";

@Component({
  selector: 'app-table-filter',
  templateUrl: './table-filter.component.html',
})
export class TableFilterComponent implements OnInit{
  @Input()
  matTableDataSource!: MatTableDataSource<any>;
  @Input() items: IItemForm[] = [];
  @Input() classes: string = '';
  @Input() predicate!: (item: any, filter: string) => boolean;
  public formGroup!: FormGroup;
  constructor(
    private _formBuilder: FormBuilder
  ) {
  }

  ngOnInit() {
    if (this.predicate){
      this.matTableDataSource.filterPredicate = this.predicate;
    }

    this.buildFormGroup();

    this.formGroup.valueChanges.subscribe((value: any) => {
      this.applyFilter();
    });
  }

  public buildFormGroup(): void {
    this.formGroup = this._formBuilder.group(
      this.items.reduce((acc: any, item: IItemForm) => {
        acc[item.name] = [''];
        return acc;
      }, {})
    );
  }

  public applyFilter(): void {
    const filters = Object.keys(this.formGroup.value).map((key: string) => {
      return {
        name: key,
        value: this.formGroup.value[key],
        columns: this.items.find((item: IItemForm) => item.name === key)?.columns
      }
    });
    this.matTableDataSource.filter = JSON.stringify(filters);
  }
}
