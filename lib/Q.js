// Inspired from vue.js
define(['jquery'], function ($) {
    var _toString = Object.prototype.toString,
        _slice = [].slice,
        _warn,
        _noop = function () {},
        _turnback = function (s) { return s; },
        MARK = /\{\{(.+?)\}\}/;

    // dependences
    // selector
    var S = $.find,
        // element data
        data = $.data,
        // event bind method
        add = $.event.add,
        // event unbind method
        remove = $.event.remove,
        // merge
        extend = $.extend,
        // trim
        trim = $.trim;

    // ES forEach polyfill
    if (!Array.prototype.forEach) {
        Array.prototype.forEach = function (fn, scope) {
            'use strict';
            var i, len;
            for (i = 0, len = this.length; i < len; ++i) {
                if (i in this) {
                    fn.call(scope, this[i], i, this);
                }
            }
        };
    }

    // ES map polyfill
    Array.prototype.map||(Array.prototype.map=function(r,t){var n,o,e;if(null==this)throw new TypeError(" this is null or not defined");var i=Object(this),a=i.length>>>0;if("function"!=typeof r)throw new TypeError(r+" is not a function");for(t&&(n=t),o=new Array(a),e=0;a>e;){var p,f;e in i&&(p=i[e],f=r.call(n,p,e,i),o[e]=f),e++}return o});

    // ES indexOf polyfill
    [].indexOf||(Array.prototype.indexOf=function(a,b,c) {
        for ( var c = this.length, b = (c + ~~b) % c; b < c && (!(b in this || this[b] !== a)); b++){};
        return b ^ c ? b : -1;
    });

    // ES bind polyfill
    if (!Function.prototype.bind) {
        Function.prototype.bind = function (oThis) {
            if (typeof this !== "function") {
                // closest thing possible to the ECMAScript 5 internal IsCallable function
                throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
            }

            var aArgs = Array.prototype.slice.call(arguments, 1),
                fToBind = this,
                fNOP = function () {},
                fBound = function () {
                    return fToBind.apply(
                        this instanceof fNOP && oThis ?
                            this:
                            oThis,
                        aArgs.concat(Array.prototype.slice.call(arguments))
                    );
                };

            fNOP.prototype = this.prototype;
            fBound.prototype = new fNOP();

            return fBound;
        };
    }

    if (window.console && console.error) {
        _warn = function (msg) {
            console.error(msg);
        };
    } else {
        _warn = _noop;
    }

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

    function _walk($el, cb) {
        for (var el, i = 0; el = $el[i++];) {
            if (el.nodeType === 3) cb('TEXT', el);
            if (el.nodeType === 1 && _checkOn(el)) cb('ON', el);
            if (el.childNodes.length) _walk(el.childNodes, cb);
        }
    }

    function Q(options) {
        this._init(options);
    }
    Q.get = function (selector) {
        var ele = S(selector)[0];
        if (ele) {
            return data(ele, 'QI');
        } else {
            return null;
        }
    };
    Q.all = function (options) {
        return S(options.el).map(function (ele) {
            return new Q(extend({ el: ele }, options));
        });
    };
    extend(Q.prototype, {
        _init: function (options) {
            options = options || {};
            this.$el = S(options.el)[0];
            this.$els = {};
            // element references
            this.$$ = {};
            // merge options
            options = this.$options = extend(
                this.constructor,
                options,
                this
            );
            // lifecycle state
            this._isCompiled = false;
            // events bookkeeping
            this._events = {};
            this._data = options.data;
            // cache the instance
            data(this.$el, 'QI', this);
            // initialize data and scope inheritance.
            this._initScope();
            // start compilation
            this.$mount(this.$el);
        },

        /**
         * Set data and Element value
         *
         * @param {String} key
         * @param {Any} value
         */
        data: function (key, value) {
            var self = this, obj, elList;
            if (!value) {
                obj = key;
                for (key in obj) {
                    self.data(key, obj[key]);
                }
                return this;
            }
            this._data[key] = value;
            elList = this.$els[key];
            if (elList) {
                elList.forEach(function (elObj) {
                    var ele = elObj.ele;
                    switch (ele.nodeType) {
                        // element
                        case 1:
                            ele.innerHTML = self.applyFilters(value, elObj.readFilters);
                            break;
                    }
                });
            }
            return this;
        },
        /**
         * Listen on the given `event` with `fn`.
         *
         * @param {String} event
         * @param {Function} fn
         */
        $on: function (event, fn) {
            (this._events[event] || (this._events[event] = []))
                .push(fn);
            return this;
        },
        /**
         * Adds an `event` listener that will be invoked a single
         * time then automatically removed.
         *
         * @param {String} event
         * @param {Function} fn
         */
        $once: function (event, fn) {
            var self = this;
            function on() {
                self.$off(event, on);
                fn.apply(this, arguments);
            }
            on.fn = fn;
            this.$on(event, on);
            return this;
        },

        /**
         * Remove the given callback for `event` or all
         * registered callbacks.
         *
         * @param {String} event
         * @param {Function} fn
         */

        $off: function (event, fn) {
            var cbs, cb, i;
            // all event
            if (!arguments.length) {
                this._events = {};
                return this;
            }
            // specific event
            cbs = this._events[event];
            if (!cbs) {
                return this;
            }
            if (arguments.length === 1) {
                this._events[event] = null;
                return this;
            }
            // specific handler
            i = cbs.length;
            while (i--) {
                cb = cbs[i];
                if (cb === fn || cb.fn === fn) {
                    cbs.splice(i, 1);
                    break;
                }
            }
            return this;
        },
        /**
         * Trigger an event on self.
         *
         * @param {String} event
         */
        $emit: function (event) {
            var cbs = this._events[event]
            if (cbs) {
                var i = arguments.length - 1,
                    args = new Array(i);
                while (i--) {
                    args[i] = arguments[i + 1];
                }
                i = 0
                cbs = cbs.length > 1 ?
                    _slice.call(cbs, 0) :
                    cbs;
                for (var l = cbs.length; i < l; i++) {
                    cbs[i].apply(this, args);
                }
            }
            return this;
        },
        /**
         * Helper to register an event/watch callback.
         *
         * @param {Vue} vm
         * @param {String} action
         * @param {String} key
         * @param {*} handler
         */
        register: function (vm, action, key, handler) {
            var type = typeof handler;
            if (type === 'functioin') {
                vm[action](key, hander);
            } else if (type === 'string') {
                var methods = vm.$options.methods,
                    method = methods && methods[handler];
                if (method) {
                    vm[action](key, method);
                } else {
                    _warn(
                        'Unknown method: "' + handler + '" when ' +
                        'registering callback for ' + action +
                        ': "' + key + '".'
                    );
                }
            }
        },
        /**
         * Setup the scope of an instance, which contains:
         * - observed data
         * - computed properties
         * - user methods
         * - meta properties
         */
        _initScope: function () {
            this._initMethods();
        },

        /**
         * Setup instance methods. Methods must be bound to the
         * instance since they might be called by children
         * inheriting them.
         */
        _initMethods: function () {
            var methods = this.$options.methods, key;
            if (methods) {
                for (key in methods) {
                    this[key] = methods[key].bind(this);
                }
            }
        },

        /**
         * Set instance target element and kick off the compilation
         * process. The passed in `el` can be a template string, an
         * existing Element, or a DocumentFragment (for block
         * instances).
         *
         * @param {String|Element|DocumentFragment} el
         * @public
         */
        $mount: function (el) {
            if (this._isCompiled) {
                return _warn('$mount() should be called only once');
            }
            if (typeof el === 'string') {
                // TODO for template
            }
            this._compile(el);
            this._isCompiled = true;
        },
        /**
         * Transclude, compile and link element.
         *
         * If a pre-compiled linker is available, that means the
         * passed in element will be pre-transcluded and compiled
         * as well - all we need to do is to call the linker.
         *
         * Otherwise we need to call transclude/compile/link here.
         *
         * @param {Element} el
         * @return {Element}
         */
        _compile: function (el) {
            this.transclue(el, this.$options);
        },
        /**
         * Process an element or a DocumentFragment based on a
         * instance option object. This allows us to transclude
         * a template node/fragment before the instance is created,
         * so the processed fragment can then be cloned and reused
         * in v-repeat.
         *
         * @param {Element} el
         * @param {Object} options
         * @return {Element|DocumentFragment}
         */
        transclue: function (el, options) {
            // static template bind
            if (S('.q-mark', el).length) {
                this._templateBind(el, options);
                this._callHook('attached');
            } else {
                // TODO
            }
        },

        /**
         * bind static template
         */
        _templateBind: function (el, options) {
            var self = this;
            _walk([el], function (type, node) {
                switch (type) {
                    case 'TEXT':
                        var match = node.nodeValue.match(MARK),
                            params,
                            key;
                        if (
                            match &&
                                ~node.parentNode.className.indexOf('q-mark')
                        ) {
                            params = trim(match[1]).split(/\s*\|\s*/);
                            key = params[0];
                            self._data[key] = node.parentNode.previousSibling.nodeValue;
                            var elList = self.$els[key] = self.$els[key] || [];
                            elList.push({
                                ele: node.parentNode.parentNode,
                                readFilters: self._makeReadFilters(params.slice(1))
                            });
                            node.parentNode.parentNode.removeChild(node.parentNode);
                        }
                        break;
                    case 'ON':
                        _findOn(node).forEach(function (type) {
                            var event = type.substring(3),
                                name = node.attributes[type].value.match(MARK)[1],
                                hanlder = handler = self[name];
                            node.removeAttribute(type);
                            add(node, event, function (e) {
                                if (!handler || typeof handler !== 'function')
                                    return _warn('You need implement the ' + name + ' method.');
                                e.triggerTarget = this;
                                handler.apply(self, arguments);
                            });
                        });
                        break;
                }
            });
        },

        /**
         * Trigger all handlers for a hook
         *
         * @param {String} hook
         */
        _callHook: function (hook) {
            var handlers = this.$options[hook];
            if (handlers) {
                for (var i = 0, j = handlers.length; i < j; i++) {
                    handlers[i].call(this);
                }
            }
            this.$emit('hook:' + hook);
        },

        _makeReadFilters: function (names) {
            if (!names.length) return undefined;
            var filters = this.$options.filters,
                self = this;
            return names.map(function (name) {
                var args = name.split(' '),
                    reader;
                name = args.shift();
                reader = (filters[name] ? (filters[name].read || filters[name]) : _turnback);
                return function (value) {
                    return args ?
                        reader.apply(self, [value].concat(args)) :
                            reader.call(self, value);
                };
            });
        },

        /**
         * Apply filters to a value
         *
         * @param {*} value
         * @param {Array} filters
         * @param {*} oldVal
         * @return {*}
         */
        applyFilters: function (value, filters, oldVal) {
            if (!filters || !filters.length) {
                return value;
            }
            for (var i = 0, l = filters.length; i < l; i++) {
                value = filters[i].call(this, value, oldVal);
            }
            return value;
        }

    });

    return Q;
});
