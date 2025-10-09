document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('resultados');
    const btnRecargar = document.getElementById('recargar');
    const inputSearch = document.getElementById('search');
    const inputDate = document.getElementById('date');

    inputDate.setAttribute('max', getDateNow());
    inputDate.setAttribute('value', getDateNow());

    cargarResultados();

    if (btnRecargar) {
        btnRecargar.addEventListener('click', function() {
            localStorage.removeItem('resultadosLoterias');
            cargarResultados(true);
        });
    }

    inputSearch.addEventListener('input', filtrarResultados);

    inputDate.addEventListener('change', function(event) {
        cargarResultados(true, event.target.value);
    });

    function cargarResultados(forzarApi = false, fechaHoy = undefined) {
        container.innerHTML = '<p>Cargando resultados <span class="spinner"></span></p>';
        inputSearch.style.display = 'none';

        if (!fechaHoy) {
            const fechaHoy = getDateNow();
        }
        
        const cache = localStorage.getItem('resultadosLoterias');
        let cacheValido = false;
        if (!forzarApi && cache) {
            try {
                const cacheObj = JSON.parse(cache);
                if (cacheObj.fecha === fechaHoy && Array.isArray(cacheObj.data)) {
                    mostrarResultados(cacheObj.data);
                    cacheValido = true;
                }
            } catch (e) {}
        }

        const url = fechaHoy ? `https://api-resultadosloterias.com/api/results/${fechaHoy}` : `https://api-resultadosloterias.com/api/results`

        if (!cacheValido) {
            btnRecargar.textContent = 'Cargando...';
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success' && Array.isArray(data.data)) {
                        localStorage.setItem('resultadosLoterias', JSON.stringify({ fecha: fechaHoy, data: data.data }));
                        mostrarResultados(data.data);
                    } else {
                        container.innerHTML = '<p>No se pudieron obtener los resultados.</p>';
                    }
                    btnRecargar.textContent = 'Recargar';
                })
                .catch(() => {
                    container.innerHTML = '<p>Error al cargar los resultados.</p>';
                });
        }
    }

    function mostrarResultados(resultados) {
        let html = '<ul>';
        resultados.forEach(loteria => {
            const nombre = loteria.lottery.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
            html += `<li><strong>${nombre}</strong><span class="resultado">${loteria.result}</span></li>`;
        });
        html += '</ul>';
        container.innerHTML = html;
        inputSearch.style.display = 'block';
    }

    function filtrarResultados() {
        const filtro = inputSearch.value.toLowerCase();
        const lista = container.querySelectorAll('li');
        lista.forEach(li => {
            const texto = li.textContent.toLowerCase();
            li.style.display = texto.includes(filtro) ? '' : 'none';
        });
    }

    function getDateNow() {
        const hoy = new Date();
        const yyyy = hoy.getFullYear();
        const mm = String(hoy.getMonth() + 1).padStart(2, '0');
        const dd = String(hoy.getDate()).padStart(2, '0');
        const fechaHoy = `${yyyy}-${mm}-${dd}`;
        return fechaHoy;
    }
});
