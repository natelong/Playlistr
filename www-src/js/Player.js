var Player = function( playerId ){
	this.playerId = playerId;
	this.playerElement = null;
};

/**
 * Embeds the flash player into the page
 *
 * @param {string} token The current user's playback token
 */
Player.prototype.embedPlayer = function embedPlayer( token ){
	var flashvars = {
		playbackToken: token,
		domain: document.domain,
		listener: 'playlistr.modules.player.callbacks'
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
	this.playerElement = document.getElementById( this.playerId );
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
 * Handle events created by the player
 */
Player.prototype.callbacks = {
	/**
	 * A function to call when the player has been initialized completely
	 */
	ready: function ready(){
		console.log( 'Player Ready' );
	},
	/**
	 * When the player state changes, respond to 
	 */
	playStateChanged: function playStateChanged( playState ) {
		var currentState = states[ playState ];
		console.log( currentState );
	}
};
