var EventEmitter = require('events').EventEmitter;
var util = require('util');
var zmq = require('zmq');
var _ = require('underscore');
var machinetalkprotobuf = require('./machinetalkprotobuf');
var Container = machinetalkprotobuf.Container;
var ContainerType = machinetalkprotobuf.ContainerType;

function TaskStatusClient(address) {
	this.address = address;
	this.socket = zmq.socket('sub');
	this.socket.on('message', this._handleMessage.bind(this));
}
util.inherits(TaskStatusClient, EventEmitter);
TaskStatusClient.taskTopic = 'task';
TaskStatusClient.prototype.connect = function() {
	this.socket.connect(this.address);
	this.socket.subscribe(TaskStatusClient.taskTopic);
};
TaskStatusClient.prototype._handleMessage = function(topic, message) {
	topic = topic && topic.toString();
	if (topic !== TaskStatusClient.taskTopic) { return; }
	message = Container.decode(message);
	this.emit('message', message);

	if (message.type === ContainerType.MT_PING) {
		this.sendPingAcknowledge();
	} else if (message.type === ContainerType.MT_EMCSTAT_FULL_UPDATE) {
		this.status = extendStatus({}, message.emc_status_task);
		this.emit('statuschanged', this.status);
	} else if (message.type === ContainerType.MT_EMCSTAT_INCREMENTAL_UPDATE) {
		extendStatus(this.status, message.emc_status_task);
		this.emit('statuschanged', this.status);
	} else {
		console.log('Unknown message type', message.type);
	}
};
TaskStatusClient.prototype.send = function(message) {
	var encoded = Container.encode(message);
	var sendBuffer = encoded.buffer.slice(0, encoded.limit);
	this.socket.send(sendBuffer);
};
TaskStatusClient.prototype.sendPingAcknowledge = function() {
	this.socket.send({
		type: ContainerType.MT_PING_ACKNOWLEDGE
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

module.exports = TaskStatusClient;