import { Component } from '@angular/core';
import { AutentifikacijaService } from './servisi/autentifikacija.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'zadaca2';
  putanja = 'pocetna'; 

  constructor(public autentifikacijaService: AutentifikacijaService) {}

  odjava() {
    this.autentifikacijaService.odjava();
    this.putanja = '/'; 
  }
}
