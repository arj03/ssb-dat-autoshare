var lib = require('./lib');

exports.name = 'dat-share'
exports.version = require('./package.json').version
exports.manifest = {}

exports.init = function (ssb, config) {
  var conf = config.datShare || {}
  var shareFolder = conf.shareFolder || '/tmp'

  console.log("Sharing dat links from:", shareFolder)
  
  if (conf.onlyPeopleIFollow)
    lib.getFromPeopleIFollow(ssb, shareFolder, conf.temp)
  else
    lib.getAll(ssb, shareFolder, conf.temp)
}
