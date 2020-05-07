// Twitch API endpoint URLs
var twitchAuthURL = 'https://id.twitch.tv/oauth2';
var twitchAPIURL = 'https://api.twitch.tv/helix';
var twitchPubSubURL = 'wss://pubsub-edge.twitch.tv';

// PubSub state/event objects
var pubsubSocket;
var pubsubBackOff;
var pubsubPing;
var pubsubPong;

// send ping to PubSub
var pingPubSub = function () {
	// clear event
	pubsubPing = undefined;

	// schedule reconnection if PONG is not received within 10 seconds
	pubsubPong = window.setTimeout(reconnectPubSub, 10000);

	// send PING
	pubsubSocket.send(JSON.stringify({'type' : 'PING'}));
};

// receive message from PubSub
var receivePubSub = function (event) {
	var message;

	try {
		message = JSON.parse(event.data);
	} catch (e) {
		reconnectPubSub();
		return;
	}

	switch (message.type) {
		case 'RESPONSE':
			// The only response we'll receive is to our LISTEN message
			if (message.error) {
				// This is not a recoverable error; something is wrong with our request
				disconnectPubSub();
				switch (message.error) {
					case 'ERR_BADAUTH':
						showError('Application not authorized');
						break;
					case 'ERR_SERVER':
						showError('PubSub server error');
						break;
					default:
						showError('Unknown PubSub error');
				}
			}
			break;
		case 'MESSAGE':
			if (!message.data) {break}

			switch (message.data.topic) {
				case 'channel-bits-events-v2.' + user.id:
					try {
						var cheer = JSON.parse(message.data.message);
						if (!cheer.data.is_anonymous) {queueChallenger(cheer.data.user_id, cheer.data.user_name, cheer.data.bits_used)}
					} catch (e) {}
					break;
				case 'whispers.' + user.id:
					try {
						var whisper = JSON.parse(message.data.message);
						var bits = 0;
						var cheers = whisper.data_object.body.match(/\bclash([1-9]\d{0,3}|10000)\b/g);
						for (var i in cheers) {bits += parseInt(cheers[i].substr(5))}
						if (bits > 0 && bits <= 100000) {queueChallenger(whisper.data_object.from_id, whisper.data_object.tags.login, bits)}
					} catch (e) {}
					break;
			}
			break;
		case 'PONG':
			// clear event
			if (pubsubPong) {
				window.clearTimeout(pubsubPong);
				pubsubPong = undefined;
			}

			// schedule PING
			if (!pubsubPing) {pubsubPing = window.setTimeout(pingPubSub, Math.floor((3 + Math.random()) * 60000))}
			break;
		case 'RECONNECT':
			reconnectPubSub();
			break;
	}
};

// set listening topics for PubSub
var listenPubSub = function (event) {
	// reset back-off period
	pubsubBackOff = undefined;

	// schedule PING
	pubsubPing = window.setTimeout(pingPubSub, Math.floor((3 + Math.random()) * 60000));

	// send LISTEN
	var topics = (config.testMode ? ['whispers.' + user.id] : ['channel-bits-events-v2.' + user.id]);
	pubsubSocket.send(JSON.stringify({
		'type' : 'LISTEN',
		'data' : {
			'topics'     : topics,
			'auth_token' : config.token
		}
	}));
};

// disconnect from PubSub
var disconnectPubSub = function () {
	// clear events
	if (pubsubPing) {
		window.clearTimeout(pubsubPing);
		pubsubPing = undefined;
	}
	if (pubsubPong) {
		window.clearTimeout(pubsubPong);
		pubsubPong = undefined;
	}

	// clear event listeners
	pubsubSocket.onmessage = undefined;
	pubsubSocket.onerror = undefined;
	pubsubSocket.onclose = undefined;

	// close socket
	try {pubsubSocket.close()} catch (e) {}
};

// reconnect to PubSub
var reconnectPubSub = function (event) {
	disconnectPubSub();

	// double back-off period (up to 2 minutes)
	pubsubBackOff = (pubsubBackOff ? Math.min(pubsubBackOff * 2, 120) : 1);

	// reconnect after the back-off period
	window.setTimeout(connectPubSub, Math.floor((pubsubBackOff + Math.random()) * 1000));
};

// connect to PubSub
var connectPubSub = function () {
	pubsubSocket = new WebSocket(twitchPubSubURL);
	pubsubSocket.onopen = listenPubSub;
	pubsubSocket.onmessage = receivePubSub;
	pubsubSocket.onerror = reconnectPubSub;
	pubsubSocket.onclose = reconnectPubSub;
};

// build URL for authorizing application with given scope
var getAuthorizationURL = function (scope, forceVerify) {
	var authURL = twitchAuthURL;
	authURL += '/authorize?response_type=token';
	authURL += '&client_id=' + apiAuth.Twitch.clientID;
	authURL += '&redirect_uri=' + urlEncode(apiAuth.Twitch.redirectURI);
	authURL += '&scope=' + urlEncode(scope.join(' '));
	authURL += '&state=' + generateCSRFToken();
	if (forceVerify) {authURL += '&force_verify=true'}
	return authURL;
};

// retrieve user object
var getUser = function (data, tokenOAuth, callback) {
	$.ajax({
		'url'     : twitchAPIURL + '/users',
		'data'    : data,
		'headers' : {
			'Accept'        : 'application/json',
			'Authorization' : 'Bearer ' + tokenOAuth,
			'Client-Id'     : apiAuth.Twitch.clientID
		}
	}).done(function (data, textStatus, jqXHR) {
		if (data && data.data && data.data[0]) {
			callback(true, data.data[0]);
		} else {
			callback(false, {'error' : 'Unknown user'});
		}
	}).fail(function (jqXHR, textStatus, errorThrown) {
		if (textStatus === 'timeout') {
			callback(false, {'error' : 'Request timed out'});
		} else if (textStatus === 'error') {
			switch (jqXHR.status) {
				case 401:
					callback(false, {'error' : 'Re-authorization required'});
					break;
				case 404:
					callback(false, {'error' : 'Unknown user'});
					break;
				case 422:
					callback(false, {'error' : 'User unavailable'});
					break;
				default:
					callback(false, {'error' : 'Server returned error'});
			}
		} else {
			callback(false, {'error' : 'Unknown error'});
		}
	});
}
