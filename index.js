"use strict";
// timer ts
const divTimer = $('#timer');
let timerInterval;
let isRunning = false;
let startTime = 0;
let elapsedTime = 0;
function updateTimer() {
    const now = Date.now();
    const diff = now - startTime + elapsedTime;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    const milliseconds = Math.floor((diff % 1000) / 10);
    divTimer.text(`${minutes.toString().padStart(2, '0')}:` +
        `${seconds.toString().padStart(2, '0')}.` +
        `${milliseconds.toString().padStart(2, '0')}`);
    if (!isRunning) {
        $("ul").append(`<li>${$("#timer").text()}</li>`);
        return;
    }
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
        }
        else {
            // 開始計時
            isRunning = true;
            startTime = Date.now();
            timerInterval = window.setInterval(updateTimer, 30);
        }
    }
});
