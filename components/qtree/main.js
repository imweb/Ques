var $ = require('jquery');

function Qtree(container) {
    container = $(container);
    if (container.data('qtree')) return container.data('qtree');
    if (!(this instanceof Qtree)) return new Qtree(container);
    container.data('qtree', this);
    this.container = container;
    this._init(container);
    this.itemHeight = 56;
    this.isOpen = false;
}
Qtree.prototype = {
    constructor: Qtree,
    _init: function (container) {
        var self = this;
        container.find('.$__title').on('click', function () {
            self._toggle();
        });
        container.on('dblclick', '.$__item', function (e) {
            e.type = 'dblclick-item';
            e.triggerTarget = this;
            self.trigger(e);
        }).on('click', '.$__del', function (e) {
            e.type = 'click-del';
            e.triggerTarget = this;
            self.trigger(e);
            $(this).parent('.$__item').remove();
            setTimeout(function () {
                self._fixHeight();
            }, 0);
        });
        setTimeout(function () {
            self._toggle();
            self._fixHeight();
        }, 0);
    },
    _toggle: function () {
        var container = this.container;
        if (this.isOpen) {
            container.find('.$__list').addClass('$__list-hide');
            container.find('.$__triangle').removeClass('$__triangle-rotate');
        } else {
            container.find('.$__list').removeClass('$__list-hide');
            container.find('.$__triangle').addClass('$__triangle-rotate');
        }
        this.isOpen = !this.isOpen;
    },
    _fixHeight: function () {
        var num = this.container.find('.$__item').length;
        this.container.find('.$__list').css({ height: this.itemHeight * num });
    },
    trigger: function (event, data) {
        this.container.trigger(event, data);
        return this;
    },
    on: function (event, cb) {
        this.container.on(event, cb);
        return this;
    },
    set: function (opts) {
        var key;
        for (key in opts) {
            if (key in this) {
                this[key] = opts[key];
            }
        }
        return this;
    }
}

function init(container) {
    $(container).each(function (i, ele) {
        Qtree(ele);
    });
}

function get(selector) {
    return Qtree(selector);
}

module.exports = {
    init: init,
    get: get
};
