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

function wStart() {
	return new Promise( async function( resolve , reject ) {
		try {
			var next_video = await RU.getRandomSetMembers( redis , RC.CURRATED.LIST , 1 );
			if ( !next_video ) {
				await RESTART_IN_YOU_TUBE_LIVE_MODE();
				resolve();
				return;
			}
			await require( "../utils/generic.js" ).setStagedFFClientTask( { message: "YTStandardForeground" , playlist: [ next_video ]  } );
			await require( "../firefoxManager.js" ).openURL( "http://localhost:6969/youtubeStandard" );
			await RU.setMulti( redis , [ 
				[ "set" , RC.NOW_PLAYING_ID , next_video[ 0 ] ] ,
				[ "rpush" , RC.NP_SESSION_LIST , next_video[ 0 ] ] ,
				[ "set" , RC.NP_SESSION_INDEX , 0 ] ,
				[ "set" , RC.MODE , "CURRATED" ] ,
			]);
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function wNext() {
	return new Promise( async function( resolve , reject ) {
		try {
			const current_index = await RU.getKey( redis , RC.NP_SESSION_INDEX );
			const session_length = await RU.getListLength( redis , RC.NP_SESSION_LIST );
			console.log( "INDEX === " + current_index.toString() );
			console.log( "LENGTH === " + session_length.toString() );
			var next_video = null;
			if ( parseInt( current_index ) < ( parseInt( session_length ) - 1 ) ) {
				next_video = await RU.getFromListByIndex( redis , RC.NP_SESSION_LIST , ( current_index + 1 ) );
				await RU.incrementInteger( redis , RC.NP_SESSION_INDEX );
				await RU.setMulti( redis , [ 
					[ "set" , RC.NOW_PLAYING_ID , next_video ] ,
					[ "incr" , RC.NP_SESSION_INDEX ] ,
				]);
			}
			else {
				const completed_id = await RU.getKey( redis , RC.NOW_PLAYING_ID );
				if ( completed_id ) { await RU.setRemove( redis , RC.CURRATED.LIST , completed_id ); }

				next_video = await RU.getRandomSetMembers( redis , RC.CURRATED.LIST , 1 );
				if ( !next_video ) {
					await RESTART_IN_YOU_TUBE_LIVE_MODE();
					resolve();
					return;
				}
				next_video = next_video[ 0 ];
				console.log( "Next Video === " + next_video );
				await RU.setMulti( redis , [ 
					[ "set" , RC.NOW_PLAYING_ID , next_video ] ,
					[ "rpush" , RC.NP_SESSION_LIST , next_video ] ,
					[ "incr" , RC.NP_SESSION_INDEX ] ,
				]);		
			}
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
				previous_index = await RU.getListLength( redis , RC.NP_SESSION_LIST );
				previous_index = parseInt( previous_index ) - 1;
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