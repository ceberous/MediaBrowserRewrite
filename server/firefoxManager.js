var wEmitter = require('../main.js').wEmitter;
//var wEmitter = new (require('events').EventEmitter);

require('shelljs/global');
var path = require("path");
var colors = require("colors");

const launchFFPath = path.join( __dirname , "./utils/ffLauncher.js"  );
const xdoWrapper = require( "./utils/xdotoolWrapper.js" );

function wcl( wSTR ) { console.log( colors.black.bgRed( "[FIREFOX_MAN] --> " + wSTR ) ); }

// about:config
// browser.sessionstore.resume_from_crash = false
var ffWrapper = {
	
	binaryOpen: false,
	clientActive: false,
	stagedLink: null,
	windowID: null,

	bootInit: function() {

	},

	init: function() {

		wcl( "initializing ffWrapper" );
		ffWrapper.isFFOpen();

	},

	isFFOpen: function() {

		const ffBinaryLocation1 = '/usr/lib/firefox/firefox';
		const ffBinaryLocation2 = '/bin/sh -c firefox';
		const checkFFOpen = 'ps aux | grep firefox';

		var isFFOpen = exec( checkFFOpen , { silent:true , async: false } );
		if ( isFFOpen.stderr.length > 1 ) { wcl( "ERROR --> Could not Locate FF Binary" ); return null; }
		
		isFFOpen = isFFOpen.stdout.split("\n");

		for ( var i = 0; i < isFFOpen.length; ++i ) {
			var wT = isFFOpen[i].split(" ");
			if ( wT[wT.length-1] === ffBinaryLocation1 ) {
				ffWrapper.instancePID = wT[1].toString();
				//wcl( "is OPEN" );
				ffWrapper.binaryOpen = true;
				return true;
			}
			else if ( ( wT[wT.length-3] + " " + wT[wT.length-2] + " " + wT[wT.length-1] ) === ffBinaryLocation2 ){
				ffWrapper.instancePID = wT[1].toString();
				//wcl( "is OPEN" );
				ffWrapper.binaryOpen = true;
				return true;
			}
		}
		//wcl( "is CLOSED" );
		ffWrapper.binaryOpen = false;
		return false;

	},

	launchFF: async function( wEnsureOpen ) {

		if ( !wEnsureOpen ) {
			var wEX1 = exec( "node " + launchFFPath , {silent:true , async: false });
			if ( wEX1.stderr.length > 1 ) { wcl( "ERROR --> Could not Launch FF Binary" ); return null; }
			wcl( "Launched Firefox" );
		}
		
		if ( ffWrapper.binaryOpen != true ) {
			setTimeout( function() {
				ffWrapper.isFFOpen();
			} , 1000 );
			setTimeout( function() {
				ffWrapper.launchFF( true );
			} , 2000 );
		}
		else {
			if ( ffWrapper.stagedLink != null ) { 
				await xdoWrapper.ensureWindowNameIsReady( "Mozilla Firefox" );
				ffWrapper.windowID = xdoWrapper.getWindowIDFromName( "Mozilla Firefox" );
				ffWrapper.openNewTab( ffWrapper.stagedLink );
				setTimeout( function() { 
					xdoWrapper.setFullScreen( ffWrapper.windowID , "1" );
				} , 1000 );
			}
		}
		
	},

	terminateFF: function() {
		if ( !ffWrapper.binaryOpen ) { return; }
		var wEX2 = exec( "sudo pkill -9 firefox" , { silent: true ,  async: false } );
		if ( wEX2.stderr.length > 1 ) { wcl( "ERROR --> Could not Terminate FF Binary" ); return null; }
		wcl( "Killed Firefox" );
	},	

	openNewTab: function( w_URL ) {
		var openNewTab = 'firefox -new-tab ' + w_URL;
		var wResult = exec( openNewTab , { silent: true , async: false } );
		ffWrapper.stagedLink = null;
		if ( wResult.stderr != null && wResult.stderr.length > 1 ) { wcl( wResult.stderr ); return null; }
	},

	youtubeFullScreen: function() {

		xdoWrapper.windowRaise( ffWrapper.windowID );
		xdoWrapper.restoreFullScreen( ffWrapper.windowID );
		xdoWrapper.moveMouseToCenterOfWindow( ffWrapper.windowID );
		setTimeout( function() { xdoWrapper.mouseLeftClick(); } , 500 );
		setTimeout( function() { xdoWrapper.pressKeyboardKey( "f" ); } , 1000 );

	},

	twitchFullScreen: function() {
		xdoWrapper.windowRaise( ffWrapper.windowID );
		xdoWrapper.restoreFullScreen( ffWrapper.windowID );
		xdoWrapper.moveMouseToCenterOfWindow( ffWrapper.windowID );
		setTimeout( function() { xdoWrapper.mouseDoubleClick(); } , 1000 );
		//setTimeout( function() { xdoWrapper.mouseLeftClick( ffWrapper.windowID ); } , 500 );
	},

};

ffWrapper.isFFOpen();


wEmitter.on( "ffGlitchFullScreenYoutube" , function() { ffWrapper.youtubeFullScreen(); });
wEmitter.on( "ffGlitchFullScreenTwitch" , function() { ffWrapper.twitchFullScreen(); });


module.exports.terminateFF = function() {
	ffWrapper.terminateFF();
};

module.exports.openURL = function( wURL ) {

	if ( ffWrapper.binaryOpen ) { ffWrapper.terminateFF(); }
	ffWrapper.stagedLink = wURL;
	setTimeout( function() { ffWrapper.launchFF( false ); } , 3000 );

};

module.exports.openLocalHost = function() {

	if ( ffWrapper.binaryOpen ) { ffWrapper.terminateFF(); }
	ffWrapper.stagedLink = "http://localhost:6969";
	setTimeout( function() { ffWrapper.launchFF( false ); } , 3000 );

};