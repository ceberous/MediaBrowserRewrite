const redis = require( "../utils/redisManager.js" ).redis;
const RU = require( "../utils/redis_Utils.js" );
const RC = require( "../CONSTANTS/redis.js" ).YOU_TUBE;

const wEmitter = require( "../../main.js" ).wEmitter;

// const R_BASE = "LAST_SS.STATE.";
// const R_STATE = R_BASE + "ACTIVE";
// const R_PREVIOUS = R_BASE + "PREVIOUS";
// const R_STATE_NAME_GENERAL = "YOU_TUBE_CURRATED_THEN_ODYSSEY_FOREGROUND_YOU_TUBE_LIVE_BACKGROUND";
// const R_STATE_NAME_YOUTUBE = "YOUTUBE_STANDARD";

function wsleep( ms ) { return new Promise( resolve => setTimeout( resolve , ms ) ); }

function RESTART_IN_YOU_TUBE_LIVE_MODE(){
	return new Promise( async function( resolve , reject ) {
		try {
			console.log( "no more 'curated' videos" );
			require( "../clientManager.js" ).pressButtonMaster( 11 ); 
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function wStart( wOptions ) {
	return new Promise( async function( resolve , reject ) {
		try {
			const next_video = await RU.getRandomSetMembers( redis , RC.CURRATED.QUE , 1 );
			if ( !next_video ) {
				await RESTART_IN_YOU_TUBE_LIVE_MODE();
				resolve();
				return;
			}
			var limit = await RU.getKey( redis , RC.ODYSSEY_PRELIM_TOTAL );
			limit = parseInt( limit );
			await RU.setMulti( redis , [ 
				[ "set" , RC.NOW_PLAYING_ID , next_video[ 0 ] ] ,
				[ "rpush" , RC.NP_SESSION_LIST , next_video[ 0 ] ] ,
				[ "set" , RC.NP_SESSION_INDEX , 0 ] ,
				[ "set" , RC.MODE , "CURRATED" ] ,
				[ "set" , RC.PRELIM_COUNT , limit ] ,
			]);

			const wMode = wOptions.mode || "CURRATED";
			const wPosition = wOptions.position || "FOREGROUND";
			await require( "../utils/generic.js" ).setStagedFFClientTask( { message: "Youtube" , playlist: [ next_video ] , mode: wMode , position: wPosition } );
			await require( "../firefoxManager.js" ).openURL( "http://localhost:6969/youtube" );			
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function wNext() {
	return new Promise( async function( resolve , reject ) {
		try {
			// 1.) Assume Last Video Was "completed" 
			const completed_id = await RU.getKey( redis , RC.NOW_PLAYING_ID );
			if ( completed_id ) { await RU.setRemove( redis , RC.CURRATED.QUE , completed_id ); }
			
			// 2.) Determine Place In Session
			await RU.incrementInteger( redis , RC.NP_SESSION_INDEX );
			var current_index = await RU.getKey( redis , RC.NP_SESSION_INDEX );
			var session_length = await RU.getListLength( redis , RC.NP_SESSION_LIST );
			console.log( "\nINDEX === " + current_index.toString() );
			console.log( "LENGTH === " + session_length.toString() );
			
			// 4.) Get Next Video
			var next_video = null;
			// if we are still at the head of the list and havn't navigated via previous button
			if ( parseInt( current_index ) > ( parseInt( session_length ) - 1 ) ) {
				next_video = await RU.getRandomSetMembers( redis , RC.CURRATED.QUE , 1 );
				if ( !next_video ) {
					await RESTART_IN_YOU_TUBE_LIVE_MODE();
					resolve();
					return;
				}
				
				// Respect Watch Limit of Videos , Else , Go to Youtube Live Mode
				await RU.decrementInteger( redis , RC.PRELIM_COUNT );
				var watched_count = await RU.getKey( redis , RC.PRELIM_COUNT );
				watched_count = parseInt( watched_count );
				if ( watched_count < 1 ) { RESTART_IN_YOU_TUBE_LIVE_MODE(); resolve(); return; }				
				
				next_video = next_video[ 0 ];
				await RU.listRPUSH( redis , RC.NP_SESSION_LIST , next_video );
			}
			else {
				console.log( "Somebody used the previous button" );
				next_video = await RU.getFromListByIndex( redis , RC.NP_SESSION_LIST , current_index );
			}
			console.log( next_video );
			console.log( "Next Video === " + next_video );
			wEmitter.emit( "sendFFClientMessage" , "next" , next_video );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function wPrevious() {
	return new Promise( async function( resolve , reject ) {
		try {
			var previous_index = await RU.decrementInteger( redis , RC.NP_SESSION_INDEX );
			previous_index = parseInt( previous_index );
			console.log( "previous_index === " + previous_index.toString() );
			if ( previous_index < 0 ) {
				var list_lenth = await RU.getListLength( redis , RC.NP_SESSION_LIST );
				console.log( "list_lenth === " + list_lenth.toString() );
				previous_index = parseInt( list_lenth ) - 1;
				await RU.setKey( redis , RC.NP_SESSION_INDEX , previous_index );
				console.log( "List Index Now Set to --> " + previous_index.toString() );
			}
			
			var now_playing = await RU.getFromListByIndex( redis , RC.NP_SESSION_LIST , previous_index );
			if ( now_playing ) {
				await RU.setKey( redis , RC.NOW_PLAYING_ID , now_playing );
				wEmitter.emit( "sendFFClientMessage" , "next" , now_playing );
			}
			else {
				RESTART_IN_YOU_TUBE_LIVE_MODE();
			}
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function wStop() {
	return new Promise( async function( resolve , reject ) {
		try {
			await require( "../firefoxManager.js" ).terminateFFWithClient();	
			await RU.delKey( redis , RC.NP_SESSION_LIST );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function wPause() {
	return new Promise( async function( resolve , reject ) {
		try {
			wEmitter.emit( "sendFFClientMessage" , "pause" );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

module.exports.start = wStart;
module.exports.stop = wStop;
module.exports.pause = wPause;
module.exports.resume = wPause;
module.exports.next = wNext;
module.exports.previous = wPrevious;