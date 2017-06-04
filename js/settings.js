var configCookieName = 'BitclashConfig';
var tokenOAuth;
var colorDialog = new ColorDialog($('#colorDialog'));

var getConfiguration = function (resetOneTimeSettings) {
	var config;
	try {config = JSON.parse(getCookie(configCookieName))} catch (e) {config = {}}

	config = {
		'testMode'           : (['disabled', 'enabled'].indexOf(config.testMode) != -1 ? config.testMode : 'disabled'),
		'resetDefenderName'  : ([undefined, null].indexOf(config.resetDefenderName) == -1 ? config.resetDefenderName : ''),
		'resetDefenderHP'    : (isFinite(config.resetDefenderHP) && config.resetDefenderHP !== '' ? Math.ceil(Math.min(Math.max(config.resetDefenderHP, 1), 1000000)) : ''),
		'resetDefenderMaxHP' : (isFinite(config.resetDefenderMaxHP) && config.resetDefenderMaxHP !== '' ? Math.ceil(Math.min(Math.max(config.resetDefenderMaxHP, 1), 1000000)) : ''),
		'view'               : (['wide', 'normal', 'compact', 'tiny'].indexOf(config.view) != -1 ? config.view : 'normal'),
		'bgcolorR'           : (isFinite(config.bgcolorR) ? Math.min(Math.max(config.bgcolorR, 0), 255) : 255),
		'bgcolorG'           : (isFinite(config.bgcolorG) ? Math.min(Math.max(config.bgcolorG, 0), 255) : 255),
		'bgcolorB'           : (isFinite(config.bgcolorB) ? Math.min(Math.max(config.bgcolorB, 0), 255) : 255),
		'bgcolorA'           : (isFinite(config.bgcolorA) ? Math.min(Math.max(config.bgcolorA, 0), 255) : 0),
		'textFont'           : ([undefined, null].indexOf(config.textFont) == -1 ? config.textFont : 'VT323'),
		'fgcolorR'           : (isFinite(config.fgcolorR) ? Math.min(Math.max(config.fgcolorR, 0), 255) : 255),
		'fgcolorG'           : (isFinite(config.fgcolorG) ? Math.min(Math.max(config.fgcolorG, 0), 255) : 255),
		'fgcolorB'           : (isFinite(config.fgcolorB) ? Math.min(Math.max(config.fgcolorB, 0), 255) : 255),
		'fgcolorA'           : (isFinite(config.fgcolorA) ? Math.min(Math.max(config.fgcolorA, 0), 255) : 255),
		'fgshadowR'          : (isFinite(config.fgshadowR) ? Math.min(Math.max(config.fgshadowR, 0), 255) : 0),
		'fgshadowG'          : (isFinite(config.fgshadowG) ? Math.min(Math.max(config.fgshadowG, 0), 255) : 0),
		'fgshadowB'          : (isFinite(config.fgshadowB) ? Math.min(Math.max(config.fgshadowB, 0), 255) : 0),
		'fgshadowA'          : (isFinite(config.fgshadowA) ? Math.min(Math.max(config.fgshadowA, 0), 255) : 204),
		'defaultImageURL'    : ([undefined, null].indexOf(config.defaultImageURL) == -1 ? config.defaultImageURL : ''),
		'volume'             : (isFinite(config.volume) ? Math.min(Math.max(config.volume, 0), 100) : 20),
		'criticalMin'        : (isFinite(config.criticalMin) ? Math.max(config.criticalMin, 1) : 2),
		'criticalMax'        : (isFinite(config.criticalMax) ? Math.max(config.criticalMax, 1) : 3),
		'criticalChance'     : (isFinite(config.criticalChance) ? Math.min(Math.max(config.criticalChance, 0), 100) : 10),
		'victoryMultiplier'  : (isFinite(config.victoryMultiplier) ? Math.max(config.victoryMultiplier, 1) : 2),
		'victoryMin'         : (isFinite(config.victoryMin) && config.victoryMin !== '' ? Math.ceil(Math.min(Math.max(config.victoryMin, 1), 1000000)) : ''),
		'victoryMax'         : (isFinite(config.victoryMax) && config.victoryMax !== '' ? Math.ceil(Math.min(Math.max(config.victoryMax, 1), 1000000)) : '')
	};

	if (isFinite(config.resetDefenderHP) && isFinite(config.resetDefenderMaxHP) && config.resetDefenderMaxHP < config.resetDefenderHP) {config.resetDefenderMaxHP = config.resetDefenderHP}
	if (config.criticalMax < config.criticalMin) {config.criticalMax = config.criticalMin}
	if (isFinite(config.victoryMin) && isFinite(config.victoryMax) && config.victoryMax < config.victoryMin) {config.victoryMax = config.victoryMin}

	if (resetOneTimeSettings === true) {
		config.resetDefenderName = '';
		config.resetDefenderHP = '';
		config.resetDefenderMaxHP = '';
	}

	setCookie(configCookieName, JSON.stringify(config), true);

	return config;
}

var loadConfiguration = function (resetOneTimeSettings) {
	var config = getConfiguration((resetOneTimeSettings === true));

	$('#testMode').val(config.testMode);
	$('#resetDefenderName').val(config.resetDefenderName);
	$('#resetDefenderHP').val(config.resetDefenderHP);
	$('#resetDefenderMaxHP').val(config.resetDefenderMaxHP);
	$('#view').val(config.view);
	$('#bgcolorRGB').val([config.bgcolorR, config.bgcolorG, config.bgcolorB].join(','));
	$('#bgcolorA').val(config.bgcolorA);
	$('#textFont').val(config.textFont);
	$('#fgcolorRGB').val([config.fgcolorR, config.fgcolorG, config.fgcolorB].join(','));
	$('#fgcolorA').val(config.fgcolorA);
	$('#fgshadowRGB').val([config.fgshadowR, config.fgshadowG, config.fgshadowB].join(','));
	$('#fgshadowA').val(config.fgshadowA);
	$('#defaultImageURL').val(config.defaultImageURL);
	$('#volume').val(config.volume);
	$('#criticalMin').val(config.criticalMin);
	$('#criticalMax').val(config.criticalMax);
	$('#criticalChance').val(config.criticalChance);
	$('#victoryMultiplier').val(config.victoryMultiplier);
	$('#victoryMin').val(config.victoryMin);
	$('#victoryMax').val(config.victoryMax);

	$('#background .colorSample').css('background-color', 'rgb(' + $('#bgcolorRGB').val() + ')');
	$('#text .colorSample').css('background-color', 'rgb(' + $('#fgcolorRGB').val() + ')');
	$('#textShadow .colorSample').css('background-color', 'rgb(' + $('#fgshadowRGB').val() + ')');

	$('#authorize, #reauthorize').prop('disabled', false);
	$('#applySettings, #cancelSettings').prop('disabled', true);

	updateURL();
	updateWarnings();
	updateSampleView();
	updateSampleText();
	updateSampleImage();
};

var saveConfiguration = function () {
	var config = {
		'testMode'           : $('#testMode').val(),
		'resetDefenderName'  : $('#resetDefenderName').val(),
		'resetDefenderHP'    : $('#resetDefenderHP').val(),
		'resetDefenderMaxHP' : $('#resetDefenderMaxHP').val(),
		'view'               : $('#view').val(),
		'bgcolorR'           : $('#bgcolorRGB').val().split(',')[0],
		'bgcolorG'           : $('#bgcolorRGB').val().split(',')[1],
		'bgcolorB'           : $('#bgcolorRGB').val().split(',')[2],
		'bgcolorA'           : $('#bgcolorA').val(),
		'textFont'           : $('#textFont').val(),
		'fgcolorR'           : $('#fgcolorRGB').val().split(',')[0],
		'fgcolorG'           : $('#fgcolorRGB').val().split(',')[1],
		'fgcolorB'           : $('#fgcolorRGB').val().split(',')[2],
		'fgcolorA'           : $('#fgcolorA').val(),
		'fgshadowR'          : $('#fgshadowRGB').val().split(',')[0],
		'fgshadowG'          : $('#fgshadowRGB').val().split(',')[1],
		'fgshadowB'          : $('#fgshadowRGB').val().split(',')[2],
		'fgshadowA'          : $('#fgshadowA').val(),
		'defaultImageURL'    : $('#defaultImageURL').val(),
		'volume'             : $('#volume').val(),
		'criticalMin'        : $('#criticalMin').val(),
		'criticalMax'        : $('#criticalMax').val(),
		'criticalChance'     : $('#criticalChance').val(),
		'victoryMultiplier'  : $('#victoryMultiplier').val(),
		'victoryMin'         : $('#victoryMin').val(),
		'victoryMax'         : $('#victoryMax').val()
	};

	setCookie(configCookieName, JSON.stringify(config), true);

	$('#authorize, #reauthorize').prop('disabled', false);
	$('#applySettings, #cancelSettings').prop('disabled', true);

	updateURL();
};

var authorize = function () {
	var config = getConfiguration();

	// check permissions
	var force = true;
	var scope = ['user_read'];
	if (config.testMode === 'enabled') {
		scope.push('chat_login');
	}
	if (tokenOAuth && tokenOAuth.scope && tokenOAuth.scope.length == scope.length) {
		var match = true;
		for (var i in scope.length) {
			if (tokenOAuth.scope.indexOf(scope[i]) == -1) {
				match = false;
				break;
			}
		}
		for (var i in tokenOAuth.scope.length) {
			if (scope.indexOf(tokenOAuth.scope[i]) == -1) {
				match = false;
				break;
			}
		}
		if (match) {force = false}
	}

	// open popup to authorize application for Twitch account
	window.open(getAuthorizationURL(scope, force), '', 'width=425,height=525');
};

var updateURL = function () {
	$('li.authorized').hide();
	$('li.unauthorized').hide();

	var tokenOAuth;
	try {
		tokenOAuth = JSON.parse(getCookie(oauthCookieName));
	} catch (e) {
		$('li.unauthorized').show();
		$('#url').text('Bitclash requires authorization').css('font-style', 'italic').css('color', 'silver');
		return;
	}

	$('li.authorized').show();

	var config = getConfiguration();
	if (config.testMode === 'enabled' && tokenOAuth.scope.indexOf('chat_login') == -1) {
		$('#url').text('Bitclash requires re-authorization').css('font-style', 'italic').css('color', 'silver');
		return;
	}

	var url = appURL + '?oauth=' + urlEncode(tokenOAuth.token);
	url += (config.testMode === 'enabled' ? '&test' : '');
	url += '&view=' + config.view;
	url += '&bg=' + [config.bgcolorR, config.bgcolorG, config.bgcolorB, config.bgcolorA].join(',');
	url += '&font=' + urlEncode(config.textFont);
	url += '&fg=' + [config.fgcolorR, config.fgcolorG, config.fgcolorB, config.fgcolorA].join(',');
	url += '&sh=' + [config.fgshadowR, config.fgshadowG, config.fgshadowB, config.fgshadowA].join(',');
	url += (config.defaultImageURL.length ? '&img=' + urlEncode(config.defaultImageURL) : '');
	url += '&vol=' + config.volume;
	url += '&crit=' + [config.criticalMin, config.criticalMax, config.criticalChance].join(',');
	url += '&win=' + [config.victoryMultiplier, config.victoryMin, config.victoryMax].join(',');
	url += (config.resetDefenderName !== '' || config.resetDefenderHP !== '' || config.resetDefenderMaxHP !== '' ? '&force=' + [$.now(), config.resetDefenderName, config.resetDefenderHP, config.resetDefenderMaxHP].join(',') : '');

	$('#url').text(url).css('font-style', 'initial').css('color', 'initial');

	if (!$('#applySettings').prop('disabled')) {$('#url').css('color', 'silver')}
};

var updateWarnings = function () {
	$('.testModeEnabled').hide();
	if ($('#testMode').val() === 'enabled') {$('.testModeEnabled').show()}

	$('.resetEnabled').hide();
	if ($('#resetDefenderName').val() !== '' || $('#resetDefenderHP').val() !== '' || $('#resetDefenderMaxHP').val() !== '') {$('.resetEnabled').show()}
};

var updateFontList = function () {
	$('#textFont').empty();
	var fonts = getWebFonts();
	for (var i in fonts) {
		$('#textFont').append($('<option>').attr('value', fonts[i]).text(fonts[i]));
	}

	var config = getConfiguration();
	$('#textFont').val(config.textFont);
	updateSampleText();
}

var updateSampleView = function () {
	$('#sampleView img').hide();
	$('#sampleView img.' + $('#view').val()).show();
};

var updateSampleText = function () {
	var bgcolor = 'rgba(' + [$('#bgcolorRGB').val(), $('#bgcolorA').val() / 255].join(', ') + ')';
	var textFont = ([undefined, null].indexOf($('#textFont').val()) == -1 ? $('#textFont').val() : 'VT323');
	var fgcolor = 'rgba(' + [$('#fgcolorRGB').val(), $('#fgcolorA').val() / 255].join(', ') + ')';
	var fgshadow = 'rgba(' + [$('#fgshadowRGB').val(), $('#fgshadowA').val() / 255].join(', ') + ')';

	loadWebFont(textFont, {'text' : 'Bitclash'});

	$('#sampleText').css({
		'background'  : bgcolor,
		'font-family' : '\'' + textFont.replace(/[\\']/g, '\\$&') + '\', sans-serif',
		'color'       : fgcolor,
		'text-shadow' : '0 1px 4px ' + fgshadow
	});
};

var updateSampleImage = function () {
	$('li.defaultImageSelected').hide();

	if ($('#defaultImageURL').val().length) {
		$('li.defaultImageSelected').show();
		$('#sampleImage').css('background-image', 'url(\'' + $('#defaultImageURL').val() + '\')');
	}
};

var loadOAuth = function () {
	var oauth;
	try {
		oauth = JSON.parse(getCookie(oauthCookieName));
	} catch (e) {
		oauth = undefined;
	}

	if (JSON.stringify(oauth) !== JSON.stringify(tokenOAuth)) {
		tokenOAuth = oauth;
		updateURL();
	}
}

var init = function () {
	initWebFonts(updateFontList);

	// set event listeners
	window.setInterval(loadOAuth, 1000);
	$('#url').on('click', function () {
		if ($('#applySettings').prop('disabled')) {$('#url').selectText()}
	});
	$('#testMode, #resetDefenderName, #resetDefenderHP, #resetDefenderMaxHP').on('change', function () {
		updateWarnings();
	});
	$('#authorize, #reauthorize').on('click', authorize);
	$('#applySettings').on('click', function () {
		colorDialog.submit();
		saveConfiguration();
	});
	$('#cancelSettings').on('click',  function () {
		colorDialog.submit();
		loadConfiguration();
	});
	$('input, select').on('input change', function () {
		$('#authorize, #reauthorize').prop('disabled', true);
		$('#applySettings, #cancelSettings').prop('disabled', false);
		updateURL();
	});
	$('#view').on('change', updateSampleView);
	$('#background .colorInput, #text .colorInput, #textShadow .colorInput').click(function (event) {
		if (event.isDefaultPrevented()) {return}
		colorDialog.show(this);
		event.preventDefault();
	});
	$('#background input, #text input, #textShadow input').on('input change', updateSampleText);
	$('#textFont').on('input', updateSampleText);
	$('#defaultImageURL').on('change', updateSampleImage);

	// initialise form
	loadConfiguration(true);
};

$(document).ready(function () {loadAPIAuth(init)});
