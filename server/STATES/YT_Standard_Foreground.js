const wEmitter = require( "../../main.js" ).wEmitter;
function wStart() {
	return new Promise( async function( resolve , reject ) {
		try {

			// Precedance Order Unless Otherwise Segregated into Sub-States
			// 1.) Check inside redis-Personal-Store for custom youtube.com/playlists

			// 2.) If none exist , build a mini playlist of Standard Followers Latest Videos this Month

			// Need to Build a Redis-To-Web-Browser 2-Way Binding Class 
			require( "../../main.js" ).setStagedFFClientTask( { message: "YTStandardForeground" , playlist: [ "xBVbkPxSV1c" , "B4BxNTnENGU" ]  } );
			await require( "../firefoxManager.js" ).openURL( "http://localhost:6969/youtubeStandard" );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function wPause() {

}

function wStop() {

}

function wNext() {
	return new Promise( function( resolve , reject ) {
		try {
			wEmitter.emit( "sendFFClientMessage" , "next" );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function wPrevious() {
	return new Promise( function( resolve , reject ) {
		try {
			wEmitter.emit( "sendFFClientMessage" , "previous" );
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