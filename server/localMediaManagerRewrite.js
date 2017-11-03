//const GEN_HD_REF = require( "./utils/localMedia_Util" ).buildHardDriveReference;

//var redis = require( "./clientManager.js" ).redis;
var REDIS 		= require("redis");
var redis = REDIS.createClient( "8443" , "localhost" );

const MPLAYER_MAN = require( "./utils/mplayerManager.js" );
function wSleep( ms ) { return new Promise( resolve => setTimeout( resolve , ms ) ); }

const path = require("path");

// https://redis.io/topics/data-types-intro
// https://github.com/NodeRedis/node_redis
// https://redis.io/commands/scan
// https://stackoverflow.com/questions/19745224/how-to-save-javascript-array-as-redis-list
// https://stackoverflow.com/questions/6539922/best-way-to-manage-redis-data

// https://stackoverflow.com/questions/41978125/how-to-retrieve-redis-values-into-a-array-in-nodejs
// https://stackoverflow.com/questions/8744207/finding-keys-using-wildcards

// redis.rpush( wSeason_R_KEY , x1[ wGenre ][ wShow ][ j ] , function( err , results ) {  if ( err ) { console.log( err ); } else { console.log( results ) } });
// https://github.com/fritzy/node-redisscan

// LocalMediaManger.play() -->
// 	--> Odyseey
// 		FilePath--> [ "Odyseey" , "SINGLES" , "0" , wEpisodeIndex ]
// 	--> TVShow
// 		FilePath--> [ "TVShows" , "TheRedGreenShow" , wSeasonIndex , wEpisodeIndex ]
// 			or ...
// 		FilePath--> [ "TVShows" , LAST_SS.TVShows.LastShowIndex , wSeasonIndex , wEpisodeIndex ]
// 			or ...
// 		FilePath--> [ "TVShows" , LAST_SS.TVShows.LastPlayedObject ]
		
// 		if ( advancing through shows ) {
// 			NextShow--> ( LAST_SS.TVShows.LastPlayedObject.UNEQ_Index + 1 )
// 		}
// 		else {
// 			NextEpisode--> ( LAST_SS.TVShows.LastPlayedObject.episode_Index + 1 )
// 		}
// 		NextSeason ? 


// Initialization 
function REDIS_GET_KEYS_FROM_PATTERN( wPattern ) {
	return new Promise( function( resolve , reject ) {
		try { redis.keys( wPattern , function( err , keys ) { resolve( keys ); }); }
		catch( error ) { console.log( error ); reject( error ); }
	});
}
function REDIS_GET_KEY( wKey ) {
	return new Promise( function( resolve , reject ) {
		try { redis.get( wKey , function( err , key ) { resolve( key ); }); }
		catch( error ) { console.log( error ); reject( error ); }
	});
}
function REDIS_GET_FROM_SET_BY_INDEX( wKey , wIndex ) {
	return new Promise( function( resolve , reject ) {
		try { redis.lindex( wKey , wIndex , function( err , key ) { resolve( key ); }); }
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function REDIS_GET_MULTI_KEY( ...args ) {
	return new Promise( function( resolve , reject ) {
		try { redis.mget( ...args , function( err , values ) { resolve( values ); }); }
		catch( error ) { console.log( error ); reject( error ); }
	});
}

const h1 = "HARD_DRIVE.";
( async ()=> {
	
	//redis.multi([[ 'script', 'load', 'return 1' ]]).exec(function(err , results){ if ( err ) { console.log( err ); } else { console.log( results ) } });
	
	var ek = await REDIS_GET_KEYS_FROM_PATTERN( "HARD_DRIVE.*" );
	if ( ek.length > 0 ) { redis.del.apply( redis , ek , function( err , results ){ if ( err ) { console.log( err ); } else { console.log( results ) } }); }
	
	//var mp = await require( "./utils/localMedia_Util" ).findAndMountUSB_From_UUID( "2864E38A64E358D8" );
	var mp = "/home/morpheous/TMP2/EMULATED_MOUNT_PATH";
	redis.set( "HARD_DRIVE.MOUNT_POINT" , mp );

	var x1 = await require( "./utils/localMedia_Util" ).buildHardDriveReference( mp );
	for ( var wGenre in x1 ) {
		var x1Shows = Object.keys( x1[ wGenre ] );
		if ( x1Shows.length < 1 ) { continue; }
		var x1S_KEY = h1 + wGenre + ".UNEQ";
		redis.rpush.apply( redis , [ x1S_KEY ].concat( x1Shows ) );
		for ( var wShow in x1[ wGenre ] ) { // Each Show in Genre
			var wShow_R_KEY = h1 + wGenre + ".FP." + wShow;
			for ( var j = 0; j < x1[ wGenre ][ wShow ].length; ++j ) {
				var wSeason_R_KEY = wShow_R_KEY + "." + j.toString();
				//var wSeason_R_KEY = wShow_R_KEY + "." + x1[ wGenre ][ wShow ][ j ];
				if ( x1[ wGenre ][ wShow ][ j ].length > 0 ) { // <-- Has Episodes Stored in Season Folders
					redis.rpush.apply( redis , [ wSeason_R_KEY ].concat( x1[ wGenre ][ wShow ][ j ] ) );
				}
			}
		}
	}

	wPlay( "TVShows" );

})();


function PLAY_FROM_REF_STRUCT( wArgArray ) {

}

function calculateNext( wLastPlayedInGenre ) {

	console.log( "Previous LastPlayed = " );
	console.log( wLastPlayedInGenre );
	var NewPlaying = null;



	console.log( "New Playing OBJ = " );
	console.log( NewPlaying );

}

const lp1 = "LAST_SS.";
async function wPlay( wGenre ) {

	var g1_KEY = lp1 + wGenre;
	var MKEY_SET = await REDIS_GET_MULTI_KEY( g1_KEY , h1 + "MOUNT_POINT" );
	console.log( MKEY_SET );
	
	var NowPlaying = {};
	if ( MKEY_SET[ 0 ] === null ) { // Fresh 
		var wShowName = await REDIS_GET_FROM_SET_BY_INDEX( h1 + wGenre + ".UNEQ" , 0 );
		var wFirstEpisode = await REDIS_GET_FROM_SET_BY_INDEX( h1 + wGenre + ".FP." + wShowName + ".0" , 0 ); // Get Season 0 , Episode 0
		var FULL_Path = MKEY_SET[1] + "/" + wGenre + "/" + wShowName + "/01/" + wFirstEpisode; 
		NowPlaying = { genre: wGenre , uneq_idx: 0 , show_name: wShowName , season_idx: 0 , episode_idx: 0 , fp: FULL_Path , completed: false , cur_time: 0 , remaining_time: 0 , three_percent: 0 , duration: 0 };
		redis.set( g1_KEY , JSON.stringify( NowPlaying ) );
	}
	else {
		console.log( "not fresh !!" );
		MKEY_SET[ 0 ] = JSON.parse( MKEY_SET[ 0 ] );
	
		if ( !MKEY_SET[ 0 ].completed ) { NowPlaying = MKEY_SET[ 0 ]; }
		else { NowPlaying = calculateNext( MKEY_SET[ 0 ] ); }
	}

	console.log( "STARTING --> MPLAYER" );
	//console.log( wPath );
	
	MPLAYER_MAN.playFilePath( NowPlaying.fp );
	if ( NowPlaying.cur_time > 1 ) {
		await wSleep( 1000 );
		MPLAYER_MAN.seekSeconds( NowPlaying.cur_time );
	}

}

function wPause() {}
function wStop() {}
function wNext() {}
function wPrevious() {}

module.exports.play 			= wPlay;

//module.exports.getAvailableMedia = ()=> { return HD_REF; }
//module.exports.getCurrentTime 	= MPLAYER_MAN.getCurrentTime
module.exports.pause 			= wPause;
module.exports.resume 			= wPause;
module.exports.stop 			= wStop;
module.exports.next 			= wNext;
module.exports.previous			= wPrevious;



process.on('SIGINT', function () {
	redis.quit();
});