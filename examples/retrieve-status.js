var machinetalk = require('..');
var machinetalkbrowser = new machinetalk.MachineTalkBrowser();

machinetalkbrowser.on('serviceUp', function(machine, service, dsn) {
  if (service === 'status') {
    initializeStatusClient(dsn);
  }
});

machinetalkbrowser.start();

function initializeStatusClient(dsn, topic) {
  statusclient = new machinetalk.StatusClient(dsn);

  statusclient.subscribe('task');
  statusclient.subscribe('motion');
  statusclient.subscribe('io');
  statusclient.subscribe('interp');

  statusclient.on('motionstatuschanged', function(status) {
    console.log(status.position.x, status.position.y, status.position.z);
  });

  statusclient.connect();
  return statusclient;
}
