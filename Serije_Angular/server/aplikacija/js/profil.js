let url = "http://localhost:12000/profil";
let poruka;
let podaci;

window.addEventListener("load", async () => {
    poruka = document.getElementById("poruka");
    let profil = document.getElementById("korisnikPodaci");

    try {
        let korisnik = await dohvatiPrijavljenogKorisnika();

        if (korisnik == null) {
            profil.innerHTML = "";
            poruka.innerHTML = "Neautorizirani pristup! Prijavite se!";
        } else {
            prikaziPodatkeKorisnika(korisnik);
        }
    } catch (error) {
        console.error("Error while fetching user data:", error);
        profil.innerHTML = "";
        poruka.innerHTML = "Došlo je do pogreške prilikom dohvaćanja podataka. Pokušajte ponovno.";
    }
});

async function dohvatiPrijavljenogKorisnika() {
    let parametri = { method: 'POST' };
    parametri = await dodajToken(parametri);

    let odgovor = await fetch(url + "/dohvatiPrijavljenogKorisnika", parametri);

    if (odgovor.status == 200) {
        let podaci = await odgovor.text();
        let korisnik = JSON.parse(podaci);
        return korisnik;
    } else {
        throw new Error("Neuspješan dohvat korisnika");
    }
}

function prikaziPodatkeKorisnika(korisnik) {
    let profil = document.getElementById("korisnikPodaci");
    let prikaz = "<ul>";
    let podaci = {
        "KORISNIČKO IME": korisnik.korime,
        "IME": korisnik.ime,
        "PREZIME": korisnik.prezime,
        "E-MAIL": korisnik.email
    };

    for (let p in podaci) {
        prikaz += "<li>";
        prikaz += "<label>" + p + "&nbsp;&nbsp;&nbsp;";

        if (!p.includes("KORISNIČKO") && !p.includes("E-MAIL"))
            prikaz += "<input type='text' id='" + p + "' value='" + podaci[p] + "'/></label>";
        else
            prikaz += podaci[p];

        prikaz += "</li>"
    }

    prikaz += "</ul>";
    profil.innerHTML = prikaz;
}
