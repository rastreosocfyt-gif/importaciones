// ===== Reporte "Tiempos de importaciones mensuales" =====

const responsableStore = createColorStore('oe_responsable_colors');

function renderTiempos(){
  // Mismo orden que la tabla principal
  const lista = getOrderedPolicies();
  const dash = v => (v===null || v===undefined || v==='') ? '—' : escHtml(v);

  document.getElementById('tiemposPeriodo').textContent =
    `${MONTH_NAMES[currentMes-1]} ${currentAnio} · ${lista.length} ${lista.length===1 ? 'póliza' : 'pólizas'}`;

  // ---- Tabla ----
  const tbody = document.getElementById('tiemposTableBody');
  tbody.innerHTML = lista.length ? lista.map(p=>`
    <tr>
      <td>${dash(p.impNo)}</td>
      <td>${escHtml(proveedoresDe(p))}</td>
      <td>${fmtDate(p.fechaRecoleccion)}</td>
      <td>${fmtDate(p.ingresoAduana)}</td>
      <td>${fmtDate(p.salidaAduana)}</td>
      <td>${dash(p.diasAduana)}</td>
      <td>${dash(p.totalDias)}</td>
    </tr>`).join('')
    : `<tr><td colspan="7" style="text-align:center; color:var(--ink-soft);">Sin datos</td></tr>`;

  // ---- Gráfica: % por responsable (campo "Responsable" de la tabla principal) ----
  const responsableDe = p => (p.responsable && String(p.responsable).trim()) ? String(p.responsable).trim() : 'Sin asignar';
  renderPieSection({
    pieEl: document.getElementById('tiemposPie'),
    legendEl: document.getElementById('tiemposLegend'),
    entries: countEntries(lista.map(responsableDe)),
    total: lista.length,
    store: responsableStore
  });
}

setupOverlay('overlayTiempos', 'btnTiempos', 'btnCloseTiempos', renderTiempos);
