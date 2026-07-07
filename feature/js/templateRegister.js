/* ==========================================================================
   templateRegister.js - テンプレートの動的生成、編集と保存ロジック
   ========================================================================== */

const container = document.getElementById('subtask-list-container');
const addBtn = document.getElementById('addSubTaskBtn');
const saveBtn = document.getElementById('saveTemplateBtn');
const deleteBtn = document.getElementById('deleteTemplateBtn');
const templateSelect = document.getElementById('template-select');
const masterNameInput = document.getElementById('templateMasterName');

// 最初から1個だけ入力欄を出しておく
window.addEventListener('DOMContentLoaded', () => {
    initSidebar();
    updateStatusBarTime();
    setInterval(updateStatusBarTime, 1000);
    
    // 既存テンプレートのプルダウン構築
    loadTemplateSelectOptions();
    
    // 初期状態は新規作成
    resetToNewMode();
    
    // イベント設定
    templateSelect.addEventListener('change', handleTemplateSelectChange);
    deleteBtn.addEventListener('click', deleteCurrentTemplate);
});

// --- サイドバーの開閉イベント ---
function initSidebar() {
    const drawer = document.getElementById('sidebar-drawer');
    const overlay = document.getElementById('sidebar-overlay');
    const openBtn = document.getElementById('menu-toggle-btn');
    const closeBtn = document.getElementById('sidebar-close-btn');

    if (!drawer || !overlay || !openBtn || !closeBtn) return;

    openBtn.addEventListener('click', () => {
        drawer.classList.add('active');
        overlay.classList.add('active');
    });

    closeBtn.addEventListener('click', () => {
        drawer.classList.remove('active');
        overlay.classList.remove('active');
    });

    overlay.addEventListener('click', () => {
        drawer.classList.remove('active');
        overlay.classList.remove('active');
    });
}

// --- ステータスバーの時計 ---
function updateStatusBarTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timeEl = document.getElementById('status-bar-time');
    if (timeEl) {
        timeEl.textContent = `${hours}:${minutes}`;
    }
}

// 既存テンプレート一覧をロードしてプルダウンに追加
function loadTemplateSelectOptions() {
    // 既存のオプションをクリア（最初の新規オプションは残す）
    templateSelect.innerHTML = '<option value="new">-- 新規テンプレートを作成 --</option>';
    
    const templates = JSON.parse(localStorage.getItem('savedTemplates')) || {};
    Object.keys(templates).forEach(key => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = key;
        templateSelect.appendChild(option);
    });
}

// 新規作成モードへのリセット
function resetToNewMode() {
    masterNameInput.value = '';
    masterNameInput.disabled = false;
    container.innerHTML = '';
    deleteBtn.style.display = 'none';
    
    // 初期見本を1行追加
    addSubTaskRow("顔を洗う", 10);
}

// プルダウンの選択が変わったときのハンドラ
function handleTemplateSelectChange() {
    const val = templateSelect.value;
    if (val === 'new') {
        resetToNewMode();
    } else {
        // 既存テンプレートの編集
        const templates = JSON.parse(localStorage.getItem('savedTemplates')) || {};
        const templateData = templates[val];
        
        if (templateData) {
            masterNameInput.value = val;
            container.innerHTML = '';
            deleteBtn.style.display = 'block';
            
            // 既存のタスクを展開
            templateData.forEach(subTask => {
                addSubTaskRow(subTask.title, subTask.duration);
            });
        }
    }
}

// 「+ 予定を追加」ボタンが押されたら入力欄のカードを増やす
addBtn.addEventListener('click', () => {
    addSubTaskRow("", 10);
});

// 入力欄（カード）を1行分生成する関数
function addSubTaskRow(defaultTitle = "", defaultDuration = 10) {
    const card = document.createElement('div');
    card.className = 'card subtask-row-card';
    card.style.position = 'relative';
    card.style.padding = '12px 14px';
    card.style.borderRadius = '12px';
    card.style.border = '1.5px solid #e2e8f0';
    card.style.boxShadow = 'none';
    card.style.marginBottom = '8px';

    card.innerHTML = `
        <div class="form-row" style="border-bottom: none; padding-bottom: 0; margin-bottom: 8px;">
            <input type="text" class="subtask-title" placeholder="予定の名前 (例: 歯を磨く)" value="${defaultTitle}" 
                style="width: calc(100% - 24px); padding: 8px 12px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 13px; outline: none;">
        </div>
        <div class="form-row" style="min-height: 36px; border-bottom: none; padding: 0; display: flex; align-items: center; justify-content: space-between;">
            <label style="font-size: 13px; font-weight: 700; color: #64748b;">所要時間</label>
            <div style="display: flex; align-items: center; gap: 4px;">
                <input type="number" class="subtask-duration" value="${defaultDuration}" 
                    style="width: 70px; padding: 6px; text-align: center; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 13px; font-weight: 600;" min="1">
                <span style="font-size: 13px; font-weight: 600; color: #64748b;">分</span>
            </div>
        </div>
        <button class="row-delete-btn" style="position: absolute; top: 18px; right: 12px; background: none; border: none; color: #ef4444; font-size: 16px; cursor: pointer; padding: 4px; display: flex; align-items: center; justify-content: center;">✕</button>
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

// アイコンを自動選別するユーティリティ
function getAutoIcon(title) {
    const t = title.toLowerCase();
    if (t.includes('洗') || t.includes('磨') || t.includes('服') || t.includes('結ぶ') || t.includes('セット')) return '🧼';
    if (t.includes('食') || t.includes('飯') || t.includes('パン')) return '🍞';
    if (t.includes('勉強') || t.includes('予習') || t.includes('宿題') || t.includes('本')) return '📚';
    if (t.includes('風呂') || t.includes('シャワー')) return '🛁';
    return '📌';
}

// 「保存」ボタンが押されたら、データを辞書にまとめて保存
saveBtn.addEventListener('click', () => {
    const masterName = masterNameInput.value.trim();
    
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

        subTasksArray.push({
            title: title,
            duration: duration,
            icon: getAutoIcon(title),
            type: "routine",
            desc: `${title}の時間 (${duration}分)`
        });
    }

    let currentTemplates = JSON.parse(localStorage.getItem('savedTemplates')) || {};

    // 重複チェック
    const isNew = templateSelect.value === 'new';
    if (isNew && currentTemplates[masterName]) {
        if (!confirm(`テンプレート「${masterName}」は既に存在します。上書きしますか？`)) {
            return;
        }
    }

    // 元の名前から変更されて上書きする場合の処理（元のキーを消す）
    const originalVal = templateSelect.value;
    if (originalVal !== 'new' && originalVal !== masterName) {
        delete currentTemplates[originalVal];
    }

    currentTemplates[masterName] = subTasksArray;
    localStorage.setItem('savedTemplates', JSON.stringify(currentTemplates));
    
    alert('テンプレートを保存しました！');
    location.href = 'daily.html';
});

// 現在選択されているテンプレートを削除
function deleteCurrentTemplate() {
    const val = templateSelect.value;
    if (val === 'new') return;
    
    if (confirm(`本当にテンプレート「${val}」を削除しますか？`)) {
        let currentTemplates = JSON.parse(localStorage.getItem('savedTemplates')) || {};
        delete currentTemplates[val];
        localStorage.setItem('savedTemplates', JSON.stringify(currentTemplates));
        
        alert('テンプレートを削除しました。');
        loadTemplateSelectOptions();
        resetToNewMode();
    }
}