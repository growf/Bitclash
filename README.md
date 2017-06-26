# Bitclash

*Bitclash* is a web-based animated widget that turns bits into hit points and lets your Twitch viewers battle for dominance!

## Combat

Challengers get as many hit points as the number of bits in their cheer and face off against the current defender (initially the channel owner) and the defender's remaining hit points.

The challenger and the current defender take turns to fight each other until one of them is defeated. The number of hits and damage dealt are scaled according to the size of the challenger's cheer. The damage dealt is random but, without (optional) critical hits, should sum to around 105% of the challenger's cheer on average.

Critical hits, if enabled, boost a single hit's damage by a multiplier. Critical hit chance is *per match-up*; the challenger and defender will throw at most one critical hit in each fight.

If the challenger defeats the current defender then they become the new defender and (optionally) get a boost to their hit points. The defender can also heal themselves by cheering but their health cannot exceed their maximum hit points.

## Using *Bitclash*

*Bitclash* is intended for use as a webpage/URL source in your broadcast software. It can also be captured from a web browser although typically that won't support a transparent background and you may need to use chroma keying to achieve transparency.

To authorize *Bitclash* for your channel visit http://growf.org/Bitclash/. In standard usage *Bitclash* requires permission to view your user details. A test mode that listens for whispers instead of cheers can be enabled; this will require an additional permission to be able to access your Twitch chat which can be revoked once testing is complete. Once authorized a URL will be generated for *Bitclash* containing your authorization token and selected configuration.

*Bitclash* should work with any browser or embedded browser with support for JavaScript and cookies. The current state of combat and any queued cheers are saved to a persistent browser cookie and will be restored if the widget is closed and re-opened. The current defender can be reset to a specific user and/or number of hit points as a one-time update via the settings page; this will also clear the current challenger and any fight that is in progress but will not remove any queued cheers. If your webpage/URL source supports interaction with the widget or you are using *Bitclash* in a browser players' avatars can be swapped for a default image by clicking on the avatar.

No information is stored on *Bitclash*'s server. The combat details, queued cheers, and settings are all stored on your machine. *Bitclash* is only able to queue viewer's cheers whilst the *Bitclash* window is open as a source or in a browser. *Bitclash* is provided for entertainment purposes; no liability can be accepted for any defects, outages, or loss of game data.

## Creating Your Own *Bitclash* Server

If you want to deploy *Bitclash* to your own server you will need to:
* [Register your *Bitclash* instance with Twitch](https://www.twitch.tv/settings/connections).  
The Redirect URI should be the URL where [authorize.html](https://github.com/growf/Bitclash/blob/master/authorize.html) can be accessed from your server.  
The Redirect URI and your Client ID should be placed in [auth.json](https://github.com/growf/Bitclash/blob/master/auth.json).

* [Obtain Google API credentials](https://console.developers.google.com/apis/credentials) to have access to the list of available Google Fonts.  
The Google API key should be placed in [auth.json](https://github.com/growf/Bitclash/blob/master/auth.json).

* Update the application URL at the top of [js/shared.js](https://github.com/growf/Bitclash/blob/master/js/shared.js#L2).  
This should be the URL where [bitclash.html](https://github.com/growf/Bitclash/blob/master/bitclash.html) can be accessed from your server.
