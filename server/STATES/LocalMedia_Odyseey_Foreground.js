const process = require("process");
const LMM_PLAY = require( "../localMediaManagerRewrite.js" ).play;

function wStart() {
	console.log( "inside start from odyseey test state" );
	console.log( "wOptions = " );
	console.log( process.env.options );
	LMM_PLAY(  )

}

function wPause() {

}

function wStop() {

}

wStart();

module.exports.start = wStart;
module.exports.pause = wPauset;
module.exports.stop = wStop;