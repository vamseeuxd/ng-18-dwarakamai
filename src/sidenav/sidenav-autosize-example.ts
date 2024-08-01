import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';

/**
 * @title Autosize sidenav
 */
@Component({
  selector: 'sidenav-autosize-example',
  templateUrl: 'sidenav-autosize-example.html',
  styleUrl: 'sidenav-autosize-example.css',
  standalone: true,
  imports: [
    MatSidenavModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatRippleModule,
  ],
})
export class SidenavAutosizeExample {
  pages = [
    { id: 'flats', name: 'Flats' },
    { id: 'expenses', name: 'Expenses' },
    { id: 'income', name: 'Income' },
    { id: 'inventory', name: 'Inventory' },
    { id: 'vehicals', name: 'Vehicals' },
    { id: 'floors', name: 'Floors' },
  ];
}
