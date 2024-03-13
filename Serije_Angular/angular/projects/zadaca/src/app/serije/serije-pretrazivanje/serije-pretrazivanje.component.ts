import { Component } from '@angular/core';
import { SerijeService } from '../../servisi/serije.service';

import { Router } from '@angular/router';

@Component({
  selector: 'app-serije-pretrazivanje',
  templateUrl: './serije-pretrazivanje.component.html',
  styleUrl: './serije-pretrazivanje.component.scss'
})
export class SerijePretrazivanjeComponent  {
  serije: any = { results: [] };
  stranica: number = 1;
  filter: string = '';

  constructor(private serijeService: SerijeService, private router: Router) {}

  onFilterChange() {
     if (this.filter.length >= 3) {
      this.dajSerije();
    }
  }

  dajSerije() {
    this.serijeService.dohvatiSerije(this.stranica, this.filter).subscribe(
      (podaci) => {
        this.serije = podaci;
      },
      (error) => {
        console.error('Greška u dohvatu serija:', error);
      }
    );
  }

  detaljiSerije(serijaId: number) {
    console.log(`Prikaz detalja za seriju s ID: ${serijaId}`);
    this.router.navigate(['/serijaDetalji', serijaId]);
  }
}
