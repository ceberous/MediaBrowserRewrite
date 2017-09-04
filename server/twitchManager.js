var STREAM_LINK_MAN = require("./utils/streamlinkManager.js");

function wOpenLiveTwitch( wUserName , wQuality ) {
	wQuality = wQuality || "best";
	STREAM_LINK_MAN.openLink( wUserName , wQuality );
}
function wStopLiveTwitch() {
	STREAM_LINK_MAN.quit();
}

// setInterval( function () {
// 	console.log("still alive");
// } , 3000 );

module.exports.playLive = wOpenLiveTwitch;
module.exports.stopLive = wStopLiveTwitch;