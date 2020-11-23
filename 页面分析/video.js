var path = "https://hz.5u5u5u5u.com:443/", _offset = '';
var con = "1";
var id = "582348895";
var courseware;//课件
var cast = 0;//视频计时对象
var validTime = 0;//验证时间
var flag = true;//是否在计时
var lastIns = 0;//上次随机验证点
var randomTime = 0;//下次随机验证点
var broadcast = true;//是否被暂停
var pageNo = null;
var startTime;
var note;
var stageId = "605975478";
var tempVideoTime = 10;//视频进度
var end = "0";
var tag = "1605845877761";
var page;
var nightClock = 0;
var _laseOM = false;
var styleType = 0, videoLoaded = false;
var df_url = "https://hz.5u5u5u5u.com:443/learning/theory/images/handout.png", adlast;
var yanres = 0;
var endcourese = "0";
var listener = new window.keypress.Listener();
var validone = false;//是否已经随机验证过一次
var validonetime = 0;

listener.simple_combo("left", function (event) {
	// 	alert(1)
	stopBubble(event);
});
listener.simple_combo("right", function (event) {
	// 	alert(1)
	stopBubble(event);
});

function stopBubble(e) {
	//如果提供了事件对象，则这是一个非IE浏览器 
	if (e && e.stopPropagation)
		//因此它支持W3C的stopPropagation()方法 
		e.stopPropagation();
	else
		//否则，我们需要使用IE的方式来取消事件冒泡 
		window.event.cancelBubble = true;
}

var cvList;
var cvCurrent;
var cvMain;//主id
//监听视频播放结束
var cv;
var videoCurState;
function playState(state) {
	videoCurState = state;
	if (state == 'complete') {
		if (cvList && cvList.length > 0) {
			if (!cvCurrent || cvCurrent == cvMain) {
				cv = cvList[0];
				cvCurrent = cvList[0].id;
			} else {
				for (var idcv = 0; idcv < cvList.length - 1; idcv++) {
					if (cvCurrent == cvList[idcv].video.id) {
						cv = cvList[idcv + 1];
						cvCurrent = cvList[idcv + 1].id;
						break;
					}
				}
			}
		}
		if (!cv) {
			cv = cvList[cvList.length - 1];
		}
		// 		if(cvList&&cvList.length>0&&cvCurrent<cvList.length){
		// 			cvCurrent++;
		// 			var cv = cvList[cvCurrent];
		var flashvars = {};
		var params = {};
		flashvars.src = cv.url.replace('src=', '');
		flashvars.showTime = cv.showTime;
		flashvars.autoPlay = "1";
		flashvars.uiMode = cv.uiMode;
		flashvars.usep2p = cv.usep2p;
		flashvars.showRightMenu = cv.showRightMenu;

		params.quality = "high";
		params.bgcolor = "#000000";
		params.play = "true";
		params.loop = "true";
		params.wmode = "opaque";
		params.scale = "showall";
		params.devicefont = "false";
		params.allowScriptAccess = "always";
		params.allowFullScreen = "false";
		params.menu = "false";
		// 			params.play = "true";
		params.movie = "https://hz.5u5u5u5u.com:443/VJTVPlayer.swf?v=1.1.18.7";
		var obid = "";
		if (document.all) {
			obid = "VJTVPlayer";
		} else {
			obid = "VJTVPlayer2";
		}
		var attributes = {
			id: obid,
			name: "VJTVPlayer"
		};
		swfobject.embedSWF("VJTVPlayer.swf", obid, 790, 400, "0.0.0", "expressInstall.swf", flashvars, params, attributes);

		//计时方式:根据有效学时时间,继续回到开始播放
		if (courseware.recordType == 2) {
			getVideoObj().resume2();
			broadcast = false;
		}
	}
}
$(function () {
	$(".kec").addClass("active");
	try {
		GiveMark.init($(".giveMark"));
	} catch (e) { }
	_offset = '100px';
	// 	if(url_temp && url_temp.length > 0 && url_temp != 'null')
	//在所有之前播放视屏广告
	// 	adlast = $("#countdown").attr("l");
	$(".liebiao").height('900');
	load();
	loadAll();
	heartBeat();
	layer.tips('签退才有学时', '.csck', { guide: 1, time: 60 });
});
var contexts = '';


function load() {
	var doc = document.getElementById("divObj");
	try {
		doc.innerHTML = "<OBJECT ID=\"face\" CLASSID=\"clsid:532C2CF3-D66E-4C6D-9A6C-9830DD2CD6F9\" codebase=\"HJFaceActive.ocx#version=1,0,0,1\" width=0 height=0 align=center hspace=0 vspace=0></OBJECT>";

		var PLUGIN = document.getElementById("face");
		PLUGIN.focus();
		//document.getElementById("btnMatch").focus();
		PLUGIN.SetServer("60.190.243.198", "37101"); //设置服务器IP和端口
		PLUGIN.SetModelServer("60.190.243.198", "37103"); //设置建模服务器IP和端口
	} catch (e) {
		doc.innerHTML = "<embed type=\"application/npHJFaceActive\" width = 0 height = 0  id=\"face\" />";
	}
}

//异步请求
function heartBeat() {
	$.ajax({
		url: "/learning_json/heartBeat.action", //url需重定义
		type: "post",
		async: false,
		type: 'post',
		success: function (json) {
			setTimeout("heartBeat()", 300000); //防止session过期
		}
	});
}

/**/
/***获取课程后视频预加载***/
function loadVideo() {
	try {
		continueFunction();
	} catch (e) {
		setTimeout("loadVideo()", 1000);
	}
}

function showMsg(message) {
	window.scrollTo(0, 0);//滚动到顶部
	$.layer({
		area: ['300px', 'auto'],
		border: [8, 1, '#b8c9f5', true],
		dialog: { msg: message, type: 8 }
	});

}

//预加载并设置计时检测任务
function continueFunction() {
	//走到这里表示视频加载完成，可以执行seek操作
	videoLoaded = true;
	//判断是否走CDN过，是则seek上次进度 暂时不去管按课件计时，不去跳转上次记录
	//现在是cdn自动跳转到上次进度
	// 	cdnSeek();
	setButton();
	setRandomTime();
	startCount();
	cleanTimeCount();
	lastIns == courseware.videoTime;
	// 	mouseKeyBind();
}

//判断是否走CDN过，是则seek上次进度
function cdnSeek() {
	//http时跳转进度
	if (courseware.videoUrl.indexOf('http') >= 0) {
		//获得视频进度
		if (courseware.videoTime && courseware.videoTime > 0) {
			//有进度则跳转
			getVideoObj().seek2(courseware.videoTime - 0);
		}
	}
}



//加载页面
function loadAll() {
	loadClass();
	//目录弹框操作
	$("#mul-btn").click(function () {
		$("#mul").show();
		$("#mul").animate({
			right: "70px"
		})
	})
	$("#mul .close_btn").click(function () {
		$("#mul").animate({
			right: "-360px"
		})
	})
}


//加载课程
function loadClass() {
	$.ajax({
		url: "/learning_json/loadClass.action?ttm=" + (new Date()).getTime(),
		type: "post",
		async: false,
		data: "id=" + id + "&stageId=" + stageId,
		type: 'post',
		success: function (json) {
			if (json != null) {
				$('.tt_a').html(json.name);
				$('#playnum').html("观看" + json.hits + "次");
				$('#playnum2').html("观看" + json.hits + "次");
				$('#kjlb').append('<li class="note_t"><div class="naobiao_icon wz fl"></div> <div class="fl notecnts">' + json.chapName + '</div> <div class="clearfix"></div></li>');
				$('#kjlb').append('<li class="note_t"><div class="notecnt">' + json.name + '</div></li>');
				$('#kjlb').append('<li class="note_t">' + (json.videoName || "") + '</li>');
				courseware = json;
				end = courseware.isTime;
				cvList = courseware.videos;
				cvCurrent = courseware.currentVideo;
				cvMain = courseware.mainVideo;
				var cvindex = 0;
				if (cvList && cvList.length > 0) {
					for (cvindex = 0; cvindex < cvList.length; cvindex++) {
						$('#kjlb').append('<li class="note_t">' + cvList[cvindex].name + '</li>');
					}
				}
				if (end == 2) {
					showMsg("今天的课程已经学完了，赶紧去做别的事情吧。");
					end = 1;
				} else if (end == 1) {
					if (courseware.passStatus && courseware.passStatus == 1 && endcourese == '0') {
						if (confirm("该阶段学时已达标，请确认是否仍然要补学" + courseware.stageName + "学时?")) {
							end = 0;
						} else {
							toLessonList();
						}
					} else {
						showMsg("该课件已完成，继续学习将不再计时！");
						$('.video-bar').css('display', 'none');
					}
				}

				if (!stageId || stageId.length == 0)
					stageId = courseware.stageId;
				//课件
				if (courseware.resType == 1) {
					$("#videoOnline").attr("style", 'display: block;');
					if (courseware.type == 2) {//只有其他素材
						$('#videoDiv').empty();
						setHandouts();
						//左右滑动条功能绑定
						eventAdd();
						if (end != 1) {
							setButton();
							videoLoaded = true;
							signIn();
							setRandomTime();
							startCount();
							cleanTimeCount();
						} else {
							endBind();
						}
					} else {//只有视屏
						$("#next3").hide();
						$("#prev3").hide();
						$('.kjbj').hide();

						//$("#VJTVPlayer").height();
						//$("#VJTVPlayer").height(10);
						if (endCheck()) {
							signIn();
							loadVideo();
						}
					}
				}
				//在线练习
				if (courseware.resType == 2) {
					courseware.recordType = 3

					if (end != 1) {
						setButton();
						videoLoaded = true;
						signIn();
						setRandomTime();
						startCount();
						cleanTimeCount();
						setNetUrl('https://hz.5u5u5u5u.com:443/learning/theory/simexerciseTime.jsp?id=' + id + '&stageId=' + stageId);
					} else {
						endBind();
						setNetUrl('https://hz.5u5u5u5u.com:443/learning/theory/simexerciseTime.jsp?id=' + id + '&stageId=' + stageId);
					}
				}
				//网络资源
				if (courseware.resType == 3) {
					courseware.recordType = 3;
					if (end != 1) {
						setButton();
						videoLoaded = true;
						signIn();
						setRandomTime();
						startCount();
						cleanTimeCount();
						setNetUrl(courseware.netUrl);
					} else {
						endBind();
						setNetUrl(courseware.netUrl);
					}
				}

			} else {//没有找到课件
				// 				videoHide();
				$.layer({
					area: ['300px', 'auto'],
					border: [8, 1, '#b8c9f5', true],
					dialog: { msg: '没有可用课件！', type: 8 }
				});
			}
		}
	});
}

function endCheck() {
	if (courseware.classRemainTime <= 0) {
		if (!courseware.passStatus) {
			end = 1;
		}
	} else if (courseware.classRemainTime > 0 && courseware.classRemainTime <= 2) {
		startTime = loadTime();
		_laseOM = true;
		endFlag = true;
		// 		signOut(0);
		return false;
	}

	if (end == 1) {
		endBind();
		return false;
	}
	return true;
}


function endBind() {
	setHandoutsPage(handoutsPage);
	$(".biji_icon").click(function () {
		// 		setDisplayState("normal");
		note = $.layer({
			type: 2,
			title: "课堂笔记",
			closeBtn: false,
			shade: [0.5, '#000', false],
			border: [8, 1, '#b7c9f4', true],
			offset: [_offset, ''],
			move: ['.juanmove', true],
			area: ['378', '399'],
			iframe: {
				src: 'https://hz.5u5u5u5u.com:443/learning/theory/notePage.jsp?id=' + courseware.id + '&lecture=' + courseware.type
			}
		});
	});

}

var curPage = 0;
//放置讲义
var handoutsPage = 0;
function setHandouts() {
	var str = "";
	if (!courseware.handouts)
		return;
	if (courseware.fodder == '2') {//pdf
		PDFObject.embed(courseware.handouts[0].url, "#videoDiv");
		$("#next3").hide();
		$("#prev3").hide();
	} else if (courseware.fodder == '4') {//wav
		var _html2 = "<embed  style='width:100%;height: 100%;' src='" + courseware.handouts[0].url + "'/>";
		$("#videoDiv").html(_html2);
		$("#next3").hide();
		$("#prev3").hide();
	} else if (courseware.fodder == '3') {
		for (var i = 0; i < courseware.handouts.length; i++) {
			str = str + "<li onclick='setPage(" + i + ")' id='li_" + i + "' class='li_unsel'><img id='pic_" + i + "' src='" + df_url + "'  alt=''/></li>";
		}
		$("#foo3").html(str);
		$("#foo3").carouFredSel({
			mousewheel: true,
			width: 680,
			height: 90,
			prev: '#prev3',
			next: '#next3',
			auto: false
		});

		$("#prev3").click(function () {
			handoutsPage--;
			setHandoutsPage(handoutsPage);
		});
		$("#next3").click(function () {
			handoutsPage++;
			setHandoutsPage(handoutsPage);
		});
		//根据素材类型显示
		setPage(curPage);
	}
}

function setHandoutsPage(handoutsPage) {
	if (!courseware.handouts)
		return;
	for (var i = 0; i < 5; i++) {
		var temp = handoutsPage * 5 + i;
		while (temp < 0) {
			temp += courseware.handouts.length;
		}
		var url = $("#pic_" + temp).attr("src");
		if (!url || url.indexOf("handout.png") > 0) {
			if (courseware.containThumbnail == 1) {
				$("#pic_" + temp).attr("src", addStr(path + courseware.handouts[temp % courseware.handouts.length].url));
			} else {
				$("#pic_" + temp).attr("src", path + courseware.handouts[temp % courseware.handouts.length].url);
			}
		}

	}
}

//放置右侧图片
function setPage(num) {
	pageNo = num;
	curPage = num;
	var _html;

	if (courseware.containThumbnail == 1) {
		_html = "<img style='width:790px;height: 400px;' src='" + addStr(path + courseware.handouts[num].url) + "'/>";
	} else {
		_html = "<img style='width:790px;height: 400px;' src='" + path + courseware.handouts[num].url + "'/>";
	}
	$("#videoDiv").html(_html);
	$(".li_sel").removeClass().addClass("li_unsel");
	$("#li_" + num).removeClass().addClass("li_sel");
}
//计时，可以根据进度条矫正 计时规则三则自增
function cleanTimeCount() {
	layer.tips('签退才有学时', '.csck', { guide: 1, time: 0.5 });
	if (flag && broadcast) {
		if (courseware.recordType == 1) {
			var temp_anchor = getVideoObj().getPlayTime2() - cast - courseware.videoTime;
			if (temp_anchor < 3 && temp_anchor >= 0) {
				cast = getVideoObj().getPlayTime2() - courseware.videoTime;
			} else if (temp_anchor > 3) {
				cast++;
			}
			cast = Math.round(cast);
			showTips("正在计时中", 1);
		} else if (courseware.recordType == 2) {
			if (videoCurState == 'buffering' || videoCurState == 'playing') {
				showTips("正在计时中", 1);
				cast++;
			} else {
				showTips("计时停止", 2);
			}
		} else {
			showTips("正在计时中", 1);
			cast++;
		}
	} else {
		showTips("计时停止", 2);
	}
	window.setTimeout(function () { cleanTimeCount(); }, 1000);
}

var isInspect = false;
var _msgalert = null;
var ds;
//显示计时时间
function startCount() {
	//只有讲义
	if (courseware.type == 2) {
		operation(cast);
		setStuTime(cast);
		if (courseware.ruleDto.autoVerify == 1)
			if (randomTime == cast && flag) {
				inspect();
			} else if (randomTime && randomTime < cast) {
				setRandomTime();
			}
		// 只验证一次
		if (courseware.ruleDto.autoVerify == 3) {
			if (randomTime == cast && flag && !validone) {
				inspect();
				validone = true;
			} else if (randomTime && randomTime < cast) {
				setRandomTime();
			}
		}
		// 必须验证一次
		if (courseware.ruleDto.autoVerify == 2) {
			if (validonetime > 73 && !validone) {
				inspect();
				validone = true;
			} else {
				validonetime++;
			}
		}
	}

	//ajen :  flag: true, courseware.type: 1 , courseware.recordType:3

	//非讲义
	//alert(flag);
	if (flag) {
		if (courseware.type != 2) {
			//按消耗时间计时
			if (courseware.recordType == 3) {
				operation(cast);
				setStuTime(cast);
				if (courseware.ruleDto.autoVerify == 1)
					if (randomTime == cast && flag && !endFlag) {
						inspect();
					} else if (randomTime && randomTime < cast) {
						setRandomTime();
					}
				if (courseware.ruleDto.autoVerify == 3) {
					if (randomTime == cast && flag && !endFlag && !validone) {
						inspect();
						validone = true;
					} else if (randomTime && randomTime < cast) {
						setRandomTime();
					}
				}
				if (courseware.ruleDto.autoVerify == 2) {
					if (validonetime > 73 && !validone) {
						inspect();
						validone = true;
					} else {
						validonetime++;
					}
				}
			} else if (courseware.recordType == 2) {
				//调用接口 获取视频进度跟 courseware.videoTime 相减得出视频学习时间 学习时间
				var timeTemp = cast;
				timeTemp = Math.floor(timeTemp);
				operation(cast);
				// 			if(timeTemp==cast)
				setStuTime(cast);//学习时间
				if (courseware.ruleDto.autoVerify == 1)
					if (timeTemp == randomTime && flag && !endFlag) {
						inspect();
					} else if (randomTime && randomTime < timeTemp) {
						setRandomTime();
					}
				if (courseware.ruleDto.autoVerify == 3) {
					if (timeTemp == randomTime && flag && !endFlag && !validone) {
						inspect();
						validone = true;
					} else if (randomTime && randomTime < timeTemp) {
						setRandomTime();
					}
				}
				if (courseware.ruleDto.autoVerify == 2) {
					if (validonetime > 73 && !validone) {
						inspect();
						validone = true;
					} else {
						validonetime++;
					}
				}
			} else if (courseware.recordType == 1) {
				setStuTime(cast);
				var timeTemp = getVideoTime() - courseware.videoTime;
				timeTemp = Math.floor(timeTemp);
				if (courseware.ruleDto.autoVerify == 1)
					if (timeTemp == randomTime && flag && !endFlag) {
						flag = false;
						inspect();
					} else if (randomTime && randomTime < timeTemp) {
						setRandomTime();
					}
				if (courseware.ruleDto.autoVerify == 3) {
					if (timeTemp == randomTime && flag && !endFlag && !validone) {
						flag = false;
						inspect();
						validone = true;
					} else if (randomTime && randomTime < timeTemp) {
						setRandomTime();
					}
				}
				if (courseware.ruleDto.autoVerify == 2) {
					if (validonetime > 73 && !validone) {
						inspect();
						validone = true;
					} else {
						validonetime++;
					}
				}
			}
		}
	}
	if (flag) {
		window.onbeforeunload = function () {
			/**关闭之前执行的操作 使用同步方式往后台传送数据**/
			// 			alert(1)
			var warning = "您正在学习中，继续此操作将不记录学时，保留学时请签退!";
			return warning;
		};
	} else {
		window.onbeforeunload = null;
	}
	if (!endFlag && studyFlag)
		nightClock++;
	ds = window.setTimeout(function () { startCount(); }, 1000);
}

var studyFlag = true;
//操作 针对按实际学习时间计时
function operation(num) {
	if (num - 5 >= courseware.remainTime) {
		if (flag) {
			if (studyFlag)
				confirmIns("你今天已经达到最大学时,是否进行验证?", 2);
			studyFlag = false;
		}
		flag = false;
	}
	if (num - 5 >= courseware.classRemainTime && endcourese == '0') {
		if (flag) {
			if (studyFlag)
				confirmIns("该课件的学时已达要求,是否进行验证?", 2);
			studyFlag = false;
		}
		flag = false;
	}
	if (nightClock >= courseware.time) {
		if (flag) {
			confirmIns("服务器整点验证", 3);
		}
		studyFlag = false;
		flag = false;
	}
}

var stageEnd = 0;
function confirmIns(mg, ty) {
	// 	videoHide();
	page = $.layer({
		closeBtn: false,
		shade: true,
		area: ['400px', '160px'],
		border: [8, 1, '#b8c9f5', true],
		offset: [_offset, ''],
		move: false,
		dialog: {
			msg: mg,
			btns: 2,
			type: 4,
			btn: ['是', '否'],
			yes: function () {
				layer.close(page);
				if (ty == 2)
					signOut(0);
				if (ty == 3)
					signOut(1);

			},
			no: function () {
				layer.close(page);
				if (ty == 3) signOut(1);
			}
		}
	});
}

//学习时间显示
function setStuTime(cast) {
	var hour = Math.floor((cast) / 60 / 60);
	var min = Math.floor((cast) % 3600 / 60);
	var sec = (cast) % 60;
	var tm = "<span style=' border:none; font-weight:normal;'>学习时间：</span><span>" + hour + "</span><span>时</span><span>" + min + "</span><span>分</span><span>" + sec + "</span><span>秒</span>";
	$("#shijian").html(tm);
}
//随机打卡
var inspectUpload = false;
//随机验证
function inspect() {
	if (!automaticUpload) {
		$(".tt_p").focus();
		inspectUpload = true;
		isInspect = true;
		suspend();
		interfaceForStu(2);   //ajen: 2:中间验证
	} else {
		setTimeout("inspect()", 500);
	}
}

//签退 num为1时 强制  //随机验证
var todayEnd;
function signOut(type) {
	//判断是否在自动上传，如果在，则延后0.5S,防止同时进行后台自动屏蔽学时
	if (!automaticUpload) {
		//失败则跳转到课件列表页面
		$(".tt_p").focus();
		isInspect = true;
		todayEnd = type;
		suspend();
		if (courseware.ruleDto.automatic == 1) {
			validate(1, 3);
		} else {
			interfaceForStu(3);   //签退记录
		}
	} else {
		setTimeout("signOut(" + type + ")", 500);
	}
}
//签到
function signIn() {
	//如果是自动学的学员则跳过验证
	//调用接口 签到失败直接跳回课件列表页面
	$(".tt_p").focus();
	isInspect = true;
	flag = false;
	broadcast = false;
	if (courseware.ruleDto.automatic == 1) {
		validate(1, 1);
	} else {
		interfaceForStu(1);//签到记录
	}

}

//按钮绑定事件
var hkPage
function setButton() {
	$(".qiantui_icon").click(function () {
		//改为根据规则里的最小时长限制来检测.
		var singlecheck = courseware.ruleDto.singlecheck;
		var singleinterval = courseware.ruleDto.singleinterval;
		if (singlecheck && singlecheck == '1' && singleinterval && cast < singleinterval * 60) {
			hkPage = $.layer({
				closeBtn: false,
				shade: true,
				area: ['400px', '160px'],
				border: [8, 1, '#b8c9f5', true],
				offset: [_offset, ''],
				move: false,
				dialog: {
					msg: '您本次学习时长少于监管要求，若签退本次学习不计学时',
					btns: 2,
					type: 4,
					btn: ['继续学习', '确认签退'],
					yes: function () {
						layer.close(hkPage);
					},
					no: function () {
						layer.close(hkPage);
						signOut(0);
					}
				}
			});
		} else {
			signOut(0);
		}

	});
	$(".biji_icon").click(function () {
		note = $.layer({
			type: 2,
			title: "课堂笔记",
			closeBtn: false,
			shade: [0.5, '#000', false],
			border: [8, 1, '#b7c9f4', true],
			offset: [_offset, '57%'],
			move: ['.juanmove', true],
			area: ['378', '399'],
			iframe: {
				src: 'https://hz.5u5u5u5u.com:443/learning/theory/notePage.jsp?id=' + courseware.id + '&lecture=' + courseware.type + '&resType=' + courseware.resType
			}
		});
	});


}
//获取视频最大进度时间   -------------------------------------------
var videoTotalTime;
function getVideoTime() {
	if (courseware.resType == 1 && courseware.type != 2) {
		if (cvList && cvList.length > 0) {
			return getCurVideoTime();
		}
		var temp = courseware.videoTime + cast;
		if (getVideoObj() && getVideoObj().getDuration()) {
			if (temp >= getVideoObj().getDuration())
				temp = getVideoObj().getDuration();
			if (endFlag)
				temp = getVideoObj().getDuration();
		}
		return temp;
	}
	else
		return 0;
}
//判断视频是否结束	-------------------------------------------
var endFlag = false;
function isEnd() {
	if (studyFlag)
		if (courseware.videoTime + cast >= getVideoObj().getDuration() - 20) {
			if (!endFlag) {
				endFlag = true;
				signOut(0);
			}
		} else {
			return 1;
		}
}
//获取有效学习时间
function getValidTime() {
	if (courseware.recordType == 1) {
		return getVideoTime() - courseware.videoTime - validTime;
	} else if (courseware.recordType == 3) {
		return cast - validTime;
	} else if (courseware.recordType == 2) {
		return cast - validTime;
	}
	return 0;
}

//设置随机时间
function setRandomTime() {
	if (randomTime - cast > courseware.randomTime)
		return;
	randomTime = randomTime + Math.floor(courseware.randomTime);//和app保持一致
	// 	randomTime=randomTime+Math.floor(courseware.randomTime/120+Math.random()*courseware.randomTime/120)*60; //随机验证时间改为
	// 	randomTime=randomTime+Math.floor(courseware.randomTime/2+Math.random()*courseware.randomTime/2);
}

//验证时暂停视频
function suspend() {
	// 	setDisplayState("normal");
	flag = false;
	suspendVideo(0);
}

//验证完继续视频
function goon() {
	inspectUpload = false;
	isInspect = false;
	flag = true;
	suspendVideo(1);
	window.focus();
}

//ajen: courseware.ruleDto.autoVerifyStyle: 3

//视频验证接口 num: 1-签到 2-中间验证 3-签退
function interfaceForStu(num) {
	//获取验证方式
	styleType = num;
	// 20200728:视频验证是通过配置来选择走的海景还是云从，故这边代码无需改造
	if (courseware.ruleDto.autoVerifyStyle == 1) { //海景
		var loadi;
		try {
			loadi = layer.load('');
			OneToOneMatchVideo(num);
			layer.close(loadi);
		} catch (e) {
			// 				alert(e);
			layer.close(loadi);
			yuncongyanerr("系统检测到您未安装人脸识别控件，请在我的课程页面下载，双击运行（如是windows7(X64)，请以管理员身份运行） 安装完成请重启浏览器！");
			// 		 	    toLessonList();
			return false;
		}
	} else if (courseware.ruleDto.autoVerifyStyle == 6) {//2017.09.26 云从人脸识别
		var loadi;
		try {
			loadi = layer.load('');
			YunCongMatchVideo(num, courseware.ruleDto.verifyTimes);
			layer.close(loadi);
		} catch (e) {
			// 				alert(e);
			layer.close(loadi);
			yuncongyanerr('系统检测到您未安装云从人脸识别控件，请在我的课程页面下载 ，双击运行（如是windows7(X64)，请以管理员身份运行） 安装完成请重启浏览器！');
			// 				 alert("系统检测到您未安装云从人脸识别控件，请在我的课程页面下载 ，双击运行（如是windows7(X64)，请以管理员身份运行） 安装完成请重启浏览器！"); 
			// 		 	     toLessonList();
			return false;
		}
	} else if (courseware.ruleDto.autoVerifyStyle == 3) { //回答问题
		window.scrollTo(0, 0);//滚动到顶部
		//ajen 计算到的结果 src : https://hz.5u5u5u5u.com:443/learning/popup/inspect_ques2.jsp?type=3&frequency=5&time=1&verifyNotPassStyle=1&timeoutStyle=1&resType=1
		page = $.layer({
			type: 2,
			title: false,
			closeBtn: false,
			shade: [0.5, '#000', true],
			border: [0, 0, '#000', true],
			offset: [_offset, ''],
			move: ['.juanmove', true],
			area: ['432px', '252px'],
			iframe: {
				src: 'https://hz.5u5u5u5u.com:443/learning/popup/inspect_ques2.jsp?type=' + num + '&frequency=' + courseware.ruleDto.verifyTimes + '&time=' + courseware.ruleDto.verifyValidTime + '&verifyNotPassStyle=' + courseware.ruleDto.verifyNotPassStyle + '&timeoutStyle=' + courseware.ruleDto.timeoutStyle + '&resType=' + courseware.resType
			}
		});
	} else if (courseware.ruleDto.autoVerifyStyle == 5) { //不用了
		yuncongyanerr('验证方式配置错误,请联系管理员');
	} else if (courseware.ruleDto.autoVerifyStyle == 4) {   //拍照
		//swf拍摄上传
		page = $.layer({
			type: 2,
			title: false,
			closeBtn: false,
			shade: [0.5, '#000', true],
			border: [0, 0, '#000', true],
			offset: [_offset, ''],
			move: ['.juanmove', true],
			area: ['627px', '439px'],
			iframe: {
				src: 'https://hz.5u5u5u5u.com:443/learning/popup/photo/inspect_photo.jsp?type=' + num + '&frequency=' + courseware.ruleDto.verifyTimes + '&time=' + courseware.ruleDto.verifyValidTime + '&verifyNotPassStyle=' + courseware.ruleDto.verifyNotPassStyle + '&timeoutStyle=' + courseware.ruleDto.timeoutStyle + '&resType=' + courseware.resType
			}
		});
	}
}




//暂停继续接口   0-暂停  1-继续
function suspendVideo(num) {
	if (num == 0) {
		if (courseware.resType == 1 && courseware.type != 2) {
			try { getVideoObj().pause2(); } catch (e) { }
		}
		broadcast = false;
	} else {
		if (flag && broadcast)
			return;
		if (courseware.resType == 1 && courseware.type != 2) {
			try { getVideoObj().resume2(); } catch (e) { }
		}
		broadcast = true;
	}
}

//最后一次活动时间点记录
function activity() {
	curState = cast;
}
var curState = 0;//最后一次活动时间点
//离开当前页面
function pageBlur() {
	if (flag && broadcast)
		suspendVideo(0);
}
//返回当前页面
function pageFocus() {
	if (!flag && !broadcast)
		suspendVideo(1);
}

function loadTime() {
	var temp;
	$.ajax({
		url: "/learning_json/loadTime.action?ttm=" + (new Date()).getTime(),
		async: false,
		type: 'post',
		success: function (json) {
			temp = json;
		}
	});
	return temp;
}


function closeDialog() {
	layer.close(note);
	showNetUrl();
}

//只有讲义的时候
//讲义全屏 增加左右按钮
// function setFullHandouts(){
// 	videoHide();
// 	if(courseware.containThumbnail == 1) {
// 		$("#handout").html("<img style='width:100%;' src='"+path+courseware.handouts[curPage].url+"'/>");
// 	}
// 	$("#handout").removeClass().addClass("fullhandout");
// 	$(".chuangkou").height(600).find("img").attr("style","width: 100%;");
// 	arrowAdd();
// }

function setSHandouts() {
	// 	videoShow();
	if (courseware.containThumbnail == 1) {
		$("#videoDiv").html("<img style='width:100%;' src='" + addStr(path + courseware.handouts[curPage].url) + "'/>");
	}
	$("#videoDiv").removeClass().addClass("handout");
	$(".chuangkou").height(290).find("img").attr("style", "width: 100%");
	$(".change-bigimg").hide();
}

//增加图片后缀
function addStr(str) {
	if (str && str.lastIndexOf('.') != -1) {
		str = str.substring(0, str.lastIndexOf('.')) + "_s" + str.substring(str.lastIndexOf('.'));
	}
	return str;
}

//左右箭头的功能添加
function arrowAdd() {
	//样式添加
	cssModify();
}

function cssModify() {
	$(".change-bigimg").show();

	$("#videoDiv").hover(
		function () {
			$(".pre-img").addClass("pre");
			$(".next-img").addClass("nex");
		},
		function () {
			$(".pre-img").removeClass("pre");
			$(".next-img").removeClass("nex");
		}
	);

	$(".change-bigimg").hover(
		function () {
			$(".pre-img").addClass("pre-hover");
			$(".next-img").addClass("next-hover");
		},
		function () {
			$(".pre-img").removeClass("pre-hover");
			$(".next-img").removeClass("next-hover");
		}
	);
}

//事件添加
function eventAdd() {

	$(".pre-img").click(function () {

		var _cls = $("#foo3 li").attr("class");
		if (_cls == "li_sel") {
			$("#prev3").click();
		}

		curPage = curPage - 1;
		if (curPage < 0) {
			curPage = courseware.handouts.length - 1;
		}
		setPage(curPage);
		//滑动到当前页
		slideCurPage();
	});


	$(".next-img").click(function () {
		var _cls = $("#foo3").children('li').eq(3).attr("class");
		if (_cls == "li_sel") {
			$("#next3").click();
		}

		curPage = curPage + 1;
		if (curPage > courseware.handouts.length - 1) {
			curPage = 0;
		}
		setPage(curPage);
		//滑动到当前页
		slideCurPage();

	});

}

function slideCurPage() {
	//计算当前页数
	var temp_page = 0;
	var i = 0;
	$("#foo3 li").each(function () {
		var css_temp = $(this).attr("class");
		if (css_temp == "li_sel") {
			temp_page = i;
		}
		i++;
	});

	if (temp_page > courseware.handouts.length / 2) {
		//向左
		var cout = Math.floor((courseware.handouts.length - temp_page) / 4) + 1;
		if (cout != 0) {
			$("#prev3").click();
			setTimeout("slideCurPage()", 100);
		}
	} else {
		//向右
		var cout = Math.floor(temp_page / 4);

		if (cout != 0) {
			$("#next3").click();
			setTimeout("slideCurPage()", 100);
		}
	}

}

var direc = 0;




function checkExist() {
	var index = $(".li_sel").parent().children().index($(".li_sel"));
	if (index < 4) {
		return true;
	}
	return false;
}


//传参给笔记页面
function noteParam() {
	var obj = new Object();
	obj.videoTime = getCurVideoTime();
	obj.lecture = pageNo;
	obj.resType = courseware.resType;
	return obj;
}

//获取当前视频进度 非最大进度
function getCurVideoTime() {
	if (courseware.resType != 1 || courseware.type == 2)
		if (courseware.recordType == 3)
			return cast;
		else
			return 0;
	return getVideoObj().getPlayTime2();
}


function closeCur() {
	layer.close(page);
	if (courseware.resType == 3) {
		if (styleType == 1) {//签到
			setNetUrl(courseware.netUrl);
		} else {
			showNetUrl();
		}
	}
	if (courseware.resType == 2) {
		if (styleType == 1) {//签到
			setNetUrl('https://hz.5u5u5u5u.com:443/learning/theory/simexerciseTime.jsp?id=' + id + '&stageId=' + stageId);
		} else {
			showNetUrl();
		}
	}
	// 	if(courseware.resType == 1 && courseware.type!=2)
	// 		videoShow();
}
//ajen: code 是验证码提交后返回的code
//验证回调方法  validateType:1-签到  2-随机 3-中间验证
function validate(result, validateType, image, code) {
	if (page) {
		layer.close(page);
	}
	var sucRedirect = false;
	if (courseware.ruleDto.validationFailed == 1 && result != 1 && validateType != 1) {
		result = 1;
		sucRedirect = true;
	}
	if (result == 0) {
		logOut();
		return;
	}

	// 	if(courseware.type!=2) {
	// 		videoShow();
	// 	}
	// 	console.log(image);
	if (!image) {
		image = "";
	} else {
		image = encodeURIComponent(image);
	}
	var videoid = "";
	if (cvList && cvList.length > 0) {
		videoid = cvCurrent;
	}
	// 	console.log(image);
	if (validateType == 1) {
		startTime = loadTime();
		$.ajax({
			url: "/learning_json/signIn.action?ttm=" + (new Date()).getTime(),
			async: false,
			data: "id=" + courseware.id + "&result=" + result + "&verifyType=" + courseware.ruleDto.autoVerifyStyle + "&photoUrl=" + image + "&tag=" + tag + "&code=" + code,
			type: "post",
			success: function (json) {
				//alert(json)
				if (result == -1) {
					faultMessage();
					return;
				}
				if (json == "error") {
					toLessonList();
				} else if (json != 'success') {
					result = -1;
					//TODO 提示然后跳转
					$.layer({
						closeBtn: false,
						shade: true,
						area: ['400px', '160px'],
						border: [8, 1, '#b8c9f5', true],
						offset: [_offset, ''],
						move: false,
						dialog: {
							msg: json,
							btns: 1,
							type: 5,
							btn: ['是'],
							yes: function () {
								toLessonList();
							}
						}
					});
				}
			}
		});
		if (result == 1) {
			yanres = 1;
			fuStart();
		}

	} else if (validateType == 3) {
		layer.closeAll();
		var valid = getValidTime();
		var newVideoTime = getVideoTime();
		if (_laseOM) {
			valid = courseware.totalViodeTime;
			newVideoTime = courseware.totalViodeTime;
		}
		// 		alert('签退')
		$.ajax({
			url: "/learning_json/signOut.action?ttm=" + (new Date()).getTime(),
			async: false,
			data: "id=" + courseware.id + "&result=" + result + "&videoTime=" + newVideoTime + "&valid=" + valid + "&type=" + todayEnd + "&lecturePage=" + pageNo + "&verifyType=" + courseware.ruleDto.autoVerifyStyle + "&stageId=" + stageId + "&photoUrl=" + image + "&stageEnd=" + stageEnd + "&tag=" + tag + "&code=" + code + "&videoid=" + videoid,
			type: "post",
			success: function (json) {
				if (result == -1) {
					faultMessage();
					return;
				}

				if (json == "success") {
					endSucAlert();
				} else if (json) {
					//入库失败
					window.scrollTo(0, 0);//滚动到顶部
					var _page = $.layer({
						closeBtn: false,
						shade: false,
						area: ['400px', '160px'],
						border: [8, 1, '#b8c9f5', true],
						offset: [_offset, ''],
						move: false,
						dialog: {
							msg: json,
							btns: 1,
							type: 5,
							btn: ['是'],
							yes: function () {
								toLessonList();
							}
						}
					});
				} else {
					toLessonList();
				}

			}
		});
	} else if (validateType == 2) { //随机验证
		var _flag = true;
		var valid = getValidTime();
		var newVideoTime = getVideoTime();

		//ajen: 20分钟后走这里.必须先验证码验证
		//同步方法 async:false,
		$.ajax({
			url: "/learning_json/inspect.action?ttm=" + (new Date()).getTime(),
			async: false,
			data: "id=" + courseware.id + "&result=" + result + "&videoTime=" + newVideoTime + "&valid=" + valid + "&lecturePage=" + pageNo + "&verifyType=" + courseware.ruleDto.autoVerifyStyle + "&stageId=" + stageId + "&photoUrl=" + image + "&stageEnd=" + stageEnd + "&tag=" + tag + "&code=" + code + "&videoid=" + videoid,
			type: "post",
			success: function (json) {
				if (sucRedirect) {
					endSucAlert();
					return;
				}
				if (result == -1) {
					faultMessage();
					return;
				}
				if (json && json != "success") {
					_flag = false;
					var _page = $.layer({
						closeBtn: false,
						// 					    shade : true,
						shade: [0.5, '#000', true],
						area: ['400px', '160px'],
						border: [8, 1, '#b8c9f5', true],
						offset: [_offset, ''],
						move: false,
						dialog: {
							msg: json,
							btns: 1,
							type: 5,
							btn: ['是'],
							yes: function () {
								toLessonList();
							}
						}
					});
				}
			}
		});
		if (result == 1 && !sucRedirect && _flag) {//验证结果返回成功
			curState = cast;
			validTime = validTime + valid;//随机验证已经有效的学习时间
			setRandomTime();
			goon();
		}

	}
	// 	if(result==-1){
	// 		videoHide();
	// 	}
}

function endSucAlert() {
	var endTime = loadTime();
	//获取学时 在计时方式1情况下 先判断视频是否播放完 否则都按照有效学习时间给
	var period;
	if (courseware.recordType == 1) {
		if (endFlag) {
			period = courseware.period;
		} else {
			period = 0;
		}
	} else {
		period = cast;
		var singlecheck = courseware.ruleDto.singlecheck;
		var singleinterval = courseware.ruleDto.singleinterval;
		if (singlecheck && singlecheck == '1' && singleinterval && cast < singleinterval * 60) {
			period = 0;
		}
	}
	endFlag = true;
	// videoHide();
	window.scrollTo(0, 0);//滚动到顶部
	$.layer({
		type: 2,
		title: false,
		closeBtn: false,
		shade: [0.5, '#000', true],
		border: [0, 0, '#000', true],
		offset: ['100px', ''],
		move: ['.juanmove', true],
		area: ['432px', '232px'],
		iframe: {
			src: 'https://hz.5u5u5u5u.com:443/learning/popup/signoutSuccess.jsp?startTime=' + startTime + '&endTime=' + endTime + '&castTime=' + cast + '&period=' + period + '&countType=' + courseware.recordType
		}
	});
	todayEnd = 0;
}
//签退之后继续学习
function conStu() {
	closeCur();
	$(".qiantui_icon").hide();
}
function toLessonList() {
	window.onbeforeunload = null;
	window.location.href = path + 'toLessonList.action?navigation=1&ttm=' + (new Date()).getTime();
}


function getVideoObj() {
	var ff = null;
	if (document.all) {
		ff = document.VJTVPlayer;
	} else {
		ff = document.getElementById("VJTVPlayer2");
	}
	return ff;
}

var playCurState;//状态 -1 0 1 结束 暂停 播放
var lastIns;//上次验证点

function playCheckControl() {
	if (courseware.resType != 1 || courseware.recordType != 1)
		return;
	if (typeof getVideoObj().getPlayTime2 === "function") {
		var temp = getVideoObj().getPlayTime2();
		var total = getVideoObj().getDuration();
		if (temp >= total - 1 && total != 0) {
			if (courseware.recordType == 1) {
				isEnd();
				flag = false;
			}
			lastIns = 0;
		} else if (lastIns == temp && temp != 0) {
			//视频暂停了
			if (playCurState != 0) {

				playCurState = 0;
				flag = false;

				isSuspend = true;
				suspendCast();

			}
		} else if (lastIns < temp && temp != 0) {
			lastIns = temp;
			if (playCurState != 1) {
				playCurState = 1;
				if (!endFlag) {
					flag = true;
					broadcast = true;
				}
				isSuspend = false;
				if (courseware.ruleDto.stopVerify == 1) {
					if (courseware.ruleDto.stopVerifyTime * 60 <= suspendCastTime) {
						suspendCastTime = 0;
						inspect();
					}
				}
				suspendCastTime = 0;
			}
		}
	}
	setTimeout("playCheckControl()", 1000);
}


var suspendCastTime = 0;
var isSuspend = false;//暂停计时 阀门
//暂停后的计时
function suspendCast() {
	suspendCastTime++;
	if (isSuspend)
		setTimeout("suspendCast()", 1000);
}

//签到完成  准备播放计时
function fuStart() {
	if (videoLoaded) {
		isInspect = false;
		// 		if(courseware.type!=2) {
		// 			videoShow();
		// 		}
		if (courseware.type != 1)
			setHandoutsPage(0);
		if (courseware.recordType == 3 || courseware.recordType == 2)
			flag = true;
		// 	flag=true;
		broadcast = false;
		playCheckControl();
		suspendVideo(1);
		//开始学习如果是免签到签退则开始像后台传数据
		if (courseware.ruleDto.automatic == 1) {
			uploadPeriod();
		}
	} else {
		setTimeout("fuStart()", 2000);
	}
}
var automaticUpload = false;
//定时上传当前时间
function uploadPeriod() {
	var valid = getValidTime();
	var newVideoTime = getVideoTime();
	if (valid >= 60 && !inspectUpload) { //心跳过程中保证与验证和签退互斥，不然会被后台作废
		automaticUpload = true;
		doUpload(Math.floor(valid), newVideoTime);
	}
	setTimeout("uploadPeriod()", 1000 * 60);//一分钟上传一次
}
//上传
function doUpload(valid, newVideoTime) {
	var result = 1;
	$.ajax({
		url: "/learning_json/inspect.action?ttm=" + (new Date()).getTime(),
		async: true,
		data: "id=" + courseware.id + "&result=" + result + "&videoTime=" + newVideoTime + "&valid=" + valid + "&lecturePage=" + pageNo + "&verifyType=" + courseware.ruleDto.autoVerifyStyle + "&stageId=" + stageId + "&photoUrl=&stageEnd=" + stageEnd + "&tag=" + tag,
		type: "post",
		success: function (json) {
			//不管是否成功，只负责上传。。。
			validTime = validTime + valid;//之前的有效时间
			automaticUpload = false;
		}
	});

}
var yunpage;

//云从的人脸插件 弹窗
function YunCongMatchVideo(num, verifyTimes) {
	var yunoffset;
	// 	var bDet=BrowserDetect.browser;
	window.scrollTo(0, 0);//滚动到顶部
	// 	if("Explorer"==bDet)
	// // // 	{
	// // 		yunoffset='-200px';
	// 	}else{
	yunoffset = '30px';
	// 	}
	yunpage = $.layer({
		type: 2,
		title: "人脸识别",
		closeBtn: false,
		shade: [0.5, '#000', false],
		border: [8, 1, '#b7c9f4', true],
		offset: [yunoffset, ''],
		move: ['.juanmove', true],
		area: ['737', '530'],
		iframe: {
			src: 'https://hz.5u5u5u5u.com:443/learning/yuncong/html/livedetect.jsp?num=' + num + '&bus=' + verifyTimes + '&ttm=' + (new Date()).getTime()
		}
	});
}
//人脸验证失败，显示错误信息后跳转课程列表页
function yuncongyanerr(msg) {
	layer.close(yunpage);
	alert(msg);
	toLessonList();
}
//人脸验证成功，签到
function yuncongyansuc(num, img) {
	layer.close(yunpage);
	if (courseware.resType != 1) {
		if (num == 1) {//签到
			if (courseware.resType == 2) {
				setNetUrl('https://hz.5u5u5u5u.com:443/learning/theory/simexerciseTime.jsp?id=' + id + '&stageId=' + stageId);
			} else {
				setNetUrl(courseware.netUrl);
			}
		} else {
			showNetUrl();
		}
	}
	validate(1, num, img);
	$("#VJTVPlayer").show();
	//     layer.alert("签到成功");
}


//人脸验证接口----------------------
var i = 1;
function OneToOneMatchVideo(num) {
	try {
		var PLUGIN = PLUGIN = document.getElementById("face");
		try {
			PLUGIN.focus();
			//document.getElementById("btnMatch").focus();
			PLUGIN.SetServer("60.190.243.198", "37101"); //设置服务器IP和端口
			PLUGIN.SetModelServer("60.190.243.198", "37103"); //设置建模服务器IP和端口
		} catch (e) {
			alert("系统检测到您未安装人脸识别控件，请在我的课程页面下载，双击运行（如是windows7(X64)，请以管理员身份运行） 安装完成请重启浏览器！");
			toLessonList();
			return;
		}
		//参数设置
		PLUGIN.FaceParasLevel = 0;
		PLUGIN.MatchTime = courseware.ruleDto.verifyValidTime * 60;
		PLUGIN.CaptureTime = $.getTime();
		if (courseware.ruleDto.minThreshold) {
			PLUGIN.MinThreshold = courseware.ruleDto.minThreshold;
		} else {
			if (courseware.ruleDto.autoVerifyStyle == 1) {
				PLUGIN.MinThreshold = "50";

			} else if (courseware.ruleDto.autoVerifyStyle == 4) {
				PLUGIN.MinThreshold = "0";
			}
		}

		PLUGIN.EnableLiveness = 0;
		PLUGIN.LivenessThreshold = 50; //活体检测阈值
		PLUGIN.PersonID = "362204199110161739";
		var str = PLUGIN.OpenVideoOne2One();
		var img = PLUGIN.VerifyImage;
		switch (str) {
			case "20001":
				alert("请先安装摄像头！");
				validate(0, num, img);
				return;
			case "20006":
				alert("摄像头当前正在其他地方使用！");
				validate(0, num, img);
				return;
			case "20010":
				validate(0, num, img);
				return;
			default:
				break;
		}

		if (courseware.resType != 1) {
			if (num == 1) {//签到
				if (courseware.resType == 2) {
					setNetUrl('https://hz.5u5u5u5u.com:443/learning/theory/simexerciseTime.jsp?id=' + id + '&stageId=' + stageId);
				} else {
					setNetUrl(courseware.netUrl);
				}
			} else {
				showNetUrl();
			}
		}
		var xmlDoc = $.parseXML(str);
		var resultStr = $(xmlDoc).find("Result").text();
		if ((courseware.ruleDto.autoVerifyStyle == 4 && parseInt(resultStr) == 0) || parseInt(resultStr) != 0) {
			i = 1;
			validate(1, num, img);
			$("#VJTVPlayer").show();
		} else {
			if (i >= courseware.ruleDto.verifyTimes) {
				validate(-1, num, img);
				return false;
			}
			i++;
			//             if(confirm("本次验证失败，是否再次验证？只有通过验证才可进行学习计时！")){
			OneToOneMatchVideo(num);
			//             }else{
			//             	validate(0,num,img);
			//             }
		}
	} catch (e) {
		if (i >= courseware.ruleDto.verifyTimes) {
			validate(-1, num, img);
			return false;
		}
		i++;
		//         if(confirm("本次验证失败，是否再次验证？只有通过验证才可进行学习计时！")){
		OneToOneMatchVideo(num);
		//         }else{
		//         	validate(0,num,img);
		//         }
	}
}


// function videoHide(){
// 	$(".tt_p").focus();
// 	$("#videoDiv").removeClass().addClass("videoHide").attr("style","visibility: hidden");
// }
// function videoShow(){
// 	if($(".lecSmaScr").length>0){
// 		$("#fullScreen").click();
// 	}
// 	$("#videoDiv").removeClass().addClass("videoShow").attr("style","visibility: visible");
// }
//验证失败
function faultMessage() {
	suspendVideo(0);
	// 	videoHide();
	layer.closeAll();
	$.layer({
		area: ['420px', 'auto'],
		shade: [0.5, '#000', true],
		border: [8, 1, '#b8c9f5', true],
		offset: [_offset, ''],
		dialog: {
			msg: "验证失败或验证超时！", type: 8, btns: 1,
			btn: ['确定'],
			yes: function (index) { logOut(); }
		},
		close: function (index) {
			logOut();
		}
	});
}

function logOut() {
	toLessonList();
}

//视频插件 最大化js回调方法
function setDisplayState(state) {
	if (state == "fullScreen") {
		FullScreen(getVideoObj());
	} else if (state == "normal") {
		FullScreen(getVideoObj());
	}
}
function FullScreen(el) {
	var isFullscreen = document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen;
	if (!isFullscreen) {//进入全屏,多重短路表达式
		(el.requestFullscreen && el.requestFullscreen()) ||
			(el.mozRequestFullScreen && el.mozRequestFullScreen()) ||
			(el.webkitRequestFullscreen && el.webkitRequestFullscreen()) ||
			(el.msRequestFullscreen && el.msRequestFullscreen());
	} else {	//退出全屏,三目运算符
		document.exitFullscreen ? document.exitFullscreen() :
			document.mozCancelFullScreen ? document.mozCancelFullScreen() :
				document.webkitExitFullscreen ? document.webkitExitFullscreen() : '';
	}
}


function setNetUrl(netUrl) {
	var html = "<iframe src='" + netUrl + "' width='820' height='820' scrolling='no' frameborder='0' framespacing='0'></iframe>";
	$("#netUrlOnline").html(html);
	showNetUrl();
}

function showNetUrl() {
	if (courseware.resType != 1) {
		$("#netUrlOnline").removeClass().addClass("netUrlShow").attr("style", "visibility: visible;overflow-y:auto;overflow-x:hidden;height:820px;");
	}
}


var ctstatus = 0;// 0进入 1计时 2暂停
function showTips(msg, status) {
	if (ctstatus == status) {
		return;
	} else {
		ctstatus = status;
	}
	layer.tips(msg, $("#shijian"), { guide: 1, time: 2 });
}


function setTab(name, cursel, n) {
	for (i = 1; i <= n; i++) {
		var menu = document.getElementById(name + i);
		var con = document.getElementById("con_" + name + "_" + i);
		menu.className = i == cursel ? "hover" : "";
		con.style.display = i == cursel ? "block" : "none";
	}
}


var pageNo = 0;
var page;
//笔记  评价  窗口最小化暂停视频播放
$(function () {
	$('.xubox_close').css('display', 'none');
	//最小化窗口暂停视频播放
	$(document).on('hide', function () {
		try { getVideoObj().pause2(); } catch (e) { };
		broadcast = false;
		flag = false;
		if (ds) {
			clearTimeout(ds);
		}
		if (yanres == 1) {
			layer.alert('您已离开当前页面,计时停止.', 8, function (index) {
				try { getVideoObj().resume2(); } catch (e) { };
				ds = null;
				startCount();
				broadcast = true; flag = true;
				layer.close(index);
			});
			$('.xubox_close').css('display', 'none');
		}
	});
});

//提交评价
function subonestar() {
	var courseid = GetQueryString("id");
	$.ajax({
		url: "/submitAppraise.action?ttm=" + (new Date()).getTime(),
		data: {
			"appraiseDto.courseid": courseid,
			"appraiseDto.type": "1",
			"appraiseDto.starMap[1381001]": $('#jxpj1381001').find(".active").length,
			"appraiseDto.starMap[1381002]": $('#jxpj1381002').find(".active").length,
			"appraiseDto.starMap[1381003]": $('#jxpj1381003').find(".active").length,
			"appraiseDto.starMap[1381004]": $('#jxpj1381004').find(".active").length,
			"appraiseDto.starMap[1381005]": $('#jxpj1381005').find(".active").length,
			"appraiseDto.starMap[1381006]": $('#jxpj1381006').find(".active").length,
			"appraiseDto.starMap[1381007]": $('#jxpj1381007').find(".active").length
		},
		type: "post",
		success: function (data) {
			if (data == 'success') {
				$('#tjpj').css("display", "none");
			} else if (data == 'exists') {
				showMsg("您已评价过，请勿重复评价");
			} else {
				showMsg("评价失败，请稍后再试");
			}
		}
	});
}

function GetQueryString(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
	var r = window.location.search.substr(1).match(reg);
	if (r != null) return unescape(r[2]); return null;
}


function goquick(t) {
	if (t == -1) {
		var playedtime = getVideoObj().getPlayTime2();
		if (playedtime < 15) {
			playedtime = 0;
		} else {
			playedtime = playedtime - 15;
		}
		try {
			getVideoObj().seek2(playedtime);
		} catch (e) { }
	} else if (t == 1) {
		layer.tips('首次学完前不支持该操作', '.video-bar_forward');
	}
}