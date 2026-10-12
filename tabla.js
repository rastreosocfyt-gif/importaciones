// ===== Tabla principal: columnas, encabezado, filas, orden y acciones por fila =====

let editingId = null;
let categoriaFilter = null;
let proveedorFilter = null;
const SORT_KEY = 'oe_sort_impno';
let sortImpNoDir = null; // null | 'asc' | 'desc'
try{ sortImpNoDir = localStorage.getItem(SORT_KEY) || null; }catch(e){ sortImpNoDir = null; }
function saveSortImpNo(){
  try{ localStorage.setItem(SORT_KEY, sortImpNoDir || ''); }catch(e){}
}

// Definición de todas las columnas del reporte original de Excel, en orden.
// sticky: 'left1' | 'left2' | 'right' | null
const COLUMNS = [
  {key:'categoria',   label:'Categoría',        sticky:'left1', hd:'hd-categoria', width:150},
  {key:'impNo',       label:'No.',              sticky:'left2', width:70},
  {key:'poliza',      label:'Póliza',           sticky:'left3', hd:'hd-poliza',    width:150},
  {key:'selectivo',   label:'Selectivo',        width:100},
  {key:'proveedor',   label:'Proveedor',        hd:'hd-proveedor', width:170, perInvoice:true},
  {key:'factura',     label:'Factura',          width:130, perInvoice:true},
  {key:'peso',        label:'Peso',             width:100},
  {key:'tc',          label:'T/C',              width:90},
  {key:'valorUsd',    label:'Valor $',          hd:'hd-valor', width:120, perInvoice:true},
  {key:'valorOriginal', label:'Valor original', width:120, perInvoice:true},
  {key:'transporte',  label:'Transporte',       width:100},
  {key:'guia',        label:'Guía',             width:140},
  {key:'facturaFlete', label:'Factura flete',   width:140},
  {key:'costoFlete',  label:'Costo flete',      width:110},
  {key:'seguro',      label:'Seguro',           width:100},
  {key:'iva',         label:'IVA',              width:100},
  {key:'dai',         label:'DAI',              width:100},
  {key:'gastosLocales', label:'Gastos locales', width:120},
  {key:'fechaRecoleccion', label:'Fecha recolección', width:130},
  {key:'proveedorAduana', label:'Prov.→aduana (días)', width:130},
  {key:'ingresoAduana', label:'Ingreso aduana', width:120},
  {key:'salidaAduana', label:'Salida aduana',   width:120},
  {key:'diasAduana',  label:'Días en aduana',   width:110},
  {key:'totalDias',   label:'Total días',       width:100},
  {key:'fechaProrrateo', label:'Fecha prorrateo', width:130},
  {key:'fechaEntrega', label:'Fecha entrega',   width:120},
  {key:'costoAlmacenaje', label:'Costo almacenaje', width:130},
  {key:'observaciones', label:'Observaciones',  width:220},
  {key:'responsable', label:'Responsable',      width:140},
  {key:'acciones',    label:'Acciones',         sticky:'right', hd:'hd-acciones', width:90},
];

function render(){
  renderStats();
  renderHead();
  renderRows();
  renderCatList();
  renderResponsableList();
}

function renderHead(){
  const tr = document.getElementById('headRow');
  tr.innerHTML = COLUMNS.map(col=>{
    const stickyClass = stickyClassFor(col);
    const clickable = col.key==='categoria' ? ' sortable" id="filterCategoria"'
      : col.key==='proveedor' ? ' sortable" id="filterProveedor"'
      : col.key==='impNo' ? ' sortable" id="sortImpNo"'
      : '"';
    const arrow = (col.key==='categoria'||col.key==='proveedor')
      ? ' <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M6 9l6 6 6-6"/></svg>'
      : col.key==='impNo'
      ? ` <span class="sort-indicator ${sortImpNoDir?'active':''}">${sortImpNoDir==='asc' ? '▲' : sortImpNoDir==='desc' ? '▼' : '⇅'}</span>`
      : '';
    return `<th style="width:${col.width}px; min-width:${col.width}px;" class="${stickyClass} ${col.hd||''} ${clickable}>${col.label}${arrow}</th>`;
  }).join('');

  document.getElementById('filterCategoria')?.addEventListener('click', ()=>{
    const cats = [...new Set(policies.map(p=>p.categoria).filter(Boolean))];
    const choice = promptSelect('Filtrar por categoría', ['Todas', ...cats]);
    if(choice===null) return;
    categoriaFilter = choice==='Todas' ? null : choice;
    renderRows();
  });
  document.getElementById('filterProveedor')?.addEventListener('click', ()=>{
    const provs = [...new Set(policies.flatMap(p=>p.facturas.map(f=>f.proveedor)).filter(Boolean))];
    const choice = promptSelect('Filtrar por proveedor', ['Todos', ...provs]);
    if(choice===null) return;
    proveedorFilter = choice==='Todos' ? null : choice;
    renderRows();
  });
  document.getElementById('sortImpNo')?.addEventListener('click', ()=>{
    sortImpNoDir = sortImpNoDir===null ? 'asc' : sortImpNoDir==='asc' ? 'desc' : null;
    saveSortImpNo();
    renderHead();
    renderRows();
  });
}

function renderStats(){
  document.getElementById('statTotal').textContent = policies.filter(p=>p.selectivo==='Verde' || p.selectivo==='Rojo').length;
  document.getElementById('statLentes').textContent = policies.filter(p=>!p.selectivo).length;
  document.getElementById('statVerde').textContent = policies.filter(p=>p.selectivo==='Verde').length;
  document.getElementById('statRojo').textContent = policies.filter(p=>p.selectivo==='Rojo').length;
  document.getElementById('statEnTiempo').textContent = policies.filter(p=>p.estado==='En tiempo').length;
  document.getElementById('statFueraTiempo').textContent = policies.filter(p=>p.estado==='Fuera de tiempo').length;
  document.getElementById('footerCount').textContent = policies.length + ' pólizas';
}

function renderCatList(){
  const dl = document.getElementById('catList');
  const cats = [...new Set(policies.map(p=>p.categoria).filter(Boolean))];
  dl.innerHTML = cats.map(c=>`<option value="${c}">`).join('');
}

function renderResponsableList(){
  const dl = document.getElementById('responsableList');
  if(!dl) return;
  const defaults = ['Proveedor','Transporte','Comercio Exterior','Aduana'];
  const usados = policies.map(p=>p.responsable).filter(Boolean);
  const opts = [...new Set([...defaults, ...usados])];
  dl.innerHTML = opts.map(r=>`<option value="${r}">`).join('');
}

function sharedCellHtml(col, p){
  switch(col.key){
    case 'categoria':{
      const c = colorFor(p.categoria);
      return `<span class="badge" style="background:${c.bg};color:${c.fg}">${esc(p.categoria)||'Sin categoría'}</span>`;
    }
    case 'impNo':
      return esc(p.impNo)||'—';
    case 'poliza':
      return `<div class="poliza-no">${esc(p.poliza)||'—'}</div><div class="poliza-date">${fmtDate(p.fecha)}</div>`;
    case 'selectivo':{
      const cls = p.selectivo==='Verde' ? 'verde' : p.selectivo==='Rojo' ? 'rojo' : 'none';
      const label = p.selectivo || 'Sin asignar';
      return `<span class="selectivo-swatch" data-toggle-selectivo="${p.id}" title="Clic para cambiar">
        <span class="selectivo-box ${cls}"></span><span class="selectivo-text">${label}</span>
      </span>`;
    }
    case 'peso': return fmtPeso(p.peso);
    case 'tc': return fmtQ(p.tc);
    case 'transporte': return esc(p.transporte)||'—';
    case 'guia': return esc(p.guia)||'—';
    case 'facturaFlete': return esc(p.facturaFlete)||'—';
    case 'costoFlete': return fmtQ(p.costoFlete);
    case 'seguro': return fmtUsd(p.seguro);
    case 'iva': return fmtQ(p.iva);
    case 'dai': return fmtQ(p.dai);
    case 'gastosLocales': return fmtQ(p.gastosLocales);
    case 'fechaRecoleccion': return fmtDate(p.fechaRecoleccion);
    case 'proveedorAduana': return esc(p.proveedorAduana)||'—';
    case 'ingresoAduana': return fmtDate(p.ingresoAduana);
    case 'salidaAduana': return fmtDate(p.salidaAduana);
    case 'diasAduana': return esc(p.diasAduana)||'—';
    case 'totalDias': return esc(p.totalDias)||'—';
    case 'fechaProrrateo': return fmtDate(p.fechaProrrateo);
    case 'fechaEntrega': return fmtDate(p.fechaEntrega);
    case 'costoAlmacenaje': return fmtQ(p.costoAlmacenaje);
    case 'observaciones': return `<span class="obs-text" title="${esc(p.observaciones)}">${esc(p.observaciones)||'—'}</span>`;
    case 'responsable': return esc(p.responsable)||'—';
    case 'acciones':
      return `
        <div class="row-actions">
          <button class="icon-btn" data-edit="${p.id}" title="Editar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
          </button>
          <button class="icon-btn danger" data-delete="${p.id}" title="Eliminar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6"/></svg>
          </button>
        </div>`;
    default: return '';
  }
}

function perInvoiceCellHtml(col, factura){
  switch(col.key){
    case 'proveedor': return esc(factura.proveedor) || '—';
    case 'factura': return esc(factura.factura) || '—';
    case 'valorOriginal': return fmtMoney(factura.valorOriginal);
    case 'valorUsd': return `<span class="valor">${fmtMoney(factura.valorUsd)}</span>`;
    default: return '';
  }
}

function stickyClassFor(col){
  return col.sticky==='left1' ? 'sticky-left-1' : col.sticky==='left2' ? 'sticky-left-2' : col.sticky==='left3' ? 'sticky-left-3' : col.sticky==='right' ? 'sticky-right' : '';
}

// Devuelve las pólizas en el mismo orden que se usa en la tabla principal
// (respeta el ordenamiento por "No." si está activo; si no, el orden de carga).
function getOrderedPolicies(){
  let list = policies;
  if(sortImpNoDir){
    list = [...list].sort((a,b)=>{
      const av = Number(a.impNo), bv = Number(b.impNo);
      const aValid = a.impNo!==null && a.impNo!=='' && !isNaN(av);
      const bValid = b.impNo!==null && b.impNo!=='' && !isNaN(bv);
      if(!aValid && !bValid) return 0;
      if(!aValid) return 1;
      if(!bValid) return -1;
      return sortImpNoDir==='asc' ? av-bv : bv-av;
    });
  }
  return list;
}

function renderRows(){
  const container = document.getElementById('rows');
  let list = getOrderedPolicies();
  if(categoriaFilter) list = list.filter(p=>p.categoria===categoriaFilter);
  if(proveedorFilter) list = list.filter(p=>p.facturas.some(f=>f.proveedor===proveedorFilter));

  let html = '';
  list.forEach(p=>{
    const facturas = p.facturas.length ? p.facturas : [{proveedor:null,factura:null,valorOriginal:null,valorUsd:null}];
    const rowspan = facturas.length;
    facturas.forEach((f,i)=>{
      const isMain = i===0;
      html += `<tr data-id="${p.id}" class="${isMain?'':'sub-row'}">`;
      html += COLUMNS.map(col=>{
        const stickyClass = stickyClassFor(col);
        if(col.perInvoice){
          return `<td class="${stickyClass}">${perInvoiceCellHtml(col,f)}</td>`;
        }
        // columna compartida por póliza: se combina (rowspan) en una sola celda
        if(!isMain) return '';
        return `<td class="${stickyClass}" rowspan="${rowspan}">${sharedCellHtml(col,p)}</td>`;
      }).join('');
      html += `</tr>`;
    });
  });
  container.innerHTML = html;

  if(list.length === 0){
    container.innerHTML = `<tr><td colspan="${COLUMNS.length}" style="text-align:center; padding:40px; color:var(--ink-soft);">No hay pólizas que coincidan con este filtro.</td></tr>`;
  }
}

document.getElementById('rows').addEventListener('click', (e)=>{
  const editBtn = e.target.closest('[data-edit]');
  const delBtn = e.target.closest('[data-delete]');
  const selBtn = e.target.closest('[data-toggle-selectivo]');
  if(editBtn) openModal(editBtn.dataset.edit);
  if(delBtn) deletePolicy(delBtn.dataset.delete);
  if(selBtn) cycleSelectivo(selBtn.dataset.toggleSelectivo);
});

async function cycleSelectivo(id){
  const p = policies.find(x=>x.id===id);
  if(!p) return;
  const nuevo = p.selectivo === 'Verde' ? 'Rojo' : p.selectivo === 'Rojo' ? null : 'Verde';
  p.selectivo = nuevo; // respuesta visual inmediata
  render();
  const { error } = await sb.from('polizas').update({selectivo: nuevo}).eq('id', id);
  if(error){ showToast('Error al guardar: ' + error.message); loadPolicies(); }
}

async function deletePolicy(id){
  const p = policies.find(x=>x.id===id);
  if(!p) return;
  if(!confirm(`¿Eliminar la póliza ${p.poliza || p.impNo}? Esta acción no se puede deshacer.`)) return;
  const { error } = await sb.from('polizas').delete().eq('id', id);
  if(error){ showToast('Error al eliminar: ' + error.message); return; }
  policies = policies.filter(x=>x.id!==id);
  render();
  showToast('Póliza eliminada');
}
