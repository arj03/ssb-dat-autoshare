#!/usr/bin/env node

var lib = require('./lib');

var program = require('commander');

program
  .option('-f, --share-folder [value]', 'Folder for sharing')
  .option('-i, --only-people-i-follow', 'Only seed urls from people or channels I follow')
  .option('-t, --temp', 'Use memory instead of filesystem for sharing')
  .parse(process.argv);

require('ssb-client')((err, sbot) => {
  if (err) throw err;

  var shareFolder = program.shareFolder || '/tmp'

  if (program.temp)
    console.log("Sharing dat links in memory mode instead of filesytem")
  else
    console.log("Sharing dat links from:", shareFolder)

  if (program.onlyPeopleIFollow)
    lib.getFromPeopleIFollow(sbot, shareFolder, program.temp)
  else
    lib.getAll(sbot, shareFolder, program.temp)
})
