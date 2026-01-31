console.log("App.js Loaded. New Version.");

// --- CONFIG ---
const CURR_YEAR = new Date().getFullYear();
const DEFAULT_START = `${CURR_YEAR}-01-01`;
const DEFAULT_END = `${CURR_YEAR}-12-31`;

const DEFAULT_CONFIG = [
    {name: "Wake up", type: "time", weight: 20, target: "06:00", condition: "before", days: "Mon,Tue,Wed,Thu,Fri,Sat,Sun", startDate: DEFAULT_START, endDate: DEFAULT_END},
{name: "Gym", type: "bool", weight: 20, days: "Mon,Tue,Wed,Thu,Fri", startDate: DEFAULT_START, endDate: DEFAULT_END},
{name: "Deep Work", type: "bool", weight: 20, days: "Mon,Tue,Wed,Thu,Fri", startDate: DEFAULT_START, endDate: DEFAULT_END},
{name: "Reading", type: "bool", weight: 20, days: "Mon,Tue,Wed,Thu,Fri,Sat,Sun", startDate: DEFAULT_START, endDate: DEFAULT_END},
{name: "Sleep", type: "time", weight: 20, target: "23:00", condition: "before", days: "Mon,Tue,Wed,Thu,Fri,Sat,Sun", startDate: DEFAULT_START, endDate: DEFAULT_END}
];

// --- STATE ---
let appData = {};
let appConfig = [];
let currentView = 'tasks';
let taskDate = new Date();
let statsDate = new Date(); // Tracks the currently viewed week

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadData();
        setupNavigation();
        setupModalLogic();
        renderDayView();
    } catch (e) { console.error(e); }
});

// --- DATA ---
async function loadData() {
    try {
        const localData = localStorage.getItem('fg_data');
        const localConfig = localStorage.getItem('fg_config');
        if (localData) appData = JSON.parse(localData);
        if (localConfig) appConfig = JSON.parse(localConfig);
        else appConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
    } catch(e) {
        appConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
    }
}

async function saveData() {
    localStorage.setItem('fg_data', JSON.stringify(appData));
    localStorage.setItem('fg_config', JSON.stringify(appConfig));
}

// --- NAVIGATION ---
function setupNavigation() {
    // Arrows
    document.getElementById('btnPrev').onclick = () => handleNav(-1);
    document.getElementById('btnNext').onclick = () => handleNav(1);

    // Tabs
    const tabs = document.querySelectorAll('.nav-item');
    tabs.forEach(tab => {
        tab.onclick = () => {
            tabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.view-section').forEach(v => v.style.display = 'none');

            tab.classList.add('active');
            const targetId = tab.dataset.target;
            document.getElementById(targetId).style.display = 'block';

            const navHeader = document.getElementById('headerNav');
            const staticTitle = document.getElementById('staticTitle');
            const scoreDisplay = document.getElementById('headerScore');

            if(targetId === 'viewTasks') {
                currentView = 'tasks';
                navHeader.style.display = 'flex';
                staticTitle.style.display = 'none';
                scoreDisplay.style.visibility = 'visible';
                renderDayView();
            }
            else if(targetId === 'viewStats') {
                currentView = 'stats';
                navHeader.style.display = 'flex'; // ARROWS ON
                staticTitle.style.display = 'none';
                scoreDisplay.style.visibility = 'hidden'; // Hide score in header for stats
                renderCharts();
            }
            else {
                currentView = 'settings';
                navHeader.style.display = 'none';
                staticTitle.style.display = 'block';
                scoreDisplay.style.visibility = 'hidden';
                renderSettingsList();
            }
        }
    });

    document.getElementById('btnAdd').onclick = () => openEditModal(-1);
}

function handleNav(dir) {
    if (currentView === 'tasks') {
        taskDate.setDate(taskDate.getDate() + dir);
        renderDayView();
    } else if (currentView === 'stats') {
        statsDate.setDate(statsDate.getDate() + (dir * 7));
        renderCharts();
    }
}

// --- HELPERS ---
function formatDateKey(d) {
    const offset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - (offset*60*1000));
    return local.toISOString().split('T')[0];
}

function getMonday(d) {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
}

// --- TASK VIEW ---
function renderDayView() {
    const dateKey = formatDateKey(taskDate);
    const dayShort = taskDate.toLocaleDateString('en-US', {weekday: 'short'});
    const todayKey = formatDateKey(new Date());

    // Update Header
    document.getElementById('lblMain').innerText = (todayKey === dateKey) ? "Today" : dayShort;
    document.getElementById('lblSub').innerText = taskDate.toLocaleDateString(undefined, {month:'long', day:'numeric'});

    // Score
    const stats = calculateStats(dateKey);
    document.getElementById('headerScore').innerText = Math.round(stats.pct) + "%";

    const container = document.getElementById('taskList');
    container.innerHTML = '';

    let hasTasks = false;
    if(!appConfig || appConfig.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:30px; opacity:0.6">No tasks configured.</div>`;
        return;
    }

    appConfig.forEach((task) => {
        if(!task.startDate) task.startDate = DEFAULT_START;
        if(!task.endDate) task.endDate = DEFAULT_END;

        if(dateKey < task.startDate || dateKey > task.endDate) return;
        if(task.days && !task.days.includes(dayShort)) return;

        hasTasks = true;
        const val = appData[dateKey]?.[task.name];

        const card = document.createElement('div');
        card.className = 'task-card';

        let inputHtml = '';
        if(task.type === 'bool') {
            inputHtml = `<label class="toggle-switch"><input type="checkbox" ${val ? 'checked' : ''} onchange="updateValue('${dateKey}','${task.name}',this.checked)"><span class="slider"></span></label>`;
        } else if(task.type === 'time') {
            inputHtml = `<input type="time" value="${val||''}" onchange="updateValue('${dateKey}','${task.name}',this.value)">`;
        } else {
            inputHtml = `<input type="number" placeholder="-" value="${val||''}" style="width:50px" onchange="updateValue('${dateKey}','${task.name}',this.value)">`;
        }

        card.innerHTML = `<div class="task-info"><span class="task-name">${task.name}</span><span class="task-meta">${task.weight} pts</span></div><div>${inputHtml}</div>`;
        container.appendChild(card);
    });

    if(!hasTasks) container.innerHTML = `<div style="text-align:center; padding:30px; opacity:0.6">No tasks for this day.</div>`;
}

window.updateValue = function(key, name, val) {
    if(!appData[key]) appData[key] = {};
    appData[key][name] = val;
    saveData();
    document.getElementById('headerScore').innerText = Math.round(calculateStats(key).pct) + "%";
}

// --- STATS VIEW (WEEKLY) ---
function renderCharts() {
    if (typeof Chart === 'undefined') return;
    const ctxScore = document.getElementById('scoreChart').getContext('2d');
    const ctxTime = document.getElementById('timeChart').getContext('2d');

    // 1. Get Range
    const monday = getMonday(statsDate);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    // 2. Update Header (Jan 12 - Jan 18)
    const fmt = (d) => d.toLocaleDateString(undefined, {month:'short', day:'numeric'});
    document.getElementById('lblMain').innerText = `${fmt(monday)} - ${fmt(sunday)}`;
    document.getElementById('lblSub').innerText = "Weekly Stats";

    // 3. Generate Data
    const labels=[], scores=[], wakes=[], sleeps=[];

    for(let i=0; i<7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const key = formatDateKey(d);

        labels.push(d.toLocaleDateString('en-US', {weekday:'short'}));
        scores.push(calculateStats(key).pct);

        let w=null, s=null;
        appConfig.forEach(t => {
            if(appData[key]?.[t.name] && t.type==='time') {
                const h = parseTime(appData[key][t.name]);
                if(t.name.toLowerCase().includes('wake')) w=h;
                if(t.name.toLowerCase().includes('sleep')) s=h<12?h+24:h;
            }
        });
        wakes.push(w); sleeps.push(s);
    }

    // 4. Render
    if(window.chartS) window.chartS.destroy();
    window.chartS = new Chart(ctxScore, {
        type:'line',
        data:{labels, datasets:[{label:'Eff %', data:scores, borderColor:'#10b981', tension:0.3}]},
        options:{maintainAspectRatio:false, scales:{y:{min:0, max:100}}}
    });

    if(window.chartT) window.chartT.destroy();
    window.chartT = new Chart(ctxTime, {
        type:'line',
        data:{labels, datasets:[{label:'Wake', data:wakes, borderColor:'#06b6d4'},{label:'Sleep', data:sleeps, borderColor:'#8b5cf6'}]},
        options:{maintainAspectRatio:false}
    });
}

// --- CALC ---
function parseTime(val) {
    if (!val) return null;
    const parts = val.split(':');
    return parseFloat(parts[0]) + parseFloat(parts[1])/60;
}

function calculateStats(dateKey) {
    if(!appData[dateKey]) return { pct: 0 };
    let earned=0, total=0;

    const parts = dateKey.split('-').map(Number);
    const localDt = new Date(parts[0], parts[1]-1, parts[2]);
    const dayShort = localDt.toLocaleDateString('en-US', {weekday: 'short'});

    appConfig.forEach(task => {
        if(!task.startDate) task.startDate = DEFAULT_START;
        if(!task.endDate) task.endDate = DEFAULT_END;

        if(dateKey < task.startDate || dateKey > task.endDate) return;
        if(task.days && !task.days.includes(dayShort)) return;

        total += parseInt(task.weight);
        const val = appData[dateKey][task.name];
        if(!val) return;

        if(task.type === 'bool') earned += parseInt(task.weight);
        else if(task.type === 'score') earned += (Math.min(100, Math.max(0, parseFloat(val)))/100)*task.weight;
        else if(task.type === 'time') {
            const h = parseTime(val);
            const target = parseTime(task.target);
            if(h && target) {
                const diff = (h*60) - (target*60);
                if(task.condition === 'before') {
                    if(diff <= 0) earned += task.weight;
                    else earned += Math.max(0, task.weight * (1 - (diff/30)*0.2));
                } else {
                    if(diff >= 0) earned += task.weight;
                }
            }
        }
    });
    return { pct: total===0 ? 0 : (earned/total)*100 };
}

// --- MODAL & SCHEDULE ---
function setupModalLogic() {
    document.getElementById('btnCancelForm').onclick = () => document.getElementById('configModal').style.display = 'none';
    document.getElementById('btnSaveTask').onclick = saveTaskFromModal;

    document.getElementById('inpType').onchange = () => {
        document.getElementById('timeFields').style.display = (document.getElementById('inpType').value === 'time') ? 'block' : 'none';
    };

    const radioRepeat = document.getElementById('radioRepeat');
    const radioOnce = document.getElementById('radioOnce');
    function toggleFreq() {
        document.getElementById('divRepeatInputs').style.display = radioRepeat.checked ? 'block' : 'none';
        document.getElementById('divOnceInputs').style.display = radioOnce.checked ? 'block' : 'none';
    }
    radioRepeat.onchange = toggleFreq;
    radioOnce.onchange = toggleFreq;

    document.querySelectorAll('.day-opt').forEach(btn => btn.onclick = () => btn.classList.toggle('sel'));
}

function openEditModal(idx) {
    const modal = document.getElementById('configModal');
    document.getElementById('editIndex').value = idx;

    // Default Reset
    document.getElementById('radioRepeat').checked = true;
    document.querySelectorAll('.day-opt').forEach(b => b.classList.add('sel'));

    if (idx === -1) {
        document.getElementById('inpName').value = "";
        document.getElementById('inpWeight').value = 10;
        document.getElementById('inpStart').value = DEFAULT_START;
        document.getElementById('inpEnd').value = DEFAULT_END;
        document.getElementById('inpSpecificDate').value = "";
        document.getElementById('inpType').value = "bool";
    } else {
        const t = appConfig[idx];
        document.getElementById('inpName').value = t.name;
        document.getElementById('inpWeight').value = t.weight;
        document.getElementById('inpType').value = t.type;
        document.getElementById('inpTarget').value = t.target || "";

        if(t.startDate === t.endDate && t.startDate) {
            document.getElementById('radioOnce').checked = true;
            document.getElementById('inpSpecificDate').value = t.startDate;
        } else {
            document.getElementById('radioRepeat').checked = true;
            document.getElementById('inpStart').value = t.startDate || DEFAULT_START;
            document.getElementById('inpEnd').value = t.endDate || DEFAULT_END;
            document.querySelectorAll('.day-opt').forEach(b => {
                b.classList.remove('sel');
                if(t.days && t.days.includes(b.dataset.d)) b.classList.add('sel');
            });
        }
    }
    document.getElementById('radioRepeat').dispatchEvent(new Event('change'));
    document.getElementById('inpType').dispatchEvent(new Event('change'));
    modal.style.display = 'flex';
}

function saveTaskFromModal() {
    const name = document.getElementById('inpName').value;
    if(!name) return;
    const idx = parseInt(document.getElementById('editIndex').value);
    const isOnce = document.getElementById('radioOnce').checked;

    let start, end, days;
    if(isOnce) {
        const d = document.getElementById('inpSpecificDate').value;
        if(!d) { alert("Pick date"); return; }
        start = d; end = d;
        const parts = d.split('-');
        const dateObj = new Date(parts[0], parts[1]-1, parts[2]);
        days = dateObj.toLocaleDateString('en-US', {weekday:'short'});
    } else {
        start = document.getElementById('inpStart').value || DEFAULT_START;
        end = document.getElementById('inpEnd').value || DEFAULT_END;
        const selDays = [];
        document.querySelectorAll('.day-opt.sel').forEach(b => selDays.push(b.dataset.d));
        if(selDays.length === 0) { alert("Pick days"); return; }
        days = selDays.join(',');
    }

    const newTask = {
        name,
        weight: parseInt(document.getElementById('inpWeight').value),
        type: document.getElementById('inpType').value,
        target: document.getElementById('inpTarget').value,
        condition: document.getElementById('inpCondition').value,
        startDate: start, endDate: end, days: days
    };

    if (idx === -1) appConfig.push(newTask);
    else appConfig[idx] = newTask;

    saveData();
    document.getElementById('configModal').style.display = 'none';

    // Refresh View
    if(currentView === 'tasks') renderDayView();
    if(currentView === 'stats') renderCharts();
    if(currentView === 'settings') renderSettingsList();
}

function renderSettingsList() {
    const list = document.getElementById('settingsList');
    list.innerHTML = '';
    appConfig.forEach((t, i) => {
        const div = document.createElement('div');
        div.className = 'task-card';
        div.innerHTML = `<div class="task-info"><span class="task-name">${t.name}</span><span class="task-meta">${(t.startDate===t.endDate) ? "One-time" : "Repeating"}</span></div><div><button class="btn-sec" onclick="openEditModal(${i})">Edit</button></div>`;
        list.appendChild(div);
    });
}
