import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SerijaI } from './SerijaI';
import { SerijaDetaljiI } from './SerijaI';
import { environment } from '../../environments/environment';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})

export class SerijeService {
  private url = `${environment.adresa}:${environment.port}/api/tmdb/serije`;

  constructor(private http: HttpClient) {}

  dohvatiSerije(stranica: number, trazi: string): Observable<SerijaI[]> {
    const params = new HttpParams().set('stranica', stranica.toString()).set('trazi', trazi);
    return this.http.get<SerijaI[]>(this.url, { params });
  }

  dohvatiDetaljeSerije(serijaId: number): Observable<SerijaDetaljiI> {
    const konfiguracijaUrl = `${environment.adresa}:${environment.port}/dajKonfiguraciju`;

    return this.http.get<any>(konfiguracijaUrl).pipe(
      switchMap((konfiguracija) => {
        console.log('Konfiguracija:', konfiguracija['tmdb.apikey.v3']);
        const detaljiUrl = `https://api.themoviedb.org/3/tv/${serijaId}?api_key=${konfiguracija['tmdb.apikey.v3']}`;
        return this.http.get<SerijaDetaljiI>(detaljiUrl);
      })
    );
  }
}
