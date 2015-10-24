var assert = require('assert');
var zmq = require('zmq');
var machinetalk = require('..');
var Container = machinetalk.protobuf.message.Container;
var ContainerType = machinetalk.protobuf.message.ContainerType;
var StatusClient = machinetalk.StatusClient;

function StatusPublisher(address) {
  this.socket = zmq.socket('pub');
  this.socket.bindSync(address);
}
StatusPublisher.prototype.publishFullStatus = function(topic, status) {
  var message = {
    type: ContainerType.MT_EMCSTAT_FULL_UPDATE
  };
  message['emc_status_' + topic] = status;
  this.send(topic, message);
};
StatusPublisher.prototype.publishIncrementalStatus = function(topic, status) {
  var message = {
    type: ContainerType.MT_EMCSTAT_INCREMENTAL_UPDATE
  };
  message['emc_status_' + topic] = status;
  this.send(topic, message);
};
StatusPublisher.prototype.send = function(topic, message) {
  var encoded = Container.encode(message);
  var sendBuffer = encoded.buffer.slice(0, encoded.limit);
  this.socket.send([topic, sendBuffer]);
};
StatusPublisher.prototype.close = function close() {
  this.socket.close();
};

describe('StatusClient', function() {
  describe('while connected', function() {
    var publisher;
    var statusClient;
    var address = 'tcp://127.0.0.1:5000';
    beforeEach(function() {
      publisher = new StatusPublisher(address);
      statusClient = new StatusClient(address, 'motion');
    });
    afterEach(function() {
      statusClient.close();
      publisher.close();
    });

    it('emits statuschanged when full status is received', function(done) {
      statusClient.on('statuschanged', function(status) {
        assert.equal(status.position.x, 1);
        assert.equal(status.position.y, 2);
        assert.equal(status.position.z, 3);

        assert.equal(statusClient.status.position.x, 1);
        assert.equal(statusClient.status.position.y, 2);
        assert.equal(statusClient.status.position.z, 3);

        done();
      });
      statusClient.connect();

      publisher.publishFullStatus('motion', {
        position: {
          x: 1,
          y: 2,
          z: 3
        }
      });
    });

    it('emits statuschanged when incremental status is received', function(done) {
      statusClient.once('statuschanged', function(status) {
        statusClient.once('statuschanged', function(status) {
          assert.equal(status.position.x, 5);
          assert.equal(status.position.y, 2);
          assert.equal(status.position.z, 3);

          assert.equal(statusClient.status.position.x, 5);
          assert.equal(statusClient.status.position.y, 2);
          assert.equal(statusClient.status.position.z, 3);

          done();
        });
      });
      statusClient.connect();

      publisher.publishFullStatus('motion', {
        position: {
          x: 1,
          y: 2,
          z: 3
        }
      });
      publisher.publishIncrementalStatus('motion', {
        position: {
          x: 5,
          y: null,
          z: null
        }
      });
    });
  });
});