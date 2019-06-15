var Dat = require('dat-node')
var uri = require('urijs')
var pull = require('pull-stream')
var path = require('path')

var self = module.exports = {
  extractLinksAndSeed: function(err, logs, shareFolder, useTemp) {
    if (err) throw err;

    console.log("Found " + logs.length)

    logs.forEach(msg => {
      uri.withinString(msg.value.content.text, (datLink) => {
        if (!datLink.startsWith("dat://")) return

        // issue #360 in uri.js
        var bracket = datLink.indexOf("]")

        if (bracket != -1)
          datLink = datLink.substring(0, bracket)

        var hash = datLink.indexOf("#")

        if (hash != -1)
          datLink = datLink.substring(0, hash)

	var sharePath = shareFolder + "/" + datLink.substring(6)

	if (!sharePath.endsWith("/"))
	  sharePath = path.dirname(sharePath)

        if (!useTemp)
          console.log("Saving to:", sharePath)

        Dat(sharePath, {
	  key: datLink,
          temp: useTemp
        }, function (err, dat) {
	  if (err) {
            console.log(err);
            return
          }
	  
	  console.log("sharing:", datLink)
	  dat.joinNetwork()
        })
      })
    })
  },

  getAll: function(sbot, shareFolder, useTemp) {
    console.log("Looking for dat links in all feeds")

    pull(
      sbot.createLogStream({ reverse: true, limit: 15000 }),
      pull.filter((msg) => {
        return !msg.value ||
	  msg.value.content.type == 'post' &&
	  typeof msg.value.content.text == "string" &&
	  msg.value.content.text.indexOf("dat://") != -1
      }),
      pull.collect((err, logs) => self.extractLinksAndSeed(err, logs,
                                                           shareFolder,
                                                           useTemp))
    )
  },

  messagesFromPeopleIFollow: function(sbot, following,
                                      channelSubscriptions,
                                      shareFolder, useTemp) {
    console.log("users:", following)
    console.log("channels:", channelSubscriptions)
    pull(
      sbot.createLogStream({ reverse: true, limit: 15000 }),
      pull.filter((msg) => {
        return !msg.value ||
	  ((msg.value.author in following ||
	    msg.value.content.channel in channelSubscriptions)
           && msg.value.content.type == 'post' &&
	   typeof msg.value.content.text == "string" &&
	   msg.value.content.text.indexOf("dat://") != -1)
      }),
      pull.collect((err, logs) => self.extractLinksAndSeed(err, logs,
                                                           shareFolder,
                                                           useTemp))
    )
  },

  getFromPeopleIFollow: function(sbot, shareFolder, useTemp) {
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

          self.messagesFromPeopleIFollow(sbot, following,
                                         channelSubscriptions,
                                         shareFolder, useTemp)
        })
      )
    })
  }
}
