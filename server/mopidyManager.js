

const wEmitter	= require("../main.js").wEmitter;
// const wEmitter = new (require("events").EventEmitter);
// module.exports.wEmitter = wEmitter;

const redis = require( "../main.js" ).redis;
// const REDIS = require("redis");
// const redis = REDIS.createClient( "8443" , "localhost" );
// module.exports.redis = redis;
const RU = require( "./utils/redis_Utils.js" );


const colors = require("colors");
//const path = require("path");
const Mopidy = require("mopidy");



// function getRandomFromRange( wMin , wMax ) { return Math.floor( Math.random() * ( wMax - wMin + 1 ) ) + wMin; }
// Math.seed = function( s ) { return function() { s = Math.sin( s ) * 10000; return s - Math.floor( s ); }; };
// function resetRandom() {
// 	const wRanSeedStart = getRandomFromRange( 1 , 100 );
// 	const random1 = Math.seed( wRanSeedStart );
// 	const random2 = Math.seed( random1() );
// 	Math.random = Math.seed( random2() );
// }
// module.exports.resetRandom = resetRandom;
// function tryIgnoreError( wFunc ) { try { wFunc(); } catch( error ) { return; } }
// function sleep( ms ) { return new Promise( resolve => setTimeout( resolve , ms ) ); }
// function getRandomPropertyKey( wOBJ ) { var keys = Object.keys( wOBJ ); return keys[ keys.length * Math.random() << 0 ]; }
// function getRandomArrayItem( wArray ) { return wArray[ Math.floor( Math.random() * wArray.length ) ]; }

function wcl( wSTR ) { console.log( colors.white.bgBlue( "[MOPIDY_MAN] --> " + wSTR ) ); }
function tryIgnoreError( wFunc ) { try { wFunc(); } catch( error ) { return; } }
function sleep( ms ) { return new Promise( resolve => setTimeout( resolve , ms ) ); }

// const HOUR = 3600000;
// const DAY = 86400000;

var mopidy = null;
Mopidy.prototype._handleWebSocketError = function ( error ) { wcl( "Mopdiy WebSocket ERROR" ); this._cleanup(); this.close(); mopidy.off(); mopidy = null;  return; };
function tryToConnectMopidy( wPort ) {
	try {
		mopidy = new Mopidy({ 
			webSocketUrl: "ws://localhost:" + wPort.toString() + "/mopidy/ws/",
			autoConnect: true,
			callingConvention: "by-position-or-by-name"
		});
	} catch( error ) { wcl( "ERROR --> Mopdiy Binary not Running !" ); }
}
tryToConnectMopidy( 6690 );
module.exports.mopidy = mopidy;

mopidy.on( "state:online" , GLOBAL_INITIALIZE );

var LAST_EVENT_TIME = 0;
const EVENT_TIME_EASEMENT = 5000;
const R_LAST_SS_BASE = "LAST_SS.MOPIDY.";
const R_CONTINUOUS_PLAY = R_LAST_SS_BASE + "CONTINUOUS_PLAY";
mopidy.on( "event:trackPlaybackEnded" , async function ( wEvent ) {
	wcl( "PLAYBACK --> ENDED" );
	await sleep( 1000 );
	const time_now = new Date().getTime();
	const wDiff = ( time_now - LAST_EVENT_TIME );
	if ( wDiff < EVENT_TIME_EASEMENT ) {
		LAST_EVENT_TIME = time_now;
		await sleep( EVENT_TIME_EASEMENT );
	}
	else {
		var wCTIDX = await require( "./utils/mopidy/playbackManager.js" ).getCurrentTrackIndex();
		console.log( "PLAYBACK --> CURRENT_INDEX --> " + wCTIDX );
		if ( wCTIDX === null ) {
			var still_live = await RU.getKey( redis , R_CONTINUOUS_PLAY );
			if ( still_live !== null && still_live !== "STOPPED" ) {
				await require( "./utils/mopidy/restartContinousPlay.js" ).restart();
			}
		}
		LAST_EVENT_TIME = time_now;
	}
});

mopidy.on( "event:trackPlaybackStarted" , async function ( wEvent ) {
	// await sleep( 1000 );
	// var wCT = await MM.PLAYBACK.getCurrentTrack();
	// //wEmitter.emit( "update_Last_SS" , "Mopidy" , "nowPlaying" , wCT );
	// if ( wCT === null ) { return; }
	// await wUpdate_Last_SS( "Mopidy" , "nowPlaying" , wCT );
	// console.log("");
	// wcl( "PLAYBACK --> STARTED || CURRENT-TRACK --> " );
	// wcl( "Title = " + wCT[ "name" ] );
	// wcl( "Artist = " + wCT[ "artists" ][0].name );
});

mopidy.on( "event:playbackStateChanged" , async function ( wEvent ) {
	// await sleep( 3000 );
	// wcl( "PLAYBACK --> CHANGED --> " );
	// console.log( wEvent );
	// var wCTIDX = await MM.PLAYBACK.getCurrentTrackIndex();
	// console.log( "PLAYBACK --> CURRENT_INDEX --> " + wCTIDX );

	// if ( wCTIDX === null ) { MM.startNewTask( MM.activeTask , MM.selectedGenre , MM.activeListName ); }
});

function GLOBAL_SHUTDOWN() {
	return new Promise( async function( resolve , reject ) {
		try {
			if ( mopidy ) {
				try { await mopidy.playback.stop(); }
				catch(e) {}
				tryIgnoreError( mopidy.close );
				tryIgnoreError( mopidy.off );
			}
			mopidy = null;
			wcl( "CLOSED" );			
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

// var LIBRARY_MAN = null;
// var PLAYBACK_MAN = null;
// var TRACKLIST_MAN = null;
function GLOBAL_INITIALIZE() {
	return new Promise( async function( resolve , reject ) {
		try {
			wcl( "CONNECTED !!!" );
			// LIBRARY_MAN = require( "./utils/mopidy/libraryManager.js" );
			// PLAYBACK_MAN = require( "./utils/mopidy/playbackManager.js" );
			// TRACKLIST_MAN = require( "./utils/mopidy/tracklistManager.js" );
			// await LIBRARY_MAN.initialize();
			// await PLAYBACK_MAN.initialize();
			// await TRACKLIST_MAN.initialize();
			await require( "./utils/mopidy/libraryManager.js" ).initialize();
			await require( "./utils/mopidy/playbackManager.js" ).initialize();
			await require( "./utils/mopidy/tracklistManager.js" ).initialize();

			// resolve();

			// TESTING - START SOME RANDOM PLAYLIST
			// =====================================

				resolve();
			// ======================================
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}


process.on( "SIGINT" , async function () {
	wcl( "Shutting Down" );
	await GLOBAL_SHUTDOWN();
	await sleep( 1000 );
	process.exit(1);
});