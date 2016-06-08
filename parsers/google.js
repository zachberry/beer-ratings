module.exports = {
	parse: function(html)
	{
		var cheerio = require('cheerio');

		var $ = cheerio.load(html);

		var matches = [];

		$('.g').each(function() {
			var $this = $(this);

			//BEER is a STYLE brewed by BREWERY in LOCATION.

			var baRegex = /www\.beeradvocate\.com\/beer\/profile\/[0-9]+\/[0-9]+\//;
			if(baRegex.test($this.text()))
			{
				try
				{
					var textRegex = /(.*) +is +a +(.*) +brewed +by +(.*) +in +/;

					var $link = $(this).find('a');
					var href = $link.attr('href').substr(7);

					href = href.substr(0, href.indexOf("&"));
					var linkTitle = $link.text();
					linkTitle = linkTitle.substr(0, linkTitle.lastIndexOf(" - Beer Advocate"));
					linkTitle = linkTitle.substr(0, linkTitle.lastIndexOf("..."));
					// var rating = $(this).find('.f.slp').text();
					var rating = $(this).find('.st').text();

					var percRegex = /([0-9]+\%)/;
					var match = rating.match(percRegex);
					var perc = 0;
					if(match !== null)
					{
						var perc = parseInt(match[0], 10);
					}

					//var tokens = linkTitle.split("|");

					//var name = tokens[0];
					//var brewery = tokens[1];
					var meat = $this.find('.st').text();
					if(meat.indexOf(" ... ") > -1)
					{
						meat = meat.substr(meat.indexOf(" ... ") + 5);
					}
					// remove newlines
					meat = meat.replace(/\n/g, " ");
					var meatMatches = meat.match(textRegex);

					if(meatMatches)
					{
						var name = meatMatches[1];
						var brewery = meatMatches[3];

						matches.push({
							"name": (name ? name.trim() : ''),
							"brewery": (brewery ? brewery.trim() : ''),
							"rating": perc,
							"url": (href ? href.trim() : '')
						});
					}
				}
				catch(e)
				{
					console.log(e);
				}
			}
		});

		var filtered = {};
		var filteredArray = [];
		var curMatch;
		for(var i in matches)
		{
			curMatch = matches[i];
			if(typeof filtered[curMatch.name] === "undefined")
			{
				filtered[curMatch.name] = true;
				filteredArray.push(curMatch);
			}
		}

		return filteredArray;
	}
};