#!/usr/bin/env node

var Dat = require('dat-node')
var program = require('commander');
var uri = require('urijs')
var pull = require('pull-stream')

program
  .option('-f, --folder [value]', 'Folder for sharing')
  .option('-i, --only-people-i-follow', 'Only seed urls from people or channels I follow')
  .parse(process.argv);

function extractLinksAndSeed(err, logs) {
  if (err) throw err;

  console.log("Found " + logs.length)

  logs.forEach(msg => {
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
}

function getAll(sbot) {
  console.log("Looking for dat links in all feeds")

  pull(
    sbot.createLogStream({ reverse: true, limit: 10000 }),
    pull.filter((msg) => {
      return !msg.value ||
	msg.value.content.type == 'post' &&
	typeof msg.value.content.text == "string" &&
	msg.value.content.text.indexOf("dat://") != -1
    }),
    pull.collect(extractLinksAndSeed)
  )
}

function messagesFromPeopleIFollow(sbot, following, channelSubscriptions) {
  console.log("users:", following)
  console.log("channels:", channelSubscriptions)
  pull(
    sbot.createLogStream({ reverse: true, limit: 10000 }),
    pull.filter((msg) => {
      return !msg.value ||
	((msg.value.author in following ||
	  msg.value.content.channel in channelSubscriptions)
         && msg.value.content.type == 'post' &&
	 typeof msg.value.content.text == "string" &&
	 msg.value.content.text.indexOf("dat://") != -1)
    }),
    pull.collect(extractLinksAndSeed)
  )
}

function getFromPeopleIFollow(sbot) {
  var following = []
  var channelSubscriptions = []

  console.log("Looking for dat links in people i follow")

  sbot.whoami((err, feed) => {
    pull(
      sbot.createUserStream({ id: feed.id }),
      pull.filter((msg) => {
	return !msg.value ||
	  msg.value.content.type == 'contact' ||
	  (msg.value.content.type == 'channel' &&
	   typeof msg.value.content.subscribed != 'undefined')
      }),
      pull.collect(function (err, msgs) {
        msgs.forEach((msg) => {
	  if (msg.value.content.type == 'contact')
	  {
	    if (msg.value.content.following)
	      following[msg.value.content.contact] = 1
	    else
	      delete following[msg.value.content.contact]
	  }
	  else // channel subscription
	  {
	    if (msg.value.content.subscribed)
	      channelSubscriptions[msg.value.content.channel] = 1
	    else
	      delete channelSubscriptions[msg.value.content.channel]
	  }
        })

        messagesFromPeopleIFollow(sbot, following, channelSubscriptions)
      })
    )
  })
}

require('ssb-client')((err, sbot) => {
  if (err) throw err;

  if (program.onlyPeopleIFollow)
    getFromPeopleIFollow(sbot)
  else
    getAll(sbot)
})
