const redis = require( "../../../main" ).redis;
const RU = require( "../redis_Utils.js" );
const mopidy = require( "../../mopidyManager.js" ).mopidy;
function sleep( ms ) { return new Promise( resolve => setTimeout( resolve , ms ) ); }

const R_BASE = "MOPIDY.";


const R_CUR_STATE = R_BASE + "STATE";
function GET_STATE() {
	return new Promise( function( resolve , reject ) {
		try {
			mopidy.playback.getState().then( async function ( state ) {
				console.log( "STATE = " + state );
				await RU.setKey( redis , R_CUR_STATE , state );
				resolve( state );
			});
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
function INITIALIZE() {
	return new Promise( async function( resolve , reject ) {
		try {
			await sleep( 1000 );
			console.log( await GET_STATE() );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.initialize = INITIALIZE;
module.exports.getState = GET_STATE;