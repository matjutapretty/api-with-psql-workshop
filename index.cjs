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
// const app = express();


const jwt = require('jsonwebtoken')

const garments = require('./garments.json');

const pg = require('pg');
const Pool = pg.Pool;

const API = require('./api.cjs');
const { default: axios } = require('axios');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static('public'));

const GarmentManager = require('./shop/garment-manager.cjs');
const UserManager = require('./shop/user-manager.cjs');
const ShoppingCart = require('./shop/shopping-cart.cjs');


const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://missy_tee:missy123@localhost:5432/missy_tee_app';
const pgp = PgPromise({});
const db = pgp(DATABASE_URL);
// const connectionString =
//   process.env.DATABASE_URL ||
//   'postgresql://missy_tee:missy123@localhost:5432/missy_tee_app';
// const pool = new Pool({
//   connectionString,
//   ssl: {
//     rejectUnauthorized: false,
//   },
// });

// Routes
app.get('/api/garments', async function(req, res){
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
app.get('/api/garments', async function(req, res){

	const gender = req.query.gender;
	const season = req.query.season;

	const filteredGarments = await garmentManager.filter({
		gender,
		season
	});

	res.json({ 
		garments : filteredGarments
	});
});

app.post('/api/garments', authenticateToken, (req, res) => {

	const {
		description,
		img,
		gender,
		season,
		price
	} = req.body;

	if (!description || !img || !price) {
		res.json({
			status: 'error',
			message: 'Please fill in the empty fields',
		});
	} else if (
		garments.find((garment) =>
		  _.isEqual(garment, {description, img, gender, season, price}),)) 
		{
		res.json({
		  status: 'error',
		  message: 'Garment already exists',
		});
	  }else {
		garments.push({
			description,
			img,
			gender,
			season,
			price
		});

		res.json({
			status: 'success',
			message: 'New garment added.',
		});
	}

});

app.get('/api/garments/price/:price', async function(req, res){
	const maxPrice = Number(req.params.price);
	const filteredGarments = garments.filter( garment => {

		if (maxPrice > 0) {
			return garment.price <= maxPrice;
		}
		return true;
	});

	res.json({ 
		garments : filteredGarments
	});
});
const generateAccessToken = (user) => {
	return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
	  expiresIn: '24h',
	});
  };
  
  app.post('/auth', (req, res) => {
	const username = req.query.username;
	if (username == 'matjutapretty') {
	  const user = {username: 'matjutapretty'};
	  const accessToken = generateAccessToken(user);

	  res.json({accessToken: accessToken});
	}
	res.sendStatus(401);
  });
  
  function authenticateToken(req, res, next) {
	const token = req.query.token;
	if (token == null) return res.sendStatus(401);
  
	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
	  if (err) return res.sendStatus(403);
	  req.user = user;
	  next();
	});
  }


API(app, db);
const PORT = process.env.PORT || 5001;

app.listen(PORT, function() {
    console.log(`App started on port ${PORT}`)
});