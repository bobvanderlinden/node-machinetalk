var EventEmitter = require('events').EventEmitter;
var util = require('util');
var zmq = require('zmq');
var _ = require('underscore');
var protobufMessage = require('machinetalk-protobuf').message;
var Container = protobufMessage.Container;
var ContainerType = protobufMessage.ContainerType;

function StatusClient(address) {
  this.address = address;
  this.socket = zmq.socket('sub');
  this.status = {};
  this.socket.on('message', this._handleMessage.bind(this));

  this.socket.on('connect', this.emit.bind(this, 'connect'));
  this.socket.on('connect_delay', this.emit.bind(this, 'connect_delay'));
  this.socket.on('connect_retry', this.emit.bind(this, 'connect_retry'));
  this.socket.on('listen', this.emit.bind(this, 'listen'));
  this.socket.on('bind_error', this.emit.bind(this, 'bind_error'));
  this.socket.on('accept', this.emit.bind(this, 'accept'));
  this.socket.on('accept_error', this.emit.bind(this, 'accept_error'));
  this.socket.on('close', this.emit.bind(this, 'close'));
  this.socket.on('close_error', this.emit.bind(this, 'close_error'));
  this.socket.on('disconnect', this.emit.bind(this, 'disconnect'));
  this.socket.on('monitor_error', this.emit.bind(this, 'monitor_error'));
}
util.inherits(StatusClient, EventEmitter);
StatusClient.prototype.connect = function() {
  this.socket.monitor(1000, 0);
  this.socket.connect(this.address);
};
StatusClient.prototype.subscribe = function(topic) {
  this.socket.subscribe(topic);
};
StatusClient.prototype._handleMessage = function(topic, message) {
  topic = topic && topic.toString();
  var status = this.status[topic] || (this.status[topic] = {});

  message = Container.decode(message);
  this.emit('message', message);

  if (message.type === ContainerType.MT_PING) {
    // TODO: Handle ping (reset watchdog)
  } else if (message.type === ContainerType.MT_EMCSTAT_FULL_UPDATE) {
    StatusClient.extendStatus(status, this._getStatusFromMessage(topic, message));
    this.emit(topic + 'statuschanged', status);
    this.emit('topicstatuschanged', topic, status);
    this.emit('statuschanged', this.status);
  } else if (message.type === ContainerType.MT_EMCSTAT_INCREMENTAL_UPDATE) {
    StatusClient.extendStatus(status, this._getStatusFromMessage(topic, message));
    this.emit(topic + 'statuschanged', status);
    this.emit('topicstatuschanged', topic, status);
    this.emit('statuschanged', this.status);
  } else {
    console.log('Unknown message type', message.type);
  }
};
StatusClient.prototype._getStatusFromMessage = function(topic, message) {
  return message['emc_status_' + topic];
};
StatusClient.extendStatus = function extendStatus(destination, source) {
  for (var key in source) {
    if (!source.hasOwnProperty(key) || source[key] === null)
      // Skip if source doesn't have a value.
      continue;

    if (source[key] instanceof Array) {
      destination[key] = StatusClient.extendArray(destination[key], source[key]);
      continue;
    }

    if (destination[key] === null || destination[key] === undefined) {
      // Overwrite if destination has no value.
      destination[key] = source[key];
      continue;
    }

    if (typeof source[key] !== 'object') {
      // Overwrite if source has a primitive value.
      destination[key] = source[key];
      continue;
    }

    if (typeof destination[key] === 'object') {
      // Recurse down for object values.
      extendStatus(destination[key], source[key]);
      continue;
    }

    throw new Error('Incorrect status');
  }
  return destination;
};

StatusClient.extendArray = function extendArray(destination, source) {
  return source.reduce(function(array, item) {
    if (item.index >= array.length) {
      array.length = item.index + 1;
    }
    array[item.index] = item;
    return array;
  }, destination || []);
};

StatusClient.prototype.close = function close() {
  this.socket.close();
};

module.exports = StatusClient;