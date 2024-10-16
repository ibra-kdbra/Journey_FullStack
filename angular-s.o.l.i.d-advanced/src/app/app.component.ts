import {Component, OnInit, ViewChild} from '@angular/core';
import {IItemForm} from "./shared/components/table-filter/table-filter.interface";
import {MatTable} from "@angular/material/table";
import {TableComponent} from "./shared/components/table/table.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild ('tableExportFilter') appTable!: TableComponent;
  title = 'app';
  public dataSource: any[] = [];
  public itemsForm: IItemForm[] = [
    {
      name: 'search',
      columns:[
        'name',
        'email'
      ],
      type: 'input',
      placeholder: 'Busca por name o email',
      label: 'Search',
      classes:'w-full',
    },{
      name: 'age',
      columns:[
        'age'
      ],
      type: 'select',
      placeholder: 'Selecciona una edad',
      label: 'Age',
      classes:'w-full',
      itemValue:[
        {
          value: '',
          label:'Clean',
          type: 'string'
        },

        {
        value: '20',
        label: '20',
        type: 'number'
      },
        {
          value: '40',
          label: '40',
          type: 'number'
        },
        {
          value: '23',
          label: '23',
          type: 'number'
        }
      ]
    },
    {
      name: 'status',
      columns:[
        'status'
      ],
      type: 'select',
      placeholder: 'Selecciona un estado',
      label: 'Status',
      classes:'w-full',
      itemValue:[
        {
          value: '',
          label:'Clean',
          type: 'string'
        },
        {
        value: 'active',
          label:'Active',
        type: 'string'
      },
        {
          value: 'disabled',
          label:'Disabled',
          type: 'string'
        },{
          value: 'inactive',
          label:'Inactive',
          type: 'string'
        }
      ]
    }
  ];

  constructor() {
    this.dataSource = [
      {
        "name": "John",
        "age": 20,
        "email": "gonza@duoc.cl",
        "status":"active"
      },{
         "name": "Pedro",
          "age": 40,
          "email": "p@duocuc.",
          "status":"active"
      },
      {
        "name": "Juan",
        "age": 40,
        "email": "juan@duocuc.",
        "status":"disabled"
      },
      {
        "name": "John",
        "age": 20,
        "email": "gonza@duoc.cl",
        "status":"active"
      },{
        "name": "Pedro",
        "age": 40,
        "email": "p@duocuc.",
        "status":"active"
      },
      {
        "name": "Juan",
        "age": 40,
        "email": "juan@duocuc.",
        "status":"disabled"
      },{
        "name": "John",
        "age": 20,
        "email": "gonza@duoc.cl",
        "status":"active"
      },{
        "name": "Pedro",
        "age": 40,
        "email": "p@duocuc.",
        "status":"active"
      },
      {
        "name": "Juan",
        "age": 40,
        "email": "juan@duocuc.",
        "status":"disabled"
      }
    ]
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.dataSource.push({
        "name": "Gonzalo",
        "age": 23,
        "email": "gofalfan@duocuc.",
        "status":"inactive"
      })
      this.appTable.load(this.dataSource);
    }, 1000);
  }

  public predicate(item: any, filter: string): boolean {
    const filters: any[] = JSON.parse(filter);
    const flags = filters.reduce((acc: any, f: any) => {
      acc[f.name] = false
      return acc;
    }, {});
    filters.forEach((f: any) => {
      if (f.name === 'search'){
        flags[f.name] =
          f.columns.some((column: string) => String(item[column]).toLowerCase().includes(String(f.value).toLowerCase())) || !f.value;
      }
      else{
        flags[f.name] =
          f.columns.every((column: string) => String(item[column]).toLowerCase() === String(f.value).toLowerCase()) || !f.value;
      }
    });
    // @ts-ignore
    return Object.values(flags).every((flag: boolean) => flag);
  }
}
