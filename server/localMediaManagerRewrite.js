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






var GLOBAL_INSTANCE_MOUNT_POINT = "";
var G_NOW_PLAYING , G_R_Live_Genre_NP , G_R_NP_ShowName_Backup = null;
// Initialization 
const h1 = "HARD_DRIVE.";
( async ()=> {
		
	var ek = await RU.getKeysFromPattern( redis , "HARD_DRIVE.*" );
	// FORCED-CLEANSING
	//if ( ek.length > 0 ) { await RU.delKeys( redis , ek ); }
	//console.log( "done cleansing instance" );
	
	if ( ek.length < 1 ) { 
		//var mp = await require( "./utils/localMedia_Util" ).findAndMountUSB_From_UUID( "2864E38A64E358D8" );
		var mp = "/home/morpheous/TMP2/EMULATED_MOUNT_PATH";
		await RU.setKey( redis , "HARD_DRIVE.MOUNT_POINT" , mp );
		GLOBAL_INSTANCE_MOUNT_POINT = mp;
		var x1 = await require( "./utils/localMedia_Util" ).buildHardDriveReference( mp ); // we alll know this is cancer. but fml
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
					if ( x1[ wGenre ][ wShow ][ j ].length > 0 ) { // <-- Has Episodes Stored in Season Folders
						redis.rpush.apply( redis , [ wSeason_R_KEY ].concat( x1[ wGenre ][ wShow ][ j ] ) );
					}
				}
			}
		}
		console.log( "done building HD_REF" );
	}

	await RU.setMulti( redis , [
		[ "set" , "LAST_SS.ACTIVE_STATE" , "LOCAL_MEDIA" ] ,
		[ "set" , R_LM_Config_Genre , "TVShows" ] ,
		[ "set" , R_LM_Config_AdvanceShow , false ] ,
		[ "set" , R_LM_Config_SpecificShow , false ] ,
		[ "set" , R_LM_Config_SpecificEpisode , false ] ,
	]);

	wPlay();

})();



// Logic Info and Doc Links
// https://docs.google.com/document/d/1FH4fTbUnyNo4hFxcenGKhPUenl_CJgshhNVaFZUsM_s/edit?usp=sharing
function calculatePrevious( wLastPlayedInGenre ) {

	console.log( "Previous LastPlayed = " );
	console.log( wLastPlayedInGenre );
	var NewPlaying = null;

	console.log( "New Playing OBJ = " );
	console.log( NewPlaying );

}

const R_GET_LOCAL_MEDIA_CONFIG = "CONFIG.LOCAL_MEDIA.LIVE";
function calculateNext( lastPlayed , config ) {
	return new Promise( async function( resolve , reject ) {
		try {

			const R_N_BASE = "HARD_DRIVE." + lastPlayed.genre + ".";

			var F_UNEQ_IDX = lastPlayed.uneq_idx;
			var F_Episode_IDX = 0;
			var F_Season_IDX = lastPlayed.season_idx;
			var F_ShowName = lastPlayed.show_name;
			var F_FP = "";
			var F_RemainingTime , F_CurrentTime , F_ThreePercent , F_Duration = 0;
			var nextEpisode = 0;

			if ( config[ 3 ] !== null ) { // IF Specific-Episode
				
			}
			else if ( config[ 2 ] !== null ) { // IF Specific-Show

			}
			else if ( config[ 1 ] ) { // IF Advance-Next-Show is Enabled
				
			}
			else { // Just continue then to +1-episode based on lastPlayed
				
				nextEpisode = ( lastPlayed.episode_idx + 1 );
				F_Episode_IDX = nextEpisode;
				const R_Next_EP = R_N_BASE + "FP." + lastPlayed.show_name + "." + lastPlayed.season_idx;
				nextEpisode = await RU.getFromSetByIndex( redis , R_Next_EP , nextEpisode );

				if ( nextEpisode === null ) { // IF Advanced Past Total-Episodes in Season Boundry
					console.log( "inside episode reset" );
					F_Episode_IDX = 0;
					F_Season_IDX = ( lastPlayed.season_idx + 1 );
					var R_Next_Season = R_N_BASE + "FP." + lastPlayed.show_name + "." + F_Season_IDX;
					var intermediaryNext_Episode = await RU.getFromSetByIndex( redis , R_Next_Season , 0 );
					if ( intermediaryNext_Episode === null ) { // IF Advanced Past Total-Seasons in Show Boundry
						console.log( "inside season reset" );
						F_Season_IDX = 0;
						R_Next_Season = R_N_BASE + "FP." + lastPlayed.show_name + "." + F_Season_IDX;
						F_FP = await RU.getFromSetByIndex( redis , R_Next_Season , 0 );
					}
					else { F_FP = intermediaryNext_Episode; }
				}

			}

			// Adjust Final-Full-File-Path from Redis "set" language
			var xb1 = GLOBAL_INSTANCE_MOUNT_POINT + lastPlayed.genre + "/" + F_ShowName;
			if ( F_Season_IDX < 10 ) { F_FP = xb1 + "/0" + ( F_Season_IDX + 1 ).toString() + "/" + F_FP; }
			else { F_FP = xb1 + "/" + ( F_Season_IDX + 1 ).toString() + "/" + F_FP; }
			
			resolve({
				genre: lastPlayed.genre ,
				uneq_idx: F_UNEQ_IDX ,
				show_name: F_ShowName ,
				season_idx: F_Season_IDX ,
				episode_idx: F_Episode_IDX ,
				fp: F_FP ,
				completed: false ,
				remaining_time: F_RemainingTime ,
				three_percent: F_ThreePercent ,
				duration: F_Duration ,
				cur_time: F_CurrentTime
			});

		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}


const R_LocalMedia_Base = "LAST_SS.LOCAL_MEDIA.";
const R_LM_Config_Base = "CONFIG.LOCAL_MEDIA.LIVE.";
const R_LM_Config_Genre = R_LM_Config_Base + "GENRE";
const R_LM_Config_AdvanceShow = R_LM_Config_Base + "ADVANCE_SHOW";
const R_LM_Config_SpecificShow = R_LM_Config_Base + "SPECIFIC_SHOW";
const R_LM_Config_SpecificEpisode = R_LM_Config_Base + "SPECIFIC_EPISODE";
async function wPlay() {

	var FinalNowPlaying = {};
	
	var liveConfig = await RU.getMultiKeys( redis , R_LM_Config_Genre , R_LM_Config_AdvanceShow , R_LM_Config_SpecificShow , R_LM_Config_SpecificEpisode );
	
	const R_Live_Genre_NP = R_LocalMedia_Base + liveConfig[ 0 ] + ".NOW_PLAYING";
	var liveLastPlayed = await RU.getKey( redis , R_Live_Genre_NP )
	if ( liveLastPlayed === null ) { // Nothing Ever Played In This Genre
		console.log( "genre is FRESH !!" );
		const R_FirstShow = h1 + liveConfig[ 0 ] + ".META.UNEQ";
		const showName = await RU.getFromSetByIndex( redis , R_FirstShow , 0 );
		const R_FirstEpisodeFP = h1 + liveConfig[ 0 ] + ".FP." + showName + ".0";
		const firstEpisode = await RU.getFromSetByIndex( redis , R_FirstEpisodeFP , 0 );
		const firstEpFullPath = GLOBAL_INSTANCE_MOUNT_POINT + "/" + liveConfig[ 0 ] + "/" + showName + "/01/" + firstEpisode;
		FinalNowPlaying = { 
			genre: liveConfig[ 0 ] , uneq_idx: 0 , show_name: showName , 
			season_idx: 0 , episode_idx: 0 , fp: firstEpFullPath , 
			completed: false , cur_time: 0 , remaining_time: 0 , 
			three_percent: 0 ,duration: 0
		};
	}
	else { // NOT Genre Fresh
		console.log( "not genre fresh !!" );
		liveLastPlayed = JSON.parse( liveLastPlayed );
		// If Previously Last-Played OBJ is NOT fully watched , restart then and seek to where was left off
		if ( !liveLastPlayed.completed ) { FinalNowPlaying = liveLastPlayed; console.log( "not completed" ); console.log( FinalNowPlaying ); }
		else { FinalNowPlaying = await calculateNext( liveLastPlayed , liveConfig ); } // ELSE , calculate the **Next** playing-obj
	}

	if ( FinalNowPlaying.three_percent == 0 ) {
		FinalNowPlaying.duration = wGetDuration( FinalNowPlaying.fp );
		FinalNowPlaying.three_percent = Math.floor( ( FinalNowPlaying.duration - ( FinalNowPlaying.duration * 0.025 ) ) );
	}

	console.log( FinalNowPlaying );

	const x1 = JSON.stringify( FinalNowPlaying );
	const R_NP_ShowName_BackupKey = R_Live_Genre_NP + "." + FinalNowPlaying.show_name;
	await RU.setMulti( redis , [ [ "set" , R_Live_Genre_NP , x1 ] ,  [ "set" , R_NP_ShowName_BackupKey , x1 ] ]);


	G_NOW_PLAYING = FinalNowPlaying;
	G_R_Live_Genre_NP = R_Live_Genre_NP;
	G_R_NP_ShowName_Backup = R_NP_ShowName_BackupKey;


	console.log( "STARTING --> MPLAYER" );	
	MPLAYER_MAN.playFilePath( FinalNowPlaying.fp );
	if ( FinalNowPlaying.cur_time > 1 ) {
		await wSleep( 1000 );
		MPLAYER_MAN.seekSeconds( FinalNowPlaying.cur_time );
	}

}

function updateLastPlayedTime( wTime ) {
	return new Promise( async function( resolve , reject ) {
		try {
			G_NOW_PLAYING.cur_time = wTime;
			G_NOW_PLAYING.remaining_time = ( G_NOW_PLAYING.duration - G_NOW_PLAYING.cur_time );
			if ( G_NOW_PLAYING.cur_time >= G_NOW_PLAYING.three_percent ) { G_NOW_PLAYING.completed = true; }
			var x1 = JSON.stringify( G_NOW_PLAYING );
			await RU.setMulti( redis , [ [ "set" , G_R_Live_Genre_NP , x1 ] ,  [ "set" , G_R_NP_ShowName_Backup , x1 ] ]);			
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

wEmitter.on( "MPlayerOVER" , async function( wResults ) {
	
	await updateLastPlayedTime( wResults );

	// Continue if Config Says were Still Active
	var wAS = await RU.getMultiKeys( redis , "LAST_SS.ACTIVE_STATE" , "LAST_SS.ACTIVE_STATE.META" );
	if ( wAS[0] === "LOCAL_MEDIA" ) { wPlayRewrite(); }
	else { console.log( "WE WERE TOLD TO QUIT" ); }

});

function wPause() {
	return new Promise( async function( resolve , reject ) {
		try {
			var cur_time = MPLAYER_MAN.pause();
			await updateLastPlayedTime( cur_time );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
function wStop() {
	return new Promise( async function( resolve , reject ) {
		try {
			var cur_time = MPLAYER_MAN.silentStop();
			await updateLastPlayedTime( cur_time );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
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



process.on( "SIGINT" , async function () {
	await wStop();
	redis.quit();
});