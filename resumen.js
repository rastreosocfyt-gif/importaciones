// ===== Reporte "Resumen" (transporte y flete) =====

// Mantiene la clave original para conservar los colores ya elegidos por el usuario
const transporteStore = createColorStore('oe_transporte_colors');

function renderResumen(){
  // Mismo orden que la tabla principal, y solo pólizas con selectivo asignado
  const lista = getOrderedPolicies().filter(p=>p.selectivo);
  const transporteDe = p => (p.transporte && p.transporte.trim()) ? p.transporte.trim() : 'Sin definir';

  // ---- Tabla: una fila por póliza ----
  const tbody = document.getElementById('resumenTableBody');
  tbody.innerHTML = lista.length ? lista.map(p=>`
    <tr>
      <td>${escHtml(p.impNo)||'—'}</td>
      <td>${escHtml(p.poliza || 'MENOR')}</td>
      <td>${escHtml(proveedoresDe(p))}</td>
      <td>${escHtml(transporteDe(p))}</td>
      <td>${fmtQ(p.costoFlete)}</td>
    </tr>`).join('')
    : `<tr><td colspan="5" style="text-align:center; color:var(--ink-soft);">Sin datos</td></tr>`;

  // ---- Gráfica: % de uso por transportista + flete total por transportista ----
  const fleteByTransporte = {};
  lista.forEach(p=>{
    const t = transporteDe(p);
    fleteByTransporte[t] = (fleteByTransporte[t]||0) + (Number(p.costoFlete)||0);
  });
  const entries = countEntries(lista.map(transporteDe));
  renderPieSection({
    pieEl: document.getElementById('resumenPie'),
    legendEl: document.getElementById('resumenLegend'),
    entries,
    total: lista.length,
    store: transporteStore,
    extra: name => `<span class="resumen-legend-flete">Flete: ${fmtQ(fleteByTransporte[name]||0)}</span>`
  });
}

setupOverlay('overlayResumen', 'btnResumen', 'btnCloseResumen', renderResumen);
