var machinetalk = require('..');
var machinetalkbrowser = new machinetalk.MachineTalkBrowser();

machinetalkbrowser.on('serviceUp', function(machine, service, dsn) {
  if (service === 'status') {
    initializeStatusClient(dsn, 'task');
    initializeStatusClient(dsn, 'motion');
    initializeStatusClient(dsn, 'io');
    initializeStatusClient(dsn, 'interp');
  } 
});

machinetalkbrowser.start();

function initializeStatusClient(dsn, topic) {
  statusclient = new machinetalk.StatusClient(dsn, topic);
  statusclient.on('statuschanged', function(status) {
    console.log('status:', topic + ':', status);
  });

  statusclient.connect();
  return statusclient;
}
