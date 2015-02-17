module.exports = {
    data: {},
    // when vm init complied bind the data
    compiled: function () {
        var a = this.$.a,
            b = this.$.b;
        a.$on('change', function (value) {
            b.$set('text', value);
        });
    }
}
