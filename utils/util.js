function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function formatHour(date){
  var hour = date.getHours()
  var minute = date.getMinutes()

  return [hour, minute].map(formatNumber).join(':')
}

function formatWeek(date){
  var prefix ="周";
  var num = date.getDay();
  switch(num){
    case 1:
      return prefix+"一";
    case 2:
      return prefix+"二";
    case 3:
      return prefix+"三";
    case 4:
      return prefix+"四";
    case 5:
      return prefix+"五";
    case 6:
      return prefix+"六";
    case 0:
      return prefix+"日";
  }

}

function formatDate(date){
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  return [year, month, day].map(formatNumber).join('-') 
  
}

function formatDateWithWeek(date){
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  return [year, month, day].map(formatNumber).join('-') + " " + formatWeek(date);
  
}

function hourCompare(date,date2){
    if(date.getHours() > date2.getHours()){
      return true;
    }
    if(date.getHours() == date2.getHours()){
      if(date.getMinutes() > date2.getMinutes()){
        return true;
      }
      if(date.getMinutes() == date2.getMinutes()){
        if(date.getSeconds() > date2.getSeconds()){
          return true;
        }
      }
    }
    return false;
}

function getDateName(date){
  var now = new Date();
  if(date == null || now.getTime() <= date.getTime()){
    return "0分钟前";
  }
  if(now.getYear() > date.getYear()){
    return formatDate(date);
  }
  var time = now.getTime() - date.getTime();
  var minutes = time / (1000 * 60);
  if(minutes < 60){
    return ~~minutes + "分前";
  }
  var hour = time / (1000 * 60 * 60);
  if(hour < 24){
    return ~~hour + "小时前";
  }
  var day = time / (1000 * 60 * 60 * 24);
  return ~~day +"天前";
}
//时间差：小时
function timeDiff(date1, date2) {
  var time1 = date1.getTime();
  var time2 = date2.getTime();
  if(time1 < time2){
    return 0;
  }
  var timeDiff = ~~((time1 - time2) / (1000 * 60 * 60 * 24));
  return timeDiff;
}  

function showTimeByDate(date){
  var year = date.getFullYear();
  var month = date.getMonth();
  var day = date.getDate();
  var hour = date.getHours();
  var minute = date.getMinutes();
  
  var now = new Date();
  var _year = now.getFullYear()
  var _month = now.getMonth()
  var _day = now.getDate()
  var _hour = date.getHours();
  var _minute = date.getMinutes();

  if(year < _year){
    return [year, month + 1, day].map(formatNumber).join('-') + ' ' + [hour, minute].map(formatNumber).join(':');
  }else{
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    now.setMilliseconds(0);

    var interval = (now.getTime() - date.getTime()) / (3600 * 1000 * 24);
    // console.log("时间差="+interval);
    if(true){
      return [month + 1, day].map(formatNumber).join('/') + ' ' + [hour, minute].map(formatNumber).join(':');
    }else if(interval <= 1 && interval > 0){
      return "昨天 " + [hour, minute].map(formatNumber).join(':');
    }else{
      return "今天 " + [hour, minute].map(formatNumber).join(':');
    }
  }
}


//月日 时分
function jionTimeByDate(date) {
  var year = date.getFullYear();
  var month = date.getMonth();
  var day = date.getDate();
  var hour = date.getHours();
  var minute = date.getMinutes();

  var now = new Date();
  var _year = now.getFullYear()
  var _month = now.getMonth()
  var _day = now.getDate()
  var _hour = date.getHours();
  var _minute = date.getMinutes();

  if (year < _year) {
    return [year, month + 1, day].map(formatNumber).join('-') + ' ' + [hour, minute].map(formatNumber).join(':');
  } else {
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    now.setMilliseconds(0);

    var interval = (now.getTime() - date.getTime()) / (3600 * 1000 * 24);
    // console.log("时间差="+interval);
   
      return [month + 1, day].map(formatNumber).join('/') + ' ' + [hour, minute].map(formatNumber).join(':');
    
  }
}

//月日 时分
function jionTimeByDate2(date) {
  var year = date.getFullYear();
  var month = date.getMonth();
  var day = date.getDate();
  var hour = date.getHours();
  var minute = date.getMinutes();

  var now = new Date();
  var _year = now.getFullYear()
  var _month = now.getMonth()
  var _day = now.getDate()
  var _hour = date.getHours();
  var _minute = date.getMinutes();

  if (year < _year) {
    return [year, month + 1, day].map(formatNumber).join('-') + ' ' + [hour, minute].map(formatNumber).join(':');
  } else {
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    now.setMilliseconds(0);

    var interval = (now.getTime() - date.getTime()) / (3600 * 1000 * 24);
    // console.log("时间差="+interval);

    return [month + 1, day].map(formatNumber).join('-') + ' ' + [hour, minute].map(formatNumber).join(':');

  }
}

function showTimeByDate2(date){
  var year = date.getFullYear();
  var month = date.getMonth();
  var day = date.getDate();
  var hour = date.getHours();
  var minute = date.getMinutes();
  
  var now = new Date();
  var _year = now.getFullYear()
  var _month = now.getMonth()
  var _day = now.getDate()
  var _hour = date.getHours();
  var _minute = date.getMinutes();

  if(year < _year){
    return [year, month + 1, day].map(formatNumber).join('-') + ' ' + [hour, minute].map(formatNumber).join(':');
  }else{
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    now.setMilliseconds(0);

    var interval = (now.getTime() - date.getTime()) / (3600 * 1000 * 24);
    // console.log("时间差="+interval);
    if(interval > 1){
      return [month + 1, day].map(formatNumber).join('-') + ' ' + [hour, minute].map(formatNumber).join(':');
    }else if(interval <= 1 && interval > 0){
      return "昨天 ";
    }else{
      return "今天 ";
    }
  }
}
//时间差：超过一天显示天，不超过的显示时分秒
function timeDiff2(date1, date2){
  var time1 = date1.getTime();
  var time2 = date2.getTime();
  var timeDiff = time1 - time2;
  if(timeDiff < 0){
    return 0;
  }
  var dayDiff = ~~((time1 - time2) / (1000 * 60 * 60 * 24));
  if(dayDiff > 1){
    return dayDiff + '天';
  }
  var hour = ~~(timeDiff / 1000 / 60 / 60 % 24);
  var minute = ~~(timeDiff / 1000 / 60 % 60);
  var second = ~~(timeDiff / 1000 % 60);
  return [hour, minute, second].map(formatNumber).join(':');
}

//时间差：超过一天显示天和小时，不超过的显示时分秒
function timeDiff3(date1, date2){
  var time1 = date1.getTime();
  var time2 = date2.getTime();
  var timeDiff = time1 - time2;
  if(timeDiff < 0){
    return 0;
  }
  var dayDiff = ~~((time1 - time2) / (1000 * 60 * 60 * 24));
  var hour = ~~(timeDiff / 1000 / 60 / 60 % 24);
  if(dayDiff > 1){
    return dayDiff + '天' + hour + "时";
  }
  
  var minute = ~~(timeDiff / 1000 / 60 % 60);
  var second = ~~(timeDiff / 1000 % 60);
  return [hour, minute, second].map(formatNumber).join(':');
}

module.exports = {
  formatTime : formatTime,
  formatDate : formatDate,
  formatHour : formatHour,
  formatWeek : formatWeek,
  hourCompare : hourCompare,
  getDateName : getDateName,
  timeDiff : timeDiff,
  showTimeByDate: showTimeByDate,
  showTimeByDate2: showTimeByDate2,
  jionTimeByDate: jionTimeByDate,
  jionTimeByDate2: jionTimeByDate2,
  timeDiff2 : timeDiff2,
  timeDiff3 : timeDiff3,
  formatDateWithWeek:formatDateWithWeek
  
}
