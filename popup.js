document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('resultados');
    const btnRecargar = document.getElementById('recargar');
    cargarResultados();

    if (btnRecargar) {
        btnRecargar.addEventListener('click', function() {
            localStorage.removeItem('resultadosLoterias');
            cargarResultados(true);
        });
    }

    function cargarResultados(forzarApi = false) {
        container.innerHTML = '<p>Cargando resultados...</p>';
        
        const hoy = new Date();
        const yyyy = hoy.getFullYear();
        const mm = String(hoy.getMonth() + 1).padStart(2, '0');
        const dd = String(hoy.getDate()).padStart(2, '0');
        const fechaHoy = `${yyyy}-${mm}-${dd}`;

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

        if (!cacheValido) {
            fetch('https://api-resultadosloterias.com/api/results')
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success' && Array.isArray(data.data)) {
                        localStorage.setItem('resultadosLoterias', JSON.stringify({ fecha: fechaHoy, data: data.data }));
                        mostrarResultados(data.data);
                    } else {
                        container.innerHTML = '<p>No se pudieron obtener los resultados.</p>';
                    }
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
    }
});
