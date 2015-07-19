var Q = require('Q.core'),
    Third = require('third'),
    directives = Q.options.directives;

// the way to bind third party component
// Q.js will ignore q-ignore element
directives['third'] = {
    bind: function () {
        var third = Third.key(this.target);
        if (third) {
            var ref = this.el.getAttribute('q-ref');
            third = new Third(this.el, third, this.vm);
            if (ref) this.vm.$[ref] = third;
            this.setting.stop = true;
        } else {
            throw new Error('third party component: ' + this.target + ' is not defined');
        }
    }
}

return Q;
