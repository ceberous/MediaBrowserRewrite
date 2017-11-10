const fs		= require( "fs" );
const path		= require( "path" );
const colors	= require( "colors" );

const BTN_MAN 	= require( "./buttonManager.js" );

const wEmitter	= require("../main.js").wEmitter;
const wSkypeNames = require("../personal.js").skypeNames;

function wcl( wSTR ) { console.log( colors.black.bgWhite( "[CLIENT_MAN] --> " + wSTR ) ); }
function wSleep( ms ) { return new Promise( resolve => setTimeout( resolve , ms ) ); }


async function BUTTON_PRESS_0( wArgArray ) {
	wcl( "PRESSED BUTTON 0" );
	wcl( "Youtube Live Background" );
	await require( "./STATES/YT_Live_Background.js" ).start();
}

function BUTTON_PRESS_1( wArgArray ) {
	wArgArray = wArgArray || [ "classic" ];
	wcl( "PRESSED BUTTON 1" );
}

function BUTTON_PRESS_2( wArgArray ) {
	wcl( "PRESSED BUTTON 2" );
}

function BUTTON_PRESS_3( wArgArray ) {
	// YOUTUBE STANDARD / TWITCH LIVE 
}

function BUTTON_PRESS_4( wArgArray ) {
	// SKYPE One
	wcl( "PRESSED BUTTON 4" );
}

function BUTTON_PRESS_5( wArgArray ) {
	// SKYPE Two
	wcl( "PRESSED BUTTON 5" );
}

function BUTTON_PRESS_6( wArgArray ) {
	// STOP Everything
	wcl( "PRESSED BUTTON 6" );
}

function BUTTON_PRESS_7( wArgArray ) {
	// PAUSE EVERYTHING
	wcl( "PRESSED BUTTON 7" );
}

function BUTTON_PRESS_8( wArgArray ) {
	// PREVIOUS MEDIA
	wcl( "PRESSED BUTTON 8" );
}

function BUTTON_PRESS_9( wArgArray ) {
	// NEXT MEDIA
	wcl( "PRESSED BUTTON 9" );
}

function BUTTON_PRESS_10( wArgArray ) {
	// LOCAL MOVIE
	wcl( "PRESSED BUTTON 10" );
}

function BUTTON_PRESS_11( wArgArray ) {
	wcl( "PRESSED BUTTON 11" );
}

function BUTTON_PRESS_12( wArgArray ) {
	// LOCAL TV SHOW
	wcl( "PRESSED BUTTON 12" );
}

function wPressButtonMaster( wButtonNum , wArgArray ) {
	var x1 = "MB-Pressed--" + wButtonNum.toString();
	var dNow = new Date();
	var x2 = dNow.getMonth() + '-' + dNow.getDate() + '-' + dNow.getFullYear() + '--' + dNow.getHours() + '-' + dNow.getMinutes();
	wcl( x2 + " " + x1 );
	//EMAIL_MAN.sendEmail( x2 , x1 );
	//if ( !HALEY_HOME_OVERRIDED_ALREADY && dNow.getHours() === 15 && JOB_OVERRIDE_HALEY_IS_HOME == false ) { JOB_OVERRIDE_HALEY_IS_HOME = true; wButtonNum = 11; }
	switch( wButtonNum ) {
		case 0:
			BUTTON_PRESS_0( wArgArray );
			break;
		case 1:
			BUTTON_PRESS_1( wArgArray );
			break;
		case 2:
			BUTTON_PRESS_2( wArgArray );
			break;
		case 3:
			BUTTON_PRESS_3( wArgArray );
			break;
		case 4:
			BUTTON_PRESS_4( wArgArray );
			break;
		case 5:
			BUTTON_PRESS_5( wArgArray );
			break;
		case 6:
			BUTTON_PRESS_6( wArgArray );
			break;
		case 7:
			BUTTON_PRESS_7( wArgArray );
			break;
		case 8:
			BUTTON_PRESS_8( wArgArray );
			break;
		case 9:
			BUTTON_PRESS_9( wArgArray );
			break;
		case 10:
			BUTTON_PRESS_10( wArgArray );
			break;
		case 11:
			BUTTON_PRESS_11( wArgArray );
			break;
		case 12:
			BUTTON_PRESS_12( wArgArray );
			break;
		default:
			break;																																				
	}
}
module.exports.pressButtonMaster = wPressButtonMaster;