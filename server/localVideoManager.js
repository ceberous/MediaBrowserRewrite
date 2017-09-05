require('shelljs/global');
const path = require("path");
const colors = require("colors");
const jsonfile = require("jsonfile");
const dirTree = require("./utils/dirtreeutil.js");
//const Filehound = require("filehound");
//const mime = require('mime');

function wcl( wSTR ) { console.log( colors.black.bgGreen( "[LOCAL_VIDEO_MAN] --> " + wSTR ) ); }
function wSleep( ms ) { return new Promise( resolve => setTimeout( resolve , ms ) ); }

//var wEmitter = require('../main.js').wEmitter;
var wUpdate_Last_SS = require( "./clientManager.js" ).update_Last_SS;
var wUpdate_Last_SS_OBJ_PROP = require( "./clientManager.js" ).update_Last_SS_OBJ_PROP;
var wUpdate_Last_SS_OBJ_PROP_SECONDARY_OBJ_PROP = require( "./clientManager.js" ).xUpdate_Last_SS_OBJ_PROP_SECONDARY_OBJ_PROP;
const MPLAYER_MAN = require( "./utils/mplayerManager.js" );

// DATABASISH
// ====================================================================================================================================================
// ====================================================================================================================================================
var NeedToUpdateHDStruct = true;
var HD_MOUNT_POINT = "/home/morpheous/TMP2/EMULATED_MOUNT_PATH/";
var HARD_DRIVE_STRUCT = {};
var HD_REF = {};
var LAST_PLAYED = {};
var NEED_TO_RESET_LP = false;
const HARD_DRIVE_STRUCT_FP = path.join( __dirname , "save_files" , "hdFolderStructure.json" );

try { HARD_DRIVE_STRUCT = jsonfile.readFileSync( HARD_DRIVE_STRUCT_FP ); LAST_PLAYED = HARD_DRIVE_STRUCT[ "LAST_PLAYED" ]; BEGIN_INITIALIZATION(); }
catch ( error ){ INITIALIZE_HARD_DRIVE_STRUCT_FILE(); }

function WRITE_HARD_DRIVE_STRUCT_FILE() { 
	return new Promise( function( resolve , reject ) {
		try {
			jsonfile.writeFile( HARD_DRIVE_STRUCT_FP , HARD_DRIVE_STRUCT , function( err ) {
				if ( err ) { console.log( err ); reject(err); }
				resolve();
			}); 
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
async function INITIALIZE_HARD_DRIVE_STRUCT_FILE() {
	wcl( "hdFolderStructure.json NOT FOUND !!!" ); 
	NeedToUpdateHDStruct = true;
	LAST_PLAYED = { 
		"AudioBooks": { always_advance_next_show: true , last_pos: 0 , locked_show: null },
		"DVDs": { always_advance_next_show: true , last_pos: 0 , locked_show: null },
		"Movies": { always_advance_next_show: true , last_pos: 0 , locked_show: null },
		"Music": { always_advance_next_show: true , last_pos: 0 , locked_show: null },
		"Podcasts": { always_advance_next_show: true , last_pos: 0 , locked_show: null },
		"TVShows": { always_advance_next_show: true , last_pos: 0 , locked_show: null }
	};
	NEED_TO_RESET_LP = true;
	await WRITE_HARD_DRIVE_STRUCT_FILE(); 
	BEGIN_INITIALIZATION();
}

function FIND_USB_STORAGE_PATH_FROM_UUID( wUUID ) {
	function getPath() {
		var findMountPointCMD = "findmnt -rn -S UUID=" + wUUID + " -o TARGET";
		var findMountPoint = exec( findMountPointCMD , { silent:true , async: false } );
		if ( findMountPoint.stderr ) { console.log("error finding USB Hard Drive"); process.exit(1); }
		return findMountPoint.stdout.trim();
	}
	return new Promise( function( resolve , reject ) {
		try {
			
			var findEventPathCMD = exec( "sudo blkid" , { silent: true , async: false } );
			if ( findEventPathCMD.stderr ) { wcl("error finding USB Hard Drive"); process.exit(1); }

			var wOUT = findEventPathCMD.stdout.split("\n");
			for ( var i = 0; i < wOUT.length; ++i ) {
				
				var xSplit = wOUT[i].split(" ");
				var x1 = xSplit[1];
				if ( x1 === undefined ) { continue; }
				var x2 = x1.split( "UUID=" )[1];
				if ( !x2 ) { x2 = xSplit[2].split("UUID=")[1];  }
				x2 = x2.substring( 1 , ( x2.length - 1 ) );
				if ( x2 !== wUUID ) { continue; }

				var q1 = getPath();
				
				if ( q1 === "" ) {

					console.log( "USB Drive Plugged IN , but unmounted" );
					console.log( "Mounting ...." );

					var wUSER = exec( "whoami" , { silent:true , async: false } );
					if ( wUSER.stderr ) { console.log("error finding USB Hard Drive"); process.exit(1); }
					wUSER = wUSER.stdout.trim();

					// var wUID = exec( "id -u" , { silent:true , async: false } );
					// if ( wUID.stderr ) { console.log("error finding USER's ID"); process.exit(1); }
					// wUID = wUID.stdout.trim();
					// var wGID = exec( "id -g" , { silent:true , async: false } );
					// if ( wGID.stderr ) { console.log("error finding USER's Group ID"); process.exit(1); }
					// wGID = wGID.stdout.trim();				

					var wPath = path.join( "/" , "media" , wUSER , wUUID )

					var wMKDIR = exec( "sudo mkdir -p " + wPath , { silent: true , async: false } );
					if ( wMKDIR.stderr ) { console.log("error creating USB Hard Drive Media Path"); process.exit(1); }

					var mountCMD = "sudo mount -U " + wUUID +" --target " + wPath;
					console.log(mountCMD);
					var wMount = exec( mountCMD , { silent: true , async: false } );
					if ( wMount.stderr ) { console.log("error Mounting USB Hard Drive"); process.exit(1); }

					q1 = getPath();
					if ( q1 === "" ) { console.log("Still Can't Mount HardDrive Despite all Efforts"); process.exit(1); }

				}

				resolve( q1 );
			}

			
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function BUILD_HD_REF() {
	var media_struct = {};
	for ( var section in HARD_DRIVE_STRUCT ) {
		if ( section === "BASE_PATH" ) { continue; }
		media_struct[ section ] = {};
		for ( var x1 = 0; x1 < HARD_DRIVE_STRUCT[ section ].length; ++x1 ) {
			if ( !HARD_DRIVE_STRUCT[ section ][ x1 ][ "children" ] ) { media_struct[ section ][ HARD_DRIVE_STRUCT[ section ][ x1 ].name ] = x1; continue; }			
			media_struct[ section ][ HARD_DRIVE_STRUCT[ section ][ x1 ].name ] = { pos: x1 , items: [] };
			for ( var j1 = 0; j1 < HARD_DRIVE_STRUCT[ section ][ x1 ][ "children" ].length; ++j1 ) {				
				if ( !HARD_DRIVE_STRUCT[ section ][ x1 ][ "children" ][ j1 ][ "children" ] ) { 
					media_struct[ section ][ HARD_DRIVE_STRUCT[ section ][ x1 ].name ] = { pos: x1 , items: Object.keys( HARD_DRIVE_STRUCT[ section ][ x1 ][ "children" ] ).length }; 
				}
				else {
					media_struct[ section ][ HARD_DRIVE_STRUCT[ section ][ x1 ].name ][ "items" ].push( HARD_DRIVE_STRUCT[ section ][ x1 ][ "children" ][ j1 ][ "children" ].length );
				}
			}
		}
	}
	HD_REF = media_struct;
	HARD_DRIVE_STRUCT[ "REFERENCE" ] = HD_REF;
	if ( NEED_TO_RESET_LP ) { HARD_DRIVE_STRUCT[ "LAST_PLAYED" ] = LAST_PLAYED; }
}

function UPDATE_HARD_DRIVE_FOLDER_STRUCT_SAVE_FILE() {
	return new Promise( async function( resolve , reject ) {
		try {
			var wAcceptedFolders = [ "AudioBooks" , "DVDs" , "Movies" , "Music" , "Podcasts" , "TVShows" ];
			var wSTRUCT = await dirTree( HD_MOUNT_POINT );
			var wTMP = {};
			for ( var i = 0; i < wSTRUCT[ "children" ].length; ++i ) {
				for ( var j = 0; j < wAcceptedFolders.length; ++j ) {
					if ( wAcceptedFolders[ j ] === wSTRUCT[ "children" ][ i ].name ) {
						wTMP[ wAcceptedFolders[ j ] ] = wSTRUCT[ "children" ][ i ][ "children" ];
						wAcceptedFolders.splice( j , 1 );
					}
				}
			}

			wTMP[ "BASE_PATH" ] = HD_MOUNT_POINT;
			HARD_DRIVE_STRUCT = wTMP;
			BUILD_HD_REF();
			WRITE_HARD_DRIVE_STRUCT_FILE();
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
// ====================================================================================================================================================
// ====================================================================================================================================================


// STATE-DEFINITIONS
// ===============================================
// ===============================================
var NOW_PLAYING_REF = null;
var NOW_PLAYING_DURATION = null;
var NOW_PLAYING_3PERCENT_LEFT = null;
// ===============================================
// ===============================================

// STATE-CONTROLLERS
// ====================================================================================================================================================
// ====================================================================================================================================================
async function PLAY_FROM_REFERENCE_STRUCT( wArgArray ) {
	
	console.log( "\nWE WERE SENT AN ARG ARRAY FROM ABOVE !!!!\n" );
	console.log( wArgArray );

	var wSection = wArgArray[0] || null;
	var wName = wArgArray[1] || null;
	var wSeason = wArgArray[2];
	var wEpisode = wArgArray[3]; 
	var wSeek = wArgArray[4];
	if ( wSeek === -1  ) { wSeek = null; }

	//wSeason = ( wSeason - 1 );
	//if ( wEpisode ) { wEpisode = ( wEpisode - 1 ); }
	
	var wPath = HARD_DRIVE_STRUCT[ "BASE_PATH" ] + wSection + "/" + wName;
	console.log( wPath );

	console.log( "Show POS = " + HD_REF[ wSection ][ wName ].pos.toString() );
	console.log( HARD_DRIVE_STRUCT[ wSection ][ HD_REF[ wSection ][ wName ].pos ] );
	console.log( "Show Season = " + wSeason.toString() );
	console.log( HARD_DRIVE_STRUCT[ wSection ][ HD_REF[ wSection ][ wName ].pos ]["children"][ wSeason ] );

	if ( wSeason === 0 || wSeason ) {
		wPath = wPath + "/" + HARD_DRIVE_STRUCT[ wSection ][ HD_REF[ wSection ][ wName ].pos ][ "children" ][ wSeason ][ "name" ];
		wPath = wPath + "/" + HARD_DRIVE_STRUCT[ wSection ][ HD_REF[ wSection ][ wName ].pos ][ "children" ][ wSeason ][ "children" ][ wEpisode ].name;
	}

	wcl( "STARTING --> MPLAYER" );
	console.log( wPath );
	NOW_PLAYING_REF = [ wSection , wName , wSeason , wEpisode ];
	
	MPLAYER_MAN.playFilePath( wPath );
	if ( wSeek !== null ) {
		await wSleep( 1000 );
		MPLAYER_MAN.seekSeconds( wSeek );
	}
	
	await wSleep( 3000 );
	console.log("were done waiting");
	NOW_PLAYING_DURATION = MPLAYER_MAN.getDuration();
	NOW_PLAYING_3PERCENT_LEFT = Math.floor( ( NOW_PLAYING_DURATION - ( NOW_PLAYING_DURATION * 0.025 ) ) );

	console.log( "NOW_PLAYING_DURATION = " + NOW_PLAYING_DURATION.toString() );
	console.log( "NOW_PLAYING_3PERCENT_LEFT = " + NOW_PLAYING_3PERCENT_LEFT.toString() );
	console.log( "DIFFERENCE = " + Math.floor( ( NOW_PLAYING_DURATION * 0.025 ) ).toString() );

	var NP_HD_S_POS = HD_REF[ wSection ][ wName ].pos;
	console.log( wName + "'s Position in HARD_DRIVE_STRUCT = " + NP_HD_S_POS.toString() + "\n" );
	//console.log( HARD_DRIVE_STRUCT[ wSection ][ NP_HD_S_POS ] );

	await wUpdate_Last_SS_OBJ_PROP_SECONDARY_OBJ_PROP( "LocalVideo" , "LAST_PLAYED" , wSection , "last_pos" , NP_HD_S_POS );

}

// wSection , wName , wSeason , wEpisode
async function updateLastPlayed( wTime ) {
	if ( NOW_PLAYING_REF !== null ) {
		var wCompleted = ( wTime >= NOW_PLAYING_3PERCENT_LEFT ) ? true : false;
		var wRemaining = ( NOW_PLAYING_DURATION - wTime );
		var wOBJ = {
			current_time: wTime ,
			remaining_time: wRemaining,
			duration: NOW_PLAYING_DURATION ,
			completed: wCompleted,
			rs_map: [ NOW_PLAYING_REF[2] , NOW_PLAYING_REF[3] ]
		};

		await wUpdate_Last_SS_OBJ_PROP_SECONDARY_OBJ_PROP( "LocalVideo" , "LAST_PLAYED" , NOW_PLAYING_REF[0] , NOW_PLAYING_REF[1] , wOBJ );
	}
}

function wPlay( wConfig ) {

	// wSection , wName , wSeason , wEpisode ,
	// PLAY_FROM_REFERENCE_STRUCT(  );

	// { 
	// 	type: 'TVShows',
 //  		last_p: { 
 //  			always_advance_next_show: true,
 //     		last_pos: 0,
 //     		locked_show: null 
 //     	} 
 //    }


 	function build_NP_ArgArray() {

 		// If we have Never Watched anything Before
	 	if ( Object.keys( wConfig.last_played ).length <= 3 ) {
	 		return [ wConfig.type , HARD_DRIVE_STRUCT[ wConfig.type ][ 0 ].name , 1 , 1 ];
	 	}
	 	
	 	// If we have an un-finished show still
	 	if ( !wConfig.last_played[ HARD_DRIVE_STRUCT[ wConfig.type ][ wConfig.last_played.last_pos ].name ].completed ) {
	 		return [ 
	 			wConfig.type ,
	 			HARD_DRIVE_STRUCT[ wConfig.type ][ wConfig.last_played.last_pos ].name ,
	 			wConfig.last_played[ HARD_DRIVE_STRUCT[ wConfig.type ][ wConfig.last_played.last_pos ].name ].rs_map[ 0 ] ,
	 			wConfig.last_played[ HARD_DRIVE_STRUCT[ wConfig.type ][ wConfig.last_played.last_pos ].name ].rs_map[ 1 ] ,
	 			wConfig.last_played[ HARD_DRIVE_STRUCT[ wConfig.type ][ wConfig.last_played.last_pos ].name ].current_time
	 		];
	 	}

		var wLastPlayedShowsPosition = wConfig.last_played.last_pos;
		var wTotalShows = ( Object.keys( HD_REF[ wConfig.type ] ).length - 1 ); // offset for array-indexing
		
		// If using DEFAULT method of always showing "Next" in line TV Show
		if ( wConfig.last_played.always_advance_next_show ) {
			
			var wNextShowsPosition = ( wLastPlayedShowsPosition + 1 );
			if ( wNextShowsPosition > wTotalShows ) { wNextShowsPosition = 0; }
			var wNextShowName = HARD_DRIVE_STRUCT[ wConfig.type ][ wNextShowsPosition ].name;

			// If we have NEVER watched the "next" show
			if ( !wConfig.last_played[ wNextShowName ] ) {
				return [ wConfig.type , HARD_DRIVE_STRUCT[ wConfig.type ][ wConfig.last_played.last_pos ].name , 1 , 1 ]; 
			}

			var wCurrentSeason = ( wConfig.last_played[ wNextShowName ].rs_map[ 0 ] - 1 ); // offset for array-indexing
			var wNextEpisode = ( wConfig.last_played[ wNextShowName ].rs_map[ 1 ] + 1 );
			var wTotalEpisodesInCurrentSeason = ( HD_REF[ wConfig.type ][ wNextShowName ].items[ wCurrentSeason ] - 1 ); // offset for arr-indx
			var wNextSeason = wCurrentSeason;
			if ( wNextEpisode > wTotalEpisodesInCurrentSeason ) { wNextEpisode = 0; wNextSeason = wCurrentSeason + 1 }
			if ( ( wNextSeason + 1 ) > HD_REF[ wConfig.type ][ wNextShowName ].items.length ) { wNextSeason = 0; }

			return [
				wConfig.type ,
				HARD_DRIVE_STRUCT[ wConfig.type ][ wNextShowsPosition ].name ,
 				wNextSeason ,
 				wNextEpisode ,
			];

		}

		var wCurrentSeason = ( wConfig.last_played[ wLastPlayedShowsPosition ].rs_map[ 0 ] - 1 ); // offset for array-indexing
		var wNextEpisode = ( wConfig.last_played[ wLastPlayedShowsPosition ].rs_map[ 1 ] + 1 );
		var wTotalEpisodesInCurrentSeason = ( HD_REF[ wConfig.type ][ wLastPlayedShowsPosition ].items[ wCurrentSeason ] - 1 ); // offset for arr-indx
		var wNextSeason = wCurrentSeason;
		if ( wNextEpisode > wTotalEpisodesInCurrentSeason ) { wNextEpisode = 0; wNextSeason = wCurrentSeason + 1 }
		if ( ( wNextSeason + 1 ) > HD_REF[ wConfig.type ][ wLastPlayedShowsPosition ].items.length ) { wNextSeason = 0; }

		return [
			wConfig.type ,
			HARD_DRIVE_STRUCT[ wConfig.type ][ wConfig.last_played.last_pos ].name ,
			wNextSeason ,
 			wNextEpisode ,
		];

 	}

 	console.log( wConfig.type );
 	var wNowPlayingARGArray = build_NP_ArgArray();
 	console.log( wNowPlayingARGArray );

 	PLAY_FROM_REFERENCE_STRUCT( wNowPlayingARGArray );

}

function wStop() {
	var wLastTime = MPLAYER_MAN.stop();
	if ( !wLastTime || wLastTime === undefined ) { wLastTime = -1; }
	console.log( "LAST TIME = " + wLastTime );
	updateLastPlayed( wLastTime );
}

function wPause() {
	console.log( NOW_PLAYING_REF );
	var wLastTime = MPLAYER_MAN.pause();
	if ( !wLastTime || wLastTime === undefined ) { wLastTime = -1; }
	console.log( "LAST TIME = " + wLastTime );
	updateLastPlayed( wLastTime );
}


function wPlayNextByPosition( wSection ) {

}
// ====================================================================================================================================================
// ====================================================================================================================================================






// Initialization
async function BEGIN_INITIALIZATION() {
	
	// PURPLE Laptop with Seagate USB Drive	
	//HD_MOUNT_POINT = await FIND_USB_STORAGE_PATH_FROM_UUID( "2864E38A64E358D8" );
	
	wcl( HD_MOUNT_POINT );
	
	if ( NeedToUpdateHDStruct ) { 
		await UPDATE_HARD_DRIVE_FOLDER_STRUCT_SAVE_FILE(); 
		await wUpdate_Last_SS( "LocalVideo" , "REFERENCE" , HD_REF );
		console.log( HARD_DRIVE_STRUCT[ "LAST_PLAYED" ] );
		if ( NEED_TO_RESET_LP ) { await wUpdate_Last_SS( "LocalVideo" , "LAST_PLAYED" , HARD_DRIVE_STRUCT[ "LAST_PLAYED" ] ); }
		//await wUpdate_Last_SS( "LAST_PLAYED" , HARD_DRIVE_STRUCT[ "LAST_PLAYED" ] );
	}

}

module.exports.getAvailableMedia = ()=> { return HD_REF; }

module.exports.getCurrentTime 	= MPLAYER_MAN.getCurrentTime
module.exports.play 			= wPlay;
module.exports.pause 			= wPause;
module.exports.resume 			= wPause;
module.exports.stop 			= wStop;

module.exports.playNextByPosition = wPlayNextByPosition;