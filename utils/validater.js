//表单验证工具
var validater = {
    //是否为空
    isEmpty(str){
        return str === undefined || str === null || str === "";
    },
    //最小长度
    minLength(str, min){
        if(!str){
            return false;
        }
        return getCharLength(str) >= min;
    },
    //最大长度
    maxLength(str, max){
        if(!str){
            return false;
        }
        return getCharLength(str) <= max;
    },
    //是否手机号码
    isTel(str){
        return /^1[34578]\d{9}$/.test(str);
    },
    //是否是座机
    isPhone(str){
      return /^(0|8)\d{2,3}-?\d{7,8}-?\d{1,6}?$/.test(str);
    },
    //是否包含手机号
    hasTel(str){
      return /^[\S]*1[34578]\d{9}[\S]*$/.test(str);
    },
    //是否是邮箱
    isEmail(str){
        return /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(str);
    },
    isMaxNumber(str){
        return str > 0 && str <= 100000000;
    },
    isPrice(str){
        return /^\d+(.\d{1,2})?$/.test(str);
    }
}
function getCharLength(str){
    var length = 0;  
    for(var i = 0; i < str.length; i++){
        if(str.charCodeAt(i) > 127 || str.charCodeAt(i) == 94){  
            length += 2;  
        }else {  
            length ++;  
        }  
    }  
    return length; 
}
module.exports.validater = validater;