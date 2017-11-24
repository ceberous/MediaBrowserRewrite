// Eventually this will get moved to a JSON struct

module.exports.USB_DRIVE_UUID = "2864E38A64E358D8";

module.exports.BUTTON_MAP = {
	0: { state: "YT_Live_Background" , options: {} } ,
	1: { session: "Mopidy_Foreground_YT_Live_Background" , options: { genre: "UNKNOWN" } } ,
	2: { session: "Mopidy_Foreground_YT_Live_Background" , options: { genre: "UNKNOWN"  } } ,
	3: { session: "Twitch_IF_Live_ELSE_YT_Standard_Foreground" , options: {} } ,
	4: { state: "Skype_Foreground" , options: { personal_number: 1 } } ,
	5: { state: "Skype_Foreground" , options: { personal_number: 2 } } ,
	6: { label: "stop" } ,
	7: { label: "pause" } ,
	8: { label: "previous" } ,
	9: { label: "next" } ,
	10: { state: "LocalMedia_Movie_Foreground" , options: {} } ,
	11: { session: "LocalMedia_Odyssey_Foreground_YT_Live_Background" , options: {} } ,
	12: { state: "LocalMedia_TV_Foreground" , options: { advance_show: "true" , specific_show: "false" , specific_episode: "false" } } ,
	13: { session: "YT_STD_Currated_THEN_Odyssey_And_YT_Live" , options: {} }
};

module.exports.INITIALIZATION_CONFIG = {
	//R_DB_RESETS: [ "HARD_DRIVE.*" , "YOU_TUBE.*" ]
};

module.exports.SCHEDULES = {

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
		 	startPattern: "0 */3 * * *" , // every 3 hours
		 	startConditions: { "MOPIDY.STATE": "stopped" } ,
		 	funtionPath: [ "utils" , "mopidy" ,"libraryManager.js" ] ,
		 	functionName: "updateCache" ,
		 	jobPID: null
		 }
		// testUpdate: {
		// 	startPattern: "* * * * *" , // every 1 minute ??
		// 	startConditions: { "MOPIDY.STATE": "stopped" } ,
		// 	functionPath: [ "utils" , "testUpdateFunc.js" ] ,
		// 	functionName: "random1" ,
		// 	jobPID: null
		// }
	}

};
