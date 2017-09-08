var express = require("express");
var router = express.Router();

var youtubeCTRL = require( "../CONTROLLERS/youtubeCTRL.js" );

router.get( '/followers/' , youtubeCTRL.getFollowers );

router.get( '/live-add-follower/:wID' , youtubeCTRL.addLiveFollower );
router.get( '/live-remove-follower/:wID' , youtubeCTRL.removeLiveFollower );
router.get( '/live-add-blacklist/:wID' , youtubeCTRL.addLiveBlacklist );
router.get( '/live-remove-blacklist/:wID' , youtubeCTRL.removeLiveBlacklist );

module.exports = router;