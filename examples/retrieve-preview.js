var machinetalk = require('..');
var machinetalkbrowser = new machinetalk.MachineTalkBrowser();

machinetalkbrowser.on('serviceUp', function(machine, service, dsn) {
  if (service === 'preview') {
    initializePreviewClient(dsn);
  } else if (service === 'command') {
    setTimeout(function() {
      initializeCommandClient(dsn);
    }, 100);
  }
});

machinetalkbrowser.start();

function initializePreviewClient(dsn, topic) {
  previewClient = new machinetalk.PreviewClient(dsn);
  previewClient.on('preview', function(preview) {
    console.log('preview', JSON.stringify(preview, '  ', '  '));
    console.log(preview.length);
  });
  previewClient.connect();

  return previewClient;
}

function initializeCommandClient(dsn) {
  taskcommandclient = new machinetalk.TaskCommandClient(dsn);
  taskcommandclient.connect();
  taskcommandclient.emcTaskPlanOpen('preview', '/home/bob/machinekit/nc_files/3D_Chips.ngc');
  taskcommandclient.emcTaskPlanRun('preview', 0);
}