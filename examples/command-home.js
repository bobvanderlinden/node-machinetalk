var machinetalk = require('..');
var machinetalkbrowser = new machinetalk.MachineTalkBrowser();

machinetalkbrowser.on('serviceUp', function(machine, service, dsn) {
  if (service === 'command') {
    initializeTaskCommandClient(dsn);
  }
});

machinetalkbrowser.start();

function initializeTaskCommandClient(dsn) {
  taskcommandclient = new machinetalk.TaskCommandClient(dsn);
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