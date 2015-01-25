Ques
====

> An new architecture which deal with how to implement and use a component

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
