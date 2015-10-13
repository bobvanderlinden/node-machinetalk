var machinetalk = require('..');
var machinetalkbrowser = new machinetalk.MachineTalkBrowser();

machinetalkbrowser.on('machineUp', function(machine) {
  console.log('Machine', machine.uuid, 'up');
});
machinetalkbrowser.on('machineDown', function(machine) {
  console.log('Machine', machine.uuid, 'down');
});
machinetalkbrowser.on('serviceUp', function(machine, service, dsn) {
  console.log('Machine', machine.uuid, ': Service', service, ':', dsn);
});
machinetalkbrowser.on('serviceDown', function(machine, service, dsn) {
  console.log('Machine', machind.uuid, ': Service', service, 'down');
});

machinetalkbrowser.start();
