const request = require( "/home/morpheous/.nvm/versions/node/v8.4.0/lib/node_modules/request" );
const REDIS = require("/home/morpheous/.nvm/versions/node/v8.4.0/lib/node_modules/redis");
const redis = REDIS.createClient( "8443" , "localhost" );
const RU = require( "./redis_Utils.js" );

const DATA_API_KEY = require( "../../personal.js" ).YT_DATA_API_KEY;
var ENUMERATING_ID = null;
var FINAL_RESULTS = [];
var FINAL_PARSED = [];

const R_YT_STD_CURRATED = "YOUT_TUBE.STANDARD.CURRATED.PLAYLISTS.";
function storeIntoRedis() {
	return new Promise( async function( resolve , reject ) {
		try {
			var wKey = R_YT_STD_CURRATED + ENUMERATING_ID;
			await RU.delKey( redis , wKey );
			var ids = FINAL_PARSED.map( x => x[ "videoId" ] );
			await RU.setSetFromArray( redis , wKey ,  ids );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function filterJSONResults() {
	return new Promise( async function( resolve , reject ) {
		try {
			var wFinal = [];
			if ( FINAL_RESULTS[ FINAL_RESULTS.length - 1 ][ "nextPageToken" ] ) { await getPlaylistJSON( FINAL_RESULTS[ FINAL_RESULTS.length - 1 ][ "nextPageToken" ] ); }
			
			for ( var i = 0; i < FINAL_RESULTS.length; ++i ) {
				if ( FINAL_RESULTS[ i ][ "items" ] ) {
					for ( var j = 0; j < FINAL_RESULTS[ i ][ "items" ].length; ++j ) {
						FINAL_PARSED.push({
							publishedAt: FINAL_RESULTS[ i ][ "items" ][ j ][ "snippet" ][ "publishedAt" ] ,
							title: FINAL_RESULTS[ i ][ "items" ][ j ][ "snippet" ][ "title" ] ,
							videoId: FINAL_RESULTS[ i ][ "items" ][ j ][ "contentDetails" ][ "videoId" ]
						});
					}
				}
			}
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

const URL_P1 = "https://www.googleapis.com/youtube/v3/playlistItems?playlistId=";
const URL_P2 = "&maxResults=50&part=snippet%2CcontentDetails&key=" + DATA_API_KEY;
const URL_P3 = "&pageToken=";
function getPlaylistJSON( wPageToken ) {
	return new Promise( function( resolve , reject ) {
		try {
			var wURL = null;
			if ( wPageToken ) { wURL = URL_P1 + ENUMERATING_ID + URL_P2 + URL_P3 + wPageToken; }
			else { wURL = URL_P1 + ENUMERATING_ID + URL_P2; }
			console.log( wURL );
			request( wURL , async function ( err , response , body ) {
				if ( err ) { console.log( err ); reject( err ); return; }
				body = JSON.parse( body );
				FINAL_RESULTS.push( body );
				body = await filterJSONResults();
				resolve( body );
			});
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

( async ()=> {
	await RU.selectDatabase( redis , 3 ); // testing
	ENUMERATING_ID = "PLcW8xNfZoh7ew0Eru-09bjr-l60IBYYgq"
	await getPlaylistJSON();
	console.log( FINAL_PARSED );
	await storeIntoRedis();
	ENUMERATING_ID = null;
	FINAL_RESULTS = null;
	FINAL_PARSED = null;
	console.log( "done" );
})();