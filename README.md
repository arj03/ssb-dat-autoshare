# ssb-dat-autoshare

Find dat links in posts and share them automatically

Command line usage (assuming you want to share from the dats folder):

```
node bin.js -f ./dats
```

Can also take a -i option to only share links from people you
follow. And can be told to share using memory (-t) instead of from
filesystem.

This should give you something like this:

```
Looking for dat links
Found 2
Saving to: ./dats/50237519bcfec8c86632112906ee39c76004a3d4bbf1b342c0b2926f4af67d35
Saving to: ./dats/64a10ea39416aceb6c5852d262c89edc1dfa95d4c3f1f838eb36c4cb2edffc2a
sharing: dat://50237519bcfec8c86632112906ee39c76004a3d4bbf1b342c0b2926f4af67d35
sharing: dat://64a10ea39416aceb6c5852d262c89edc1dfa95d4c3f1f838eb36c4cb2edffc2a
```

Can also be installed as a sbot plugin. For configuration, you can
change options in ~/.ssb/config, add:

```
  "datShare": {
    "shareFolder": "PATH_TO_MY_SHARE_FOLDER",
    "onlyPeopleIFollow": true
  }
```
