// Script para la página de Gestión de Procedimientos

document.addEventListener('DOMContentLoaded', function() {
    // Verificar si el usuario está autenticado
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    
    // Si no ha iniciado sesión, mostrar alerta y redirigir a la página principal
    if (isLoggedIn !== 'true') {
        // Mostrar alerta
        alert('Acceso restringido. Debe iniciar sesión para acceder a esta página.');
        // Redirigir a la página principal
        window.location.href = 'index.html';
        return;
    }
    
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
    
    // Inicializar datos de casos de ejemplo si no existen
    const initializeCases = () => {
        if (!localStorage.getItem('cases')) {
            const defaultCases = [
                { id: 1, nurej: '10012023', sujeto: 'Juan Pérez Gómez', tipo: 'penal', fecha: '2023-01-15', estado: 'activo', descripcion: 'Caso de robo agravado en la zona central.' },
                { id: 2, nurej: '20022023', sujeto: 'María López Sánchez', tipo: 'civil', fecha: '2023-02-20', estado: 'pendiente', descripcion: 'Demanda por incumplimiento de contrato.' },
                { id: 3, nurej: '30032023', sujeto: 'Carlos Rodríguez Vega', tipo: 'familiar', fecha: '2023-03-10', estado: 'activo', descripcion: 'Proceso de divorcio y custodia de menores.' },
                { id: 4, nurej: '40042023', sujeto: 'Ana Martínez Flores', tipo: 'laboral', fecha: '2023-04-05', estado: 'concluido', descripcion: 'Demanda por despido injustificado.' },
                { id: 5, nurej: '50052023', sujeto: 'Roberto Sánchez Díaz', tipo: 'administrativo', fecha: '2023-05-12', estado: 'archivado', descripcion: 'Recurso administrativo contra resolución municipal.' },
                { id: 6, nurej: '60062023', sujeto: 'Laura Gutiérrez Paz', tipo: 'penal', fecha: '2023-06-18', estado: 'activo', descripcion: 'Denuncia por estafa.' }
            ];
            localStorage.setItem('cases', JSON.stringify(defaultCases));
        }
        
        // Inicializar tipos de caso personalizados si no existen
        if (!localStorage.getItem('tiposCaso')) {
            const defaultTipos = [
                { valor: 'penal', nombre: 'Penal' },
                { valor: 'civil', nombre: 'Civil' },
                { valor: 'familiar', nombre: 'Familiar' },
                { valor: 'laboral', nombre: 'Laboral' },
                { valor: 'administrativo', nombre: 'Administrativo' }
            ];
            localStorage.setItem('tiposCaso', JSON.stringify(defaultTipos));
        }
    };
    
    // Obtener casos del localStorage
    const getCases = () => {
        return JSON.parse(localStorage.getItem('cases') || '[]');
    };
    
    // Guardar casos en localStorage
    const saveCases = (cases) => {
        localStorage.setItem('cases', JSON.stringify(cases));
    };
    
    // Renderizar la tabla de casos con paginación
    const renderCaseTable = () => {
        const cases = filteredCases.length > 0 ? filteredCases : getCases();
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
            emptyRow.innerHTML = `<td colspan="10" style="text-align: center;">No se encontraron casos</td>`;
            caseTableBody.appendChild(emptyRow);
        } else {
            paginatedCases.forEach(caso => {
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
                
                row.innerHTML = `
                    <td class="fw-bold">${caso.id}</td>
                    <td><a href="actividades.html?nurej=${encodeURIComponent(caso.nurej)}" class="text-primary text-decoration-underline">${caso.nurej}</a></td>
                    <td>${caso.nombreProceso || '-'}</td>
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
        // Obtener tipos personalizados del localStorage
        const tiposCaso = JSON.parse(localStorage.getItem('tiposCaso') || '[]');
        const tipoEncontrado = tiposCaso.find(t => t.valor === tipo);
        
        // Si se encuentra el tipo, devolver su nombre, de lo contrario devolver el valor original
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
        // Botones de editar
        document.querySelectorAll('.btn-edit').forEach(button => {
            button.addEventListener('click', () => {
                const caseId = parseInt(button.getAttribute('data-id'));
                editCase(caseId);
            });
        });
        
        // Botones de eliminar
        document.querySelectorAll('.btn-delete').forEach(button => {
            button.addEventListener('click', () => {
                const caseId = parseInt(button.getAttribute('data-id'));
                showDeleteConfirmation(caseId);
            });
        });
    };
    
    // Mostrar modal para agregar un nuevo caso
    const showAddCaseModal = () => {
        caseModalTitle.textContent = 'Nuevo Caso';
        caseForm.reset();
        
        // Establecer fecha actual por defecto
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('case-fecha').value = today;
        
        // Generar nuevo ID
        const cases = getCases();
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
        const tiposCaso = JSON.parse(localStorage.getItem('tiposCaso') || '[]');
        const selectElement = document.getElementById('case-tipo');
        
        // Mantener solo las opciones predeterminadas (las primeras 6)
        const defaultOptions = Array.from(selectElement.options).slice(0, 6);
        selectElement.innerHTML = '';
        
        // Volver a agregar las opciones predeterminadas
        defaultOptions.forEach(option => {
            selectElement.appendChild(option);
        });
        
        // Agregar tipos personalizados que no sean los predeterminados
        const defaultValues = ['penal', 'civil', 'familiar', 'laboral', 'administrativo'];
        tiposCaso.forEach(tipo => {
            if (!defaultValues.includes(tipo.valor)) {
                const option = document.createElement('option');
                option.value = tipo.valor;
                option.textContent = tipo.nombre;
                selectElement.appendChild(option);
            }
        });
    };
    
    // Mostrar modal para agregar un nuevo tipo de caso
    const showAddTipoModal = () => {
        tipoForm.reset();
        tipoModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    };
    
    // Mostrar modal para editar un caso existente
    const editCase = (caseId) => {
        const cases = getCases();
        const caso = cases.find(c => c.id === caseId);
        
        if (caso) {
            caseModalTitle.textContent = 'Editar Caso';
            
            // Llenar formulario con datos del caso
            document.getElementById('case-id').value = caso.id;
            document.getElementById('case-nurej').value = caso.nurej;
            
            // Procesar el campo de sujeto procesal
            const sujetoCompleto = caso.sujeto;
            
            // Verificar si el sujeto tiene formato con tipo
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
                // Caso de un solo sujeto (compatibilidad con datos antiguos)
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
            document.getElementById('case-nombre-proceso').value = caso.nombreProceso || '';
            document.getElementById('case-descripcion').value = caso.descripcion || '';
            
            // Mostrar modal
            caseModal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    };
    
    // Mostrar confirmación para eliminar caso
    const showDeleteConfirmation = (caseId) => {
        const cases = getCases();
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
    const deleteCase = (caseId) => {
        let cases = getCases();
        cases = cases.filter(caso => caso.id !== caseId);
        saveCases(cases);
        
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
        renderCaseTable();
    };
    
    // Buscar casos
    const searchCases = () => {
        const searchValue = searchInput.value.trim().toLowerCase();
        const type = searchType.value;
        
        if (searchValue === '') {
            filteredCases = [];
            currentPage = 1;
            renderCaseTable();
            return;
        }
        
        const cases = getCases();
        
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
        renderCaseTable();
    };
    
    // Verificar acceso a la página
    const checkPageAccess = () => {
        const isLoggedIn = sessionStorage.getItem('isLoggedIn');
        const userRole = sessionStorage.getItem('userRole');
        
        // Si no ha iniciado sesión, redirigir a la página principal
        if (isLoggedIn !== 'true') {
            alert('Debe iniciar sesión para acceder a esta página.');
            window.location.href = 'index.html';
            return false;
        }
        
        // Verificar roles permitidos (admin, abogado)
        if (userRole !== 'admin' && userRole !== 'abogado') {
            alert('No tiene permisos para acceder a esta página.');
            window.location.href = 'index.html';
            return false;
        }
        
        return true;
    };
    

    
    // Inicializar la página
    const init = () => {
        // Verificar acceso
        if (!checkPageAccess()) return;
        
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
        
        // Manejar envío del formulario de caso
        caseForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const caseId = parseInt(document.getElementById('case-id').value);
            const nurej = document.getElementById('case-nurej').value.trim();
            
            // Obtener datos del primer sujeto
            const sujeto1Tipo = document.getElementById('case-sujeto1-tipo').value;
            const sujeto1Nombre = document.getElementById('case-sujeto1-nombre').value.trim();
            const sujeto1Carnet = document.getElementById('case-sujeto1-carnet').value.trim();
            const sujeto1Direccion = document.getElementById('case-sujeto1-direccion').value.trim();
            
            // Obtener datos del segundo sujeto
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
            
            // Validar campos obligatorios (al menos el primer sujeto es obligatorio)
            if (!nurej || !sujeto1Tipo || !sujeto1Nombre || !tipo || !fecha || !estado) {
                alert('Por favor, complete todos los campos obligatorios.');
                return;
            }
            
            // Definir prefijos para cada tipo de sujeto
            const tiposPrefijos = {
                'victima': '[victima] ',
                'demandante': '[demandante] ',
                'accionante': '[accionante] ',
                'denunciado': '[denunciado] ',
                'demandado': '[demandado] ',
                'accionado': '[accionado] '
            };
            
            // Crear información completa del primer sujeto (nombre, carnet, dirección)
            let sujeto1Info = sujeto1Nombre;
            if (sujeto1Carnet) sujeto1Info += ` | CI: ${sujeto1Carnet}`;
            if (sujeto1Direccion) sujeto1Info += ` | Dir: ${sujeto1Direccion}`;
            
            // Combinar tipo y datos para el primer sujeto
            let sujeto1Completo = sujeto1Info;
            if (tiposPrefijos[sujeto1Tipo]) {
                sujeto1Completo = `${tiposPrefijos[sujeto1Tipo]}${sujeto1Info}`;
            }
            
            // Crear información completa del segundo sujeto (si existe)
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
            
            // Combinar ambos sujetos en el campo oculto
            let sujetoCompleto = sujeto1Completo;
            if (sujeto2Completo) {
                sujetoCompleto = `${sujeto1Completo} && ${sujeto2Completo}`;
            }
            
            // Actualizar el campo oculto
            document.getElementById('case-sujeto').value = sujetoCompleto;
            
            // Obtener casos actuales
            let cases = getCases();
            
            // Verificar si es un nuevo caso o una edición
            const existingCaseIndex = cases.findIndex(c => c.id === caseId);
            
            if (existingCaseIndex >= 0) {
                // Actualizar caso existente
                cases[existingCaseIndex] = {
                    ...cases[existingCaseIndex],
                    nurej,
                    sujeto: sujetoCompleto,
                    tipo,
                    fecha,
                    estado,
                    juzgado,
                    municipio,
                    nombreProceso,
                    descripcion
                };
            } else {
                // Agregar nuevo caso
                cases.push({
                    id: caseId,
                    nurej,
                    sujeto: sujetoCompleto,
                    tipo,
                    fecha,
                    estado,
                    juzgado,
                    municipio,
                    nombreProceso,
                    descripcion
                });
            }
            
            // Guardar cambios
            saveCases(cases);
            
            // Cerrar modal y actualizar tabla
            caseModal.classList.remove('show');
            document.body.style.overflow = '';
            
            // Limpiar búsqueda y mostrar todos los casos
            searchInput.value = '';
            filteredCases = [];
            renderCaseTable();
        });
        
        // Manejar confirmación de eliminación
        confirmOkBtn.addEventListener('click', () => {
            const caseId = parseInt(confirmOkBtn.getAttribute('data-id'));
            deleteCase(caseId);
            
            // Cerrar modal de confirmación
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
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
                .replace(/[^a-z0-9]/g, '_') // Reemplazar caracteres especiales con guiones bajos
                .replace(/_{2,}/g, '_') // Eliminar guiones bajos múltiples
                .replace(/^_|_$/g, ''); // Eliminar guiones bajos al inicio y final
            
            document.getElementById('tipo-valor').value = valor;
            
            // Obtener tipos de caso actuales
            let tiposCaso = JSON.parse(localStorage.getItem('tiposCaso') || '[]');
            
            // Verificar si el tipo ya existe
            if (tiposCaso.some(tipo => tipo.valor === valor)) {
                alert(`Ya existe un tipo de caso con el valor "${valor}". Por favor, use un nombre diferente.`);
                return;
            }
            
            // Agregar nuevo tipo
            tiposCaso.push({ valor, nombre });
            
            // Guardar cambios
            localStorage.setItem('tiposCaso', JSON.stringify(tiposCaso));
            
            // Actualizar selector de tipos
            loadTiposCaso();
            
            // Cerrar modal
            tipoModal.classList.remove('show');
            document.body.style.overflow = '';
            
            // Mostrar mensaje de éxito
            alert(`Tipo de caso "${nombre}" agregado correctamente.`);
        });
        
        // Manejar paginación
        prevPageBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderCaseTable();
            }
        });
        
        nextPageBtn.addEventListener('click', () => {
            const cases = filteredCases.length > 0 ? filteredCases : getCases();
            const totalPages = Math.ceil(cases.length / casesPerPage);
            
            if (currentPage < totalPages) {
                currentPage++;
                renderCaseTable();
            }
        });
    };
    
    // Iniciar la aplicación
    init();
});