// ==UserScript==
// @name         5u_auto_go_video
// @namespace    https://github.com/AJenpan/5u5u5u5ulove
// @version      0.1
// @description  fuck 5u, fuck bureaucratism!
// @author       Ajen
// @match        hz.5u5u5u5u.com/toLessonList.action*
// @grant        unsafeWindow
// ==/UserScript==
'use strict';

//这里使用了窗口权限,方便调试
unsafeWindow.on = true;

unsafeWindow.checkStat = function () {
    //获取当前时间,如果小于7点,跳过; 7点之前,服务器后台可能在统计数据.
    let now = new Date();
    if (now.getHours() < 7) {
        console.log("time is", now);
        return false;
    }
    if (!curStudyState) {
        console.log("curStudyState:", curStudyState);
        return false;
    }

    console.log("total study time : %d 分钟", curStudyState.studyTime / 60)

    if (curStudyState.canStudy !== "1") {
        console.log("curStudyState.canStudy:", curStudyState.canStudy)
        return false;
    }
    return true;
}

unsafeWindow.findLesson = function () {
    if (!totalLesson) {
        return undefined;
    }
    var gotLesson = null;
    var gotVideo = null;

    for (let lesson of totalLesson.lessons) {

        if (lesson.available !== "1") {
            // console.log(lesson.available)
            continue;
        }

        if (lesson.state === "已完成") {
            // console.log(lesson.state)
            continue;
        }

        for (let l of lesson.list) {
            if (l.state !== "已完成") {
                gotVideo = l;
                break;
            }
        }

        if (gotVideo) {
            gotLesson = lesson;
            break;
        }
    }
    if (!gotLesson || !gotVideo) {
        return undefined;
    }
    // console.log(gotLesson);
    // console.log(gotVideo);
    return { lesson: gotLesson, video: gotVideo };
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

unsafeWindow.gostudy = function () {
    if (!unsafeWindow.checkStat()) {
        //todo: 延迟刷新?
        return;
    }
    let obj = unsafeWindow.findLesson();
    if (!obj) {
        console.log("lesson not found");
        return;
    }


    console.log("gostudy:lesson:%s chap:%s video:%s", obj.lesson.name, obj.video.chapName, obj.video.name);
    console.log("will call `study(%d,%d,%d)`", obj.video.id, obj.lesson.id, -1);

    let delay = getRandomInt(12, 40);
    console.log("random delay: %d second", delay);

    unsafeWindow.gostudy_time_handle = setTimeout(function () {
        if (!study || typeof (study) !== 'function') {
            console.log("study func isn't exist");
            return;
        }
        console.log("begin go study!");
        study(obj.video.id, obj.lesson.id, -1);
    }, delay * 1000);
    console.log("use `clearTimeout(%d)` to clear timedown.", unsafeWindow.gostudy_time_handle);
}

console.log("on script...");

setTimeout(function () {    
    console.log("刷课脚本开始运行");
    unsafeWindow.gostudy();
}, 5 * 1000);