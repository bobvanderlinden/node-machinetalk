var assert = require('assert');
var zmq = require('zmq');
var machinetalk = require('..');
var Container = machinetalk.protobuf.message.Container;
var ContainerType = machinetalk.protobuf.message.ContainerType;
var StatusClient = machinetalk.StatusClient;

describe('StatusClient', function() {
  var socket;
  var address = 'tcp://127.0.0.1:5000';
  beforeEach(function() {
    socket = zmq.socket('pub');
    socket.bindSync(address);
  });
  afterEach(function() {
    socket.close();
  });
  it('can retrieve motion status with position', function(cb) {
    var statusClient = new StatusClient(address, 'motion');
    statusClient.on('statuschanged', function(status) {
      assert.equal(status.position.x, 1);
      assert.equal(status.position.y, 2);
      assert.equal(status.position.z, 3);
      statusClient.close();
      cb();
    });
    statusClient.connect();

    var encoded = Container.encode({
      type: ContainerType.MT_EMCSTAT_FULL_UPDATE,
      emc_status_motion: {
        position: { x: 1, y: 2, z: 3 }
      }
    });
    var sendBuffer = encoded.buffer.slice(0, encoded.limit);
    socket.send(['motion', sendBuffer]);
  });
});