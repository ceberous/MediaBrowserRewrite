const FF_OPEN = require( "../firefoxManager.js" ).openURL;
const FF_CLOSE = require( "../firefoxManager.js" ).terminateFF;


function wStart() {
	console.log( "are we inside wStart() ???" );
	FF_OPEN( "http://www.twitch.tv/chessbrah" );
	console.log( "is it over  ???" );
}

function wPause() {

}

function wStop() {

}

wStart();
module.exports.start = wStart;
module.exports.pause = wPause;
module.exports.stop = wStop;