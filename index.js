"use strict";
window.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');
    //讀取資料
    const savedData = localStorage.getItem("timerData");
    if (savedData) {
        li = JSON.parse(savedData);
        li.forEach(t => {
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
var li = [];
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
$(document).on('keydown', (e) => {
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
            li.push(new time(m, s));
            console.log(li);
            localStorage.setItem("timerData", JSON.stringify(li));
            console.log(localStorage.getItem("timerData"));
            console.log(li[li.length - 1].min, li[li.length - 1].s);
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
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
//wca公式
var SC = shuffleArray(["U", "U'", "U2", "UW", "R", "R'", "R2", "RW", "D", "D'", "D2", "DW", "L", "L'", "L2", "LW", "F", "F'", "F2", "FW", "B", "B'", "B2", "BW"]);
//顯示公式
$('#scramble').text(SC.join(' '));
//+2按鈕
if (!$('#\\+2btn'))
    throw new Error("找不到 +2btn 元素");
$('#\\+2btn').on('click', () => {
    if (li.length > 0) {
        li[li.length - 1].plus2();
        $("ul li").last().text(li[li.length - 1].dnfboo ? "DNF" : (li[li.length - 1].min.toString().padStart(2, '0') + ':' + li[li.length - 1].s.toString().padStart(2, '0') + (li[li.length - 1].plus2boo ? " +2" : "")));
    }
});
if (!$('#dnfbtn'))
    throw new Error("找不到 dnfBtn 元素");
//DNF按鈕   
$('#dnfbtn').on('click', () => {
    if (li.length > 0) {
        li[li.length - 1].dnf();
        $("ul li").last().text("DNF");
    }
});
class Ao5maxmin {
    max;
    min;
    constructor(li) {
        if (li.length < 5) {
            alert("成績數量不足");
            return;
        }
        let dnfnum = 0;
        for (let i = 0; i < 4; i++) {
            if (li[i].alls == -1 || li[i].alls >= 600)
                dnfnum++;
        }
        if (dnfnum >= 2) {
            this.max = Infinity;
            this.min = Infinity;
            alert("DNF");
            return;
        }
        let alltimes = li.map(t => t.alls);
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
    if (li.length < 5)
        throw new Error("成績數量不足");
    var maxmin = new Ao5maxmin(li);
    if (maxmin.max === undefined || maxmin.min === undefined)
        throw new Error("max或min未定義");
    const findmax = li.findIndex(t => t.alls === maxmin.max);
    const findmin = li.findIndex(t => t.alls === maxmin.min);
    let t_array = [];
    for (let i = 0; i < li.length; i++) {
        if (i == findmax || i == findmin)
            continue;
        t_array.push(li[i].alls);
    }
    var ao5 = t_array[0] + t_array[1] + t_array[2];
    ao5 = ao5 / 3;
    let m = Math.floor(ao5 / 60);
    let s = (ao5 % 60);
    if (ao5 === Infinity) {
        alert("DNF");
        return;
    }
    function toTimeString(m, s) {
        // 四捨五入到小數第二位，再轉字串填 0
        const sFixed = s.toFixed(2);
        const [secInt, secDec] = sFixed.split(".");
        return "Ao5: " +
            (m < 10 ? "0" + m : m) + ":" +
            (parseInt(secInt) < 10 ? "0" + secInt : secInt) + "." + secDec;
    }
    alert(toTimeString(m, s));
    $("ul").append(`<li>${toTimeString(m, s)}</li>`);
});
if (!$("save"))
    throw new Error("找不到 save 元素");
//儲存按鈕
$("save").on('click', () => {
    const json = JSON.stringify(li);
    const savefct = (data) => {
        fetch("epbzyginbymtlaumsllx.supabase.co/storage/v1/object/yatimer/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: data,
        });
    };
    savefct(json);
});
