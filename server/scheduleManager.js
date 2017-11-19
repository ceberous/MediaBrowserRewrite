const schedule = require( "node-schedule" );
const redis = require( "../main.js" ).redis;
const RU = require( "./utils/redis_Utils.js" );

const wButtonMaster = require( "./clientManager.js" ).pressButtonMaster;
var CUSTOM_SCHEDULES = require( "../config.js" ).SCHEDULES;

// Initialization
( async ()=> {
	for ( var job in CUSTOM_SCHEDULES ) {
		CUSTOM_SCHEDULES[ job ][ "startPID" ] = schedule.scheduleJob( CUSTOM_SCHEDULES[ job ][ "startPattern" ] , async function() { 
			if ( CUSTOM_SCHEDULES[ job ][ "startConditions" ] !== null ) {
				for ( var condition in CUSTOM_SCHEDULES[ job ][ "startConditions" ] ) {
					var answer = await RU.getKey( redis , condition );
					if ( answer === CUSTOM_SCHEDULES[ job ][ "startConditions" ][ condition ] ) {
						console.log( "condition was met !!!" );
						console.log( condition + " === " + answer );
						wButtonMaster( CUSTOM_SCHEDULES[ job ][ "state" ] , CUSTOM_SCHEDULES[ job ][ "stateOptions" ] );
					}
					else { console.log( "condition not met for scheduled task" ); }
				}
			}
			else { wButtonMaster( CUSTOM_SCHEDULES[ job ][ "state" ] , CUSTOM_SCHEDULES[ job ][ "stateOptions" ] ); }		
		});
		CUSTOM_SCHEDULES[ job ][ "stopPID" ] = schedule.scheduleJob( CUSTOM_SCHEDULES[ job ][ "stopPattern" ] , async function() {
			if ( CUSTOM_SCHEDULES[ job ][ "stopConditions" ] !== null ) {
				for ( var condition in CUSTOM_SCHEDULES[ job ][ "stopConditions" ] ) {
					var answer = await RU.getKey( redis , condition );
					if ( answer === CUSTOM_SCHEDULES[ job ][ "stopConditions" ][ condition ] ) {
						console.log( "condition was met !!!" );
						console.log( condition + " === " + answer );
						wButtonMaster( 6 );
					}
				}
			}
			else { wButtonMaster( 6 ); }
		});
	}
})();

function ADD_SCHEDULED_JOB() {
	return new Promise( function( resolve , reject ) {
		try {
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function REMOVE_SCHEDULED_JOB() {
	return new Promise( function( resolve , reject ) {
		try {
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

module.exports.addScheduledJob = ADD_SCHEDULED_JOB;
module.exports.removeScheduledJob = REMOVE_SCHEDULED_JOB;

// const wStartTime = 
// const wStopTime = 
// var j1 = schedule.scheduleJob( wStartTime , function() { if ( !JOB_OVERRIDE_HALEY_IS_HOME ) { BUTTON_PRESS_11(); } });
// //var j2 = schedule.scheduleJob( wStopTime , function(){ if ( LAST_SS.CURRENT_ACTION === "YTLiveBackground" ) { BUTTON_PRESS_6(); } });
// var j2 = schedule.scheduleJob( wStopTime , function(){ BUTTON_PRESS_6(); YOUTUBE_MAN.stopYTLiveBackground(); HALEY_HOME_OVERRIDED_ALREADY = false; } );