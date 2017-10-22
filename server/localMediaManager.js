require('shelljs/global');
const path = require("path");
const colors = require("colors");
const jsonfile = require("jsonfile");
const dirTree = require("./utils/dirtreeutil.js");
//const Filehound = require("filehound");
//const mime = require('mime');

function wcl( wSTR ) { console.log( colors.black.bgGreen( "[LOCAL_VIDEO_MAN] --> " + wSTR ) ); }
function wSleep( ms ) { return new Promise( resolve => setTimeout( resolve , ms ) ); }
function fixPathSpace( wFP ) {
	var fixSpace = new RegExp( " " , "g" );
	wFP = wFP.replace( fixSpace , String.fromCharCode(92) + " " );
	wFP = wFP.replace( ")" , String.fromCharCode(92) + ")" );
	wFP = wFP.replace( "(" , String.fromCharCode(92) + "(" );
	wFP = wFP.replace( "'" , String.fromCharCode(92) + "'" );
	return wFP;
}
function wGetDuration( wFP ) {
	try {
		wFP = fixPathSpace( wFP );
		var z1 = "ffprobe -v error -show_format -i " + wFP;
		var x1 = exec( z1 , { silent: true , async: false } );
		if ( x1.stderr ) { return( x1.stderr ); }
		var wMatched = x1.stdout.match( /duration="?(\d*\.\d*)"?/ );
		var f1 = Math.floor( wMatched[1] );
		return f1;
	}
	catch( error ) { console.log( error ); }
}

var wEmitter = require('../main.js').wEmitter;
var wUpdate_Last_SS = require( "./clientManager.js" ).edit_Last_SS;
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
		"TVShows": { always_advance_next_show: true , last_pos: 0 , locked_show: null } ,
		"Odyssey": { always_advance_next_show: true , last_pos: 0 , locked_show: null } ,
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
				q1 = q1 + "/";
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
			var wAcceptedFolders = [ "AudioBooks" , "Odyssey" , "DVDs" , "Movies" , "Music" , "Podcasts" , "TVShows" ];
			var wSTRUCT = await dirTree( HD_MOUNT_POINT );
			var wTMP = {};
			for ( var i = 0; i < wSTRUCT[ "children" ].length; ++i ) { for ( var j = 0; j < wAcceptedFolders.length; ++j ) {
				if ( wAcceptedFolders[ j ] === wSTRUCT[ "children" ][ i ].name ) {
					wTMP[ wAcceptedFolders[ j ] ] = wSTRUCT[ "children" ][ i ][ "children" ];
					wAcceptedFolders.splice( j , 1 );
				}
			} }
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
var ACTIVE = false;
var NOW_PLAYING_REF = null;
var NOW_PLAYING_DURATION = null;
var NOW_PLAYING_3PERCENT_LEFT = null;
var NP_CACHED_CONFIG = null;
var CONTINUOUS_PLAYING = true;
// ===============================================
// ===============================================

// STATE-CONTROLLERS
// ====================================================================================================================================================
// ====================================================================================================================================================
async function PLAY_FROM_REFERENCE_STRUCT( wArgArray ) {
	
	wcl( "WE WERE SENT AN ARG ARRAY FROM ABOVE !!!!" );
	wcl( wArgArray );

	var wSection = wArgArray[0] || null;
	var wName = wArgArray[1] || null;
	var wSeason = wArgArray[2];
	var wEpisode = wArgArray[3]; 
	var wSeek = wArgArray[4];
	if ( wSeek === -1  ) { wSeek = null; }

	NOW_PLAYING_REF = [ wSection , wName , wSeason , wEpisode ];

	wSeason = ( wSeason - 1 );
	wEpisode = ( wEpisode - 1 );

	var wPath = HARD_DRIVE_STRUCT[ "BASE_PATH" ] + wSection + "/" + wName;
	//console.log( wPath );

	// console.log( "Show POS = " + HD_REF[ wSection ][ wName ].pos.toString() );
	// console.log( HARD_DRIVE_STRUCT[ wSection ][ HD_REF[ wSection ][ wName ].pos ] );
	// console.log( HARD_DRIVE_STRUCT[ wSection ][ HD_REF[ wSection ][ wName ].pos ][ "children" ][ wSeason ][ "children" ][ wEpisode ] );
	// console.log( "Show Season = " + wSeason.toString() );
	// console.log( HARD_DRIVE_STRUCT[ wSection ][ HD_REF[ wSection ][ wName ].pos ]["children"][ wSeason ].name );

	if ( wSeason === 0 || wSeason ) {
		wPath = wPath + "/" + HARD_DRIVE_STRUCT[ wSection ][ HD_REF[ wSection ][ wName ].pos ][ "children" ][ wSeason ][ "name" ];
		wPath = wPath + "/" + HARD_DRIVE_STRUCT[ wSection ][ HD_REF[ wSection ][ wName ].pos ][ "children" ][ wSeason ][ "children" ][ wEpisode ].name;
	}

	wcl( "STARTING --> MPLAYER" );
	//console.log( wPath );
	
	MPLAYER_MAN.playFilePath( wPath );
	if ( wSeek ) {
		if ( wSeek >= 1 ) {
			await wSleep( 1000 );
			MPLAYER_MAN.seekSeconds( wSeek );
		}
	}
	
	NOW_PLAYING_DURATION = wGetDuration( wPath );
	NOW_PLAYING_3PERCENT_LEFT = Math.floor( ( NOW_PLAYING_DURATION - ( NOW_PLAYING_DURATION * 0.025 ) ) );

	wcl( "NOW_PLAYING_DURATION = " + NOW_PLAYING_DURATION.toString() );
	wcl( "NOW_PLAYING_3PERCENT_LEFT = " + NOW_PLAYING_3PERCENT_LEFT.toString() );
	wcl( "DIFFERENCE = " + Math.floor( ( NOW_PLAYING_DURATION * 0.025 ) ).toString() );

	var NP_HD_S_POS = HD_REF[ wSection ][ wName ].pos;
	//console.log( wName + "'s Position in HARD_DRIVE_STRUCT = " + NP_HD_S_POS.toString() + "\n" );
	//console.log( HARD_DRIVE_STRUCT[ wSection ][ NP_HD_S_POS ] );

	await wUpdate_Last_SS( "LocalMedia" , "LAST_PLAYED" , wSection , "last_pos" , NP_HD_S_POS );
	await updateLastPlayed( 1 );
	ACTIVE = true;

}

// wSection , wName , wSeason , wEpisode
async function updateLastPlayed( wTime ) {
	if ( NOW_PLAYING_REF !== null ) {
		if ( wTime === "completed" ) { wTime = NOW_PLAYING_DURATION; }
		var wCompleted = ( wTime >= NOW_PLAYING_3PERCENT_LEFT ) ? true : false;
		var wRemaining = ( NOW_PLAYING_DURATION - wTime );
		var wOBJ = {
			current_time: wTime ,
			remaining_time: wRemaining,
			duration: NOW_PLAYING_DURATION ,
			completed: wCompleted,
			rs_map: [ NOW_PLAYING_REF[2] , NOW_PLAYING_REF[3] ]
		};
		NP_CACHED_CONFIG[ NOW_PLAYING_REF[1] ] = wOBJ;
		await wUpdate_Last_SS( "LocalMedia" , "LAST_PLAYED" , NOW_PLAYING_REF[0] , NOW_PLAYING_REF[1] , wOBJ );
	}
}

function wPlay( wConfig ) {

 	function build_Next_Arg_Array() {

	 	console.log("");
	 	// Last Played Name *Show* Name
	 	var LP_Name = HARD_DRIVE_STRUCT[ wConfig.type ][ wConfig.last_played.last_pos ].name;

	 	// If we have an un-finished show still
	 	if ( !wConfig.last_played[ HARD_DRIVE_STRUCT[ wConfig.type ][ wConfig.last_played.last_pos ].name ].completed ) {
	 		//console.log("STAGE_1");
	 		return [ wConfig.type , LP_Name , wConfig.last_played[ LP_Name ].rs_map[ 0 ] , wConfig.last_played[ LP_Name ].rs_map[ 1 ] , wConfig.last_played[ LP_Name ].current_time ]; 
	 	}

		var LP_POS = wConfig.last_played.last_pos;
		var TOTAL_SHOWS_IN_SECTION = ( Object.keys( HD_REF[ wConfig.type ] ).length - 1 ); // offset for array-indexing
		console.log( "Total Shows In Section = " + TOTAL_SHOWS_IN_SECTION.toString() );
		
		// Testing ADDON-HACK
		// ====================================================
		// ====================================================
		//wConfig.last_played.always_advance_next_show = false;
		// ====================================================
		// ====================================================

		// If using DEFAULT method of always showing "Next" in line TV Show
		if ( wConfig.last_played.always_advance_next_show ) {
			console.log("STAGE_2 - Advance Next Show");
			var NEXT_POS = ( LP_POS + 1 );
			if ( NEXT_POS > TOTAL_SHOWS_IN_SECTION ) { NEXT_POS = 0; }
			var NEXT_SHOW_NAME = HARD_DRIVE_STRUCT[ wConfig.type ][ NEXT_POS ].name;
			console.log( "Next Pos = " + NEXT_POS.toString() );
			console.log( "Next Show Name = " + NEXT_SHOW_NAME );
			// If we have NEVER watched the "next" show
			if ( !wConfig.last_played[ NEXT_SHOW_NAME ] ) {
				return [ wConfig.type , HARD_DRIVE_STRUCT[ wConfig.type ][ NEXT_POS ].name , 1 , 1 ]; 
			}

			var CUR_SHOW_NAME = HARD_DRIVE_STRUCT[ wConfig.type ][ NEXT_POS ].name;
			var CUR_SEASON = ( wConfig.last_played[ CUR_SHOW_NAME ].rs_map[ 0 ] ); // offset for array-indexing
			var NEXT_EPISODE = ( wConfig.last_played[ CUR_SHOW_NAME ].rs_map[ 1 ] + 1 );
			var CUR_SEASON_TOTAL_EPISODES = ( HD_REF[ wConfig.type ][ CUR_SHOW_NAME ].items[ CUR_SEASON ] - 1 ); // offset for arr-indx
			var CUR_SHOW_TOTAL_SEASONS = HD_REF[ wConfig.type ][ CUR_SHOW_NAME ].items.length;
			if ( NEXT_EPISODE > CUR_SEASON_TOTAL_EPISODES ) { NEXT_EPISODE = 1; CUR_SEASON = CUR_SEASON + 1; }
			if ( CUR_SEASON > CUR_SHOW_TOTAL_SEASONS ) { CUR_SEASON = 1; }

			return [ wConfig.type , CUR_SHOW_NAME , CUR_SEASON , NEXT_EPISODE ];

		}

		//console.log("STAGE_3 - Get Next Episode");
		var CUR_SHOW_NAME = HARD_DRIVE_STRUCT[ wConfig.type ][ LP_POS ].name;
		var CUR_SEASON = ( wConfig.last_played[ CUR_SHOW_NAME ].rs_map[ 0 ] ); // offset for array-indexing
		var NEXT_EPISODE = ( wConfig.last_played[ CUR_SHOW_NAME ].rs_map[ 1 ] + 1 );
		var CUR_SEASON_TOTAL_EPISODES = ( HD_REF[ wConfig.type ][ CUR_SHOW_NAME ].items[ CUR_SEASON ] - 1 ); // offset for arr-indx
		var CUR_SHOW_TOTAL_SEASONS = HD_REF[ wConfig.type ][ CUR_SHOW_NAME ].items.length;
		if ( NEXT_EPISODE > CUR_SEASON_TOTAL_EPISODES ) { NEXT_EPISODE = 1; CUR_SEASON = CUR_SEASON + 1; }
		if ( CUR_SEASON > CUR_SHOW_TOTAL_SEASONS ) { CUR_SEASON = 1; }

		return [ wConfig.type , CUR_SHOW_NAME , CUR_SEASON , NEXT_EPISODE ];

 	}
 	
 	if ( !wConfig ) {
 		wConfig = NP_CACHED_CONFIG;
 	}
 	NP_CACHED_CONFIG = wConfig;
 	var wNowPlayingARGArray = null;
 	
 	// If We Have Never Watched Anything Before
	if ( Object.keys( wConfig.last_played ).length === 3 ) { wNowPlayingARGArray = [ wConfig.type , HARD_DRIVE_STRUCT[ wConfig.type ][ 0 ].name , 1 , 1 ]; }
 	else { wNowPlayingARGArray = build_Next_Arg_Array(); }

 	PLAY_FROM_REFERENCE_STRUCT( wNowPlayingARGArray );

}


function wStop( wSilentStop ) {
	if ( ACTIVE ) {
		var wLastTime = MPLAYER_MAN.silentStop();
		ACTIVE = false;
		wcl( "LAST TIME = " + wLastTime );
		updateLastPlayed( wLastTime );
	}
}

function wPause() {
	wcl( NOW_PLAYING_REF );
	var wLastTime = MPLAYER_MAN.pause();
	wcl( "LAST TIME = " + wLastTime );
	updateLastPlayed( wLastTime );
}

async function wNext( wConfig ) {
	if ( NP_CACHED_CONFIG !== null ) {
		wcl( "wNext() --> Get Next Episode" );
		var LP_POS = NP_CACHED_CONFIG.last_played.last_pos;
		var TOTAL_SHOWS_IN_SECTION = ( Object.keys( HD_REF[ NP_CACHED_CONFIG.type ] ).length - 1 );
		var CUR_SHOW_NAME = HARD_DRIVE_STRUCT[ NP_CACHED_CONFIG.type ][ LP_POS ].name;

		// console.log( NP_CACHED_CONFIG.last_played[ CUR_SHOW_NAME ] );
		// console.log("");
		// console.log( HARD_DRIVE_STRUCT[ NP_CACHED_CONFIG.type ][ LP_POS ] );
		// console.log("");
		
		var CUR_SEASON = NP_CACHED_CONFIG.last_played[ CUR_SHOW_NAME ].rs_map[ 0 ]; // offset for array-indexing
		var NEXT_EPISODE = ( NP_CACHED_CONFIG.last_played[ CUR_SHOW_NAME ].rs_map[ 1 ] + 1 );
		var CUR_SEASON_TOTAL_EPISODES = HD_REF[ NP_CACHED_CONFIG.type ][ CUR_SHOW_NAME ].items[ CUR_SEASON - 1 ];
		// console.log( "OUR CACHED TYPE === " + NP_CACHED_CONFIG.type );
		// console.log( "OUR CUR_SHOW_NAME === " + CUR_SHOW_NAME );
		// console.log( "CUR_SEASON === " + CUR_SEASON.toString() );
		// console.log( "AT THIS TIME NEXT_EPISODE === " + NEXT_EPISODE.toString() );
		// console.log( "We think CUR_SEASON_TOTAL_EPISODES === " + CUR_SEASON_TOTAL_EPISODES.toString() + " for some reason" );
		var CUR_SHOW_TOTAL_SEASONS = HD_REF[ NP_CACHED_CONFIG.type ][ CUR_SHOW_NAME ].items.length;
		if ( NEXT_EPISODE > CUR_SEASON_TOTAL_EPISODES ) { NEXT_EPISODE = 1; CUR_SEASON = CUR_SEASON + 1; }
		if ( CUR_SEASON > CUR_SHOW_TOTAL_SEASONS ) { CUR_SEASON = 1; }
		// console.log( "AT THIS TIME NEXT_EPISODE === " + NEXT_EPISODE.toString() );
		// console.log( "CUR_SEASON === " + CUR_SEASON.toString() );
		var x1 = [ NP_CACHED_CONFIG.type , CUR_SHOW_NAME , CUR_SEASON , NEXT_EPISODE ];
		
		NP_CACHED_CONFIG.last_played[ CUR_SHOW_NAME ].rs_map[ 0 ] = CUR_SEASON;
		NP_CACHED_CONFIG.last_played[ CUR_SHOW_NAME ].rs_map[ 1 ] = NEXT_EPISODE;

		wStop( true );
		await wSleep( 2000 );
		PLAY_FROM_REFERENCE_STRUCT( x1 );
	} 
}
async function wPrevious() {
	if ( NP_CACHED_CONFIG !== null ) {

		wcl( "wPrevious() --> Get Previous Episode" );

	 	var LP_Name = HARD_DRIVE_STRUCT[ NP_CACHED_CONFIG.type ][ NP_CACHED_CONFIG.last_played.last_pos ].name;
	 	var LP_POS = NP_CACHED_CONFIG.last_played.last_pos;
		var TOTAL_SHOWS_IN_SECTION = ( Object.keys( HD_REF[ NP_CACHED_CONFIG.type ] ).length - 1 ); // offset for array-indexing

		var CUR_SHOW_TOTAL_SEASONS = HD_REF[ NP_CACHED_CONFIG.type ][ LP_Name ].items.length;
		var CUR_SEASON = NP_CACHED_CONFIG.last_played[ LP_Name ].rs_map[ 0 ];
		var PREV_EPISODE = ( NP_CACHED_CONFIG.last_played[ LP_Name ].rs_map[ 1 ] - 1 );
		if ( PREV_EPISODE === 0 ) {
			//console.log( "PREV_EPISODE === 0" );
			CUR_SEASON = CUR_SHOW_TOTAL_SEASONS; 
			PREV_EPISODE = HD_REF[ NP_CACHED_CONFIG.type ][ LP_Name ].items[ CUR_SEASON - 1 ];
		}

		var x1 = [ NP_CACHED_CONFIG.type , LP_Name , CUR_SEASON , PREV_EPISODE ];
		NP_CACHED_CONFIG.last_played[ LP_Name ].rs_map[ 0 ] = CUR_SEASON;
		NP_CACHED_CONFIG.last_played[ LP_Name ].rs_map[ 1 ] = PREV_EPISODE;

		wStop( true );
		await wSleep( 1000 );
		PLAY_FROM_REFERENCE_STRUCT( x1 );

	}
}

function wOnNowPlayingOver( wResult ) {
	wcl( "THE VIDEO WE STARTED IS OVER !!!!!" );
	ACTIVE = false;
	NP_CACHED_CONFIG[ "last_played" ][ HARD_DRIVE_STRUCT[ NP_CACHED_CONFIG.type ][ NP_CACHED_CONFIG.last_played.last_pos ].name ].current_time = 0;
	NP_CACHED_CONFIG[ "last_played" ][ HARD_DRIVE_STRUCT[ NP_CACHED_CONFIG.type ][ NP_CACHED_CONFIG.last_played.last_pos ].name ].remaining_time = 0;
	NP_CACHED_CONFIG[ "last_played" ][ HARD_DRIVE_STRUCT[ NP_CACHED_CONFIG.type ][ NP_CACHED_CONFIG.last_played.last_pos ].name ].completed = true;
	updateLastPlayed( "completed" );
	//wNext();
	wPlay();

}
wEmitter.on( "MPlayerOVER" , wOnNowPlayingOver );
// ====================================================================================================================================================
// ====================================================================================================================================================






// Initialization
async function BEGIN_INITIALIZATION() {
	
	// PURPLE Laptop with Seagate USB Drive	
	HD_MOUNT_POINT = await FIND_USB_STORAGE_PATH_FROM_UUID( "2864E38A64E358D8" );
	
	wcl( HD_MOUNT_POINT );
	
	if ( NeedToUpdateHDStruct ) { 
		await UPDATE_HARD_DRIVE_FOLDER_STRUCT_SAVE_FILE(); 
		await wUpdate_Last_SS( "LocalMedia" , "REFERENCE" , HD_REF );
		console.log( HARD_DRIVE_STRUCT[ "LAST_PLAYED" ] );
		if ( NEED_TO_RESET_LP ) { await wUpdate_Last_SS( "LocalMedia" , "LAST_PLAYED" , HARD_DRIVE_STRUCT[ "LAST_PLAYED" ] ); }
		//await wUpdate_Last_SS( "LAST_PLAYED" , HARD_DRIVE_STRUCT[ "LAST_PLAYED" ] );
	}

}

module.exports.getAvailableMedia = ()=> { return HD_REF; }

module.exports.getCurrentTime 	= MPLAYER_MAN.getCurrentTime
module.exports.play 			= wPlay;
module.exports.pause 			= wPause;
module.exports.resume 			= wPause;
module.exports.stop 			= wStop;
module.exports.next 			= wNext;
module.exports.previous			= wPrevious;