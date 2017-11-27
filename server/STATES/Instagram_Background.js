


function wStart() {
	return new Promise( async function( resolve , reject ) {
		try {
			var latest_media = await require( "../instagramManager.js" ).getLatestFollowerMedia();
			console.log( latest_media );
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