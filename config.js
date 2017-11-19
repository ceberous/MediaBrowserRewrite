

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
	12: { state: "LocalMedia_TV_Foreground" , options: {} } ,

};