const wEmitter = require("../main.js").wEmitter;
//var wEmitter = new (require('events').EventEmitter);

require( "shelljs/global" );
const path = require("path");
const colors = require("colors");

const launchFFPath = path.join( __dirname , "./utils/ffLauncher.js" );
const xdoWrapper = require( "./utils/xdotoolWrapper.js" );

function wcl( wSTR ) { console.log( colors.black.bgRed( "[FIREFOX_MAN] --> " + wSTR ) ); }
function wsleep( ms ) { return new Promise( resolve => setTimeout( resolve , ms ) ); }

// about:config
// browser.sessionstore.resume_from_crash = false
const ffWrapper = {
	
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

	launchFF_Rewrite: function() {
		var wEX1 = exec( "node " + launchFFPath , { silent:true , async: false });
		if ( wEX1.stderr.length > 1 ) { wcl( "ERROR --> Could not Launch FF Binary" ); return null; }
		wcl( "Launched Firefox" );
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
	terminateFFAbsolute: function() {
		exec( "sudo pkill -9 firefox" , { silent: true ,  async: false } );
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
		return new Promise( async function( resolve , reject ) {
			try {
				xdoWrapper.windowRaise( ffWrapper.windowID );
				xdoWrapper.restoreFullScreen( ffWrapper.windowID );
				xdoWrapper.moveMouseToCenterOfWindow( ffWrapper.windowID );
				await wsleep( 500 );
				xdoWrapper.mouseLeftClick();
				await wsleep( 1000 );
				xdoWrapper.pressKeyboardKey( "f" );
				resolve();
			}
			catch( error ) { console.log( error ); reject( error ); }
		});
	},

	twitchFullScreen: function() {
		return new Promise( async function( resolve , reject ) {
			try {
				xdoWrapper.windowRaise( ffWrapper.windowID );
				xdoWrapper.restoreFullScreen( ffWrapper.windowID );
				xdoWrapper.moveMouseToCenterOfWindow( ffWrapper.windowID );
				await wsleep( 1000 );
				xdoWrapper.mouseDoubleClick();
				resolve();
			}
			catch( error ) { console.log( error ); reject( error ); }
		});
	},

};


wEmitter.on( "youtubeReadyForFullScreenGlitch" , function() { ffWrapper.youtubeFullScreen(); });
wEmitter.on( "ffGlitchFullScreenTwitch" , function() { ffWrapper.twitchFullScreen(); });

module.exports.youtubeFullScreen = ffWrapper.youtubeFullScreen;
module.exports.twitchFullScreen = ffWrapper.twitchFullScreen;

module.exports.terminateFF = function() {
	ffWrapper.terminateFF();
};

module.exports.terminateFFWithClient = function() {
	return new Promise( async function( resolve , reject ) {
		try {
			wEmitter.emit( "sendFFClientMessage" , "shutdown" );
			await wsleep( 2000 );
			ffWrapper.terminateFFAbsolute();
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
};


module.exports.openURL = function( wURL ) {
	return new Promise( async function( resolve , reject ) {
		try {
			
			if ( ffWrapper.isFFOpen() ) { ffWrapper.terminateFF(); await wsleep( 3000 ); }
			
			ffWrapper.launchFF_Rewrite();

			ffWrapper.windowID = await xdoWrapper.ensureWindowNameIsReady( "Mozilla Firefox" );			
			xdoWrapper.setFullScreen( ffWrapper.windowID , "1" );

			await wsleep( 500 );
			ffWrapper.openNewTab( wURL );
			
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
};

module.exports.openLocalHost = function() {

	if ( ffWrapper.binaryOpen ) { ffWrapper.terminateFF(); }
	ffWrapper.stagedLink = "http://localhost:6969";
	setTimeout( function() { ffWrapper.launchFF( false ); } , 3000 );

};