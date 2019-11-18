/**
 * 方便DOM操作
 */
var $$ = function(id){
    return document.getElementById(id);
};
var $c = function(className){
    return document.getElementsByClassName(className);
};

var getInfo = function(){
    var courseList = [];
    var tableTrs = document.getElementsByClassName("tbllist")[0].rows; // 得到课表tr[]
    var stuInfo = {
        stuID: tableTrs[0].children[0].children[0].innerHTML,
        stuName: tableTrs[0].children[0].children[1].innerHTML,
        stuAcanemy : tableTrs[0].children[0].children[2].innerHTML,
        stuSchoolArea: tableTrs[0].children[0].children[3].innerHTML
    }
    var length = tableTrs.length;
    for(var i = 3; i < length-1; i++){
        courseList[i-3] = {
            courseID : tableTrs[i].cells[1].innerHTML,
            courseName : tableTrs[i].cells[2].innerHTML,
            teacherID  : tableTrs[i].cells[3].innerHTML,
            teacherName : tableTrs[i].cells[4].innerHTML,
            courseScore : tableTrs[i].cells[5].innerHTML,
            timeString : tableTrs[i].cells[6].innerHTML,
            classRoom : tableTrs[i].cells[7].innerHTML,
            courseSchoolArea : tableTrs[i].cells[8].innerHTML,
            QuestionWhen: tableTrs[i].cells[9].innerHTML,
            QuestionWhere: tableTrs[i].cells[10].innerHTML,
            examTime:'考试时间未知',
            examRoom:'考试地点未知',
            notesLocation:'笔记保存位置未知'
        }
    }
    return {stuInfo, courseList};
};
/**
 * 课表结构的设计，课表内容域14节*7天的单元格都为 class = 'course', 另外根据有无排课分为 'blank', 'hasclass', 对于 'hasclass', 根据今天是否有课，分为'today', 同时对于有多节课连在一起，对最后一节设置'last'
 */
var tableFramework = function(){
    var span = $$('courses_main').innerHTML;
    var tr = "<ul class='tr' id='";
    var ulsID;
    for(var i=0; i<14; i++){
        ulsID = String.fromCharCode(65+i);
        tr = tr + ulsID + "'><li id='"+String.fromCharCode(65+i) + "0" + "' class='left_th_time'></li>";
        for(var j=1; j<8; j++){
           tr = tr + "<li id='"+String.fromCharCode(65+i) + j + "' class='course blank'><a class='js-open-box' href='#'></a></li>";
        }
        tr = tr + "</ul>"
        span = span + tr;
        tr = "<ul class='tr' id='"
    }
    $$('courses_main').innerHTML = span;

    $$('A0').innerHTML = "08:00<br>1<br>08:45";
    $$('B0').innerHTML = "08:55<br>2<br>09:40";
    $$('C0').innerHTML = "10:00<br>3<br>10:45";
    $$('D0').innerHTML = "10:55<br>4<br>11:40";
    $$('E0').innerHTML = "12:10<br>5<br>12:55";
    $$('F0').innerHTML = "13:05<br>6<br>13:50";
    $$('G0').innerHTML = "14:10<br>7<br>14:55";
    $$('H0').innerHTML = "15:05<br>8<br>15:50";
    $$('I0').innerHTML = "16:00<br>9<br>16:45";
    $$('J0').innerHTML = "16:55<br>10<br>17:40";
    $$('K0').innerHTML = "18:00<br>11<br>18:45";
    $$('L0').innerHTML = "18:55<br>12<br>19:40";
    $$('M0').innerHTML = "19:50<br>13<br>20:35";
    $$('N0').innerHTML = "other<br>~<br>time";
    $$('N0').parentElement.setAttribute("id", "other_time")
};

var tableContent = function(){
    var dataSource = getInfo();
    /**
     * 颜色归一化渐变设计
     */
    var colorCollection=  [],
        len = dataSource.courseList.length;
    // console.log(len);
    var colorStep = len <= 360 ? Math.floor(360 / len) : 1; 
    var colorString = 'hsla(';
    for(var i = 0; i < len; i++){
        colorString += String(i * colorStep) + ', 100%, 50%, 0.5)';
        colorCollection[i] = colorString;
        colorString = 'hsla(';
    }
    // console.log(colorCollection);

    /**
     * 根据学号设置年级
     */
    var stuID = dataSource.stuInfo.stuID, // 学号：&nbsp;&nbsp;&nbsp;16122491
        currYear = $$('datetime_header').getAttribute('currYear') % 100,
        currMonth = $$('datetime_header').getAttribute('currMonth'),
        gradeReg = /\d{8}/;
        grade = Math.floor(parseInt(gradeReg.exec(stuID)['0']) / 1000000);
        // grade = Math.floor(parseInt(stuID.match(/\d{8}/)[0]) / 1000000);
    var gradeWords = ['一', '二', '三', '四', '五', '六', '七'];
    if(currMonth <= 8){
        $$('grade').innerHTML = '大' + gradeWords[currYear-grade-1];
    }
    else{
        $$('grade').innerHTML = '大' + gradeWords[currYear-grade];
    }
    
    /**
     * 正则表达式提取上课时间
     */    
    var timeString = '',
        timeList = [],
        span = '';
        cnt = 0,
        indexes = [],
        timeCycle = [],
        event = '',
        weekRecond = [];
    var regExp = /[一二三四五]\d{1,2}-\d{1,2}/g;
    var timeStringReg = /\S*/;
    for(var i=0; i<len; i++){
        /**
         * 第1重循环，针对每一门课
         */
        timeString = dataSource.courseList[i].timeString;
        var spaceReg = /^\s+|\s+$/g; // |代表或者   \s代表空格  +至少一个    前面有至少一个空格 或者后面有至少一个空格 且全局匹配
        // 去掉timeString首尾的括号
        timeString = timeString.replace(spaceReg, '');
        while(timeCycle = regExp.exec(timeString)){
            cnt++;
            indexes.push(timeCycle['index']);
            timeList.push(timeCycle['0']);
        }
        
        var timeItem = '',
            key = '',
            keyInt = 0;
        // +++++++++++++++++++++++debug好久才发现，key竟然是String******************
        // console.log(indexes[key]); // 可以返回
        // console.log(indexes[keyInt]); // 可以返回
        // console.log(indexes[key + 1]); // 返回underfined
        // console.log(timeString[timeString.length-1]); // 可以返回
        // ************************************************************************
        /**
         * 第2重循环，针对那一门课的每一个时间段
         */
        /**
         * 将timeString转化为课表标签id
         * eg: 五1-3, firstID: 1-3(A-C) secondID: 五(5)
         */
        for(key in timeList){
            keyInt = parseInt(key);
            timeItem = timeList[key];
            // console.log(timeItem);
            if(cnt == 1 || keyInt == cnt-1){
                if((timeString.length  - indexes[key]) > (timeItem.length)){
                    var selectWeekReg = /\d{1,2}[\-,，]\d{1,2}/g;
                    var stringPart = timeString.substring(indexes[key] + timeItem.length - 1, timeString.length);
                    // var result = stringPart.match(selectWeek);
                    var result = selectWeekReg.exec(stringPart);
                    if(result){
                        event = result[0];
                        var startReg = /^\d{1,2}/,
                            endReg = /\d{1,2}$/;
                        var startRegResult = startReg.exec(result['0']),
                            endRegResult = endReg.exec(result[0]);
                        var startWeekNum = parseInt(startRegResult[0]),
                            EndWeekNum = parseInt(endRegResult[0]);
                        if(result[0][endRegResult['index'] - 1] == ',' || result[0][endRegResult['index'] - 1]){
                            weekRecond.push(startWeekNum);
                            weekRecond.push(EndWeekNum);
                        }else{
                            for(var No = 0; No < EndWeekNum-startWeekNum; No++){
                                weekRecond.push(startWeekNum + No);
                            }
                        }
                    }
                    else{
                        event = timeString[timeString.length - 2] + timeString[timeString.length - 1];
                    }
                }else{
                    event = '上课';
                }
            }else{
                if((indexes[keyInt + 1] - indexes[key] -1) > timeItem.length){
                    event = timeString[indexes[keyInt + 1] - 3] + timeString[indexes[keyInt + 1] - 2];
                }else{
                    event = '上课';
                }
            }
            
            var firstIDstartReg = /\d{1,2}/,
                firstIDendReg = /\d{1,2}$/,
                secondIDReg = /^./;
            
            var firstIDstart = 64 + parseInt(firstIDstartReg.exec(timeItem)[0]);
            var firstIDend =  64+ parseInt(firstIDendReg.exec(timeItem)[0]);
            var secondID = secondIDReg.exec(timeItem)[0];
            switch(secondID){
                case "一":{
                    secondID = '1';
                    break;
                }
                case "二":{
                    secondID = '2';
                    break;
                }
                case "三":{
                    secondID = '3';
                    break;
                }
                case "四":{
                    secondID = '4';
                    break;
                }
                case "五":{
                    secondID = '5';
                    break;
                }
                default: break;
            }
            /**
             * 存在1,6周，或者5-10周的类型
             */
            if(weekRecond.length != 0){
                var currSHUweek = $$('shu_week').innerHTML;
                for(key in weekRecond){
                    if(weekRecond[key] == currSHUweek){
                        break;
                    }
                }
                span = dataSource.courseList[i].courseName + "<br>(" + event + ')' + '<br>(' + dataSource.courseList[i].classRoom + ')';
                $$(String.fromCharCode(firstIDstart) + secondID).children[0].innerHTML = span;
                /**
                 * 本周有课
                 */    
                if(key < weekRecond.length && weekRecond[key] == currSHUweek){
                    for(var k=firstIDstart; k <= firstIDend; k++){
                        /**
                         * 第3重循环：针对那一门课那一次课的每一小节课
                         */
                        $$(String.fromCharCode(k) + secondID).style.background = colorCollection[i];;
                        if(k == firstIDend){
                            $$(String.fromCharCode(k) + secondID).setAttribute('class', 'course hasclass last');
                            $$(String.fromCharCode(k) + secondID).style.borderBottom = '1px dotted rgba(128, 128, 128,0.5)';
        
                        }else{
                            $$(String.fromCharCode(k) + secondID).setAttribute('class', 'course hasclass');
                        }
                        /**
                         * 将课程信息写入课表单位元标签
                         */
                        $$(String.fromCharCode(k) + secondID).setAttribute('courseID', dataSource.courseList[i].courseID);
                        $$(String.fromCharCode(k) + secondID).setAttribute('courseName', dataSource.courseList[i].courseName);
                        $$(String.fromCharCode(k) + secondID).setAttribute('teacherID', dataSource.courseList[i].teacherID);
                        $$(String.fromCharCode(k) + secondID).setAttribute('teacherName', dataSource.courseList[i].teacherName);
                        $$(String.fromCharCode(k) + secondID).setAttribute('courseScore', dataSource.courseList[i].courseScore);
                        
                        $$(String.fromCharCode(k) + secondID).setAttribute('timeString', dataSource.courseList[i].timeString);
                        $$(String.fromCharCode(k) + secondID).setAttribute('classRoom', dataSource.courseList[i].classRoom);
                        $$(String.fromCharCode(k) + secondID).setAttribute('courseSchoolArea', dataSource.courseList[i].courseSchoolArea);
                        $$(String.fromCharCode(k) + secondID).setAttribute('QuestionWhen', dataSource.courseList[i].QuestionWhen);
                        $$(String.fromCharCode(k) + secondID).setAttribute('QuestionWhere', dataSource.courseList[i].QuestionWhere);
                    }
                }else{
                    /**
                     * 本周不上课
                     */
                    for(var k=firstIDstart; k<=firstIDend; k++){
                        /**
                         * 第3重循环：针对那一门课那一次课的每一小节课
                         */
                        $$(String.fromCharCode(k) + secondID).style.background = 'rgba(128, 128, 128,0.5)';
                        if(k == firstIDend){
                            $$(String.fromCharCode(k) + secondID).setAttribute('class', 'course hasclass  another last');
                            $$(String.fromCharCode(k) + secondID).style.borderBottom = '1px dotted rgba(128, 128, 128,0.5)';
        
                        }else{
                            $$(String.fromCharCode(k) + secondID).setAttribute('class', 'course hasclass another');
                        }

                        /**
                         * 将课程信息写入课表单位元标签
                         */
                        $$(String.fromCharCode(k) + secondID).setAttribute('courseID', dataSource.courseList[i].courseID);
                        $$(String.fromCharCode(k) + secondID).setAttribute('courseName', dataSource.courseList[i].courseName);
                        $$(String.fromCharCode(k) + secondID).setAttribute('teacherID', dataSource.courseList[i].teacherID);
                        $$(String.fromCharCode(k) + secondID).setAttribute('teacherName', dataSource.courseList[i].teacherName);
                        $$(String.fromCharCode(k) + secondID).setAttribute('courseScore', dataSource.courseList[i].courseScore);
                        
                        $$(String.fromCharCode(k) + secondID).setAttribute('timeString', dataSource.courseList[i].timeString);
                        $$(String.fromCharCode(k) + secondID).setAttribute('classRoom', dataSource.courseList[i].classRoom);
                        $$(String.fromCharCode(k) + secondID).setAttribute('courseSchoolArea', dataSource.courseList[i].courseSchoolArea);
                        $$(String.fromCharCode(k) + secondID).setAttribute('QuestionWhen', dataSource.courseList[i].QuestionWhen);
                        $$(String.fromCharCode(k) + secondID).setAttribute('QuestionWhere', dataSource.courseList[i].QuestionWhere);
                    }
                }
                
                
            }else{
                /**
                 * 不存在1,6周，5-10周类型的课
                 */
                if(event == '上机' || event == '实验'){
                    span = dataSource.courseList[i].courseName + "<br>(" + event + ')' + '<br>(教室待定)';
                }else{
                    // event == '上课' || event == '研讨'
                    span = dataSource.courseList[i].courseName + "<br>(" + event + ')' + '<br>(' + dataSource.courseList[i].classRoom + ')';
                }

                $$(String.fromCharCode(firstIDstart) + secondID).children[0].innerHTML = span;

                for(var k=firstIDstart; k<=firstIDend; k++){
                    /**
                     * 第3重循环：针对那一门课那一次课的每一小节课
                     */
                    $$(String.fromCharCode(k) + secondID).style.background = colorCollection[i];
                    if(k == firstIDend){
                        $$(String.fromCharCode(k) + secondID).setAttribute('class', 'course hasclass last');
                        $$(String.fromCharCode(k) + secondID).style.borderBottom = '1px dotted rgba(128, 128, 128,0.5)';
    
                    }else{
                        $$(String.fromCharCode(k) + secondID).setAttribute('class', 'course hasclass');
                    }
                    /**
                     * 将课程信息写入课表单位元标签
                     */
                    $$(String.fromCharCode(k) + secondID).setAttribute('courseID', dataSource.courseList[i].courseID);
                    $$(String.fromCharCode(k) + secondID).setAttribute('courseName', dataSource.courseList[i].courseName);
                    $$(String.fromCharCode(k) + secondID).setAttribute('teacherID', dataSource.courseList[i].teacherID);
                    $$(String.fromCharCode(k) + secondID).setAttribute('teacherName', dataSource.courseList[i].teacherName);
                    $$(String.fromCharCode(k) + secondID).setAttribute('courseScore', dataSource.courseList[i].courseScore);
                    
                    $$(String.fromCharCode(k) + secondID).setAttribute('timeString', dataSource.courseList[i].timeString);
                    $$(String.fromCharCode(k) + secondID).setAttribute('classRoom', dataSource.courseList[i].classRoom);
                    $$(String.fromCharCode(k) + secondID).setAttribute('courseSchoolArea', dataSource.courseList[i].courseSchoolArea);
                    $$(String.fromCharCode(k) + secondID).setAttribute('QuestionWhen', dataSource.courseList[i].QuestionWhen);
                    $$(String.fromCharCode(k) + secondID).setAttribute('QuestionWhere', dataSource.courseList[i].QuestionWhere);
                }
            }
        }
        timeString = '';
        timeList = [];
        timeCycle = [];
        indexes = [];
        cnt = 0;
        event = '',
        weekRecond = [];
    }    
};

var initCourseTable = function(){
    tableFramework();
    tableContent();
}();


$('.js-open-box').on('click',function(e){
    /**
     * 只想问，这个jQuery为什么要我兜这么大圈子
     */
    var target = $(e.target);
    // console.log(target);
    var part = $(target.parents('li'))[0];
    console.log(part);
    // console.log(part.getAttribute('courseName'));
    // console.log($('#courseName')[0].innerHTML);
    $('#courseID')[0].innerHTML = part.getAttribute('courseID');
    $('#courseName')[0].innerHTML = part.getAttribute('courseName');
    $('#teacherID')[0].innerHTML = part.getAttribute('teacherID');
    $('#teacherName')[0].innerHTML = part.getAttribute('teacherName');
    $('#courseScore')[0].innerHTML = part.getAttribute('courseScore');
    $('#timeString')[0].innerHTML = part.getAttribute('timeString');
    $('#classRoom')[0].innerHTML = part.getAttribute('classRoom');
    $('#courseSchoolArea')[0].innerHTML = part.getAttribute('courseSchoolArea');
    $('#QuestionWhen')[0].innerHTML = part.getAttribute('QuestionWhen');
    $('#QuestionWhere')[0].innerHTML = part.getAttribute('QuestionWhere');
    
    $('.overlay, .box-login').fadeIn(200);
});
$('.overlay').on('click',function(){
    $('.overlay, .box-login').fadeOut(200,function(){
        $(this).removeAttr('style');
    });
});
$('.close-it').on('click',function(event) {
    $(this).parents('.overlay').fadeOut(200,function(){
        $(this).removeAttr('style');
    });
});

// var colorCollection = [
//     'hsla(0, 100%, 50%, 0.5)', 'hsla(15, 100%, 50%, 0.5)', 'hsla(30, 100%, 50%, 0.5)',
//     'hsla(45, 100%, 50%, 0.5)', 'hsla(60, 100%, 50%, 0.5)', 'hsla(75, 100%, 50%, 0.5)', 
//     'hsla(90, 100%, 50%, 0.5)', 'hsla(105, 100%, 50%, 0.5)', 'hsla(120, 100%, 50%, 0.5)', 
//     'hsla(135, 100%, 50%, 0.5)', 'hsla(150, 100%, 50%, 0.5)', 'hsla(165, 100%, 50%, 0.5)', 
//     'hsla(180, 100%, 50%, 0.5)', 'hsla(195, 100%, 50%, 0.5)', 'hsla(210, 100%, 50%, 0.5)',
//     'hsla(225, 100%, 50%, 0.5)',  'hsla(240, 100%, 50%, 0.5)', 'hsla(255, 100%, 50%, 0.5)', 
//     'hsla(270, 100%, 50%, 0.5)', 'hsla(285, 100%, 50%, 0.5)', 'hsla(300, 100%, 50%, 0.5)', 
//     'hsla(315, 100%, 50%, 0.5)', 'hsla(330, 100%, 50%, 0.5)', 'hsla(345, 100%, 50%, 0.5)'
// ];

