var StatusClient = require('./statusclient');
var util = require('util');

function TaskStatusClient(address) {
  StatusClient.call(this, address, 'task');
}
util.inherits(TaskStatusClient, StatusClient);
module.exports = TaskStatusClient;
