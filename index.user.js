// ==UserScript==
// @name         鳄梨抢票
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://kyfw.12306.cn/otn/leftTicket/init
// @grant        none
// ==/UserScript==

/*标记变量*/
var ctrlKey = false;
var altkey = false;
var BKey = false;
var EKey = false;
var showing = false;
var loopID;
var processID;
/*DOM对象*/
var body;
var popArea;
var box;
var popdiv;
/*使用变量（信息）*/
var stationsObject;
var infoUrl = "https://raw.githubusercontent.com/BoboHezi/Util/master/stations.json";
var cssUrl  = "https://raw.githubusercontent.com/BoboHezi/Util/master/style.css";
var domUrl  = "https://raw.githubusercontent.com/BoboHezi/Util/master/dom.html";
var pluginUrl = "https://raw.githubusercontent.com/BoboHezi/Util/master/ChinesePY.js";
var cssString;
var domString;
window.onload = function() {
    console.log("eli...");
    body = document.body;

    ajaxRequest(infoUrl);
    ajaxRequest(cssUrl);
    ajaxRequest(domUrl);
};

function begin() {
    console.log("begin...");
    showing = true;
    var size = getWindowSize();
    loadHtml(domString);
    loadCss(cssString);
    loadCookies();
    //popArea.style.height =  size[1] + "px";

    document.getElementById("close-btn").onclick = function() {
        end();
    };

    document.getElementById("start").onclick = function() {
        startROB();
        window.clearInterval(loopID);
        window.clearTimeout(processID);
    };
}

function end() {
    console.log("end...");
    showing = false;
    unLoadHtml();
    window.clearInterval(loopID);
    window.clearTimeout(processID);
}

function fightingForTickets() {
    if(!showing) {
        return;
    }
    document.getElementById("query_ticket").click();
    var markDOM = document.getElementById("sear-result");

    loopID = setInterval(function() {
        if(markDOM.getAttribute("style").indexOf("block") > 0) {
            window.clearInterval(loopID);
            processID = setTimeout(function() {
                fightingForTickets();
            }, 2000);
        }
    }, 100);
}

function startROB() {
    setTimeout(function() {
        setParameter();
        fightingForTickets();
    }, 1000);
    box.style.animation    = "box-moveSide 1s ease-out forwards";
    popdiv.style.animation = "box-alpha 1s ease-out forwards";
}

function setParameter() {
    var fromStaName = document.getElementById("input-from").value;
    var toStaName   = document.getElementById("input-to").value;
    var time        = document.getElementById("input-time").value;
    var fromCode = transformSta(true, fromStaName);
    var toCode = transformSta(true, toStaName);

    if(fromStaName != null && fromStaName != "" && fromCode != null && fromCode != "") {
        $("#fromStationText").val(fromStaName);
        setStation(true, fromCode);
        setCookie("from", fromCode, 30);
    }

    if(toStaName != null && toStaName != "" && toCode != null && toCode != "") {
        $("#toStationText").val(toStaName);
        setStation(false, toCode);
        setCookie("to", toCode, 30);
    }

    if(time != null && time != "") {
        var timeChoices = document.querySelectorAll("#date_range > ul > li");
        for(var index in timeChoices) {
            try {
                var span = timeChoices[index].childNodes[0];
                if(span.innerHTML == time) {
                    timeChoices[index].click();
                    setCookie("time", time, 30);
                    break;
                }
            } catch(e) {
                console.log(e.message);
                break;
            }
        }
    }
}

function setStation(type, staCode) {
    if(staCode === null || staCode === "") {
        return;
    }
    if(type) {
        document.getElementById("fromStation").setAttribute("value", staCode);
    } else {
        document.getElementById("toStation").setAttribute("value", staCode);
    }
}

function ajaxRequest(url) {
    var xmlHttp;
    if (window.XMLHttpRequest) {
        xmlHttp = new XMLHttpRequest();
    } else {
        xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            switch (url) {
                case infoUrl:
                    stationsObject = eval("(" + xmlHttp.responseText + ")");
                    break;

                case cssUrl:
                    cssString = xmlHttp.responseText;
                    break;

                case domUrl:
                    domString = xmlHttp.responseText;
                    break;

                case pluginUrl:
                    var plugin = document.createElement("script");
                    plugin.setAttribute("type", "text/javascript");
                    plugin.innerHTML = xmlHttp.responseText;
                    document.body.appendChild(plugin);
                    break;

                default:
                    break;
            }
        }
    };

    xmlHttp.open("GET", url, true);
    xmlHttp.send();
}

function getWindowSize() {
    var windowWidth;
    var windowHeight;

    if (window.innerWidth) {
        windowWidth = window.innerWidth;
    } else if ((document.body) && (document.body.clientWidth)) {
        windowWidth = document.body.clientWidth;
    }

    if (window.innerHeight) {
        windowHeight = window.innerHeight;
    } else if ((document.body) && (document.body.clientHeight)) {
        windowHeight = document.body.clientHeight;
    }

    if (document.documentElement && document.documentElement.clientHeight && document.documentElement.clientWidth) {
        windowWidth = document.documentElement.clientWidth;
        windowHeight = document.documentElement.clientHeight;
    }

    var arr = new Array();
    arr[0] = windowWidth;
    arr[1] = windowHeight;

    return arr;
}

document.onkeydown = function(event) {
    keyEvent(event, true);
};

document.onkeyup = function(event) {
    keyEvent(event, false);
};

function keyEvent(event, type) {
    var isDown = type;
    switch(event.which) {
        case 17:
            ctrlKey = type;
            break;
        case 18:
            altkey = type;
            break;
        case 66:
            BKey = type;
            break;
        case 69:
            EKey = type;
            break;

        default: break;
    }
    //console.log(event.which);
    if (!showing && ctrlKey && altkey && BKey) {
        begin();
    } else if (showing && ctrlKey && altkey && EKey) {
        end();
    }
}

function loadHtml(html) {
    var eliDom = document.createElement("div");
    eliDom.setAttribute("id", "pop");
    eliDom.innerHTML = html;
    body.appendChild(eliDom);
    popArea = document.getElementById("popdiv");
    box     = document.getElementById("box");
    popdiv  = document.getElementById("popdiv");
}

function unLoadHtml() {
    var eliDom = document.getElementById("pop");
    body.removeChild(eliDom);
}

function loadCss(css) {
    var style = document.createElement("style");
    style.innerHTML = css;
    body.appendChild(style);
}

function setCookie(key, value, expiredays) {
    var date = new Date();
    date.setDate(date.getDate() + expiredays);
    document.cookie = key + "=" + escape(value) + ((expiredays == null) ? "" : "; expires=" + date.toGMTString());
}

function getCookie(key) {
    if(document.cookie.length <= 0)
        return "";
    var index = document.cookie.indexOf(key + "=");
    var end;
    if(index != -1) {
        index = index + key.length +1;
        end = document.cookie.indexOf(";", index);
        if(end == -1)
            end = document.cookie.length;
        return unescape(document.cookie.substring(index,end));
    }
    return "";
}

function loadCookies() {
    var fromName = transformSta(false, getCookie("from"));
    var toName = transformSta(false, getCookie("to"));
    var time = getCookie("time");

    if(fromName != null && fromName != "") {
        $("#input-from").val(fromName);
    }
    if(toName != null && toName != "") {
        $("#input-to").val(toName);
    }
    if(time != null && time != "") {
        $("#input-time").val(time);
    }
}

function transformSta(isName, key) {
    if(stationsObject == null)
        return;
    for(var index in stationsObject) {
        if(isName) {
            if(stationsObject[index].name == key)
                return stationsObject[index].code;
        } else {
            if(stationsObject[index].code == key)
                return stationsObject[index].name;
        }
    }
    return null;
}