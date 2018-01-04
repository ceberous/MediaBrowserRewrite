// Common
const FOLLOWERS = "FOLLOWERS";
const BLACKLIST = "BLACKLIST";
const LATEST = "LATEST";
const PREVIOUS = "PREVIOUS";
const KEY = "KEY";
const MODE = "MODE";
const MEDIA = "MEDIA";
const NOW_PLAYING = "NOW_PLAYING";
const NOW_PLAYING_KEY = NOW_PLAYING + "_" + KEY;
const PLACEHOLDER = "PLACEHOLDER";
const GENRE = "GENRE";
const ALREADY_WATCHED = "ALREADY_WATCHED";
const UNEQ = "UNEQ";


const YTBASE = "YOU_TUBE.";
const YTLIVE = YTBASE + "LIVE."
const YTSTD = YTBASE + "STANDARD."
const YTCURRATED = YTBASE + "CURRATED."
module.exports.YOU_TUBE = {
	BASE: YTBASE ,
	NOW_PLAYING_MODE: YTBASE + NOW_PLAYING + "." + MODE ,
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
};

const INSTAGRAM_B = "INSTAGRAM.";
module.exports.INSTAGRAM = {
	BASE: INSTAGRAM_B ,
	FOLLOWERS: INSTAGRAM_B + FOLLOWERS ,
	MEDIA: INSTAGRAM_B + MEDIA ,
	PLACEHOLDER: INSTAGRAM_B + PLACEHOLDER ,
	LATEST: INSTAGRAM_B + LATEST ,
	ALREADY_WATCHED: INSTAGRAM_B + ALREADY_WATCHED ,
};


const LOCAL_MEDIA_B = "LOCAL_MEDIA.";
const LM_ADANCE_SHOW = "ADVANCE_SHOW";
const LM_SPECIFIC_SHOW = "SPECIFIC_SHOW";
const LM_SPECIFIC_EPISODE = "SPECIFIC_EPISODE";
const LIVE = "LIVE.";
const LAST_SS_B = "LAST_SS.";
const LAST_SS_LM_B = LAST_SS_B + LOCAL_MEDIA_B;
const CONFIG_B = "CONFIG.";
const CONFIG_NP_B = CONFIG_B + LOCAL_MEDIA_B + LIVE;
module.exports.LOCAL_MEDIA = {
	BASE: LOCAL_MEDIA_B ,
	HD_BASE: "HARD_DRIVE." ,
	MOUNT_POINT: "HARD_DRIVE.MOUNT_POINT" ,
	CONFIG: {
		BASE: CONFIG_NP_B ,
		GENRE: CONFIG_NP_B + GENRE ,
		ADVANCE_SHOW: CONFIG_NP_B + LM_ADANCE_SHOW , 
		SPECIFIC_SHOW: CONFIG_NP_B + LM_SPECIFIC_SHOW ,
		SPECIFIC_EPISODE: CONFIG_NP_B + LM_SPECIFIC_EPISODE ,
	} ,
	LAST_SS: {
		BASE: LAST_SS_LM_B ,
		NOW_PLAYING_GLOBAL: LAST_SS_LM_B + "GLOBAL." + NOW_PLAYING ,
		NOW_PLAYING: {
			"Odyssey": LAST_SS_LM_B + "Odyssey." + NOW_PLAYING ,
			"TVShows": LAST_SS_LM_B + "TVShows." + NOW_PLAYING ,
			"Movies": LAST_SS_LM_B + "Movies." + NOW_PLAYING ,
			"AudioBooks": LAST_SS_LM_B + "AudioBooks." + NOW_PLAYING ,
		}
	}
};