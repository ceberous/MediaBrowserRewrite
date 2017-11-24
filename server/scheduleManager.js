const path = require("path");
const schedule = require( "node-schedule" );
const redis = require( "../main.js" ).redis;
const RU = require( "./utils/redis_Utils.js" );

const wButtonMaster = require( "./clientManager.js" ).pressButtonMaster;
var STATE_TRANSITIONS = require( "../config.js" ).SCHEDULES.STATE_TRANSITIONS;
var UPDATE_JOBS = require( "../config.js" ).SCHEDULES.UPDATES;

// Initialize State Transition Schedules
( async ()=> {
	for ( var job in STATE_TRANSITIONS ) {
		STATE_TRANSITIONS[ job ][ "startPID" ] = schedule.scheduleJob( STATE_TRANSITIONS[ job ][ "startPattern" ] , async function() { 
			var AllConditionsMet = true;
			if ( STATE_TRANSITIONS[ job ][ "startConditions" ] ) {
				var wConditions = Object.keys( STATE_TRANSITIONS[ job ][ "startConditions" ] );
				var answers = await RU.getMultiKeys( redis , wConditions );
				for ( var i = 0; i < answers.length; ++i ) {
					if ( answers[ i ] !== STATE_TRANSITIONS[ job ][ "startConditions" ][ wConditions[ i ] ] ) {
						AllConditionsMet = false;
						console.log( "condition not met !!!" );
						console.log( answers[ i ] + " !== " + STATE_TRANSITIONS[ job ][ "startConditions" ][ wConditions[ i ] ] );						
					}
				}
			}
			if ( AllConditionsMet ) {
				console.log( "starting scheduled job" );
				wButtonMaster( STATE_TRANSITIONS[ job ][ "state" ] , STATE_TRANSITIONS[ job ][ "stateOptions" ] );
			}
			else { console.log( "condition not met for scheduled task" ); }
		});
		STATE_TRANSITIONS[ job ][ "stopPID" ] = schedule.scheduleJob( STATE_TRANSITIONS[ job ][ "stopPattern" ] , async function() {
			var AllConditionsMet = true;
			if ( STATE_TRANSITIONS[ job ][ "stopConditions" ] ) {
				var wConditions = Object.keys( STATE_TRANSITIONS[ job ][ "stopConditions" ] );
				var answers = await RU.getMultiKeys( redis , wConditions );
				for ( var i = 0; i < answers.length; ++i ) {
					if ( answers[ i ] !== STATE_TRANSITIONS[ job ][ "startConditions" ][ wConditions[ i ] ] ) {
						AllConditionsMet = false;
						console.log( "condition not met !!!" );
						console.log( answers[ i ] + " !== " + STATE_TRANSITIONS[ job ][ "startConditions" ][ wConditions[ i ] ] );
					}
				}
			}
			if ( AllConditionsMet ) {
				wButtonMaster( 6 );
			}
			else { console.log( "condition not met for scheduled task" ); }
		});
	}
})();

// Initialize Update Functions
( async ()=> {
	for ( var job in UPDATE_JOBS ) {
		UPDATE_JOBS[ job ][ "jobPID" ] = schedule.scheduleJob( UPDATE_JOBS[ job ][ "startPattern" ] , async function() {
			var AllConditionsMet = true;
			if ( UPDATE_JOBS[ job ][ "startConditions" ] ) {
				var AllConditionsMet = true;
				var wConditions = Object.keys( UPDATE_JOBS[ job ][ "startConditions" ] );
				var answers = await RU.getMultiKeys( redis , wConditions );
				for ( var i = 0; i < answers.length; ++i ) {
					if ( answers[ i ] !== UPDATE_JOBS[ job ][ "startConditions" ][ wConditions[ i ] ] ) {
						AllConditionsMet = false;
						console.log( "condition not met !!!" );
						console.log( answers[ i ] + " !== " + UPDATE_JOBS[ job ][ "startConditions" ][ wConditions[ i ] ] );
					}
				}
			}
			if ( AllConditionsMet ) {
				console.log( "all conditions were met !!!" );
				// run update function()
				const B_PATH = path.join( __dirname , ...UPDATE_JOBS[ job ][ "functionPath" ] );
				console.log( "starting scheduled update func()" );
				console.log( B_PATH );
				if ( UPDATE_JOBS[ job ][ "functionName" ] ) {
					require( B_PATH )[ UPDATE_JOBS[ job ][ "functionName" ] ]();
				}
				else {
					require( B_PATH )();
				}
			}
			else { console.log( "condition not met for scheduled task" ); }
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