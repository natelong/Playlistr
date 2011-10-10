var playlistr = (function(){
//	var apiUrl = 'http://api.rdio.com/1/';
	var apiUrl = '/api/';

	/**
	 * Send a request to the API
	 *
	 * @param {string} service The specific service to query, e.g. 'getAlbumsForArtist'
	 * @param {Object.<string, string>} args The parameters to send to the service
	 * @param {function(string)} onSuccess A callback to be called when the response is received
	 * @param {function(string)} onFail A callback to be called if the request fails
	 * @param {Object=} scope An object to be set as the scope of the success or fail callbacks (optional)
	 **/
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
					onFail.call( scope, req.responseText )
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

	return{
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
			}
			var onSuccess = function onSuccess( data ){
				console.log( JSON.parse( data ) );
			}
			var onFail = function onFail( data ){
				console.log( data );
			}
			get( 'search', args, onSuccess, onFail );
		}
	}
}());
