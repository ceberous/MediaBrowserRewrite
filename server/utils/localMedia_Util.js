
const FS = require( "fs" );
const PATH = require( "path" );
require( "shelljs/global" );

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


var sd = null;
var fr = {};
function safeReadDirSync(r){var n={};try{n=FS.readdirSync(r)}catch(c){if("EACCES"==c.code)return null;throw c}return n}
function directoryTree_Stage1(e,r,n){var t,i=PATH.basename(e),a={name:i};try{t=FS.statSync(e)}catch(u){return null}if(t.isFile()){PATH.extname(e).toLowerCase()}else{if(!t.isDirectory())return null;var l=safeReadDirSync(e);if(null===l)return null;a.children=l.map(function(t){return directoryTree_Stage1(PATH.join(e,t),r,n)}).filter(function(e){return!!e})}return a}
function directoryTree_Stage2(){for(var e=0;e<sd.children.length;++e){fr[sd.children[e].name]={};for(var d=0;d<sd.children[e].children.length;++d)if(fr[sd.children[e].name][sd.children[e].children[d].name]=[],sd.children[e].children[d].children)for(var a=0;a<sd.children[e].children[d].children.length;++a){var r=[];if(sd.children[e].children[d].children[a].children)for(var n=0;n<sd.children[e].children[d].children[a].children.length;++n)r.push(sd.children[e].children[d].children[a].children[n].name);fr[sd.children[e].name][sd.children[e].children[d].name].push(r)}}}


async function BUILD_HD_REF( wMountPoint ) {
	sd = directoryTree_Stage1( wMountPoint );
	directoryTree_Stage2();
	return fr;
}



module.exports.fixPathSpace = fixPathSpace;
module.exports.getDuration = wGetDuration;
module.exports.findAndMountUSB_From_UUID = FIND_USB_STORAGE_PATH_FROM_UUID;
module.exports.buildHardDriveReference = BUILD_HD_REF;
