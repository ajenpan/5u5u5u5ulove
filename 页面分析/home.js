
//常用页面变量解析:
var totalLesson;
/*totalLesson:
canTest: false
feeStats: 1
lessons: (4) [
    {available: "1"
    businessStageId: 582333392
    canTest: false
    finishedPeriod: null
    id: 605975478
    invalidPeriod: 0
    learningOrder: 1
    list: (13) [{
        busTypeId: null
        canStudy: null
        canTest: false
        chapId: 821514191
        chapName: "01-法律、法规及道路交通信号"
        currentVideo: null
        feeStats: 1
        gainPeriod: 1500
        handouts: null
        hits: 0
        id: 582340576 
        learnedTime: 1500
        mainVideo: null
        name: "L201机动车登记规定"
        netUrl: null
        period: 1500
        picurl: null
        remainHours: null
        resType: "1"
        state: "已完成"
        testResult: ""
        tms: null
        totalTime: null
        videoName: null
        videoTime: 0
        videos: null}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {
        busTypeId: null
        canStudy: null
        canTest: false
        chapId: 821516440
        chapName: "02-机动车基本知识"
        currentVideo: null
        feeStats: 1
        gainPeriod: null
        handouts: null
        hits: 0
        id: 595503171
        learnedTime: null
        mainVideo: null
        name: "L105车辆的维护保养与安全检视"
        netUrl: null
        period: 1200
        picurl: null
        remainHours: null
        resType: "1"
        state: null
        testResult: null
        tms: null
        totalTime: null
        videoName: null
        videoTime: 0
        videos: null}]
    msg: null
    name: "道路交通安全法规"
    needStageTest: "1"
    period: 32400
    remainPeriod: null
    score: 100
    stageTestTempId: null
    state: "未完成"
    testResult: ""}, {…}, {…}, {…}]
msg: null
name: null
needTest: "1"
passNum: null
recordType: "3"
state: "未完成"
stipulatePassNum: null
testResult: "已通过"
totalPeriod: null
*/

//study 582343075

var graduationGrade; //打印出来是null

var curStudyState; //学习状态
/* curStudyState: 
canStudy: "1"
finishGainPeriod: null
gainPeriod: 26580
lastStudyCId: null
lastStudyCourse: null
name: null
needGradeTest: "0"
stage: null
stageId: null
studyTime: 26580
*/

var personalInfo; //个人信息
var stageless = '1';

$(function () {
    $(".kec").addClass("active");
    var loadi = layer.load('个人学习进度加载中.'); //需关闭加载层时，执行layer.close(loadi)即可
    $.ajax({
        url: "https://hz.5u5u5u5u.com:443/lessonListContent.action?ttm=" + (new Date()).getTime(),
        cache: false,
        success: function (data) {
            if (data && data.curStudyState && data.totalLesson) {
                totalLesson = data.totalLesson;
                curStudyState = data.curStudyState;
                personalInfo = data.personalInfo;
                graduationGrade = data.graduationGrade;
                if ("1" == data.firstLoginStats) {
                    //跳转到须知页面
                    location.href = "https://hz.5u5u5u5u.com:443/toLearnRequire.action?navigation=1";
                    return;
                }
                //设置课件列表
                setLessonList();
                //设置在学的阶段
                setLearnStage();
                layer.close(loadi);
                if (totalLesson.feeStats == 2) {
                    //未激活，弹出卡号密码框
                    activate = 0;
                    topUpPop(0);
                    return;
                }
                var systemId = '3301';
                var photo = personalInfo.facePhoto;
                if ("3301" == systemId || "6223" == systemId) {
                    if (!photo) {
                        registFacePhoto();
                    }
                }
                if (totalLesson.recordType == '1' || totalLesson.recordType == '6') {
                    if (!photo) {
                        registFacePhoto();
                    }
                }

            } else {
                layer.close(loadi);
                hideAll();
            }
        }
    });

});

//设置在学的阶段
function setLearnStage() {
    var flag = true;
    for (var i = 0; i < totalLesson.lessons.length; i++) {
        if (totalLesson.lessons[i].state != "已完成" && totalLesson.lessons[i].learningOrder) {
            setTab(i);
            flag = false;
            break;
        }
    }
    if (flag && totalLesson.lessons.length > 0) setTab(totalLesson.lessons.length - 1);
}

//设置课件列表
function setLessonList() {
    //tab标签
    var tabHtml = "<ul>";
    for (var i = 0; i < totalLesson.lessons.length; i++) {
        if (totalLesson.lessons[i].learningOrder) {
            var temp = "";
            // 			if(totalLesson.lessons[i].state == "已完成") temp = "(已完成)";
            tabHtml += "<li id='s" + i + "' onclick='setTab(" + i + ")' >" + totalLesson.lessons[i].name + "</li>";
            setTabHtml(i);
        }
    }
    tabHtml += "</ul>";
    $(".lib_Menubox").html(tabHtml);
}

//放置tab页
function setTabHtml(index) {
    if (!totalLesson.lessons[index].learningOrder) return;//排序为0的是历史原因不需要显示的阶段.
    var tabContent = "";
    tabContent += "<div id='stg" + index + "' style='display:none;overflow-x: hidden;'>";
    var remainTime = totalLesson.lessons[index].period / 60 - stageGainPeriod(totalLesson.lessons[index]) + totalLesson.lessons[index].invalidPeriod;
    tabContent += '<div class="jbyq">要求学习时长：<span>' + totalLesson.lessons[index].period / 60 + '分钟</span><span class="em_2"></span>剩余需学习时长：<span>' + (remainTime > 0 ? remainTime : 0) + '分钟</span><span class="em_2"></span>';
    if (totalLesson.lessons[index].needStageTest == '3') {
        if (totalLesson.lessons[index].canTest) {
            tabContent += '科目测试：<a href="#" class="jbuttom"  onclick="testStage(' + totalLesson.lessons[index].id + ');" style="background-color: #fb965c;">阶段测试</a>';
        } else {//有阶段测试 结业未完成
            if (!totalLesson.canTest && totalLesson.needTest == '4') {
                if (totalLesson.lessons[index].state == "已完成") {
                    tabContent += '科目测试：<a  class="jbuttom">已完成:' + totalLesson.lessons[index].score + '分</a>';
                } else {
                    tabContent += '科目测试：<a  class="jbuttom" title="完成' + totalLesson.lessons[index].name + '要求学时才能进行阶段测试">阶段测试</a>';
                }
            }
        }
    }
    if (totalLesson.needTest == '4') {
        if (totalLesson.canTest) {
            tabContent += '结业测试：<a href="#" class="jbuttom" onclick="complete();" style="background-color: #fb965c;">结业测试</a>';
        } else {
            if (graduationGrade) {
                tabContent += '结业测试：<a  class="jbuttom">已完成:' + graduationGrade + '分</a>';
            }
        }
    }
    tabContent += '</div>';
    tabContent += "<table width='830' border='0' cellpadding='0' cellspacing='0' bgcolor='#70cf68'>";
    tabContent += "<tr><th width='38'>&nbsp;</th><th width='246'>在学课程</th><th width='115'>课件时长(分钟)</th><th width='125' title='在该课件上用掉的时间'>剩余需学习时长(分钟)</th><th>操 作</th></tr>";
    tabContent += "</table>";

    tabContent += "<div class='kzlb_t1'>";

    tabContent += "</div>";
    tabContent += "</div>";

    $(".lib_Contentbox").append(tabContent);
    var finishedTable = "";
    var existfinish = false;
    //加入章节
    var existMap = {};
    for (var i = 0; i < totalLesson.lessons[index].list.length; i++) {
        var chapId = totalLesson.lessons[index].list[i].chapId;
        var chapName = totalLesson.lessons[index].list[i].chapName;
        //在学
        if (totalLesson.lessons[index].list[i].state != "已完成") {
            if ($("#stg" + index + " #chap" + chapId).length == 0) {
                $('#stg' + index + ' .kzlb_t1').append('<table class="tab_silde1" id="chap' + chapId + '" width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#dff9dd"><thead ><tr><th width="38"><div class="naobiao_icon fr bg1"><i class="triangle"></i></div></th><th colspan="4" align="left">' + chapName + '</th><th><a href="#" class="zbutton_2 kfr">开始学习</a></th><th></th></tr></thead></table>');
            }
        }
        //已学
        if (totalLesson.lessons[index].list[i].state == "已完成") {
            existfinish = true;
            if (!existMap["chaps" + chapId]) {
                existMap["chaps" + chapId] = "1";
                finishedTable += '<table class="tab_silde1" id="chaps' + chapId + '" width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#e4e4e4"><thead><tr><th width="38"><div class="naobiao_icon fr bg1"><i class="triangle"></i></div></th><th colspan="6" align="left">' + chapName + '</th></tr></thead></table>';
            }
        }
    }
    //已学
    //已完成的放后面
    if (existfinish) {
        var yitabContent = "<table width='100%'  border='0' cellpadding='0' cellspacing='0' bgcolor='#ddd'>";
        yitabContent += "<tr class='extable'><th style='background-color:#ddd;' width='38'>&nbsp;</th><th width='246' style='background-color:#ddd;'>已学课程</th><th width='115' style='background-color:#ddd;'>课件时长(分钟)</th><th width='125' style='background-color:#ddd;'>剩余需学习时长(分钟)</th><th style='background-color:#ddd;'>操 作</th></tr>";
        yitabContent += "</table>";
        $('#stg' + index + ' .kzlb_t1').append(yitabContent);
        $('#stg' + index + ' .kzlb_t1').append(finishedTable);
    }


    for (var i = 0; i < totalLesson.lessons[index].list.length; i++) {
        var unfinishedHtml = "";
        var complateHtml = "";
        var chapId = totalLesson.lessons[index].list[i].chapId;
        if (totalLesson.lessons[index].list[i].state != "已完成") {
            unfinishedHtml += "<tr><td width='38'>&nbsp;</td><td class='tdl' width='243'>" + totalLesson.lessons[index].list[i].name + "</td><td width='108'>" + timeFormat(totalLesson.lessons[index].list[i].period) + "</td><td width='108'>" + timeFormat(totalLesson.lessons[index].list[i].period - totalLesson.lessons[index].list[i].gainPeriod) + "</td>";

            if (totalLesson.lessons[index].available != 0) {
                if (totalLesson.lessons[index].list[i].feeStats == 1) {
                    if (totalLesson.lessons[index].list[i].learnedTime) {
                        unfinishedHtml += "<td><a href='javascript:;' id='c" + totalLesson.lessons[index].list[i].id + "' onclick='study(" + totalLesson.lessons[index].list[i].id + "," + totalLesson.lessons[index].id + "," + 0 + ")' class='kbutton_1 kfr'>开始学习</a></td>";
                    } else {
                        unfinishedHtml += "<td><a href='javascript:;' id='c" + totalLesson.lessons[index].list[i].id + "' onclick='study(" + totalLesson.lessons[index].list[i].id + "," + totalLesson.lessons[index].id + "," + -1 + ")' class='kbutton_1 kfr'>开始学习</a></td>";
                    }
                } else if (totalLesson.lessons[index].list[i].feeStats == 2) {
                    //未激活，弹出卡号密码框
                    unfinishedHtml += "<td><a href='javascript:;' id='c" + totalLesson.lessons[index].list[i].id + "' onclick='topUpPop(0)' class='kbutton_4 kfr'>开始学习</a></td>";
                    activate = 0;
                } else {
                    if (totalLesson.lessons[index].state == "已完成") {
                        unfinishedHtml += "<td><a href='javascript:;' id='c" + totalLesson.lessons[index].list[i].id + "' onclick='buyCourse(" + index + "," + i + "," + -1 + ")' class='kbutton_4 kfr'>购买课件</a></td>";

                    } else {
                        unfinishedHtml += "<td><a href='javascript:;' id='c" + totalLesson.lessons[index].list[i].id + "' onclick='buyCourse(" + index + "," + i + "," + -1 + ")' class='kbutton_4 kfr'>购买课件</a></td>";
                    }
                }
            } else {
                if (totalLesson.lessons[index].list[i].feeStats == 0) {
                    unfinishedHtml += "<td><a href='#'  class='kbutton_g kfr'>购买课件</a></td>";
                } else {
                    unfinishedHtml += "<td><a href='#'  class='kbutton_g kfr'>开始学习</a></td>";
                }
            }

            if (!totalLesson.lessons[index].list[i].canTest || totalLesson.lessons[index].available == 0) {
                unfinishedHtml += "<td width='100'></td></tr>";
            } else {
                unfinishedHtml += "<td><a href='#' onclick='homework(" + totalLesson.lessons[index].list[i].id + "," + totalLesson.lessons[index].id + ")' class='kbutton_3'>课后作业</a></td></tr>";
            }
        }

        if (totalLesson.lessons[index].list[i].state == "已完成") {
            complateHtml += "<tr><td width='38'>&nbsp;</td><td class='tdl' width='243'>" + totalLesson.lessons[index].list[i].name + "</td><td width='108'>" + timeFormat(totalLesson.lessons[index].list[i].period) + "</td><td width='108'>" + timeFormat(totalLesson.lessons[index].list[i].period - totalLesson.lessons[index].list[i].gainPeriod) + "</td>";

            if (totalLesson.lessons[index].available != 0) {
                complateHtml += "<td><a href='#' id='c" + totalLesson.lessons[index].list[i].id + "' onclick='study(" + totalLesson.lessons[index].list[i].id + "," + totalLesson.lessons[index].id + "," + 1 + ")' class='kbutton_1 kfr'>继续复习</a></td><td width='100'></td></tr>";
            } else {
                complateHtml += "<td><a href='#' class='kbutton_g kfr'>继续复习</a></td><td width='100'></td></tr>";
            }

        }
        $("#stg" + index + " #chap" + chapId).append(unfinishedHtml);
        $("#stg" + index + " #chaps" + chapId).append(complateHtml);
    }
    $(".tab_silde1").tab_silde();
}

//切换到指定tab页
function setTab(index) {
    for (var i = 0; i < totalLesson.lessons.length; i++) {
        $("#s" + i).removeClass();
        $("#stg" + i).hide();
    }
    $("#s" + index).addClass("hover");
    $("#stg" + index).show();
    $("#stg" + index + " .tab_silde1").tab_silde();
}