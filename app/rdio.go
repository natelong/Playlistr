package rdio

import (
	"http"
	"log"
	"strings"
	"io"
	"./easyauth"
)

// API Key
const clientId = "59r5gsu68egwjbsfu75azu9t"
// Shared Secret
const clientSecret = "GpUDUhbXXB"
// API URL
const apiUrl = "http://api.rdio.com/1/"

func RequestFromService( method string, apiParams map[string]string ) ( string ) {
	log.Printf( "Requsting %s method", method )

	params := make( map [string]string )
	params[ "method" ] = method
	for key, val := range apiParams {
		params[ key ] = val
	}

	signature := easyauth.GenerateSignature(
		apiUrl,
		easyauth.POST,
		clientId,
		clientSecret,
		params,
	)

	params[ "oauth_signature" ] = easyauth.UrlEncode( signature )
	fullParams := easyauth.GetOrderedParamString( params )

	response, err := http.Post(
		apiUrl,
		"application/x-www-form-urlencoded",
		strings.NewReader( fullParams ),
	)
	if err != nil {
		log.Panic( "Couldn't send URL Request" )
	}

	log.Printf( "Response from API: %s", response.Status )

	apiResponse := make( []byte, response.ContentLength )
	_, err = io.ReadFull( response.Body, apiResponse )
	if err != nil {
		log.Panic( "Couldn't read response from service" )
	}
	return string( apiResponse )
}
