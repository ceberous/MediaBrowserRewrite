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
const CEC_MAN		= require( "./utils/cecClientManager.js" );
const EMAIL_MAN 	= require( "./emailManager.js" );
const BTN_MAN 		= require( "./buttonManager.js" );
	// Currently Importing These here ONLY for Their Initialization Blocks
const LOCAL_MEDIA_MAN 	= require( "./localMediaManager.js" ); 
const MOPIDY_MAN 		= require( "./mopidyManager.js" );
// ======================================================================
// ======================================================================


var CURRENT_STATE = null;
var BTN_MAP = require( "../config.js" ).BUTTON_MAP;

const R_ARRIVE_HOME = "CONFIG.ARRIVED_HOME";
async function wSendButtonPressNotificationEmail( wButtonNum ) {
	const x1 = "MB-Pressed--" + wButtonNum.toString();
	const dNow = new Date();
	var dHours = dNow.getHours(); 
	const x2 = dNow.getMonth() + '-' + dNow.getDate() + '-' + dNow.getFullYear() + '--' + dHours + '-' + dNow.getMinutes();
	wcl( x2 + " " + x1 );
	if ( parseInt( dHours ) === 15 ) {
		const already_home = await RU.getKey( redis , R_ARRIVE_HOME );
		if ( already_home !== null ){
			if ( already_home === "false" ) {
				await RU.setKey( redis , R_ARRIVE_HOME , "true" );
			}
		}
	}
	EMAIL_MAN.sendEmail( x2 , x1 );
}

async function wPressButtonMaster( wButtonNum , wOptions ) {
	var wBTN_I = parseInt( wButtonNum );
	if ( wBTN_I > 13 || wBTN_I < 0 ) { return "out of range"; }
	wSendButtonPressNotificationEmail( wButtonNum );
	var launching_fp = null;
	if ( BTN_MAP[ wButtonNum ][ "state" ] || BTN_MAP[ wButtonNum ][ "session" ] ) {
		if ( CURRENT_STATE ) { await CURRENT_STATE.stop(); }
		//CEC_MAN.activate();
		if ( BTN_MAP[ wButtonNum ][ "session" ] ) {
			launching_fp = path.join( __dirname , "SESSIONS" ,  BTN_MAP[ wButtonNum ][ "session" ] + ".js" );
		}
		else {
			launching_fp = path.join( __dirname , "STATES" ,  BTN_MAP[ wButtonNum ][ "state" ] + ".js" );
		}
		wcl( "LAUNCHING STATE--->" );
		wcl( launching_fp );
		CURRENT_STATE = null;
		CURRENT_STATE = require( launching_fp );
		wOptions = wOptions || BTN_MAP[ wButtonNum ][ "options" ];
		await CURRENT_STATE.start( wOptions );
	}
	else { if ( CURRENT_STATE ) { wcl( "STATE ACTION --> " + BTN_MAP[ wButtonNum ][ "label" ] + "()" ); CURRENT_STATE[ BTN_MAP[ wButtonNum ][ "label" ] ](); } }
}
module.exports.pressButtonMaster = wPressButtonMaster;

const SCHEDULE_MAN 	= require( "./scheduleManager.js" );
