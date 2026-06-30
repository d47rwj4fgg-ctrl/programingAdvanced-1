// 画面の要素（ボタンや入力欄）を取得する
const allDayToggle = document.getElementById('allDayToggle');
const startTimeInput = document.getElementById('startTime');
const endTimeInput = document.getElementById('endTime');
const saveBtn = document.getElementById('saveBtn');

// 1. 「終日」スイッチが切り替わったら時間を隠す/表示する処理
allDayToggle.addEventListener('change', () => {
    if (allDayToggle.checked) {
        startTimeInput.style.display = 'none';
        endTimeInput.style.display = 'none';
    } else {
        startTimeInput.style.display = 'inline-block';
        endTimeInput.style.display = 'inline-block';
    }
});

// 2. 「保存」ボタンが押された時の処理（金庫への保存）
saveBtn.addEventListener('click', () => {
    // 画面に入力された内容をかき集める
    const taskData = {
        id: Date.now(), // 重複しない一意の番号として現在の時間をIDにする
        title: document.getElementById('taskTitle').value,
        location: document.getElementById('taskLocation').value,
        isAllDay: allDayToggle.checked,
        startDate: document.getElementById('startDate').value,
        startTime: allDayToggle.checked ? "" : startTimeInput.value,
        endDate: document.getElementById('endDate').value,
        endTime: allDayToggle.checked ? "" : endTimeInput.value
    };

    // タイトルが空っぽなら警告して止める
    if (!taskData.title.trim()) {
        alert('タイトルを入力してください！');
        return;
    }

    // 既存のタスクリストを金庫（localStorage）から取り出す（無ければ空の配列）
    let currentTasks = JSON.parse(localStorage.getItem('savedTasks')) || [];
    
    // 新しいタスクをリストに追加
    currentTasks.push(taskData);

    // 金庫（localStorage）を最新の状態に上書き保存する
    localStorage.setItem('savedTasks', JSON.stringify(currentTasks));

    // 成功メッセージ
    alert(`「${taskData.title}」を保存しました！`);
    console.log('現在の全保存データ:', currentTasks);
});