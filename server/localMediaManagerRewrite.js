//const GEN_HD_REF = require( "./utils/localMedia_Util" ).buildHardDriveReference;

const hdFolderStructure_Skeleton = {
	"mount_point": null ,
	"AudioBooks": { always_advance_next_show: true , last_pos: 0 , locked_show: null },
	"DVDs": { always_advance_next_show: true , last_pos: 0 , locked_show: null },
	"Movies": { always_advance_next_show: true , last_pos: 0 , locked_show: null },
	"Music": { always_advance_next_show: true , last_pos: 0 , locked_show: null },
	"Podcasts": { always_advance_next_show: true , last_pos: 0 , locked_show: null },
	"TVShows": { always_advance_next_show: true , last_pos: 0 , locked_show: null } ,
	"Odyssey": { always_advance_next_show: true , last_pos: 0 , locked_show: null } ,
	FP: [] ,
	REF: {}
};

var HARD_DRIVE_STRUCT = require( "jsonfile-obj-db" );
//HARD_DRIVE_STRUCT.open( { path: "./server/save_files/hdFolderStructure" , skeleton: hdFolderStructure_Skeleton } );
HARD_DRIVE_STRUCT.open( { path: "./hdFolderStructureTest" , skeleton: hdFolderStructure_Skeleton } );



( async ()=> {
	
	//HARD_DRIVE_STRUCT.self.mount_point = await require( "./utils/localMedia_Util" ).findAndMountUSB_From_UUID( "2864E38A64E358D8" );
	//var x1 = await require( "./utils/localMedia_Util" ).buildHardDriveReference( HARD_DRIVE_STRUCT.self.mount_point );

	HARD_DRIVE_STRUCT.self.mount_point = "/home/morpheous/TMP2/EMULATED_MOUNT_PATH";
	HARD_DRIVE_STRUCT.self.FP = await require( "./utils/localMedia_Util" ).buildHardDriveReference( HARD_DRIVE_STRUCT.self.mount_point );;
	HARD_DRIVE_STRUCT.save();

})();