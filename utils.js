// ===== Utilidades: formato de números/fechas, selector simple y avisos (toast) =====

function fmtMoney(v){
  if(v === null || v === undefined || v === '') return '—';
  const n = Number(v);
  if(isNaN(n)) return v;
  return n.toLocaleString('en-US',{minimumFractionDigits:2, maximumFractionDigits:2});
}
function fmtQ(v){
  if(v === null || v === undefined || v === '') return '—';
  const n = Number(v);
  if(isNaN(n)) return v;
  return 'Q ' + n.toLocaleString('en-US',{minimumFractionDigits:2, maximumFractionDigits:2});
}
function fmtUsd(v){
  if(v === null || v === undefined || v === '') return '—';
  const n = Number(v);
  if(isNaN(n)) return v;
  return '$ ' + n.toLocaleString('en-US',{minimumFractionDigits:2, maximumFractionDigits:2});
}
function fmtPeso(v){
  if(v === null || v === undefined || v === '') return '—';
  const cleaned = String(v).trim().replace(/\s*kgs?\.?\s*$/i, '');
  if(cleaned === '') return '—';
  return cleaned + ' kgs';
}
function fmtDate(d){
  if(!d) return '—';
  const dt = new Date(d+'T00:00:00');
  if(isNaN(dt)) return d;
  return dt.toLocaleDateString('es-GT',{day:'2-digit',month:'2-digit',year:'numeric'});
}
function esc(v){ return (v===null||v===undefined||v==='') ? '' : String(v); }

function promptSelect(title, options){
  const msg = title + ':\n' + options.map((o,i)=>`${i}. ${o}`).join('\n');
  const idx = prompt(msg, '0');
  if(idx===null) return null;
  const n = Number(idx);
  return options[n] !== undefined ? options[n] : null;
}

// ---------- TOAST ----------
let toastTimer;
function showToast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> t.classList.remove('show'), 5000);
}

// Escapado para insertar texto libre dentro de HTML / atributos
function escHtml(v){
  return String(v===null||v===undefined ? '' : v)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
