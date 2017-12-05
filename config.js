const YTBASE = "YOU_TUBE.";
const YTLIVE = YTBASE + "LIVE."
const YTSTD = YTBASE + "STANDARD."
const YTCURRATED = YTBASE + "CURRATED."
const FOLLOWERS = "FOLLOWERS";
const BLACKLIST = "BLACKLIST";
const LATEST = "LATEST";
const NOW_PLAYING_KEY = "NOW_PLAYING_KEY";

const INSTAGRAM = "INSTAGRAM.";

const LOCAL_MEDIA_B = "LOCAL_MEDIA.";
const LM_GENRE = "GENRE";
const LM_ADANCE_SHOW = "ADVANCE_SHOW";
const LM_SPECIFIC_SHOW = "SPECIFIC_SHOW";
const LM_SPECIFIC_EPISODE = "SPECIFIC_EPISODE";

const UNEQ = "UNEQ";
const LIVE = "LIVE.";
const NOW_PLAYING = "NOW_PLAYING";

const LAST_SS_B = "LAST_SS.";
const LAST_SS_LM_B = LAST_SS_B + LOCAL_MEDIA_B;
const CONFIG_B = "CONFIG.";
const CONFIG_NP_B = CONFIG_B + LOCAL_MEDIA_B + LIVE;

const R_CONSTANTS = {
	YOU_TUBE: {
		BASE: YTBASE ,
		NOW_PLAYING_MODE: YTBASE + "NOW_PLAYING.MODE" ,
		NOW_PLAYING_KEY: YTBASE + NOW_PLAYING_KEY ,
		PREVIOUS_NP_KEY: YTBASE + "PREVIOUS_NP_KEY" ,
		NP_SESSION_LIST: YTBASE + "NP_SESSION_LIST" ,
		NP_SESSION_INDEX: YTBASE + "NP_SESSION_INDEX" ,
		ALREADY_WATCHED: YTBASE + "ALREADY_WATCHED" ,
		UNWATCHED: YTBASE + "UNWATCHED" , 
		PLACEHOLDER: YTBASE + "PLACEHOLDER" ,
		LIVE: {
			BASE: YTLIVE ,
			LATEST: YTLIVE + LATEST ,
			FOLLOWERS: YTLIVE + FOLLOWERS ,
			BLACKLIST: YTLIVE + BLACKLIST ,
		} ,
		STANDARD: {
			BASE: YTSTD ,
			LATEST: YTSTD + LATEST ,			
			FOLLOWERS: YTSTD + FOLLOWERS ,
			BLACKLIST: YTSTD + BLACKLIST ,
		} ,
		CURRATED: {
			BASE: YTCURRATED ,
			MAIN_LIST: YTCURRATED + "MAIN_LIST" ,
			PLAYLISTS: YTCURRATED + "PLAYLISTS"
		} ,
	} ,
	INSTAGRAM: {
		BASE: INSTAGRAM ,
		FOLLOWERS: INSTAGRAM + "FOLLOWERS" ,
		MEDIA: INSTAGRAM + "MEDIA" ,
		PLACEHOLDER: INSTAGRAM + "PLACEHOLDER" ,
		LATEST: INSTAGRAM + "LATEST" ,
		ALREADY_WATCHED: INSTAGRAM + "ALREADY_WATCHED" ,
	} ,
	LOCAL_MEDIA: {
		BASE: LOCAL_MEDIA_B ,
		CONFIG: {
			BASE: CONFIG_NP_B ,
			GENRE: CONFIG_NP_B + LM_GENRE ,
			ADVANCE_SHOW: CONFIG_NP_B + LM_ADANCE_SHOW , 
			SPECIFIC_SHOW: CONFIG_NP_B + LM_SPECIFIC_SHOW ,
			SPECIFIC_EPISODE: CONFIG_NP_B + LM_SPECIFIC_EPISODE ,
		} ,
		LAST_SS: {
			BASE: LAST_SS_LM_B ,
			NOW_PLAYING: {
				"Odyssey": LAST_SS_LM_B + "Odyssey." + NOW_PLAYING ,
				"TVShows": LAST_SS_LM_B + "TVShows." + NOW_PLAYING ,
				"Movies": LAST_SS_LM_B + "Movies." + NOW_PLAYING ,
				"AudioBooks": LAST_SS_LM_B + "AudioBooks." + NOW_PLAYING ,
			}
		}
	}
};

const ALERT_EMAILS = require( "./personal.js" ).peerCallNames;
module.exports = {

	MEDIA_MOUNT_POINT: {
		UUID: "2864E38A64E358D8" ,
		//LOCAL_PATH: "/home/morpheous/TMP2/EMULATED_MOUNT_PATH" ,
	} ,

	BUTTON_MAP: {
		0: { state: "YT_Live_Background" , options: {} } ,
		1: { session: "Mopidy_Foreground_YT_Live_Background" , options: { genre: "UNKNOWN" } } ,
		2: { session: "Mopidy_Foreground_YT_Live_Background" , options: { genre: "UNKNOWN" }  } ,
		3: { session: "Twitch_IF_Live_ELSE_YT_Standard_Foreground" , options: {} } ,
		4: { session: "PeerCall_Foreground" , options: { alertEmails: [ ALERT_EMAILS[ 1 ] ] } } ,
		5: { state: "PeerCall_Foreground" , options: { alertEmails: [ ALERT_EMAILS[ 2 ] ] } } ,
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
		16: { state: "PeerCall_Foreground" , options: { alertEmails: [] , recievedCall: true } } ,
	} ,

	REDIS: {
		HOST: "localhost" ,
		
		// Purple
		PORT: "6379" ,
		DATABASE_NUM: 0 ,
		
		// Here
		// PORT: "8443" , 
		// DATABASE_NUM: 3 ,

		CONSTANTS: R_CONSTANTS ,
		SET_KEYS: {
			"CONFIG.ARRIVED_HOME": "false" ,
			"MOPIDY.STATE": "stopped" ,
			"YOU_TUBE.LIVE.FOLLOWERS" : [ "UCnM5iMGiKsZg-iOlIO2ZkdQ" , "UCakgsb0w7QB0VHdnCc-OVEA" , "UCZvXaNYIcapCEcaJe_2cP7A" ] ,
			"YOU_TUBE.LIVE.BLACKLIST" : [ "N5UUv-tgyDg" , "9zMpeUh6DXs" , "bNc7rGEBrMA" , "Mk9gQcHueeE" , "uyTAj1sbThg" , "cdKLSA2ke24" , 
			"SwS3qKSZUuI" , "ddFvjfvPnqk" , "MFH0i0KcE_o" , 
			"nzkns8GfV-I" , "qyEzsAy4qeU" , "KIyJ3KBvNjA" , "FZvR0CCRNJg" , "q_4YW_RbZBw" , "pwiYt6R_kUQ" , "T9Cj0GjIEbw" ] ,
			"YOU_TUBE.STANDARD.FOLLOWERS": [ "UCk0UErv9b4Hn5ucNNjqD1UQ" , "UCKbVtAdWFNw5K7u2MZMLKIw"  ] ,
			"YOU_TUBE.STANDARD.BLACKLIST": [] ,
			"INSTAGRAM.FOLLOWERS": [ "ceberous" ]
		} ,
		RESETS: [ "YOU_TUBE.LIVE.LATEST*" , "YOU_TUBE.STANDARD.LATEST*" ]
	} ,

	SCHEDULES: {

		STATE_TRANSITIONS: {
			arriveHome: {
				startPattern: "01 16 * * 1,2,3,5" ,
				endPattern: "01 18 * * 1,2,3,5" ,
				state: 13,
				stateOptions: null ,
				startConditions: { "CONFIG.ARRIVED_HOME": "false" } ,
				stopConditions: null ,
			} ,
		} ,

		// Paths Must be **relative** to scheduleManager.js
		UPDATES: {
			gmusicPlaylistCache: {
				startPattern: "01 */3 * * *" , // every 3 hours
				startConditions: { "MOPIDY.STATE": "stopped" } ,
				functionPath: [ "utils" , "mopidy" ,"libraryManager.js" ] ,
				functionName: "updateCache" ,
			} ,
			youtubeStandardList: {
				startPattern: "01 */9 * * *" , // every 9 hours
				startConditions: {} ,
				functionPath: [ "youtubeManager.js" ] ,
				functionName: "updateStandard" ,
			} ,
		}

	}

};