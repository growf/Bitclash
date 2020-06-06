// application URL
var appURL = 'http://growf.org/Bitclash/bitclash.html';

// cookies
var csrfCookieName = 'BitclashCSRF';
var oauthCookieName = 'BitclashOAuth';

// 3rd party API authentication object
var apiAuth;

// load 3rd party API authentication details
var loadAPIAuth = function (callback) {
	var authURL = appURL.replace(/^[^:]+:/, document.location.protocol).split('#')[0].split('?')[0].split('/').slice(0, -1).concat(['auth.json']).join('/');
	$.getJSON(authURL).done(function (data, textStatus, jqXHR) {apiAuth = data}).always(callback);
};

// set cookie
var setCookie = function (cookie, value, persistent) {
	if (cookie === undefined) {return}
	cookie = encodeURIComponent(cookie).replace(/%([3-7][02]|[2-7][13-9ADE]|[24-7]B|[3467]C|[2-6]F)/gi, decodeURIComponent);
	if (value === undefined) {
		document.cookie = cookie + '=' + (persistent ? '; expires=Thu, 01 Jan 1970 00:00:00 GMT' : '');
	} else {
		value = encodeURIComponent(value).replace(/%([3-7][02]|[2-7][13-9ADE]|[24-7]B|[3467]C|[2-6]F)/gi, decodeURIComponent);
		document.cookie = cookie + '=' + value + (persistent ? '; expires=Fri, 31 Dec 9999 23:59:59 GMT' : '');
	}
};

// get cookie
var getCookie = function (cookie) {
	if (cookie === undefined) {return}
	var cookies = document.cookie ? document.cookie.split('; ') : [];
	for (var i = 0; i < cookies.length; i++) {
		if (cookies[i].split('=')[0] === cookie) {
			var value = cookies[i].split('=').slice(1).join('=');
			if (value.charAt(0) === '"') {value = value.slice(1, -1)}
			return decodeURIComponent(value);
		}
	}
};

// generate CSRF cookie and return token
var generateCSRFToken = function () {
	// pseudorandom token for CSRF protection
	var tokenCSRF = Math.random().toString(36).slice(2);
	document.cookie = csrfCookieName + '=' + tokenCSRF;
	return tokenCSRF;
};

// verify CSRF token against cookie
var verifyCSRFToken = function (tokenCSRF) {
	if (tokenCSRF === undefined || tokenCSRF === '') {return false}
	var verified = (tokenCSRF === getCookie(csrfCookieName));
	if (verified) {setCookie(csrfCookieName, undefined)}
	return verified;
};

// helper function to fix URL encoding and decoding
var urlEncode = function (str) {
	return encodeURIComponent(str).replace(/%20/g, '+');
};

var urlDecode = function (str) {
	return decodeURIComponent(str.replace(/\+/g, '%20'));
};

// helper function for selecting text in a node
jQuery.fn.selectText = function () {
	var element = this[0];
	var range, selection;
	if (document.body.createTextRange) {
		range = document.body.createTextRange();
		range.moveToElementText(element);
		range.select();
	} else if (window.getSelection) {
		selection = window.getSelection();
		range = document.createRange();
		range.selectNodeContents(element);
		selection.removeAllRanges();
		selection.addRange(range);
	}
};
