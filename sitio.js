// Cada sección usa una imagen local y enlaces oficiales del proyecto.
const visita = ['Coordinar una visita ↗', 'https://wa.me/59891000998?text=Hola%2C%20quisiera%20coordinar%20una%20visita%20a%20Mirador%20de%20las%20Sierras.'];
const secciones = {
  proyecto: ['Proyecto','Un campo entre sierras','sierras','Sobre la Ruta 109, en Maldonado, Mirador reúne 117 chacras en un campo de 772 hectáreas. En el plano podés ver cómo se distribuyen las parcelas y los caminos.',[['Ver masterplan','plano'],['Explorar las chacras →','#chacras']]],
  chacras: ['Chacras','Tres hectáreas para tu proyecto','chacras','Las chacras tienen unas tres hectáreas cada una y están previstas con padrón individual. La caminería interna está en ejecución. El proyecto no exige gastos comunes obligatorios.',[['Ver masterplan','plano'],['Consultar disponibilidad ↗','https://wa.me/59891000998?text=Hola%2C%20quisiera%20consultar%20qu%C3%A9%20chacras%20est%C3%A1n%20disponibles.']]],
  financiacion: ['Financiación','Preventa desde USD 39.000','financiacion','La financiación es directa. La propuesta publicada prevé una entrega del 20 % y el saldo en hasta 60 cuotas en dólares. Consultá las condiciones vigentes para la chacra que te interesa.',[['Consultar condiciones ↗','https://wa.me/59891000998?text=Hola%2C%20quisiera%20conocer%20los%20planes%20de%20financiaci%C3%B3n.']]],
  paisaje: ['Paisaje','Las sierras, en todas direcciones','paisaje','Las pendientes y la orientación cambian la vista de una parcela a otra. Recorrerlas a pie permite elegir desde dónde mirar las sierras y dónde imaginar una casa.',[visita]],
  ubicacion: ['Ubicación','Por la Ruta 109','ruta','El acceso está sobre la Ruta 109, en la Sierra de Carapé, departamento de Maldonado, en el entorno del Cerro Catedral. Coordiná con el equipo el punto de encuentro para recorrer el campo.',[visita]],
  conocimiento: ['Conocimiento','Antes de elegir tu chacra','visita','El centro de conocimiento de Mirador reúne lecturas sobre la compra de tierra en Uruguay, la vida en las sierras y las preguntas que conviene hacerse antes de construir.',[['Leer las guías de Mirador ↗','https://www.miradordelassierras.uy/conocimiento/']]],
  contacto: ['Contacto','Vení a recorrer el campo','sierras','Para conocer las chacras, escribile al equipo de Mirador. Podés coordinar tu visita por WhatsApp al +598 91 000 998 o por correo.',[visita,['info@miradordelassierras.uy','mailto:info@miradordelassierras.uy']]]
};
const fotoRuta = nombre => 'assets/' + nombre + '.webp';
const get = selector => document.querySelector(selector);
const video = get('video');
let pausado = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function actualizarVideo() {
  if (pausado || !document.body.classList.contains('inicio')) video.pause();
  else video.play().catch(() => { pausado = true; actualizarVideo(); });
  get('#movimiento').textContent = pausado ? 'Reproducir video' : 'Pausar video';
  get('#movimiento').setAttribute('aria-pressed',String(pausado));
}
get('#movimiento').onclick = () => { pausado = !pausado; actualizarVideo(); };
const plano = get('#plano');
plano.querySelector('button').onclick = () => plano.close();
function mostrarDetalle(lectura) {
  const monto = lectura.querySelector('#monto');
  const destino = monto || lectura.querySelector('h2');
  if (!monto) destino.tabIndex = -1;
  destino.focus({preventScroll: true});
  if (monto) monto.select();
  destino.scrollIntoView({block: monto ? 'center' : 'start', behavior: 'instant'});
}
function mostrar() {
  const [id, vista] = location.hash.slice(1).split('/');
  const datos = Object.hasOwn(secciones,id) && secciones[id];
  document.body.classList.toggle('inicio',!datos);
  if (plano.open) plano.close();
  if (get('#orientador').open) get('#orientador').close();
  actualizarVideo();
  const plantilla = document.getElementById('detalle-' + id);
  const lectura = get('#lectura');
  lectura.replaceChildren();
  if (plantilla) lectura.append(plantilla.content.cloneNode(true));
  prepararHerramientas(id);
  window.scrollTo(0, 0);
  if (!datos) { get('#foto').src = fotoRuta('portada'); return; }
  const [nombre,titulo,imagen,descripcion,enlaces] = datos;
  get('#seccion').textContent = nombre;
  get('#titulo').textContent = titulo;
  get('#descripcion').textContent = descripcion;
  get('#foto').src = fotoRuta(imagen);
  get('#enlaces').replaceChildren(...enlaces.map(([texto,destino]) => {
    const boton = destino === 'plano';
    const control = document.createElement(boton ? 'button' : 'a');
    control.textContent = texto;
    if (boton) control.onclick = () => plano.showModal();
    else { control.href = destino; if(destino.startsWith('https:')) { control.target = '_blank'; control.rel = 'noopener'; } }
    return control;
  }));
  if (plantilla) {
    const leer = document.createElement('button');
    const llamadas = { contacto: 'Preparar mi recorrida ↓', financiacion: 'Calcular mi entrega ↓', conocimiento: 'Explorar las guías ↓' };
    leer.textContent = llamadas[id] || 'Ver más detalles ↓';
    leer.onclick = () => mostrarDetalle(lectura);
    get('#enlaces').prepend(leer);
  }
  for (const link of get('nav').children) {
    if (link.hash === '#' + id) link.setAttribute('aria-current','page');
    else link.removeAttribute('aria-current');
  }
  const ficha = get('.ficha');
  ficha.classList.remove('aparece');
  void ficha.offsetWidth;
  ficha.classList.add('aparece');
  if (vista === 'detalle' && plantilla) {
    mostrarDetalle(lectura);
  }
}
for (const [id,[nombre]] of Object.entries(secciones)) {
  const enlace = document.createElement('a');
  enlace.href = '#' + id; enlace.textContent = nombre; get('nav').append(enlace);
}
window.addEventListener('hashchange',mostrar);
const guia = get('#orientador');
const recorridos = [
  ['Imaginar una casa en el campo', 'chacras'],
  ['Evaluar mi presupuesto', 'financiacion'],
  ['Conocer la zona', 'ubicacion']
];
for (const [opcion, destino] of recorridos) {
  const boton = document.createElement('button');
  boton.textContent = opcion;
  boton.onclick = () => {
    guia.close();
    location.hash = destino + '/detalle';
  };
  get('#opciones-guia').append(boton);
}
get('.orientar').onclick = () => guia.showModal();
get('#cerrar-guia').onclick = () => guia.close();
const usd = new Intl.NumberFormat('es-UY',{maximumFractionDigits:2});
const prioridades = new Set();
function prepararHerramientas(id) {
  if (id === 'financiacion') {
    const campo = get('#monto');
    const salida = get('#calculo');
    function calcular() {
      const precio = campo.valueAsNumber;
      const minimo = Number(campo.min);
      const valido = Number.isFinite(precio) && precio >= minimo;
      campo.setAttribute('aria-invalid', String(!valido));
      if (!valido) {
        salida.textContent = 'Ingresá un precio de USD ' + usd.format(minimo) + ' o más.';
        return;
      }
      salida.replaceChildren();
      for (const [nombre,valor] of [['Entrega del 20 %',precio*.2],['Saldo a financiar',precio*.8]]) {
        const fila = document.createElement('span');
        const importe = document.createElement('strong');
        importe.textContent = 'USD ' + usd.format(valor);
        fila.append(nombre,importe);
        salida.append(fila);
      }
    }
    campo.oninput = calcular;
    calcular();
  }
  if (id === 'contacto') {
    function actualizarConsulta() {
      const temas = prioridades.size ? ' Me interesa evaluar: ' + [...prioridades].join(', ') + '.' : '';
      get('#enviar-visita').href = 'https://wa.me/59891000998?text=' + encodeURIComponent('Hola, quisiera coordinar una visita a Mirador de las Sierras.' + temas);
    }
    for (const campo of get('#prioridades').querySelectorAll('input')) {
      campo.checked = prioridades.has(campo.value);
      campo.onchange = () => {
        if (campo.checked) prioridades.add(campo.value);
        else prioridades.delete(campo.value);
        actualizarConsulta();
      };
    }
    actualizarConsulta();
  }
}
mostrar();
