var Q = require('Q');

function bindEvent(q, control) {
    control.addEventListener('click', function (e) {
        var method = e.target.getAttribute('data-method');
        method && q[method]();
    });
}

function decode(str) {
    return str.replace(/\&lt;/g, '<')
                .replace(/\&gt;/g, '>')
                .replace(/\&amp;/g, '&');
}

function is(obj, type) {
    var tags = obj.tags;
    for (var i = 0, l = tags.length; i < l; i++) {
        if (tags[i].type === type) {
            return true;
        }
    }
    return false;
}

function printTags(tags) {
    var str = '';
    tags.forEach(function (tag) {
        if (tag.type === 'property') {
            str += '<div class="tag property">';
            str += '<code>' + tag.type + '</code>';
            str += tag.name;
            str += decode(tag.typesDescription);
            str += decode(tag.description);
            str += '</div>';
        } else if (tag.type === 'example') {
            str += '<div class="tag example">';
            str += '<code>' + tag.type + '</code>';
            str += decode(tag.html);
            str += '</div>';
        } else {
            str += '<div class="tag">';
            str += '<code>' + tag.type + '</code>';
            str += decode(tag.html);
            str += '</div>';
        }
    });
    return str;
}

function _init() {
    var ele = Q._.find('#showcase .left-block')[0].childNodes[0],
        q = Q._.data(ele, 'QI');

    if (Q._.data(ele, 'QI')) {
        window.q = q;

        var methods = q.$options.methods || {},
            key,
            template = '',
            control = document.createElement('div'),
            obj,
            description,
            map = {},
            events = [],
            datas = [],
            mock,
            i, l, tmp;

        Q._.addClass(control, 'control-container');

        // prepare map
        window.comments.forEach(function (obj) {
            if (is(obj, 'event')) {
                events.push(obj);
            } else if (is(obj, 'component')) {
                description = obj;
            } else if (is(obj, 'property')) {
                datas.push(obj);
            } else if (is(obj, 'mock')) {
                tmp = document.createElement('div');
                tmp.innerHTML = decode(obj.description.full);
                try {
                    tmp = Q._.find('pre code', tmp)[0].textContent.trim();
                    tmp = unescape(tmp);
                    mock = eval('(' + tmp + ')');
                } catch(e) {
                    console.error(e);
                }
                tmp = null;
            } else if (obj.ctx) {
                map[obj.ctx.name] = obj;
            }
        });

        Q._.find('#showcase .right-block')[0].appendChild(control);

        // make the component description
        if (description) {
            template += decode(description.description.summary);
            if (description.description.body) {
                template += [
                    '<div class="markdown">',
                        decode(description.description.body),
                    '</div>'
                ].join('\n');
            }
        }

        if (datas.length) {
            template += '<h3>数据(data)</h3>';

            for (i = 0, l = datas.length; i < l; i++) {
                tmp = datas[i];
                template += printTags(tmp.tags);
            }
        }

        template += '<h3>方法(methods)</h3>';

        for (key in methods) {
            if (typeof methods[key] === 'function') {
                obj = map[key];
                if (obj) {
                    template += [
                        '<h4>' + obj.ctx.string + '</h4>',
                        decode(obj.description.full)
                    ].join('\n');
                }
                template += '<button data-method="' + key + '" >' + key + '</button>';
            }
        }

        template += '<h3>事件(events)</h3>';

        for (i = 0, l = events.length; i < l; i++) {
            tmp = events[i];
            template += decode(tmp.description.full);
            template += printTags(tmp.tags);
        }

        template += '<h3>监听(listeners)</h3>';

        control.innerHTML = template;
        bindEvent(q, control);

        if (mock) {
            for (tmp in mock) {
                if (mock.hasOwnProperty(tmp)) {
                    q.$set(tmp, mock[tmp]);
                }
            }
        }

        console.log('You can just use `q` to get the instance of this component');
    } else {
        // TODO
    }

}

function init() {
    setTimeout(_init, 100);
}

module.exports = {
    init: init
};
