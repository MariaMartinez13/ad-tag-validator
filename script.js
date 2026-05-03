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

    // 1. DETECCIÓN AGRESIVA DE VPAID
    const mediaFiles = xmlDoc.getElementsByTagName('MediaFile');
    let vpaidInMediaFile = false;
    
    // Revisar MediaFiles (Método estándar)
    for (let file of mediaFiles) {
        const apiFramework = file.getAttribute('apiFramework');
        const type = file.getAttribute('type');
        if (apiFramework === 'VPAID' || (type && type.includes('javascript'))) {
            vpaidInMediaFile = true;
            break;
        }
    }

    // Revisar rastros en todo el XML (Lo que ven los scanners de los publishers)
    const hasVpaidTraces = rawContent.includes('vpaid');

    // 2. DETECCIÓN DE WRAPPERS (El "escondite" común)
    const isWrapper = xmlDoc.getElementsByTagName('VASTAdTagURI').length > 0;

    // 3. LÓGICA DE VERIFICACIÓN (Monitoring vs Blocking)
    let typeFound = "Ninguno";
    let isBlocking = false;
    if (rawContent.includes('fw_type=blocking') || rawContent.includes('block') || rawContent.includes('prevent')) {
        typeFound = "Blocking (Filtro Activo)";
        isBlocking = true;
    } else if (rawContent.includes('monitor') || rawContent.includes('viewability') || rawContent.includes('measur')) {
        typeFound = "Monitoring (Solo Medición)";
    }

    // 4. ACTUALIZAR INTERFAZ
    // Estado de VPAID
    let vpaidMessage = "🟢 Clean (No VPAID)";
    let vpaidAlert = false;
    if (vpaidInMediaFile) {
        vpaidMessage = "🔴 VPAID DETECTADO en MediaFile";
        vpaidAlert = true;
    } else if (hasVpaidTraces) {
        vpaidMessage = "⚠️ RASTROS DE VPAID (En Extensiones/Metadatos)";
        vpaidAlert = true; // Alertamos porque esto es lo que confunde al publisher
    }
    actualizarUI('vpaidCard', 'vpaidStatus', vpaidMessage, vpaidAlert);

    // Estado de Verificación
    actualizarUI('verificationCard', 'verificationStatus', isWrapper ? "🔗 WRAPPER DETECTADO (Analizar link interno)" : `Tipo: ${typeFound}`, isWrapper || isBlocking);

    // Detalles de Partners
    const providers = ['ias', 'doubleverify', 'moat', 'integralads', 'comscore', 'omidsdk'];
    let detected = providers.filter(p => rawContent.includes(p));
    document.getElementById('detailsStatus').innerText = isWrapper 
        ? "Este tag es un Wrapper. Para un análisis real, debes abrir la URL que está dentro de <VASTAdTagURI> y pegar ese contenido aquí."
        : (detected.length > 0 ? "Partners: " + detected.join(', ').toUpperCase() : "No se detectaron firmas de proveedores.");
}

function actualizarUI(cardId, textId, mensaje, isAlert) {
    const card = document.getElementById(cardId);
    const text = document.getElementById(textId);
    text.innerText = mensaje;
    card.className = isAlert ? "result-card alert" : "result-card success";
}
