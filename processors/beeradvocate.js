module.exports = {
	get: function(query, callback) {
		var request = require('request');
		var googleParser = require('../parsers/google');

		var url = "https://www.google.com/search?q=" + query + ' site:www.beeradvocate.com';

		request(url, function(error, response, html) {
			//@TODO
			//callback(html);

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
				beers: googleParser.parse(html)
			});
		});
	}
}