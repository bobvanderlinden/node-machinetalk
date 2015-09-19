var MachineTalkBrowser = require('./machinetalkbrowser');
var TaskStatusClient = require('./taskstatusclient');
var TaskCommandClient = require('./taskcommandclient');

var machinetalkbrowser = new MachineTalkBrowser();
var taskstatusclient, taskcommandclient;
machinetalkbrowser.on('machineUp', function(machine) {
  console.log('Machine', machine.uuid, 'up');
});
machinetalkbrowser.on('machineDown', function(machine) {
  console.log('Machine', machine.uuid, 'down');
});
machinetalkbrowser.on('serviceUp', function(machine, service, dsn) {
  console.log('Machine', machine.uuid, ': Service', service, ':', dsn);
  if (service === 'status') {
    initializeTaskStatusClient(dsn);
  } else if (service === 'command') {
    initializeTaskCommandClient(dsn);
  }
});
machinetalkbrowser.on('serviceDown', function(machine, service, dsn) {
  console.log('Machine', machind.uuid, ': Service', service, 'down');
});

machinetalkbrowser.start();

function initializeTaskStatusClient(dsn) {
  taskstatusclient = new TaskStatusClient(dsn);
  taskstatusclient.on('statuschanged', function(status) {
    console.log('taskstatus:', status);
  });

  taskstatusclient.connect();
}

function initializeTaskCommandClient(dsn) {
  taskcommandclient = new TaskCommandClient(dsn);
  taskcommandclient.connect();
  console.log('Pinging...');
  taskcommandclient.ping(function() {
    console.log('Ping acknowledged');
    setTimeout(function() {
      taskcommandclient.emcTaskSetMode('execute', 1);
      taskcommandclient.emcTaskSetState('execute', 1);
      taskcommandclient.emcTaskSetState('execute', 2);
      taskcommandclient.emcTaskSetState('execute', 4);
      taskcommandclient.emcAxisUnhome(0);
      taskcommandclient.emcAxisHome(0);
    }, 1000);
  });
}