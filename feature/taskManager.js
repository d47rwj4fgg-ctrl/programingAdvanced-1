// ==========================================
// 1. データ管理クラス (TaskManager)
// ==========================================
const TaskManager = {
    // 全タスクを取得する
    getTasks() {
        return JSON.parse(localStorage.getItem('savedTasks')) || [];
    },

    // タスクを保存する (新規・更新)
    saveTask(taskData) {
        const tasks = this.getTasks();

        // 既存のタスクがあれば上書き、なければ新規追加
        const index = tasks.findIndex(t => t.id === taskData.id);
        if (index !== -1) {
            tasks[index] = taskData;
        } else {
            // 新規登録ならIDを付与（既存にない場合）
            if (!taskData.id) {
                taskData.id = Date.now();
            }
            tasks.push(taskData);
        }

        localStorage.setItem('savedTasks', JSON.stringify(tasks));
        return tasks;
    },

    // タスクを削除する
    deleteTask(id) {
        let tasks = this.getTasks();
        tasks = tasks.filter(t => t.id !== id);
        localStorage.setItem('savedTasks', JSON.stringify(tasks));
        return tasks;
    }
};

// 他のHTMLからグローバルで使えるように window に紐づける
window.TaskManager = TaskManager;


// ==========================================
// 2. 画面制御・イベント処理 (register.html 用)
// ==========================================
// HTMLの読み込みが完了したら動作を開始する
document.addEventListener('DOMContentLoaded', () => {
    // 画面要素の取得
    const categorySegment = document.getElementById('categorySegment');
    const segmentBtns = categorySegment ? categorySegment.querySelectorAll('.segment-btn') : [];

    const taskTitleInput = document.getElementById('taskTitle');
    const locationRow = document.getElementById('locationRow');
    const taskLocationInput = document.getElementById('taskLocation');

    // 予定用フォーム
    const scheduleFields = document.getElementById('scheduleFields');
    const allDayToggle = document.getElementById('allDayToggle');
    const startDateInput = document.getElementById('startDate');
    const startTimeInput = document.getElementById('startTime');
    const endDateInput = document.getElementById('endDate');
    const endTimeInput = document.getElementById('endTime');

    // タスク用フォーム
    const taskFields = document.getElementById('taskFields');
    const deadlineDateInput = document.getElementById('deadlineDate');
    const deadlineTimeInput = document.getElementById('deadlineTime');
    const estimatedHoursInput = document.getElementById('estimatedHours');
    const estimatedMinutesInput = document.getElementById('estimatedMinutes');
    const recurrenceSelect = document.getElementById('recurrence');

    // アクションボタンとリスト
    const saveBtn = document.getElementById('saveBtn');
    const taskListCard = document.getElementById('taskListCard');

    // 現在選択されているカテゴリ (初期値は schedule)
    let currentCategory = 'schedule';

    // --- (A) カテゴリ切り替え処理 ---
    segmentBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // アクティブクラスの切り替え
            segmentBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // 選択されたカテゴリの更新
            currentCategory = btn.getAttribute('data-category');

            // 表示フィールドの切り替え
            if (currentCategory === 'schedule') {
                locationRow.classList.remove('hidden');
                scheduleFields.classList.remove('hidden');
                taskFields.classList.add('hidden');
            } else {
                locationRow.classList.add('hidden');
                scheduleFields.classList.add('hidden');
                taskFields.classList.remove('hidden');
            }
        });
    });

    // --- (B) 「終日」トグルの制御 ---
    if (allDayToggle) {
        allDayToggle.addEventListener('change', () => {
            if (allDayToggle.checked) {
                startTimeInput.style.display = 'none';
                endTimeInput.style.display = 'none';
            } else {
                startTimeInput.style.display = 'inline-block';
                endTimeInput.style.display = 'inline-block';
            }
        });
    }

    // --- (C) リストの描画処理 ---
    function renderTaskList() {
        if (!taskListCard) return;

        const tasks = TaskManager.getTasks();
        taskListCard.innerHTML = '';

        if (tasks.length === 0) {
            taskListCard.innerHTML = `
                <div style="text-align: center; color: #8e8e93; padding: 16px; font-size: 14px;">
                    登録されているデータはありません
                </div>
            `;
            return;
        }

        // 登録されたデータを順に生成
        tasks.forEach(task => {
            const taskItem = document.createElement('div');
            taskItem.className = 'task-item';

            // バッジと言語変換用
            const isSchedule = task.category === 'schedule';
            const badgeText = isSchedule ? '予定' : 'タスク';
            const badgeClass = isSchedule ? 'badge-schedule' : 'badge-task';

            // メタ情報のテキスト生成
            let metaHtml = '';
            if (isSchedule) {
                const timeStr = task.isAllDay ? '終日' : `${task.startTime} ～ ${task.endTime}`;
                const locationStr = task.location ? ` | 場所: ${task.location}` : '';
                metaHtml = `日時: ${task.startDate} ${timeStr}${locationStr}`;
            } else {
                // タスクの場合
                const hours = parseInt(task.estimatedHours || 0, 10);
                const mins = parseInt(task.estimatedMinutes || 0, 10);
                const timeTaken = (hours > 0 || mins > 0) ? `${hours ? hours + '時間' : ''}${mins ? mins + '分' : ''}` : '未設定';

                const recMap = { none: 'なし', daily: '毎日', weekly: '毎週', monthly: '毎月' };
                const recText = recMap[task.recurrence] || 'なし';

                metaHtml = `期限: ${task.deadlineDate} ${task.deadlineTime}<br>所要時間: ${timeTaken} | 繰り返し: ${recText}`;
            }

            taskItem.innerHTML = `
                <div class="task-info">
                    <div class="task-item-header">
                        <span class="task-item-badge ${badgeClass}">${badgeText}</span>
                        <span class="task-item-title">${escapeHTML(task.title)}</span>
                    </div>
                    <div class="task-item-meta">${metaHtml}</div>
                </div>
                <button class="delete-btn" data-id="${task.id}">削除</button>
            `;

            // 削除ボタンのイベントリスナー
            const deleteBtn = taskItem.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => {
                if (confirm(`「${task.title}」を削除しますか？`)) {
                    TaskManager.deleteTask(task.id);
                    renderTaskList();
                }
            });

            taskListCard.appendChild(taskItem);
        });
    }

    // HTMLエスケープ処理（XSS対策）
    function escapeHTML(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // --- (D) 保存処理 ---
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const title = taskTitleInput.value.trim();
            if (!title) {
                alert('タイトルを入力してください！');
                return;
            }

            let taskData = {
                id: Date.now(),
                category: currentCategory,
                title: title
            };

            // カテゴリに応じたデータの収集
            if (currentCategory === 'schedule') {
                taskData.location = taskLocationInput.value.trim();
                taskData.isAllDay = allDayToggle.checked;
                taskData.startDate = startDateInput.value;
                taskData.startTime = allDayToggle.checked ? "" : startTimeInput.value;
                taskData.endDate = endDateInput.value;
                taskData.endTime = allDayToggle.checked ? "" : endTimeInput.value;
            } else {
                taskData.deadlineDate = deadlineDateInput.value;
                taskData.deadlineTime = deadlineTimeInput.value;
                taskData.estimatedHours = parseInt(estimatedHoursInput.value || 0, 10);
                taskData.estimatedMinutes = parseInt(estimatedMinutesInput.value || 0, 10);
                taskData.recurrence = recurrenceSelect.value;
            }

            // 保存処理
            TaskManager.saveTask(taskData);
            alert(`「${title}」を保存しました！`);

            // フォームのクリア
            taskTitleInput.value = '';
            taskLocationInput.value = '';

            // リストの再描画
            renderTaskList();
        });
    }

    // 初期表示時にリストを描画
    renderTaskList();
});