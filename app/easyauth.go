package easyauth

import(
	"crypto/hmac"
	"rand"
	"time"
	"log"
	"sort"
	"strconv"
	"encoding/base64"
	"strings"
	"encoding/hex"
	"url"
)

const (
	GET				= "GET"
	POST			= "POST"
	unreservedChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_.~"
)

func HashString( key []byte, hashThis string ) string {	
	// log.Println( "Hashing this string: ", hashThis )
	// log.Println( "SHA1 Key: ", key )
	sha1 := hmac.NewSHA1( key )
	sha1.Write( []byte( hashThis ) )
	return base64.StdEncoding.EncodeToString( sha1.Sum() )
}

func GenerateNonce( length int ) ( string ) {
	var chars = [10]byte{ '0', '1', '2', '3', '4', '5', '6', '7', '8', '9' }
	nonceSlice := make( []byte, length )
	for i := 0; i < length; i++ {
		nonceSlice[ i ] = chars[ rand.Intn( 9 ) ]
	}
	return string( nonceSlice )
}

func GetTimestamp() ( string ) {
	return strconv.Itoa64( time.Seconds() )
}

func GetParameters( urlToParse string ) ( url.Values ){
	urlObj, err := url.Parse( urlToParse )
	if err != nil{
		log.Panic( "Couldn't parse URL parameters from string" )
	}
	return urlObj.Query()
}

func GetOrderedParamString( params map[string]string ) ( query string ){
	length := len( params )
	paramStrings := make( []string, length )

	i := 0
	for key, _ := range params {
		paramStrings[ i ] = key
		i++
	}
	
	stringSorter := sort.StringSlice( paramStrings )
	sort.Sort( stringSorter )
	i = 0
	for _, val := range stringSorter{
		if i > 0{
			query += "&"
		}
		query += val + "=" + params[ val ]
		i++
	}
	return query
}

func UrlEncode( toEncode string ) ( result string ){
    for _, val := range toEncode{
        if strings.Index( unreservedChars, string( val ) ) != -1 {
            result += string( val )
        } else {
			result += "%" + strings.ToUpper( hex.EncodeToString( []byte{ byte( val ) } ) )
        }
    }
	return
}

func EscapeParamValues( params map[string]string ){
	for key, val := range params {
		params[ key ] = UrlEncode( val )
	}
}

// url should be in format http://www.foo.com/bar/baz
// method should be either "GET" or "POST" (uppercase)
func GenerateSignature( resourceURL, method, consumerKey, consumerSecret string, params map[string]string ) ( signature string ){
	
	EscapeParamValues( params )

	params[ "oauth_nonce" ] = GenerateNonce( 10 )
	params[ "oauth_timestamp" ] = GetTimestamp()
	params[ "oauth_signature_method" ] = "HMAC-SHA1"
	params[ "oauth_consumer_key" ] = consumerKey

	baseString := method
	baseString += "&"
	baseString += UrlEncode( resourceURL )
	baseString += "&"
	baseString += UrlEncode( GetOrderedParamString( params ) )
	
	signature = HashString( []byte( UrlEncode( consumerSecret ) + "&" ), baseString )
	// log.Println( "Signature: ", signature )
	return
}
