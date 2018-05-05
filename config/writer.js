const fs = require( "fs" );
const path = require( "path" );


const GENERIC = {
	MEDIA_MOUNT_POINT: {
		//UUID: "2864E38A64E358D8" ,
		//LOCAL_PATH: "/home/morpheous/TMP2/EMULATED_MOUNT_PATH" ,
		LOCAL_PATH: "/home/morpheous/TMP2/EMULATED_MOUNT_POINT/MEDIA_MANAGER/" ,
		//UUID: "B40C6DD40C6D9262" , // Toshiba 1tb
	}
};

const BUTTONS = {
		0: { state: "YT_Live_Background" , options: {} } ,
		1: { session: "Mopidy_Foreground_YT_Live_Background" , options: { genre: "UNKNOWN" } } ,
		2: { session: "Mopidy_Foreground_YT_Live_Background" , options: { genre: "UNKNOWN" }  } ,
		3: { session: "Twitch_IF_Live_ELSE_YT_Standard_Foreground" , options: {} } ,
		4: { state: "Discord_Call_Foreground" , options: { users: [ "DISCORD.CALLE1" ] } } ,
		5: { state: "Discord_Call_Foreground" , options: { users: [ "DISCORD.CALLE2" ] } } ,
		6: { label: "stop" } ,
		7: { label: "pause" } ,
		8: { label: "previous" } ,
		9: { label: "next" } ,
		10: { state: "LocalMedia_Movie_Foreground" , options: {} } ,
		11: { session: "LocalMedia_Odyssey_Foreground_YT_Live_Background" , options: {} } ,
		12: { state: "LocalMedia_Foreground" , options: { genre: "TVShows" , advance_show: "true" , specific_show: "false" , specific_episode: "false" } } ,
		13: { session: "YT_Currated_THEN_Odyssey_Foreground_YT_Live_Background" , options: {} } ,
		14: { state: "YT_Standard_Foreground" , options: {} } ,
		15: { state: "Instagram_Background" , options: {} } ,
		//16: { state: "YT_Playlist_Foreground" , options: { playlist: "https://www.youtube.com/playlist?list=PLcW8xNfZoh7cxWFftCwzHJA3foHba1SzF" } } ,
		16: { state: "YT_Playlist_Foreground" , options: { playlist_id: "PLcW8xNfZoh7cxWFftCwzHJA3foHba1SzF" } } ,
};


const REDIS = {
	CONNECTION: {
		HOST: "localhost" ,

		// Purple
		// PORT: "6379" ,
		// DATABASE_NUM: 0 ,
		
		// Here
		PORT: "6379" , 
		DATABASE_NUM: 3 ,
	}
};

const SCHEDULES = {

	STATE_TRANSITIONS: {
		arriveHome: {
			startPattern: "01 16 * * 1,2,3,5" ,
			endPattern: "01 18 * * 1,2,3,5" ,
			state: 13,
			stateOptions: null ,
			startConditions: { "STATUS.LOCAL_MEDIA": "ONLINE" , "CONFIG.ARRIVED_HOME": "false" } ,
			stopConditions: null ,
		} ,
	} ,

	// Paths Must be **relative** to scheduleManager.js
	UPDATES: {
		gmusicPlaylistCache: {
			startPattern: "01 */3 * * *" , // every 3 hours
			startConditions: { "STATUS.MOPIDY": "ONLINE" , "MOPIDY.STATE": "stopped" } ,
			functionPath: [ "utils" , "mopidy" ,"libraryManager.js" ] ,
			functionName: "updateCache" ,
		} ,
		// youtubeStandardList: {
		// 	startPattern: "01 */9 * * *" , // every 9 hours
		// 	startCondeitions: {} ,
		// 	functionPath: [ "/YOUTUBE/standard.js" ] ,
		// 	functionName: "update" ,
		// } ,
	}

};

const YOUTUBE = {
	LIVE: {
		FOLLOWERS: [
			{
				name : "" ,
				id: "UCnM5iMGiKsZg-iOlIO2ZkdQ"
			} ,
			{
				name : "" ,
				id: "UCakgsb0w7QB0VHdnCc-OVEA"
			} ,
			{
				name : "" ,
				id: "UCZvXaNYIcapCEcaJe_2cP7A"
			} ,
			{
				name : "" ,
				id: "UCUPn5IEQugMf_JeNJOV9p2A"
			} ,			

		] ,
		BLACKLIST: [ "N5UUv-tgyDg" , "9zMpeUh6DXs" , "bNc7rGEBrMA" , "Mk9gQcHueeE" , "uyTAj1sbThg" , "cdKLSA2ke24" , "SwS3qKSZUuI" , "ddFvjfvPnqk" , "MFH0i0KcE_o" , "nzkns8GfV-I" , "qyEzsAy4qeU" , "KIyJ3KBvNjA" , "FZvR0CCRNJg" , "q_4YW_RbZBw" , "pwiYt6R_kUQ" , "T9Cj0GjIEbw" ] ,
	} ,
	STANDARD: {
		FOLLOWERS: [
			{
				name : "" ,
				id: "UCk0UErv9b4Hn5ucNNjqD1UQ"
			} ,
			{
				name : "" ,
				id: "UCKbVtAdWFNw5K7u2MZMLKIw"
			} ,		
		] ,
		BLACKLIST: [] ,
	}
};

const INSTAGRAM = [
	"ceberous"
];

fs.writeFileSync( path.join( __dirname , "generic.json" )  , JSON.stringify( GENERIC , null , 4 ) );
fs.writeFileSync( path.join( __dirname , "buttons.json" )  , JSON.stringify( BUTTONS , null , 4 ) );
fs.writeFileSync( path.join( __dirname , "redis.json" )  , JSON.stringify( REDIS , null , 4 ) );
fs.writeFileSync( path.join( __dirname , "schedules.json" )  , JSON.stringify( SCHEDULES , null , 4 ) );
fs.writeFileSync( path.join( __dirname , "youtube.json" )  , JSON.stringify( YOUTUBE , null , 4 ) );
fs.writeFileSync( path.join( __dirname , "instagram.json" )  , JSON.stringify( INSTAGRAM , null , 4 ) );