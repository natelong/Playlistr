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

/**
 * Set up Search box and whatnot
 */
Playlist.prototype.setupAdd = function setupAdd(){
	var scope = this;

	this.addFormContainer.addEventListener( 'submit', function( e ){
		scope.handleAddEvent.call( scope, e );
	}, false );
};

/**
 * Handle an event from the search results, like play, add, etc.
 */
Playlist.prototype.handleAddEvent = function handleAddEvent( e ){
	var addFormRegex = /addForm/;
	var target = e.target;
	var sourceKey;
	var trackInfo;

	if( addFormRegex.test( target.className ) ){
		e.preventDefault();
		trackInfo = JSON.stringify({
			action: 'add',
			target:{
				name: target.name.value,
				key: target.key.value,
				artist: target.artist.value,
				album: target.album.value,
				thumb: target.thumb.value
			}
		});
		this.ws.send( trackInfo );
	}
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