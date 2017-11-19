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
const EMAIL_MAN 	= require( "./emailManager.js" );
const BTN_MAN 		= require( "./buttonManager.js" );
	// Currently Importing These here ONLY for Their Initialization Blocks
const LOCAL_MEDIA_MAN 	= require( "./localMediaManager.js" ); 
const MOPIDY_MAN 		= require( "./mopidyManager.js" );
// ======================================================================
// ======================================================================


var CURRENT_STATE = null;
var BTN_TO_STATE_MAP = require( "../config.js" ).BUTTON_TO_STATE_MAP;

const R_ARRIVE_HOME = "CONFIG.ARRIVE_HOME";
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
	//EMAIL_MAN.sendEmail( x2 , x1 );
}

async function wPressButtonMaster( wButtonNum , wOptions ) {
	var wBTN_I = parseInt( wButtonNum );
	if ( wBTN_I > 13 || wBTN_I < 0 ) { return "out of range"; }
	wSendButtonPressNotificationEmail( wButtonNum );
	if ( BTN_TO_STATE_MAP[ wButtonNum ][ "state" ] !== null ) {
		if ( CURRENT_STATE ) { await CURRENT_STATE.stop(); }
		var state_fp = path.join( __dirname , "STATES" ,  BTN_TO_STATE_MAP[ wButtonNum ][ "state" ] + ".js" );
		wcl( "LAUNCHING STATE--->" );
		wcl( state_fp );
		CURRENT_STATE = require( state_fp );
		wOptions = wOptions || BTN_TO_STATE_MAP[ wButtonNum ][ "options" ];
		await CURRENT_STATE.start( wOptions );
	}
	else { wcl( "STATE ACTION --> " + BTN_TO_STATE_MAP[ wButtonNum ][ "label" ] + "()" ); CURRENT_STATE[ BTN_TO_STATE_MAP[ wButtonNum ][ "label" ] ](); }
}
module.exports.pressButtonMaster = wPressButtonMaster;

const SCHEDULE_MAN 	= require( "./scheduleManager.js" );