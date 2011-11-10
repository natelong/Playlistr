var Playlist = function Playlist( addFormContainer, playlistContainer ){
	this.addFormContainer = addFormContainer;
	this.playlistContainer = playlistContainer;
	var url = 'ws://' + window.location.host + '/event';
	var scope = this;

	var ws = new WebSocket( url );
	ws.onopen = function( e ){
		scope.callbacks.onOpen.call( scope, e );
	};
	ws.onclose = this.callbacks.onClose;
	ws.onmessage = function( e ){
		console.log( 'Websocket message received: %s', e.data );
		scope.callbacks.onMessage.call( scope, e );
	}
	ws.onerror = this.callbacks.onError;

	this.ws = ws;
	this.setupAdd();
	
	this.playlist = [];
};

Playlist.prototype.addFormRegex = /addForm/;
Playlist.prototype.removeFormRegex = /removeForm/;

/**
 * Set up listener for playlist add events
 */
Playlist.prototype.setupAdd = function setupAdd(){
	var scope = this;

	this.addFormContainer.addEventListener( 'submit', function( e ){
		scope.dispatchEvent( e, scope );
	}, false );

	this.playlistContainer.addEventListener( 'submit', function( e ){
		scope.dispatchEvent( e, scope );
	}, false );
};

/**
 * Dispatches form events to the proper handlers
 */
Playlist.prototype.dispatchEvent = function dispatchEvent( e, scope ){
	var actionClass = e.target.className;

	if( scope.addFormRegex.test( actionClass ) ){
		scope.handleAddEvent.call( scope, e );
	}else if( scope.removeFormRegex.test( actionClass ) ){
		scope.handleRemoveEvent.call( scope, e );
	}
};

/**
 * Get standard track info from a track info form
 * @param {Element} form The form that contains the track info to be extracted
 * @returns {object} The standard values in a hash
 */
Playlist.prototype.getTrackInfo = function getTrackInfo( form ){
	return {
		name: form.name.value,
		key: form.key.value,
		artist: form.artist.value,
		album: form.album.value,
		thumb: form.thumb.value
	}
};

/**
 *
 */
Playlist.prototype.handleRemoveEvent = function handleRemoveEvent( e ){
	var target = e.target;
	var trackInfo;

	e.preventDefault();
	trackInfo = JSON.stringify({
		action: 'remove',
		target: this.getTrackInfo( target )
	})
	this.ws.send( trackInfo );
};

/**
 * Handle an event from the search results, like play, add, etc.
 */
Playlist.prototype.handleAddEvent = function handleAddEvent( e ){
	var target = e.target;
	var trackInfo;

	e.preventDefault();
	trackInfo = JSON.stringify({
		action: 'add',
		target: this.getTrackInfo( target )
	});
	this.ws.send( trackInfo );
};

Playlist.prototype.sortByOrder = function sortByOrder( a, b ){
	if( a.Order > b.Order ){
		return 1;
	}else if( a.Order < b.Order ){
		return -1;
	}else{
		return 0;
	}
};

Playlist.prototype.callbacks = {};

Playlist.prototype.callbacks.onPlayerReady = function onPlayerReady(){
	
};

Playlist.prototype.callbacks.onOpen = function onOpen( event ){
	this.ws.send( JSON.stringify( { action: "get" } ) );
};

Playlist.prototype.callbacks.onClose = function onClose( event ){
	console.log( 'Websocket connection closed: %o', event );
};

Playlist.prototype.callbacks.onMessage = function onMessage( message ){
	var playlist = JSON.parse( message.data );
	var newPlaylist = [];
	for( var i in playlist )if( playlist.hasOwnProperty( i ) ){
		newPlaylist.push( playlist[ i ] );
	}
	newPlaylist.sort( this.sortByOrder );
	this.playlistContainer.innerHTML = playlistr.templates.playlistItems({ results: newPlaylist });

	this.playlist = newPlaylist;
};

Playlist.prototype.callbacks.onError = function onError( event ){
	console.log( 'Websocket error: %o', event );
};