export interface KorisnikI {
  id_korisnik: number;
  ime: string;
  prezime: string;
  korime: string;
  email: string;
  lozinka: string;
  slika: string;
  spol: string;
  datum_rodenja: string;
  telefon: string;
  opis: string;
  br_favorita: number;
  uloga_id: number;
  dvorazinskaAutentifikacija?: {
    ukljucena: boolean;
    tajniKljuc: string;
  };
}
