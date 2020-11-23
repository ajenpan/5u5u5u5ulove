// ==UserScript==
// @name         5u_video_auto_sign
// @namespace    https://github.com/AJenpan/5u5u5u5ulove
// @version      0.1
// @description  browse online class automatically
// @author       zjd0112,ajen
// @match        hz.5u5u5u5u.com/studyOnLine*
// @grant        none
// ==/UserScript==
'use strict';

//必须填写
const userName = '';
const passWord = '';
const softId = '';

const url_chaojiying = 'https://upload.chaojiying.net/Upload/Processing.php';
const codeType = '9104';

const NotificationInstance = Notification || window.Notification;

// 获取显示桌面通知的权限
function getPermission() {
    if (!!NotificationInstance) {
        const permissionNow = NotificationInstance.permission;
        if (permissionNow === 'granted') {//允许通知
            console.log('通知权限已获取');
        } else if (permissionNow === 'denied') {
            console.log('通知权限已拒绝');
        } else {
            NotificationInstance.requestPermission(function (PERMISSION) {
                if (PERMISSION === 'granted') {
                    console.log('通知权限已获取');
                } else {
                    console.log('通知权限已拒绝');
                }
            });
        }
    }
}

function ChromeNotify(msg) {
    const noti = new NotificationInstance('5u网站消息通知', {
        body: msg,
    });
    noti.onshow = function () {
        // console.log('通知显示了！');
    }
    noti.onclick = function (e) {
        //可以直接通过实例的方式获取data内自定义的数据
        //也可以通过访问回调参数e来获取data的数据

        // window.open(noti.data.url, '_blank');
        noti.close();
    }

    noti.onerror = function (err) {
        console.log('ChromeNotify onerror:', err);
        //throw err;        
    }

    setTimeout(() => {
        noti.close();
    }, 10000);
}

function EmailNotify(msg) {
    //TODO:??
}

// 创建通知
function CreatNotification(msg) {
    console.log(msg);
    ChromeNotify(msg);
}

// 图片转换为Base64
function convertImgToBase64(url_img, callback, outputFormat) {
    var canvas = document.createElement('CANVAS');
    var ctx = canvas.getContext('2d');
    var img = new Image;

    img.crossOrigin = 'Anonymous';
    img.onload = function () {
        canvas.height = img.height;
        canvas.width = img.width;
        ctx.drawImage(img, 0, 0);
        var dataURL = canvas.toDataURL(outputFormat || 'image/png');
        callback.call(this, dataURL);
        canvas = null;
    }
    img.src = url_img;
}

// 获取验证码图片并上传,得到图片识别结果
function checkIdentifyCode() {
    var frames = $(document).find('iframe');

    if (frames.length == 0) {
        return;
    }

    console.log("checkIdentifyCode, iframe %d", frames.length);

    var theFrame = frames[0];

    var obj = theFrame.contentDocument.getElementById('validateImg');
    if (!obj) {
        let fhkj = theFrame.contentDocument.querySelector("body > div > div > div.cont > div:nth-child(4) > div");
        if (fhkj) {
            fhkj.click();
            return;
        } else {
            console.log("fhkjlb_btn fl is not found ");
        }
        console.log("validateImg fl is not found ");
        return;
    }

    console.log('验证码出现了');

    convertImgToBase64(obj.src, function (base64Img) {
        //转化后的base64        
        base64Img = base64Img.replace('data:image/png;base64,', '');
        if (base64Img.length < 100) {
            console.log(base64Img);
            console.log("base64Img.length less 100");
            CreatNotification("图片可能不合法,提醒用户自行打码");
            return;
        }

        if (!userName || !passWord || !softId) {
            CreatNotification("打码平台参数没有填写,提醒用户自行打码");
            return;
        }

        console.log('请求识别验证码 at', Date());
        // 上传
        $.post(url_chaojiying, { 'user': userName, 'pass': passWord, 'softid': softId, 'codetype': codeType, 'len_min': '0', 'file_base64': base64Img }, function (result, status) {
            console.log("recv callback at", Date());
            if (result.hasOwnProperty("err_no") && result.err_no == 0) {
                simulateClick(result);
            } else {
                console.log(result);
                CreatNotification(result);
            }
        }, "json");
    });
}

var CPos = {};
(function ($) {
    $.$getAbsPos = function (p) {
        var _x = 0;
        var _y = 0;
        while (p.offsetParent) {
            _x += p.offsetLeft;
            _y += p.offsetTop;
            p = p.offsetParent;
        }

        _x += p.offsetLeft;
        _y += p.offsetTop;

        return { x: _x, y: _y };
    };

    $.$getMousePos = function (clientX, clientY) {
        var _x, _y;

        if (clientX || clientY) {
            _x = clientX - document.body.scrollLeft + document.body.offsetLeft;
            _y = clientY - document.body.scrollTop + document.body.clientTop;
        }
        return { x: _x, y: _y };
    }
})(CPos);

// 根据图片识别结果,执行自动点击操作
function simulateClick(result) {
    var frames = $(document).find('iframe');
    if (frames.length === 0) {
        CreatNotification("frames.length === 0");
        return;
    }

    console.log("simulateClick, iframe %d", frames.length);

    var theFrame = frames[0];

    var obj = theFrame.contentDocument.getElementById('validateImg');
    if (!obj) {
        CreatNotification("can't find validateImg");
        return;
    }

    console.log('begin simulateClick');
    console.log(result.pic_str);

    var pic_str = result.pic_str;
    var pic_array = pic_str.split("|");

    // 创建event,模拟鼠标点击
    var ev = document.createEvent('HTMLEvents');
    for (var count = 0; count < pic_array.length; count++) {
        var position_array = pic_array[count].split(",");
        var clientX = parseInt(position_array[0]);
        var clientY = parseInt(position_array[1]);
        var clickPos = CPos.$getMousePos(clientX, clientY);
        var absPos = CPos.$getAbsPos(obj);

        ev.clientX = clickPos.x + absPos.x;
        ev.clientY = clickPos.y + absPos.y;

        console.log('begine loop: %d, x:%d,y:%d', count, ev.clientX, ev.clientY);

        ev.initEvent('click', false, true);
        obj.dispatchEvent(ev);
    }

    var btn = theFrame.contentDocument.querySelector("body > div > div > div.cont.\\35 u > div:nth-child(3) > div.queding_btn.fl.\\35 u");
    // 点击确定按钮
    if (!btn) {
        console.log("button is null");
    } else {
        btn.click();
        console.log("button is click");
    }
}

// 模拟按键,防止弹出"长时间未操作"
jQuery.fn.simulateKeyPress = function (character) {
    // 内部调用jQuery.event.trigger
    // 参数有 (Event, data, elem). 最后一个参数是非常重要的的！
    jQuery(this).trigger({ type: 'keypress', which: character.charCodeAt(0) });
};

//模拟键盘+鼠标
function simulateKey() {
    // 模拟按键了 x
    $('body').simulateKeyPress('x');
    $("body").mousedown();
    $("body").mouseup();
    $("body").mousedown();
    $("body").mouseup();
    $("body").mousemove();

    //console.log('simulateKeyPress');

    if ($("span.xubox_botton").length > 0) {
        $("a.xubox_yes.xubox_botton2").click();
    }
}

var timer_checkICode;
var timer_pressKey;

console.log("on script...");

window.onload = function () {

    console.log("视频总时间: %d 分钟", courseware.totalViodeTime / 60);
    console.log("课件剩余时间: %d 分钟", courseware.classRemainTime / 60);
    console.log("用户今天剩余时间: %d 分钟", courseware.remainTime / 60);

    //关闭hide事件
    $(document).off('hide');

    // 获取弹出桌面通知权限
    getPermission();
    // 检查是否有验证码弹出
    timer_checkICode = setInterval(checkIdentifyCode, 15000);
    // 周期模拟按键,防止因长时间未操作,终止计时
    timer_pressKey = setInterval(simulateKey, 60000);
}

//todo: 打开 flash 进度条
// var list_a = document.getElementsByName("flashvars");
// for(var i=0; i<list_a.length; i++) {
//     //console.log(list_a[i].value);
//     list_a[i].value = list_a[i].value.replace("uiMode=3", "uiMode=1");
//     //console.log(list_a[i].value);
// }