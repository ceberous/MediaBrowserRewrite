require( "shelljs/global" );
const path = require("path");
const wEmitter	= require("../main.js").wEmitter;
const redis = require( "../main.js" ).redis;
const RU = require( "./utils/redis_Utils.js" );
const RC = require( "../config.js" ).REDIS.CONSTANTS.LOCAL_MEDIA;
const h1 = "HARD_DRIVE.";

const colors	= require( "colors" );
function wcl( wSTR ) { console.log( colors.magenta.bgBlack( "[LOCAL_MEDIA_MAN] --> " + wSTR ) ); }


const MP_CONFIG = require( "../config.js" ).MEDIA_MOUNT_POINT;
const MPLAYER_MAN = require( "./utils/mplayerManager.js" );

// Logic Info and Doc Links
// https://docs.google.com/document/d/1FH4fTbUnyNo4hFxcenGKhPUenl_CJgshhNVaFZUsM_s/edit?usp=sharing

function wSleep( ms ) { return new Promise( resolve => setTimeout( resolve , ms ) ); }

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
var G_NOW_PLAYING = G_R_Live_Genre_NP = G_R_NP_ShowName_Backup = null;

function INITIALIZATION() {
	return new Promise( async function( resolve , reject ) {
		try {
			// Assume if there is stuff in redis , that it is correct. 
			// Otherwise , if an error is found , we should clear first , and then call this
			// to build from scratch
			var ek = await RU.getKeysFromPattern( redis , "HARD_DRIVE.*" );
			if ( ek ) {
				if ( ek.length > 1 ) { 
					GLOBAL_INSTANCE_MOUNT_POINT = await RU.getKey( redis , "HARD_DRIVE.MOUNT_POINT" );
					resolve( "already in redis" ); 
					return; 
				}
			}
			// Cleanse and Prepare Mount_Point
			//await RU.deleteMultiplePatterns( RC.BASE + "*" );

			var mp = null;
			if ( MP_CONFIG[ "UUID" ] ) {
				mp = await require( "./utils/localMedia_Util" ).findAndMountUSB_From_UUID( MP_CONFIG[ "UUID" ] );
				mp = mp + "MEDIA_MANAGER/";
			}
			else if ( MP_CONFIG[ "LOCAL_PATH" ] ) {
				mp = MP_CONFIG[ "LOCAL_PATH" ];
			}
			if ( mp === null ) { resolve( "no media available" ); return; }
			await RU.setKey( redis , "HARD_DRIVE.MOUNT_POINT" , mp );
			wcl( "Mount_Point = " + mp );

			// Scan Mount_Point
			var x1 = await require( "./utils/localMedia_Util" ).buildHardDriveReference( mp );

			// Store Info into Redis ... why
			for ( var wGenre in x1 ) {
				var x1Shows = Object.keys( x1[ wGenre ] );
				if ( x1Shows.length < 1 ) { continue; }
				var LSS_SK_B = RC.BASE + wGenre + ".META.";
				var LSS_SK_U = LSS_SK_B + "UNEQ";
				var LSS_SK_T = LSS_SK_B + "TOTAL";
				var LSS_SK_C = LSS_SK_B + "CURRENT_INDEX";
				await RU.setMulti( redis , [ [ "set" , LSS_SK_T , x1Shows.length ] ,  [ "set" , LSS_SK_C , 0 ] ]);
				redis.rpush.apply( redis , [ LSS_SK_U ].concat( x1Shows ) );
				for ( var wShow in x1[ wGenre ] ) { // Each Show in Genre
					var wShow_R_KEY = RC.BASE + wGenre + ".FP." + wShow;
					for ( var j = 0; j < x1[ wGenre ][ wShow ].length; ++j ) {
						var wSeason_R_KEY = wShow_R_KEY + "." + j.toString();
						if ( x1[ wGenre ][ wShow ][ j ].length > 0 ) { // <-- Has Episodes Stored in Season Folders
							redis.rpush.apply( redis , [ wSeason_R_KEY ].concat( x1[ wGenre ][ wShow ][ j ] ) );
						}
					}
				}
			}
			wcl( "done building HD_REF" );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function calculatePrevious( lastPlayed , config ) {
	return new Promise( async function( resolve , reject ) {
		try {
			const R_N_BASE = "HARD_DRIVE." + lastPlayed.genre + ".";

			var F_UNEQ_IDX = lastPlayed.uneq_idx;
			var F_ShowName = lastPlayed.show_name;
			var F_Episode_IDX = lastPlayed.episode_idx;
			var F_Season_IDX = lastPlayed.season_idx;
			var F_FP = "";
			var F_FP_Already_Set = false;
			var F_RemainingTime = F_CurrentTime = F_ThreePercent = F_Duration = previousEpisode = 0;

			previousEpisode = ( F_Episode_IDX - 1 );
			F_Episode_IDX = previousEpisode;
			const R_Previous_Base = R_N_BASE + "FP." + F_ShowName;
			const R_Previous_EP = R_Previous_Base + "." + F_Season_IDX;
			previousEpisode = await RU.getFromSetByIndex( redis , R_Previous_EP , previousEpisode );
			//console.log( "next episode === " + previousEpisode );

			if ( previousEpisode === null ) { // IF Advanced Past Total-Episodes in Season Boundry
				
				//console.log( "inside episode reset" );
				F_Season_IDX = ( F_Season_IDX - 1 );
				if ( F_Season_IDX === -1 ) { // We Precceded Past Season '0' , and we need to set to last season , last episode
					F_Season_IDX = await RU.getKeysFromPattern( redis , R_Previous_Base + ".*" );
					F_Season_IDX = ( F_Season_IDX.length - 1 );
				}
				const R_Previous_Season = R_Previous_Base + "." + F_Season_IDX;
				F_Episode_IDX = await RU.getListLength( redis , R_Previous_Season );
				F_Episode_IDX = ( F_Episode_IDX - 1 );

				F_FP = await RU.getFromSetByIndex( redis , R_Previous_Season , F_Episode_IDX );

			}
			else { F_FP = previousEpisode; }

			// Adjust Final-Full-File-Path from Redis "set" language
			if ( !F_FP_Already_Set ) {
				var xb1 = GLOBAL_INSTANCE_MOUNT_POINT + "/" + lastPlayed.genre + "/" + F_ShowName;
				var xb2 = ( F_Season_IDX + 1 ).toString();
				if ( F_Season_IDX < 10 ) { F_FP = xb1 + "/0" + xb2 + "/" + F_FP; }
				else { F_FP = xb1 + "/" + xb2 + "/" + F_FP; }
			}

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

function calculateNext( lastPlayed , config ) {
	return new Promise( async function( resolve , reject ) {
		try {

			const R_N_BASE = "HARD_DRIVE." + lastPlayed.genre + ".";

			var F_UNEQ_IDX = lastPlayed.uneq_idx;
			var F_ShowName = lastPlayed.show_name;
			var F_Episode_IDX = lastPlayed.episode_idx;
			var F_Season_IDX = lastPlayed.season_idx;
			var F_FP = "";
			var F_FP_Already_Set = false;
			var F_RemainingTime = F_CurrentTime = F_ThreePercent = F_Duration = nextEpisode = 0;

			if ( config[ 3 ] === "true" ) { // IF Specific-Episode
				
			}
			else if ( config[ 2 ] === "true" ) { // IF Specific-Show

			}
			else if ( config[ 1 ] === "true" ) { // IF Advance-Next-Show is Enabled
				//console.log( "inside Advance-Next-Show" );
				F_UNEQ_IDX = ( F_UNEQ_IDX + 1 );
				const R_NextShow = R_N_BASE + "META.UNEQ";
				F_ShowName = await RU.getFromSetByIndex( redis , R_NextShow , F_UNEQ_IDX );
				if ( F_ShowName === null ) { //  IF Advanced Past Total-UNEQ-aka-Unique Shows in Genre
					//console.log( "inside show-in-genre reset" );
					F_UNEQ_IDX = 0;
					F_ShowName = await RU.getFromSetByIndex( redis , R_NextShow , F_UNEQ_IDX );
				}

				// Check if Show Already Has a Previous Position
				// This is the only point of double saving the **nowPlaying** obj into G_R_NP_ShowName_Backup
				const R_PreviouslyWatched = "LAST_SS.LOCAL_MEDIA." + lastPlayed.genre + "." + F_ShowName;
				var previouslyWatched = await RU.getKey( redis , R_PreviouslyWatched );
				if ( previouslyWatched !== null ) {
					lastPlayed = JSON.parse( previouslyWatched );
					F_FP_Already_Set = true;
					F_FP = lastPlayed.fp;
					F_RemainingTime = lastPlayed.remaining_time;
					F_Duration = lastPlayed.duration;
					F_ThreePercent = lastPlayed.three_percent;
					F_CurrentTime = lastPlayed.cur_time;
					F_Episode_IDX = lastPlayed.episode_idx;
					F_Season_IDX = lastPlayed.season_idx;
				}
				else { F_Episode_IDX = -1; F_Season_IDX = 0; await callNextGen1Build(); }
				
			}
			else { await callNextGen1Build(); } // Just continue then to +1-episode based on lastPlayed

			function callNextGen1Build() {
				return new Promise( async function( resolve , reject ) {
					try {
						nextEpisode = ( F_Episode_IDX + 1 );
						F_Episode_IDX = nextEpisode;
						const R_Next_EP = R_N_BASE + "FP." + F_ShowName + "." + F_Season_IDX;
						nextEpisode = await RU.getFromSetByIndex( redis , R_Next_EP , nextEpisode );
						//console.log( "next episode === " + nextEpisode );

						if ( nextEpisode === null ) { // IF Advanced Past Total-Episodes in Season Boundry
							//console.log( "inside episode reset" );
							F_Episode_IDX = 0;
							F_Season_IDX = ( F_Season_IDX + 1 );
							var R_Next_Season = R_N_BASE + "FP." + F_ShowName + "." + F_Season_IDX;
							var intermediaryNext_Episode = await RU.getFromSetByIndex( redis , R_Next_Season , 0 );
							if ( intermediaryNext_Episode === null ) { // IF Advanced Past Total-Seasons in Show Boundry
								//console.log( "inside season reset" );
								F_Season_IDX = 0;
								R_Next_Season = R_N_BASE + "FP." + F_ShowName + "." + F_Season_IDX;
								F_FP = await RU.getFromSetByIndex( redis , R_Next_Season , 0 );
							}
							else { F_FP = intermediaryNext_Episode; }
						}
						else { F_FP = nextEpisode; }
						resolve();
					}
					catch( error ) { console.log( error ); reject( error ); }
				});
			}

			// Adjust Final-Full-File-Path from Redis "set" language
			if ( !F_FP_Already_Set ) {
				var xb1 = GLOBAL_INSTANCE_MOUNT_POINT + "/" + lastPlayed.genre + "/" + F_ShowName;
				var xb2 = ( F_Season_IDX + 1 ).toString();
				if ( F_Season_IDX < 10 ) { F_FP = xb1 + "/0" + xb2 + "/" + F_FP; }
				else { F_FP = xb1 + "/" + xb2 + "/" + F_FP; }
			}

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

function updateLastPlayedTime( wTime ) {
	return new Promise( async function( resolve , reject ) {
		try {
			if ( wTime ) { 
				wcl( "wTime === " + wTime.toString() );
				G_NOW_PLAYING.cur_time = wTime;
				G_NOW_PLAYING.remaining_time = ( G_NOW_PLAYING.duration - G_NOW_PLAYING.cur_time );
				if ( G_NOW_PLAYING.cur_time >= G_NOW_PLAYING.three_percent ) { G_NOW_PLAYING.completed = true; }
				var x1 = JSON.stringify( G_NOW_PLAYING );
				await RU.setMulti( redis , [ [ "set" , RC.LAST_SS.NOW_PLAYING[ G_NOW_PLAYING.genre ] , x1 ] ,  [ "set" , G_R_NP_ShowName_Backup , x1 ] ]);
			}
			//else { console.log( "no wTIME !!!!" ); G_NOW_PLAYING.completed = true; } // Just assuming something **bad** happened , and mark as completed anyways
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

wEmitter.on( "MPlayerOVER" , async function( wResults ) {
	
	await updateLastPlayedTime( wResults );

	await wSleep( 1000 );

	// Continue if Config Says were Still Active
	var wAS = await RU.getMultiKeys( redis , "LAST_SS.ACTIVE_STATE" , "LAST_SS.ACTIVE_STATE.META" );
	if ( wAS[0] === "LOCAL_MEDIA" ) { wPlay(); }
	else { wcl( "WE WERE TOLD TO QUIT" ); }

});


function getLiveConfig() {
	return new Promise( async function( resolve , reject ) {
		try {
			var liveConfig = await RU.getMultiKeys( redis , RC.CONFIG.GENRE , RC.CONFIG.ADVANCE_SHOW , RC.CONFIG.SPECIFIC_SHOW , RC.CONFIG.SPECIFIC_EPISODE );
			//wcl( liveConfig );
			var liveLastPlayed = await RU.getKey( redis , RC.LAST_SS.NOW_PLAYING[ liveConfig[ 0 ] ] );
			resolve( [ liveLastPlayed , liveConfig ] );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function wPlay( skipping , previous ) {
	return new Promise( async function( resolve , reject ) {
		try {
			var FinalNowPlaying = {};

			var lc = await getLiveConfig();
			var liveLastPlayed = JSON.parse( lc[ 0 ] );
			var liveConfig = lc[ 1 ];
			//console.log( liveLastPlayed );
			wcl( "Live Config === \n" + liveConfig );
			console.log("");

			if ( previous ) { /*console.log("inside previous case");*/ FinalNowPlaying = await calculatePrevious( liveLastPlayed , liveConfig ); }
			else if ( skipping ) { /*console.log("inside skipping case");*/ FinalNowPlaying = await calculateNext( liveLastPlayed , liveConfig ); }

			else if ( liveLastPlayed === null ) { // IF - Nothing ever watched in Genre
				//console.log( "genre is FRESH !!" );
				const R_FirstShow = h1 + liveConfig[ 0 ] + ".META.UNEQ";
				const showName = await RU.getFromSetByIndex( redis , R_FirstShow , 0 );
				const R_FirstEpisodeFP = h1 + liveConfig[ 0 ] + ".FP." + showName + ".0";
				const firstEpisode = await RU.getFromSetByIndex( redis , R_FirstEpisodeFP , 0 );
				const firstEpFullPath = GLOBAL_INSTANCE_MOUNT_POINT + "/" + liveConfig[ 0 ] + "/" + showName + "/01/" + firstEpisode;
				FinalNowPlaying = { 
					genre: liveConfig[ 0 ] , uneq_idx: 0 , show_name: showName ,
					season_idx: 0 , episode_idx: 0 , fp: firstEpFullPath ,
					completed: false , cur_time: 0 , remaining_time: 0 ,
					three_percent: 0 , duration: 0
				};
			}
			else { // NOT Genre Fresh ---- NORMAL Case , aka just episode +1
				//console.log( "\nhere at stage 3" );
				//console.log( "not genre fresh !!" );

				// If Previously Last-Played OBJ is NOT fully watched , restart then and seek to where was left off
				if ( !liveLastPlayed.completed ) { FinalNowPlaying = liveLastPlayed; /*console.log( "not completed" );*/ }
				// ELSE , calculate the **Next** playing-obj
				else { FinalNowPlaying = await calculateNext( liveLastPlayed , liveConfig ); } 
			}

			// Populate Duration and Three-Percent Values
			if ( FinalNowPlaying.three_percent === 0 ) {
				FinalNowPlaying.duration = wGetDuration( FinalNowPlaying.fp );
				FinalNowPlaying.three_percent = Math.floor( ( FinalNowPlaying.duration - ( FinalNowPlaying.duration * 0.025 ) ) );
				//console.log( "Duration === " + FinalNowPlaying.duration.toString() );
				//console.log( "Three Percent === " + FinalNowPlaying.three_percent.toString() );
			}

			wcl( "\nFinal Now Computed NowPlaying === \n" );
			console.log( FinalNowPlaying );

			const x1 = JSON.stringify( FinalNowPlaying );
			const R_NP_ShowName_BackupKey = RC.LAST_SS.BASE + liveConfig[ 0 ] + "." + FinalNowPlaying.show_name;
			//const R_Live_Genre_NP = RC.LAST_SS.NOW_PLAYING[ liveConfig[ 0 ];
			await RU.setMulti( redis , [ [ "set" , RC.LAST_SS.NOW_PLAYING[ liveConfig[ 0 ] ] , x1 ] ,  [ "set" , R_NP_ShowName_BackupKey , x1 ] ]);


			G_NOW_PLAYING = FinalNowPlaying;
			G_R_NP_ShowName_Backup = R_NP_ShowName_BackupKey;


			wcl( "\nSTARTING --> MPLAYER" );	
			await MPLAYER_MAN.playFilePath( FinalNowPlaying.fp );
			if ( FinalNowPlaying.cur_time > 1 ) {
				await wSleep( 1000 );
				MPLAYER_MAN.seekSeconds( FinalNowPlaying.cur_time );
			}
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

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
async function wNext() { await wStop(); wPlay( true ); }
async function wPrevious() { await wStop(); wPlay( false , true ); }

module.exports.initialize = INITIALIZATION;

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
	await wSleep( 3000 );
	redis.quit();
});



module.exports.testUpdateScheduleFunction = function() {
	console.log( "\nwe are here in testUpdateScheduleFunction()\n" );
};