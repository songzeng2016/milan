function hideNickName(name){
    if(!!name){
        return name.substring(0, 1) + "**" + (name.length > 1 ? name.substring(name.length - 1) : '');
    }
    return '';
}

function formatBigNum(num){
    if(typeof num != 'number'){
        return num;
    }
    if(num < 100000){
        return num;
    }
    if(num < 100000000){
        return parseInt(num / 10000) + 'W+';
    }
    return '9999W+'
}

module.exports = {
  hideNickName : hideNickName,
  formatBigNum : formatBigNum
}
