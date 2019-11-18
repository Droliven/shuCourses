/**
 * 经常报错 "calendar.js:184 Uncaught TypeError: Cannot read property 'getAttribute' of null",
 * 是因为在此处定义$$(id)时返回值应该是"return document.getElementById(id);"
 * 而不是"return document.getElementById('id');"
 */ 
var $$ = function(id){
    return document.getElementById(id);
}
/**
 * 定义校历时间区间
 */
var SHU_calendar = function(){
    var shuTerm = [
        /**
         * 判断顺序：秋季、春节假、春季、夏季、暑假、冬季
         */
        {
            term: '秋季',
            start:[2019, 9, 2],
            startTime: new Date(2019, 8, 2).getTime(),
            end:[2019, 11, 24],
            endTime: new Date(2019, 10, 24).getTime(),
        },
        {
            term: '冬季',
            start:[2019, 11, 25],
            startTime: new Date(2019, 10, 25).getTime(),
            end:[2020, 3, 22],
            endTime: new Date(2020, 2, 22).getTime(),

        },
        {
            term: '春节假',
            start:[2020, 1, 6],
            startTime: new Date(2020, 0, 6).getTime(),
            end:[2020, 2, 9],
            endTime: new Date(2020, 1, 9).getTime(),

        },
        {
            term: '春季',
            start:[2020, 3, 23],
            startTime: new Date(2020, 2, 23).getTime(),
            end:[2020, 6, 14],
            endTime: new Date(2020, 5, 14).getTime(),

        },
        {
            term: '夏季',
            start:[2020, 6, 15],
            startTime: new Date(2020, 5, 15).getTime(),
            end:[2020, 7, 12],
            endTime: new Date(2020, 6, 12).getTime(),
        },
        {
            term: '暑假',
            start:[2020, 7, 13],
            startTime: new Date(2020, 6, 13).getTime(),
            end:[2020, 8, 30],
            endTime: new Date(2020, 7, 30).getTime(),
        }
    ];
    var weekEndYear = $$('datetime_header').getAttribute('weekEndYear'),
        weekEndMonth = $$('datetime_header').getAttribute('weekEndMonth'),
        weekEndDate = $$('datetime_header').getAttribute('weekEndDate');
    var weekEndTime = new Date(weekEndYear, weekEndMonth-1, weekEndDate).getTime();
    var flag = true;
    for(var i = 0; i<6; i++){
        if(i==1){
            continue;
        }
        if(shuTerm[i].startTime<=weekEndTime && shuTerm[i].endTime>=weekEndTime){
            $$('term').innerHTML = shuTerm[i].term;
            var pastDays = Math.floor((weekEndTime - shuTerm[i].startTime) / (1000*60*60*24)) -5,
                passWeeks = Math.ceil(pastDays / 7);
            $$('shu_week').innerHTML = passWeeks;
            flag = false;
            break;
        }   
    }
    if(flag){
        if(shuTerm[1].startTime<=weekEndTime && shuTerm[2].startTime>weekEndTime){
            $$('term').innerHTML = shuTerm[1].term;
            var pastDays = Math.floor((weekEndTime - shuTerm[1].startTime) / (1000*60*60*24)) -5,
                passWeeks = Math.ceil(pastDays / 7);
            $$('shu_week').innerHTML = passWeeks;
        }
        else{
            if(shuTerm[2].endTime<weekEndTime && shuTerm[1].endTime>=weekEndTime){
                $$('term').innerHTML = shuTerm[1].term;
                var pastDays = Math.floor((weekEndTime - shuTerm[1].startTime - shuTerm[2].endTime + shuTerm[2].startTime) / (1000*60*60*24)) - 5,
                    passWeeks = Math.ceil(pastDays / 7);
                $$('shu_week').innerHTML = passWeeks;
            }
            else{
                $$('term').innerHTML = '..';
                $$('shu_week').innerHTML = -1;
            }
        }
    }
}

/**
 * 判断是否为闰年
 */
var isLeapYear = function(year) {
    return (year % 400 == 0) || (year % 4 == 0 && year % 100 != 0); // 有真则真
}
/**
 * 获取某一年的天数
 */
var yearDaysNum = function(y){
    return isLeapYear(y) ? 366 : 365;
}
/**
 * 获取某一年份的某一月份的天数
 */
var getMonthDays = function(year, month) {
    return [31, null, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month-1] || (isLeapYear(year) ? 29 : 28);
}
/**
 * 由那一天的日期计算出那一天在那一年的周数
 */
var date2WeekNumber = function (y, m, date) {
   var daysNum = date;
    for (var i = 1; i < m; i++) {
        daysNum += getMonthDays(y, i);
    }
    //那一年第一天是星期几
    var yFirstDay = new Date(y, 0, 1).getDay() || 7;
    var week = null;
    if (yFirstDay == 1) {
        week = Math.ceil(daysNum / 7); 
    } else {
        week = Math.ceil((daysNum + yFirstDay - 1) / 7) ;
    }
    return week;
    /*注意：这里在算第几周时，日历把周一作为每周第一天，将周日的getDay()转化为7
    例如：2018年1月1日是周日第1周，则1月2日周一是第2周*/
}
/**
 * 由那一天在那一年的天数计算出那一天的日期YMDDW
 * @param {number} y 
 * @param {number} daysNum 
 * 注意：daysNum = 0等同于daysNum = -1
 */
var daysNum2Date = function(y, daysNum){
    var year = y,
        date,
        month = 1;
    if (daysNum == 0){
        daysNum = -1;
    }
    if(daysNum < 0){
        year -= 1;
        daysNum = yearDaysNum(year) + daysNum +1;
    }
    else{
        if(daysNum > yearDaysNum(y)){
            year += 1;
            daysNum -= yearDaysNum(year-1);
        }
    }
    while(daysNum > 0){
        date = daysNum;
        daysNum -= getMonthDays(year, month);
        month += 1;
    }
    if(daysNum <= 0){
        month -=1;
    }
    var d = new Date(year, month-1, date);
    var day = d.getDay() || 7,
        week = date2WeekNumber(year, month, date);
    var md = {
        "year":year,
        "month":month,
        "date":date,
        "day":day,
        "week":week
    }
    return md;
}
/**
 * 由周数计算出结束日期,
 * 在通过上下周的按钮切换时，可能使得周数为0，
 * 周数为0、-1都则代表这一年第一周最后一天往前偏移7天作为新周末的那一周
 */
var weekNumber2Date = function(y, weekNum){
    if(weekNum < 0){
        weekNum += 1;
    }
    var yFirstDay = new Date(y, 0, 1).getDay() || 7;
    var daysNumMax = weekNum*7 - (yFirstDay-1);
    
    var dateMax = daysNum2Date(y, daysNumMax);
    return dateMax;
}
/**
 * 计算正负偏移 
 */
var calcTime = function(y, m, d, num){
    var d = new Date(y, m-1, d);
    var num = num || 0,
        /*!!!!这个语法又是什么?!!!!*/
        someTime = d.getTime()  + (24 * 60 *60 *1000) * num;
    var someD =  new Date(someTime);
    var someYear = someD.getFullYear(),
        someMonth = someD.getMonth() + 1,  //未来月
        someDate =someD.getDate(),  //未来天
        someDay = someD.getDay() || 7,
        someWeek = date2WeekNumber(someYear, someMonth, someDate);
    var obj = {
        "year":someYear,
        "month":someMonth,
        "date":someDate,
        "day":someDay,
        "week":someWeek
    };
    return obj;
}

/*创建周历*/
var creatWeekCalendar = function(y, wNum){
    var dateEnd = weekNumber2Date(y, wNum);
    var yearMax = dateEnd.year,
        monthMax = dateEnd.month,
        dateMax = dateEnd.date,
        dayMax = dateEnd.day,
        weekMax = dateEnd.week;
    $$('datetime_header').setAttribute('weekEndYear', yearMax);
    $$('datetime_header').setAttribute('weekEndMonth', monthMax);
    $$('datetime_header').setAttribute('weekEndDate', dateMax);
    $$('datetime_header').setAttribute('weekEndDay', dayMax);
    $$('datetime_header').setAttribute('weekEndWeek', weekMax);
    
    var month = monthMax < 10 ? "0"+monthMax : monthMax,
        week = weekMax < 10 ? "0"+weekMax : weekMax;
    $$('year_selector').value = yearMax;
    $$('month_selector').innerHTML = month;
    $$('week_selector').value = week;
    
    var a = "<li id='calendar_first' class='left_th_time'>calendar</li>";
    for (var i = -6; i < 1; i++) {
        if (calcTime(yearMax, monthMax, dateMax, i).month == $$('datetime_header').getAttribute('currMonth') && calcTime(yearMax, monthMax, dateMax, i).date == $$('datetime_header').getAttribute('currDate')) {
            a = a + '<li class="active" data-year="'+calcTime(yearMax, monthMax, dateMax, i).year+'" data-day="'+calcTime(yearMax, monthMax, dateMax, i).day+'" data-week="'+calcTime(yearMax, monthMax, dateMax, i).week+'" title="'+calcTime(yearMax, monthMax, dateMax, i).month+'月">'+calcTime(yearMax, monthMax, dateMax, i).date+'</li>';
        }
        else{
            if(calcTime(yearMax, monthMax, dateMax, i).month != parseInt($$('month_selector').innerHTML)){
                a = a + '<li class="thatmonth" data-year="'+calcTime(yearMax, monthMax, dateMax, i).year+'" data-day="'+calcTime(yearMax, monthMax, dateMax, i).day+'" data-week="'+calcTime(yearMax, monthMax, dateMax, i).week+'" title="'+calcTime(yearMax, monthMax, dateMax, i).month+'月">'+calcTime(yearMax, monthMax, dateMax, i).date+'</li>';
            }
            else{
                a = a + '<li data-year="'+calcTime(yearMax, monthMax, dateMax, i).year+'" data-day="'+calcTime(yearMax, monthMax, dateMax, i).day+'" data-week="'+calcTime(yearMax, monthMax, dateMax, i).week+'" title="'+calcTime(yearMax, monthMax, dateMax, i).month+'月">'+calcTime(yearMax, monthMax, dateMax, i).date+'</li>';
            }
        }
    };
    $$('weeklyCanlendarView').innerHTML = a;
    SHU_calendar();
}

var currWeekPage = function(){
    var d0 = new Date();
    var nowYear = d0.getFullYear();
        nowMonth = d0.getMonth() + 1, /*这里加1*/ 
        nowDate = d0.getDate(),
        nowDay = d0.getDay() || 7,
        nowWeek = date2WeekNumber(nowYear, nowMonth, nowDate);
    var nowWeekEnd = calcTime(nowYear, nowMonth, nowDate, 7-nowDay);
    var nowWeekEndYear = nowWeekEnd.year,
        nowWeekEndMonth = nowWeekEnd.month,
        nowWeekEndDate = nowWeekEnd.date,
        nowWeekEndDay = nowWeekEnd.day,
        nowWeekEndweek = nowWeekEnd.week;
    $$('datetime_header').setAttribute('currYear',nowYear);
    $$('datetime_header').setAttribute('currMonth',nowMonth);
    $$('datetime_header').setAttribute('currDate',nowDate);
    $$('datetime_header').setAttribute('currDay',nowDay);
    $$('datetime_header').setAttribute('currWeek',nowWeek);
    /**
     * currWeekEndYear这个属性是为了在goback()调回今天时，传入本周末的年份和周数
     */
    $$('datetime_header').setAttribute('currWeekEndYear',nowWeekEndYear);
    $$('datetime_header').setAttribute('weekEndYear',nowWeekEndYear);
    $$('datetime_header').setAttribute('weekEndMonth',nowWeekEndMonth);
    $$('datetime_header').setAttribute('weekEndDate',nowWeekEndDate);
    $$('datetime_header').setAttribute('weekEndDay',nowWeekEndDay);
    $$('datetime_header').setAttribute('weekEndWeek',nowWeekEndweek);

    creatWeekCalendar(nowWeekEndYear, nowWeekEndweek);
}

/*初始化周历*/
var initDatetime = function(){
    var span ="<li id='left_th_time_first' class='left_th_time'>time</li>";
    var weeks_ch = ['一', '二', '三', '四', '五', '六', '日'];
    for (var i = 0,len = weeks_ch.length; i < len; i++) {
    span += '<li>'+weeks_ch[i]+'</li>';
    };
    $$('weeks_ch').innerHTML = span;

    currWeekPage();
}();

/*前一周*/          
$$('prev_week').onclick = function(){            
    var yMove = parseInt($$('year_selector').value),
        wMove = parseInt($$('week_selector').value) - 1;
    creatWeekCalendar(yMove, wMove);
}

/*后一周*/
$$('next_week').onclick = function(){
    var yMove = parseInt($$('year_selector').value),
        wMove = parseInt($$('week_selector').value) + 1;
    creatWeekCalendar(yMove, wMove);
}
$$('change').onclick = function(){
    var yMove = parseInt($$('year_selector').value),
        wMove = parseInt($$('week_selector').value);
        creatWeekCalendar(yMove, wMove);
    }
$$('goback').onclick = function(){
    var yMove = parseInt($$('datetime_header').getAttribute('currWeekEndYear')),
        wMove = parseInt($$('datetime_header').getAttribute('currWeek'));
    creatWeekCalendar(yMove, wMove);
}

function weeklyCalendar(options){
    /**
     * @param obj 返回的月份和日期
     * @param {number} num 距离现在的正负天数
     */
    
    var lis = $$('weeklyCanlendarView').getElementsByTagName('li');
    /*在html文档中的ul标签内部貌似没有li标签，但这里却好像无中生有*/
    /*选择日期*/
    $$('weeklyCanlendarView').onclick = function(e){
        var tagName = e.target.tagName.toLowerCase();
        if (tagName == "li") {
            for(var i = 1,len = lis.length;i < len;i++){
                // 本来通过lis[i].属性可以直接取得，但是由于本例中，部分属性中间减号，导致浏览器将其作为减号运算
                if(lis[i].getAttribute('data-year')==$$('datetime_header').getAttribute('currYear') && parseInt(lis[i].title)==$$('datetime_header').getAttribute('currMonth') && lis[i].innerHTML==$$('datetime_header').getAttribute('currDate')){
                    lis[i].className = 'active';
                }
                else{
                    if(lis[i].getAttribute('data-year')!=$$('datetime_header').getAttribute('currYear') || parseInt(lis[i].title)!=$$('datetime_header').getAttribute('currMonth')){
                        lis[i].className = 'thatmonth';
                    }
                    else{
                        lis[i].className = '';
                    }
                }
            }
            e.target.className = "clickActive";
            
            console.log('success')

            var _y = e.target.getAttribute('data-year'),
                _m = parseInt(e.target.title) < 10 ? "0"+parseInt(e.target.title) : parseInt(e.target.title),
                _date = e.target.innerHTML < 10 ? "0"+e.target.innerHTML : e.target.innerHTML,
                _day = e.target.getAttribute('data-day'),
                _w = e.target.getAttribute('data-week') < 10 ? "0"+e.target.getAttribute('data-week') : e.target.getAttribute('data-week');
            var dateTime = {
                "year":_y,
                "month":_m,
                "date":_date,
                "day":_day,
                "week":_w
            }
            if(options && typeof options === "object" && options['clickDate']){
                options['clickDate'](dateTime)
            }
        }
    }
}


/*周历使用*/
weeklyCalendar({
    //点击日期的回调，dateTime为选中的日期对象
    clickDate:function(dateTime){
    console.log(dateTime);
    }
});
