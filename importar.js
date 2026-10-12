// ===== Importar pólizas desde Excel =====

// ---------- IMPORTAR DESDE EXCEL ----------
function normalizeHeader(h){
  return String(h||'')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/\s+/g,' ')
    .trim();
}

// Cada columna del Excel se asigna a la primera regla (en orden) que coincida y que
// todavía no haya sido usada por otra columna. El orden importa: las reglas más
// específicas (ej. "factura flete") van antes que las genéricas (ej. "factura").
const EXCEL_HEADER_RULES = [
  {key:'selectivo',      test:h=>h==='selectivo'},
  {key:'categoria',      test:h=>h.includes('clasificacion')||h.includes('categoria')},
  {key:'peso',           test:h=>h==='peso'},
  {key:'tc',             test:h=>/^t\/?c$/.test(h)},
  {key:'impNo',          test:h=>h.includes('imp') && h.includes('no')},
  {key:'poliza',         test:h=>h.includes('poliza')},
  {key:'fecha',          test:h=>h==='fecha'},
  {key:'proveedorAduana',test:h=>h.includes('proveedor') && h.includes('aduana')},
  {key:'proveedor',      test:h=>h.includes('proveedor')},
  {key:'facturaFlete',   test:h=>h.includes('factura') && h.includes('flete')},
  {key:'factura',        test:h=>h.includes('factura')},
  {key:'valorOriginal',  test:h=>h.includes('valor') && h.includes('original')},
  {key:'valorUsd',       test:h=>h.includes('valor') && !h.includes('original')},
  {key:'transporte',     test:h=>h==='transporte'},
  {key:'guia',           test:h=>h.includes('guia')},
  {key:'costoFlete',     test:h=>h.includes('costo') && h.includes('flete')},
  {key:'seguro',         test:h=>h.includes('seguro')},
  {key:'iva',            test:h=>h==='iva'},
  {key:'dai',            test:h=>h==='dai'},
  {key:'gastosLocales',  test:h=>h.includes('gastos') && h.includes('local')},
  {key:'fechaRecoleccion',test:h=>h.includes('recolec')},
  {key:'ingresoAduana',  test:h=>h.includes('ingreso') && h.includes('aduana')},
  {key:'salidaAduana',   test:h=>h.includes('salida') && h.includes('aduana')},
  {key:'diasAduana',     test:h=>h.includes('dias') && h.includes('aduana')},
  {key:'totalDias',      test:h=>h.includes('total') && h.includes('dia')},
  {key:'fechaProrrateo', test:h=>h.includes('prorrateo')},
  {key:'fechaEntrega',   test:h=>h.includes('entrega')},
  {key:'costoAlmacenaje',test:h=>h.includes('almacenaje')},
  {key:'observaciones',  test:h=>h.includes('observ')},
  {key:'responsable',    test:h=>h.includes('responsable')},
];

function findHeaderRowIndex(aoa){
  for(let i=0;i<Math.min(aoa.length,20);i++){
    const row = (aoa[i]||[]).map(normalizeHeader);
    const hasPoliza = row.some(c=>c.includes('poliza'));
    const hasFactura = row.some(c=>c.includes('factura') && !c.includes('flete'));
    const hasProveedor = row.some(c=>c.includes('proveedor'));
    if(hasPoliza && hasFactura && hasProveedor) return i;
  }
  return -1;
}

function mapExcelColumns(headerRow){
  const map = {};
  (headerRow||[]).forEach((cell,idx)=>{
    const h = normalizeHeader(cell);
    if(!h) return;
    for(const rule of EXCEL_HEADER_RULES){
      if(!(rule.key in map) && rule.test(h)){ map[rule.key] = idx; break; }
    }
  });
  return map;
}

function excelNumber(v){
  if(v===null || v===undefined || v==='') return null;
  if(typeof v === 'number') return isNaN(v) ? null : v;
  let s = String(v).trim();
  if(s==='' || s==='-') return null;
  if(/^-?\d{1,3}(\.\d{3})*,\d+$/.test(s)) s = s.replace(/\./g,'').replace(',', '.');
  else if(/^-?\d+,\d+$/.test(s)) s = s.replace(',', '.');
  s = s.replace(/[^0-9.\-]/g,'');
  const n = Number(s);
  return isNaN(n) || s==='' ? null : n;
}
function excelText(v){
  if(v===null||v===undefined) return null;
  const s = String(v).trim();
  return (s==='' || s==='-') ? null : s;
}
function excelPeso(v){
  const s = excelText(v);
  if(!s) return null;
  const cleaned = s.replace(/\s*kgs?\.?\s*$/i,'');
  return cleaned || null;
}
function excelImpNo(v){
  if(v===null||v===undefined||v==='') return null;
  const n = Number(v);
  return isNaN(n) ? String(v).trim() : String(Math.trunc(n));
}
function excelDateStr(v){
  if(v===null||v===undefined||v==='') return null;
  if(v instanceof Date && !isNaN(v)){
    const y=v.getFullYear(), m=String(v.getMonth()+1).padStart(2,'0'), d=String(v.getDate()).padStart(2,'0');
    return `${y}-${m}-${d}`;
  }
  const s = String(v).trim();
  const m1 = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if(m1) return `${m1[3]}-${m1[2].padStart(2,'0')}-${m1[1].padStart(2,'0')}`;
  return null;
}

// Agrupa las filas del Excel en pólizas: una fila "nueva" (con No. o Póliza) inicia
// un grupo; las filas siguientes sin esos datos son facturas adicionales de esa misma póliza.
function parseExcelPolicies(dataRows, colMap){
  const get = (row,key) => key in colMap ? row[colMap[key]] : undefined;
  const out = [];
  let current = null;
  let lastProveedor = null;

  dataRows.forEach(row=>{
    if(!row || row.every(c=>c===null || c===undefined || c==='')) return;

    const impNoRaw = get(row,'impNo');
    const polizaRaw = get(row,'poliza');
    const isNewGroup = (impNoRaw!==undefined && excelText(impNoRaw)!==null) || (polizaRaw!==undefined && excelText(polizaRaw)!==null);

    if(isNewGroup){
      current = {
        categoria: excelText(get(row,'categoria')),
        selectivo: null,
        impNo: excelImpNo(impNoRaw),
        poliza: excelText(polizaRaw),
        fecha: excelDateStr(get(row,'fecha')),
        peso: excelPeso(get(row,'peso')),
        tc: excelNumber(get(row,'tc')),
        transporte: excelText(get(row,'transporte')),
        guia: excelText(get(row,'guia')),
        facturaFlete: excelText(get(row,'facturaFlete')),
        costoFlete: excelNumber(get(row,'costoFlete')),
        seguro: excelNumber(get(row,'seguro')),
        iva: excelNumber(get(row,'iva')),
        dai: excelNumber(get(row,'dai')),
        gastosLocales: excelNumber(get(row,'gastosLocales')),
        fechaRecoleccion: excelDateStr(get(row,'fechaRecoleccion')),
        proveedorAduana: excelNumber(get(row,'proveedorAduana')),
        ingresoAduana: excelDateStr(get(row,'ingresoAduana')),
        salidaAduana: excelDateStr(get(row,'salidaAduana')),
        diasAduana: excelNumber(get(row,'diasAduana')),
        totalDias: excelNumber(get(row,'totalDias')),
        fechaProrrateo: excelDateStr(get(row,'fechaProrrateo')),
        fechaEntrega: excelDateStr(get(row,'fechaEntrega')),
        costoAlmacenaje: excelNumber(get(row,'costoAlmacenaje')),
        observaciones: excelText(get(row,'observaciones')),
        responsable: excelText(get(row,'responsable')),
        estado: 'En tiempo',
        facturas: [],
      };
      out.push(current);
      lastProveedor = excelText(get(row,'proveedor'));
    }

    if(!current) return;

    const provCell = excelText(get(row,'proveedor'));
    if(provCell) lastProveedor = provCell;
    const facturaCell = excelText(get(row,'factura'));
    const valorUsd = excelNumber(get(row,'valorUsd'));
    const valorOriginal = excelNumber(get(row,'valorOriginal'));
    if(facturaCell || valorUsd!==null || valorOriginal!==null){
      current.facturas.push({ proveedor:lastProveedor, factura:facturaCell, valorOriginal, valorUsd });
    }
  });

  return out;
}

function detectPeriodo(aoa, sheetName, fileName){
  const candidates = [];
  for(let i=0;i<Math.min(aoa.length,10);i++){
    (aoa[i]||[]).forEach(c=>{ if(c!==null && c!==undefined && c!=='') candidates.push(String(c)); });
  }
  candidates.push(sheetName||'', fileName||'');
  for(const raw of candidates){
    const norm = normalizeHeader(raw);
    const yearMatch = norm.match(/(20\d{2})/);
    if(!yearMatch) continue;
    const mesIdx = MONTH_NAMES.findIndex(m=>norm.includes(m));
    if(mesIdx!==-1) return {anio:Number(yearMatch[1]), mes:mesIdx+1};
  }
  return null;
}

document.getElementById('btnImportar').addEventListener('click', ()=>{
  document.getElementById('fileImportar').click();
});

document.getElementById('fileImportar').addEventListener('change', async (e)=>{
  const file = e.target.files[0];
  e.target.value = '';
  if(!file) return;

  let aoa, sheetName;
  try{
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, {type:'array', cellDates:true});
    sheetName = wb.SheetNames[0];
    aoa = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], {header:1, raw:true, defval:null});
  } catch(err){
    console.error(err);
    showToast('No se pudo leer el archivo: ' + err.message);
    return;
  }

  const headerIdx = findHeaderRowIndex(aoa);
  if(headerIdx===-1){
    showToast('No se encontró el encabezado (Póliza, Proveedor, Factura...) en el Excel.');
    return;
  }
  const colMap = mapExcelColumns(aoa[headerIdx]);
  const parsed = parseExcelPolicies(aoa.slice(headerIdx+1), colMap);

  if(parsed.length===0){
    showToast('No se encontraron pólizas para importar en este archivo.');
    return;
  }

  const detected = detectPeriodo(aoa, sheetName, file.name);
  const targetAnio = detected?.anio || currentAnio;
  const targetMes = detected?.mes || currentMes;
  const periodoTexto = `${MONTH_NAMES[targetMes-1]} ${targetAnio}`;
  const confirmMsg = detected
    ? `Se detectaron ${parsed.length} pólizas para ${periodoTexto}. ¿Deseas importarlas? Esto agrega registros nuevos; no reemplaza los existentes.`
    : `No se pudo detectar el mes en el archivo, se usará el período actualmente seleccionado (${periodoTexto}). Se importarán ${parsed.length} pólizas. ¿Deseas continuar?`;
  if(!confirm(confirmMsg)) return;

  currentAnio = targetAnio;
  currentMes = targetMes;
  document.getElementById('monthLabel').textContent = periodoTexto;
  savePeriodo();

  const btn = document.getElementById('btnImportar');
  btn.disabled = true;
  let okCount = 0, failCount = 0;

  for(let i=0;i<parsed.length;i++){
    const p = parsed[i];
    btn.textContent = `Importando ${i+1}/${parsed.length}...`;
    try{
      const { data: inserted, error: insErr } = await sb.from('polizas').insert(toDbRow(p)).select().single();
      if(insErr) throw insErr;
      const facturasLimpias = (p.facturas||[])
        .filter(f=>f.proveedor||f.factura||f.valorUsd!==null||f.valorOriginal!==null)
        .map(f=>({proveedor:f.proveedor||null, factura:f.factura||null, valor_original:f.valorOriginal, valor_usd:f.valorUsd, poliza_id: inserted.id}));
      if(facturasLimpias.length){
        const { error: fErr } = await sb.from('facturas').insert(facturasLimpias);
        if(fErr) throw fErr;
      }
      okCount++;
    } catch(err){
      console.error('Error importando póliza', p.poliza || p.impNo, err);
      failCount++;
    }
  }

  btn.disabled = false;
  btn.textContent = 'Importar Excel';
  showToast(`Importación completa: ${okCount} pólizas agregadas${failCount ? ', ' + failCount + ' con error (ver consola)' : ''}.`);
  await loadPolicies();
});
