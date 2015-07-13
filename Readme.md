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
* 一次引用，线下手段实现`Custom Element`，使得只需在HTML中一次引入，便可使用，无需像从前那样在分别在引用模版、样式、脚本。像拼乐高一样，拼装页面。配合模拟Shadow DOM可以很方便的对组件进行扩展
* 细粒度打包机制，可以页面力度进行打包，即发布可以页面为粒度进行发布
* `Feature Flag`机制，可以任意关闭`Component`，但不会引起程序异常
* 基于约定的`Component`命名空间，用`$__`表征`Component`的命名空间，通过线下手段动态生成相应的命名空间，例如：对于一个名为`mytext`的Component，路径应当为`components/mytext`，则Ques自动将其源代码中的`$__`替换成`mytext`：
    1. Component可以在任何时候换名，相互替换，以此来实现一种Component的`依赖注入`
    2. 简单地解决了CSS没有命名空间的问题，做到良好隔离

### 演示

* 编辑过程

![i](https://cloud.githubusercontent.com/assets/2239584/5889955/d24e8814-a47b-11e4-9a6e-0b2abf03b14c.gif)

[清晰动画 >>](https://cloud.githubusercontent.com/assets/2239584/5889906/bf180eac-a479-11e4-9564-0a9d8da22793.gif)

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

* 升级

> gulp update

更新到`miniflycn/Ques`主干的最新版本。

### 简介

> `Ques` 是一个基于`动态构建`、`MVVM`，解决如何实现组件、使用组件的整体解决方案。简单的说是Web Component的线下实现方案。

* 动态构建

即通过`本地服务器`，实现源代码动态生成，有别于通常的`watch`方式构建，详情请参考：

https://github.com/miniflycn/middleware-pipe/issues/3

* MVVM

为了满足自身业务需求，我们实现了自己的`伪MVVM`库：[Q.js](https://github.com/miniflycn/Q.js)，通过Q.js，我们实现`MV`与`Controller`，`节点操作`与`数据`的分离。

### 简单案例

* 目录结构

```
/src
    /components                 组件的目录
        /my
            /btn                my-btn(我的按钮标签)组件目录
                main.js         my-btn组件的逻辑
                main.css        my-btn组件的样式
                main.html       my-btn组件的模版
    /lib                        通用库放置的地方
    /pages                      controller目录
        /hello                  hello页面的controller目录
            main.js             hello页面的controller逻辑
    hello.html                  hello页面
```

* 创建一个组件

1. /src/components/my/p/main.html

```html
<button class="ui-button ui-info" q-on="click: showAlert">
    <content></content>
</button>
```

2. /src/components/my/p/main.js

```javascript
// 这是一个Q.js的参数，具体可参考：
// https://github.com/imweb/Q.js
module.exports = {
    data: {
        msg: 'hello world'
    },
    methods: {
        showAlert: function () {
            // 打印出msg的值，上面设置成了hello world
            alert(this.msg);
        }
    }
};
```

这样则完成了一个按钮component，即点击的时候弹出hello world。

* 在页面上引用该组件

/src/hello.html

```html
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
<title>qiqi</title>
</head>
<body>
<!-- 引入my-button组件，其模版中的content标签被替换成“请按我”，当点击该按钮弹出'hello world' -->
<my-button id="my-button">请按我</my-button>

<!-- 声明入口文件是：/pages/hello/main.js -->
<script src="./pages/hello/main"></script>
</body>
</html>
```

* 现在我希望五秒钟后点击不再显示'hello world'，而显示”你好“。

/src/pages/hello/main.js

```javascript
var Q = require('Q');

function init() {
    var myButton = Q.get('#my-button');

    setTimeout(function () {
        myButton.$set('msg', '你好');
    }, 5000);
}

module.exports = {
    init: init
};
```
