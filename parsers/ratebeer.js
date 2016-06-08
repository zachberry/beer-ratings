module.exports = {
	parse: function(html)
	{
		var cheerio = require('cheerio');

		var $ = cheerio.load(html);

		var matches = [];

		var isBeersTable = false;

		$('table').each(function() {
			var $firstRow = $($(this).find('tr')[0]);
			var ratingsRegex = /ratings/;

			if(ratingsRegex.test($firstRow.text()))
			{
				$(this).find('tr').each(function() {
					var $this = $(this);

					var $tds = $this.children('td');

					var $nameCell = $($tds[0]);
					var $a = $($nameCell.find('a'));
					var href = 'http://www.ratebeer.com' + $a.attr('href');
					var beerName = $a.text().trim();

					var rating = parseInt($($tds[3]).text(), 10);

					if(beerName.length > 0)
					{
						matches.push({
							name: beerName,
							rating: rating || '?',
							url: href
						});
					}
				});
			}
		})



		return matches;
	}
};