Ques
====

> An new architecture which deal with how to implement and use a component

`[Warning] This project is under heavy development. Not ready for primetime.`

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

> Ques是一套组件化系统，解决如何定义、嵌套、扩展、使用组件。

### 传统开发模式的痛点

* 无法方便的引用一个组件，需要分别引用其`Javascript`、`Template`、`CSS`文件
* 我们期望能以`MV*`的方式去写代码，结果发现只有`Javascript`是`MV*`
* UI库打包成一坨(类似`Bootstrap`)，但是实际上UI库伴随产品迭代在反复变更，每次打开网站，用户依然反复下载UI库
* `CSS`没有命名空间导致两个组件容易冲突
* 组件无法嵌套或者无法扩展，所以实际上组件根本无法复用
* 组件无法复制后可用，在组件无法嵌套或无法扩展的情况下，连定制一个组件都困难连连
* 每次性能优化都将代码弄的很恶心，不好维护
* 可能没法支持IE6，例如React、Vuejs、Polymer这些方案IE6肯定不支持

### UI组件

> `UI组件`是用来专门做UI的组件，其特点为只有模版、样式文件。系统会根据用户在页面已使用的`UI组件`动态引用其依赖的资源。注意，`UI组件`的前缀必须是`ui-`。

下面是一个简单的`ui-button`的例子：

##### 定义

* CSS文件

```css
.ui-button {
    display: inline-block;
    padding: 6px 12px;
    margin-bottom: 0;
    font-size: 14px;
    font-weight: 400;
    line-height: 1.42857143;
    text-align: center;
    white-space: nowrap;
    vertical-align: middle;
    touch-action: manipulation;
    cursor: pointer;
    user-select: none;
    background-image: none;
    border: 1px solid transparent;
    border-radius: 4px;
    text-transform: none;
    -webkit-appearance: button;
    overflow: visible;
    margin: 0;
}

.ui-default {
    color:#333;
    background-color:#fff;
    border-color:#ccc
}
.ui-default.focus,.ui-default:focus {
    color:#333;
    background-color:#e6e6e6;
    border-color:#8c8c8c
}
.ui-default:hover {
    color:#333;
    background-color:#e6e6e6;
    border-color:#adadad
}

// 后面可添加更多样式的按钮
```

* 模版文件

```html
<button class="ui-button">
    <content></content>
</button>
```

##### 效果

* 在页面上直接引用：

```html
<ui-button class="ui-default">DEFAULT</ui-button>
<ui-button class="ui-success">SUCCESS</ui-button>
<ui-button class="ui-info">INFO</ui-button>
<ui-button class="ui-warning">WARNING</ui-button>
<ui-button class="ui-danger">DANGER</ui-button>
```

* 展示

![](http://7tszky.com1.z0.glb.clouddn.com/FjYNKPqNhEgEsVLl7EyxzY2niAQS)

这样我们就实现了一个`ui-button`组件，其可以在任意其他组件中嵌套使用。其依赖的资源会动态引用，也就是说，只有我们使用了`ui-button`他的模版和样式才会被引入。

##### 备注

* 由于我们使用了强大的[cssnext](https://github.com/cssnext/cssnext)，所以CSS吐出来的时候会根据配置转换成兼容版本，也就是说我们只需要按照标准去写CSS，系统会自动帮我们适配：

```css
.ui-button {
    display: inline-block;
    padding: 6px 12px;
    margin-bottom: 0;
    font-size: 14px;
    font-weight: 400;
    line-height: 1.42857143;
    text-align: center;
    white-space: nowrap;
    vertical-align: middle;
    -ms-touch-action: manipulation;
        touch-action: manipulation;
    cursor: pointer;
    -webkit-user-select: none;
       -moz-user-select: none;
        -ms-user-select: none;
            user-select: none;
    background-image: none;
    border: 1px solid transparent;
    border-radius: 4px;
    text-transform: none;
    -webkit-appearance: button;
    overflow: visible;
    margin: 0;
}

.ui-default {
    color:#333;
    background-color:#fff;
    border-color:#ccc
}
.ui-default.focus,.ui-default:focus {
    color:#333;
    background-color:#e6e6e6;
    border-color:#8c8c8c
}
.ui-default:hover {
    color:#333;
    background-color:#e6e6e6;
    border-color:#adadad
}
```

* 注意到我们引入了Shadow DOM中的`<content>`标签，`<content>`标签作为Component内部的插入点（或者可以理解成占位符），当外部引用该Component时可以从外部向内部插入节点，例如：

```
<ui-button class="ui-default">DEFAULT</ui-button>
```

则表示向Component的插入点插入DEFAULT这个文字节点。关于`<content>`标签我们后面还会提到其高级应用。

### Component

> Component是最常见的组件，其拥有模版、样式以及逻辑文件，使得这种Component更像一个自定义的元素(Custom Element)。体验上像引入一个`<input>`标签一样，我们可以设置她的值，绑定她的事件，调用她的函数。

下面是一个`dialog`组件的例子：

##### 定义

* CSS文件：

```css
.$__mask {
    position: fixed;
    width: 100%;
    height: 100%;
    padding: 0px;
    margin: 0px;
    left: 0px;
    top: 0px;
    z-index: 999;
    background-color: rgba(0,0,0,.6) !important;
    display: none;
}

.$__mask.show {
    display: block;
}

.$__$ {
    position: fixed;
    top: 10%;
    opacity: .5;
    left: 50%;
    width: 490px;
    margin-left: -245px;
    z-index: 999;
    background: #fff;
    font-size: 14px;
    border-radius: 4px;
    overflow: hidden;
    transition: all 200ms ease-in-out;
}

.$__mask .$__$.show {
    top: 50%;
    opacity: 1;
}

.$__$ .header {
    height: 30px;
    line-height: 30px;
    text-indent: 12px;
    background: #039ae3;
    color: #fff;
    font-size: 14px;
}

.$__$ .body {
    padding: 30px 40px;
    position: relative;
    line-height: 24px;
    max-height: 500px;
    overflow-y: auto;
    overflow-x: hidden;
}

.$__$ .msg {
    margin-left: 66px;
    position: relative;
    top: 10px;
    word-break: break-all;
}

.$__$ .bottom {
    margin: 20px;
    text-align: right;
}

.icon-info-large {
    background: url(http://9.url.cn/edu/img/sprite/common.a8642.png) -41px -276px no-repeat;
    width: 36px;
    height: 36px;
    display: block;
    float: left;
    margin-top: 4px;
}
```

* 模版文件：

```html
<div class="$__mask" q-class="show: isShow">
    <div class="$__$">
        <div class="header">
            <content select="header *"></content>
        </div>
        <div class="body">
            <div class="icon-info-large"></div>
            <div class="msg">
                <content select="article *"></content>
            </div>
        </div>
        <div class="bottom">
            <ui-button class="ui-info" q-on="click: submit">确定</ui-button>
            <ui-button class="ui-default" q-on="click: cancel">取消</ui-button>
        </div>
    </div>
</div>
```

* Javascript文件：

```javascript
var $ = require('jquery');

module.exports = {
    data: {
        isShow: false
    },
    methods: {
        submit: function () {
            this.$emit('submit');
        },
        cancel: function () {
            this.$emit('cancel')
                .hide();
        },
        show: function () {
            this.$set('isShow', true);
        },
        hide: function () {
            this.$set('isShow', false);
        }
    },
    ready: function () {
        var dialog = $('.$__$', this.$el);
        this.$watch('isShow', function (val) {
            if (val) {
                setTimeout(function () {
                    dialog.addClass('show');
                }, 20);
            } else {
                dialog.removeClass(dialog, 'show');
            }
        }, false, true);
    }
}
```

##### 效果

* 在页面直接引入`<dialog>`：

```html
<dialog id="my-dialog">
    <header>
        欢迎使用Ques
    </header>
    <article>
        Hello World!
    </article>
</dialog>
```

* 则可以在Controller中直接使用，例如拿到其实例，再调用其`show`方法，将其展示：

```javascript
var Q = require('Q');

Q.get('#my-dialog')
    .show();
```

* 展示

![](http://7tszky.com1.z0.glb.clouddn.com/Fl40d91rmO3kDOpHo9q21neNmQB_)

##### 备注

* 由于CSS没有命名空间，所以我们引入了两个`$__`和`$__$`两个占位符来充当命名空间，系统会自动转换成当前Component的名字，所以CSS最终变成：

```css
.dialog__mask {
    position: fixed;
    width: 100%;
    height: 100%;
    padding: 0px;
    margin: 0px;
    left: 0px;
    top: 0px;
    z-index: 999;
    background-color: #000000 !important;
    background-color: rgba(0,0,0,.6) !important;
    display: none;
}

.dialog__mask.show {
    display: block;
}

.dialog {
    position: fixed;
    top: 10%;
    opacity: .5;
    left: 50%;
    width: 490px;
    margin-left: -245px;
    z-index: 999;
    background: #fff;
    font-size: 14px;
    border-radius: 4px;
    overflow: hidden;
    -webkit-transition: all 200ms ease-in-out;
            transition: all 200ms ease-in-out;
}

.dialog__mask .dialog.show {
    top: 50%;
    opacity: 1;
}

.dialog .header {
    height: 30px;
    line-height: 30px;
    text-indent: 12px;
    background: #039ae3;
    color: #fff;
    font-size: 14px;
}

.dialog .body {
    padding: 30px 40px;
    position: relative;
    line-height: 24px;
    max-height: 500px;
    overflow-y: auto;
    overflow-x: hidden;
}

.dialog .msg {
    margin-left: 66px;
    position: relative;
    top: 10px;
    word-break: break-all;
}

.dialog .bottom {
    margin: 20px;
    text-align: right;
}

.icon-info-large {
    background: url(http://9.url.cn/edu/img/sprite/common.a8642.png) -41px -276px no-repeat;
    width: 36px;
    height: 36px;
    display: block;
    float: left;
    margin-top: 4px;
}
```

可以看见`$__`被转换成了`dialog__`，而`$__$`被转换成了`dialog`。

* 逻辑层我们使用了MVVM库[Q.js](https://github.com/imweb/Q.js)，这里就不细说了。


* 这里还用到`<content>`标签的高级功能，`select`属性。select属性是用来选择外部符合选择器的节点进行替换。例如：

```html
<content select="header *"></content>
```

的意思是选择外部`<header>`标签内所有东西进行替换，所以“欢迎使用Ques”就被替换进去了。

### 第三方Component

> 第三方Component是一套兼容方案，使得业务方不依赖`Q.js`也能定义一个Component，但是由于系统无法控制第三方组件DOM的作用域，以及实现其扩展似乎没啥意思，所以第三方无法嵌套和扩展。总的来说第三方Component本质上就是系统给第三方一个容器，他在里面干什么，系统就不管了。第三方组件一定以`third-`为前缀。

下面是一个高亮代码`third-code`的例子：

##### 定义

* CSS文件：

```css
.$__pre {
    width: 900px;
    margin: 10px;
}

/**  引入hightlight.js的css库  **/
@import "http://cdnjs.cloudflare.com/ajax/libs/highlight.js/8.6/styles/default.min.css";
```

* 模版文件：

```html
<pre class="$__pre">
    <code>
        <content></content>
    </code>
</pre>
```

* Javascript文件：

```javascript
module.exports = {
    bind: function () {
        var el = this.el,
            script = document.createElement('script');
        script.onload = function () {
            hljs.highlightBlock(el);
        }
        script.src = '//cdnjs.cloudflare.com/ajax/libs/highlight.js/8.6/highlight.min.js';
        document.body.appendChild(script);
    },
    unbind: function () {}
};
```

##### 效果

* 引入`third-code`：

```html
<third-code>
    &lt;ui-button class=&quot;ui-default&quot;&gt;DEFAULT&lt;/ui-button&gt;
    &lt;ui-button class=&quot;ui-success&quot;&gt;SUCCESS&lt;/ui-button&gt;
    &lt;ui-button class=&quot;ui-info&quot;&gt;INFO&lt;/ui-button&gt;
    &lt;ui-button class=&quot;ui-warning&quot;&gt;WARNING&lt;/ui-button&gt;
    &lt;ui-button class=&quot;ui-danger&quot;&gt;DANGER&lt;/ui-button&gt;
</third-code>
```

* 效果：

![](http://7tszky.com1.z0.glb.clouddn.com/Funw4ysq951vGl8cNUX-wFf3CaW1)


##### 备注

* 第三方Component需要实现两个接口`bind`和`unbind`，即在容器创建时需要绑定什么，当容器删除时需要解绑什么。this会带来必要的东西，例如容器、父级ViewModel等等。

### 组件嵌套

> 当组件可以嵌套，组件件可以拆成较小的颗粒，使得复用性大大提升。

下面我们是一个`codeclick`组件，其用途是高亮展示代码片段，点击代码弹出dialog，也就是说我们准备嵌套上面做出来的`third-code`和`dialog`组件：

##### 定义

* CSS文件：

```css
/** 可以给组件定义一些特殊样式，但为了简单我们什么也不做 **/
```

* 模版文件：

```
<div>
    <third-code q-ref="code">
        <content></content>
    </third-code>
    <dialog q-ref="dialog">
        <header>欢迎使用Ques</header>
        <article>你点击了代码</article>
    </dialog>
</div>
```

* Javascript文件：

```javascript
var $ = require('jquery');

module.exports = {
    data: {},
    ready: function () {
        var code = this.$.code,
            dialog = this.$.dialog;
        // 点击代码，弹出dialog
        $(code.el).on('click', function () {
            dialog.show();
        });
    }
};
```

##### 效果

* 在页面上引用：

```html
<codeclick>
    &lt;ui-button class=&quot;ui-default&quot;&gt;DEFAULT&lt;/ui-button&gt;
    &lt;ui-button class=&quot;ui-success&quot;&gt;SUCCESS&lt;/ui-button&gt;
    &lt;ui-button class=&quot;ui-info&quot;&gt;INFO&lt;/ui-button&gt;
    &lt;ui-button class=&quot;ui-warning&quot;&gt;WARNING&lt;/ui-button&gt;
    &lt;ui-button class=&quot;ui-danger&quot;&gt;DANGER&lt;/ui-button&gt;
</codeclick>
```

* 展示：

![](http://7tszky.com1.z0.glb.clouddn.com/FqUbQB1yU-Zkv8nt2CNWStL834uX)

##### 备注

* 我们看到`<content>`标签另一个神奇的用法是可传递，我们从`third-code`传递到`codeclick`，再传递到最外部。使得我们可以在最外部改`third-code`内部的节点。


* 我们注意到`q-ref`本来是`Q.js`用于组件嵌套从母Component(为了和扩展中的父Component其分开来，这里称之为母Component)拿到子Component的引用，同样可以拿到第三方Component的引用。

### 组件扩展

> 组件可扩展，则差别不大的组件可以继承同一个父组件。

下面`dialog`组件扩展的例子，效果是弹出一个dialog，要求输入内容：

##### 定义

* CSS文件：

```css
/** 同样为了简单我们什么也不做 **/
```

* 模版文件：

```html
<dialog extend>
    <header>
        <h2>欢迎使用Ques</h2>
    </header>
    <article>
        <p>请输入要设置的值</p>
        <ui-input value="" q-model="curVal" q-on="keyup: submit | key enter" q-focus="focus"></ui-input>
    </article>
</dialog>
```

* Javascript文件：

```javascript
var filters = require('filters');

module.exports = {
    methods: {
        submit: function () {
            if (!this.curVal) {
                this.$set('focus', true);
            } else {
                this.$emit('submit', this.curVal);
                this.$set('curVal', '');
                this.hide();
            }
        },
        show: function () {
            // call super.show
            this.constructor.super.options.methods.show.call(this);
            this.$set('focus', true);
        }
    },
    directives: {
        focus: function (val) {
            val && this.el.focus();
        }
    },
    filters: {
        key: filters.key
    }
};
```

##### 效果

* 在页面上引用`inputval`：

```html
<inputval id="my-dialog"></inputval>
```

* 在Controller调用其show方法：

```javascript
var Q = require('Q');

Q.get('#my-dialog').show();
```

* 则页面弹出一个弹出，要求输入值：

![](http://7tszky.com1.z0.glb.clouddn.com/Fs26Br5khJIsU8wsokk8_tBAiMVv)

##### 备注

* 这里我们引入`extend`属性，用于表示该组件继承哪个组件。


* 我们还复写了`dialog`的`submit`和`show`方法，并且可以调用其父Componnet的方法，如：

```javascript
this.constructor.super.options.methods.show.call(this);
```

### 嵌套使用扩展组件

> 我们可以嵌套使用扩展后的组件。

下面是一个复杂的例子，一个按钮点击后弹出`inputval`，输入后alert出输入的内容。

##### 定义

* CSS文件

```
.$__anchor {
    padding: 13px 35px 17px;
    box-shadow: inset 0 -4px 0 #2a6496;
    border: 0;
    color: #fff;
    transition: all .2s ease-in-out;
    background-color: #337ab7;
    border-color: #2e6da4;
    display: block;
    margin-bottom: 0;
    font-size: 14px;
    font-weight: 400;
    line-height: 1.42857143;
    text-align: center;
    white-space: nowrap;
    vertical-align: middle;
    touch-action: manipulation;
    cursor: pointer;
    user-select: none;
    border-radius: 4px;
    text-decoration: none;
    margin: 0 auto;
}

.$__anchor:hover,
.$__anchor:active
.$__anchor:focus {
    background-color: #286090;
    border-color: #204d74;
}
```

* 模版文件：

```html
<div>
    <a href="javascript:void(0);" class="$__anchor" q-on="click: setMessage">
        <content></content>
    </a>
    <inputval q-ref="input"></inputval>
</div>
```

* Javascript文件：

```javascript
module.exports = {
    data: {},
    methods: {
        setMessage: function (e) {
            var self = this;
            this.$.input.$once('submit', function (value) {
                value && alert('输入了：' + value);
            });
            this.$.input.show();
        }
    }
};
```

##### 效果

* 在页面引用：

```html
<clkme>请点击我</clkme>
```

* 效果：

![](http://7tszky.com1.z0.glb.clouddn.com/FoPV56Ge0qM4ek8dcfwp9ZZEWiVz)

### DIY组件

> DIY组件允许页面通过Markup的方法引用NodeJS组件，这样我们可以使用该NodeJS组件分析我们的代码来做一些神奇的事情。

例如我们提供的`diy-preload`组件提供的CGI预加载方案，整个过程没有改变开发人员的编码体验，只是简简单单标记一下哪个CGI需要预加载，则系统会自动预加载CGI。

##### 使用

* 在页面引入`diy-preload`组件

```html
<diy-preload></diy-preload>
```

* 在页面对应的数据层配置文件，这里我们的规范是该文件名为`db.*.js`，的对应CGI设置成preload = true：

```javascript
    var DB = require('db');

    DB.extend({
        ke: DB.httpMethod({
            url: 'http://ke.qq.com/cgi-bin/index_json',
            type: 'JSONP',
            preload: true
        })
    })

    module.exports = DB;
```

* 则`diy-preload`组件会找到`db.*.js`，然后分析出什么CGI需要预加载，在`<diy-preload>`标签对应的位置插入预加载脚本。整个过程开发人员感知不到，体验上还是调取一个CGI，但是实际上在页面文档打开后CGI请求立刻发出，而不是等待Javascript加载完后才发出。
