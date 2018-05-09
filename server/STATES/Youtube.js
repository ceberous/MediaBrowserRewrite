const wEmitter = require( "../../main.js" ).wEmitter;

const redis = require( "../utils/redisManager.js" ).redis;
const RU = require( "../utils/redis_Utils.js" );
const RC = require( "../CONSTANTS/redis.js" ).YOU_TUBE;

const MODE_MAP = {
	LIVE: "../YOUTUBE/live.js" ,
	STANDARD: "../YOUTUBE/standard.js" ,
	CURRATED: "../YOUTUBE/currated.js" ,
	RELAX: "../YOUTUBE/relax.js"
};


function wStart( wOptions ) {
	return new Promise( async function( resolve , reject ) {
		try {
			// 1.) Store Mode
			const wMode = wOptions.mode || "LIVE";

			var final_playlist = [];
			if ( current_mode === "LIVE" ) {
				final_playlist = await require( "../YOUTUBE/live.js" ).getLiveVideos();
			}
			else if ( current_mode === "CURRATED" ) {
				var item = await RU.getRandomSetMembers( redis , RC.CURRATED.QUE , 1 );
				if ( !item ) { current_mode = "STANDARD"; }
				else { final_playlist.push( item[ 0 ] ); }
			}
			if ( current_mode === "STANDARD" ) {
				var item = await RU.listRPOP( redis , RC.STANDARD.QUE , 1 );
				final_playlist.push( item );
			}
			else if ( current_mode === "RELAX" ) {

			}

			await RU.setMulti( redis , [ 
				[ "set" , RC.NOW_PLAYING_ID , final_playlist[ 0 ] ] ,
				[ "rpush" , RC.NP_SESSION_LIST , final_playlist[ 0 ] ] ,
				[ "set" , RC.NP_SESSION_INDEX , 0 ] ,
				[ "set" , RC.MODE , wMode ] ,
			]);
			
			const wPosition = wOptions.position || "FOREGROUND";
			await require( "../utils/generic.js" ).setStagedFFClientTask( { message: "Youtube" , playlist: final_playlist , mode: wMode , position: wPosition } );
			await require( "../firefoxManager.js" ).openURL( "http://localhost:6969/youtube" );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function wPause() {
	return new Promise( function( resolve , reject ) {
		try {
			wEmitter.emit( "sendFFClientMessage" , "pause" );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function wStop() {
	return new Promise( async function( resolve , reject ) {
		try {
			await require( "../firefoxManager.js" ).terminateFFWithClient();
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function wNext() {
	return new Promise( async function( resolve , reject ) {
		try {

			const current_mode = await RU.getKey( redis , RC.MODE );
			console.log( "CURRENT YOUTUBE MODE === " + current_mode );
			if( current_mode === "LIVE" ) {
				wEmitter.emit( "sendFFClientMessage" , "next" );
				resolve();
				return;
			}

			const completed_id = await RU.getKey( redis , RC.NOW_PLAYING_ID );
			await RU.setAdd( redis , RC.WATCHED , completed_id );
			
			// 2.) Determine Place In Session
			await RU.incrementInteger( redis , RC.NP_SESSION_INDEX );
			var current_index = await RU.getKey( redis , RC.NP_SESSION_INDEX );
			var session_length = await RU.getListLength( redis , RC.NP_SESSION_LIST );
			console.log( "\nINDEX === " + current_index.toString() );
			console.log( "LENGTH === " + session_length.toString() );
			
			// 4.) Get Next Video
			var next_video = null;
			// if we are still at the head of the list and havn't navigated via previous button
			if ( parseInt( current_index ) < ( parseInt( session_length ) - 1 ) ) {
				console.log( "Somebody used the previous button" );
				next_video = await RU.getFromListByIndex( redis , RC.NP_SESSION_LIST , current_index );
			}
			else {
				if ( current_mode === "CURRATED" ) {
					await RU.setRemove( redis , RC.CURRATED.LIST , completed_id );
					next_video = await require( "../YOUTUBE/currated.js" ).getNextInQue();
				}
				else if ( current_mode === "RELAX" ) {
					await RU.setRemove( redis , RC.RELAX.QUE , completed_id );

				}
				else if ( current_mode === "STANDARD" ) {
					next_video = await require( "../YOUTUBE/standard.js" ).getNextVideo();
				}

				console.log( next_video );
				console.log( "Next Video === " + next_video );
				await RU.listRPUSH( redis , RC.NP_SESSION_LIST , next_video );
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
			const current_mode = await RU.getKey( redis , RC.MODE );
			if( current_mode === "LIVE" ) {
				wEmitter.emit( "sendFFClientMessage" , "previous" );
				resolve();
				return;
			}
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
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

module.exports.start = wStart;
module.exports.pause = wPause;
module.exports.stop = wStop;
module.exports.next = wNext;
module.exports.previous = wPrevious;