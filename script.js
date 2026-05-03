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

    // 1. Detección de VPAID
    const mediaFiles = xmlDoc.getElementsByTagName('MediaFile');
    let vpaidFound = false;
    for (let file of mediaFiles) {
        if (file.getAttribute('apiFramework') === 'VPAID' || file.getAttribute('type') === 'application/javascript') {
            vpaidFound = true;
            break;
        }
    }

    // 2. Lógica Avanzada de Verificación (Monitoring vs Blocking)
    let typeFound = "Ninguno";
    let isBlocking = false;

    // Palabras clave comunes en las URLs de los proveedores
    if (rawContent.includes('fw_type=blocking') || rawContent.includes('block') || rawContent.includes('prevent')) {
        typeFound = "Blocking (Filtro Activo)";
        isBlocking = true;
    } else if (rawContent.includes('monitor') || rawContent.includes('viewability') || rawContent.includes('measur')) {
        typeFound = "Monitoring (Solo Medición)";
    } else if (xmlDoc.getElementsByTagName('AdVerifications').length > 0) {
        typeFound = "Verificación Detectada (Revisar URL)";
    }

    // 3. Proveedores específicos
    const providers = ['ias', 'doubleverify', 'moat', 'integralads', 'comscore', 'omidsdk'];
    let detected = providers.filter(p => rawContent.includes(p));

    // Actualizar Interfaz
    actualizarUI('vpaidCard', 'vpaidStatus', vpaidFound ? "🔴 VPAID Activo" : "🟢 Sin VPAID", vpaidFound);
    
    // Mostramos el tipo de verificación detectado
    actualizarUI('verificationCard', 'verificationStatus', `Tipo: ${typeFound}`, isBlocking);
    
    document.getElementById('detailsStatus').innerText = detected.length > 0 
        ? "Partners en el tag: " + detected.join(', ').toUpperCase() 
        : "No se identificaron firmas de proveedores conocidos.";
}

function actualizarUI(cardId, textId, mensaje, isAlert) {
    const card = document.getElementById(cardId);
    const text = document.getElementById(textId);
    text.innerText = mensaje;
    card.className = isAlert ? "result-card alert" : "result-card success";
}
