var configCookieName = 'BitclashConfig';
var tokenOAuth;

var getConfiguration = function (resetOneTimeSettings) {
	var config;
	try {config = JSON.parse(getCookie(configCookieName))} catch (e) {config = {}}

	config = {
		'testMode'           : (['disabled', 'enabled'].indexOf(config.testMode) != -1 ? config.testMode : 'disabled'),
		'resetDefenderName'  : ([undefined, null].indexOf(config.resetDefenderName) == -1 ? config.resetDefenderName : ''),
		'resetDefenderHP'    : (isFinite(config.resetDefenderHP) && config.resetDefenderHP !== '' ? Math.ceil(Math.min(Math.max(config.resetDefenderHP, 1), 1000000)) : ''),
		'resetDefenderMaxHP' : (isFinite(config.resetDefenderMaxHP) && config.resetDefenderMaxHP !== '' ? Math.ceil(Math.min(Math.max(config.resetDefenderMaxHP, 1), 1000000)) : ''),
		'view'               : (['normal', 'compact', 'tiny'].indexOf(config.view) != -1 ? config.view : 'normal'),
		'bgcolorR'           : (isFinite(config.bgcolorR) ? Math.min(Math.max(config.bgcolorR, 0), 255) : 255),
		'bgcolorG'           : (isFinite(config.bgcolorG) ? Math.min(Math.max(config.bgcolorG, 0), 255) : 255),
		'bgcolorB'           : (isFinite(config.bgcolorB) ? Math.min(Math.max(config.bgcolorB, 0), 255) : 255),
		'bgcolorA'           : (isFinite(config.bgcolorA) ? Math.min(Math.max(config.bgcolorA, 0), 255) : 0),
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
	$('#bgcolorR').val(config.bgcolorR);
	$('#bgcolorG').val(config.bgcolorG);
	$('#bgcolorB').val(config.bgcolorB);
	$('#bgcolorA').val(config.bgcolorA);
	$('#fgcolorR').val(config.fgcolorR);
	$('#fgcolorG').val(config.fgcolorG);
	$('#fgcolorB').val(config.fgcolorB);
	$('#fgcolorA').val(config.fgcolorA);
	$('#fgshadowR').val(config.fgshadowR);
	$('#fgshadowG').val(config.fgshadowG);
	$('#fgshadowB').val(config.fgshadowB);
	$('#fgshadowA').val(config.fgshadowA);
	$('#defaultImageURL').val(config.defaultImageURL);
	$('#volume').val(config.volume);
	$('#criticalMin').val(config.criticalMin);
	$('#criticalMax').val(config.criticalMax);
	$('#criticalChance').val(config.criticalChance);
	$('#victoryMultiplier').val(config.victoryMultiplier);
	$('#victoryMin').val(config.victoryMin);
	$('#victoryMax').val(config.victoryMax);

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
		'bgcolorR'           : $('#bgcolorR').val(),
		'bgcolorG'           : $('#bgcolorG').val(),
		'bgcolorB'           : $('#bgcolorB').val(),
		'bgcolorA'           : $('#bgcolorA').val(),
		'fgcolorR'           : $('#fgcolorR').val(),
		'fgcolorG'           : $('#fgcolorG').val(),
		'fgcolorB'           : $('#fgcolorB').val(),
		'fgcolorA'           : $('#fgcolorA').val(),
		'fgshadowR'          : $('#fgshadowR').val(),
		'fgshadowG'          : $('#fgshadowG').val(),
		'fgshadowB'          : $('#fgshadowB').val(),
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
	var twitchAuthURL = apiURL;
	twitchAuthURL += 'oauth2/authorize?response_type=token';
	twitchAuthURL += '&client_id=' + clientID;
	twitchAuthURL += '&redirect_uri=' + urlEncode(authURL);
	twitchAuthURL += '&scope=' + urlEncode(scope.join(' '));
	twitchAuthURL += '&state=' + generateCSRFToken();
	if (force) {twitchAuthURL += '&force_verify=true'}

	window.open(twitchAuthURL, '', 'width=425,height=525');
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

var updateSampleView = function () {
	$('#sampleView img').hide();
	$('#sampleView img.' + $('#view').val()).show();
};

var updateSampleText = function () {
	var bgcolor = 'rgba(' + [$('#bgcolorR').val(), $('#bgcolorG').val(), $('#bgcolorB').val(), $('#bgcolorA').val() / 255].join(', ') + ')';
	var fgcolor = 'rgba(' + [$('#fgcolorR').val(), $('#fgcolorG').val(), $('#fgcolorB').val(), $('#fgcolorA').val() / 255].join(', ') + ')';
	var fgshadow = 'rgba(' + [$('#fgshadowR').val(), $('#fgshadowG').val(), $('#fgshadowB').val(), $('#fgshadowA').val() / 255].join(', ') + ')';

	$('#sampleText').css('background', bgcolor).css('color', fgcolor).css('text-shadow', '0 1px 4px ' + fgshadow);
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
	// set event listeners
	window.setInterval(loadOAuth, 1000);
	$('#url').on('click', function () {
		if ($('#applySettings').prop('disabled')) {$('#url').selectText()}
	});
	$('#testMode, #resetDefenderName, #resetDefenderHP, #resetDefenderMaxHP').on('change', function () {
		updateWarnings();
	});
	$('#authorize, #reauthorize').on('click', authorize);
	$('#applySettings').on('click', saveConfiguration);
	$('#cancelSettings').on('click', loadConfiguration);
	$('input, select').on('input change', function () {
		$('#applySettings, #cancelSettings').prop('disabled', false);
		updateURL();
	});
	$('#view').on('change', updateSampleView);
	$('#bgcolor input, #fgcolor input, #fgshadow input').on('input change', updateSampleText);
	$('#defaultImageURL').on('change', updateSampleImage);

	// initialise form
	loadConfiguration(true);
};

$(document).ready(init);
