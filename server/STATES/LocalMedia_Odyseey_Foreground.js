const redis = require("../../main.js").redis;
const RU = require( "../utils/redis_Utils.js" );

const R_LocalMedia_Base = "LAST_SS.LOCAL_MEDIA.";
const R_LM_Config_Base = "CONFIG.LOCAL_MEDIA.LIVE.";
const R_LM_Config_Genre = R_LM_Config_Base + "GENRE";
const R_LM_Config_AdvanceShow = R_LM_Config_Base + "ADVANCE_SHOW";
const R_LM_Config_SpecificShow = R_LM_Config_Base + "SPECIFIC_SHOW";
const R_LM_Config_SpecificEpisode = R_LM_Config_Base + "SPECIFIC_EPISODE";

function wStart( wOptions ) {
	return new Promise( async function( resolve , reject ) {
		try {
			if ( !wOptions ) {
				console.log( "not wOptions ??" );
				var wOptions = {
					advance_show: "false" , 
					specific_show: "false" ,
					specific_episode: "false" ,
				};
			}
			await RU.setMulti( redis , [
				[ "set" , "LAST_SS.ACTIVE_STATE" , "LOCAL_MEDIA" ] ,
				[ "set" , R_LM_Config_Genre , "Odyssey" ] ,
				[ "set" , R_LM_Config_AdvanceShow , wOptions.advance_show ] ,
				[ "set" , R_LM_Config_SpecificShow , wOptions.specific_show ] ,
				[ "set" , R_LM_Config_SpecificEpisode , wOptions.specific_episode ] ,
			]);

			await require( "../localMediaManager.js" ).play();
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