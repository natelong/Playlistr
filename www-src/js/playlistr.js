var playlistr = (function(){
	var apiUrl = '/api/';
	var playerId = 'player';

	// vars for the player
	var player = new Player( playerId );
	
	// vars for the playlistr/rdio service
	var service = new Service( apiUrl );

	// vars for the client search object
	var searchForm = document.querySelector( '#searchForm' );
	var resultsArea = document.querySelector( '#searchResultContainer' )
	var clientSearch = new ClientSearch( searchForm, resultsArea );

	return{
		/**
		 * initialize the playlistr app
		 */
		init: function init(){
			var scope = this;
			
			service.getPlaybackToken(function( data ){
				var token;
				try{
					token = JSON.parse( data ).result;
				}catch( e ){
					throw "Couldn't parse playback token.";
				}
				player.embedPlayer( token );
			});
			clientSearch.setupSearch();
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
			service.get( 'search', args, helpers.outputToConsole, helpers.outputToConsole );
		},
		/**
		 * Do an arbitrary search
		 */
		search: function search( query, types ){
			clientSearch.doSearch( query, types, helpers.outputToConsole, helpers.outputToConsole );
		},		
		service: service,
		player: player,
		clientSearch: clientSearch
	};
}());

playlistr.init();
