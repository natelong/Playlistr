var playlistr = (function(){
	var apiUrl = '/api/';
	var playerId = 'player';
	var player;

	/**
	 * Send a request to the API
	 *
	 * @param {string} service The specific service to query, e.g. 'getAlbumsForArtist'
	 * @param {Object.<string, string>} args The parameters to send to the service
	 * @param {function(string)} onSuccess A callback to be called when the response is received
	 * @param {function(string)} onFail A callback to be called if the request fails
	 * @param {Object=} scope An object to be set as the scope of the success or fail callbacks (optional)
	 */
	var get = function get( service, args, onSuccess, onFail, scope ){
		var i, count;
		var successReg = /2\d{2}/;
		var targetUrl = apiUrl + service;
		var req = new XMLHttpRequest();
		var requestText = '';

		scope = scope || window;
		
		req.open( 'post', targetUrl );
		req.setRequestHeader( 'Content-Type', 'application/x-www-form-urlencoded' );
		req.onreadystatechange = function(){
			if( req.readyState === 4 ){
				if( successReg.test( req.status ) ){
					onSuccess.call( scope, req.responseText );
				}else{
					onFail.call( scope, req.responseText );
				}
			}
		};
		count = 0;
		for( i in args ) if ( args.hasOwnProperty( i ) ){
			if( count > 0 ){
				requestText += '&';
			}else{
				count++;
			}
			requestText += encodeURIComponent( i );
			requestText += '=';
			requestText += encodeURIComponent( args[ i ] );
		}
		req.send( requestText );
	};

	/**
	 * Helper function to output the result of an ajax call to the console.
	 */
	var outputToConsole = function outputToConsole( data ){
		try{
			console.log( JSON.parse( data ) );
		}catch( e ){
			console.log( data );
		}
	};

	/**
	 * Set up Search box and whatnot
	 */
	var setupSearch = function setupSearch(){
		document.querySelector( '#searchForm' ).addEventListener( 'submit', clientSearch, false );
		document.querySelector( '#searchResultContainer' ).addEventListener( 'submit', handleResultEvent, false );
	};
	
	/**
	 * Handle an event from the search results, like play, add, etc.
	 */
	var handleResultEvent = function handleResultEvent( e ){
		var playFormRegex = /playForm/;
		var target = e.target;
		var sourceKey;

		if( playFormRegex.test( target.className ) ){
			e.preventDefault();
			sourceKey = target.querySelector( 'input[name=key]' ).value;
			player.rdio_play( sourceKey );
		}
	};

	/**
	 * Do the actual search
	 */
	var doSearch = function doSearch( query, types, onComplete, onFail ){
		var args = {
			query: query,
			types: types
		}
		
		get( 'search', args, onComplete, onFail );
	};

	/**
	 * Gather the params to search on
	 */
	var gatherSearchParams = function gatherSearchParams(){
		var i, len;
		var query = document.querySelector( '#queryBox' ).value;
		var typeFields = document.querySelectorAll( '#searchForm input[type=checkbox]:checked' );
		var types = '';

		for( i = 0, len = typeFields.length; i < len; i++ ){
			types += typeFields[ i ].value;
		}
		return {
			query: query,
			types: types
		}
	};

	/**
	 * Client Search
	 */
	var clientSearch = function clientSearch( e ){
		e.preventDefault();
		var searchParams = gatherSearchParams();
		doSearch( searchParams.query, searchParams.types, outputSearchResultsToPage, outputToConsole );
	};

	/**
	 * Output the search results to the search results area
	 */
	var outputSearchResultsToPage = function outputSearchResultsToPage( results ){
		try{
			var resultObject = JSON.parse( results );
		}catch( e ){
			console.error( 'Failed to output results to page: ', e );
			return
		}

		var searchResultsString = playlistr.templates.searchResults( resultObject.result );
		document.querySelector( '#searchResultContainer' ).innerHTML = searchResultsString;
	};

	return{
		/**
		 * initialize the playlistr app
		 */
		init: function init(){
			var scope = this;
			var embedPlayer = function embedPlayer( token ){
				var flashvars = {
					playbackToken: token,
					domain: document.domain,
					listener: 'playlistr'
				};
				var params = {
					allowScriptAccess: 'always'
				};
				var attributes = {};
				swfobject.embedSWF(
					'http://www.rdio.com/api/swf/',
					playerId,
					1,
					1,
					'9.0.0',
					'expressInstall.swf',
					flashvars,
					params,
					attributes
				);
			};
			var onTokenReceived = function( data ){
				var token;
				try{
					token = JSON.parse( data ).result;
				}catch( e ){
					throw "Couldn't parse playback token.";
				}
				embedPlayer( token );
			};
			this.getPlaybackToken( onTokenReceived );
			setupSearch();
		},
		getPlayer: function getPlayer(){
			return player;
		},
		ready: function ready(){
			player = document.getElementById( playerId );
			player.rdio_play( 't7342831' );
		},
		playStateChanged: function playStateChanged( playState ) {
			var states = [ 'paused', 'playing', 'stopped', 'buffering', 'paused' ];
			console.log( states[ playState ] );
		},
		/**
		 * Get the list of albums for the given artist
		 *
		 * @param {string} artistName The name of the artist to search for
		 */
		getAlbumsForArtist: function searchForArtist( artistName ){
			var scope = this;
			var args = {
				query: artistName,
				types: 'artist'
			};
			get( 'search', args, outputToConsole, outputToConsole );
		},
		/**
		 * Do an arbitrary search
		 */
		search: function search( query, types ){
			doSearch( query, types, outputToConsole, outputToConsole );
		},
		getPlaybackToken: function getPlaybackToken( onComplete, onFail ){
			onComplete = onComplete || outputToConsole;
			onFail = onFail || outputToConsole;
			var scope = this;
			var args = {
				domain: document.domain
			};
			get( 'getPlaybackToken', args, onComplete, onFail );
		}
	};
}());

playlistr.init();
