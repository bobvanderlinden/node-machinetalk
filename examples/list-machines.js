var machinetalk = require('..');
var machinetalkbrowser = new machinetalk.MachineTalkBrowser();

machinetalkbrowser.on('machineUp', function(machine) {
  console.log('Machine', machine.uuid, 'up');
});
machinetalkbrowser.on('machineDown', function(machine) {
  console.log('Machine', machine.uuid, 'down');
});
machinetalkbrowser.on('serviceUp', function(service) {
  console.log('Machine', service.machine.uuid, ': Service', service.name, ':', service.dsn);
});
machinetalkbrowser.on('serviceDown', function(service) {
  console.log('Machine', service.machine.uuid, ': Service', service.name, 'down');
});

machinetalkbrowser.start();
