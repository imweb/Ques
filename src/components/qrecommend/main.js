module.exports = {
    data: {
    },
    filters: {
        toBackground: function (v) {
            return {
                backgroundImage: 'url(' + v + ')'
            };
        }
    }
};
