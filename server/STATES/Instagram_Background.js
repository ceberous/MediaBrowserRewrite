const redis = require("../../main.js").redis;
const RU = require( "../utils/redis_Utils.js" );
const RC = require( "../../config.js" ).REDIS.CONSTANTS.INSTAGRAM;


function wStart() {
	return new Promise( async function( resolve , reject ) {
		try {
			var latest_media = await require( "../instagramManager.js" ).updateLatestFollowerMedia();
			console.log( latest_media );
			await require( "../../main.js" ).setStagedFFClientTask( { message: "Instagram" , playlist: latest_media , nextMediaTime: 5000 } );
			await require( "../firefoxManager.js" ).openURL( "http://localhost:6969/instagram" );
			//await RU.setMulti( redis , [ [ "set" , "LAST_SS.STATE.ACTIVE" , "INSTAGRAM_BACKGROUND" ] , [ "set" , R_PREVIOUS , current_state ] ] );			
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function wPause() {

}

function wStop() {

}

module.exports.start = wStart;
module.exports.pause = wPause;
module.exports.stop = wStop;