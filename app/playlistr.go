package main

import(
	"http"
	"log"
	"io"
	"./rdio"
)

func doSearch( res http.ResponseWriter, req *http.Request ){

	requiredParamErrorMessage := `Missing required parameter. Required parameters: "query", "type".
query: A search query. Ex. "Brand New"
types: The type of item to search for. Multiple values are comma-separated. Possible values: "artist," "album," "track."`

	req.ParseForm();
	query := req.Form.Get( "query" )
	types := req.Form.Get( "types" )

	if query == "" || types == "" {
		res.WriteHeader( 400 )
		io.WriteString( res, requiredParamErrorMessage )
		return
	}

	method := "search"
	params := make( map [string]string )
	params[ "query" ] = query
	params[ "types" ] = types

	apiResponse := rdio.RequestFromService( method, params )
	io.WriteString( res, apiResponse )
}

func serveStaticFile( res http.ResponseWriter, req *http.Request ){
	log.Println( "Serving static file ", req.URL.Path )
	http.ServeFile( res, req, req.URL.Path )
}

func serveIndex( res http.ResponseWriter, req *http.Request ){
	log.Println( "Serving index file for request ", req.URL.Path )
	http.ServeFile( res, req, "www/index.html" )
}

func favicon( res http.ResponseWriter, req *http.Request ){
	log.Println( "Serving favicon" )
	res.WriteHeader( 204 );
}

func main(){
	http.HandleFunc( "/favicon.ico", favicon )
	http.HandleFunc( "/api/search", doSearch )
	http.HandleFunc( "/js/", serveStaticFile )
	http.HandleFunc( "/css/", serveStaticFile )
	http.HandleFunc( "/", serveIndex )

	err := http.ListenAndServe( ":12345", nil )
	if err != nil {
		log.Fatal( "ListenAndServe: ", err.String() )
	}
}
