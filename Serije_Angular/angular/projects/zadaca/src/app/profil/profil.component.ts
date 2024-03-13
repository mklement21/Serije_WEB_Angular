import { Component } from '@angular/core';
import { KorisnikService } from '../servisi/korisnici.service';
import { KorisnikI } from '../servisi/KorisnikI';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.scss']
})
export class ProfilComponent {
  korisnici: KorisnikI[] = [];
  formaZaUredivanjeAktivna: boolean = false;

  korisnikPodaci: KorisnikI = {
    id_korisnik: 0,
    ime: '',
    prezime: '',
    korime: '',
    email: '',
    lozinka: '',
    slika: '',
    spol: '',
    datum_rodenja: '',
    telefon: '',
    opis: '',
    br_favorita: 0,
    uloga_id: 0,
    dvorazinskaAutentifikacija: {
      ukljucena: false,
      tajniKljuc: ''
    }
  };

  constructor(private korisnikService: KorisnikService) {}

  ngOnInit() {
    this.fetchKorisnici();
    this.fetchKorisnik();
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

  fetchKorisnik() {
    this.korisnikService.getKorisnik().subscribe(
      (korisnikPodaci) => {
        if (korisnikPodaci) {
          this.korisnikPodaci = korisnikPodaci;
          console.log('Dohvaćeni korisnik:', this.korisnikPodaci);
        } else {
          console.error('Nije moguće dohvatiti korisnika.');
        }
      },
      (error) => {
        console.error('Greška prilikom dohvaćanja admin korisnika:', error);
      }
    );
  }

  otvoriFormuZaUredivanje() {
    this.formaZaUredivanjeAktivna = true;
  }

  async spremiPromjene() {
    const recaptchaToken = await this.reCaptcha();
    if(recaptchaToken != null) {
    this.korisnikService.updateKorisnik(this.korisnikPodaci).subscribe(
      (response) => {
        console.log('Profil ažuriran uspješno:', response);
      },
      (error) => {
        console.error('Greška prilikom ažuriranja profila:', error);
      }
    );

    this.formaZaUredivanjeAktivna = false;
    }
  }

  ponistiUredivanje() {
    this.fetchKorisnik();
    this.formaZaUredivanjeAktivna = false;
  }

  async reCaptcha(): Promise<string> {
    return new Promise((resolve, reject) => {
      grecaptcha.ready(() => {
        grecaptcha.execute(environment.recaptcha.siteKey, { action: 'submit' })
          .then((token: string) => {
            resolve(token);
          })
      });
    });
  }
}
