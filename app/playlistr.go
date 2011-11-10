package main

import(
	"http"
	"log"
	"io"
	"websocket"
	"./app/bin/rdio"
	"./app/bin/playlist"
)

type subscription struct {
	conn		*websocket.Conn
	subscribe	bool
}

type message struct {
	conn 		*websocket.Conn
	text		[]byte
}

var messageChan = make( chan message )
var subscriptionChan = make( chan subscription )
var conns = make( map[*websocket.Conn]int )
var connections = make( map[int]*websocket.Conn )

var master = -1
var lastConnectionIndex = 0;

func main(){
	go pubHub()
	go subHub()

	http.HandleFunc( "/favicon.ico", favicon )
	http.HandleFunc( "/api/search", doSearch )
	http.HandleFunc( "/api/getPlaybackToken", doPlaybackToken )
	http.HandleFunc( "/api/", serveApiIndex )
	http.HandleFunc( "/js/", serveStaticFile )
	http.HandleFunc( "/css/", serveStaticFile )
	http.HandleFunc( "/", serveIndex )

	http.Handle( "/event", websocket.Handler( doEventStream ) )

	err := http.ListenAndServe( ":12345", nil )
	if err != nil {
		log.Fatal( "ListenAndServe: ", err.String() )
	}
}

func Publish( message []byte, key int ){
	if key == -1{
		log.Println( "Publishing to all connections" )
		for conn, _ := range conns{
			if _, err := conn.Write( message ); err != nil {
				conn.Close()
			}
		}
	}else{
		log.Printf( "Publishing to specific connection: %v", key )
		connections[ key ].Write( message )
	}
}

func pubHub(){
	for{
		message := <- messageChan
		playlist.HandleRequest( message.text, Publish, conns[ message.conn ] )
	}
}

func subHub(){
	for{
		subscription := <- subscriptionChan

		if subscription.subscribe {
			connectionIndex := lastConnectionIndex
			lastConnectionIndex += 1
			conns[ subscription.conn ] = connectionIndex
			connections[ connectionIndex ] = subscription.conn

			if master == -1{
				master = connectionIndex
				log.Printf( "No current master. New playlist master: %v", master )
			}
		}else{
			connectionIndex := conns[ subscription.conn ]
			conns[ subscription.conn ] = 0, false
			connections[ connectionIndex ] = subscription.conn, false

			if master == connectionIndex {
				for index, _ := range connections {
					master = index
					break
				}
				log.Printf( "Old master quit. New playlist master: %v", master )
			}
		}
	}
}

func doEventStream( ws *websocket.Conn ){
	defer func(){
		subscriptionChan <- subscription{ ws, false }
		ws.Close()
	}()

	subscriptionChan <- subscription{ ws, true }

	for{
		buf := make( []byte, 512 )

		n, err := ws.Read( buf )
		if err != nil {
			log.Println( "Error reading from websocket connection" )
			break;
		}

		messageChan <- message{
			ws,
			buf[ 0:n ],
		}
	}
}

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

func doPlaybackToken( res http.ResponseWriter, req *http.Request ){

	req.ParseForm();
	domain := req.Form.Get( "domain" )

	if domain == "" {
		res.WriteHeader( 400 )
		io.WriteString( res, "Call requires domain param." )
		return
	}

	method := "getPlaybackToken"
	params := make( map [string]string )
	params[ "method" ] = method
	params[ "domain" ] = domain

	apiResponse := rdio.RequestFromService( method, params )
	io.WriteString( res, apiResponse )
}

func serveStaticFile( res http.ResponseWriter, req *http.Request ){
	log.Println( "Serving static file ", req.URL.Path )
	http.ServeFile( res, req, "www" + req.URL.Path )
}

func serveApiIndex( res http.ResponseWriter, req *http.Request ){
	log.Println( "Serving index file for request ", req.URL.Path )
	http.ServeFile( res, req, "www/api.html" )
}

func serveIndex( res http.ResponseWriter, req *http.Request ){
	log.Println( "Serving index file for request ", req.URL.Path )
	http.ServeFile( res, req, "www/index.html" )
}

func favicon( res http.ResponseWriter, req *http.Request ){
	log.Println( "Serving favicon" )
	res.WriteHeader( 204 );
}
