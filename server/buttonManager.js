var wEmitter = require('../main.js').wEmitter;
var wPressButtonMaster = require("./clientManager.js").pressButtonMaster;
var colors = require("colors");
var fs = require("fs");
var path = require("path");
var StringDecoder = require("string_decoder").StringDecoder;
var decoder = new StringDecoder('utf8');
var spawn = require("child_process").spawn;
require("shelljs/global");

function wcl( wSTR ) { console.log( colors.yellow.bgBlack( "[BUTTON_MAN] --> " + wSTR ) ); }


function getUSBDeviceEventPath() {

	var usbDeviceID = "usb-DragonRise_Inc._Generic_USB_Joystick-event-joystick";
	var findEventPath = 'ls -la /dev/input/by-id';
	var findEventPathCMD = exec( findEventPath , { silent:true , async: false });
	
	if ( findEventPathCMD.stderr.length > 1 ) { wcl( "ERROR --> " + findEventPathCMD.stderr  ); }

	findEventPathCMD = findEventPathCMD.stdout.split("\n");

	for (var i = 0; i < findEventPathCMD.length; ++i) {
		
		var wT = findEventPathCMD[i].split(" ");
		if ( wT[wT.length-3] === usbDeviceID ) {
			var wEvent = wT[wT.length-1].split("../");
			var wEventPath = 'eventPath = "/dev/input/' + wEvent[1] + '"';
			wcl( wEventPath );
			fs.writeFileSync( path.join( __dirname , "py_scripts" , "usbDevicePath.py" ) , wEventPath );
			return true;
		}
		
	}

	return false;

}

function cleanseButtonENV() {

	function isButtonScriptOpen() {

		var wPIDS = [];
		var wCMD1 = "ps aux | grep python";
		var findButton = exec( wCMD1 , { silent:true , async: false });
		if ( findButton.stderr.length > 1 || findButton.stdout.length < 1 ) { return -1; }

		var wOutput = findButton.stdout.split("\n");
		for ( var i = 0; i < wOutput.length; ++i ) {
			var wOut2 = wOutput[i].split(" ");
			var wOut3 = wOut2[ wOut2.length - 1 ].split("/"); 
			if ( wOut3[ wOut3.length - 1 ] === "buttonWatcher.py" ) {
				for ( var j = 0; j < 8; ++j ) {
					var wTest = wOut2[j].trim();
					if ( wTest === " " ) { continue; }
					wTest = parseInt( wTest );
					if ( isNaN(wTest) ) { continue; }
					if ( wTest < 300 ) { continue; }
					wcl( "wTest = " + wTest.toString() +  " PID: " + wOut2[ j ] + " = " + wOut3[ wOut3.length - 1 ] );
					wPIDS.push( wOut2[j] );
				}
				
			}
		}

		return wPIDS;

	}

	var openResult = isButtonScriptOpen();
	if ( openResult === -1 ) {
		wcl("failed to find script");
	}
	else {
		var wCMD2 = "sudo kill -9 ";
		for ( var i = 0; i < openResult.length; ++i ) {
			var wKillCMD = wCMD2 + openResult[i];
			exec( wKillCMD , { silent: true , async: false } );
			wcl( wKillCMD );
		}
	}

}


if ( !getUSBDeviceEventPath() ) { /*throw new Error( "[BUTTON_MAN] --> Cannot Find USB-Buttton Controller" );*/ return; }
cleanseButtonENV();

const buttonScript = path.join( __dirname , "py_scripts" , "buttonWatcher.py" );
var ButtonManager = spawn( "python" , [ buttonScript ] );
wcl( "@@PID=" + ButtonManager.pid );

var lastPressed = new Date().getTime();
var timeNow;
var handleButtonInput = function(wInput) {

	wInput = wInput.toString();
	console.log(wInput);

	timeNow = new Date().getTime();
	if ( ( timeNow - lastPressed ) < 3000 ) { wcl("pressed too soon"); return; }
	lastPressed = timeNow;

	var wE = "button" + wInput + "Press";
	//wEmitter.emit( wE );
	wInput = parseInt( wInput );
	wPressButtonMaster( wInput );
	
};

ButtonManager.stdout.on( "data" , function( data ) {
	var message = decoder.write( data );
	message = message.trim();
	handleButtonInput( message );
});


ButtonManager.stderr.on( "data" , function(data) {
	var message = decoder.write(data);
	message = message.trim();
	wcl( "[buttonWatcher.py] --> ERROR -->".green  );
	wcl( message );
	//wEmitter.emit( "properShutdown" );
	//setTimeout( ()=> { process.exit(1); } , 2000 );
});


module.exports.stop = function() {
	var wCMD = "sudo kill -9 " + ButtonManager.pid.toString();
	exec( wCMD , { silent: true , async: false } );
};

module.exports.pressButton = function( wNum ) {
	handleButtonInput( wNum );
};