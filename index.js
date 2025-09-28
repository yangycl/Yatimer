"use strict";
window.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');
    //讀取資料
    const savedData = localStorage.getItem("timerData");
    if (savedData) {
        roomobj = JSON.parse(savedData);
        roomobj[currentRoomName].forEach(t => {
            $("ul").append(`<li>${t.dnfboo ? "DNF" : (t.min.toString().padStart(2, '0') + ':' + t.s.toString().padStart(2, '0') + (t.plus2boo ? " +2" : ""))}</li>`);
        });
    }
});
// timer ts
const divTimer = $('#timer');
let timerInterval;
let isRunning = false;
let startTime = 0;
let elapsedTime = 0;
class time {
    dnfboo = false;
    plus2boo = false;
    min;
    s;
    alls;
    constructor(min, s) {
        this.min = min;
        this.s = s;
        this.alls = this.min * 60 + this.s;
    }
    //處理+2
    plus2() {
        this.s += 2;
        this.plus2boo = true;
        if (this.s >= 60) {
            this.s -= 60;
            this.min += 1;
            this.alls += 2;
        }
    }
    //處理DNF
    dnf() {
        this.min = -1;
        this.s = -1;
        this.dnfboo = true;
        this.alls = -1;
    }
}
//紀錄成績
var roomobj = {
    "3*3*3": []
};
let currentRoomName = "3*3*3";
function updateTimer() {
    const now = Date.now();
    const diff = now - startTime + elapsedTime;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    const milliseconds = Math.floor((diff % 1000) / 10);
    divTimer.text(`${minutes.toString().padStart(2, '0')}:` +
        `${seconds.toString().padStart(2, '0')}.` +
        `${milliseconds.toString().padStart(2, '0')}`);
}
// 空白鍵事件
$(document).on('keyup', (e) => {
    if (e.code === 'Space') {
        e.preventDefault(); // 防止捲動
        if (isRunning) {
            // 停止計時
            isRunning = false;
            clearInterval(timerInterval);
            elapsedTime += Date.now() - startTime;
            $("ul").append(`<li>${$("#timer").text()}</li>`);
            let t = $("#timer").text().split(':');
            let m = parseInt(t[0]);
            let s = parseFloat(t[1]);
            roomobj[currentRoomName].push(new time(m, s));
            console.log(roomobj);
            localStorage.setItem("timerData", JSON.stringify(roomobj));
            console.log(localStorage.getItem("timerData"));
            // 重設計時器
            elapsedTime = 0;
            divTimer.text('00:00.00');
        }
        else {
            // 開始計時
            isRunning = true;
            startTime = Date.now();
            timerInterval = window.setInterval(updateTimer, 30);
        }
    }
});
//打亂公式
function shuffleArray() {
    let face = ["U", "F", "R", "B", "L", "D"];
    let turn = ["'", "2", ""];
    let scramble = [];
    let lastMove = ""; // 移到外面
    for (let i = 0; i < 15; i++) {
        let filteredFaces = face.filter(f => f !== lastMove);
        let facestring = filteredFaces[Math.floor(Math.random() * filteredFaces.length)];
        let turnstring = turn[Math.floor(Math.random() * turn.length)];
        scramble.push(facestring + turnstring);
        lastMove = facestring; // 更新 lastMove
    }
    return scramble;
}
//wca公式
var SC = shuffleArray();
//顯示公式
$('#scramble').text(SC.join(' '));
//+2按鈕
if (!$('#\\+2btn'))
    throw new Error("找不到 +2btn 元素");
$('#\\+2btn').on('click', () => {
    const lastTime = roomobj[currentRoomName][roomobj[currentRoomName].length - 1];
    $("ul").append(`<li>${lastTime.dnfboo ? "DNF" :
        (lastTime.min.toString().padStart(2, '0') + ':' +
            lastTime.s.toString().padStart(2, '0') +
            (lastTime.plus2boo ? " +2" : ""))}</li>`);
});
if (!$('#dnfbtn'))
    throw new Error("找不到 dnfBtn 元素");
//DNF按鈕   
$('#dnfbtn').on('click', () => {
    if (roomobj[currentRoomName].length > 0) {
        const lastIndex = roomobj[currentRoomName].length - 1;
        roomobj[currentRoomName][lastIndex].dnf();
        $("ul li").last().text("DNF");
    }
});
class Ao5maxmin {
    max;
    min;
    constructor(times) {
        if (times.length < 5) {
            alert("成績數量不足");
            return;
        }
        let dnfnum = 0;
        for (let i = 0; i < 5; i++) { // 應該檢查最近5個
            if (times[i].alls == -1 || times[i].alls >= 600)
                dnfnum++;
        }
        if (dnfnum >= 2) {
            this.max = Infinity;
            this.min = Infinity;
            alert("DNF");
            return;
        }
        let alltimes = times.map(t => t.alls);
        let min = Math.min(...alltimes);
        let max = Math.max(...alltimes);
        this.max = max;
        this.min = min;
        if (this.max === undefined || this.min === undefined)
            throw new Error("max或min未定義");
    }
}
//計算Ao5
if (!$('#ao5btn'))
    throw new Error("找不到 ao5Btn 元素");
$('#ao5btn').on('click', () => {
    const currentTimes = roomobj[currentRoomName];
    if (currentTimes.length < 5) {
        alert("成績數量不足");
        return;
    }
    // 取最近5筆成績
    const last5 = currentTimes.slice(-5);
    var maxmin = new Ao5maxmin(last5);
    if (maxmin.max === undefined || maxmin.min === undefined) {
        alert("計算失敗");
        return;
    }
    const findmax = last5.findIndex(t => t.alls === maxmin.max);
    const findmin = last5.findIndex(t => t.alls === maxmin.min);
    let t_array = [];
    for (let i = 0; i < last5.length; i++) {
        if (i == findmax || i == findmin)
            continue;
        t_array.push(last5[i].alls);
    }
    var ao5 = (t_array[0] + t_array[1] + t_array[2]) / 3;
    let m = Math.floor(ao5 / 60);
    let s = (ao5 % 60);
    if (ao5 === Infinity) {
        alert("DNF");
        return;
    }
    function toTimeString(m, s) {
        const sFixed = s.toFixed(2);
        const [secInt, secDec] = sFixed.split(".");
        return "Ao5: " +
            (m < 10 ? "0" + m : m) + ":" +
            (parseInt(secInt) < 10 ? "0" + secInt : secInt) + "." + secDec;
    }
    alert(toTimeString(m, s));
    $("ul").append(`<li>${toTimeString(m, s)}</li>`);
});
//儲存按鈕
$("#save").on('click', () => {
    const json = JSON.stringify(roomobj);
    const savefct = (data) => {
        fetch("https://epbzyginbymtlaumsllx.supabase.co/storage/v1/object/yatimer/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: data,
        });
    };
    savefct(json);
});
//刪除按鈕
$("#del").on("click", () => {
    // 只清除當前房間的成績
    roomobj[currentRoomName] = [];
    $("ul").empty();
    // 更新localStorage
    localStorage.setItem("timerRoomData", JSON.stringify({
        rooms: roomobj,
        currentRoom: currentRoomName
    }));
});
if ($("#roomnamebutton").length = 0)
    throw new Error("找不到#roomnamebutton");
//處理新房間
$("#roomnamebutton").on("click", function () {
    if ($("#roomname").length = 0)
        throw new Error("找不到新房間名稱輸入欄element");
});
