var EventEmitter = require('events').EventEmitter;
var util = require('util');
var zmq = require('zmq');
var _ = require('underscore');
var protobufMessage = require('machinetalk-protobuf').message;
var Container = protobufMessage.Container;
var ContainerType = protobufMessage.ContainerType;

function TaskCommandClient(address) {
	this.address = address;
	this.socket = zmq.socket('dealer');
	this.socket.identity = 'node-machinetalk-' + Math.random();
	this.socket.on('message', this._handleMessage.bind(this));
}
util.inherits(TaskCommandClient, EventEmitter);
TaskCommandClient.taskTopic = 'task';
TaskCommandClient.prototype.connect = function() {
	console.log('address', this.address);
	this.socket.connect(this.address);
};
TaskCommandClient.prototype._handleMessage = function(message) {
	message = Container.decode(message);
	this.emit('message', message);
};
TaskCommandClient.prototype.send = function(message) {
	var encoded = Container.encode(message);
	var sendBuffer = encoded.buffer.slice(0, encoded.limit);
	this.socket.send(sendBuffer);
};
TaskCommandClient.prototype.ping = function(callback) {
	// TODO: Create callback wrapper.
	var timeout = setTimeout(function() {
		cleanup();
		callback(new Error('Timeout'));
	}.bind(this), 1000)

	this.on('message', onMessage);
	function onMessage(message) {
		if (message.type === ContainerType.MT_PING_ACKNOWLEDGE) {
			cleanup();
			callback();
		}
	}

	var cleanup = function() {
		this.removeListener('message', onMessage);
		clearTimeout(timeout);
	}.bind(this);

	this.send({
		type: ContainerType.MT_PING
	});
};
function extendStatus(destination, source) {
	for(var key in source) {
		if (source.hasOwnProperty(key) && source[key] !== null) {
			destination[key] = source[key];
		}
	}
	return destination;
}

module.exports = TaskCommandClient;