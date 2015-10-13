var EventEmitter = require('events').EventEmitter;
var util = require('util');
var zmq = require('zmq');
var _ = require('underscore');
var protobufMessage = require('machinetalk-protobuf').message;
var Container = protobufMessage.Container;
var ContainerType = protobufMessage.ContainerType;

function StatusClient(address, topic) {
  this.address = address;
  this.topic = topic;
  this.socket = zmq.socket('sub');
  this.socket.on('message', this._handleMessage.bind(this));
}
util.inherits(StatusClient, EventEmitter);
StatusClient.prototype.connect = function() {
  this.socket.connect(this.address);
  this.socket.subscribe(this.topic);
};
StatusClient.prototype._handleMessage = function(topic, message) {
  topic = topic && topic.toString();
  if (topic !== this.topic) {
    return;
  }
  message = Container.decode(message);
  this.emit('message', message);

  if (message.type === ContainerType.MT_PING) {
    this.sendPingAcknowledge();
  } else if (message.type === ContainerType.MT_EMCSTAT_FULL_UPDATE) {
    this.status = extendStatus({}, this._getStatusFromMessage(message));
    this.emit('statuschanged', this.status);
  } else if (message.type === ContainerType.MT_EMCSTAT_INCREMENTAL_UPDATE) {
    extendStatus(this.status, this._getStatusFromMessage(message));
    this.emit('statuschanged', this.status);
  } else {
    console.log('Unknown message type', message.type);
  }
};
StatusClient.prototype._getStatusFromMessage = function(message) {
  return message['emc_status_' + this.topic];
};
StatusClient.prototype.send = function(message) {
  var encoded = Container.encode(message);
  var sendBuffer = encoded.buffer.slice(0, encoded.limit);
  this.socket.send(sendBuffer);
};
StatusClient.prototype.sendPingAcknowledge = function() {
  this.socket.send({
    type: ContainerType.MT_PING_ACKNOWLEDGE
  });
};

function extendStatus(destination, source) {
  for (var key in source) {
    if (source.hasOwnProperty(key) && source[key] !== null) {
      destination[key] = source[key];
    }
  }
  return destination;
}

module.exports = StatusClient;