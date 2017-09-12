function formatCent(cent){
    if(!cent){
        return cent;
    }
    var priceInt = ~~(cent / 100) + "";
    var priceDeci = cent % 100;
    priceDeci = priceDeci == 0 ? "" : priceDeci < 10 ? ".0" + priceDeci : "." + priceDeci;
    var length = priceInt.length;
    if(length < 4){
        return priceInt + priceDeci;
    }
    var priceIntArr = [];
    for(var i = 0; i <= length / 3; i++){
        var start = length - (i + 1) * 3;
        var end = start + 3
        if(start < 0){
            start = 0;
        }
        var str = priceInt.substring(start, end);
        !!str && priceIntArr.unshift(str);
    }
    return priceIntArr.join(",") + priceDeci;
}

module.exports = {
    formatCent: formatCent
}