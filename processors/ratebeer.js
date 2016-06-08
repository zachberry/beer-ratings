module.exports = {
	get: function(query, callback) {
		var request = require('request');
		var rbParser = require('../parsers/ratebeer');

		var url = "http://www.ratebeer.com/findbeer.asp";

		request.post({
			url: url,
			form: {
				"BeerName": query
			}
		}, function(error, response, html) {
			if(error)
			{
				callback({
					success: false,
					beers: []
				});
				return;
			}

			callback({
				success: true,
				beers: rbParser.parse(html)
			});
		});
	}
}