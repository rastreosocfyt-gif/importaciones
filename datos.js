// ===== Acceso a datos: Supabase <-> formato de la interfaz =====

// convierte una fila de supabase (snake_case, con facturas anidadas) al formato que usa la interfaz
function mapFromDb(row){
  return {
    id: row.id,
    selectivo: row.selectivo,
    categoria: row.categoria,
    peso: row.peso,
    tc: row.tc,
    impNo: row.imp_no,
    poliza: row.poliza,
    fecha: row.fecha,
    transporte: row.transporte,
    guia: row.guia,
    facturaFlete: row.factura_flete,
    costoFlete: row.costo_flete,
    seguro: row.seguro,
    iva: row.iva,
    dai: row.dai,
    gastosLocales: row.gastos_locales,
    fechaRecoleccion: row.fecha_recoleccion,
    proveedorAduana: row.dias_proveedor_aduana,
    ingresoAduana: row.ingreso_aduana,
    salidaAduana: row.salida_aduana,
    diasAduana: row.dias_aduana,
    totalDias: row.total_dias,
    fechaProrrateo: row.fecha_prorrateo,
    fechaEntrega: row.fecha_entrega,
    costoAlmacenaje: row.costo_almacenaje,
    observaciones: row.observaciones,
    responsable: row.responsable,
    estado: row.estado || 'En tiempo',
    facturas: (row.facturas || []).map(f=>({
      id: f.id, proveedor: f.proveedor, factura: f.factura,
      valorOriginal: f.valor_original, valorUsd: f.valor_usd
    })),
  };
}

async function loadPolicies(){
  isLoading = true;
  renderLoading();
  const { data, error } = await sb
    .from('polizas')
    .select('*, facturas(*)')
    .eq('anio', currentAnio)
    .eq('mes', currentMes)
    .order('fecha', {ascending:true});

  isLoading = false;
  if(error){
    console.error(error);
    showToast('Error cargando datos: ' + error.message);
    policies = [];
  } else {
    policies = (data || []).map(mapFromDb);
  }
  render();
}

function renderLoading(){
  document.getElementById('rows').innerHTML = `<tr><td colspan="${COLUMNS.length}" style="text-align:center; padding:40px; color:var(--ink-soft);">Cargando pólizas de ${MONTH_NAMES[currentMes-1]} ${currentAnio}...</td></tr>`;
}

function toDbRow(data){
  return {
    anio: currentAnio,
    mes: currentMes,
    categoria: data.categoria,
    selectivo: data.selectivo,
    imp_no: data.impNo,
    poliza: data.poliza,
    fecha: data.fecha,
    peso: data.peso,
    tc: data.tc,
    transporte: data.transporte,
    guia: data.guia,
    factura_flete: data.facturaFlete,
    costo_flete: data.costoFlete,
    seguro: data.seguro,
    iva: data.iva,
    dai: data.dai,
    gastos_locales: data.gastosLocales,
    costo_almacenaje: data.costoAlmacenaje,
    fecha_recoleccion: data.fechaRecoleccion,
    dias_proveedor_aduana: data.proveedorAduana,
    ingreso_aduana: data.ingresoAduana,
    salida_aduana: data.salidaAduana,
    dias_aduana: data.diasAduana,
    total_dias: data.totalDias,
    fecha_prorrateo: data.fechaProrrateo,
    fecha_entrega: data.fechaEntrega,
    estado: data.estado,
    responsable: data.responsable,
    observaciones: data.observaciones,
  };
}
