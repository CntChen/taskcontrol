var defaultMulti = 5;
var defaultRetry = 5;
var defaultTaskControlTimeout = 100;


var TaskControl = function(opt) {
  opt = opt || {};
  this.multi = opt.multi || defaultMulti;
  this.retry = opt.retry || defaultRetry;
  this.increaseID = 0;
  this.workingTaskCount = 0;
  this.retryTask = {};
  this.retryTaskTime = {};
  this.workingTask = {};
  this.taskQueue = [];
  this.finishCallback = null;
  this.TaskControlTimeout = defaultTaskControlTimeout;
}


TaskControl.prototype.addTask = function(task) {
  task.id = task.id || ++this.increaseID;
  this.taskQueue.push(task);
}


TaskControl.prototype.start = function() {
  var that = this;
  this.startNextTask();

  setTimeout(function() {
    that.TaskControlTimeout--;
    if (that.TaskControlTimeout <= 0) {
      console.log('TaskControl timeout. Task left:', that.taskQueue.length);
      that.taskQueue.clear();
      that.finishCallback();
    }
  }, 1000);
}


TaskControl.prototype.finish = function(func) {
  this.finishCallback = function() {
    console.log('TaskControl finish');
    func();
  };
}


TaskControl.prototype.end = function(taskID) {
  var that = this;
  return function() {
    delete that.workingTask[taskID];
    that.workingTaskCount--;
    that.startNextTask();
  }
}


TaskControl.prototype.error = function(taskID) {
  var that = this;
  return function() {
    that.retryTaskTime[taskID] = that.retryTaskTime[taskID] || 0;
    that.retryTaskTime[taskID]++;
    if (that.retryTaskTime[taskID] < that.retry && that.workingTask[taskID]) {
      that.taskQueue.unshift(that.workingTask[taskID]);
      console.error('retry:' + taskID);
    } else {
      delete that.retryTaskTime[taskID];
    }

    delete that.workingTask[taskID];
    that.workingTaskCount--;
    that.startNextTask();
  }
}


TaskControl.prototype.startNextTask = function() {
  this.TaskControlTimeout = defaultTaskControlTimeout;

  if (this.taskQueue.length === 0) {
    if (this.workingTaskCount === 0) {
      this.finishCallback && this.finishCallback();
    }
    return;
  }

  var task = this.taskQueue.shift();
  this.workingTask[task.id] = task;
  task(this.end(task.id), this.error(task.id));

  this.workingTaskCount++;
  if (this.workingTaskCount < this.multi) {
    arguments.callee.apply(this);
  }
}

module.exports = TaskControl;