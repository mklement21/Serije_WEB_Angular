const ds = require("fs/promises");
const jwt = require("./moduli/jwt.js");
const Autentifikacija = require("./autentifikacija.js");
const path = require('path');

class HtmlUpravitelj {
    constructor(tajniKljucJWT, fetchUpravitelj) {
        this.tajniKljucJWT = tajniKljucJWT;
        this.fetchUpravitelj = fetchUpravitelj;
        this.auth = new Autentifikacija();
    }

    async pocetna(zahtjev, odgovor) {
        let korisnik = zahtjev.session.korisnik;
        let stranica = await this.ucitajStranicu(zahtjev, "pocetna", "");
        stranica = stranica.replace("#dobrodosli#", `Dobrodošli, ${korisnik}`);
        console.log("Sesija nakon prijave:", zahtjev.session);
        odgovor.send(stranica);
    }

    async registracija(zahtjev, odgovor) {
        console.log(zahtjev.body);
        let greska = "";
    
        if (zahtjev.method == "POST") {
            var jwtToken = jwt.provjeriToken(zahtjev);
            if (!jwtToken || jwtToken.status !== 1) {
                console.log("NISI ADMIN");
                greska = "Samo administratori mogu dodati nove korisnike!";
                let stranica = await this.ucitajStranicu(zahtjev, "registracija", greska);
                return odgovor.send(stranica);
            } else {
                let uspjeh = await this.auth.dodajKorisnika(zahtjev.body);
                if (uspjeh) {
                    var korisnik = await this.auth.prijaviKorisnika(zahtjev, zahtjev.body.korime, zahtjev.body.lozinka);
                    if (korisnik) {
                        korisnik = JSON.parse(korisnik);
                        zahtjev.session.korisnik = korisnik.ime + " " + korisnik.prezime;
                        zahtjev.session.korime = korisnik.korime;
                        console.log(korisnik);
                        console.log(zahtjev.session);
    
                        let token = jwt.kreirajToken(korisnik, this.tajniKljucJWT);
                        console.log("Token kreiran:", token);
                        zahtjev.session.jwtToken = token;
                        odgovor.redirect("/");
                        return;
                    } else {
                        greska = "Prijavljivanje nakon registracije nije uspjelo!";
                    }
                } else {
                    greska = "Dodavanje nije uspjelo, provjerite podatke!";
                }
            }
        }
    
        let stranica = await this.ucitajStranicu(zahtjev, "registracija", greska);
        odgovor.send(stranica);
    }

    async odjava(zahtjev, odgovor) {
        zahtjev.session.jwt = null;
        zahtjev.session.jwtToken = null;
        zahtjev.session.korisnik = null;
        zahtjev.session.korime = null;
        odgovor.redirect("/");
    }

    async dokumentacija(zahtjev, odgovor) {
        try {
            let stranica = await this.ucitajStranicu(zahtjev, "dokumentacija");
            let korisnik = zahtjev.session.korisnik;
            stranica = stranica.replace("#logiraniKorisnik#", `${korisnik}`);
            odgovor.send(stranica);
        } catch (error) {
            console.error("Error reading HTML file:", error);
            odgovor.status(500).send("Internal Server Error");
        }
    }

    async prijava(zahtjev, odgovor) {
        let greska = "";

        if (zahtjev.method == "POST") {
            var korime = zahtjev.body.korime;
            var lozinka = zahtjev.body.lozinka;
            var korisnik = await this.auth.prijaviKorisnika(zahtjev, korime, lozinka);

            if (korisnik) {
                korisnik = JSON.parse(korisnik);
                zahtjev.session.korisnik = korisnik.ime + " " + korisnik.prezime;
                zahtjev.session.korime = korisnik.korime;
                console.log(korisnik);
                console.log(zahtjev.session);
                let token = jwt.kreirajToken(korisnik, this.tajniKljucJWT);
                console.log("Token kreiran:", token);
                zahtjev.session.jwtToken = token;
                odgovor.redirect("/");
                return;
            } else {
                greska = "Netočna lozinka ili korisnik nije pronađen!";
            }
        } else {
            greska = "student student, admin rwa, obican rwa, moderator rwa!";
        }

        let stranica = await this.ucitajStranicu(zahtjev, "prijava", greska);
        odgovor.send(stranica);
    }

    async serijePretrazivanje(zahtjev, odgovor) {
        let stranica;
        if (zahtjev.session.jwtToken) {
            stranica = await this.ucitajStranicu(zahtjev, "serije_pretrazivanje", "");
            let korisnik = zahtjev.session.korisnik;
            stranica = stranica.replace("#logiraniKorisnik#", `${korisnik}`);
        } else {
            stranica = await this.ucitajStranicu(zahtjev, "serije_pretrazivanje", "");
        }
        odgovor.send(stranica);
    }

    async detaljiSerije(zahtjev, odgovor) {
        console.log("Sesija detalji:", zahtjev.session);
        let stranica = await this.ucitajStranicu(zahtjev, "serija_detalji", "");
        let korisnik = zahtjev.session.korisnik;
        stranica = stranica.replace("#logiraniKorisnik#", `${korisnik}`);
        odgovor.send(stranica);
    }

    async profil(zahtjev, odgovor) {
        console.log("Sesija profil:", zahtjev.session);
        let stranica = await this.ucitajStranicu(zahtjev, "profil", "");
        let korisnik = zahtjev.session.korisnik;
        stranica = stranica.replace("#logiraniKorisnik#", `${korisnik}`);
        odgovor.send(stranica);
    }

    async ucitajStranicu(zahtjev, nazivStranice, poruka = "") {
        try {
            if (!nazivStranice || typeof nazivStranice !== "string") {
                throw new Error("Naziv stranice nije ispravno postavljen.");
            }
            let stranica;
            
            console.log("Naziv stranice:", nazivStranice);

            if (nazivStranice !== "dokumentacija") {
                let stranice = [this.ucitajHTML(nazivStranice), this.ucitajHTML("navigacija")];
                let [stranicaHTML, nav] = await Promise.all(stranice);
                stranica = stranicaHTML.replace("#navigacija#", nav);
                stranica = this.prilagodiNavigaciju(zahtjev, stranica);
            } else {
                let stranice = [this.ucitajDokumentacija(nazivStranice), this.ucitajHTML("navigacija")];
                let [stranicaHTML, nav] = await Promise.all(stranice);
                stranica = stranicaHTML.replace("#navigacija#", nav);
                stranica = this.prilagodiNavigaciju(zahtjev, stranica);
            }

            stranica = stranica.replace("#poruka#", poruka);
            return stranica;
        } catch (error) {
            console.error("Greška pri učitavanju stranice:", error.message);
            return "Greška pri učitavanju stranice.";
        }
    }

    async ucitajHTML(htmlStranica) {
        return ds.readFile(__dirname + "/html/" + htmlStranica + ".html", "UTF-8");
    }

    async ucitajDokumentacija(htmlStranica) {
        const dokumentacijaPath = __dirname + "/../dokumentacija/" + htmlStranica + ".html";
        return ds.readFile(dokumentacijaPath, "UTF-8");
    }
    
    prilagodiNavigaciju(zahtjev, stranica) {
        var jwtToken = jwt.provjeriToken(zahtjev);
        if (zahtjev.session.korisnik) {
            stranica = stranica.replace('id="odjava" style="display:none"', 'id="odjava"');
            stranica = stranica.replace('id="prijava"', 'id="prijava" style="display:none"');
            stranica = stranica.replace('id="serijePretrazivanje" style="display:none"', 'id="serijePretrazivanje"');
            stranica = stranica.replace('id="profil" style="display:none"', 'id="profil"');

            zahtjev.session.status = jwtToken.status;
            zahtjev.session.uloga = jwtToken.uloga;

            if (jwtToken.status == 1) {
                stranica = stranica.replace('id="registracija"', 'id="registracija"');
            } else {
                stranica = stranica.replace('id="registracija"', 'id="registracija" style="display:none"');
            }
        } else {
            stranica = stranica.replace('id="odjava"', 'id="odjava" style="display:none"');
            stranica = stranica.replace('id="prijava"', 'id="prijava"');
            stranica = stranica.replace('id="registracija"', 'id="registracija"');
            stranica = stranica.replace('id="profil"', 'id="profil" style="display:none"');
        }
        return stranica;
    }
}

module.exports = HtmlUpravitelj;
