var EventEmitter = require('events').EventEmitter;
var util = require('util');
var zmq = require('zmq');
var _ = require('underscore');
var protobufMessage = require('machinetalk-protobuf').message;
var Container = protobufMessage.Container;
var ContainerType = protobufMessage.ContainerType;

function TaskCommandClient(address) {
  this.replyHandlers = [];
  this.address = address;
  this.socket = zmq.socket('dealer');
  this.socket.identity = 'node-machinetalk-' + Math.random();
  this.socket.on('message', this._handleMessage.bind(this));
  this.DEFAULT_TIMEOUT = TaskCommandClient.DEFAULT_TIMEOUT;
}
util.inherits(TaskCommandClient, EventEmitter);
TaskCommandClient.DEFAULT_TIMEOUT = 1000;
TaskCommandClient.prototype.connect = function() {
  this.socket.connect(this.address);
};
TaskCommandClient.prototype.close = function() {
  this.socket.close();
};

// Axis
TaskCommandClient.prototype.emcAxisAbort = function(index) {
  this.sendEmc(ContainerType.MT_EMC_AXIS_ABORT, {
    index: index
  });
};
TaskCommandClient.prototype.emcAxisHome = function(index) {
  this.sendEmc(ContainerType.MT_EMC_AXIS_HOME, {
    index: index
  });
};
TaskCommandClient.prototype.emcAxisIncrJog = function(index, velocity, distance) {
  this.sendEmc(ContainerType.MT_EMC_AXIS_INCR_JOG, {
    index: index,
    velocity: velocity,
    distance: distance
  });
};
TaskCommandClient.prototype.emcAxisJog = function(index, velocity) {
  this.sendEmc(ContainerType.MT_EMC_AXIS_JOG, {
    index: index,
    velocity: velocity
  });
};
TaskCommandClient.prototype.emcAxisSetMaxPositionLimit = function(index, value) {
  this.sendEmc(ContainerType.MT_EMC_AXIS_SET_MAX_POSITION_LIMIT, {
    index: index,
    value: value
  });
};
TaskCommandClient.prototype.emcAxisSetMinPositionLimit = function(index, value) {
  this.sendEmc(ContainerType.MT_EMC_AXIS_SET_MIN_POSITION_LIMIT, {
    index: index,
    value: value
  });
};
TaskCommandClient.prototype.emcAxisUnhome = function(index) {
  this.sendEmc(ContainerType.MT_EMC_AXIS_UNHOME, {
    index: index
  });
};

// Coolant
TaskCommandClient.prototype.emcCoolantFloodOff = function() {
  this.sendEmc(ContainerType.MT_EMC_COOLANT_FLOOD_OFF);
};
TaskCommandClient.prototype.emcCoolantFloodOn = function() {
  this.sendEmc(ContainerType.MT_EMC_COOLANT_FLOOD_ON);
};
TaskCommandClient.prototype.emcCoolantMistOff = function() {
  this.sendEmc(ContainerType.MT_EMC_COOLANT_MIST_OFF);
};
TaskCommandClient.prototype.emcCoolantMistOn = function() {
  this.sendEmc(ContainerType.MT_EMC_COOLANT_MIST_ON);
};
TaskCommandClient.prototype.emcMotionAdaptive = function(enable) {
  this.sendEmc(ContainerType.MT_EMC_MOTION_ADAPTIVE, {
    enable: enable
  });
};

// Motion
TaskCommandClient.prototype.emcMotionSetAout = function(index, value) {
  this.sendEmc(ContainerType.MT_EMC_MOTION_SET_AOUT, {
    index: index,
    value: value
  });
};
TaskCommandClient.prototype.emcMotionSetDout = function(index, enable) {
  this.sendEmc(ContainerType.MT_EMC_MOTION_SET_DOUT, {
    index: index,
    enable: enable
  });
};

// Spindle
TaskCommandClient.prototype.emcSpindleConstant = function() {
  this.sendEmc(ContainerType.MT_EMC_SPINDLE_CONSTANT);
};
TaskCommandClient.prototype.emcSpindleDecrease = function() {
  this.sendEmc(ContainerType.MT_EMC_SPINDLE_DECREASE);
};
TaskCommandClient.prototype.emcSpindleIncrease = function() {
  this.sendEmc(ContainerType.MT_EMC_SPINDLE_INCREASE);
};
TaskCommandClient.prototype.emcSpindleOff = function() {
  this.sendEmc(ContainerType.MT_EMC_SPINDLE_OFF);
};
TaskCommandClient.prototype.emcSpindleOn = function(velocity) {
  this.sendEmc(ContainerType.MT_EMC_SPINDLE_ON, {
    velocity: velocity
  });
};
TaskCommandClient.prototype.emcSplindleBrakeEngage = function() {
  this.sendEmc(ContainerType.MT_EMC_SPINDLE_BRAKE_ENGAGE);
};
TaskCommandClient.prototype.emcSplindleBrakeRelease = function() {
  this.sendEmc(ContainerType.MT_EMC_SPINDLE_BRAKE_RELEASE);
};

// Task
TaskCommandClient.prototype.emcTaskAbort = function(interp_name) {
  this.sendEmcInterp(ContainerType.MT_EMC_TASK_ABORT, interp_name);
};
TaskCommandClient.prototype.emcTaskPlanExecute = function(interp_name, command) {
  this.sendEmcInterp(ContainerType.MT_EMC_TASK_PLAN_EXECUTE, interp_name, {
    command: command
  });
};
TaskCommandClient.prototype.emcTaskPlanInit = function(interp_name) {
  this.sendEmcInterp(ContainerType.MT_EMC_TASK_PLAN_INIT, interp_name);
};
TaskCommandClient.prototype.emcTaskPlanOpen = function(interp_name, path) {
  this.sendEmcInterp(ContainerType.MT_EMC_TASK_PLAN_OPEN, interp_name, {
    path: path
  });
};
TaskCommandClient.prototype.emcTaskPlanPause = function(interp_name) {
  this.sendEmcInterp(ContainerType.MT_EMC_TASK_PLAN_PAUSE, interp_name, {
  });
};
TaskCommandClient.prototype.emcTaskPlanResume = function(interp_name) {
  this.sendEmcInterp(ContainerType.MT_EMC_TASK_PLAN_RESUME, interp_name, {
  });
};
TaskCommandClient.prototype.emcTaskPlanRun = function(interp_name, line_number) {
  this.sendEmcInterp(ContainerType.MT_EMC_TASK_PLAN_RUN, interp_name, {
    line_number: line_number
  });
};
TaskCommandClient.prototype.emcTaskPlanStep = function(interp_name) {
  this.sendEmcInterp(ContainerType.MT_EMC_TASK_PLAN_STEP, interp_name, {
  });
};
TaskCommandClient.prototype.emcTaskPlanSetBlockDelete = function(enable) {
  this.sendEmc(ContainerType.MT_EMC_TASK_PLAN_SET_BLOCK_DELETE, {
    enable: enable
  });
};
TaskCommandClient.prototype.emcTaskPlanSetOptionalStop = function(enable) {
  this.sendEmc(ContainerType.MT_EMC_TASK_PLAN_SET_OPTIONAL_STOP, {
    enable: enable
  });
};
TaskCommandClient.prototype.emcTaskSetMode = function(interp_name, task_mode) {
  this.sendEmcInterp(ContainerType.MT_EMC_TASK_SET_MODE, interp_name, {
    task_mode: task_mode
  });
};
TaskCommandClient.prototype.emcTaskSetState = function(interp_name, task_state) {
  this.sendEmcInterp(ContainerType.MT_EMC_TASK_SET_STATE, interp_name, {
    task_state: task_state
  });
};
TaskCommandClient.prototype.emcTaskTrajSetSoEnable = function(enable) {
  this.sendEmc(ContainerType.MT_EMC_TRAJ_SET_SO_ENABLE, {
    enable: enable
  });
};

// Traj
TaskCommandClient.prototype.emcTrajSetFhEnable = function(enable) {
  this.sendEmc(ContainerType.MT_EMC_TRAJ_SET_FH_ENABLE, {
    enable: enable
  });
};
TaskCommandClient.prototype.emcTrajSetFoEnable = function(enable) {
  this.sendEmc(ContainerType.MT_EMC_TRAJ_SET_FO_ENABLE, {
    enable: enable
  });
};
TaskCommandClient.prototype.emcTrajSetMaxVelocity = function(velocity) {
  this.sendEmc(ContainerType.MT_EMC_TRAJ_SET_MAX_VELOCITY, {
    velocity: velocity
  });
};
TaskCommandClient.prototype.emcTrajSetMode = function(traj_mode) {
  this.sendEmc(ContainerType.MT_EMC_TRAJ_SET_MODE, {
    traj_mode: traj_mode
  });
};
TaskCommandClient.prototype.emcTrajSetScale = function(scale) {
  this.sendEmc(ContainerType.MT_EMC_TRAJ_SET_SCALE, {
    scale: scale
  });
};
TaskCommandClient.prototype.emcTrajSetSpindleScale = function(scale) {
  this.sendEmc(ContainerType.MT_EMC_TRAJ_SET_SPINDLE_SCALE, {
    scale: scale
  });
};
TaskCommandClient.prototype.emcTrajSetTeleopEnable = function(enable) {
  this.sendEmc(ContainerType.MT_EMC_TRAJ_SET_TELEOP_ENABLE, {
    enable: enable
  });
};
TaskCommandClient.prototype.emcTrajSetTeleopVector = function(a, b, c, u, v, w) {
  this.sendEmc(ContainerType.MT_EMC_TRAJ_SET_TELEOP_VECTOR, {
    pose: {
      a: a,
      b: b,
      c: c,
      u: u,
      v: v,
      w: w
    }
  });
};
TaskCommandClient.prototype.emcTrajSetTeleopVector = function(index, zOffset, xOffset, diameter, frontangle, backangle, orientation) {
  this.sendEmc(ContainerType.MT_EMC_TRAJ_SET_TELEOP_VECTOR, {
    tool_data: {
      index: index,
      zOffset: zOffset,
      xOffset: xOffset,
      diameter: diameter,
      frontangle: frontangle,
      backangle: backangle,
      orientation: orientation
    }
  });
};

// Misc
TaskCommandClient.prototype.ping = function(callback) {
  this.registerForReply(messageTypePredicate(ContainerType.MT_PING_ACKNOWLEDGE), callback);
  this.send({
    type: ContainerType.MT_PING
  });
};
TaskCommandClient.prototype.shutdown = function(callback) {
  this.registerForReply(messageTypePredicate(ContainerType.MT_CONFIRM_SHUTDOWN), callback);
  this.send({
    type: ContainerType.MT_SHUTDOWN
  });
};
TaskCommandClient.prototype.emcOverrideLimits = function() {
  this.sendEmc(ContainerType.MT_EMC_AXIS_OVERRIDE_LIMITS);
};
TaskCommandClient.prototype.emcSetDebug = function(debug_level) {
  this.sendEmc(ContainerType.MT_EMC_SET_DEBUG, {
    debug_level: debug_level
  });
};
TaskCommandClient.prototype.emcToolLoadToolTable = function() {
  this.sendEmc(ContainerType.MT_EMC_TOOL_LOAD_TOOL_TABLE);
};

// Helper methods
TaskCommandClient.prototype._handleMessage = function(message) {
  message = Container.decode(message);
  this.emit('message', message);

  for (var i = 0; i < this.replyHandlers.length; i++) {
    var replyHandler = this.replyHandlers[i];
    if (replyHandler(message)) {
      // The reply was handled. Remove the reply handler and 
      // do not call the rest of the replyHandlers.
      this.replyHandlers.splice(i, 1);
      return;
    }
  }
};
TaskCommandClient.prototype.send = function(message) {
  var encoded = Container.encode(message);
  var sendBuffer = encoded.buffer.slice(0, encoded.limit);
  this.socket.send(sendBuffer);
};
TaskCommandClient.prototype.registerForReply = function(replyPredicate, callback) {
  var self = this;

  function replyHandler(message) {
    if (replyPredicate(message) === true) {
      cleanup();
      callback(null, message);
      return true;
    }
    return false;
  }

  var timeout = setTimeout(function() {
    cleanup();
    callback(new Error('Timeout'));
  }, self.DEFAULT_TIMEOUT);

  function cleanup() {
    // Remove our replyHandler from the replyHandlers.
    var replyHandlerIndex = self.replyHandlers.indexOf(replyHandler);
    self.replyHandlers.splice(replyHandlerIndex, 1);

    clearTimeout(timeout);
  }

  self.replyHandlers.push(replyHandler);
};

TaskCommandClient.prototype.sendEmc = function(type, emc_command_params) {
  this.send({
    type: type,
    emc_command_params: emc_command_params
  });
};

TaskCommandClient.prototype.sendEmcInterp = function(type, interp_name, emc_command_params) {
  this.send({
    type: type,
    interp_name: interp_name,
    emc_command_params: emc_command_params
  });
};


function messageTypePredicate(messageType) {
  return function(message) {
    return message.type === messageType;
  };
}

module.exports = TaskCommandClient;