(() => {
  const live = /^https?:$/.test(location.protocol);
  const query = new URLSearchParams(location.search);
  const hotel = (query.get('hotel') || '').slice(0,80);
  const origen = hotel || 'Web';
  const estados = ['Por verificar','Disponible','Reservada','Ocupada'];
  const clases = ['pendiente','libre','reserva','ocupada'];
  const plano = document.querySelector('#plano');
  const mapa = document.querySelector('#lienzo-plano');
  const selector = document.querySelector('#elegir-parcela');
  const ficha = document.querySelector('#parcela-actual');
  const visita = document.querySelector('#paso-visita');
  const acceso = document.querySelector('#abrir-copiloto');
  let seleccion = 0;
  let interes = '';
  let inventario = new Map();
  const tema = {chacras:'Proyecto de casa', financiacion:'Presupuesto', ubicacion:'Acceso y entorno'};
  const normalizar = texto => texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const respuestas = [
    [/cuota|financ|entrega|precio|presupuesto|cuesta|valor/, 'La preventa parte de USD 39.000. Con ese precio, la entrega del 20 % es USD 7.800 y quedan USD 31.200 a financiar en hasta 60 cuotas. La tasa se confirma con el equipo.', 'Financiación', '#financiacion/detalle'],
    [/ubic|ruta|lleg|distancia|viaje|acceso|donde/, 'El acceso es por la Ruta 109, en la Sierra de Carapé. El tramo es de balasto y se puede recorrer en vehículo convencional. Coordiná el punto de encuentro antes de ir.', 'Acceso y entorno', '#ubicacion/detalle'],
    [/constr|casa|vivienda|hectarea|superficie|padron|gastos/, 'Las parcelas tienen unas tres hectáreas, padrón individual y sin gastos comunes obligatorios. La superficie exacta y las condiciones de construcción se revisan para el padrón elegido.', 'Proyecto de casa', '#chacras/detalle'],
    [/visita|horario|agenda|recorr|conocer/, 'Podés solicitar una visita guiada. El equipo te contacta para acordar el horario y el punto de encuentro.', 'Visita guiada', 'visita'],
    [/disponib|ocupad|reserv|parcela|lote/, 'En el plano podés consultar el estado registrado para cada parcela. «Por verificar» indica que el equipo todavía debe confirmar su situación.', 'Disponibilidad de parcelas', 'plano']
  ];
  document.querySelector('#preguntar').onsubmit = e => {
    e.preventDefault();
    const pregunta=normalizar(document.querySelector('#duda').value);
    const numero=pregunta.match(/(?:parcela|lote)\s*(?:n[º°.]?\s*)?(\d+)/);
    const valida=numero && +numero[1]>=1 && +numero[1]<=117;
    const regla=valida ? respuestas[4] : respuestas.find(r=>r[0].test(pregunta));
    const respuesta=document.querySelector('#respuesta-local');
    const paso=document.createElement('button');
    paso.type='button';
    let mensaje=regla ? regla[1] : 'El equipo puede ayudarte con esa consulta durante una visita guiada.';
    interes=regla ? regla[2] : 'Consulta sobre el proyecto';
    if(valida){elegir(+numero[1]);mensaje='Parcela '+seleccion+' · '+(inventario.get(seleccion)||estados[0])+'. '+mensaje}
    const destino=regla ? regla[3] : 'visita';
    paso.textContent=destino==='plano'?'Ver parcela en el plano →':destino==='visita'?'Solicitar visita →':'Ver más sobre '+interes.toLowerCase()+' →';
    paso.onclick=()=>{document.querySelector('#orientador').close();if(destino==='plano')plano.showModal();else if(destino==='visita')abrirVisita();else location.hash=destino};
    respuesta.replaceChildren(document.createTextNode(mensaje),paso);
  };
  function contexto() {
    const id = location.hash.slice(1).split('/')[0];
    return {parcela:seleccion || '', interes:interes || tema[id] || '', origen};
  }
  function color(n) {return clases[estados.indexOf(inventario.get(n) || estados[0])] || clases[0]}
  function pintar() {
    for (const boton of mapa.querySelectorAll('[data-lote]')) {
      const n = Number(boton.dataset.lote);
      const label = 'Parcela ' + n + ' · ' + (inventario.get(n) || estados[0]);
      boton.className = 'pin '+color(n);
      boton.title = label;
      boton.setAttribute('aria-label',label);
      boton.setAttribute('aria-pressed',String(n === seleccion));
      selector.options[n].textContent = label;
    }
    for(const marca of document.querySelectorAll('.mini-estado')) marca.className='mini-estado '+color(Number(marca.dataset.lote));
    ficha.textContent = seleccion ? selector.options[seleccion].textContent : 'Tocá una parcela o elegí su número.';
    document.querySelector('#consulta-parcela').textContent = ['Reservada','Ocupada'].includes(inventario.get(seleccion)) ? 'Consultar alternativas en una visita →' : 'Solicitar una visita guiada →';
  }
  function elegir(n) {seleccion=n;selector.value=String(n);pintar()}
  centrosParcelas.forEach(([x,y],i)=>{
    const n=i+1;
    const b=document.createElement('button');
    b.type='button';b.dataset.lote=n;b.textContent=n;
    b.style.left=((1.048*x-27.5)/18)+'%';
    b.style.top=((1.048*y+347)/15.57)+'%';
    b.onclick=()=>elegir(n);
    mapa.append(b);selector.add(new Option('Parcela '+n,n));
  });
  selector.onchange=()=>elegir(Number(selector.value));
  let cargando=false;
  async function actualizar() {
    const ejemplos = [37,64,19,42,72,58];
    for(let n=1;n<=117;n++){
      const i=n-1;
      inventario.set(n, ejemplos.includes(n) ? 'Disponible' : i>=107 ? 'Por verificar' : i%7===0 ? 'Ocupada' : i%9===0 ? 'Reservada' : 'Disponible');
    }
    document.querySelector('#estado-inventario').textContent='Demostración · disponibilidad ficticia';
    pintar();
  }
  function miniatura(){
    const abrir=document.querySelector('#lectura .abrir-plano');
    if(!abrir || abrir.querySelector('.mini-plano')) return;
    const img=abrir.querySelector('img'), caja=document.createElement('span');
    caja.className='mini-plano';
    img.replaceWith(caja);caja.append(img);
    for(const pin of mapa.querySelectorAll('.pin')){
      const m=document.createElement('i');m.dataset.lote=pin.dataset.lote;
      m.className='mini-estado '+color(Number(pin.dataset.lote));m.setAttribute('aria-hidden','true');
      m.style.left=pin.style.left;m.style.top=pin.style.top;caja.append(m);
    }
    abrir.lastElementChild.textContent='Ver números y disponibilidad de parcelas ↗';
  }
  miniatura();
  new MutationObserver(miniatura).observe(document.querySelector('#lectura'),{childList:true});
  pintar();actualizar();
  new MutationObserver(()=>{if(plano.open) actualizar()}).observe(plano,{attributes:true,attributeFilter:['open']});
  setInterval(()=>{if(plano.open || document.querySelector(".mini-plano")) actualizar()},20000);
  function dibujarQR(url) {
    const qr=new MiradorQR(-1,1);qr.addData(url);qr.make();
    const n=qr.getModuleCount();const size=5;const canvas=document.querySelector('#qr-visita');
    canvas.width=canvas.height=(n+8)*size;
    const ctx=canvas.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#193629';
    for(let fila=0;fila<n;fila++) for(let col=0;col<n;col++) if(qr.isDark(fila,col))ctx.fillRect((col+4)*size,(fila+4)*size,size,size);
  }
  function abrirVisita() {
    if(plano.open)plano.close();
    const ctx=contexto();
    const temas=[...document.querySelectorAll('#prioridades input:checked')].map(n=>n.value);
    const {parcela,origen}=ctx;
    const interes=[ctx.interes,...temas].filter(Boolean).join(', ').slice(0,180);
    const destino=new URL('solicitud.html',location.href);
    destino.search=new URLSearchParams({parcela,interes,origen});
    const local=!live || ['localhost','127.0.0.1','[::1]'].includes(location.hostname);
    const enlace=document.querySelector('#form-visita');
    const qr=document.querySelector('#qr-visita');
    qr.hidden=local;
    document.querySelector('#qr-ayuda').textContent=local ? 'El QR se habilita al abrir la web con una dirección accesible desde el celular.' : 'Escaneá con tu celular para dejar tus datos y pedir una visita.';
    enlace.href=live?destino.href:'https://wa.me/59891000998?text='+encodeURIComponent('Hola, quisiera solicitar una visita guiada a Mirador.'+(parcela?' Me interesa la parcela '+parcela+'.':''));
    enlace.textContent=live?'Abrir formulario en este dispositivo →':'Consultar al equipo por WhatsApp ↗';
    enlace.hidden=Boolean(hotel);
    if(!local)dibujarQR(destino.href);
    document.querySelector('#interes-visita').textContent=[parcela?'Parcela '+parcela:'',interes].filter(Boolean).join(' · ');
    visita.showModal();
  }
  acceso.onclick=()=>document.querySelector('#orientador').showModal();
  document.querySelector('#consulta-parcela').onclick=abrirVisita;
  document.querySelector('#fin-guia').onclick=()=>{document.querySelector('#orientador').close();abrirVisita()};
  document.querySelector('#guia-plano').onclick=()=>{document.querySelector('#orientador').close();plano.showModal()};
  document.querySelector('#cerrar-visita').onclick=()=>visita.close();
  document.addEventListener('click',e=>{
    if(e.target.closest('#opciones-guia button'))interes=e.target.closest('button').textContent;
    if(e.target.closest('.pedir-visita')){e.preventDefault();document.querySelector('#orientador').close();abrirVisita()}
  });
  window.addEventListener('hashchange',()=>{
    if(location.hash==='#contacto'){document.querySelector('#entrada-visita')?.focus({preventScroll:true})}
  });
  if(hotel){
    let reloj;
    const reiniciar=()=>{clearTimeout(reloj);reloj=setTimeout(()=>{location.replace(location.pathname+location.search+'#inicio');location.reload()},120000)};
    for(const evento of ['pointerdown','keydown','scroll'])document.addEventListener(evento,reiniciar,{passive:true,capture:true});
    reiniciar();
  }
})();
