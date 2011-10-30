Player.prototype.callbacks = {};

/**
 * A function to call when the player has been initialized completely
 */
Player.prototype.callbacks.ready = function ready(){
	this.parent.statusElement.innerHTML = 'Ready when you are :)';
	playlistr.playlist.callbacks.onPlayerReady();
};

/**
 * When the player state changes, respond to 
 */
Player.prototype.callbacks.playStateChanged = function playStateChanged( playState ) {
	this.parent.currentState = playState;

	this.parent.updateStatus();
};

/**
 * When the current track changes
 */
Player.prototype.callbacks.playingTrackChanged = function playingTrackChanged( playingTrack, sourcePosition ){
	if( playingTrack ){
		this.parent.currentTrack = playingTrack;
	}
};

/**
 * When the player position changes
 */
Player.prototype.callbacks.positionChanged = function positionChanged( position ){
	var trackProgress = Math.ceil( position / this.parent.currentTrack.duration * 100 );
	this.parent.trackProgressElement.style.width = trackProgress + '%';
};

/**
 * When the player frequency changes
 */
Player.prototype.callbacks.updateFrequencyData = function updateFrequencyData( frequencyData ){
	console.log( 'Frequency Data Updated: %o', frequencyData );
};