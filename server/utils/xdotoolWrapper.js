require('shelljs/global');
//const wExecSync = require( "child_process" ).execSync;
var colors = require("colors");

function wcl( wSTR ) { console.log( colors.blue.bgRed( "[XDO_TOOL_MAN] --> " + wSTR ) ); }
function sleep( ms ) { return new Promise( resolve => setTimeout( resolve , ms ) ); }

function wGetWindowIDFromName( wName ) {
	var findName = 'xdotool search --name "' + wName + '"';
	var wWindowID = exec( findName , { silent: true , async: false } );
	if ( wWindowID.stderr.length > 1 ) { wcl( "ERROR --> Could not Wrap FF Window" ); return null; }
	var wF = wWindowID.stdout.trim();
	wcl( "WindowID = " + wF );
	return wF;
}

function  wEnsureWindowNameIsReady( wName ) {
	return new Promise( async function( resolve , reject ) {
		try{
			var xFoundID = null;
			var xFound = false;
			while( !xFound ) {
				//wExecSync("sleep 1");
				await sleep( 1000 );
				xFoundID = wGetWindowIDFromName( wName );
				if ( xFoundID.length > 1 ) { xFound = true; }
			}
			wcl( "X-Window READY !!! " + xFoundID );
			resolve(xFoundID);
		}
		catch( error ){ wcl( error ); reject(); }
	});
}

function wActivateWindowID( wID ) {
	var activateID = 'xdotool windowactivate ' + wID;
	var wActivate = exec( activateID , { silent: true ,  async: false });
	if ( wActivate.stderr.length > 1 ) { wcl( "ERROR --> Could not Activate Window ID" ); return null; }
	else { return true; }
}

function wSetWindowIDFocus( wID ) {
	var focusID = 'xdotool windowactivate ' + wID;
	var wFocus = exec( focusID , { silent: true ,  async: false });
	if ( wFocus.stderr.length > 1 ) { wcl( "ERROR --> Could not Focus Window ID" ); return null; }
	wcl( "window activated" );
	return true;
}

function wWindowMove( wID , wScreenNum ) {
	var windowMove = 'xdotool getactivewindow windowmove %' + wScreenNum  + ' 0 0';
	var wExec1 = exec( windowMove , { silent: true ,  async: false } );
	if ( wExec1.stderr.length > 1 ) { wcl( "ERROR --> Could not Move Window ID" ); wcl( wExec1.stderr );return null; }
	else { return true; }
}

function wSetWindowIDFullScreen( wID , wScreenNum ) {
	var setToFullScreen = 'xdotool windowsize ';
	if ( wScreenNum ) { setToFullScreen = setToFullScreen + ' ' + wID + ' 100% 100%'; }
	else { setToFullScreen = setToFullScreen + wID + ' 100% 100%';  }

	var wSetFull = exec( setToFullScreen , { silent: true , async: false });
	if ( wSetFull.stderr.length > 1 ) { wcl( "ERROR --> Could not set Window ID to Full Screen" ); wcl( wSetFull.stderr ); return null; }
	else { return true; }
}

function wWindowRaise( wID ) {
	var windowRaiseTopCMD = "xdotool windowraise " + wID;
	exec( windowRaiseTopCMD , { silent: true ,  async: false } );
}

function wResetFocus( wID ) {
	wActivateWindowID( wID );
	wSetWindowIDFocus( wID );
}

function wRestoreFullScreen( wID ) {
	wResetFocus( wID );
	wSetWindowIDFullScreen( wID );
}

function wMoveMouseToCenterOfWindow() {
	var centerOfWindow2Screen = "xdotool mousemove --window %0 2537 510";
	//var centerOfWindow13Inch = "xdotool mousemove --window %0 687 282";
	
	//var centerOfWindow2ndMonitor = "xdotool mousemove 687 282";
	exec( centerOfWindow2Screen , { silent: true , async: false } );
}

function wMouseLeftClick() {
	var click = "xdotool click 1";
	exec( click , { silent: true , async: false } );
}

function wMouseDoubleClick() {
	var click = "xdotool click --repeat 2 --delay 200 1";
	exec( click , { silent: true , async: false } );
	wcl( "mouse double clicked" );
}

function wPressKeyboardKey( wKey ) {
	var fKeyPress = 'xdotool key ' + wKey.toString();
	exec( fKeyPress , { silent: true , async: false } );
	wcl( "f key pressed" );
}

module.exports.getWindowIDFromName 			= wGetWindowIDFromName;
module.exports.ensureWindowNameIsReady 		= wEnsureWindowNameIsReady;
module.exports.activateWindowID 			= wActivateWindowID;
module.exports.setWindowIDFocus 			= wSetWindowIDFocus;
module.exports.windowMove 					= wWindowMove;
module.exports.setWindowIDFullScreen 		= wSetWindowIDFullScreen;
module.exports.windowRaise 					= wWindowRaise;
module.exports.resetFocus 					= wResetFocus;
module.exports.restoreFullScreen 			= wRestoreFullScreen;
module.exports.moveMouseToCenterOfWindow 	= wMoveMouseToCenterOfWindow;
module.exports.mouseLeftClick 				= wMouseLeftClick;
module.exports.mouseDoubleClick 			= wMouseDoubleClick;
module.exports.pressKeyboardKey 			= wPressKeyboardKey;

module.exports.setFullScreen = function( wID , wScreenNum ) {
	
	wActivateWindowID( wID );

	setTimeout( function(){
		wSetWindowIDFocus( wID );
	} , 500 );
	setTimeout( function() {
		//wWindowMove( wID , wScreenNum );
	} , 2000 );
	setTimeout( function() {
		wSetWindowIDFullScreen( wID );
	} , 3000 );

};

module.exports.setFullScreenWithFKey = function( wID , wScreenNum ) {
	wWindowRaise( wID );
	setTimeout( function(){
		wActivateWindowID( wID , wScreenNum );
	} , 1000 );
	setTimeout( function() {
		wSetWindowIDFocus( wID );
	} , 2000 );
	setTimeout( function() {
		wPressKeyboardKey( "f" );
	} , 3000 );
};

