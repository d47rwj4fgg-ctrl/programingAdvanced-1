/* ==========================================================================
   templateManager.js - テンプレート登録＆配置機能
   ========================================================================== */

// 1. デフォルトのテンプレート辞書データ
const defaultTemplates = {
    "朝の用意": [
        { title: "顔を洗う", duration: 10, icon: "🧼", type: "routine", desc: "朝の洗顔" },
        { title: "歯を磨く", duration: 3, icon: "🪥", type: "routine", desc: "しっかり磨く" },
        { title: "朝ご飯を食べる", duration: 30, icon: "🍞", type: "home", desc: "しっかり栄養補給" },
        { title: "着替える", duration: 10, icon: "👕", type: "routine", desc: "今日のコーディネート" },
        { title: "髪を結ぶ", duration: 15, icon: "🎀", type: "routine", desc: "ヘアセット" }
    ],
    "大学帰宅後のルーティン": [
        { title: "手洗い・うがい", duration: 5, icon: "🧼", type: "health", desc: "感染症予防" },
        { title: "お風呂に入る", duration: 40, icon: "🛁", type: "health", desc: "湯船でリラックス" },
        { title: "夕食", duration: 40, icon: "🍳", type: "home", desc: "自炊または家族と" },
        { title: "明日の準備", duration: 15, icon: "🎒", type: "study", desc: "カバンの中身チェック" }
    ]
};

// 金庫（localStorage）にテンプレートがなければ初期データを保存
if (!localStorage.getItem('savedTemplates')) {
    localStorage.setItem('savedTemplates', JSON.stringify(defaultTemplates));
}

// 2. モーダルの開閉制御
const tModal = document.getElementById('template-modal');
const tOpenBtn = document.getElementById('template-open-btn');
const tCloseBtn = document.getElementById('template-close-btn');

if (tOpenBtn && tCloseBtn && tModal) {
    tOpenBtn.addEventListener('click', () => {
        renderTemplateList();
        tModal.style.opacity = "1";
        tModal.style.pointerEvents = "auto";
    });

    tCloseBtn.addEventListener('click', () => {
        tModal.style.opacity = "0";
        tModal.style.pointerEvents = "none";
    });
}

// 3. テンプレート一覧をポップアップ内に描画する
function renderTemplateList() {
    const container = document.getElementById('template-list-container');
    container.innerHTML = '';
    
    const templates = JSON.parse(localStorage.getItem('savedTemplates'));

    Object.keys(templates).forEach(templateName => {
        const btn = document.createElement('button');
        btn.style.width = "100%";
        btn.style.padding = "12px 16px";
        btn.style.background = "#fff0f1"; // アプリのピンクに合わせたカラー
        btn.style.border = "1px solid #FFB1B6";
        btn.style.borderRadius = "12px";
        btn.style.textAlign = "left";
        btn.style.fontSize = "14px";
        btn.style.fontWeight = "700";
        btn.style.color = "#FF7082";
        btn.style.cursor = "pointer";
        btn.style.display = "flex";
        btn.style.justifyContent = "between";
        
        // 合計時間の計算
        const totalMin = templates[templateName].reduce((sum, item) => sum + item.duration, 0);
        btn.innerHTML = `<span>📋 ${templateName}</span> <span style="font-size:11px; color:#64748b; margin-left:auto;">計 ${totalMin}分</span>`;

        // クリックしたらそのテンプレートをタイムラインに展開する
        btn.addEventListener('click', () => {
            applyTemplateToSchedule(templateName);
        });

        container.appendChild(btn);
    });
}

// 4. 選択されたテンプレートを現在の曜日のスケジュールに適用する
function applyTemplateToSchedule(templateName) {
    const templates = JSON.parse(localStorage.getItem('savedTemplates'));
    const selectedSubTasks = templates[templateName];
    
    // 画面から指定された開始時刻（例: "07:00"）を取得
    const startTimeStr = document.getElementById('template-start-time').value;
    let currentMinutes = timeToMinutes(startTimeStr); // 既存の共通関数を利用

    // 各サブタスクを開始時間から数珠つなぎで時間割に変換する
    selectedSubTasks.forEach(subTask => {
        const startStr = minutesToTime(currentMinutes);
        currentMinutes += subTask.duration;
        const endStr = minutesToTime(currentMinutes);

        const newEvent = {
            start: startStr,
            end: endStr,
            title: subTask.title,
            desc: subTask.desc,
            icon: subTask.icon,
            type: subTask.type
        };

        // 現在アクティブな曜日（Kanae_dailymain.htmlのグローバル変数 `currentActiveDay`）の辞書に追加
        if (!schedules[currentActiveDay]) {
            schedules[currentActiveDay] = [];
        }
        schedules[currentActiveDay].push(newEvent);
    });

    // ポップアップを閉じる
    tModal.style.opacity = "0";
    tModal.style.pointerEvents = "none";

    // 既存のメインロジックの関数を呼び出して画面を再描画する
    switchDay(currentActiveDay);

}