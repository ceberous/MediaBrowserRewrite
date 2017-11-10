const wEmitter	= require("../main.js").wEmitter;
const redis = require("../main.js").redis;
const RU = require( "./utils/redis_Utils.js" );

//	Forked Approach , doesn't work 
// ( or can't figure out with children spawning grandchildren )
// ================================================================================
// ================================================================================
// const cp = require("child_process");
// var fState = null;
// var fStateEH = null;
// function forkState( wStatePath , wOptions ) {
// 	fState = cp.fork( wStatePath , [] , { env: { options: wOptions } } );
// 	instantiateForkedStateEventHandler();
// }
// function instantiateForkedStateEventHandler() {
// 	fState.on( "message" , ( m ) => {
// 		console.log( "PARENT got message:" , m );
// 	});
// 	fState.on( "close" , ( m ) => {
// 		console.log( "Forked State Was Closed !!!" , m );
// 	});
// 	fState.on( "exit" , ( m ) => {
// 		console.log( "Forked State Was EXITED !!!" , m );
// 		wEmitter.emit( "forkedStateOver" );
// 	});		
// }
// function stopForkedState() { fState.kill(); }
// ================================================================================
// ================================================================================

// const R_STATE_BASE = "LAST_SS.STATE.";
// const R_PREVIOUS_STATE = R_STATE_BASE + "PREVIOUS.";
// const R_ACTIVE_STATE = R_STATE_BASE + "ACTIVE.";
// const R_NEXT_STATE = R_STATE_BASE + "NEXT.";
// const R_FIREFOX_TASK = R_STATE_BASE + "FIREFOX_TASK.";

// var PREVIOUS_STATE = null;
// var ACTIVE_STATE = null;
// var NEXT_STATE = null;
// var FIREFOX_TASK = null;

( async ()=> {
	// Load Last State When Closed into Current-Previous State
	//PREVIOUS_STATE = await RU.getKey( redis , R_ACTIVE_STATE );
})();


async function YT_LIVE_BACKGROUND_START() {
	await require( "./STATES/YOUTUBE_LIVE_BACKGROUND.js" ).start();
}
// async function YT_LIVE_BACKGROUND_START() {
// 	var x1 = STATE_YTLB_MULTI;
// 	x1[0][2] = ACTIVE_STATE; 
// 	await require( "./STATES/YOUTUBE_LIVE_BACKGROUND.js" ).stop();
// }



// // 0 = start , 1 = stop , 2 = pause , 3 = resume , 4 = next , 5 = previous 
// const STATE_ACTION_MAP = {
// 	"YOUTUBE_LIVE_BACKGROUND": [ YT_LIVE_BACKGROUND_START ] ,
// };


// function S_AM_START( wStateName ) { STATE_ACTION_MAP[ wStateName ][ 0 ](); }
// function S_AM_STOP() { if ( STATE_ACTION_MAP[ ACTIVE_STATE ][ 1 ] ) { STATE_ACTION_MAP[ ACTIVE_STATE ][ 1 ](); } }
// function S_AM_PAUSE() { if ( STATE_ACTION_MAP[ ACTIVE_STATE ][ 2 ] ) { STATE_ACTION_MAP[ ACTIVE_STATE ][ 2 ](); } }
// function S_AM_RESUME() { if ( STATE_ACTION_MAP[ ACTIVE_STATE ][ 3 ] ) { STATE_ACTION_MAP[ ACTIVE_STATE ][ 3 ](); } }
// function S_AM_NEXT() { if ( STATE_ACTION_MAP[ ACTIVE_STATE ][ 4 ] ) { STATE_ACTION_MAP[ ACTIVE_STATE ][ 4 ](); } }
// function S_AM_PREVIOUS() { if ( STATE_ACTION_MAP[ ACTIVE_STATE ][ 5 ] ) { STATE_ACTION_MAP[ ACTIVE_STATE ][ 5 ](); } }

// module.exports.start = S_AM_START;
// module.exports.stop = S_AM_STOP;
// module.exports.pause = S_AM_PAUSE;
// module.exports.resume = S_AM_RESUME;
// module.exports.next = S_AM_NEXT;
// module.exports.previous = S_AM_PREVIOUS;

module.exports.youtubeLiveBackground = YT_LIVE_BACKGROUND_START;
// module.exports.forkState = forkState;
// module.exports.stopForkedState = stopForkedState;