const redis = require("../../main.js").redis;
const RU = require( "../utils/redis_Utils.js" );

const R_BASE = "LAST_SS.STATE.";
const R_STATE = R_BASE + "ACTIVE";
const R_PREVIOUS = R_BASE + "PREVIOUS";
const R_STATE_NAME = "YOUTUBE_LIVE_BACKGROUND";

async function wStart() {
	return new Promise( async function( resolve , reject ) {
		try {
			var current_state = await RU.getKey( redis , R_STATE );
			var live_vids = await require( "../youtubeManager.js" ).updateLive();
			//console.log( live_vids );
			require( "../../main.js" ).setStagedFFClientTask( { message: "YTLiveBackground" , playlist: live_vids , nextVideoTime: 30000 } );
			await require( "../firefoxManager.js" ).openURL( "http://localhost:6969/youtubeLiveBackground" );
			await RU.setMulti( redis , [ [ "set" , R_STATE , R_STATE_NAME ] , [ "set" , R_PREVIOUS , current_state ] ] );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function wPause() {
	
}

function wStop() { require( "../firefoxManager.js" ).terminateFF(); }


module.exports.start = wStart;
module.exports.pause = wPause;
module.exports.stop = wStop;