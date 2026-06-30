/* ==========================================================================
   templateRegister.js - テンプレートの動的生成と保存ロジック
   ========================================================================== */

const container = document.getElementById('subtask-list-container');
const addBtn = document.getElementById('addSubTaskBtn');
const saveBtn = document.getElementById('saveTemplateBtn');

// 最初から1個だけ入力欄を出しておく
window.addEventListener('DOMContentLoaded', () => {
    addSubTaskRow("顔を洗う", 10); // 最初期の見本
});

// 「+ 予定を追加」ボタンが押されたら入力欄のカードを増やす
addBtn.addEventListener('click', () => {
    addSubTaskRow("", 10);
});

// 入力欄（カード）を1行分生成する関数
function addSubTaskRow(defaultTitle = "", defaultDuration = 10) {
    const card = document.createElement('div');
    card.className = 'card subtask-row-card';
    card.style.position = 'relative';
    card.style.paddingTop = '8px';
    card.style.paddingBottom = '8px';

    card.innerHTML = `
        <div class="form-row">
            <input type="text" class="subtask-title" placeholder="予定の名前 (例: 歯を磨く)" value="${defaultTitle}">
        </div>
        <div class="form-row" style="min-height: 36px; border-bottom: none;">
            <label style="font-size: 14px; color: #64748b;">所要時間</label>
            <div class="date-time-inputs">
                <input type="number" class="subtask-duration" value="${defaultDuration}" style="width: 70px; text-align: center;" min="1"> 分
            </div>
        </div>
        <button class="row-delete-btn" style="position: absolute; top: 12px; right: 12px; background: none; border: none; color: #ef4444; font-size: 16px; cursor: pointer;">✕</button>
    `;

    // ✕ボタンでその行（カード）を消せるようにする
    card.querySelector('.row-delete-btn').addEventListener('click', () => {
        if (document.querySelectorAll('.subtask-row-card').length > 1) {
            card.remove();
        } else {
            alert("これ以上消せません。最低1つの予定が必要です！");
        }
    });

    container.appendChild(card);
}

// アイコンを自動選別するユーティリティ（Yuuka_task.htmlのロジックと統一）
function getAutoIcon(title) {
    const t = title.toLowerCase();
    if (t.includes('洗') || t.includes('磨') || t.includes('服') || t.includes('結ぶ') || t.includes('セット')) return '🧼';
    if (t.includes('食') || t.includes('飯') || t.includes('パン')) return '🍞';
    if (t.includes('勉強') || t.includes('予習') || t.includes('宿題') || t.includes('本')) return '📚';
    if (t.includes('風呂') || t.includes('シャワー')) return '🛁';
    return '📌';
}

// 「保存」ボタンが押されたら、データを辞書にまとめて金庫（localStorage）へ保存
saveBtn.addEventListener('click', () => {
    const masterName = document.getElementById('templateMasterName').value.trim();
    
    if (!masterName) {
        alert('テンプレート名を入力してください！');
        return;
    }

    const rowCards = document.querySelectorAll('.subtask-row-card');
    const subTasksArray = [];

    // 画面に並んでいるカードを1つずつループしてデータをかき集める
    for (let card of rowCards) {
        const title = card.querySelector('.subtask-title').value.trim();
        const duration = parseInt(card.querySelector('.subtask-duration').value);

        if (!title) {
            alert('空っぽの予定名があります！入力するか✕で消してください。');
            return;
        }

        // 辞書の中身となるオブジェクトの構造を作成
        subTasksArray.push({
            title: title,
            duration: duration,
            icon: getAutoIcon(title),
            type: "routine", // デフォルトでルーティンタイプ
            desc: `${title}の時間 (${duration}分)`
        });
    }

    // 既存の金庫からテンプレート一覧の辞書を取り出す
    let currentTemplates = JSON.parse(localStorage.getItem('savedTemplates')) || {};

    // 新しいテンプレート名（キー）で、かき集めた配列（値）を辞書に登録・上書き
    currentTemplates[masterName] = subTasksArray;

    // 金庫に再保存
    localStorage.setItem('savedTemplates', JSON.stringify(currentTemplates));
    
    // デイリー画面に戻る
    location.href = 'daily.html';
});