module.exports = {
    Array: {
        Rm: function (array, index) {
            var sl1 = array.slice(0, index);
            var sl2 = array.slice(index+1);
            return sl1.concat(sl2);
        },
        RmMany: function (array, indexes) {
            var nArray = [];
            for(var i = 0; i < array.length; i++) {
                if(! indexes.includes(i)) {
                    nArray.push(array[i])
                }
            }
            return nArray
        }
    }
}