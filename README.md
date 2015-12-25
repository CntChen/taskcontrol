# taskcontorl

#### 异步任务并发和重试控制的node模块

## 需求
* 对于大量的异步任务(网络请求),希望可以通过并发来提高效率
* 对于可能失败的任务,希望可以自动重试

## 安装
> npm install git://github.com/CntChen/taskcontrol.git

## 使用
* 初始化
```
// 直接初始化
var TaskControl = require('taskcontrol');
var myTaskControl = new TaskControl();
```
```
// 指定配置参数初始化
var TaskControl = require('taskcontrol');
var opt = {
	multi: 5, // 任务并发数, default:5
	retry: 5  // 任务重试次数, default:5 
}
var myTaskControl = new TaskControl(opt);
```

* 方法

1. `myTaskControl.addTask(task)` 添加任务,通过多次调用添加多个任务
  * task 包含特定参数的函数,必须有两个参数,这两个参数都是函数,参数1在task完成触发,参数2在task失败触发
  * task参数1,`taskEnd`,在异步任务完成时调用,通知`taskontrol`任务完成
  * task参数2,`taskError`,在异步任务出错时调用,通知`taskcontorl`重试

demo
```
var task = function(taskEnd, taskError) {
    var queryStr = 'https://github.com';
    var token = 'taskOne';
    https.get(queryStr, function(res) {
      var data = '';
      res.on('data', function(chunk) {
        data = data + chunk;
      });
      res.on('end', function() {
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
// add
myTaskControl.addTask(task);

```

2. `myTaskControl.finish(func)` 添加所有任务完成后的回调函数

```
myTaskControl.finish(function() {
  console.log('all task finish');
});
```

3. `myTaskControl.start()` 在添加异步任务后开始并发执行

## 可能的下一步工作
* 任务进度提示和任务动态添加
* 多线程
* 将网络请求封装在模块内部,简化使用难度