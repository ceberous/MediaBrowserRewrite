const YTBASE = "YOU_TUBE.";
const YTLIVE = YTBASE + "LIVE."
const YTSTD = YTBASE + "STANDARD."
const YTCURRATED = YTBASE + "CURRATED."
const FOLLOWERS = "FOLLOWERS";
const BLACKLIST = "BLACKLIST";

const UNEQ = "UNEQ";
const NOW_PLAYING = "NOW_PLAYING_KEY";


const R_CONSTANTS = {
	YOU_TUBE: {
		BASE: YTBASE ,
		NOW_PLAYING_MODE: YTBASE + "NOW_PLAYING.MODE" ,
		NOW_PLAYING_KEY: YTBASE + NOW_PLAYING ,
		LIVE: {
			BASE: YTLIVE ,
			LATEST: YTLIVE + "LATEST" ,
			FOLLOWERS: YTLIVE + FOLLOWERS ,
			BLACKLIST: YTLIVE + BLACKLIST ,
		} ,
		STANDARD: {
			BASE: YTSTD ,
			LATEST: YTSTD + "LATEST" ,			
			FOLLOWERS: YTSTD + FOLLOWERS ,
			BLACKLIST: YTSTD + BLACKLIST ,
		} ,
		CURRATED: {
			BASE: YTCURRATED ,
			MAIN_LIST: YTCURRATED + "MAIN_LIST" ,
			PLAYLISTS: YTCURRATED + "PLAYLISTS."
		} ,
	}
};

module.exports = {

	USB_DRIVE_UUID: "2864E38A64E358D8" ,

	BUTTON_MAP: {
		0: { state: "YT_Live_Background" , options: {} } ,
		1: { session: "Mopidy_Foreground_YT_Live_Background" , options: { genre: "UNKNOWN" } } ,
		2: { session: "Mopidy_Foreground_YT_Live_Background" , options: { genre: "UNKNOWN"  } } ,
		3: { session: "Twitch_IF_Live_ELSE_YT_Standard_Foreground" , options: {} } ,
		4: { session: "Mopidy_Foreground_YT_Live_Background" , options: { genre: "UNKNOWN"  } } ,
		5: { session: "Mopidy_Foreground_YT_Live_Background" , options: { genre: "UNKNOWN"  } } ,
		6: { label: "stop" } ,
		7: { label: "pause" } ,
		8: { label: "previous" } ,
		9: { label: "next" } ,
		10: { state: "LocalMedia_Movie_Foreground" , options: {} } ,
		11: { session: "LocalMedia_Odyssey_Foreground_YT_Live_Background" , options: {} } ,
		12: { state: "LocalMedia_TV_Foreground" , options: { advance_show: "true" , specific_show: "false" , specific_episode: "false" } } ,
		13: { session: "YT_STD_Currated_THEN_Odyssey_And_YT_Live" , options: {} } ,
		14: { state: "YT_Standard_Foreground" , options: {} } ,
	} ,

	REDIS: {
		CONSTANTS: {
			YOU_TUBE: R_CONSTANTS.YOU_TUBE ,
		} ,
		SET_KEYS: {
			"CONFIG.ARRIVED_HOME": "false" ,
			"MOPIDY.STATE": "stopped" ,
			"YOU_TUBE.LIVE.FOLLOWERS" : [ "UCnM5iMGiKsZg-iOlIO2ZkdQ" , "UCakgsb0w7QB0VHdnCc-OVEA" , "UCZvXaNYIcapCEcaJe_2cP7A" ] ,
			"YOU_TUBE.LIVE.BLACKLIST" : [ "9zMpeUh6DXs" , "bNc7rGEBrMA" , "Mk9gQcHueeE" , "uyTAj1sbThg" , "cdKLSA2ke24" , "SwS3qKSZUuI" , "ddFvjfvPnqk" , "MFH0i0KcE_o" , 
			"nzkns8GfV-I" , "qyEzsAy4qeU" , "KIyJ3KBvNjA" , "FZvR0CCRNJg" , "q_4YW_RbZBw" , "pwiYt6R_kUQ" , "T9Cj0GjIEbw" ] ,
			"YOU_TUBE.STANDARD.FOLLOWERS": [ "UCk0UErv9b4Hn5ucNNjqD1UQ" , "UCKbVtAdWFNw5K7u2MZMLKIw"  ] ,
			"YOU_TUBE.STANDARD.BLACKLIST": [] ,
		} ,
		RESETS: [ "YOU_TUBE.LIVE.LATEST*" , "YOU_TUBE.STANDARD.LATEST*" ]
	} ,

	SCHEDULES: {

		STATE_TRANSITIONS: {
			arriveHome: {
				startPattern: "01 16 * * 1,2,3,5" ,
				endPattern: "01 18 * * 1,2,3,5" ,
				state: 11,
				stateOptions: null ,
				startConditions: { "CONFIG.ARRIVED_HOME": "false" } ,
				stopConditions: null ,
				startPID: null ,
				stopPID: null
			} ,
		} ,

		// Paths Must be **relative** to scheduleManager.js
		UPDATES: {
			gmusicPlaylistCache: {
				startPattern: "0 */3 * * *" , // every 1 hours
				startConditions: { "MOPIDY.STATE": "stopped" } ,
				functionPath: [ "utils" , "mopidy" ,"libraryManager.js" ] ,
				functionName: "updateCache" ,
				jobPID: null
			}
		}

	}

};