
var MOPIDY_BASE = null;
var YOUTUBE_MAN = null;

function wStart( wOptions ) {
	return new Promise( async function( resolve , reject ) {
		try {
			wGenre = wOptions.genre || "UNKNOWN";
			MOPIDY_BASE = require( "./Mopidy_Background_Genre.js" );
			await MOPIDY_BASE.start( wGenre );
			YOUTUBE_MAN = require( "./YT_Live_Background.js" );
			await YOUTUBE_MAN.start();
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function wPause() {
	return new Promise( async function( resolve , reject ) {
		try {
			await MOPIDY_BASE.pause();
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function wNext() {
	return new Promise( async function( resolve , reject ) {
		try {
			await MOPIDY_BASE.next();
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function wPrevious() {
	return new Promise( async function( resolve , reject ) {
		try {
			await MOPIDY_BASE.previous();
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function wStop() {
	return new Promise( async function( resolve , reject ) {
		try {
			await MOPIDY_BASE.stop()
			MOPIDY_BASE = null;
			await YOUTUBE_MAN.stop()
			YOUTUBE_MAN = null;
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