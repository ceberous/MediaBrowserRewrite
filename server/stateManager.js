
var wEmitter	= require("../main.js").wEmitter;

const cp = require("child_process");
var fState = null;
var fStateEH = null;
function forkState( wStatePath , wOptions ) {
	fState = cp.fork( wStatePath , [] , { env: { options: wOptions } } );
	instantiateForkedStateEventHandler();
}
function instantiateForkedStateEventHandler() {
	fState.on( "message" , ( m ) => {
		console.log( "PARENT got message:" , m );
	});
	fState.on( "close" , ( m ) => {
		console.log( "Forked State Was Closed !!!" , m );
	});
	fState.on( "exit" , ( m ) => {
		console.log( "Forked State Was EXITED !!!" , m );
		wEmitter.emit( "forkedStateOver" );
	});		
}
function stopForkedState() { fState.kill(); }



module.exports.start = forkState;
module.exports.stop = stopForkedState;