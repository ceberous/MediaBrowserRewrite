const redis = require("../../main.js").redis;
const RU = require( "../utils/redis_Utils.js" );

const R_LocalMedia_Base = "LAST_SS.LOCAL_MEDIA.";
const R_LM_Config_Base = "CONFIG.LOCAL_MEDIA.LIVE.";
const R_LM_Config_Genre = R_LM_Config_Base + "GENRE";
const R_LM_Config_AdvanceShow = R_LM_Config_Base + "ADVANCE_SHOW";
const R_LM_Config_SpecificShow = R_LM_Config_Base + "SPECIFIC_SHOW";
const R_LM_Config_SpecificEpisode = R_LM_Config_Base + "SPECIFIC_EPISODE";
function wStart() {
	return new Promise( async function( resolve , reject ) {
		try {
			await RU.setMulti( redis , [
				[ "set" , "LAST_SS.ACTIVE_STATE" , "LOCAL_MEDIA" ] ,
				[ "set" , R_LM_Config_Genre , "Odyssey" ] ,
				[ "set" , R_LM_Config_AdvanceShow , "false" ] ,
				[ "set" , R_LM_Config_SpecificShow , "false" ] ,
				[ "set" , R_LM_Config_SpecificEpisode , "false" ] ,
			]);
			console.log( "loaded config for local-media-man" );
			require( "../localMediaManager.js" ).play();

			await require( "./YT_Live_Background.js" ).start();

			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function wPause() { 
	return new Promise( async function( resolve , reject ) {
		try {
			await require( "../localMediaManager.js" ).pause(); 
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
function wResume() {
	return new Promise( async function( resolve , reject ) {
		try {
			await require( "../localMediaManager.js" ).resume();
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function wStop() {
	return new Promise( async function( resolve , reject ) {
		try {
			await require( "../localMediaManager.js" ).stop();
			await require( "./YT_Live_Background.js" ).stop();			
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function wNext() {
	return new Promise( async function( resolve , reject ) {
		try {
			await require( "../localMediaManager.js" ).next();
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function wPrevious() {
	return new Promise( async function( resolve , reject ) {
		try {
			await require( "../localMediaManager.js" ).previous();
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

module.exports.start = wStart;
module.exports.pause = wPause;
module.exports.resume = wResume;
module.exports.stop = wStop;
module.exports.next = wNext;
module.exports.previous = wPrevious;