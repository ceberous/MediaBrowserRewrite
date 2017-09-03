//var wEmitter = require('../main.js').wEmitter;
var wUpdate_Last_SS = require( "./clientManager.js" ).update_Last_SS;
require('shelljs/global');
const path = require("path");
const colors = require("colors");
const jsonfile = require("jsonfile");
const dirTree = require("./utils/dirtreeutil.js");
//const Filehound = require("filehound");
//const mime = require('mime');

const MPLAYER_MAN = require( "./utils/mplayerManager.js" );

function wcl( wSTR ) { console.log( colors.black.bgGreen( "[LOCAL_VIDEO_MAN] --> " + wSTR ) ); }
function wSleep( ms ) { return new Promise( resolve => setTimeout( resolve , ms ) ); }

var NeedToUpdateHDStruct = true;
var HD_MOUNT_POINT = "/home/morpheous/TMP2/EMULATED_MOUNT_PATH/";
var HARD_DRIVE_STRUCT = {};
var HARD_DRIVE_REFERENCE_STRUCT = {};
var LAST_PLAYED = {};
var NEED_TO_RESET_LP = false;
const HARD_DRIVE_STRUCT_FP = path.join( __dirname , "save_files" , "hdFolderStructure.json" );
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
		"AudioBooks": { by_pos: 0 , time: 0 , rs_map: [] },
		"DVDs": { by_pos: 0 , time: 0 , rs_map: [] },
		"Movies": { by_pos: 0 , time: 0 , rs_map: [] },
		"Music": { by_pos: 0 , time: 0 , rs_map: [] },
		"Podcasts": { by_pos: 0 , time: 0 , rs_map: [] },
		"TVShows": { by_pos: 0 , time: 0 , rs_map: [] }	
	};
	NEED_TO_RESET_LP = true;
	await WRITE_HARD_DRIVE_STRUCT_FILE(); 
	BEGIN_INITIALIZATION();
}
try { HARD_DRIVE_STRUCT = jsonfile.readFileSync( HARD_DRIVE_STRUCT_FP ); BEGIN_INITIALIZATION(); }
catch ( error ){ 
	INITIALIZE_HARD_DRIVE_STRUCT_FILE();
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

				var x1 = wOUT[i].split(" ")[1];
				if ( x1 === undefined ) { continue; }
				var x2 = x1.split( "UUID=" )[1];
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

				resolve( q1 );
			}

			
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function BUILD_HARD_DRIVE_REFERENCE_STRUCT() {
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
	HARD_DRIVE_REFERENCE_STRUCT = media_struct;
	HARD_DRIVE_STRUCT[ "REFERENCE" ] = HARD_DRIVE_REFERENCE_STRUCT;
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
			BUILD_HARD_DRIVE_REFERENCE_STRUCT();
			WRITE_HARD_DRIVE_STRUCT_FILE();
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function PLAY_FROM_REFERENCE_STRUCT( wSection , wName , wSeason , wEpisode ) {
	wSeason = ( wSeason - 1 );
	wEpisode = ( wEpisode - 1 );
	var wPath = HARD_DRIVE_STRUCT[ "BASE_PATH" ] + wSection + "/" + wName;
	//console.log( wPath );
	if ( wSeason ) {
		wPath = wPath + "/" + HARD_DRIVE_STRUCT[ wSection ][ HARD_DRIVE_REFERENCE_STRUCT[ wSection ][ wName ].pos ][ "children" ][ wSeason ][ "name" ];
		if ( wEpisode ) {
			wPath = wPath + "/" + HARD_DRIVE_STRUCT[ wSection ][ HARD_DRIVE_REFERENCE_STRUCT[ wSection ][ wName ].pos ][ "children" ][ wSeason ][ "children" ][ wEpisode ].name;
		}
	}
	wcl( "STARTING --> \n" + wPath );
	MPLAYER_MAN.playFilePath( wPath );
}

// Initialization
async function BEGIN_INITIALIZATION() {
	
	//HD_MOUNT_POINT = await FIND_USB_STORAGE_PATH_FROM_UUID( "2864E38A64E358D8" );
	wcl( HD_MOUNT_POINT );
	
	if ( NeedToUpdateHDStruct ) { 
		await UPDATE_HARD_DRIVE_FOLDER_STRUCT_SAVE_FILE(); 
		await wUpdate_Last_SS( "LocalVideo" , "REFERENCE" , HARD_DRIVE_REFERENCE_STRUCT );
		await wUpdate_Last_SS( "LocalVideo" , "LAST_PLAYED" , HARD_DRIVE_STRUCT[ "LAST_PLAYED" ] );
	}

}

function wStop() {
	var wLastTime = MPLAYER_MAN.stop();
	console.log( "LAST TIME = " + wLastTime );
}

function wPause() {
	var wLastTime = MPLAYER_MAN.pause();
	console.log( "LAST TIME = " + wLastTime );
}

module.exports.getAvailableMedia = ()=> { return HARD_DRIVE_REFERENCE_STRUCT; }

module.exports.getCurrentTime 	= MPLAYER_MAN.getCurrentTime
module.exports.play 			= PLAY_FROM_REFERENCE_STRUCT;
module.exports.pause 			= wPause;
module.exports.resume 			= wPause;
module.exports.stop 			= wStop;