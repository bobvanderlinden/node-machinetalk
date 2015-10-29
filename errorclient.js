var EventEmitter = require('events').EventEmitter;
var util = require('util');
var zmq = require('zmq');
var _ = require('underscore');
var protobufMessage = require('machinetalk-protobuf').message;
var Container = protobufMessage.Container;
var ContainerType = protobufMessage.ContainerType;

function ErrorClient(address) {
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
util.inherits(ErrorClient, EventEmitter);
ErrorClient.prototype.connect = function() {
  this.socket.monitor(1000, 0);
  this.socket.connect(this.address);
  this.socket.subscribe('error');
  this.socket.subscribe('text');
  this.socket.subscribe('display');
};
ErrorClient.prototype._handleMessage = function(topic, message) {
  topic = topic && topic.toString();
  message = Container.decode(message);
  var msg = {
    type: message.type,
    topic: topic,
    note: message.note
  };
  this.emit('message', msg);
  switch(topic) {
    case 'error': return this._handleError(msg);
    case 'text': return this._handleText(msg);
    case 'display': return this._handleDisplay(msg);
    default: throw new Error('Invalid message topic: ' + topic);
  }
};
ErrorClient.prototype._handleError = function(message) {
  switch(message.type) {
    case ContainerType.MT_EMC_OPERATOR_ERROR:
      this.emit('message:error:operator', message);
      break;
    case ContainerType.MT_EMC_NML_ERROR:
      this.emit('message:error:nml', message);
      break;
    case ContainerType.MT_PING:
      return; // Ignore ping messages
    default:
      throw new Error('Invalid message type for topic ' + message.topic + ': ' + message.type);
  }
  this.emit('message:error', message);
};
ErrorClient.prototype._handleText = function(message) {
  switch(message.type) {
    case ContainerType.MT_EMC_NML_TEXT:
      this.emit('message:text', message);
      break;
    case ContainerType.MT_PING:
      return; // Ignore ping messages
    default:
      throw new Error('Invalid message type for topic ' + message.topic + ': ' + message.type);
  }
};
ErrorClient.prototype._handleDisplay = function(message) {
  switch(message.type) {
    case ContainerType.MT_EMC_OPERATOR_DISPLAY:
      this.emit('message:display:operator', message);
      break;
    case ContainerType.MT_EMC_NML_DISPLAY:
      this.emit('message:display:nml', message);
      break;
    case ContainerType.MT_PING:
      return; // Ignore ping messages
    default:
      throw new Error('Invalid message type for topic ' + message.topic + ': ' + message.type);
  }
  this.emit('message:display', message);
};
ErrorClient.prototype.close = function close() {
  this.socket.close();
};

module.exports = ErrorClient;