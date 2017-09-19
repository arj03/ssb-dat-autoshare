#!/usr/bin/env node

var Dat = require('dat-node')
var program = require('commander');
var uri = require('urijs')
var pull = require('pull-stream')

program
  .option('-f, --folder [value]', 'Folder for sharing')
  .parse(process.argv);

require('ssb-client')((err, sbot) => {
  if (err) throw err;

  console.log("Looking for dat links")

  pull(
    sbot.createLogStream({ reverse: true, limit: 10000 }),
    pull.filter((msg) => {
      return !msg.value ||
	msg.value.content.type == 'post' &&
	typeof msg.value.content.text == "string" &&
	msg.value.content.text.indexOf("dat://") != -1
    }),
    pull.collect((err, log) => {
      if (err) throw err;

      console.log("Found " + log.length)

      log.forEach(msg => {
	uri.withinString(msg.value.content.text, (datLink) => {
	  if (!datLink.startsWith("dat://")) return

	  console.log("Saving to:", program.folder + "/" + datLink.substring(6))

	  Dat(program.folder + "/" + datLink.substring(6), {
	    key: datLink
	  }, function (err, dat) {
	    if (err) throw err
	    
	    console.log("sharing:", datLink)
	    dat.joinNetwork()
	  })
	})
      })
    })
  )
})
