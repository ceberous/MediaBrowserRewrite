var wEmitter = require('../main.js').wEmitter;
var wUpdate_Last_SS = require( "./clientManager.js" ).update_Last_SS;

// https://github.com/akatrevorjay/mopidy-extras

// https://www.inpimation.com/installing-mopidy-raspberry-pi-2/ ??????
// https://docs.mopidy.com/en/latest/service/#service-management-on-debian
// https://docs.mopidy.com/en/latest/service/
// https://docs.mopidy.com/en/latest/service/#configure-pulseaudio

// fucking mopidy
// https://github.com/mopidy/mopidy-gmusic/issues/161
// pip install 'git+https://github.com/belak/mopidy@add-download-flag-to-playbin#egg=mopidy' --upgrade

// ??? https://github.com/mopidy/mopidy/commit/b1448f584f0d90a697a1978e458729a7175c1449

// this works: --> https://github.com/mopidy/mopidy/pull/1608/files#diff-41786cf21d61f8d773107bc83320f891 
// pip install 'git+https://github.com/belak/mopidy@add-download-flag-to-playbin#egg=mopidy' --upgrade
// -->> but requires mopidy to be run stand-alone aka not as a service 

// .... so....
// 1.) sudo pip install 'git+https://github.com/belak/mopidy@add-download-flag-to-playbin#egg=mopidy' --upgrade
// 2.) sudo pip install Mopidy-MusicBox-Webclient
// 3.) sudo pip install -U requests[security]
// 4.) sudo pip install mopidy-gmusic
// 5.) Change File --> /usr/local/lib/python2.7/dist-packages/gmusicapi/clients/mobileclient.py
// 							--> @ Line Number 143
//									self.android_id = self._validate_device_id(device_id, is_mac=is_mac)
// 							--> TO
//									self.android_id = "VALID_DEVICE_ID"

var colors = require("colors");
var path = require("path");
var jsonfile = require("jsonfile");
var Mopidy = require("mopidy");

function wcl( wSTR ) { console.log( colors.white.bgBlue( "[MOPIDY_MAN] --> " + wSTR ) ); }
function tryIgnoreError( wFunc ) { try { wFunc(); } catch( error ) { return; } }
function sleep( ms ) { return new Promise( resolve => setTimeout( resolve , ms ) ); }
function getRandomPropertyKey( wOBJ ) { var keys = Object.keys( wOBJ ); return keys[ keys.length * Math.random() << 0 ]; }
function getRandomArrayItem( wArray ) { return wArray[ Math.floor( Math.random() * wArray.length ) ]; }

var HOUR = 3600000;
var DAY = 86400000;

var mopidy = null;
Mopidy.prototype._handleWebSocketError = function (error) { console.log( "Mopdiy WebSocket ERROR" ); this._cleanup(); };
try {
	mopidy = new Mopidy({ 
		webSocketUrl: "ws://localhost:6690/mopidy/ws/",
		autoConnect: true,
		callingConvention: "by-position-or-by-name"
	});
	} catch( error ) { wcl( "ERROR --> Mopdiy Binary not Running !" ); }


var LIB_CACHE = null;
const LIB_CACHE_SFP = path.join( __dirname , "save_files" , "mopidyLibraryCache.json" );
function WRITE_LIBRARY_CACHE() { jsonfile.writeFileSync( LIB_CACHE_SFP , LIB_CACHE ); wcl( "UPDATED LIBRARY CACHE" ); }
var UPDATE_OVERRIDE = false;
try { LIB_CACHE = jsonfile.readFileSync( LIB_CACHE_SFP ); }
catch( error ) { wcl( error ); UPDATE_OVERRIDE = true; LIB_CACHE = { "lastUpdatedTime": null, "playlists": { "classic": {} , "edm": {} , "misc": {} , "relax": {} , "unknown": {} } }; WRITE_LIBRARY_CACHE(); }

var NOW_PLAYING = false;

var MM = {

	firstLaunchReady: false,

	init: function() {
		return new Promise( async function( resolve , reject ) {
			try {
				await MM.LIBRARY.init();
				await MM.PLAYBACK.init();
				await MM.TRACKLIST.init();
				resolve("success");
			}
			catch( error ) { wcl( error ); reject( error ); }
		});		
	},

	shutdown: async function() {
		if ( mopidy ) {
			tryIgnoreError( MM.PLAYBACK.stop );
			tryIgnoreError( mopidy.close );
			tryIgnoreError( mopidy.off );
		}
		mopidy = null;
		wcl( "CLOSED" );
		//await sleep( 1000 );
		//process.exit(1);
	},

	startNewTask: async function( wTaskName , wOption1 , wOption2 ) {

		switch( wTaskName ) {
			case "buildAndPlayRandomGenreList":
				var x1 = await MM.buildAndPlayRandomGenreList( wOption1 , wOption2 );
				if ( x1 === "success" ) { NOW_PLAYING = true; NOW_PLAYING_IDX = 0; }
				break;
			case "playRandomListFromGenre":
				MM.TRACKLIST.loadRandomList( wOption1 ); // genre
				break;
			default:
				break;
		}

	},	

	buildAndPlayRandomGenreList: function( wGenre , wListName ) {
		return new Promise( async function( resolve , reject ) {
			try {
				var x1 = await MM.LIBRARY.buildRandomGenreList( wGenre , wListName );
				if ( x1 !== "success" ) { reject( "failure" ); }
				var x2 = await MM.TRACKLIST.loadListID( wGenre , wListName );
				if ( x2 !== "success" ) { reject( "failure" ); }
				resolve( "success" );
			}
			catch( error ) { console.log( error ); reject( error ); }
		});
	},

	LIBRARY: {

		init: function() {
			return new Promise( async function( resolve , reject ) {
				try {
					await sleep( 1000 );
					await MM.LIBRARY.updateCache();
					//MM.LIBRARY.printCachedStations();
					resolve("success");
				}
				catch( error ) { wcl( error ); reject(error); }
			});
		},

		updateCache:  function() {

			return new Promise( function( resolve , reject ) {

				var timeNow = new Date().getTime();
				var wDiff = ( timeNow - LIB_CACHE.lastUpdatedTime );

				if ( !UPDATE_OVERRIDE && wDiff < HOUR ) { wcl( "already updated playlist cache this hour" ); resolve( "success" ); }

				mopidy.playlists.getPlaylists().then( function( playlists ) {

					for ( var i = 0; i < playlists.length; ++i ) {

						var wKey = playlists[i].uri.split( "gmusic:playlist:" )[1];

						if ( wKey === "promoted" || wKey === "IFL" || wKey === undefined ) { continue; }

						var wGenre = "unknown";
						var alreadyExists = false;
						for ( var eGenre in LIB_CACHE[ "playlists" ] ) {
							if ( wKey in LIB_CACHE[ "playlists" ][ eGenre ] ) { alreadyExists = true; wGenre = eGenre;  }
						}

						if ( !alreadyExists ) { 
							LIB_CACHE.playlists[ wGenre ][ wKey ] = { skipCount: 0 , playCount: 0 };
						}

						LIB_CACHE.playlists[ wGenre ][ wKey ].name = playlists[i].name;
						LIB_CACHE.playlists[ wGenre ][ wKey ].playlistModel = playlists[i];

					}

					timeNow = new Date().getTime();
					LIB_CACHE.lastUpdatedTime = timeNow;
					WRITE_LIBRARY_CACHE();
					resolve();

				})
				.catch( function( wError ) {
					wcl( "ERROR --> " + wError );
					reject();
				});

			});

		},

		printCachedStations: function() {
			for ( wGenre in LIB_CACHE.playlists ) {
				for ( wKey in LIB_CACHE.playlists[ wGenre ] ) {
					wcl( LIB_CACHE.playlists[ wGenre ][ wKey ].name + " = " + LIB_CACHE.playlists[ wGenre ][ wKey ].playlistModel.uri );
				}
			}
		},

		getCachedPlaylists: function() {
			var wResults = {};
			for ( wGenre in LIB_CACHE.playlists ) {
				for ( wKey in LIB_CACHE.playlists[ wGenre ] ) {
					wResults[ wKey ] = { name: LIB_CACHE.playlists[ wGenre ][ wKey ].name , genre: wGenre };
				}
			}
			return wResults;
		},

		updatePlaylistGenre:  function( wPlaylistID , wOldGenre , wNewGenre ) {

			wcl( "UPDATING --> " + wPlaylistID + " <-- FROM " + wOldGenre + " TO --> " + wNewGenre );
			return new Promise( function( resolve , reject ) {
				try {
					LIB_CACHE[ "playlists" ][ wNewGenre ][ wPlaylistID ] = LIB_CACHE[ "playlists" ][ wOldGenre ][ wPlaylistID ];
					delete LIB_CACHE[ "playlists" ][ wOldGenre ][ wPlaylistID ];
					WRITE_LIBRARY_CACHE();
					resolve("success");
				}
				catch( error ) { wcl( error ); reject( "error" ); }
			});

		},

		getRandomSong: function( wGenre ) {
			var wTL_ID = getRandomPropertyKey( LIB_CACHE[ "playlists" ][ wGenre ] );
			return getRandomArrayItem( LIB_CACHE[ "playlists" ][ wGenre ][ wTL_ID ]["playlistModel"]["tracks"] );
		},

		buildRandomGenreList: function( wGenre , wListName ) {
			return new Promise( function( resolve , reject ) {
				try {
					var wInstanceIDS = [];
					var wNewTrackList = [];
					for ( var i = 0; i < 25; ++i ) {
						var wIUI = false;
						var x1 = null;
						while( !wIUI ) {
							x1 = MM.LIBRARY.getRandomSong( wGenre );
							var wIUI2 = true;
							for ( var j = 0; j < wInstanceIDS.length; ++j ) { if ( wInstanceIDS[ j ] === x1["album"]["uri"] ) { wIUI2 = false; } }
							if ( wIUI2 = true ) { wIUI = true; }
						}
						wNewTrackList.push( x1 );
					}
					LIB_CACHE[ "playlists" ][ wGenre ][ wListName ] = { 
						skipCount: 0,
						playCount: 0,
						name: wListName,
						playlistModel: { tracks: wNewTrackList }
					};
					WRITE_LIBRARY_CACHE();
					resolve( "success" );
				}
				catch( error ) { console.log( error ); reject( error ); }
			});
		},

		deleteCachedList: function( wGenre , wListName ) {
			return new Promise( function( resolve , reject ) {
				try {
					delete LIB_CACHE[ "playlists" ][ wGenre ][ wListName ];
					WRITE_LIBRARY_CACHE();
					resolve( "success" );
				}
				catch( error ) { console.log( error ); reject( error ); }
			});
		},

		resetGenre: function( wGenre ) {
			return new Promise( function( resolve , reject ) {
				try {
					delete LIB_CACHE[ "playlists" ][ wGenre ];
					LIB_CACHE[ "playlists" ][ wGenre ] = {};
					WRITE_LIBRARY_CACHE();
					resolve( "success" );
				}
				catch( error ) { console.log( error ); reject( error ); }
			});
		},		

	},

	PLAYBACK: {

		STATE: null,
		CURRENT_TIME: null,
		CURRENT_TRACK: null,

		init:  function() {
			return new Promise( async function( resolve , reject ) {
				if ( !mopidy || mopidy === null ) { reject( "mopidy not available" ); }
				try {
					await MM.PLAYBACK.getState();
					resolve("success");
				}
				catch( error ) { wcl( error ); reject( error ); }
			});
		},

		getState: function() {
			return new Promise( function( resolve , reject ) {
				if ( !mopidy || mopidy === null ) { reject( "mopidy not available" ); }
				try {
					mopidy.playback.getState().then( function ( state ) {
						wcl( "STATE = " + state );
						MM.PLAYBACK.STATE = state;
						resolve("success");
				    });
				}
				catch( error ) { wcl( error ); reject(error); }
			});
		},

		getTimePosition: function() {
			return new Promise( function( resolve , reject ) {
				if ( !mopidy || mopidy === null ) { reject( "mopidy not available" ); }
				try {
					mopidy.playback.getTimePosition().then( function ( timePosition ) {
						wcl( "CURRENT-TIME = " + timePosition.toString() );
						MM.PLAYBACK.CURRENT_TIME = timePosition;
						resolve();
					});
				}
				catch( error ) { console.log( error ); reject( error ); }
			});
		},

		getCurrentState: function() {
			return new Promise( function( resolve , reject ) {
				if ( !mopidy || mopidy === null ) { reject( "mopidy not available" ); }
				try {
					mopidy.playback.getState().then( function ( wTrack ) {
						wcl( "CURRENT TRACK = " + wTrack );
						MM.PLAYBACK.CURRENT_TRACK = wTrack;
						resolve("success");
				    });
				}
				catch( error ) { console.log( error ); reject( error ); }
			});
		},

		getCurrentTrackIndex: function() {
			return new Promise( function( resolve , reject ) {
				try { mopidy.tracklist.index( {} ).then( function( data ) { resolve( data ); }).catch( function( wERR ) { reject( wERR ); } );	}
				catch( error ) { console.log( error ); reject( error ); }
			});
		},

		getCurrentTrack: function() {
			return new Promise( function( resolve , reject ) {
				if ( !mopidy || mopidy === null ) { reject( "mopidy not available" ); }
				try {
					mopidy.playback.getCurrentTrack()
					.then( function ( wTrack ) { resolve( wTrack ); } )
					.catch( function( wERR ) { reject( wERR ); } );
				}
				catch( error ) { console.log( error ); reject( error ); }
			});
		},

		play: function() {
			return new Promise( function( resolve , reject ) {
				if ( !mopidy || mopidy === null ) { reject( "mopidy not available" ); }
				try {
					mopidy.playback.play().then( function ( something ) {
						resolve("success");
					});
				}
				catch( error ) { console.log( error ); reject( error ); }
			});
		},

		pause: function() {
			return new Promise( function( resolve , reject ) {
				if ( !mopidy || mopidy === null ) { reject( "mopidy not available" ); }
				try {
					mopidy.playback.pause().then( function ( something ) {
						resolve("success");
					});
				}
				catch( error ) { console.log( error ); reject( error ); }
			});
		},

		resume: function() {
			return new Promise( function( resolve , reject ) {
				if ( !mopidy || mopidy === null ) { reject( "mopidy not available" ); }
				try {
					mopidy.playback.resume().then( function ( something ) {
						resolve("success");
					});
				}
				catch( error ) { console.log( error ); reject( error ); }
			});			
		},

		stop: function() {
			return new Promise( function( resolve , reject ) {
				if ( !mopidy || mopidy === null ) { reject( "mopidy not available" ); }
				try {
					mopidy.playback.stop().then( function ( something ) {
						resolve("success");
					});
				}
				catch( error ) { console.log( error ); reject( error ); }
			});
		},

		next: function() {
			return new Promise( function( resolve , reject ) {
				if ( !mopidy || mopidy === null ) { reject( "mopidy not available" ); }
				try {
					mopidy.playback.next().then( function ( something ) {
						resolve("success");
					});
				}
				catch( error ) { console.log( error ); reject( error ); }
			});
		},

		previous: function() {
			return new Promise( function( resolve , reject ) {
				if ( !mopidy || mopidy === null ) { reject( "mopidy not available" ); }
				try {
					mopidy.playback.previous().then( function ( something ) {
						resolve("success");
					});
				}
				catch( error ) { console.log( error ); reject( error ); }
			});
		}

	},

	TRACKLIST: {

		RANDOM: false,

		init: function() {
			return new Promise( async function( resolve , reject ) {
				try {
					resolve();
				}
				catch( error ) { wcl( error ); reject( error ); }
			});
		},

		setConsumeMode: function( wBool ) {
			return new Promise( function( resolve , reject ) {
				try { mopidy.tracklist.setConsume( wBool ).then( function( result ) { resolve( result ); } ); }
				catch( error ) { wcl( error ); reject( error ); }
			});
		},

		getRandomMode: function() {
			return new Promise( function( resolve , reject ) {
				try { mopidy.tracklist.getRandom().then( function( result ){ MM.TRACKLIST.RANDOM = result; resolve( result ); } ); } 
				catch( error ) { wcl( error ); reject( error ); }
			});
		},

		setRandomMode: function( wBool ) {
			return new Promise( function( resolve , reject ) {
				try { mopidy.tracklist.setRandom( wBool ).then( function( result ) { resolve( result ); } ); }
				catch( error ) { wcl( error ); reject( error ); }
			});			
		},

		clearTrackList: function() {
			return new Promise( function( resolve , reject ) {
				try { mopidy.tracklist.clear().then( function( result ) { resolve( "success" ); } ); }
				catch( error ) { wcl( error ); reject( error ); } 
			});
		},

		loadTrackList: function( wTrackList ) {
			//https://github.com/Lesterpig/mopidy-party/blob/master/mopidy_party/static/controller.js
			// ^^^^^^ $scope.addTrack = function(track){
			return new Promise( function( resolve , reject ) {
				try { mopidy.tracklist.add( { tracks: wTrackList } ).then( function( result ) { resolve( "success" ); } ); }
				catch( error ) { wcl( error ); reject( error ); } 
			});
		},

		loadRandomList: function( wGenre ) {
			return new Promise( async function( resolve , reject ) {
				try {
					
					var wS1 = await MM.TRACKLIST.clearTrackList();
					if ( wS1 !== "success" ) {  reject( "failure" ); }

					var wTL_ID = getRandomPropertyKey( LIB_CACHE[ "playlists" ][ wGenre ] );
					var wS2 = await MM.TRACKLIST.loadTrackList( LIB_CACHE[ "playlists" ][ wGenre ][ wTL_ID ][ "playlistModel" ]["tracks"] );
					if ( wS2 !== "success" ) { reject( "failure" ); }

					var wS3 = await MM.PLAYBACK.play();
					if ( wS3 !== "success" ) {  reject( "failure" ); }

					resolve( "success" );
				}
				catch( error ) { wcl( error ); reject( error ); }
			});
		},

		loadListID: function( wGenre , wID ) {
			return new Promise( async function( resolve , reject ) {
				try {

					var wS1 = await MM.TRACKLIST.clearTrackList();
					if ( wS1 !== "success" ) {  reject( "failure" ); }

					var wS2 = await MM.TRACKLIST.loadTrackList( LIB_CACHE[ "playlists" ][ wGenre ][ wID ][ "playlistModel" ]["tracks"] );
					if ( wS2 !== "success" ) { reject( "failure" ); }

					var wS3 = await MM.PLAYBACK.play();
					if ( wS3 !== "success" ) {  reject( "failure" ); }					

					resolve( "success" );
				}
				catch( error ) { console.log( error ); reject( error ); }
			});
		},

	}

}


mopidy.on( 'state:online' , async function () {
    var x1 = await MM.init();
    wcl( "Connected !" );
    if ( x1 === "success" ) { await wUpdate_Last_SS( "Mopidy" , "active" , true ); }
    else { await wUpdate_Last_SS( "Mopidy" , "active" , false ); }
});

mopidy.on( 'event:trackPlaybackEnded' , async function ( wEvent ) {
	wcl( "PLAYBACK --> ENDED" );
	var wCTIDX = await MM.PLAYBACK.getCurrentTrackIndex();
	console.log( "PLAYBACK --> CURRENT_INDEX --> " + wCTIDX );	
});

mopidy.on( 'event:trackPlaybackStarted' , async function ( wEvent ) {
	await sleep( 1000 );
	var wCT = await MM.PLAYBACK.getCurrentTrack();
	wcl( "PLAYBACK --> STARTED || CURRENT-TRACK --> " );
	//wEmitter.emit( "update_Last_SS" , "Mopidy" , "nowPlaying" , wCT );
	await wUpdate_Last_SS( "Mopidy" , "nowPlaying" , wCT );
	console.log( wCT );
});

mopidy.on( 'event:playbackStateChanged' , async function ( wEvent ) {
	await sleep( 3000 );
	wcl( "PLAYBACK --> CHANGED --> " );
	console.log( wEvent );
	var wCTIDX = await MM.PLAYBACK.getCurrentTrackIndex();
	console.log( "PLAYBACK --> CURRENT_INDEX --> " + wCTIDX );

	if ( wCTIDX === null ) { /* start next playlist of CURRENT_ACTION type */ }
});

module.exports.buildAndPlayRandomGenreList = function( wGenre , wListName ) { return MM.buildAndPlayRandomGenreList( wGenre , wListName ); }

module.exports.buildRandomGenreList = function( wGenre , wListName ) { return MM.LIBRARY.buildRandomGenreList( wGenre , wListName ) };

module.exports.deleteCachedList = function( wGenre , wListName ) { return MM.LIBRARY.deleteCachedList( wGenre , wListName ) };

module.exports.resetGenre = function( wGenre ) { return MM.LIBRARY.resetGenre( wGenre ) };

module.exports.randomPlaylist = function( wGenre ) { return MM.TRACKLIST.loadRandomList( wGenre ) };

module.exports.loadPlaylistID = function( wGenre , wID ) { return MM.TRACKLIST.loadListID( wGenre , wID ) };

module.exports.getCachedPlaylists = function() { return MM.LIBRARY.getCachedPlaylists(); };

module.exports.updatePlaylistGenre = function( wPlaylistID , wOldGenre , wNewGenre ) { return MM.LIBRARY.updatePlaylistGenre( wPlaylistID , wOldGenre , wNewGenre ); };

module.exports.shutdown = function() { MM.shutdown(); };
//module.exports.freshenUP = function() { MM.PLAYBACK.stop();  };

module.exports.startNewTask = MM.startNewTask;

module.exports.pause = function() { MM.PLAYBACK.pause(); };
module.exports.resume = function() { MM.PLAYBACK.resume(); };
module.exports.stop = function() { MM.PLAYBACK.stop(); };
module.exports.previousSong = function() { MM.PLAYBACK.previous(); };
module.exports.nextSong = function() { MM.PLAYBACK.next(); };

// process.on('SIGINT', function () {
// 	wcl( "Shutting Down" );
// 	MM.shutdown();
// });