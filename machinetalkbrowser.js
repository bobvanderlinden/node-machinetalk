var EventEmitter = require('events').EventEmitter;
var util = require('util');
var mdns = require('mdns-js');
var _ = require('underscore');

var machinekitTcp = mdns.tcp('machinekit');

function MachineTalkBrowser() {
  this.machines = {};
}
util.inherits(MachineTalkBrowser, EventEmitter);
MachineTalkBrowser.prototype.start = function() {
  if (this.browser) { return; }
  this.browser = mdns.createBrowser(machinekitTcp);
  this.browser.on('ready', this._handleReady.bind(this));
  this.browser.on('update', this._handleUpdate.bind(this));
  this.browser.on('error', this.emit.bind(this, 'error'));
};
MachineTalkBrowser.prototype.stop = function() {
  if (!this.browser) { return; }
  this.browser.stop();
};
MachineTalkBrowser.prototype._handleReady = function() {
  this.browser.discover();
};
MachineTalkBrowser.prototype._handleUpdate = function(service) {
  if (!service.txt) {
    return;
  }
  var txtRecord = service.txt.map(function(line) {
    return line.split('=', 2);
  }).reduce(function(record, line) {
    record[line[0]] = line[1];
    return record;
  }, {});

  if (!txtRecord) {
    return;
  }
  var uuid = txtRecord.uuid;
  var serviceName = txtRecord.service;
  var dsn = txtRecord.dsn;
  if (!uuid || !serviceName || !dsn) {
    return;
  }
  var machine = this.machines[uuid];
  if (!machine) {
    machine = this.machines[uuid] = {
      uuid: uuid,
      host: service.host,
      services: {}
    };
    this.emit('machineUp', machine);
  }
  if (machine.services[serviceName] !== dsn) {
    machine.services[serviceName] = dsn;
    this.emit('serviceUp', {
      machine: machine,
      name: serviceName,
      mdns: service,
      dsn: dsn
    });
  }
};

module.exports = MachineTalkBrowser;