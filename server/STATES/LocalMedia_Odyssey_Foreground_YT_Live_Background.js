
var YOUTUBE_MAN = require( "../youtubeManager.js" );



function wStart( Last_SS_Odyseey_OBJ ) {

	// USB_CEC_MAN.activate();

	YOUTUBE_MAN.startYTLiveBackground();
	startCurrentAction(  );
	//if ( JOB_OVERRIDE_HALEY_IS_HOME ) { JOB_OVERRIDE_HALEY_IS_HOME = false; HALEY_HOME_OVERRIDED_ALREADY = true; }

	// STATE_ACTION_MAP[ LAST_SS.self.CURRENT_ACTION ].start( wArgArray[0] , wArgArray[1] , wArgArray[2] , wArgArray[3] ); 
	// "LocalMedia": { 
	// 	start: LOCAL_VIDEO_MAN.play , stop: LOCAL_VIDEO_MAN.stop , 
	// 	pause: LOCAL_VIDEO_MAN.pause , resume: LOCAL_VIDEO_MAN.resume , 
	// 	next: LOCAL_VIDEO_MAN.next , previous: LOCAL_VIDEO_MAN.previous 
	// },

	// LAST_SS.self[ "LocalMedia" ][ "LAST_PLAYED" ][ "Odyssey" ]
	LOCAL_VIDEO_MAN.play( [ { type: "Odyssey" , last_played: Last_SS_Odyseey_OBJ } ] );

}

function wPause() {

}

function wStop() {

}

module.exports.start = wStart;
module.exports.pause = wPauset;
module.exports.stop = wStop;