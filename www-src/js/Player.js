var Player = function( playerId ){
	this.playerId = playerId;
};

Player.prototype.playerElement = null;
Player.prototype.statusElement = null;
Player.prototype.currentState = null;
Player.prototype.currentTrack = null;

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
		listener: 'playlistr.player'
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
};

/**
 * Update the status listing to reflect the current state and playing track
 */
Player.prototype.updateStatus = function updateStatus(){
	this.statusElement.innerHTML = playlistr.templates.trackInfo({
		track: this.currentTrack,
		status: this.states[ this.currentState ]
	});
}

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
 * A function to call when the player has been initialized completely
 */
Player.prototype.ready = function ready(){
	console.log( 'Player Ready' );
	this.statusElement.innerHTML = 'Ready when you are :)';
};

/**
 * When the player state changes, respond to 
 */
Player.prototype.playStateChanged = function playStateChanged( playState ) {
	this.currentState = playState;

	this.updateStatus();

	switch( playState ){
		case 0:
		break;
		case 1:
		break;
		case 2: //stopped
		break;
		case 3:
		break;
		case 4:
		break;
	}
};

/**
 * When the current track changes
 */
Player.prototype.playingTrackChanged = function playingTrackChanged( playingTrack, sourcePosition ){
	if( playingTrack ){
		this.currentTrack = playingTrack;
	}
}
