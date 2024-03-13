const TMDBklijent = require("./klijentTMDB.js");

class RestTMDB {
	constructor(api_kljuc) {
		this.tmdbKlijent = new TMDBklijent(api_kljuc);
		console.log(api_kljuc);

		this.tmdbKlijent.dohvatiSerije(500).then(console.log).catch(console.log);
	}

	async getDetaljiSerije(req, res) {
		const serijaId = req.params.id;
	
		try {
		  const detaljiSerije = await this.tmdbKlijent.dohvatiDetaljeSerije(serijaId);
	
		  if (detaljiSerije) {
			res.json(detaljiSerije);
		  } else {
			res.status(404).json({ error: 'Details not found' });
		  }
		} catch (error) {
		  console.error('Error fetching series details:', error);
		  res.status(500).json({ error: 'Internal Server Error' });
		}
	  }

	getSerije(zahtjev, odgovor) {
		console.log(this);
		odgovor.type("application/json");
		let stranica = zahtjev.query.stranica;
		let trazi = zahtjev.query.trazi;

		if (stranica == null || trazi == null) {
			odgovor.status("417");
			odgovor.send({ greska: "neocekivani podaci" });
			return;
		}

		this.tmdbKlijent
			.pretraziSerijePoNazivu(trazi, stranica)
			.then((serije) => {
				odgovor.send(serije);
			})
			.catch((greska) => {
				odgovor.json(greska);
			});
	}
}

module.exports = RestTMDB;
