package main

import(
	"http"
	"log"
	"io"
	"strings"
	"./easyauth"
)

// API Key
const clientId = "59r5gsu68egwjbsfu75azu9t"
// Shared Secret
const clientSecret = "GpUDUhbXXB"
// API URL
const apiUrl = "http://api.rdio.com/1/"

func getAlbumsForArtist( res http.ResponseWriter, req *http.Request ){
	log.Printf( "Request for %v", req.URL.Raw )
	
	params := make( map [string]string )
	
	params[ "method" ] = "search"
	params[ "query" ] = "Brand New"
	params[ "types" ] = "Artist,"

	signature := easyauth.GenerateSignature(
		apiUrl,
		easyauth.POST,
		clientId,
		clientSecret,
		params,
	)

	params[ "oauth_signature" ] = string( signature )
	fullParams := easyauth.GetOrderedParamString( params )

	response, err := http.Post(
		apiUrl,
		"application/x-www-form-urlencoded",
		strings.NewReader( fullParams ),
	)
	if err != nil {
		log.Panic( "Couldn't send URL Request" )
	}

	apiResponse := make( []byte, response.ContentLength )
	_, err = io.ReadFull( response.Body, apiResponse )
	if err != nil {
		log.Panic( "Couldn't read response from service" )
	}
	io.WriteString( res, string( apiResponse ) )

}

func favicon( res http.ResponseWriter, req *http.Request ){
	log.Println( "Serving favicon" )
	res.WriteHeader( 204 );
}

func main(){
	http.HandleFunc( "/favicon.ico", favicon )
	http.HandleFunc( "/", getAlbumsForArtist )

	err := http.ListenAndServe( ":12345", nil )
	if err != nil {
		log.Fatal( "ListenAndServe: ", err.String() )
	}
}
