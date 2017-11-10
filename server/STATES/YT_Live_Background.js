async function wStart() {
	
	console.log( "are we inside wStart() ???" );
	var live_vids = await require( "../youtubeManagerRewrite.js" ).updateLive();
	console.log( live_vids );
	//FF_OPEN( "http://localhst:6969/youtubeLiveBackground.html" );
	require( "../../main.js" ).setStagedFFClientTask( { message: "YTLiveBackground" , playlist: live_vids , nextVideoTime: 30000 } );
	await require( "../firefoxManager.js" ).openURL( "http://localhost:6969/youtubeLiveBackground" );
	console.log( "is it over  ???" );
}

function wPause() {

}

function wStop() { require( "../firefoxManager.js" ).terminateFF(); }


module.exports.start = wStart;
module.exports.pause = wPause;
module.exports.stop = wStop;