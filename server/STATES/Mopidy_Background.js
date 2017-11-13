
const redis = require( "../../main.js" ).redis;
const RU = require( "../utils/redis_Utils.js" );

const R_KEY_BASE = "MOPIDY.CACHE."
function wStart( wButton_Genre_Type ) {
	return new Promise( async function( resolve , reject ) {
		try {
			wButton_Genre_Type = wButton_Genre_Type || "UNKNOWN";
			wButton_Genre_Type = wButton_Genre_Type + ".TRACKS";
			const R_K1 = R_KEY_BASE + wButton_Genre_Type;
			var random_list = await RU.popRandomSetMembers( redis , R_K1 , 25 );
			console.log( random_list );

			random_list = random_list.map( x => { JSON.parse( x ) } );
			console.log( random_list );
			
			//await require( "../utils/mopidy/trackListManager.js" ).loadList( random_list );
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