function Plan(count, done) {  
  this._done = done;
  this.count = count;
}

Plan.prototype.done = function() {  
  if (this.count === 0) {
    assert(false, 'Too many done called');
  } else {
    this.count--;
  }

  if (this.count === 0) {
    this._done();
  }
};

module.exports = Plan;