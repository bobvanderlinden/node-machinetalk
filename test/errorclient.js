var assert = require('assert');
var zmq = require('zmq');
var machinetalk = require('..');
var Plan = require('./lib/plan');
var Container = machinetalk.protobuf.message.Container;
var ContainerType = machinetalk.protobuf.message.ContainerType;
var ErrorClient = machinetalk.ErrorClient;

function ErrorPublisher(address) {
  this.socket = zmq.socket('pub');
  this.socket.bindSync(address);
}
ErrorPublisher.prototype.send = function(topic, type, note) {
  var message = {
    type: type,
    note: note
  };
  var encoded = Container.encode(message);
  var sendBuffer = encoded.buffer.slice(0, encoded.limit);
  this.socket.send([topic, sendBuffer]);
};
ErrorPublisher.prototype.close = function close() {
  this.socket.close();
};

describe('ErrorClient', function() {
  describe('while connected', function() {
    var publisher;
    var errorClient;
    var address = 'tcp://127.0.0.1:5000';
    beforeEach(function() {
      publisher = new ErrorPublisher(address);
      errorClient = new ErrorClient(address);
    });
    afterEach(function() {
      errorClient.close();
      publisher.close();
    });

    it('emits message:error and message:error:operator when operator error is received', function(done) {
      var plan = new Plan(2, done);
      errorClient.on('message:error', function(message) {
        assert.equal(message.type, ContainerType.MT_EMC_OPERATOR_ERROR);
        assert.equal(message.note, '1234');
        plan.done();
      });
      errorClient.on('message:error:operator', function(message) {
        assert.equal(message.type, ContainerType.MT_EMC_OPERATOR_ERROR);
        assert.equal(message.note, '1234');
        plan.done();
      });
      errorClient.connect();
      publisher.send('error', ContainerType.MT_EMC_OPERATOR_ERROR, '1234');
    });
    it('emits message:text when nml text is received', function(done) {
      errorClient.on('message:text', function(message) {
        assert.equal(message.type, ContainerType.MT_EMC_NML_TEXT);
        assert.equal(message.note, '1234');
        done();
      });
      errorClient.connect();
      publisher.send('text', ContainerType.MT_EMC_NML_TEXT, '1234');
    });
    it('emits message:display and message:display:nml when nml display is received', function(done) {
      var plan = new Plan(2, done);
      errorClient.on('message:display', function(message) {
        assert.equal(message.type, ContainerType.MT_EMC_NML_DISPLAY);
        assert.equal(message.note, '1234');
        plan.done();
      });
      errorClient.on('message:display:nml', function(message) {
        assert.equal(message.type, ContainerType.MT_EMC_NML_DISPLAY);
        assert.equal(message.note, '1234');
        plan.done();
      });
      errorClient.connect();
      publisher.send('display', ContainerType.MT_EMC_NML_DISPLAY, '1234');
    });
  });
});