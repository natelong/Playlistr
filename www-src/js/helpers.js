var helpers = {
	/**
	 * Helper function to output the result of an ajax call to the console.
	 */
	outputToConsole: function outputToConsole( data ){
		try{
			console.log( JSON.parse( data ) );
		}catch( e ){
			console.log( data );
		}
	}
};
