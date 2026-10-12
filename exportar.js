// ===== Exportar a CSV =====

// ---------- TOP ACTIONS ----------
document.getElementById('btnExportar').addEventListener('click', ()=>{
  const headers = ['Categoria','Selectivo','ImpNo','Poliza','Fecha','Proveedores','ValorUSD','Transporte','Estado'];
  const rows = policies.map(p=>[
    p.categoria, p.selectivo, p.impNo, p.poliza, p.fecha,
    p.facturas.map(f=>f.proveedor).filter(Boolean).join(' / '),
    p.facturas.reduce((s,f)=>s+(Number(f.valorUsd)||0),0).toFixed(2),
    p.transporte, p.estado
  ]);
  const csv = [headers, ...rows].map(r=>r.map(v=>`"${(v??'').toString().replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'importaciones_julio_2026.csv'; a.click();
  showToast('CSV exportado');
});
