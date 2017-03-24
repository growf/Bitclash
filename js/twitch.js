// PubSub state/event objects
var pubsubSocket;
var pubsubBackOff;
var pubsubPing;
var pubsubPong;

// send ping to PubSub
var pingPubSub = function () {
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
		reconnectPubSub;
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
				case 'channel-bits-events-v1.' + user._id:
					try {
						var cheer = JSON.parse(message.data.message);
						queueChallenger(cheer.data.user_id, cheer.data.user_name, cheer.data.bits_used);
					} catch (e) {}
					break;
				case 'whispers.' + user._id:
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
	var topics = (config.testMode ? ['whispers.' + user._id] : ['channel-bits-events-v1.' + user._id]);
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
	pubsubSocket = new WebSocket(pubsubURL);
	pubsubSocket.onopen = listenPubSub;
	pubsubSocket.onmessage = receivePubSub;
	pubsubSocket.onerror = reconnectPubSub;
	pubsubSocket.onclose = reconnectPubSub;
};

// retrieve user object for authorized user
var getAuthorizedUser = function (tokenOAuth, callback) {
	$.ajax({
		'url'     : apiURL + 'user',
		'headers' : {
			'Accept'        : 'application/vnd.twitchtv.v5+json',
			'Authorization' : 'OAuth ' + tokenOAuth,
			'Client-Id'     : clientID
		}
	}).done(function (data, textStatus, jqXHR) {
		callback(true, data);
	}).fail(function (jqXHR, textStatus, errorThrown) {
		if (textStatus === 'timeout') {
			callback(false, {'error' : 'Request timed out'});
		} else if (textStatus === 'error') {
			switch (jqXHR.status) {
				case 401:
					callback(false, {'error' : 'Application not authorized'});
					break;
				default:
					callback(false, {'error' : 'Server returned error'});
			}
		} else {
			callback(false, {'error' : 'Unknown error'});
		}
	});
}

// retrieve user object for user with given ID
var getUser = function (id, callback) {
	$.ajax({
		'url'     : apiURL + 'users/' + id,
		'headers' : {
			'Accept'    : 'application/vnd.twitchtv.v5+json',
			'Client-Id' : clientID
		}
	}).done(function (data, textStatus, jqXHR) {
		callback(true, data);
	}).fail(function (jqXHR, textStatus, errorThrown) {
		if (textStatus === 'timeout') {
			callback(false, {'error' : 'Request timed out'});
		} else if (textStatus === 'error') {
			switch (jqXHR.status) {
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

// retrieve user object for user with given login name
var getUserByLogin = function (login, callback) {
	$.ajax({
		'url'     : apiURL + 'users',
		'data'    : {
			'login' : login
		},
		'headers' : {
			'Accept'    : 'application/vnd.twitchtv.v5+json',
			'Client-Id' : clientID
		}
	}).done(function (data, textStatus, jqXHR) {
		callback(true, data);
	}).fail(function (jqXHR, textStatus, errorThrown) {
		if (textStatus === 'timeout') {
			callback(false, {'error' : 'Request timed out'});
		} else if (textStatus === 'error') {
			switch (jqXHR.status) {
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
