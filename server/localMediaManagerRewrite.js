require( "shelljs/global" );
const path = require("path");

// var wEmitter	= require("../main.js").wEmitter;
var wEmitter = new (require("events").EventEmitter);
module.exports.wEmitter = wEmitter;

//var redis = require( "./clientManager.js" ).redis;
var REDIS = require("redis");
var redis = REDIS.createClient( "8443" , "localhost" );
const RU = require( "./utils/redis_Utils.js" );

const MPLAYER_MAN = require( "./utils/mplayerManager.js" );

function wSleep( ms ) { return new Promise( resolve => setTimeout( resolve , ms ) ); }

//const GEN_HD_REF = require( "./utils/localMedia_Util" ).buildHardDriveReference;

function fixPathSpace( wFP ) {
	var fixSpace = new RegExp( " " , "g" );
	wFP = wFP.replace( fixSpace , String.fromCharCode(92) + " " );
	wFP = wFP.replace( ")" , String.fromCharCode(92) + ")" );
	wFP = wFP.replace( "(" , String.fromCharCode(92) + "(" );
	wFP = wFP.replace( "'" , String.fromCharCode(92) + "'" );
	return wFP;
}
function wGetDuration( wFP ) {
	try {
		wFP = fixPathSpace( wFP );
		var z1 = "ffprobe -v error -show_format -i " + wFP;
		var x1 = exec( z1 , { silent: true , async: false } );
		if ( x1.stderr ) { return( x1.stderr ); }
		var wMatched = x1.stdout.match( /duration="?(\d*\.\d*)"?/ );
		var f1 = Math.floor( wMatched[1] );
		return f1;
	}
	catch( error ) { console.log( error ); }
}





// Initialization 
const h1 = "HARD_DRIVE.";
( async ()=> {
		
	var ek = await RU.getKeysFromPattern( redis , "HARD_DRIVE.*" );
	if ( ek.length > 0 ) { }
	
	//var mp = await require( "./utils/localMedia_Util" ).findAndMountUSB_From_UUID( "2864E38A64E358D8" );
	var mp = "/home/morpheous/TMP2/EMULATED_MOUNT_PATH";
	redis.set( "HARD_DRIVE.MOUNT_POINT" , mp );

	var x1 = await require( "./utils/localMedia_Util" ).buildHardDriveReference( mp );
	for ( var wGenre in x1 ) {
		var x1Shows = Object.keys( x1[ wGenre ] );
		if ( x1Shows.length < 1 ) { continue; }
		var LSS_SK_B = h1 + wGenre + ".META.";
		var LSS_SK_U = LSS_SK_B + "UNEQ";
		var LSS_SK_T = LSS_SK_B + "TOTAL";
		var LSS_SK_C = LSS_SK_B + "CURRENT_INDEX";
		await RU.setMulti( redis , [ [ "set" , LSS_SK_T , x1Shows.length ] ,  [ "set" , LSS_SK_C , 0 ] ]);
		redis.rpush.apply( redis , [ LSS_SK_U ].concat( x1Shows ) );
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

	wPlay({ genre: "TVShows" });

})();





// Logic Info and Doc Links
// https://docs.google.com/document/d/1FH4fTbUnyNo4hFxcenGKhPUenl_CJgshhNVaFZUsM_s/edit?usp=sharing

var G_NOW_PLAYING = null;
var G_NP_R_KEY = null;
var G_LS_R_KEY = null;
function calculatePrevious( wLastPlayedInGenre ) {

	console.log( "Previous LastPlayed = " );
	console.log( wLastPlayedInGenre );
	var NewPlaying = null;

	console.log( "New Playing OBJ = " );
	console.log( NewPlaying );

}

function calculateNext( wLastPlayedInGenre ) {

	console.log( "Previous LastPlayed = " );
	console.log( wLastPlayedInGenre );
	var NewPlaying = null;

	console.log( "New Playing OBJ = " );
	console.log( NewPlaying );

}

const lp1 = "LAST_SS.LOCAL_MEDIA.";
async function wPlay( wOptions ) {

	var g1_KEY = lp1 + wOptions.genre + ".NOW_PLAYING";
	var MKEY_SET = await RU.getMultiKeys( redis , g1_KEY , h1 + "MOUNT_POINT" );
	
	var NowPlaying = {};
	if ( MKEY_SET[ 0 ] === null ) { // Genre Fresh 
		var wShowName = await RU.getFromSetByIndex( redis , h1 + wOptions.genre + ".META.UNEQ" , 0 );
		var wFirstEpisode = await RU.getFromSetByIndex( redis , h1 + wOptions.genre + ".FP." + wShowName + ".0" , 0 ); // Get Season 0 , Episode 0
		var FULL_Path = MKEY_SET[1] + "/" + wOptions.genre + "/" + wShowName + "/01/" + wFirstEpisode; 
		NowPlaying = { genre: wOptions.genre , uneq_idx: 0 , show_name: wShowName , season_idx: 0 , episode_idx: 0 , fp: FULL_Path , completed: false , cur_time: 0 , remaining_time: 0 , three_percent: 0 , duration: 0 };
		redis.set( g1_KEY , JSON.stringify( NowPlaying ) );
	}
	else {
		console.log( "not genre fresh !!" );
		console.log( MKEY_SET );
		MKEY_SET[ 0 ] = JSON.parse( MKEY_SET[ 0 ] );
		if ( !MKEY_SET[ 0 ].completed ) { NowPlaying = MKEY_SET[ 0 ]; }
		else { NowPlaying = calculateNext( MKEY_SET[ 0 ] ); }
	}

	if ( NowPlaying.three_percent == 0 ) {
		NowPlaying.duration = wGetDuration( NowPlaying.fp );
		NowPlaying.three_percent = Math.floor( ( NowPlaying.duration - ( NowPlaying.duration * 0.025 ) ) );
	}

	var js1 = JSON.stringify( NowPlaying );
	var imk1 = lp1 + NowPlaying.show_name;
	await RU.setMulti( redis , [ [ "set" , g1_KEY , js1 ] ,  [ "set" , imk1 , js1 ] ]);
	G_NOW_PLAYING = NowPlaying;
	G_NP_R_KEY = g1_KEY;
	G_LS_R_KEY = imk1;

	console.log( "STARTING --> MPLAYER" );	
	MPLAYER_MAN.playFilePath( NowPlaying.fp );
	if ( NowPlaying.cur_time > 1 ) {
		await wSleep( 1000 );
		MPLAYER_MAN.seekSeconds( NowPlaying.cur_time );
	}

}

wEmitter.on( "MPlayerOVER" , async function( wResults ) {
	
	G_NOW_PLAYING.cur_time = wResults;
	G_NOW_PLAYING.remaining_time = ( G_NOW_PLAYING.duration - G_NOW_PLAYING.cur_time );
	if ( G_NOW_PLAYING.cur_time >= G_NOW_PLAYING.three_percent ) { G_NOW_PLAYING.completed = true; }
	var x1 = JSON.stringify( G_NOW_PLAYING );
	await RU.setMulti( redis , [ [ "set" , G_NP_R_KEY , x1 ] ,  [ "set" , G_LS_R_KEY , x1 ] ]);

	var wAS = await RU.getMultiKeys( redis , "LAST_SS.ACTIVE_STATE" , "LAST_SS.ACTIVE_STATE.META" );
	if ( wAS[0] === "LOCAL_MEDIA" ) {
		wPlay( JSON.parse( wAS[1] ) );
	}
	else {
		console.log( "WE WERE TOLD TO QUIT" );
	}

});

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