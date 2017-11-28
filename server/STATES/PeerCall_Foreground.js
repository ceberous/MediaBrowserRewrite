const redis = require("../../main.js").redis;
const RU = require( "../utils/redis_Utils.js" );

const R_BASE = "LAST_SS.STATE.";
const R_STATE = R_BASE + "ACTIVE";
const R_PREVIOUS = R_BASE + "PREVIOUS";
const R_STATE_NAME = "PEER_CALL_FOREGROUND";

function wStart( wAlertEmails ) {
	return new Promise( async function( resolve , reject ) {
		try {

			var current_state = await RU.getKey( redis , R_STATE );
			require( "../../main.js" ).setStagedFFClientTask( { message: "PeerCall" } );
			await require( "../firefoxManager.js" ).openURL( "http://localhost:6969/peerCall" );
			await RU.setMulti( redis , [ [ "set" , R_STATE , R_STATE_NAME ] , [ "set" , R_PREVIOUS , current_state ] ] );

			// for ( var i = 0; i < wAlertEmails.length; ++i ) {
			// 	require( "../emailManager.js" ).sendEmail( wURL_LINK_TO_JOIN  , "HALEY IS CALLING YOU" , wAlertEmails[ i ] )
			// }
			
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
			await require( "../firefoxManager.js" ).terminateFFWithClient(); 
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

module.exports.start = wStart;
module.exports.pause = wPause;
module.exports.stop = wStop;