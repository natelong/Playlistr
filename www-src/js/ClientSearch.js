/**
 * A class to contain the search functionality that lives in the page
 * 
 * @param {element} searchForm The form element that contains the search fields
 * @param {element} resultsArea The element that will contain the search results
 * @param {object} owner The element that owns the current instance of ClientSearch. Most likely playlistr object.
 */
var ClientSearch = function ClientSearch( searchForm, resultsArea ){
	this.searchForm = searchForm;
	this.resultsArea = resultsArea;
};

/**
 * Set up Search box and whatnot
 */
ClientSearch.prototype.setupSearch = function setupSearch(){
	var scope = this;

	this.searchForm.addEventListener( 'submit', function( e ){
		scope.clientSearch.call( scope, e );
	}, false );
	this.resultsArea.addEventListener( 'submit', function( e ){
		scope.handleResultEvent.call( scope, e );
	}, false );
};

/**
 * Handle an event from the search results, like play, add, etc.
 */
ClientSearch.prototype.handleResultEvent = function handleResultEvent( e ){
	var playFormRegex = /playForm/;
	var target = e.target;
	var sourceKey;

	if( playFormRegex.test( target.className ) ){
		e.preventDefault();
		sourceKey = target.querySelector( 'input[name=key]' ).value;
		playlistr.player.play( sourceKey );
	}
};

/**
 * Do the actual search
 */
ClientSearch.prototype.doSearch = function doSearch( query, types, onComplete, onFail ){
	var args = {
		query: query,
		types: types
	}
	
	playlistr.service.get( 'search', args, onComplete, onFail );
};

/**
 * Client Search
 */
ClientSearch.prototype.clientSearch = function clientSearch( e ){
	e.preventDefault();
	var scope = this;
	var searchParams = this.gatherSearchParams();
	this.doSearch(
		searchParams.query,
		searchParams.types,
		function( data ){
			scope.outputSearchResultsToPage.call( scope, data );
		},
		helpers.outputToConsole
	);
};

/**
 * Gather the params to search on
 */
ClientSearch.prototype.gatherSearchParams = function gatherSearchParams(){
	var i, len;
	var query = this.searchForm.querySelector( '#queryBox' ).value;
	var typeFields = this.searchForm.querySelectorAll( '#searchForm input[type=checkbox]:checked' );
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
 * Output the search results to the search results area
 */
ClientSearch.prototype.outputSearchResultsToPage = function outputSearchResultsToPage( results ){
	try{
		var resultObject = JSON.parse( results );
	}catch( e ){
		console.error( 'Failed to output results to page: ', e );
		return
	}

	var searchResultsString = playlistr.templates.searchResults( resultObject.result );
	this.resultsArea.innerHTML = searchResultsString;
};
