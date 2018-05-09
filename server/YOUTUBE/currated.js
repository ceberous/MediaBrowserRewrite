const colors = require( "colors" );

const redis = require( "../utils/redisManager.js" ).redis;
const RU = require( "../utils/redis_Utils.js" );
const RC = require( "../CONSTANTS/redis.js" ).YOU_TUBE.CURRATED;

function wcl( wSTR ) { console.log( colors.white.bgRed( "[YOUTUBE_CURRATED] --> " + wSTR ) ); }

function GET_LIST() {
	return new Promise( async function( resolve , reject ) {
		try {
			const list = await RU.getFullSet( redis , RC.QUE );
			resolve( list );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.getList = GET_LIST;

function ADD_TO_LIST( wVideoID ) {
	return new Promise( async function( resolve , reject ) {
		try {
			await RU.setAdd( redis , RC.QUE , wVideoID );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.addToList = ADD_TO_LIST;

function REMOVE_FROM_LIST( wVideoID ) {
	return new Promise( async function( resolve , reject ) {
		try {
			await RU.setRemove( redis , RC.QUE , wVideoID );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.removeFromList = REMOVE_FROM_LIST;


function IMPORT_FROM_PLAYLIST_ID( wPlaylistID ) {
	return new Promise( async function( resolve , reject ) {
		try {
			const videos = await require( "./youtubeAPI_Utils.js" ).getPlaylist( wPlaylistID );
			const ids = videos.map( x => x[ "videoId" ] );
			const filtered_ids = await require( "./generic.js" ).filterCommon( ids );
			console.log( "Filtered IDS === " );
			console.log( filtered_ids );
			await RU.setSetFromArray( redis , RC.QUE , filtered_ids );
			resolve( filtered_ids );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.importFromPlaylistID = IMPORT_FROM_PLAYLIST_ID;


function GET_NEXT_IN_QUE( wPlaylistID ) {
	return new Promise( async function( resolve , reject ) {
		try {
			var next_video = await RU.getRandomSetMembers( redis , RC.CURRATED.QUE , 1 );
			if ( !next_video ) { next_video = "empty" }
			else { next_video = next_video[ 0 ]; }		
			resolve( next_video );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.getNextInQue = GET_NEXT_IN_QUE;