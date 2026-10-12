// ===== Modal de nueva/editar póliza =====

// ---------- MODAL (Agregar/Editar) ----------
let facturaRows = [];

function openModal(id){
  editingId = id || null;
  const p = id ? policies.find(x=>x.id===id) : null;
  document.getElementById('modalTitle').textContent = p ? `Editar póliza ${p.poliza || p.impNo}` : 'Nueva póliza';

  const set = (elId,val)=> document.getElementById(elId).value = (val===undefined||val===null) ? '' : val;
  set('f_categoria', p?.categoria);
  document.getElementById('f_categoriaColor').value = categoriaColors[p?.categoria] || defaultHexFor(p?.categoria);
  set('f_selectivo', p?.selectivo || '');
  set('f_impNo', p?.impNo);
  set('f_poliza', p?.poliza);
  set('f_fecha', p?.fecha);
  set('f_peso', p?.peso);
  set('f_tc', p?.tc);
  set('f_transporte', p?.transporte);
  set('f_guia', p?.guia);
  set('f_facturaFlete', p?.facturaFlete);
  set('f_costoFlete', p?.costoFlete);
  set('f_seguro', p?.seguro);
  set('f_iva', p?.iva);
  set('f_dai', p?.dai);
  set('f_gastosLocales', p?.gastosLocales);
  set('f_costoAlmacenaje', p?.costoAlmacenaje);
  set('f_fechaRecoleccion', p?.fechaRecoleccion);
  set('f_ingresoAduana', p?.ingresoAduana);
  set('f_salidaAduana', p?.salidaAduana);
  set('f_fechaProrrateo', p?.fechaProrrateo);
  set('f_fechaEntrega', p?.fechaEntrega);
  set('f_estado', p?.estado || 'En tiempo');
  set('f_responsable', p?.responsable && p.responsable!=='En tiempo' ? p.responsable : '');
  set('f_observaciones', p?.observaciones && p.observaciones!=='En tiempo' ? p.observaciones : '');

  facturaRows = p ? JSON.parse(JSON.stringify(p.facturas)) : [{proveedor:'',factura:'',valorOriginal:'',valorUsd:''}];
  renderFacturasEdit();
  recalcTiempos();

  document.getElementById('overlay').classList.add('open');
}

// ---------- Cálculo automático de días en aduana ----------
function diffDays(a,b){
  if(!a || !b) return null;
  const da = new Date(a+'T00:00:00'), db = new Date(b+'T00:00:00');
  if(isNaN(da) || isNaN(db)) return null;
  return Math.round((db-da)/(1000*60*60*24));
}
let computedTiempos = {proveedorAduana:null, diasAduana:null, totalDias:null};
function recalcTiempos(){
  const fechaRecoleccion = document.getElementById('f_fechaRecoleccion').value;
  const ingresoAduana = document.getElementById('f_ingresoAduana').value;
  const salidaAduana = document.getElementById('f_salidaAduana').value;

  const proveedorAduana = diffDays(fechaRecoleccion, ingresoAduana);
  const diasAduana = diffDays(ingresoAduana, salidaAduana);
  const totalDias = (proveedorAduana!==null && diasAduana!==null) ? proveedorAduana + diasAduana : null;

  computedTiempos = {proveedorAduana, diasAduana, totalDias};
  document.getElementById('calc_proveedorAduana').textContent = proveedorAduana===null ? '—' : proveedorAduana + ' días';
  document.getElementById('calc_diasAduana').textContent = diasAduana===null ? '—' : diasAduana + ' días';
  document.getElementById('calc_totalDias').textContent = totalDias===null ? '—' : totalDias + ' días';
}
['f_fechaRecoleccion','f_ingresoAduana','f_salidaAduana'].forEach(id=>{
  document.getElementById(id).addEventListener('input', recalcTiempos);
});

function renderFacturasEdit(){
  const c = document.getElementById('facturasEdit');
  c.innerHTML = facturaRows.map((f,i)=>`
    <div class="factura-edit-row">
      <input placeholder="Proveedor" value="${f.proveedor||''}" data-fi="${i}" data-fk="proveedor">
      <input placeholder="No. factura" value="${f.factura||''}" data-fi="${i}" data-fk="factura">
      <input placeholder="Valor $" type="number" step="0.01" value="${f.valorUsd||''}" data-fi="${i}" data-fk="valorUsd">
      <input placeholder="Valor original" type="number" step="0.01" value="${f.valorOriginal||''}" data-fi="${i}" data-fk="valorOriginal">
      <button class="rm-factura" data-rm="${i}">×</button>
    </div>
  `).join('');
  c.querySelectorAll('input').forEach(inp=>{
    inp.addEventListener('input', ()=>{
      facturaRows[inp.dataset.fi][inp.dataset.fk] = inp.value;
    });
  });
  c.querySelectorAll('[data-rm]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      facturaRows.splice(Number(btn.dataset.rm),1);
      if(facturaRows.length===0) facturaRows.push({proveedor:'',factura:'',valorOriginal:'',valorUsd:''});
      renderFacturasEdit();
    });
  });
}

document.getElementById('f_categoria').addEventListener('input', (e)=>{
  const cat = e.target.value.trim();
  document.getElementById('f_categoriaColor').value = categoriaColors[cat] || defaultHexFor(cat);
});

document.getElementById('addFactura').addEventListener('click', ()=>{
  facturaRows.push({proveedor:'',factura:'',valorOriginal:'',valorUsd:''});
  renderFacturasEdit();
});

function closeModal(){
  document.getElementById('overlay').classList.remove('open');
  editingId = null;
}
document.getElementById('btnCancel').addEventListener('click', closeModal);
document.getElementById('overlay').addEventListener('click', (e)=>{ if(e.target.id==='overlay') closeModal(); });

document.getElementById('btnSave').addEventListener('click', async ()=>{
  const get = elId => document.getElementById(elId).value;
  const data = {
    categoria: get('f_categoria') || null,
    selectivo: get('f_selectivo') || null,
    impNo: get('f_impNo') || String(policies.length+1),
    poliza: get('f_poliza') || 'MENOR',
    fecha: get('f_fecha') || null,
    peso: get('f_peso') || null,
    tc: get('f_tc') || null,
    transporte: get('f_transporte') || null,
    guia: get('f_guia') || null,
    facturaFlete: get('f_facturaFlete') || null,
    costoFlete: get('f_costoFlete') || null,
    seguro: get('f_seguro') || null,
    iva: get('f_iva') || null,
    dai: get('f_dai') || null,
    gastosLocales: get('f_gastosLocales') || null,
    costoAlmacenaje: get('f_costoAlmacenaje') || null,
    fechaRecoleccion: get('f_fechaRecoleccion') || null,
    proveedorAduana: computedTiempos.proveedorAduana,
    ingresoAduana: get('f_ingresoAduana') || null,
    salidaAduana: get('f_salidaAduana') || null,
    diasAduana: computedTiempos.diasAduana,
    totalDias: computedTiempos.totalDias,
    fechaProrrateo: get('f_fechaProrrateo') || null,
    fechaEntrega: get('f_fechaEntrega') || null,
    estado: get('f_estado'),
    responsable: get('f_responsable') || null,
    observaciones: get('f_observaciones') || null,
  };
  const facturasLimpias = facturaRows
    .filter(f=>f.proveedor||f.factura||f.valorUsd||f.valorOriginal)
    .map(f=>({proveedor: f.proveedor||null, factura: f.factura||null, valor_original: f.valorOriginal||null, valor_usd: f.valorUsd||null}));

  if(data.categoria){
    categoriaColors[data.categoria] = document.getElementById('f_categoriaColor').value;
    saveCategoriaColors();
  }

  const saveBtn = document.getElementById('btnSave');
  saveBtn.disabled = true;
  saveBtn.textContent = 'Guardando...';

  try{
    let polizaId = editingId;
    if(editingId){
      const { error: updErr } = await sb.from('polizas').update(toDbRow(data)).eq('id', editingId);
      if(updErr) throw updErr;
      const { error: delErr } = await sb.from('facturas').delete().eq('poliza_id', editingId);
      if(delErr) throw delErr;
    } else {
      const { data: inserted, error: insErr } = await sb.from('polizas').insert(toDbRow(data)).select().single();
      if(insErr) throw insErr;
      polizaId = inserted.id;
    }
    if(facturasLimpias.length){
      const { error: fErr } = await sb.from('facturas').insert(facturasLimpias.map(f=>({...f, poliza_id: polizaId})));
      if(fErr) throw fErr;
    }
    closeModal();
    showToast(editingId ? 'Póliza actualizada' : 'Póliza agregada');
    await loadPolicies();
  } catch(err){
    console.error(err);
    showToast('Error al guardar: ' + err.message);
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Guardar póliza';
  }
});

document.getElementById('btnAdd').addEventListener('click', ()=> openModal(null));
