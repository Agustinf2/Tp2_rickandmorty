const API_BASE = 'https://rickandmortyapi.com/api/character';

// --- Referencias al DOM ---
const btnTodos       = document.getElementById('btnTodos');
const formFiltros     = document.getElementById('formFiltros');
const resultadosEl    = document.getElementById('resultados');
const mensajeErrorEl  = document.getElementById('mensajeError');
const mensajeCargando = document.getElementById('mensajeCargando');
const paginacionEl    = document.getElementById('paginacion');
const paginaInfoEl    = document.getElementById('paginaInfo');
const btnPrev         = document.getElementById('btnPrev');
const btnNext         = document.getElementById('btnNext');

let ultimaConsulta = {
  params: new URLSearchParams(),
  pagina: 1,
};

btnTodos.addEventListener('click', () => {
  ultimaConsulta = { params: new URLSearchParams(), pagina: 1 };
  buscarPersonajes();
});

formFiltros.addEventListener('submit', (evento) => {
  evento.preventDefault();

  const params = new URLSearchParams();
  const datosFormulario = new FormData(formFiltros);

  for (const [clave, valor] of datosFormulario.entries()) {
    if (valor.trim() !== '') {
      params.append(clave, valor.trim());
    }
  }

  ultimaConsulta = { params, pagina: 1 };
  buscarPersonajes();
});

btnPrev.addEventListener('click', () => {
  ultimaConsulta.pagina -= 1;
  buscarPersonajes();
});

btnNext.addEventListener('click', () => {
  ultimaConsulta.pagina += 1;
  buscarPersonajes();
});

// --- Funciones principales ---

async function buscarPersonajes() {
  ocultarError();
  mostrarCargando(true);
  paginacionEl.hidden = true;

  const params = new URLSearchParams(ultimaConsulta.params);
  params.set('page', ultimaConsulta.pagina);

  const url = `${API_BASE}?${params.toString()}`;

  try {
    const respuesta = await fetch(url);

    if (!respuesta.ok) {

      if (respuesta.status === 404) {
        throw new Error('No se encontraron personajes con esos filtros.');
      }
      throw new Error(`Error al consultar la API (código ${respuesta.status}).`);
    }

    const datos = await respuesta.json();
    renderizarPersonajes(datos.results);
    actualizarPaginacion(datos.info);

  } catch (error) {
    mostrarError(error.message || 'Ocurrió un error inesperado al obtener los datos.');
    resultadosEl.innerHTML = '';
  } finally {
    mostrarCargando(false);
  }
}

function renderizarPersonajes(personajes) {
  resultadosEl.innerHTML = '';

  personajes.forEach((personaje) => {
    const card = document.createElement('article');
    card.className = 'personaje-card';

    const estadoClase =
      personaje.status === 'Alive' ? 'estado--alive' :
      personaje.status === 'Dead'  ? 'estado--dead'  : 'estado--unknown';

    card.innerHTML = `
      <img src="${personaje.image}" alt="${personaje.name}">
      <div class="personaje-card__info">
        <h3>${personaje.name}</h3>
        <span class="estado ${estadoClase}">${personaje.status}</span>
        <p><strong>Especie:</strong> ${personaje.species}</p>
        ${personaje.type ? `<p><strong>Tipo:</strong> ${personaje.type}</p>` : ''}
        <p><strong>Género:</strong> ${personaje.gender}</p>
        <p><strong>Origen:</strong> ${personaje.origin.name}</p>
      </div>
    `;

    resultadosEl.appendChild(card);
  });
}

function actualizarPaginacion(info) {
  if (!info) return;

  paginacionEl.hidden = false;
  paginaInfoEl.textContent = `Página ${ultimaConsulta.pagina}`;

  btnPrev.disabled = !info.prev;
  btnNext.disabled = !info.next;
}

function mostrarError(texto) {
  mensajeErrorEl.textContent = texto;
  mensajeErrorEl.hidden = false;
}

function ocultarError() {
  mensajeErrorEl.hidden = true;
  mensajeErrorEl.textContent = '';
}

function mostrarCargando(estado) {
  mensajeCargando.hidden = !estado;
}
