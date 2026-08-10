const KEY='focus-planner-v2';
let todos=JSON.parse(localStorage.getItem(KEY)||'[]');
let filter='all';
const $=s=>document.querySelector(s);
const input=$('#todoInput');
const list=$('#todoList');
const priorityNames={high:'🔴 Tinggi',medium:'🟡 Sederhana',low:'🟢 Rendah'};
const planNames={must:'🔥 MUST DO',should:'⭐ SHOULD DO',could:'💡 COULD DO'};
const durationText=m=>m>=60?`${m/60} jam`: `${m} min`;
function id(){return crypto.randomUUID?crypto.randomUUID():Date.now()+Math.random()}
function save(){localStorage.setItem(KEY,JSON.stringify(todos));render()}
function add(text){text=text.trim();if(!text)return;todos.unshift({id:id(),text,done:false,category:'Lain-lain',priority:'medium',plan:'should',deadline:'',duration:30,start:'',subtasks:[]});save();input.value='';input.focus();openEditor(todos[0].id)}
function visible(){return todos.filter(t=>filter==='all'||(filter==='active'&&!t.done)||(filter==='completed'&&t.done))}
function escapeHtml(s=''){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function deadlineLabel(v){if(!v)return 'Tiada deadline';const d=new Date(v);return Number.isNaN(d.getTime())?'Tiada deadline':d.toLocaleString('ms-MY',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}
function render(){
  const items=visible();
  list.innerHTML=items.length?items.map(t=>`<article class="todo ${t.done?'done':''}">
    <button class="check" data-id="${t.id}" aria-label="Tanda ${t.done?'belum selesai':'selesai'}"></button>
    <div class="task-wrap"><div class="task">${escapeHtml(t.text)}</div><div class="meta"><span class="chip ${t.priority}">${priorityNames[t.priority]}</span><span class="chip">${escapeHtml(t.category)}</span><span class="chip">${durationText(Number(t.duration)||30)}</span><span class="chip">${deadlineLabel(t.deadline)}</span>${t.subtasks?.length?`<span class="chip subcount">${t.subtasks.filter(s=>s.done).length}/${t.subtasks.length} subtugas</span>`:''}</div></div>
    <button class="edit-button" data-edit="${t.id}">Edit</button><button class="delete" data-delete="${t.id}" aria-label="Padam tugasan">×</button>
  </article>`).join(''):`<div class="empty">${filter==='completed'?'Belum ada tugasan selesai.':'Tiada tugasan — tambah satu di atas.'}</div>`;
  const remaining=todos.filter(t=>!t.done).length, done=todos.filter(t=>t.done).length, pct=todos.length?Math.round(done/todos.length*100):0;
  $('#remaining').textContent=remaining;$('#completedCount').textContent=done;$('#progressText').textContent=pct+'%';$('#progressLabel').textContent=`${pct}% complete`;$('#progressBar').style.width=pct+'%';
  renderGroups();renderSchedule();
}
function renderGroups(){const groups=['must','should','could'];$('#priorityGroups').innerHTML=groups.map(p=>{const items=todos.filter(t=>t.plan===p);return `<div class="priority-group"><div class="group-title ${p}">${planNames[p]} <span>(${items.length})</span></div>${items.length?items.slice(0,4).map(t=>`<div class="mini-task ${t.done?'done':''}"><span>${t.done?'✓':'○'}</span><span>${escapeHtml(t.text)}</span></div>`).join(''):'<div class="mini-task"><span>—</span><span>Tiada tugasan.</span></div>'}</div>`}).join('')}
function renderSchedule(){let planned=todos.filter(t=>!t.done&&t.start).sort((a,b)=>a.start.localeCompare(b.start));let slots=planned.map(t=>`<div class="slot"><div class="slot-time">${t.start}</div><div class="slot-name"><strong>${escapeHtml(t.text)}</strong><br><small>${durationText(Number(t.duration)||30)} · ${priorityNames[t.priority]}</small></div></div>`);if(!slots.length){slots=[['08:00','Deep work / MUST DO'],['10:00','Buffer + rehat'],['10:30','Sambung tugasan penting'],['12:30','Makan tengah hari'],['14:00','Should DO / komunikasi'],['15:30','Buffer + urusan kecil'],['16:30','Daily wrap-up']].map(([time,name],i)=>`<div class="slot ${i===1||i===2||i===5?'buffer':''}"><div class="slot-time">${time}</div><div class="slot-name">${name}</div></div>`) }$('#schedule').innerHTML=slots.join('')}
function openEditor(taskId){const t=todos.find(x=>x.id===taskId);if(!t)return;$('#editId').value=t.id;$('#editText').value=t.text;$('#editCategory').value=t.category||'Lain-lain';$('#editPriority').value=t.priority||'medium';$('#editDeadline').value=t.deadline||'';$('#editDuration').value=t.duration||30;$('#editStart').value=t.start||'';$('#editPlan').value=t.plan||'should';$('#editSubtasks').value=(t.subtasks||[]).map(s=>s.text).join('\n');$('#editDialog').showModal()}
function closeDialog(){if($('#editDialog').open)$('#editDialog').close()}
$('#todoForm').addEventListener('submit',e=>{e.preventDefault();add(input.value)});
list.addEventListener('click',e=>{const id=e.target.dataset.id||e.target.dataset.delete||e.target.dataset.edit;if(!id)return;if(e.target.dataset.delete){todos=todos.filter(x=>x.id!==id);save()}else if(e.target.dataset.edit){openEditor(id)}else{const t=todos.find(x=>x.id===id);if(t){t.done=!t.done;save()}}});
document.querySelectorAll('.filter').forEach(b=>b.addEventListener('click',()=>{document.querySelector('.filter.active').classList.remove('active');b.classList.add('active');filter=b.dataset.filter;render()}));
$('#clearCompleted').addEventListener('click',()=>{todos=todos.filter(t=>!t.done);save()});
$('#editForm').addEventListener('submit',e=>{e.preventDefault();const t=todos.find(x=>x.id===$('#editId').value);if(!t)return;t.text=$('#editText').value.trim();t.category=$('#editCategory').value;t.priority=$('#editPriority').value;t.deadline=$('#editDeadline').value;t.duration=Number($('#editDuration').value);t.start=$('#editStart').value;t.plan=$('#editPlan').value;t.subtasks=$('#editSubtasks').value.split('\n').map(s=>s.trim()).filter(Boolean).map(text=>({text,done:false}));closeDialog();save()});
$('#deleteFromDialog').addEventListener('click',()=>{const tid=$('#editId').value;todos=todos.filter(t=>t.id!==tid);closeDialog();save()});
$('#reviewBtn').addEventListener('click',()=>{const done=todos.filter(t=>t.done),pending=todos.filter(t=>!t.done),moved=pending.filter(t=>t.plan!=='must').slice(0,3);$('#reviewPanel').classList.toggle('hidden');$('#reviewPanel').innerHTML=`<span class="section-kicker">DAILY REVIEW</span><h3>Ringkasan hari ini</h3><div class="review-grid"><div><h4>✅ Selesai</h4><p>${done.length?done.map(t=>escapeHtml(t.text)).join(' · '):'Belum ada tugasan selesai.'}</p></div><div><h4>⏳ Belum selesai</h4><p>${pending.length?pending.map(t=>escapeHtml(t.text)).join(' · '):'Semua selesai.'}</p></div><div><h4>➡️ Pindah ke esok</h4><p>${moved.length?moved.map(t=>escapeHtml(t.text)).join(' · '):'Tiada yang perlu dipindahkan.'}</p></div><div><h4>🏆 Pencapaian utama</h4><p>${done.length?`Anda menyelesaikan ${done.length} tugasan.`:'Mulakan dengan satu MUST DO yang paling penting.'}</p></div></div>`});
const now=new Date();$('#dayName').textContent=now.toLocaleDateString('ms-MY',{weekday:'long'}).toUpperCase();$('#today').textContent=now.toLocaleDateString('ms-MY',{day:'2-digit',month:'long'}).toUpperCase();render();
