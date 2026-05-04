document.getElementById('validateBtn').addEventListener('click', function() {
    const tagContent = document.getElementById('tagInput').value;
    if (!tagContent) return alert("Por favor, pega un tag para analizar.");
    analizarTag(tagContent);
});

function analizarTag(content) {
    const resultsArea = document.getElementById('results');
    resultsArea.classList.remove('hidden');

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(content, "text/xml");
    const rawContent = content.toLowerCase();

    // --- 1. AUDITORÍA DE MEDIAFILES ---
    const mediaFiles = xmlDoc.getElementsByTagName('MediaFile');
    let mediaDetails = "";
    let vpaidFound = false;

    for (let file of mediaFiles) {
        const type = file.getAttribute('type') || 'N/A';
        const api = file.getAttribute('apiFramework') || 'VAST (Pure)';
        const width = file.getAttribute('width');
        const height = file.getAttribute('height');
        
        if (api === 'VPAID' || type.includes('javascript')) vpaidFound = true;

        mediaDetails += `<li><strong>Type:</strong> ${type} | <strong>API:</strong> ${api} | <strong>Res:</strong> ${width}x${height}</li>`;
    }

    // --- 2. DETECCIÓN DE VERIFICACIÓN DETALLADA ---
    let verifDetail = "No se detectaron scripts de terceros.";
    let verifClass = "success";
    
    if (rawContent.includes('ias') || rawContent.includes('integralads')) {
        verifDetail = "<strong>IAS (Integral Ad Science):</strong> Detectado. Probable monitoreo de Viewability y Brand Safety.";
        verifClass = "alert";
    } else if (rawContent.includes('doubleverify')) {
        verifDetail = "<strong>DoubleVerify:</strong> Detectado. Incluye métricas de fraude y autenticidad.";
        verifClass = "alert";
    }

    // --- 3. ACTUALIZAR INTERFAZ (UI) ---
    
    // Status VPAID con detalles técnicos
    document.getElementById('vpaidCard').className = vpaidFound ? "result-card alert" : "result-card success";
    document.getElementById('vpaidStatus').innerHTML = `
        <div class="status-header">${vpaidFound ? "🔴 VPAID ACTIVO" : "🟢 VAST PURO"}</div>
        <ul class="technical-list">${mediaDetails || "No se encontraron MediaFiles"}</ul>
    `;

    // Status Verificación
    document.getElementById('verificationCard').className = `result-card ${verifClass}`;
    document.getElementById('verificationStatus').innerHTML = `
        <div class="status-header">Auditoría de Verificación</div>
        <p>${verifDetail}</p>
    `;

    // Sección de Partners
    const providers = ['ias', 'doubleverify', 'moat', 'integralads', 'comscore', 'omidsdk'];
    let detected = providers.filter(p => rawContent.includes(p));
    document.getElementById('detailsStatus').innerHTML = `
        <strong>Firmas de Tecnología Detectadas:</strong> ${detected.length > 0 ? detected.join(', ').toUpperCase() : "Ninguna"}
        <br><small style="color: #666;">* Este análisis se basa en el escaneo de nodos y parámetros de URL dentro del XML.</small>
    `;
}

function actualizarUI(cardId, textId, mensaje, isAlert) {
    const card = document.getElementById(cardId);
    const text = document.getElementById(textId);
    text.innerHTML = mensaje;
    card.className = isAlert ? "result-card alert" : "result-card success";
}
