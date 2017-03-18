var extractToken = function () {
	var tokenOAuth, scopeOAuth, tokenCSRF;

	// URL should be of the form: {redirect URI}#access_token={OAuth token}&scope={scopes}&state={CSRF token}
	var args = $(location).prop('hash').replace(/^#/, '').split('&');
	for (var i in args) {
		var n = urlEncode(args[i].split('=')[0]), v = urlDecode(args[i].split('=').slice(1).join('='));
		switch (n) {
			case 'access_token':
				tokenOAuth = v;
				break;
			case 'scope':
				scopeOAuth = v.split(' ');
				break;
			case 'state':
				tokenCSRF = v;
				break;
		}
	}

	return (verifyCSRFToken(tokenCSRF) ? {'token' : tokenOAuth, 'scope' : scopeOAuth} : undefined);
};

var init = function () {
	var tokenOAuth = extractToken();
	if (tokenOAuth === undefined) {
		$('#authorize').text('Authorization failed');
	} else {
		setCookie(oauthCookieName, JSON.stringify(tokenOAuth), true);
		window.close();
	}
};

$(document).ready(init);
