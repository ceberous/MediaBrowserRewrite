

module.exports.BUTTON_TO_STATE_MAP = {

	0: { state: "YT_Live_Background" , options: {} } ,
	1: { state: "Mopidy_Foreground_YT_Live_Background" , options: { genre: "classic" } } ,
	2: { state: "Mopidy_Foreground_YT_Live_Background" , options: { genre: "edm"  } } ,
	3: { state: "Twitch_IF_Live_ELSE_YT_Standard_Foreground" , options: {} } ,
	4: { state: "Skype_Foreground" , options: { personal_number: 1 } } ,
	5: { state: "Skype_Foreground" , options: { personal_number: 2 } } ,
	6: { state: null , label: "stop" } ,
	7: { state: null , label: "pause" } ,
	8: { state: null , label: "previous" } ,
	9: { state: null , label: "next" } ,
	10: { state: "LocalMedia_Movie_Foreground" , options: {} } ,
	11: { state: "LocalMedia_Odyssey_Foreground_YT_Live_Background" , options: {} } ,
	12: { state: "LocalMedia_TV_Foreground" , options: { advance_show: "true" , specific_show: "false" , specific_episode: "false" } } ,
	13: { state: "YT_Standard_Currated_Then_LocalMedia_Odyssey_Foreground_YT_Live_Background" , options: {} }
};


module.exports.SCHEDULES = {
	// arriveHome: {
	// 	startPattern: "01 16 * * 1,2,3,5" ,
	// 	endPattern: "01 18 * * 1,2,3,5" ,
	// 	state: 11,
	// 	stateOptions: null ,
	// 	startConditions: { "CONFIG.ARRIVE_HOME": "false" } ,
	// 	stopConditions: null ,
	// 	jobPID: null
	// } ,

	testingS1: {
		startPattern: "51 04 * * *" ,
		stopPattern: "52 04 * * *" ,
		state: 13 ,
		stateOptions: null ,
		startConditions: { "TEST_A1": "false" } ,
		stopConditions: null ,
		startPID: null ,
		stopPID: null
	} ,	
};