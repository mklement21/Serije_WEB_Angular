import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { AutentifikacijaService } from './autentifikacija.service';
import { environment } from '../../environments/environment';
import { KorisnikI } from './KorisnikI';

@Injectable({
  providedIn: 'root',
})

export class KorisnikService {
  private baseUrl = `${environment.adresa}:${environment.port}/baza/korisnici`;
  private korisnikPodaci: KorisnikI | undefined;
  constructor(private http: HttpClient, private autentifikacijaService: AutentifikacijaService) {}

  getKorisnici(): Observable<KorisnikI[]> {
    return this.http.get<KorisnikI[]>(this.baseUrl);
  }

  getKorisnik(): Observable<KorisnikI | undefined> {
    return this.autentifikacijaService.getPrijavljeniKorisnik$();
  }

  getKorisnikProfil(): Observable<KorisnikI | undefined> {
    const korisnikObservable = this.autentifikacijaService.getPrijavljeniKorisnik$();
    korisnikObservable.subscribe((korisnik) => {
      this.korisnikPodaci = korisnik;
      this.dohvatiDvorazinskuAutentifikaciju();
      console.log('Dohvaćeni korisnik:', this.korisnikPodaci);
    });

    return korisnikObservable;
  }

  private dohvatiDvorazinskuAutentifikaciju() {
  }

  updateKorisnik(korisnik: KorisnikI): Observable<any> {
    return this.http.put(`${this.baseUrl}/${korisnik.korime}`, korisnik);
  }
  
  deleteKorisnik(korime: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${korime}`);
  }  
}
