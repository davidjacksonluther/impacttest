function postJsonParam_To_GetParam(postJsonParam)
{
    var paramStr='';//参数字符串
    for(x in postJsonParam)
    {
        var value=postJsonParam[x];
        //检验日期格式是否为YYYY-MM-DD
        if(isValidateDate(value))
        {
            var date=new Date();
            date.setFullYear(value.substring(0,4), eval(value.substring(5,7))-1, value.substring(8,10));
            value = date.getTime();//将日期转换为长整型数字,防止框架配置的【防SQL注入过滤，再通过后台转换为日期Date对象】
        }
        else if(isValidateDateHours(value))
        {
            var date=new Date();
            date.setFullYear(value.substring(0,4), eval(value.substring(5,7))-1, value.substring(8,10));
            date.setHours(value.substring(11,13), value.substring(14,16), value.substring(17,19), 0);
            value = date.getTime();//将日期转换为长整型数字,防止框架配置的【防SQL注入过滤，再通过后台转换为日期Date对象】
        }
        paramStr+=x+'='+value+'&';
    }
    if(paramStr.length>0)
    {
        paramStr='?'+paramStr.substring(0,paramStr.length-1);
    }
    return paramStr;
}
/**
 *	功能：检验日期格式是否为YYYY-MM-DD
 *	入参：日期字符串
 *	返回值：boolean,日期格式正确为true
 */
function isValidateDate(date) {
    date = $.trim(date);
    var reg = /^(\d{4})-(\d{2})-(\d{2})$/;
    reg.exec(date);
    if (!reg.test(date))
    {
        return false;
    }
    var year, month, day;
    year = parseInt(RegExp.$1, 10);//十进制转为数字
    month = parseInt(RegExp.$2, 10);//十进制转为数字
    day = parseInt(RegExp.$3, 10);//十进制转为数字
    //不在此范围的 日期格式，则判定不正常
    if (! ((1 <= month) && (12 >= month) && (31 >= day) && (1 <= day)))
    {
        return false;
    }
    //2月，4月，月都为偶数，有31天则不正常
    if ((month <= 7) && ((month % 2) == 0) && (day >= 31))
    {
        return false;
    }
    //10月与12月都为偶数，11月有31天则不正常
    if ((month >= 8) && ((month % 2) == 1) && (day >= 31))
    {
        return false;
    }
    //校验2月份天数是否正确
    if (month == 2)
    {
        if (((year % 400 == 0) || ((year % 4 == 0) && (year % 100 != 0))) && (day > 29))
        {
            return false;
        }
        else if(day > 28)
        {
            return false;
        }
    }
    return true;
}

/**
 *	功能：检验日期格式是否为YYYY-MM-DD HH:mm:ss
 *	入参：日期字符串
 *	返回值：boolean,日期格式正确为true
 */
function isValidateDateHours(date) {
    date = $.trim(date);
    var reg = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/;
    reg.exec(date);
    if (!reg.test(date))
    {
        return false;
    }
    var year, month, day, hours, minute, second;
    year = parseInt(RegExp.$1, 10);//十进制转为数字
    month = parseInt(RegExp.$2, 10);//十进制转为数字
    day = parseInt(RegExp.$3, 10);//十进制转为数字
    hours = parseInt(RegExp.$4, 10);//十进制转为数字
    minute = parseInt(RegExp.$5, 10);//十进制转为数字
    second = parseInt(RegExp.$6, 10);//十进制转为数字
    //不在此范围的 日期格式，则判定不正常
    if (! ((1 <= month) && (12 >= month) && (31 >= day) && (1 <= day)))
    {
        return false;
    }
    //2月，4月，月都为偶数，有31天则不正常
    if ((month <= 7) && ((month % 2) == 0) && (day >= 31))
    {
        return false;
    }
    //10月与12月都为偶数，11月有31天则不正常
    if ((month >= 8) && ((month % 2) == 1) && (day >= 31))
    {
        return false;
    }
    //校验2月份天数是否正确
    if (month == 2)
    {
        if (((year % 400 == 0) || ((year % 4 == 0) && (year % 100 != 0))) && (day > 29))
        {
            return false;
        }
        else if(day > 28)
        {
            return false;
        }
    }
    //校验时间基数是否大于60
    if(hours>60||minute>60||second>60)
    {
        return false;
    }
    return true;
}