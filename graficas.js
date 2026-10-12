// ===== Gráfica circular reutilizable (Resumen y Tiempos) =====

const PIE_PALETTE = ['#1e40af','#6d28d9','#c2410c','#047857','#be185d','#b45309','#0369a1','#b91c1c','#92400e','#0e7490','#63b7c1'];

// Guarda en localStorage el color elegido para cada elemento de una gráfica.
function createColorStore(storageKey){
  let colors = {};
  try{ colors = JSON.parse(localStorage.getItem(storageKey) || '{}'); }catch(e){ colors = {}; }
  return {
    get(name, idx){ return colors[name] || PIE_PALETTE[idx % PIE_PALETTE.length]; },
    set(name, color){
      colors[name] = color;
      try{ localStorage.setItem(storageKey, JSON.stringify(colors)); }catch(e){}
    }
  };
}

// Convierte una lista de valores en [[nombre, cantidad], ...] ordenada de mayor a menor.
function countEntries(values){
  const counts = {};
  values.forEach(v=>{ counts[v] = (counts[v]||0) + 1; });
  return Object.entries(counts).sort((a,b)=>b[1]-a[1]);
}

// Dibuja solo el círculo y sus etiquetas internas (porcentaje y cantidad de veces).
// No toca la leyenda, para no cerrar el selector de color mientras se elige.
function renderPieGraphic(pieEl, entries, total, store){
  if(total===0){
    pieEl.style.background = 'var(--gray-bg)';
    pieEl.innerHTML = '';
    return;
  }
  let cursor = 0;
  const slices = [];
  let labels = '';
  entries.forEach(([name,count],i)=>{
    const pct = count/total*100;
    const start = cursor, end = cursor + pct;
    cursor = end;
    slices.push(`${store.get(name,i)} ${start}% ${end}%`);

    // posición de la etiqueta: punto medio de la partición (ángulo medido desde arriba, en sentido horario)
    const mid = (start + end) / 2 / 100 * 2 * Math.PI;
    const small = pct < 8;
    const r = entries.length === 1 ? 0 : (small ? 0.8 : 0.58);
    const x = 50 + r * 50 * Math.sin(mid);
    const y = 50 - r * 50 * Math.cos(mid);
    const veces = `${count} ${count===1 ? 'vez' : 'veces'}`;
    labels += small
      ? `<div class="pie-label small" style="left:${x}%;top:${y}%">${Math.round(pct)}% · ${veces}</div>`
      : `<div class="pie-label" style="left:${x}%;top:${y}%"><b>${Math.round(pct)}%</b><span>${veces}</span></div>`;
  });
  pieEl.style.background = `conic-gradient(${slices.join(', ')})`;
  pieEl.innerHTML = labels;
}

// Dibuja gráfica + leyenda (con selector de color por elemento).
// extra(name) puede devolver una línea adicional para la leyenda (ej. flete total).
function renderPieSection({pieEl, legendEl, entries, total, store, extra}){
  renderPieGraphic(pieEl, entries, total, store);
  if(total===0){
    legendEl.innerHTML = '<div style="color:var(--ink-soft); font-size:12.5px; text-align:center;">Sin datos</div>';
    return;
  }
  legendEl.innerHTML = entries.map(([name,count],i)=>{
    const pct = Math.round(count/total*100);
    return `
      <div class="resumen-legend-item">
        <input type="color" class="resumen-color-input" data-name="${escHtml(name)}" value="${store.get(name,i)}" title="Cambiar color de ${escHtml(name)}">
        <div class="resumen-legend-text">
          <span class="resumen-legend-name">${escHtml(name)}</span>
          ${extra ? extra(name) : ''}
        </div>
        <span class="resumen-legend-pct">${count} · ${pct}%</span>
      </div>`;
  }).join('');

  legendEl.querySelectorAll('.resumen-color-input').forEach(inp=>{
    inp.addEventListener('input', (e)=>{
      store.set(e.target.dataset.name, e.target.value);
      renderPieGraphic(pieEl, entries, total, store);
    });
  });
}

// Proveedores distintos de una póliza, separados por coma ("Satisloh, DAC")
function proveedoresDe(p){
  const lista = [...new Set((p.facturas || []).map(f=>f.proveedor).filter(Boolean))];
  return lista.length ? lista.join(', ') : '—';
}

function setupOverlay(overlayId, openBtnId, closeBtnId, onOpen){
  const overlay = document.getElementById(overlayId);
  document.getElementById(openBtnId).addEventListener('click', ()=>{ onOpen(); overlay.classList.add('open'); });
  document.getElementById(closeBtnId).addEventListener('click', ()=> overlay.classList.remove('open'));
  overlay.addEventListener('click', (e)=>{ if(e.target.id===overlayId) overlay.classList.remove('open'); });
}
