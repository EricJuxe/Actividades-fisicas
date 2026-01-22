const URL_SHEET = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRCf4P2wjD8h0pQqUGnyERk9-cm_qgLr-LQqwUmdxsxcqx4Rve8w5bIFU7zjSFHb2n4A_CwGkPr4Hud/pub?output=csv"; 

async function obtenerDatos() {
    try {
        const respuesta = await fetch(URL_SHEET);
        const data = await respuesta.text();
        const filas = data.split('\n').slice(1);
        
        return filas.map(fila => {
            const columnas = fila.split(',');
            return {
                id: columnas[0]?.trim(),
                deporte: columnas[1]?.trim(),
                nombre: columnas[2]?.trim(),
                descripcion: columnas[3]?.trim(),
                imagenes: columnas[4]?.trim() ? columnas[4].split(';').map(url => url.trim()).filter(url => url) : []
            };
        }).filter(item => item.id);
    } catch (e) { console.error("Error cargando datos", e); return []; }
}

async function cargarMenuPrincipal() {
    const datos = await obtenerDatos();
    const contenedor = document.getElementById('menu-deportes');
    
    // Limpiamos los nombres (trim) y quitamos los que estén vacíos
    const deportesUnicos = [...new Set(
        datos.map(d => d.deporte ? d.deporte.trim() : "").filter(d => d !== "")
    )];

    contenedor.innerHTML = ""; // Limpiamos el contenedor antes de cargar

    deportesUnicos.forEach((dep, index) => {
        // Asignamos una clase basada en el nombre o por orden (color1, color2, etc)
        let claseColor = `color-${(index % 5) + 1}`; 
        
        const col = document.createElement('div');
        col.className = 'col-12 col-sm-6 col-md-4 col-lg-3';
        col.innerHTML = `
            <a href="categoria.html?deporte=${encodeURIComponent(dep)}" class="card-link text-decoration-none">
                <div class="sport-card ${claseColor}">
                    <h2 class="text-uppercase m-0">${dep}</h2>
                </div>
            </a>`;
        contenedor.appendChild(col);
    });
}

async function cargarEjercicios() {
    const params = new URLSearchParams(window.location.search);
    const depBusca = params.get('deporte');
    const datos = await obtenerDatos();
    
    document.getElementById('titulo-deporte').innerText = depBusca;
    const lista = document.getElementById('lista-ejercicios');
    lista.innerHTML = ''; // Limpiamos primero
    
    const ejercicios = datos.filter(d => d.deporte === depBusca);
    
    ejercicios.forEach(ex => {
        const link = document.createElement('a');
        link.href = 'detalle.html?id=' + ex.id;
        link.className = 'ejercicio-card';
        link.innerHTML = `
            <div class="ejercicio-contenido">
                <h3>${ex.nombre}</h3>
            </div>`;
        lista.appendChild(link);
    });
}

async function cargarDetalle() {
    const params = new URLSearchParams(window.location.search);
    const idBusca = params.get('id');
    const datos = await obtenerDatos();
    const info = datos.find(d => d.id === idBusca);

    if (info) {
        document.getElementById('detalle-titulo').innerText = info.nombre;
        document.getElementById('detalle-texto').innerText = info.descripcion;
        const cont = document.getElementById('contenedor-imagenes');
        cont.innerHTML = ''; // Limpiamos primero
        info.imagenes.forEach(url => {
            if(url) {
                const img = document.createElement('img');
                img.src = url;
                img.alt = 'Imagen de ' + info.nombre;
                img.loading = 'lazy'; // Lazy loading para móvil
                cont.appendChild(img);
            }
        });
    }
}
