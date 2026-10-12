// ===== Configuración: conexión a Supabase, período y estado global =====

// ---------- Conexión a Supabase ----------
const SUPABASE_URL = 'https://ehaihgddxpnkmizvqsnh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVoYWloZ2RkeHBua21penZxc25oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0MDIyMzAsImV4cCI6MjEwMzk3ODIzMH0.E2h2Mi3dWkzYyEVLvpxaCw0rtsfX-AGq8DExPNu1MM0';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const MONTH_NAMES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const PERIODO_KEY = 'oe_ultimo_periodo';
let storedPeriodo = null;
try{ storedPeriodo = JSON.parse(localStorage.getItem(PERIODO_KEY) || 'null'); }catch(e){ storedPeriodo = null; }
let currentAnio = storedPeriodo?.anio || 2026;
let currentMes = storedPeriodo?.mes || 7;
function savePeriodo(){
  try{ localStorage.setItem(PERIODO_KEY, JSON.stringify({anio:currentAnio, mes:currentMes})); }catch(e){}
}
let policies = [];
let isLoading = false;
