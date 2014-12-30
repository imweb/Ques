define(function () {
    var QInstanceMap = {},
        QToken = 'Q' + (Math.random() * 10000 | 0),
        uid = 0,
        _toString = Object.prototype.toString,
        _slice = [].slice,
        MARK = /\{\{(.+?)\}\}/;

    function _checkOn(el) {
        var atts = el.attributes, i = 0 , l = atts.length;
        for (; i < l; i++) {
            if (~atts[i].name.indexOf('on-')) return true;
        }
        return false;
    }

    function _findOn(el) {
        var atts = el.attributes, i = 0 , l = atts.length, res = [];
        for (; i < l; i++) {
            if (~atts[i].name.indexOf('on-')) res.push(atts[i].name);
        }
        return res;
    }

    function _extend(src, target) {
        var key;
        for (key in target) {
            src[key] = target[key];
        }
        return src;
    }

    function _walk($el, cb) {
        for (var el, i = 0; el = $el[i++];) {
            if (el.nodeType === 3) cb('TEXT', el);
            if (el.nodeType === 1 && _checkOn(el)) cb('ON', el);
            if (el.childNodes.length) _walk(el.childNodes, cb);
        }
    }

    function S(selector, container) {
        container = container || document;
        if (typeof selector === 'Object')
            return _toString.call(selector) === '[object Array]' ?
                selector : [selector];
        return _slice.call(container.querySelectorAll(selector), 0);
    }

    function Q(els, options) {
        if (!options) return typeof els === 'string' ?
            S(els).map(function (el) {
                return QInstanceMap[el[QToken]];
            }) :
            Q(S(els.el), els);
        if (els.length > 1) return els.map(function (ele) {
            return Q([ele], options)[0];
        });
        if (!(this instanceof Q)) return [new Q(els, options)];
        this.init(els[0], options);
    }
    var p = Q.prototype;
    p.init = function (el, options) {
        // set uid
        el[QToken] = ++uid;
        QInstanceMap[uid] = this;
        this.$el = el;
        this.data = options.data;
        this.els = {};
        this._events = {};
        _extend(this, options.methods || {});
        this.scan();
    };
    p.set = function (key, value) {
        this.els[key].innerHTML = value;
        this.data[key] = value;
        this.trigger('set.' + key, value);
        return this;
    };
    p.trigger = function (event, data, target) {
        target = target || this.$el;
        var callbacks = this._events[event];
        if (callbacks) {
            callbacks.forEach(function (foo) {
                foo.call(target, event, data);
            });
        }
        return this;
    };
    p.on = function (event, cb) {
        var callbacks = this._events[event] = this._events[event] || [];
        callbacks.push(cb);
        return this;
    }
    p.scan = function () {
        var self = this;
        _walk([this.$el], function (type, node) {
            switch (type) {
                case 'TEXT':
                    var match = node.nodeValue.match(MARK);
                    if (
                        match &&
                        ~[].slice.call(node.parentNode.classList, 0)
                            .indexOf('q-mark')
                    ) {
                        self.data[match[1]] = node.parentNode.previousSibling.nodeValue;
                        self.els[match[1]] = node.parentNode.parentNode;
                        node.parentNode.parentNode.removeChild(node.parentNode);
                    }
                    break;
                case 'ON':
                    _findOn(node).forEach(function (type) {
                        var event = type.substring(3);
                        node.addEventListener(event, function (e) {
                            var name = node.attributes[type].value.match(MARK)[1];
                            handler = self[name];
                            if (!handler || typeof handler !== 'function')
                                throw new Error('You need implement the ' + name + ' method.');
                            e.triggerTarget = this;
                            handler.apply(self, arguments);
                        }, false);
                    });
                    break;
            }

        });
    };

    return Q;
});
