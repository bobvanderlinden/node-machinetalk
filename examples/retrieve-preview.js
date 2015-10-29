var machinetalk = require('..');
var machinetalkbrowser = new machinetalk.MachineTalkBrowser();

machinetalkbrowser.on('serviceUp', function(machine, service, dsn) {
  if (service === 'preview') {
    initializePreviewClient(dsn);
  }
});

machinetalkbrowser.start();

function initializePreviewClient(dsn, topic) {
  previewClient = new machinetalk.PreviewClient(dsn);
  previewClient.on('preview', function(preview) {
    console.log('preview', preview);
  });
  previewClient.connect();
  return previewClient;
}
