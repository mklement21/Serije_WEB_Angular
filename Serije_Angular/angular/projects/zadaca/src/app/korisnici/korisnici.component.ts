import { Component } from '@angular/core';
import { KorisnikService } from '../servisi/korisnici.service';
import { KorisnikI } from '../servisi/KorisnikI';

@Component({
  selector: 'app-korisnici',
  templateUrl: './korisnici.component.html',
  styleUrl: './korisnici.component.scss'
})
export class KorisniciComponent {
  korisnici: KorisnikI[] = [];
  korimeUnos: string = '';

  constructor(private korisnikService: KorisnikService) {}

  ngOnInit() {
    this.fetchKorisnici();
    if (sessionStorage.getItem('token')){
      console.log ("Token dobiven");
    }
  }

  fetchKorisnici() {
    this.korisnikService.getKorisnici().subscribe(
      (korisnici) => {
        this.korisnici = korisnici;
        console.log('Dohvaćeni korisnici:', this.korisnici);
      },
      (error) => {
        console.error('Greška prilikom dohvaćanja korisnika:', error);
      }
    );
  }

  obrisiKorisnika() {
    console.log('Brisanje korisnika s korisničkim imenom:', this.korimeUnos);
    this.korisnikService.deleteKorisnik(this.korimeUnos).subscribe(
      () => {
        console.log('Korisnik uspješno obrisan.');
        this.fetchKorisnici();
      },
      (error) => {
        console.error('Greška prilikom brisanja korisnika:', error);
      }
    );
  }
}
