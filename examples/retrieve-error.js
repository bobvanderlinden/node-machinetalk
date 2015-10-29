var machinetalk = require('..');
var machinetalkbrowser = new machinetalk.MachineTalkBrowser();

machinetalkbrowser.on('serviceUp', function(machine, service, dsn) {
  if (service === 'error') {
    initializeErrorClient(dsn);
  }
});

machinetalkbrowser.start();

function initializeErrorClient(dsn, topic) {
  errorclient = new machinetalk.ErrorClient(dsn);
  errorclient.on('message:error', function(message) {
    console.log('error', message);
  });
  errorclient.on('message:display', function(message) {
    console.log('display', message);
  });
  errorclient.on('message:text', function(message) {
    console.log('text', message);
  });
  errorclient.connect();
  return errorclient;
}
