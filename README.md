# node-machinetalk

This project is in a very early phase. Its goal is to provide an easy to use API for discovering, monitoring and controlling Machinetalk instances.

[![Build Status](https://api.travis-ci.org/bobvanderlinden/node-machinetalk.svg)](https://travis-ci.org/bobvanderlinden/node-machinetalk)
[![Dependency Status](https://david-dm.org/bobvanderlinden/node-machinetalk.svg)](https://david-dm.org/bobvanderlinden/node-machinetalk)

## Installation

```sh
npm install --save git+https://github.com/bobvanderlinden/node-machinekit
```

## Usage

```js
var machinetalk = require('node-machinetalk');

// Initiate a machine browser that discovers Machinetalk
// machines on the network with their capabilities (services).
var browser = new machinetalk.MachineTalkBrowser();

// Wait for services to be discovered.
browser.on('serviceUp', function(machine, serviceName, dsn) {
  // We are only interested in the 'status' service.
  if (serviceName !== 'status') { return; }

  // Initiate a status client that can retrieve status updates.
  var statusclient = new machinetalk.StatusClient(dsn);

  // Wait for status updates for motion and print them.
  statusclient.on('motionstatuschanged', function(status) {
    console.log('Machine position: ',
      status.position.x,
      status.position.y,
      status.position.z
    );
  });

  // Connect to the status service.
  // We are only interested in 'motion' updates.
  statusclient.connect();
  statusclient.subscribe('motion');
});

// Start discovering machines.
browser.start();
```

## Examples

[See the Examples directory](https://github.com/bobvanderlinden/node-machinetalk/tree/master/examples)