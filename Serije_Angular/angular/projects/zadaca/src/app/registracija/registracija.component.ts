import { Component } from '@angular/core';
import { AutentifikacijaService } from '../servisi/autentifikacija.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-registracija',
  templateUrl: './registracija.component.html',
  styleUrls: ['./registracija.component.scss']
})
export class RegistracijaComponent {
  poruka = "";
  korime: string = "";
  lozinka: string = "";
  ime: string = "";
  prezime: string = "";
  email: string = "";
  spol: string = "";
  datum_rodenja: string = "";
  telefon: string = "";
  isUlogaAdmin: boolean = false;

  constructor(private autentifikacijaService: AutentifikacijaService) {
    this.isUlogaAdmin = autentifikacijaService.isUlogaAdmin();
  }
  async registriraj() {
    const recaptchaToken = await this.reCaptcha();
    if(recaptchaToken != '') {
    if (
      this.korime &&
      this.lozinka &&
      this.ime &&
      this.prezime &&
      this.email &&
      this.spol &&
      this.datum_rodenja &&
      this.telefon
    ) {
      if (this.email.includes('@')) {
        const registracijaPodaci = {
          ime: this.ime,
          prezime: this.prezime,
          korime: this.korime,
          email: this.email,
          lozinka: this.lozinka,
          spol: this.spol,
          datum_rodenja: this.datum_rodenja,
          telefon: this.telefon,
          uloga_id: 3
        };

        this.autentifikacijaService.registracijaNovogKorisnika(registracijaPodaci).subscribe(
          (uspjesno) => {
            if (uspjesno) {
              this.poruka = "Uspješno ste registrirani!";
            } else {
              this.poruka = "Neuspješna registracija.";
            }
          },
          (error) => {
            this.poruka = error;
          }
        );
      } else {
        this.poruka = "Molimo unesite ispravan e-mail.";
      }
    } else {
      this.poruka = "Molimo unesite sve potrebne informacije.";
    }
    }
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
