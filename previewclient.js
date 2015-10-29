var EventEmitter = require('events').EventEmitter;
var util = require('util');
var zmq = require('zmq');
var _ = require('underscore');
var protobufMessage = require('machinetalk-protobuf').message;
var Container = protobufMessage.Container;
var ContainerType = protobufMessage.ContainerType;

function PreviewClient(address) {
  this.address = address;
  this.socket = zmq.socket('sub');
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
util.inherits(PreviewClient, EventEmitter);
PreviewClient.prototype.connect = function() {
  this.socket.monitor(1000, 0);
  this.socket.connect(this.address);
  this.socket.subscribe('preview');
};
PreviewClient.prototype._handleMessage = function(topic, message) {
  topic = topic && topic.toString();
  message = Container.decode(message);
  switch(message.type) {
    case ContainerType.MT_PREVIEW: return this._handlePreviewMessage(message);
    default: throw new Error('Invalid message type: ' + message.type);
  }
};
PreviewClient.prototype._handlePreviewMessage = function(message) {

};
PreviewClient.prototype.close = function close() {
  this.socket.close();
};

module.exports = PreviewClient;