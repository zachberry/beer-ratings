var config = require('./config');

var express = require('express');
var request = require('request');
var cors    = require('cors');

var baProcessor = require('./processors/beeradvocate');
var rbProcessor = require('./processors/ratebeer');

var app = express();

var debug = false;

app.use(cors())

app.get('/', function(req, res) {
	console.log('req:', req.originalUrl);

	if(typeof req.query.ba !== "undefined" && req.query.ba)
	{
		var url = "https://www.google.com/search?q=" + req.query.s + ' site:www.beeradvocate.com';

		request(url, function(error, response, html) {
			res.send(html);
		});
	}

	if(typeof req.query.debug !== "undefined" && req.query.debug)
	{
		debug = true;
	}

	if(typeof req.query.s === "undefined" || !req.query.s)
	{
		res.send({
			"error": "no query specified"
		});
		return;
	}

	var results = {
		'Beer Advocate': [],
		'RateBeer': []
	}

	var totalLeft = 2;

	baProcessor.get(req.query.s, function(result) {
		results['Beer Advocate'] = result.beers;
		totalLeft--;

		if(totalLeft === 0) correlate(results);
	});

	rbProcessor.get(req.query.s, function(result) {
		results['RateBeer'] = result.beers;
		totalLeft--;

		if(totalLeft === 0) correlate(results);
	});

	var correlate = function(results)
	{
		var correlated = {};
		var correlatedArray = [];
		var curSource;
		var curBeer;
		var curRecord;

		for(var siteKey in results)
		{
			curSource = results[siteKey];
			for(var i = 0, len = curSource.length; i < len; i++)
			{
				curBeer = curSource[i];

				if(!isNaN(curBeer.rating))
				{
					if(typeof correlated[curBeer.name] === "undefined")
					{
						correlated[curBeer.name] = {
							name: '',
							brewery: '',
							ratings: {},
							numRatings: 0,
							total: 0,
							average: 0,
							links: []
						};

						correlatedArray.push(correlated[curBeer.name]);
					}

					curRecord = correlated[curBeer.name];

					curRecord.name = curBeer.name;
					curRecord.brewery = curBeer.brewery;
					curRecord.numRatings++;
					curRecord.ratings[siteKey] = curBeer.rating;
					curRecord.total += curBeer.rating;
					curRecord.average = curRecord.total / curRecord.numRatings;

					if(curBeer.url)
					{
						curRecord.links.push(curBeer.url);
					}

					//curRecord.details.push(curBeer);
				}
			}
		}

		if(debug)
		{
			res.send({
				correlated: correlatedArray,
				results: results
			});
		}
		else
		{
			res.send(correlatedArray);
		}
	}
});



var server = app.listen(config.port, config.ip, function() {
	console.log('Listening on port', server.address().port);
});