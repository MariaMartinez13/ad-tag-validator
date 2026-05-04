document.getElementById('validateBtn').addEventListener('click', function() {
    const tagInput = document.getElementById('tagInput');
    const tagContent = tagInput.value.trim();
    
    if (!tagContent) {
        alert("Por favor, pega un tag para analizar.");
        return;
    }
    analizarTag(tagContent);
});

function analizarTag(content) {
    const resultsArea = document.getElementById('results');
    resultsArea.classList.remove('hidden');

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(content, "text/xml");
    
    // Verificar si el XML es válido
    if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
        alert("Error: El contenido pegado no es un XML válido. Revisa el tag.");
        return;
    }

    const rawContent = content.toLowerCase();

    // --- 1. AUDITORÍA DE MEDIAFILES ---
    const mediaFiles = xmlDoc.getElementsByTagName('MediaFile');
    let mediaDetails = "";
    let vpaidFound = false;

    for (let i = 0; i < mediaFiles.length; i++) {
        const file = mediaFiles[i];
        const type = file.getAttribute('type') || 'N/A';
        const api = file.getAttribute('apiFramework') || 'VAST (Pure)';
        const width = file.getAttribute('width') || '0';
        const height = file.getAttribute('height') || '0';
        
        if (api.toUpperCase() === 'VPAID' || type.includes('javascript')) {
            vpaidFound = true;
        }

        mediaDetails += `<li><strong>Type:</strong> ${type} | <strong>API:</strong> ${api} | <strong>Res:</strong> ${width}x${height}</li>`;
    }

    // --- 2. DETECCIÓN DE VERIFICACIÓN DETALLADA ---
    let verifDetail = "No se detectaron scripts de terceros.";
    let verifClass = "success";
    
    if (rawContent.includes('ias') || rawContent.includes('integralads')) {
        verifDetail = "<strong>IAS (Integral Ad Science):</strong> Detectado. Monitoreo de Viewability y Brand Safety activo.";
        verifClass = "alert";
    } else if (rawContent.includes('doubleverify')) {
        verifDetail = "<strong>DoubleVerify:</strong> Detectado. Incluye métricas de fraude y autenticidad.";
        verifClass = "alert";
    } else if (rawContent.includes('moat')) {
        verifDetail = "<strong>MOAT:</strong> Detectado. Analizando métricas de atención y visibilidad.";
        verifClass = "alert";
    }

    // --- 3. ACTUALIZAR INTERFAZ (UI) ---
    
    // Status VPAID
    const vpaidCard = document.getElementById('vpaidCard');
    const vpaidStatus = document.getElementById('vpaidStatus');
    vpaidCard.className = vpaidFound ? "result-card alert" : "result-card success";
    vpaidStatus.innerHTML = `
        <div class="status-header">${vpaidFound ? "🔴 VPAID ACTIVO" : "🟢 VAST PURO"}</div>
        <ul class="technical-list">${mediaDetails || "<li>No se encontraron MediaFiles</li>"}</ul>
    `;

    // Status Verificación
    const verificationCard = document.getElementById('verificationCard');
    const verificationStatus = document.getElementById('verificationStatus');
    verificationCard.className = `result-card ${verifClass}`;
    verificationStatus.innerHTML = `
        <div class="status-header">Auditoría de Verificación</div>
        <p>${verifDetail}</p>
    `;

    // Sección de Partners
    const providers = ['ias', 'doubleverify', 'moat', 'integralads', 'comscore', 'omidsdk'];
    let detected = providers.filter(p => rawContent.includes(p));
    const detailsStatus = document.getElementById('detailsStatus');
    detailsStatus.innerHTML = `
        <strong>Tecnología Detectada:</strong> ${detected.length > 0 ? detected.join(', ').toUpperCase() : "Ninguna"}
        <br><small style="color: #666;">* Análisis basado en escaneo de nodos y parámetros de URL.</small>
    `;
}
