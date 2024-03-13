import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { KorisnikI } from './KorisnikI';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AutentifikacijaService {
  private baseUrl = `${environment.adresa}:${environment.port}/baza/korisnici`;

  private prijavljeniKorisnikSubject = new BehaviorSubject<KorisnikI | undefined>(undefined);
  prijavljeniKorisnik$: Observable<KorisnikI | undefined> = this.prijavljeniKorisnikSubject.asObservable();

  constructor(private http: HttpClient) {
    const savedUser = this.loadUserFromStorage();
    if (savedUser) {
      this.prijavljeniKorisnikSubject.next(savedUser);
    }
  }

  getKorisnik(korime: string, lozinka: string): Observable<KorisnikI | undefined> {
    return this.http.get<KorisnikI[]>(this.baseUrl).pipe(
      map((korisnici) => korisnici.find((korisnik) => korisnik.korime === korime && korisnik.lozinka === lozinka)),
      catchError(() => {
        throw new Error('Pogreška pri dohvaćanju korisnika');
      })
    );
  }

  prijava(korime: string, lozinka: string): Observable<boolean> {
    return this.getKorisnik(korime, lozinka).pipe(
      map((prijavljeniKorisnik) => {
        if (prijavljeniKorisnik) {
          this.prijavljeniKorisnikSubject.next(prijavljeniKorisnik);
          this.spremiKorisnikaStorage(prijavljeniKorisnik);
        }
        return !!prijavljeniKorisnik;
      })
    );
  }

  ukloniKorisnikaStorage() {
    localStorage.removeItem('loggedInUser');
  }

  odjava() {
    this.prijavljeniKorisnikSubject.next(undefined);
    this.ukloniKorisnikaStorage();
  }

  getPrijavljeniKorisnik$(): Observable<KorisnikI | undefined> {
    return this.prijavljeniKorisnikSubject.asObservable();
  }

  isPrijavljen(): boolean {
    return !!this.prijavljeniKorisnikSubject.value;
  }
  
  private spremiKorisnikaStorage(user: KorisnikI) {
    localStorage.setItem('loggedInUser', JSON.stringify(user));
  }

  private loadUserFromStorage(): KorisnikI | undefined {
    const storedUser = localStorage.getItem('loggedInUser');
    return storedUser ? JSON.parse(storedUser) : undefined;
  }

  isUlogaAdmin(): boolean {
    const prijavljeniKorisnik = this.prijavljeniKorisnikSubject.value;
    return !!prijavljeniKorisnik && prijavljeniKorisnik.uloga_id === 1;
  }

  registracijaNovogKorisnika(registracijaPodaci: any): Observable<boolean> {
    const prijavljeniKorisnik = this.prijavljeniKorisnikSubject.value;
  
    if (prijavljeniKorisnik && prijavljeniKorisnik.uloga_id === 1) {
      return this.http.post<boolean>(`${this.baseUrl}`, registracijaPodaci);
    } else {
      return throwError("Nisi admin.");
    }
  }
  
}
