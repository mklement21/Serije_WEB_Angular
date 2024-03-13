const SerijePretrazivanje = require("./serijePretrazivanje.js");
const jwt = require("./moduli/jwt.js");
const Autentifikacija = require("./autentifikacija.js");

class FetchUpravitelj {
	constructor(tajniKljucJWT) {
		this.auth = new Autentifikacija();
		this.fp = new SerijePretrazivanje();
		this.tajniKljucJWT = tajniKljucJWT;
	}

	dajKonfiguraciju = async function (zahtjev, odgovor, konf) {
		odgovor.type('json');
	
		try {
			const tmdbApiKeyV3 = konf.dajTMDBApiKeyV3();
			const konfiguracija = { 'tmdb.apikey.v3': tmdbApiKeyV3 };
			odgovor.send(JSON.stringify(konfiguracija));
		} catch (error) {
			console.error(error);
			odgovor.status(500);
			odgovor.send({ greska: "Greška prilikom dohvaćanja konfiguracije", detalji: error.message });
		}
	};

	provjeriAutorizaciju = async function (zahtjev, odgovor, next) {
		const rezultatProvjere = await jwt.provjeriToken(zahtjev, this.tajniKljucJWT);
	
		if (rezultatProvjere.status === 200) {
			zahtjev.korisnickoIme = rezultatProvjere.korisnickoIme;
			return next();
		} else {
			odgovor.status(rezultatProvjere.status).json({ poruka: rezultatProvjere.poruka });
		}
	};

	aktvacijaRacuna = async function (zahtjev, odgovor) {
		console.log(zahtjev.query);
		let korime = zahtjev.query.korime;
		let kod = zahtjev.query.kod;

		let poruka = await this.auth.aktivirajKorisnickiRacun(korime, kod);
		console.log(poruka);

		if (poruka.status == 200) {
			odgovor.send(await poruka.text());
		} else {
			odgovor.send(await poruka.text());
		}
	};

	getJWT = async function (zahtjev, odgovor) {
		odgovor.type("json");
		if (zahtjev.session.korime != null) {
			let k = { korime: zahtjev.session.korime };
			console.log("jwtJWT");
			let noviToken = jwt.kreirajToken(k, this.tajniKljucJWT);
			odgovor.send({ ok: noviToken });
			return;
		}
		odgovor.status(401);
		odgovor.send({ greska: "nemam token!" });
	};

	serijePretrazivanje = async function (zahtjev, odgovor) {
		if (!jwt.provjeriToken(zahtjev, this.tajniKljucJWT)) {
			let str = zahtjev.query.str;
			let filter = zahtjev.query.filter;
			console.log(zahtjev.query);
			odgovor.json(await this.fp.dohvatiSerije(str, filter));
		} else {
			let str = zahtjev.query.str;
			let filter = zahtjev.query.filter;
			console.log(zahtjev.query);
			odgovor.json(await this.fp.dohvatiSerije(str, filter));
		}
	};

	dodajSeriju = async function (zahtjev, odgovor) {
		console.log(zahtjev.body);
		if (!jwt.provjeriToken(zahtjev, this.tajniKljucJWT)) {
			odgovor.status(401);
			odgovor.json({ greska: "Neautorizirani pristup, token nije dostupan!" });
			return;
		} else {
			odgovor.json({ ok: "OK" });
		}
	};

	dohvatiPrijavljenogKorisnika = async function (korime, konf) {
		let putanja = url + "/korisnici/" + korime + dajRestKorimeLozinka(konf);

		let zaglavlje = new Headers();
		let token = jwt.kreirajToken(konf.dajKonf()["rest.korime"]);
		zaglavlje.set("Authorization", token);

		let parametri = { method: 'GET', headers: zaglavlje };

		let odg = await fetch(putanja, parametri);
		let korisnik = await odg.text();

		if (odg.status != 200) {
			throw new Error("Neuspješan dohvat korisnika");
		} else {
			return JSON.parse(korisnik);
		}
	};
}
module.exports = FetchUpravitelj;

function dajRestKorimeLozinka(konf)
{
    let konfPodaci = konf.dajKonf();
    let restKorimeLozinka = "?korime=" + konfPodaci["rest.korime"] + "&lozinka=" + konfPodaci["rest.lozinka"];
    return restKorimeLozinka;
}
