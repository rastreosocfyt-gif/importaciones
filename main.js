// ===== Arranque de la aplicación =====

document.getElementById('btnCajas').addEventListener('click', ()=> showToast('Reporte de cajas — próximamente'));

document.getElementById('monthLabel').textContent = MONTH_NAMES[currentMes-1] + ' ' + currentAnio;
loadPolicies();
