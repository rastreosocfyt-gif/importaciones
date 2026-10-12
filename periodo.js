// ===== Selector de mes/año =====

// ---------- MONTH CHIP ----------
let menuYear = currentAnio;
function renderMonthMenu(){
  document.getElementById('yearLabel').textContent = menuYear;
  const list = document.getElementById('monthList');
  list.innerHTML = MONTH_NAMES.map((name,i)=>{
    const mes = i+1;
    const isActive = menuYear===currentAnio && mes===currentMes;
    return `<button class="${isActive?'active':''}" data-anio="${menuYear}" data-mes="${mes}">${name.charAt(0).toUpperCase()+name.slice(1)} ${menuYear}</button>`;
  }).join('');
  list.querySelectorAll('button').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      currentAnio = Number(btn.dataset.anio);
      currentMes = Number(btn.dataset.mes);
      document.getElementById('monthLabel').textContent = MONTH_NAMES[currentMes-1] + ' ' + currentAnio;
      document.getElementById('monthMenu').classList.remove('open');
      categoriaFilter = null; proveedorFilter = null;
      savePeriodo();
      loadPolicies();
    });
  });
}
document.getElementById('yearPrev').addEventListener('click', ()=>{ menuYear--; renderMonthMenu(); });
document.getElementById('yearNext').addEventListener('click', ()=>{ menuYear++; renderMonthMenu(); });

document.getElementById('monthChip').addEventListener('click', ()=>{
  menuYear = currentAnio;
  renderMonthMenu();
  document.getElementById('monthMenu').classList.toggle('open');
});
document.addEventListener('click', (e)=>{
  if(!e.target.closest('#monthChip') && !e.target.closest('#monthMenu')){
    document.getElementById('monthMenu').classList.remove('open');
  }
});
