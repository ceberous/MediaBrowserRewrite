var express = require("express");
var router = express.Router();

var youtubeCTRL = require( "../CONTROLLERS/youtubeCTRL.js" );

router.get( '/followers/' , youtubeCTRL.getFollowers );

router.get( '/live/follower/add/:wID' , youtubeCTRL.addLiveFollower );
router.get( '/live/follower/remove/:wID' , youtubeCTRL.removeLiveFollower );
router.get( '/live/blacklist/add/:wID' , youtubeCTRL.addLiveBlacklist );
router.get( '/live/blacklist/remove/:wID' , youtubeCTRL.removeLiveBlacklist );

module.exports = router;