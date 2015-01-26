Ques
====

> An new architecture which deal with how to implement and use a component

`[Warning] This project is under heavy development. Not ready for primetime.`

### 优点

* 合理的`分层`、`聚合`：
    1. ViewModel层中`模版`、`样式`、`脚本`以`Component`为单位聚合，而不是反人类地分别在template、css、js目录中
    2. Model层负责`数据`和`业务逻辑`的处理
* 基于`EventEmitter`的通讯机制，高度`解耦`
* CommonJS式编程，纯正的NodeJS编程体验，可非常简单地对Model层做更适当的`分离`
* 一次引用，线下手段实现`Custom Element`，使得只需在HTML中一次引入，便可使用，无需像从前那样在分别在引用模版、样式、脚本。像拼乐高一样，拼装页面
* 细粒度打包机制，可以页面力度进行打包，即发布可以页面为粒度进行发布
* `Feature Flag`机制，可以任意关闭`Component`，但不会引起程序异常
* 基于约定的`Component`命名空间，用`$__`表征`Component`的命名空间，通过线下手段动态生成相应的命名空间，例如：对于一个名为`mytext`的Component，路径应当为`components/mytext`，则Ques自动将其源代码中的`$__`替换成`mytext`：
    1. Component可以在任何时候换名，相互替换，以此来实现一种Component的`依赖注入`
    2. 简单地解决了CSS没有命名空间的问题，做到良好隔离

### 演示

* 编辑过程

![i](https://cloud.githubusercontent.com/assets/2239584/5889955/d24e8814-a47b-11e4-9a6e-0b2abf03b14c.gif)

[清晰动画 >>](https://cloud.githubusercontent.com/assets/2239584/5889906/bf180eac-a479-11e4-9564-0a9d8da22793.gif)

* 生成代码

```html
<!DOCTYPE html>
<html>
<head>
<style>
* {
    margin: 0;
    padding: 0;
}
</style>
<link rel="stylesheet" href="./components/tnav/main.css"><link rel="stylesheet" href="./components/theader/main.css"><link rel="stylesheet" href="./components/clkchange/main.css"><link rel="stylesheet" href="./components/ttext/main.css"></head>
<body>
<ul class="tnav__container component-1"> <li><a href="/index.html">&#x9759;&#x6001;&#x7ED1;&#x5B9A;</a></li> <li><a href="/todomvc.html">todoMVC</a></li> <li><a href="/client.html" target="_blank">&#x9F50;&#x9F50;</a></li></ul>
<div class="theader__container component-2"> <h1 class="theader__title" q-text="title">Ques</h1> <p class="theader__text" q-text="text">Hello world</p></div>
<a href="javascript:void(0);" class="clkchange__anchor component-3" q-on="click: setMessage" q-text="message" id="test">change me</a>
<div class="ttext__container component-4" id="mytext"> <p class="ttext__text" q-text="text | capitalize"></p></div>

<script src="/lib/parallel-require.js"></script>
<script config="true">
require.config({ paths: {"jquery":"/lib/jquery.min.js","Q":"/lib/Q.js","filters":"/lib/cjs/filters.js","utils":"/lib/cjs/utils.js","commonapi":"/lib/commonapi.js","jquery.contextMenu":"/lib/jquery.contextMenu.js"}});
</script><script main="true">
require(['./components/tnav/main.js', './components/theader/main.js', './components/clkchange/main.js', './components/ttext/main.js'], function () {
for (var i = 0, l = arguments.length; i < l; i++) {
arguments[i].init && arguments[i].init('.component-' + (i + 1));
}

// require Q.js
require(['Q'], function (Q) {
    // get the Q instance of #test element
    var changeMe = Q.get('#test'),
    // get the Q instance of #mytext element
        myText = Q.get('#mytext');
    // bind change event
    changeMe.$on('change', function (value) {
        // when change event trigger,
        // set the #mytext element's property
        myText.$set('text', value);
    });
});

});
</script></body>
</html>
```

### 快速开始

* 安装依赖
> npm install

* 运行学习环境
> gulp learn

* 浏览DEMO
打开浏览器，打开页面：http://localhost:3000/learn

### 基本命令

* 启动学习环境

> gulp lean

打开浏览器，打开页面：http://localhost:3000/learn

* 启动开发环境

> gulp app

打开浏览器，打开页面：http://localhost/index.html

* 构建

> gulp

生成到dist文件夹，具体请参见`gulpfile.js`。

### 简介

> `Ques` 是一个基于`动态构建`、`MVVM`，解决如何实现组件、使用组件的整体解决方案。

* 动态构建

即通过`本地服务器`，实现源代码动态生成，有别于通常的`watch`方式构建，详情请参考：

https://github.com/miniflycn/middleware-pipe/issues/3

* MVVM

为了满足自身业务需求，我们实现了自己的`伪MVVM`库：[Q.js](https://github.com/miniflycn/Q.js)，通过Q.js，我们实现`MV`与`Controller`，`节点操作`与`数据`的分离。

### 基本思想

* 编码越自由，代码越难预测
* 代码越可预测，分离越清晰，越可维护
* 大部分线上的问题（例如：`Web Component性能问题`、`代码组织与上线代码问题`）都可以通过线下解决
