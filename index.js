var lib = require('./lib');

exports.name = 'dat-share'
exports.version = require('./package.json').version
exports.manifest = {}

exports.init = function (ssb, config) {
  var conf = config.datShare || {}
  var onlyPeopleIFollow = conf.onlyPeopleIFollow || false
  var shareFolder = conf.folder || '/tmp'

  console.log("Sharing dat links from: ", shareFolder)
  
  if (onlyPeopleIFollow)
    lib.getFromPeopleIFollow(ssb, shareFolder)
  else
    lib.getAll(ssb, shareFolder)
}
