const redis = require("../../main.js").redis;
const RU = require( "../utils/redis_Utils.js" );

const R_BASE = "LAST_SS.STATE.";
const R_STATE = R_BASE + "ACTIVE";
const R_PREVIOUS = R_BASE + "PREVIOUS";
const R_STATE_NAME = "TWITCH_LIVE_FOREGROUND";
function wStart() {
	return new Promise( async function( resolve , reject ) {
		try {
			var current_live = await require( "../utils/twitchAPI_Utils.js" ).updateLiveUsers();
			console.log( "Current Live Twitch Users = " );
			console.log( current_live );
			if ( current_live.length > 0 ) {
				var current_state = await RU.getKey( redis , R_STATE );
				require( "../../main.js" ).setStagedFFClientTask( { message: "TwitchLiveForeground" , playlist: current_live } );
				await require( "../firefoxManager.js" ).openURL( "http://localhost:6969/twitchLive" );
				await RU.setMulti( redis , [ [ "set" , R_STATE , R_STATE_NAME ] , [ "set" , R_PREVIOUS , current_state ] ] );
			}

			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function wPause() {

}

function wStop() {
	return new Promise( async function( resolve , reject ) {
		try {
			await require( "../firefoxManager.js" ).exitTwitch(); 
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});	
}

module.exports.start = wStart;
module.exports.pause = wPause;
module.exports.stop = wStop;