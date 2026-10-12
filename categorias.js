// ===== Colores por categoría (automáticos y personalizados) =====

const CATEGORY_COLORS = {
  'AROS': ['--blue-bg','--blue-fg'],
  'INSUMOS REPUESTOS': ['--purple-bg','--purple-fg'],
  'INSUMOS Y REPUESTOS': ['--purple-bg','--purple-fg'],
  'REPUESTOS': ['--orange-bg','--orange-fg'],
  'INSUMOS': ['--green-bg','--green-fg'],
  'ACCESORIOS': ['--pink-bg','--pink-fg'],
  'MATERIAL PROMOCIONAL': ['--amber-bg','--amber-fg'],
  'UNIDADES': ['--sky-bg','--sky-fg'],
  'EQUIPOS': ['--red-bg','--red-fg'],
  'MATERIA PRIMA': ['--brown-bg','--brown-fg'],
  'LENTE OFTALMICO': ['--cyan-bg','--cyan-fg'],
};
const FALLBACK_COLORS = [['--blue-bg','--blue-fg'],['--purple-bg','--purple-fg'],['--orange-bg','--orange-fg'],['--green-bg','--green-fg'],['--pink-bg','--pink-fg'],['--amber-bg','--amber-fg'],['--sky-bg','--sky-fg'],['--cyan-bg','--cyan-fg']];
const VAR_HEX = {
  '--purple-fg':'#6d28d9','--blue-fg':'#1e40af','--orange-fg':'#c2410c','--green-fg':'#047857',
  '--pink-fg':'#be185d','--amber-fg':'#b45309','--sky-fg':'#0369a1','--red-fg':'#b91c1c',
  '--brown-fg':'#92400e','--cyan-fg':'#0e7490','--gray-fg':'#57635f'
};

// Colores de categoría elegidos manualmente por el usuario (persisten en el navegador)
const CATEGORIA_COLORS_KEY = 'oe_categoria_colors';
let categoriaColors = {};
try{ categoriaColors = JSON.parse(localStorage.getItem(CATEGORIA_COLORS_KEY) || '{}'); }catch(e){ categoriaColors = {}; }
function saveCategoriaColors(){
  try{ localStorage.setItem(CATEGORIA_COLORS_KEY, JSON.stringify(categoriaColors)); }catch(e){}
}

// Color por defecto (automático) que le tocaría a una categoría si no tiene uno manual
function defaultVarPairFor(cat){
  if(!cat) return ['--gray-bg','--gray-fg'];
  if(CATEGORY_COLORS[cat]) return CATEGORY_COLORS[cat];
  let h=0; for(const c of cat) h = (h*31 + c.charCodeAt(0)) % FALLBACK_COLORS.length;
  return FALLBACK_COLORS[h];
}
function defaultHexFor(cat){
  const [,fgVar] = defaultVarPairFor(cat);
  return VAR_HEX[fgVar] || '#57635f';
}

// Color final a usar para pintar una categoría: manual (si existe) o automático
function colorFor(cat){
  if(!cat) return {bg:'var(--gray-bg)', fg:'var(--gray-fg)'};
  if(categoriaColors[cat]){
    const hex = categoriaColors[cat];
    return {bg:`color-mix(in srgb, ${hex} 16%, white)`, fg:hex};
  }
  const [bgVar,fgVar] = defaultVarPairFor(cat);
  return {bg:`var(${bgVar})`, fg:`var(${fgVar})`};
}
