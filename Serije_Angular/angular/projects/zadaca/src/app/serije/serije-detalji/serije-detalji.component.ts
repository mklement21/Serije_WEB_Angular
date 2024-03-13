import { Component, OnInit } from '@angular/core';
import { SerijaDetaljiI } from '../../servisi/SerijaI';
import { SerijeService } from '../../servisi/serije.service';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'projects/zadaca/src/environments/environment';
@Component({
  selector: 'app-serije-detalji',
  templateUrl: './serije-detalji.component.html',
  styleUrls: ['./serije-detalji.component.scss'],
})
export class SerijeDetaljiComponent implements OnInit {
  serijaDetalji: SerijaDetaljiI | undefined;
  environment = environment; 

  constructor(
    private route: ActivatedRoute,
    private serijeService: SerijeService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const serijaId = Number(params.get('id'));
      if (!isNaN(serijaId)) {
        this.dohvatiDetaljeSerije(serijaId);
      } else {
        console.error('Id:', serijaId);
      }
    });
  }

  dohvatiDetaljeSerije(serijaId: number) {
    this.serijeService.dohvatiDetaljeSerije(serijaId).subscribe(
      (detalji) => {
        console.log('Detalji serije:', detalji);
        this.serijaDetalji = detalji;
      },
      (error) => {
        console.error('Greška u dohvatu detalja serije:', error);
      }
    );
  }
  
}