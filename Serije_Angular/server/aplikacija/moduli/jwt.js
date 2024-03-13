const jwt = require("jsonwebtoken");

function kreirajToken(korisnik, tajniKljucJWT, trajanje = "1d", algoritam = "HS256") {
    const ulogaMap = {
        1: 'Admin',
        2: 'Moderator',
        3: 'Student',
    };

    const ulogaId = korisnik.uloga_id;
    const uloga = ulogaMap[ulogaId];

    const token = jwt.sign(
        {
            korime: korisnik.korime,
            uloga: uloga,
            status: korisnik.uloga_id,
        },
        tajniKljucJWT,
        { expiresIn: trajanje, algorithm: algoritam }
    );

    console.log("Token kreiran:", token);
    return token;
}

function provjeriToken(zahtjev, tajniKljucJWT) {
    const token = zahtjev.session.jwtToken;

    if (zahtjev && zahtjev.headers && zahtjev.headers.authorization != null) {
        console.log("zahtjev headers autoriz", zahtjev.headers.authorization);
        let token = zahtjev.headers.authorization;
        try {
            let podaci = jwt.verify(token, tajniKljucJWT);
            console.log("JWT podaci: ", podaci);

            const tijelo = dajTijelo(token);
            const dijelovi = ispisiDijelove(token);
            console.log("Uloga korisnika:", tijelo.uloga);
            console.log("Uloga korisnika dijelovi:", dijelovi);

            ispisiDijelove(token);
            return true;
        } catch (e) {
            console.log(e)
            return false;
        }
    } else{
        return { status: 401, poruka: "Potrebna prijava" };
    }
}

function ispisiDijelove(token) {
    const dijelovi = token.split(".");
    const zaglavlje = dekodirajBase64(dijelovi[0]);
    console.log("Zaglavlje:", zaglavlje);
    const tijelo = dekodirajBase64(dijelovi[1]);
    console.log("Tijelo:", tijelo);
    const potpis = dekodirajBase64(dijelovi[2]);
    console.log("Potpis:", potpis);
}

function dajTijelo(token) {
    const dijelovi = token.split(".");
    return JSON.parse(dekodirajBase64(dijelovi[1]));
}

function dekodirajBase64(data) {
    const buff = Buffer.from(data, 'base64');
    return buff.toString('ascii');
}

module.exports = {
    kreirajToken,
    provjeriToken,
    ispisiDijelove,
    dajTijelo
};
