const redis = require( "../../mopidyManager" ).redis;
const RU = require( "../redis_Utils.js" );
const mopidy = require( "../../mopidyManager.js" ).mopidy;
const resetRandom = require( "../../mopidyManager.js" ).resetRandom;
function sleep( ms ) { return new Promise( resolve => setTimeout( resolve , ms ) ); }

const R_BASE = "MOPIDY.";
const R_CACHE_BASE = R_BASE + "CACHE.";
const R_LAST_UPDATE_TIME = R_CACHE_BASE + "LAST_UPDATE_TIME";
function UPDATE_CACHE() {
	return new Promise( async function( resolve , reject ) {
		try {
			const timeNow = new Date().getTime();
			var lastUpdatedTime = await RU.getKey( redis , R_LAST_UPDATE_TIME );
			if ( lastUpdatedTime === null ) { lastUpdatedTime = "NEVER"; }

			console.log( "LAST_UPDATE_TIME = " + lastUpdatedTime.toString() );
			//var wDiff = ( timeNow - LIB_CACHE.lastUpdatedTime );

			// if ( !UPDATE_OVERRIDE && wDiff < HOUR ) { wcl( "already updated playlist cache this hour" ); resolve( "success" ); }

			// mopidy.playlists.getPlaylists().then( function( playlists ) {

			// 	for ( var i = 0; i < playlists.length; ++i ) {

			// 		var wKey = playlists[i].uri.split( "gmusic:playlist:" )[1];

			// 		if ( wKey === "promoted" || wKey === "IFL" || wKey === undefined ) { continue; }

			// 		var wGenre = "unknown";
			// 		var alreadyExists = false;
			// 		for ( var eGenre in LIB_CACHE[ "playlists" ] ) {
			// 			if ( wKey in LIB_CACHE[ "playlists" ][ eGenre ] ) { alreadyExists = true; wGenre = eGenre;  }
			// 		}

			// 		if ( !alreadyExists ) { 
			// 			LIB_CACHE.playlists[ wGenre ][ wKey ] = { skipCount: 0 , playCount: 0 };
			// 		}

			// 		LIB_CACHE.playlists[ wGenre ][ wKey ].name = playlists[i].name;
			// 		LIB_CACHE.playlists[ wGenre ][ wKey ].playlistModel = playlists[i];

			// 	}

			// 	timeNow = new Date().getTime();
			// 	LIB_CACHE.lastUpdatedTime = timeNow;
			// 	WRITE_LIBRARY_CACHE();
			// 	resolve();

			// })
			// .catch( function( wError ) {
			// 	wcl( "ERROR --> " + wError );
			// 	reject();
			// });
			
			resolve();

		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function INITIALIZE() {
	return new Promise( async function( resolve , reject ) {
		try {
			resetRandom();
			await sleep( 1000 );
			await UPDATE_CACHE();
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.initialize = INITIALIZE;