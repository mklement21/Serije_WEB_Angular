import express from "express";
import kolacici from "cookie-parser";
import sesija from "express-session";
import Konfiguracija from "./konfiguracija.js";
import restKorisnik from "./servis/restKorisnik.js";

import RestTMDB from "./servis/restTMDB.js";
import HtmlUpravitelj from "./htmlUpravitelj.js";
import FetchUpravitelj from "./fetchUpravitelj.js";
import cors from "cors";
import path, { dirname } from 'path';
const __dirname = path.resolve();

const port = 12000;
const server = express();

let konf = new Konfiguracija();
konf
	.ucitajKonfiguraciju()
	.then(pokreniServer)
	.catch((greska) => {
		console.log(greska);
		if (process.argv.length == 2) {
			console.error("Molim unesite naziv datoteke!");
		} else {
			console.error("Naziv datoteke nije dobar: " + greska.path);
		}
	});

function pokreniServer() {

	server.use(express.urlencoded({ extended: true }));
	server.use(express.json());
	server.use(cors());

	server.use(kolacici());
	server.use(
		sesija({
			secret: konf.dajKonf().tajniKljucSesija,
			saveUninitialized: true,
			cookie: { maxAge: 1000 * 60 * 60 * 3 },
			resave: false,
		})
	);

	server.use("/js", express.static("./aplikacija/js"));
	server.use("/css", express.static("./aplikacija/css"));

	pripremiPutanjeKorisnik();
	pripremiPutanjeTMDB();
	pripremiPutanjePretrazivanjeSerija();
	pripremiPutanjeAutentifikacija();
	pripremiPutanjeProfil();

	server.use( "/", express.static('./angular/browser'));
    server.get("*", (zahtjev, odgovor) => {
        odgovor.sendFile(__dirname + '/angular/browser/index.html');
    });

	server.use((zahtjev, odgovor) => {
		odgovor.status(404);
		odgovor.json({ opis: "nema resursa" });
	});
	server.listen(port, () => {
		console.log(`Server pokrenut na portu: ${port}`);
	});

	let fetchUpravitelj = new FetchUpravitelj(konf.dajKonf().jwtTajniKljuc);

	server.use((zahtjev, odgovor, next) => {
    	fetchUpravitelj.provjeriAutorizaciju(zahtjev, odgovor, next);
	});
}

function pripremiPutanjeKorisnik() {
	server.get("/baza/korisnici", restKorisnik.getKorisnici);
	server.post("/baza/korisnici", restKorisnik.postKorisnici);
	server.put("/baza/korisnici", restKorisnik.putKorisnici);
	server.delete("/baza/korisnici", restKorisnik.deleteKorisnici);

	server.get("/baza/korisnici/:korime", restKorisnik.getKorisnik);
	server.post("/baza/korisnici/:korime", restKorisnik.postKorisnik);
	server.put("/baza/korisnici/:korime", restKorisnik.putKorisnik);
	server.delete("/baza/korisnici/:korime", restKorisnik.deleteKorisnik);
	server.post("/baza/korisnici/:korime/prijava",restKorisnik.getKorisnikPrijava);
}

function pripremiPutanjeTMDB() {
    let fetchUpravitelj = new FetchUpravitelj(konf.dajKonf().jwtTajniKljuc);
    let restTMDB = new RestTMDB(konf.dajKonf()["tmdb.apikey.v3"]);
    server.get("/dajKonfiguraciju", (zahtjev, odgovor) => fetchUpravitelj.dajKonfiguraciju(zahtjev, odgovor, konf));
    server.get("/api/tmdb/serije", restTMDB.getSerije.bind(restTMDB));
    server.get("/api/tmdb/serije/:id", restTMDB.getDetaljiSerije.bind(restTMDB));
}

function pripremiPutanjePretrazivanjeSerija() {
	let fetchUpravitelj = new FetchUpravitelj(konf.dajKonf().jwtTajniKljuc);
	server.post("/dodajSeriju", fetchUpravitelj.dodajSeriju.bind(fetchUpravitelj));
}

function pripremiPutanjeAutentifikacija() {
	let fetchUpravitelj = new FetchUpravitelj(konf.dajKonf().jwtTajniKljuc);
	let htmlUpravitelj = new HtmlUpravitelj(konf.dajKonf().jwtTajniKljuc, fetchUpravitelj);
	server.post("/registracija", htmlUpravitelj.registracija.bind(htmlUpravitelj));
    server.post("/prijava", htmlUpravitelj.prijava);
	server.post("/registracija", htmlUpravitelj.registracija);
	server.get("/getJWT", fetchUpravitelj.getJWT.bind(fetchUpravitelj));
    server.get("/aktivacijaRacuna",fetchUpravitelj.aktvacijaRacuna.bind(fetchUpravitelj));
}

function pripremiPutanjeProfil() {
    let fetchUpravitelj = new FetchUpravitelj(konf.dajKonf().jwtTajniKljuc);
    server.post("/profil", fetchUpravitelj.dohvatiPrijavljenogKorisnika.bind(fetchUpravitelj));
}


