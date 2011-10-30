package playlist

import (
	"json"
	"log"
)

type PlaylistRequest struct {
	Action		string
	Target		Track
}

type Track struct {
	Name		string
	Key			string
	Artist		string
	Album		string
	Thumb		string
	Order		int
}

var playlist = make( map[string]Track )

const ACTION_ADD = "add"
const ACTION_REMOVE = "remove"
const ACTION_REORDER = "reorder"
const ACTION_GET = "get"

func HandleRequest( request []byte, pubCallback func( []byte, int ), callbackKey int ){
	var requestObj PlaylistRequest
	var response []byte

	err := json.Unmarshal( request, &requestObj )
	if err != nil {
		log.Panicf( "Error parsing JSON: %s", err.String() )
	}

	switch requestObj.Action{
		case ACTION_ADD:
			callbackKey = -1
			response = AddTrackToPlaylist( requestObj.Target )
		case ACTION_REMOVE:
			response = []byte( "Remove track from playlist" )
		case ACTION_REORDER:
			response = []byte( "Reorder track in playlist" )
		case ACTION_GET:
			response = GetPlaylist()
		default:
			response = []byte( "Couldn't figure out action: " + requestObj.Action )
	}

	response = GetPlaylist()
	go pubCallback( response, callbackKey )
}

func GetPlaylist() ( response []byte ){
	response, _ = json.Marshal( playlist )
	return response
}

func AddTrackToPlaylist( track Track ) ( response []byte ){
	track.Order = len( playlist )
	playlist[ track.Key ] = track
	
	response, _ = json.Marshal( track )
	return response
}