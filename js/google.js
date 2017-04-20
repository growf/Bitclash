// Google API endpoint URL
var googleWebFontsAPIURL = 'https://www.googleapis.com/webfonts/v1/webfonts';
var googleFontsURL = 'https://fonts.googleapis.com/css';

var webFonts;
var loadedWebFonts = [];

var initWebFonts = function (callback) {
	$.ajax({
		'url'  : googleWebFontsAPIURL,
		'data' : {
			'key'  : apiAuth.Google.apiKey,
			'sort' : 'alpha'
		}
	}).done(function (data, textStatus, jqXHR) {
		webFonts = data;
		callback(true);
	}).fail(function (jqXHR, textStatus, errorThrown) {
		callback(false);
	});
};

var getWebFonts = function () {
	var fonts = [];
	if (webFonts && webFonts.items) {
		for (var i in webFonts.items) {
			if (webFonts.items[i].family) {fonts.push(webFonts.items[i].family)}
		}
	}
	if (!fonts.length) {
		fonts = ['VT323'];
	}
	return fonts;
};

var loadWebFont = function (family, options) {
	var fontData = 'family=' + urlEncode(family);
	if (options && options.styles && options.styles.length) {
		fontData += ':' + options.styles.map(urlEncode).join(',');
	}
	if (options && options.subsets && options.subsets.length) {
		fontData += '&subset=' + options.subsets.map(urlEncode).join(',');
	}
	if (options && options.text) {
		fontData += '&text=' + urlEncode(options.text);
	}
	if (options && options.effects && options.effects.length) {
		fontData += '&effect=' + options.effects.map(urlEncode).join('|');
	}

	if (loadedWebFonts.indexOf(fontData) != -1) {return};

	var fontURL = googleFontsURL + '?' + fontData;
	var fontCSS = $('<link>').attr('rel', 'stylesheet').attr('type', 'text/css').attr('href', fontURL);
	$('head').append(fontCSS);

	loadedWebFonts.push(fontData);
};
