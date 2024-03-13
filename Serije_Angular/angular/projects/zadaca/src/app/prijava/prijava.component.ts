import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AutentifikacijaService } from '../servisi/autentifikacija.service';
import { KorisnikI } from '../servisi/KorisnikI';
import { HttpClient } from '@angular/common/http'; 
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-prijava',
  templateUrl: './prijava.component.html',
  styleUrls: ['./prijava.component.scss']
})
export class PrijavaComponent {
  korime: string = '';
  lozinka: string = '';
  greska: string = '';
  poruka = '';

  prijavljeniKorisnik: KorisnikI | undefined;

  constructor(
    private autentifikacijaService: AutentifikacijaService,
    private router: Router,
    private http: HttpClient 
  ) {}

  async prijavi() {
    try {
        if (!this.korime || !this.lozinka) {
          this.greska = 'Unesite korisničko ime i lozinku.';
          return;
        }
        const recaptchaToken = await this.reCaptcha();
        if (recaptchaToken !== '') {

          this.autentifikacijaService.prijava(this.korime, this.lozinka )
            .subscribe(
              (uspjesnaPrijava) => {
                if (uspjesnaPrijava) {
                  console.log('Uspješna prijava', this.lozinka);
                  this.router.navigate(['/']);
                } else {
                  console.error('Neuspješna prijava');
                  this.greska = 'Pogrešno korisničko ime ili lozinka';
                }
              },
              (error) => {
                console.error('Greška prilikom prijave:', error);
                this.poruka = 'Došlo je do greške prilikom prijave';
            }
          );
      } else {
        this.poruka = 'reCAPTCHA nije uspješno verificirana.';
      }
    } catch (error) {
      console.error('Greška prilikom verifikacije reCAPTCHA:', error);
      this.poruka = 'Došlo je do greške prilikom verifikacije reCAPTCHA';
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
