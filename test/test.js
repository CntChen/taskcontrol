var https = require('https');
var TaskControl = require('./../src/taskcontrol.js');
var httpQueryTaskControl = new TaskControl({
  multi: 2,
  retry: 5
});

// demo url: https://www.zhihu.com/question/38287243
var zhihuUrl = 'https://www.zhihu.com/question/';
var questionIndex = 38287243;

var testLenght = 80;

for (var i = 0; i < testLenght; i++) {
  var queryStr = zhihuUrl + (questionIndex + i);
  var token = 'question' + (questionIndex + i);
  var task = (function(token, queryStr) {
    return function(taskEnd, taskError) {
      https.get(queryStr, function(res) {
        var data = '';
        res.on('data', function(chunk) {
          data = data + chunk;
        });
        res.on('end', function() {
          try {
            var title = data.match(/^[\w\W]*<title>\s*([\w\W]*?)\s*<\/title>[\w\W]*$/)[1];
          } catch (e) {
            title = 'not found';
          }
          console.log(token, 'title:', title);
          console.error(token, 'end');
          taskEnd();
        });
        res.on('error', function() {
          console.error(token, 'error');
          taskError();
        });
      }).on('error', function(e) {
        taskError();
        this.destroy();
      }).setTimeout(30000, function() {
        console.error(token, 'timeout');
        this.abort();
      });
    }
  })(token, queryStr);

  httpQueryTaskControl.addTask(task);

}

httpQueryTaskControl.start();
httpQueryTaskControl.finish(function() {
  console.log('all task finish');
});