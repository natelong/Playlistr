var Player = function( playerId ){
	this.playerId = playerId;
};

Player.prototype.playerElement = null;
Player.prototype.statusElement = null;
Player.prototype.currentState = null;
Player.prototype.currentTrack = null;

Player.prototype.analyzerDefaults = {
	period: 100,
	frequencies: '8-band'
};

Player.prototype.states = [
	'Paused',
	'Playing',
	'Stopped',
	'Buffering',
	'Paused'
];

/**
 * Embeds the flash player into the page
 *
 * @param {string} token The current user's playback token
 */
Player.prototype.embedPlayer = function embedPlayer( token ){
	var flashvars = {
		playbackToken: token,
		domain: document.domain,
		listener: 'playlistr.player.callbacks'
	};
	var params = {
		allowScriptAccess: 'always'
	};
	var attributes = {};
	swfobject.embedSWF(
		'http://www.rdio.com/api/swf/',
		this.playerId,
		1,
		1,
		'9.0.0',
		'expressInstall.swf',
		flashvars,
		params,
		attributes
	);

	this.playerElement = document.querySelector( '#' + this.playerId );
	this.statusElement = document.querySelector( '#playerStatus' );
	this.trackProgressElement = document.querySelector( '#trackProgress' );

	this.callbacks.parent = this;
};

/**
 * Update the status listing to reflect the current state and playing track
 */
Player.prototype.updateStatus = function updateStatus(){
	this.statusElement.innerHTML = playlistr.templates.trackInfo({
		track: this.currentTrack,
		status: this.states[ this.currentState ]
	});
};

/**
 * Start analyzing the stream frequency
 */
Player.prototype.startAnalyzer = function startAnalyzer( options ){
	var analyzerOptions = options || this.analyzerDefaults;
	this.playerElement.rdio_startFrequencyAnalyzer( analyzerOptions );
};

/**
 * Stop analyzing the stream frequency
 */
Player.prototype.stopAnalyzer = function stopAnalyzer(){
	this.playerElement.rdio.stopFrequencyAnalyzer();
};

/**
 * Immediately play content from the selected source.
 */
Player.prototype.play = function play( sourceId ){
	this.playerElement.rdio_play( sourceId );
};

/**
 * Immediately play content from the selected source.
 */
Player.prototype.pause = function pause(){
	this.playerElement.rdio_pause();
};

/**
 * Queue up a set of tracks
 */
Player.prototype.addTracks = function addTracks( tracks ){
	var i, len;
	for( i = 0, len = tracks.length; i < len; i++ ){
		this.playerElement.rdio_queue( tracks[ i ].Key );
	}
};