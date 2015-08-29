var MachineTalkBrowser = require('./machinetalkbrowser');
var TaskStatusClient = require('./taskstatusclient');

var machinetalkbrowser = new MachineTalkBrowser();
var taskstatusclient;
machinetalkbrowser.on('machineUp', function(machine) {
	console.log('Machine',machine.uuid,'up');
});
machinetalkbrowser.on('machineDown', function(machine) {
	console.log('Machine',machine.uuid,'down');
});
machinetalkbrowser.on('serviceUp', function(machine,service,dsn) {
	console.log('Machine',machine.uuid,': Service',service,':',dsn);
	if (service === 'status') {
		initializeTaskStatusClient(dsn);
	}
});
machinetalkbrowser.on('serviceDown', function(machine,service,dsn) {
	console.log('Machine',machind.uuid,': Service',service,'down');
});

machinetalkbrowser.start();

function initializeTaskStatusClient(dsn) {
	taskstatusclient = new TaskStatusClient(dsn);
	taskstatusclient.on('statuschanged', function(status) {
		console.log('taskstatus:',status);
	});

	taskstatusclient.connect();
}