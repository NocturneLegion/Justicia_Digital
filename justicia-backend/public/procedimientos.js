// 🔒 GESTIÓN DE PROCEDIMIENTOS JUDICIALES
document.addEventListener('DOMContentLoaded', function () {
    console.log('🔍 [PROCEDIMIENTOS.JS] Iniciando script de procedimientos...');
    // La autenticación se maneja en auth-global.js
    // Referencias a elementos del DOM
    const caseTableBody = document.getElementById('case-table-body');
    const addCaseBtn = document.getElementById('add-case-btn');
    const caseModal = document.getElementById('case-modal');
    const caseForm = document.getElementById('case-form');
    const caseModalTitle = document.getElementById('case-modal-title');
    const confirmModal = document.getElementById('confirm-modal');
    const confirmOkBtn = document.getElementById('confirm-ok');
    const confirmCancelBtn = document.getElementById('confirm-cancel');
    const searchInput = document.getElementById('search-case');
    const searchType = document.getElementById('search-type');
    const searchBtn = document.getElementById('search-btn');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');
    const closeModalButtons = document.querySelectorAll('.close-modal');
    const addTipoBtn = document.getElementById('add-tipo-btn');
    const tipoModal = document.getElementById('tipo-modal');
    const tipoForm = document.getElementById('tipo-form');
    const caseTipoSelect = document.getElementById('case-tipo');

    // Variables para la paginación
    let currentPage = 1;
    const casesPerPage = 5;
    let filteredCases = [];

    // Inicializar tipos de caso personalizados si no existen
    const initializeCases = () => {
        if (!sessionStorage.getItem('tiposCaso')) {
            const defaultTipos = [
                { valor: 'penal', nombre: 'Penal' },
                { valor: 'civil', nombre: 'Civil' },
                { valor: 'familiar', nombre: 'Familiar' },
                { valor: 'laboral', nombre: 'Laboral' },
                { valor: 'administrativo', nombre: 'Administrativo' }
            ];
            sessionStorage.setItem('tiposCaso', JSON.stringify(defaultTipos));
        }
    };

    // Obtener casos desde el backend usando JWT
    const getCases = async () => {
        const token = sessionStorage.getItem('token');
        if (!token) {
            alert('Sesión expirada. Por favor, inicie sesión nuevamente.');
            window.location.href = 'index.html';
            return [];
        }
        try {
            const response = await fetch('http://localhost:5000/api/casos', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error('No se pudieron obtener los casos');
            }
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error al obtener casos:', error);
            alert('Error al obtener los casos: ' + error.message);
            return [];
        }
    };

    // Guardar casos en el backend
    const saveCases = async (cases) => {
        const token = sessionStorage.getItem('token');
        try {
            const response = await fetch('http://localhost:5000/api/casos/bulk', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(cases)
            });
            if (!response.ok) {
                throw new Error('No se pudieron guardar los casos');
            }
        } catch (error) {
            console.error('Error al guardar casos:', error);
            alert('Error al guardar casos: ' + error.message);
        }
    };

    // Renderizar la tabla de casos con paginación
    const renderCaseTable = async () => {
        let cases = filteredCases.length > 0 ? filteredCases : await getCases();

        // Asegurarse de que cases sea un array
        if (!Array.isArray(cases)) {
            console.error('Error: cases no es un array', cases);
            cases = [];
        }

        const totalPages = Math.ceil(cases.length / casesPerPage);

        // Actualizar información de paginación
        pageInfo.textContent = `Página ${currentPage} de ${totalPages || 1}`;

        // Habilitar/deshabilitar botones de paginación
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;

        // Calcular índices para la paginación
        const startIndex = (currentPage - 1) * casesPerPage;
        const endIndex = startIndex + casesPerPage;
        const paginatedCases = cases.slice(startIndex, endIndex);

        // Limpiar tabla
        caseTableBody.innerHTML = '';

        // Renderizar casos
        if (paginatedCases.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `<td colspan="9" style="text-align: center;">No se encontraron casos</td>`;
            caseTableBody.appendChild(emptyRow);
        } else {
            paginatedCases.forEach((caso, index) => {
                const row = document.createElement('tr');

                // Definir clases de Bootstrap para los estados
                const estadoClasses = {
                    'activo': 'bg-success text-white',
                    'pendiente': 'bg-warning text-dark',
                    'archivado': 'bg-secondary text-white',
                    'concluido': 'bg-primary text-white'
                };

                const estadoClass = estadoClasses[caso.estado] || 'bg-secondary text-white';

                // Formatear el sujeto procesal para mostrar en la tabla
                let sujetoDisplay = caso.sujeto;

                // Definir mapeo de tipos de sujeto a etiquetas y clases
                const tiposSujeto = {
                    '[victima] ': { label: 'Víctima', class: 'bg-success text-white' },
                    '[demandante] ': { label: 'Demandante', class: 'bg-success text-white' },
                    '[accionante] ': { label: 'Accionante', class: 'bg-success text-white' },
                    '[denunciado] ': { label: 'Denunciado', class: 'bg-danger text-white' },
                    '[demandado] ': { label: 'Demandado', class: 'bg-danger text-white' },
                    '[accionado] ': { label: 'Accionado', class: 'bg-danger text-white' }
                };

                // Verificar si hay múltiples sujetos
                if (caso.sujeto.includes(' && ')) {
                    const sujetos = caso.sujeto.split(' && ');
                    let sujetosFormateados = [];

                    // Procesar cada sujeto
                    sujetos.forEach(sujeto => {
                        let sujetoFormateado = sujeto;

                        // Buscar el prefijo en el sujeto
                        for (const [prefijo, config] of Object.entries(tiposSujeto)) {
                            if (sujeto.startsWith(prefijo)) {
                                const nombre = sujeto.substring(prefijo.length);
                                sujetoFormateado = `<span class="badge ${config.class} rounded-pill me-2">${config.label}</span> ${nombre}`;
                                break;
                            }
                        }

                        sujetosFormateados.push(sujetoFormateado);
                    });

                    // Combinar los sujetos formateados con un separador visual
                    sujetoDisplay = sujetosFormateados.join('<hr class="my-1">');
                } else {
                    // Caso de un solo sujeto (compatibilidad con datos antiguos)
                    for (const [prefijo, config] of Object.entries(tiposSujeto)) {
                        if (caso.sujeto.startsWith(prefijo)) {
                            const nombre = caso.sujeto.substring(prefijo.length);
                            sujetoDisplay = `<span class="badge ${config.class} rounded-pill me-2">${config.label}</span> ${nombre}`;
                            break;
                        }
                    }
                }

                // Calcular número correlativo para la fila
                const rowNumber = startIndex + index + 1;

                row.innerHTML = `
                    <td class="fw-bold">${rowNumber}</td>
                    <td><a href="actividades.html?nurej=${encodeURIComponent(caso.nurej || '')}&caso_id=${caso.id}">${caso.nurej || 'N/A'}</a></td>
                    <td>${caso.nombre_proceso || '-'}</td>
                    <td class="fw-semibold">${sujetoDisplay}</td>
                    <td><span class="badge bg-info text-dark rounded-pill">${translateTipo(caso.tipo)}</span></td>
                    <td>${formatDate(caso.fecha)}</td>
                    <td><span class="badge ${estadoClass} rounded-pill px-3 py-2">${translateEstado(caso.estado)}</span></td>
                    <td>${caso.juzgado || '-'}</td>
                    <td>${caso.municipio || '-'}</td>
                    <td>
                        <div class="d-flex gap-2 justify-content-center">
                            <button class="btn btn-sm btn-outline-primary btn-edit" data-id="${caso.id}" title="Editar"><i class="fas fa-edit me-1"></i>Editar</button>
                            <button class="btn btn-sm btn-outline-danger btn-delete" data-id="${caso.id}" title="Eliminar"><i class="fas fa-trash me-1"></i>Eliminar</button>
                        </div>
                    </td>
                `;
                caseTableBody.appendChild(row);
            });
        }

        // Agregar event listeners a los botones de acción
        addActionButtonListeners();
    };

    // Traducir tipos de caso para mostrar en la tabla
    const translateTipo = (tipo) => {
        const tiposCaso = JSON.parse(sessionStorage.getItem('tiposCaso') || '[]');
        const tipoEncontrado = tiposCaso.find(t => t.valor === tipo);
        return tipoEncontrado ? tipoEncontrado.nombre : tipo;
    };

    // Traducir estados para mostrar en la tabla
    const translateEstado = (estado) => {
        const estados = {
            'activo': 'Activo',
            'archivado': 'Archivado',
            'pendiente': 'Pendiente',
            'concluido': 'Concluido'
        };
        return estados[estado] || estado;
    };

    // Formatear fecha para mostrar en la tabla
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    };

    // Agregar event listeners a los botones de acción en la tabla
    const addActionButtonListeners = () => {
        document.querySelectorAll('.btn-edit').forEach(button => {
            button.addEventListener('click', () => {
                const caseId = parseInt(button.getAttribute('data-id'));
                editCase(caseId);
            });
        });

        document.querySelectorAll('.btn-delete').forEach(button => {
            button.addEventListener('click', () => {
                const caseId = parseInt(button.getAttribute('data-id'));
                showDeleteConfirmation(caseId);
            });
        });
    };

    // Mostrar modal para agregar un nuevo caso
    const showAddCaseModal = async () => {
        caseModalTitle.textContent = 'Nuevo Caso';
        caseForm.reset();

        // Establecer fecha actual por defecto
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('case-fecha').value = today;

        // Generar nuevo ID
        const cases = await getCases();
        const newId = cases.length > 0 ? Math.max(...cases.map(caso => caso.id)) + 1 : 1;
        document.getElementById('case-id').value = newId;

        // Limpiar campos de sujetos procesales
        document.getElementById('case-sujeto').value = '';
        document.getElementById('case-sujeto1-tipo').value = '';
        document.getElementById('case-sujeto1-nombre').value = '';
        document.getElementById('case-sujeto1-carnet').value = '';
        document.getElementById('case-sujeto1-direccion').value = '';
        document.getElementById('case-sujeto2-tipo').value = '';
        document.getElementById('case-sujeto2-nombre').value = '';
        document.getElementById('case-sujeto2-carnet').value = '';
        document.getElementById('case-sujeto2-direccion').value = '';

        // Limpiar campos de juzgado, municipio y nombre del proceso
        document.getElementById('case-juzgado').value = '';
        document.getElementById('case-municipio').value = '';
        document.getElementById('case-nombre-proceso').value = '';

        // Cargar tipos de caso personalizados
        loadTiposCaso();

        // Mostrar modal
        caseModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    };

    // Cargar tipos de caso personalizados en el selector
    const loadTiposCaso = () => {
        const tiposCaso = JSON.parse(sessionStorage.getItem('tiposCaso') || '[]');
        const selectElement = document.getElementById('case-tipo');

        // Mantener solo las opciones predeterminadas
        selectElement.innerHTML = '';

        // Agregar tipos de caso
        tiposCaso.forEach(tipo => {
            const option = document.createElement('option');
            option.value = tipo.valor;
            option.textContent = tipo.nombre;
            selectElement.appendChild(option);
        });
    };

    // Mostrar modal para agregar un nuevo tipo de caso
    const showAddTipoModal = () => {
        tipoForm.reset();
        tipoModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    };

    // Mostrar modal para editar un caso existente
    const editCase = async (caseId) => {
        const cases = await getCases();
        const caso = cases.find(c => c.id === caseId);

        if (caso) {
            caseModalTitle.textContent = 'Editar Caso';

            // Llenar formulario con datos del caso
            document.getElementById('case-id').value = caso.id;
            document.getElementById('case-nurej').value = caso.nurej;

            // Procesar el campo de sujeto procesal
            const sujetoCompleto = caso.sujeto;

            // Definir prefijos de tipos de sujeto
            const tiposPrefijos = {
                'victima': '[victima] ',
                'demandante': '[demandante] ',
                'accionante': '[accionante] ',
                'denunciado': '[denunciado] ',
                'demandado': '[demandado] ',
                'accionado': '[accionado] '
            };

            // Inicializar valores para los dos sujetos
            let sujeto1Tipo = '';
            let sujeto1Nombre = '';
            let sujeto1Carnet = '';
            let sujeto1Direccion = '';
            let sujeto2Tipo = '';
            let sujeto2Nombre = '';
            let sujeto2Carnet = '';
            let sujeto2Direccion = '';

            // Función para extraer información de un sujeto
            const extraerInfoSujeto = (textoSujeto) => {
                let tipo = '';
                let nombre = '';
                let carnet = '';
                let direccion = '';

                // Extraer tipo de sujeto
                for (const [tipoKey, prefijo] of Object.entries(tiposPrefijos)) {
                    if (textoSujeto.startsWith(prefijo)) {
                        tipo = tipoKey;
                        textoSujeto = textoSujeto.substring(prefijo.length);
                        break;
                    }
                }

                // Extraer nombre, carnet y dirección
                const partes = textoSujeto.split(' | ');
                nombre = partes[0];

                // Buscar carnet y dirección si existen
                partes.forEach(parte => {
                    if (parte.startsWith('CI: ')) {
                        carnet = parte.substring(4);
                    } else if (parte.startsWith('Dir: ')) {
                        direccion = parte.substring(5);
                    }
                });

                return { tipo, nombre, carnet, direccion };
            };

            // Dividir el string de sujetos si contiene el separador
            if (sujetoCompleto.includes(' && ')) {
                const sujetos = sujetoCompleto.split(' && ');

                // Procesar primer sujeto
                const infoSujeto1 = extraerInfoSujeto(sujetos[0]);
                sujeto1Tipo = infoSujeto1.tipo;
                sujeto1Nombre = infoSujeto1.nombre;
                sujeto1Carnet = infoSujeto1.carnet;
                sujeto1Direccion = infoSujeto1.direccion;

                // Procesar segundo sujeto si existe
                if (sujetos.length > 1) {
                    const infoSujeto2 = extraerInfoSujeto(sujetos[1]);
                    sujeto2Tipo = infoSujeto2.tipo;
                    sujeto2Nombre = infoSujeto2.nombre;
                    sujeto2Carnet = infoSujeto2.carnet;
                    sujeto2Direccion = infoSujeto2.direccion;
                }
            } else {
                // Caso de un solo sujeto
                const infoSujeto = extraerInfoSujeto(sujetoCompleto);
                sujeto1Tipo = infoSujeto.tipo;
                sujeto1Nombre = infoSujeto.nombre;
                sujeto1Carnet = infoSujeto.carnet;
                sujeto1Direccion = infoSujeto.direccion;
            }

            // Actualizar campos en el formulario
            document.getElementById('case-sujeto').value = sujetoCompleto;
            document.getElementById('case-sujeto1-tipo').value = sujeto1Tipo;
            document.getElementById('case-sujeto1-nombre').value = sujeto1Nombre;
            document.getElementById('case-sujeto1-carnet').value = sujeto1Carnet;
            document.getElementById('case-sujeto1-direccion').value = sujeto1Direccion;
            document.getElementById('case-sujeto2-tipo').value = sujeto2Tipo;
            document.getElementById('case-sujeto2-nombre').value = sujeto2Nombre;
            document.getElementById('case-sujeto2-carnet').value = sujeto2Carnet;
            document.getElementById('case-sujeto2-direccion').value = sujeto2Direccion;

            document.getElementById('case-tipo').value = caso.tipo;
            document.getElementById('case-fecha').value = caso.fecha;
            document.getElementById('case-estado').value = caso.estado;
            document.getElementById('case-juzgado').value = caso.juzgado || '';
            document.getElementById('case-municipio').value = caso.municipio || '';
            document.getElementById('case-nombre-proceso').value = caso.nombre_proceso || '';
            document.getElementById('case-descripcion').value = caso.descripcion || '';

            // Mostrar modal
            caseModal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    };

    // Mostrar confirmación para eliminar caso
    const showDeleteConfirmation = async (caseId) => {
        const cases = await getCases();
        const caso = cases.find(c => c.id === caseId);

        if (caso) {
            document.getElementById('confirm-message').textContent = `¿Está seguro que desea eliminar el caso ${caso.nurej} de ${caso.sujeto}?`;

            // Guardar ID del caso a eliminar en el botón de confirmación
            confirmOkBtn.setAttribute('data-id', caseId);

            // Mostrar modal de confirmación
            confirmModal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    };

    // Eliminar caso
    const deleteCase = async (caseId) => {
        const token = sessionStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:5000/api/casos/${caseId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error('No se pudo eliminar el caso');
            }

            // Actualizar filteredCases si hay una búsqueda activa
            if (filteredCases.length > 0) {
                filteredCases = filteredCases.filter(caso => caso.id !== caseId);

                // Ajustar página actual si es necesario
                const totalPages = Math.ceil(filteredCases.length / casesPerPage);
                if (currentPage > totalPages && totalPages > 0) {
                    currentPage = totalPages;
                }
            }

            // Actualizar tabla
            await renderCaseTable();
        } catch (error) {
            console.error('Error al eliminar caso:', error);
            alert('Error al eliminar el caso: ' + error.message);
        }
    };

    // Buscar casos
    const searchCases = async () => {
        const searchValue = searchInput.value.trim().toLowerCase();
        const type = searchType.value;

        if (searchValue === '') {
            filteredCases = [];
            currentPage = 1;
            await renderCaseTable();
            return;
        }

        const cases = await getCases();

        // Filtrar casos según el tipo de búsqueda
        if (type === 'nurej') {
            filteredCases = cases.filter(caso =>
                caso.nurej.toLowerCase().includes(searchValue)
            );
        } else if (type === 'sujeto') {
            filteredCases = cases.filter(caso =>
                caso.sujeto.toLowerCase().includes(searchValue)
            );
        }

        // Resetear a la primera página y actualizar tabla
        currentPage = 1;
        await renderCaseTable();
    };

    // Inicializar la página
    const init = () => {
        
        // Inicializar datos
        initializeCases();

        // Renderizar tabla inicial
        renderCaseTable();

        // Event listeners
        addCaseBtn.addEventListener('click', showAddCaseModal);

        // Event listener para el botón de agregar tipo de caso
        addTipoBtn.addEventListener('click', showAddTipoModal);

        // Event listeners para los combo box de tipo de sujeto procesal
        const sujeto1TipoSelect = document.getElementById('case-sujeto1-tipo');
        const sujeto1NombreInput = document.getElementById('case-sujeto1-nombre');
        const sujeto2TipoSelect = document.getElementById('case-sujeto2-tipo');
        const sujeto2NombreInput = document.getElementById('case-sujeto2-nombre');

        // Enfocar el campo de nombre cuando se selecciona un tipo (primer sujeto)
        sujeto1TipoSelect.addEventListener('change', () => {
            if (sujeto1TipoSelect.value) {
                sujeto1NombreInput.focus();
            }
        });

        // Enfocar el campo de nombre cuando se selecciona un tipo (segundo sujeto)
        sujeto2TipoSelect.addEventListener('change', () => {
            if (sujeto2TipoSelect.value) {
                sujeto2NombreInput.focus();
            }
        });

        // Cerrar modales
        closeModalButtons.forEach(button => {
            button.addEventListener('click', () => {
                document.querySelectorAll('.modal').forEach(modal => {
                    modal.classList.remove('show');
                });
                document.body.style.overflow = '';
            });
        });

        // Cerrar modal al hacer clic fuera del contenido
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('show');
                    document.body.style.overflow = '';
                }
            });
        });

        // Función corregida para manejar envío del formulario de caso
        caseForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            console.log('🔄 Iniciando creación/edición de caso...');

            try {
                // Obtener valores del formulario
                const caseId = parseInt(document.getElementById('case-id').value);
                const nurej = document.getElementById('case-nurej').value.trim();
                const sujeto1Tipo = document.getElementById('case-sujeto1-tipo').value;
                const sujeto1Nombre = document.getElementById('case-sujeto1-nombre').value.trim();
                const sujeto1Carnet = document.getElementById('case-sujeto1-carnet').value.trim();
                const sujeto1Direccion = document.getElementById('case-sujeto1-direccion').value.trim();
                const sujeto2Tipo = document.getElementById('case-sujeto2-tipo').value;
                const sujeto2Nombre = document.getElementById('case-sujeto2-nombre').value.trim();
                const sujeto2Carnet = document.getElementById('case-sujeto2-carnet').value.trim();
                const sujeto2Direccion = document.getElementById('case-sujeto2-direccion').value.trim();
                const tipo = document.getElementById('case-tipo').value;
                const fecha = document.getElementById('case-fecha').value;
                const estado = document.getElementById('case-estado').value;
                const juzgado = document.getElementById('case-juzgado').value.trim();
                const municipio = document.getElementById('case-municipio').value.trim();
                const nombreProceso = document.getElementById('case-nombre-proceso').value.trim();
                const descripcion = document.getElementById('case-descripcion').value.trim();

                console.log('📝 Datos del formulario:', {
                    caseId, nurej, sujeto1Tipo, sujeto1Nombre, tipo, fecha, estado
                });

                // Validación de campos obligatorios
                if (!nurej || !sujeto1Tipo || !sujeto1Nombre || !tipo || !fecha || !estado) {
                    const missingFields = [];
                    if (!nurej) missingFields.push('NUREJ/CUD');
                    if (!sujeto1Tipo) missingFields.push('Tipo de primer sujeto');
                    if (!sujeto1Nombre) missingFields.push('Nombre del primer sujeto');
                    if (!tipo) missingFields.push('Tipo de caso');
                    if (!fecha) missingFields.push('Fecha');
                    if (!estado) missingFields.push('Estado');

                    alert(`Por favor, complete los siguientes campos obligatorios:\n• ${missingFields.join('\n• ')}`);
                    return;
                }

                // Construir información del sujeto procesal
                const tiposPrefijos = {
                    'victima': '[victima] ',
                    'demandante': '[demandante] ',
                    'accionante': '[accionante] ',
                    'denunciado': '[denunciado] ',
                    'demandado': '[demandado] ',
                    'accionado': '[accionado] '
                };

                // Construir primer sujeto
                let sujeto1Info = sujeto1Nombre;
                if (sujeto1Carnet) sujeto1Info += ` | CI: ${sujeto1Carnet}`;
                if (sujeto1Direccion) sujeto1Info += ` | Dir: ${sujeto1Direccion}`;
                let sujeto1Completo = sujeto1Info;
                if (tiposPrefijos[sujeto1Tipo]) {
                    sujeto1Completo = `${tiposPrefijos[sujeto1Tipo]}${sujeto1Info}`;
                }

                // Construir segundo sujeto (si existe)
                let sujeto2Completo = '';
                if (sujeto2Tipo && sujeto2Nombre) {
                    let sujeto2Info = sujeto2Nombre;
                    if (sujeto2Carnet) sujeto2Info += ` | CI: ${sujeto2Carnet}`;
                    if (sujeto2Direccion) sujeto2Info += ` | Dir: ${sujeto2Direccion}`;
                    if (tiposPrefijos[sujeto2Tipo]) {
                        sujeto2Completo = `${tiposPrefijos[sujeto2Tipo]}${sujeto2Info}`;
                    } else {
                        sujeto2Completo = sujeto2Info;
                    }
                }

                // Combinar sujetos
                let sujetoCompleto = sujeto1Completo;
                if (sujeto2Completo) {
                    sujetoCompleto = `${sujeto1Completo} && ${sujeto2Completo}`;
                }

                console.log('👥 Sujeto procesal construido:', sujetoCompleto);

                // Crear objeto caso
                const caso = {
                    nurej,
                    sujeto: sujetoCompleto,
                    tipo,
                    fecha,
                    estado,
                    juzgado: juzgado || null,
                    municipio: municipio || null,
                    nombre_proceso: nombreProceso || null,
                    descripcion: descripcion || null
                };

                // Solo incluir ID si es edición
                const isEditing = caseModalTitle.textContent === 'Editar Caso';
                if (isEditing) {
                    caso.id = caseId;
                }

                console.log('📤 Objeto caso a enviar:', caso);

                // Verificar token
                const token = sessionStorage.getItem('token');
                if (!token) {
                    alert('Sesión expirada. Por favor, inicie sesión nuevamente.');
                    window.location.href = 'index.html';
                    return;
                }

                // Configurar request
                const method = isEditing ? 'PUT' : 'POST';
                const url = isEditing ? `http://localhost:5000/api/casos/${caseId}` : 'http://localhost:5000/api/casos';

                console.log(`🌐 Enviando ${method} a ${url}`);

                // Enviar request
                const response = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(caso)
                });

                console.log(`📡 Respuesta del servidor: ${response.status} ${response.statusText}`);

                if (!response.ok) {
                    let errorMessage = `Error ${response.status}: ${response.statusText}`;
                    try {
                        const errorData = await response.json();
                        console.error('❌ Error del servidor:', errorData);
                        errorMessage += `\n\nDetalles: ${errorData.error || errorData.message || 'Error desconocido'}`;
                        if (errorData.details) {
                            errorMessage += `\nInformación adicional: ${JSON.stringify(errorData.details, null, 2)}`;
                        }
                    } catch (parseError) {
                        console.error('❌ Error al parsear respuesta de error:', parseError);
                        errorMessage += '\n\nNo se pudo obtener información adicional del error.';
                    }
                    console.error('❌ Error completo:', errorMessage);
                    alert(errorMessage);
                    return;
                }

                // Procesar respuesta exitosa
                const savedCase = await response.json();
                console.log('✅ Caso guardado exitosamente:', savedCase);

                // Cerrar modal
                caseModal.classList.remove('show');
                document.body.style.overflow = '';

                // Limpiar filtros de búsqueda
                searchInput.value = '';
                filteredCases = [];

                // Actualizar tabla
                console.log('🔄 Actualizando tabla...');
                await renderCaseTable();

                // Mostrar mensaje de éxito
                const action = isEditing ? 'actualizado' : 'creado';
                alert(`Caso ${action} exitosamente: ${savedCase.nurej}`);

            } catch (error) {
                console.error('❌ Error en creación/edición de caso:', error);
                alert(`Error de red al guardar el caso: ${error.message}\n\nVerifique que el servidor esté funcionando correctamente.`);
            }
        });

        // Manejar confirmación de eliminación
        confirmOkBtn.addEventListener('click', async () => {
            const caseId = parseInt(confirmOkBtn.getAttribute('data-id'));
            await deleteCase(caseId);
            confirmModal.classList.remove('show');
            document.body.style.overflow = '';
        });

        // Manejar cancelación de eliminación
        confirmCancelBtn.addEventListener('click', () => {
            confirmModal.classList.remove('show');
            document.body.style.overflow = '';
        });

        // Manejar búsqueda
        searchBtn.addEventListener('click', searchCases);
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                searchCases();
            }
        });

        // Manejar envío del formulario de tipo de caso
        tipoForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const nombre = document.getElementById('tipo-nombre').value.trim();

            // Validar campos
            if (!nombre) {
                alert('Por favor, ingrese el nombre del tipo de caso.');
                return;
            }

            // Generar valor automáticamente a partir del nombre
            const valor = nombre.toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]/g, '_')
                .replace(/_{2,}/g, '_')
                .replace(/^_|_$/g, '');

            document.getElementById('tipo-valor').value = valor;

            // Obtener tipos de caso actuales
            let tiposCaso = JSON.parse(sessionStorage.getItem('tiposCaso') || '[]');

            // Verificar si el tipo ya existe
            if (tiposCaso.some(tipo => tipo.valor === valor)) {
                alert(`Ya existe un tipo de caso con el valor "${valor}". Por favor, use un nombre diferente.`);
                return;
            }

            // Agregar nuevo tipo
            tiposCaso.push({ valor, nombre });

            // Guardar cambios
            sessionStorage.setItem('tiposCaso', JSON.stringify(tiposCaso));

            // Actualizar selector de tipos
            loadTiposCaso();

            // Cerrar modal
            tipoModal.classList.remove('show');
            document.body.style.overflow = '';

            // Mostrar mensaje de éxito
            alert(`Tipo de caso "${nombre}" agregado correctamente.`);
        });

        // Manejar paginación
        prevPageBtn.addEventListener('click', async () => {
            if (currentPage > 1) {
                currentPage--;
                await renderCaseTable();
            }
        });

        nextPageBtn.addEventListener('click', async () => {
            const cases = filteredCases.length > 0 ? filteredCases : await getCases();
            const totalPages = Math.ceil(cases.length / casesPerPage);

            if (currentPage < totalPages) {
                currentPage++;
                await renderCaseTable();
            }
        });
    };

    // Iniciar la aplicación
    init();
});