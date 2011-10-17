var Service = function( apiUrl ){
	this.apiUrl = apiUrl;
};

/**
 * Send a request to the API
 *
 * @param {string} service The specific service to query, e.g. 'getAlbumsForArtist'
 * @param {Object.<string, string>} args The parameters to send to the service
 * @param {function(string)} onSuccess A callback to be called when the response is received
 * @param {function(string)} onFail A callback to be called if the request fails
 * @param {Object=} scope An object to be set as the scope of the success or fail callbacks (optional)
 */
Service.prototype.get = function get( serviceName, args, onSuccess, onFail, scope ){
	var i, count;
	var successReg = /2\d{2}/;
	var targetUrl = this.apiUrl + serviceName;
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
 * Gets a playback token from the RDIO service
 *
 * @param {function(string)} onComplete A function to call when the playback token is returned successfully from the service
 * @param {function(string)} onFail A function to call when the request to get a playback token fails
 */
Service.prototype.getPlaybackToken = function getPlaybackToken( onComplete, onFail ){
	onComplete = onComplete || helpers.outputToConsole;
	onFail = onFail || helpers.outputToConsole;
	var scope = this;
	var args = {
		domain: document.domain
	};
	this.get( 'getPlaybackToken', args, onComplete, onFail );
}
