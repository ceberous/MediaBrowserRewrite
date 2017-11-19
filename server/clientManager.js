const fs	= require( "fs" );
const path	= require( "path" );
const colors	= require( "colors" );

const wEmitter	= require("../main.js").wEmitter;
function wcl( wSTR ) { console.log( colors.black.bgWhite( "[CLIENT_MAN] --> " + wSTR ) ); }
function wSleep( ms ) { return new Promise( resolve => setTimeout( resolve , ms ) ); }

const redis = require( "../main.js" ).redis;
const RU = require( "./utils/redis_Utils.js" );


// MODULES
// ======================================================================
// ======================================================================
const EMAIL_MAN = require( "./emailManager.js" );
const BTN_MAN 	= require( "./buttonManager.js" );
	// Currently Importing These here ONLY for Their Initialization Blocks
const LOCAL_MEDIA_MAN = require( "./localMediaManager.js" ); 
const MOPIDY_MAN = require( "./mopidyManager.js" );
// ======================================================================
// ======================================================================


var CURRENT_STATE = null;
var BTN_TO_STATE_MAP = require( "../config.js" ).BUTTON_TO_STATE_MAP;

function wSendButtonPressNotificationEmail( wButtonNum ) {
	var x1 = "MB-Pressed--" + wButtonNum.toString();
	var dNow = new Date();
	var x2 = dNow.getMonth() + '-' + dNow.getDate() + '-' + dNow.getFullYear() + '--' + dNow.getHours() + '-' + dNow.getMinutes();
	wcl( x2 + " " + x1 );
	//EMAIL_MAN.sendEmail( x2 , x1 );
	//if ( !HALEY_HOME_OVERRIDED_ALREADY && dNow.getHours() === 15 && JOB_OVERRIDE_HALEY_IS_HOME == false ) { JOB_OVERRIDE_HALEY_IS_HOME = true; wButtonNum = 11; }
}

async function wPressButtonMaster( wButtonNum , wArgArray ) {
	var wBTN_I = parseInt( wButtonNum );
	if ( wBTN_I > 12 || wBTN_I < 0 ) { return "out of range"; }
	wSendButtonPressNotificationEmail( wButtonNum );
	if ( BTN_TO_STATE_MAP[ wButtonNum ][ "state" ] !== null ) {
		if ( CURRENT_STATE ) { await CURRENT_STATE.stop(); }
		var state_fp = path.join( __dirname , "STATES" ,  BTN_TO_STATE_MAP[ wButtonNum ][ "state" ] + ".js" );
		wcl( "LAUNCHING STATE--->" );
		wcl( state_fp );
		CURRENT_STATE = require( state_fp );
		wArgArray = wArgArray || BTN_TO_STATE_MAP[ wButtonNum ][ "options" ];
		await CURRENT_STATE.start( wArgArray );
	}
	else { wcl( "STATE ACTION --> " + BTN_TO_STATE_MAP[ wButtonNum ][ "label" ] + "()" ); CURRENT_STATE[ BTN_TO_STATE_MAP[ wButtonNum ][ "label" ] ](); }
}
module.exports.pressButtonMaster = wPressButtonMaster;