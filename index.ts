// timer ts
const divTimer: JQuery = $('#timer');

let timerInterval: number | undefined;
let isRunning: boolean = false;
let startTime: number = 0;
let elapsedTime: number = 0;

function updateTimer(): void {
    const now = Date.now();
    const diff = now - startTime + elapsedTime;

    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    const milliseconds = Math.floor((diff % 1000) / 10);

    divTimer.text(
        `${minutes.toString().padStart(2, '0')}:` +
        `${seconds.toString().padStart(2, '0')}.` +
        `${milliseconds.toString().padStart(2, '0')}`
    );
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
                

        } else {
            // 開始計時
            isRunning = true;
            startTime = Date.now();
            timerInterval = window.setInterval(updateTimer, 30);
        }
    }
});
//打亂公式
function shuffleArray(array: string[]): string[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
//wca公式
var SC : string[] = shuffleArray(["U", "U'", "U2", "UW", "R", "R'","R2","RW", "D", "D'", "D2", "DW", "L", "L'", "L2", "LW", "F", "F'", "F2", "FW", "B", "B'", "B2", "BW"]);
//顯示公式
$('#scramble').text(SC.join(' '));