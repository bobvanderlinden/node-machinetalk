var machinetalk = require('..');
var machinetalkbrowser = new machinetalk.MachineTalkBrowser();

machinetalkbrowser.on('serviceUp', function(machine, service, dsn) {
  if (service === 'status') {
    initializeTaskStatusClient(dsn);
  } 
});

machinetalkbrowser.start();

function initializeTaskStatusClient(dsn) {
  taskstatusclient = new machinetalk.TaskStatusClient(dsn);
  taskstatusclient.on('statuschanged', function(status) {
    console.log('taskstatus:', status);
  });

  taskstatusclient.connect();
}
