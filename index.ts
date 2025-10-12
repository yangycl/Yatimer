// timer ts
const divTimer: JQuery = $('#timer');

let timerInterval: number | undefined;
let isRunning: boolean = false;
let startTime: number = 0;
let elapsedTime: number = 0;
class Time {
    dnfboo: boolean = false;
    plus2boo: boolean = false;
    min: number;
    s: number;
    alls: number;
    constructor(min: number ,s: number) {
        this.min = min;
        this.s = s;
        this.alls = this.min*60+this.s;
    }
    //處理+2
    plus2(): void {
        this.s += 2;
        this.plus2boo = true;
        if (this.s >= 60) {
            this.s -= 60;
            this.min += 1;
            
        }
        this.alls += 2;
    }
    //處理DNF
    dnf(): void {
        this.min = -1;
        this.s = -1;
        this.dnfboo = true;
        this.alls = Infinity;
    }
}
//紀錄成績
var roomobj: Record<string, Time[]> = {
    "3*3*3": []
};
let currentRoomName: string = "3*3*3";

window.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');
    
    const savedData = localStorage.getItem("timerData");
    if (savedData) {
        const parsed = JSON.parse(savedData);
        roomobj = {};
        for (const room in parsed) {
            roomobj[room] = parsed[room].map((t: any) => {
                const time = new Time(t.min, t.s);
                time.dnfboo = t.dnfboo;
                time.plus2boo = t.plus2boo;
                time.alls = t.alls;
                return time;
            });
        }
    } else {
        roomobj = { "3*3*3": [] };
    }

    currentRoomName = Object.keys(roomobj)[0];

    // 顯示房間名稱
    $('#roomnametext').text(`房間: ${currentRoomName}`);

    // 顯示時間紀錄
    if (roomobj[currentRoomName]) {
        display_times(roomobj[currentRoomName]);
    
    }
});
$('#roomnametext').text(`房間: ${currentRoomName}`);
function format_Time(t: Time):string {
    return t.dnfboo ? "DNF" :
        (t.min.toString().padStart(2, '0') + ':' +
            t.s.toString().padStart(2, '0') +
            (t.plus2boo ? " +2" : "")) ;
}
function display_times (tarr:Time[]):void {
    $("ul").empty();
    for (let t of tarr){
        $("ul").append(`<li>${format_Time(t)}</li>`);
    }
}

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
$(document).on('keyup', (e) => {
    if (e.code === 'Space') {
        e.preventDefault(); // 防止捲動

        if (isRunning) {
            // 停止計時
            isRunning = false;
            clearInterval(timerInterval);
            elapsedTime += Date.now() - startTime;
                
            $("ul").append(`<li>${$("#timer").text()}</li>`);
            const t = $("#timer").text().split(':');
            const m = parseInt(t[0]);
            const s = parseFloat(t[1]);
            if (!roomobj[currentRoomName]) roomobj[currentRoomName] = [];
            roomobj[currentRoomName].push(new Time(m,s));
            console.log(roomobj);
            localStorage.setItem("timerData", JSON.stringify(roomobj));
            console.log(localStorage.getItem("timerData"));
            // 重設計時器
            elapsedTime = 0;
            divTimer.text('00:00.00');    

        } else {
            // 開始計時
            isRunning = true;
            startTime = Date.now();
            timerInterval = window.setInterval(updateTimer, 30);
        }
    }
});
//打亂公式
function shuffleArray(roomname:string): string[] {
    const cubetype:string = roomname.includes("3*3*3")?"3*3*3":(
        roomname.includes("2*2*2")?"2*2*2"
        :"3*3*3"
    );
    const face:string[] = cubetype =="3*3*3" ?["U","F","R","B","L","D"]:["U","F","R"];
    const turn:string[] = ["'","2",""];
    const scramble:string[] = [];
    let lastMove:string = "";  // 移到外面
    let count = cubetype == "3*3*3"?20:10;
    
    for(let i = 0; i < count ; i++){
        const filteredFaces = face.filter(f => f !== lastMove);
        const facestring:string = filteredFaces[Math.floor(Math.random()*filteredFaces.length)];
        const turnstring = turn[Math.floor(Math.random()*turn.length)];
        
        scramble.push(facestring+turnstring);
        lastMove = facestring;  // 更新 lastMove
    }
    return scramble;
}
//wca公式
const SC : string[] = shuffleArray(currentRoomName);
//顯示公式
$('#scramble').text(SC.join(' '));
//+2按鈕
if (!$('#\\+2btn')) throw new Error("找不到 +2btn 元素");
$('#\\+2btn').on('click', () => {
    let lastTime = roomobj[currentRoomName][roomobj[currentRoomName].length-1] ;
    lastTime.plus2();
    display_times(roomobj[currentRoomName])
});
if (!$('#dnfbtn')) throw new Error("找不到 dnfBtn 元素");
//DNF按鈕   
$('#dnfbtn').on('click', () => {
    if (roomobj[currentRoomName].length > 0) {
        
        const lastIndex = roomobj[currentRoomName].length - 1;
        roomobj[currentRoomName][lastIndex].dnf();
        $("ul li").last().text("DNF");
            
    }
});
class Ao5maxmin {
    max: number|undefined;
    min: number|undefined;
    constructor(times: Time[]) {    
        if (times.length < 5) {
            alert("成績數量不足");
            return;
        }
        
        let dnfnum: number = 0;
        for (let i = 0; i < 5; i++) { // 應該檢查最近5個
            if (!isFinite(times[i].alls)||times[i].alls>=600) dnfnum++;
        }
        if (dnfnum>=2) {
            this.max = Infinity;
            this.min = Infinity;
            alert("DNF");
            return;
        }
        const alltimes: number[] = times.map(t => t.alls);
        const min: number = Math.min(...alltimes);
        const max: number = Math.max(...alltimes);

        this.max = max;
        this.min = min;
        if (this.max===undefined||this.min===undefined) throw new Error("max或min未定義");
    }
}

//計算Ao5
if (!$('#ao5btn')) throw new Error("找不到 ao5Btn 元素");
$('#ao5btn').on('click', () :void => {
    const currentTimes = roomobj[currentRoomName];
    
    if (currentTimes.length < 5) {
        alert("成績數量不足");
        return;
    }
    
    // 取最近5筆成績
    const last5 = currentTimes.slice(-5);
    
    const maxmin:Ao5maxmin = new Ao5maxmin(last5);
    if (maxmin.max === undefined || maxmin.min === undefined) {
        alert("計算失敗");
        return;
    }
    
    const findmax:number = last5.findIndex(t => t.alls === maxmin.max);
    const findmin:number = last5.findIndex(t => t.alls === maxmin.min);
    const t_array:number[] = [];

    for (let i = 0; i < last5.length; i++) {
        if (i == findmax || i == findmin) continue;
        t_array.push(last5[i].alls);
    }    

    const ao5 = (t_array[0] + t_array[1] + t_array[2]) / 3;
    const m = Math.floor(ao5/60);
    const s = (ao5%60);
    
    if (ao5 === Infinity) {
        alert("DNF");
        return;
    }
        
    function toTimeString(m: number, s: number): string {
        const sFixed = s.toFixed(2);
        const [secInt, secDec] = sFixed.split(".");

        return "Ao5: " +
            (m < 10 ? "0" + m : m) + ":" +
            (parseInt(secInt) < 10 ? "0" + secInt : secInt) + "." + secDec;
    }
    
    alert(toTimeString(m,s));
    $("ul").append(`<li>${toTimeString(m,s)}</li>`);
});

//儲存按鈕
$("#save").on('click', () => {
    const json:string = JSON.stringify(roomobj);
    const savefct = (data:string) => {
        fetch("https://epbzyginbymtlaumsllx.supabase.co/storage/v1/object/yatimer/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: data,
        });
    }
    savefct(json);
});

//刪除按鈕
$("#del").on("click",()=>{
    // 只清除當前房間的成績
    roomobj[currentRoomName] = [];
    
    $("ul").empty();
    
    // 更新localStorage
    // 刪除按鈕
    localStorage.setItem("timerData", JSON.stringify(roomobj));
});
if ($("#roomnamebutton").length === 0) throw new Error("找不到#roomnamebutton");
//處理新房間

$("#roomnamebutton").on("click",function(){
    if ($("#roomname").length === 0) throw new Error("找不到新房間名稱輸入欄element");
    
    const roomName = $("#roomname").val() as string; // 改：取 roomname 不是 roomnametext
    if (typeof roomName !== "string") throw new Error("不是字串");

    const trimmedRoomName = roomName.trim() || "";
    if (!trimmedRoomName) return; // 空字串就直接返回
    
    currentRoomName = trimmedRoomName;
    
    roomobj[currentRoomName] ??= [];
    display_times(roomobj[currentRoomName])
    // 更新房間名稱顯示
    $('#roomnametext').text(`房間: ${currentRoomName}`);
    
    // 清空輸入框
    $("#roomname").val('');
    // 加上這行：儲存到 localStorage
    localStorage.setItem("timerData", JSON.stringify(roomobj));
    shuffleArray(currentRoomName);
    
});
if($("#download_json").length === 0) throw new Error("找不到#download_json");
$("#download_json").on("click",function(){
    const downloaddata =  JSON.stringify(roomobj, null, 2);
    const blob = new Blob([downloaddata], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a')
    a.href = url;
    const roomNames = Object.keys(roomobj).join('_').replace(/\*/g, 'x');
    a.download = `yatimer_${roomNames}.json`
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert("成績匯出已完成")
});
//0是falsy
if(!$("#upload_json").length) throw new Error("找不到#upload_json") ;
$("#upload_json").on("change", function(e){
    const origin:Record<string,Time[]> = roomobj
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];  // 取得選擇的檔案
    const reader = new FileReader();

    if (!file) {
        alert("沒有選擇任何檔案！");
        return;
    }
    reader.onload = (event) => {
        try{
            
            const fileContent = event.target?.result;
            if (typeof fileContent !== "string") {
                alert("檔案讀取錯誤");
                return;
            }

            const init: { [key: string]: any } = JSON.parse(fileContent);

            // 恢復方法
            roomobj = {};
            for (const room in init){
                roomobj[room] = [];

                for(let i: number = 0; i < init[room].length; i++) {
                    const t = init[room][i];
                    const time = new Time(t.min, t.s);
                    time.plus2boo = t.plus2boo;
                    time.dnfboo = t.dnfboo;
                    time.alls = t.alls;
                    roomobj[room].push(time);
                }
            }

            // 顯示
            currentRoomName = Object.keys(roomobj)[0];
            // 顯示後面加上這行
            $('#roomnametext').text(`房間: ${currentRoomName}`);
            display_times(roomobj[currentRoomName])
            // localStorage
            localStorage.setItem("timerData", JSON.stringify(roomobj));
            alert("匯入成功!");
        }catch(err){
            alert(`匯入失敗!錯誤訊息:${err}`);
            roomobj = origin;
            currentRoomName = Object.keys(roomobj)[0];
            $("#roomnametext").text(`房間:${currentRoomName}`);
            display_times(roomobj[currentRoomName])

        }
    
    }
    reader.readAsText(file);
});
//點擊房間名就進行改房間名動作
$("#roomnametext").on("click", function () {
    let newname: string | null = prompt("請輸入新房間名(改名動作)");

    if (!newname) {
        alert("你已取消動作");
        return;
    }

    newname = newname.trim();
    if (newname === currentRoomName || newname === "") {
        alert("名稱無效");
        return;
    }

    // 如果新名稱已存在，警告使用者避免覆蓋
    if (newname in roomobj) {
        const confirmOverwrite = confirm(`房間 "${newname}" 已存在，是否覆蓋？`);
        if (!confirmOverwrite) return;
    }

    // 改名
    roomobj[newname] = roomobj[currentRoomName];
    delete roomobj[currentRoomName];
    currentRoomName = newname;

    // 更新畫面與資料
    $("#roomnametext").text(`房間名: ${currentRoomName}`);
    const newsc:string[] =  shuffleArray(currentRoomName);
    $("#scramble").text(newsc.join(" "));
    localStorage.setItem("timerData", JSON.stringify(roomobj));
});
//刪除所有房間
if(!$("#delallroom").length) throw new Error("找不到#delallroom");
$("#delallroom").on("click",function(){
    roomobj = {"3*3*3" :[]};
    currentRoomName = "3*3*3";
    $("ul").empty();
    $("#roomnametext").text(`房間:${currentRoomName}`);
    //local
    localStorage.setItem("timerData", JSON.stringify(roomobj));
});
