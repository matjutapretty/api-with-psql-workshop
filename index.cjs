const supertest = require('supertest');
const PgPromise = require("pg-promise")
const express = require('express');
const assert = require('assert');
const fs = require('fs');
require('dotenv').config();
// var observer = new MutationObserver(onMutate);

// import 'mutationobserver-shim';
// global.MutationObserver = window.MutationObserver;

// import Alpine from 'alpinejs'
// window.Alpine = Alpine
// Alpine.start()



const API = require('./api.cjs');
const { default: axios } = require('axios');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const DATABASE_URL = process.env.DATABASE_URL;
const pgp = PgPromise({});
const db = pgp(DATABASE_URL);

app.get('/api/garments', function(req, res){
	const gender = req.query.gender;
	const season = req.query.season;

	const filteredGarments = garments.filter(garment => {
		// if both gender & season was supplied
		if (gender != 'All' && season != 'All') {
			return garment.gender === gender
				&& garment.season === season;
		} else if (gender != 'All') { // if gender was supplied
			return garment.gender === gender
		} else if (season != 'All') { // if season was supplied
			return garment.season === season
		}
		return true;
	});
	
	res.json({ garments: filteredGarments });
});

API(app, db);
const PORT = process.env.PORT || 5001;

app.listen(PORT, function() {
    console.log(`App started on port ${PORT}`)
});