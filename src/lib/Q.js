var Q = require('Q.core'),
    thirdParty = require('third.party'),
    directives = Q.options.directives;

// the way to bind third party component
// Q.js will ignore q-ignore element
directives['third'] = {
    bind: function () {
        var third = thirdParty.get(this.target);
        if (third) {
            third.bind.call({
                vm: this.vm,
                el: this.el
            });
            this.setting.stop = true;
        } else {
            throw new Error('third party component: ' + this.target + ' is not undefined');
        }
    }
}

return Q;
