#!/usr/bin/env node

var lib = require('./lib');

var program = require('commander');

program
  .option('-f, --share-folder [value]', 'Folder for sharing')
  .option('-i, --only-people-i-follow', 'Only seed urls from people or channels I follow')
  .parse(process.argv);

require('ssb-client')((err, sbot) => {
  if (err) throw err;

  var shareFolder = program.shareFolder || '/tmp'
  
  console.log("Sharing dat links from:", shareFolder)

  if (program.onlyPeopleIFollow)
    lib.getFromPeopleIFollow(sbot, shareFolder)
  else
    lib.getAll(sbot, shareFolder)
})
