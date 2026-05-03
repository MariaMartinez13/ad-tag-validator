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

    // 1. Detección de VPAID (Buscando apiFramework o MediaFiles JS)
    const mediaFiles = xmlDoc.getElementsByTagName('MediaFile');
    let vpaidFound = false;
    
    for (let file of mediaFiles) {
        if (file.getAttribute('apiFramework') === 'VPAID' || 
            file.getAttribute('type') === 'application/javascript') {
            vpaidFound = true;
            break;
        }
    }

    // 2. Detección de Verificación (Nodos AdVerifications o Extensions)
    const hasVerifNodes = xmlDoc.getElementsByTagName('AdVerifications').length > 0;
    const rawContent = content.toLowerCase();
    const providers = ['ias', 'doubleverify', 'moat', 'integralads', 'comscore', 'omidsdk'];
    let detected = providers.filter(p => rawContent.includes(p));

    // Actualizar Interfaz
    actualizarUI('vpaidCard', 'vpaidStatus', vpaidFound ? "🔴 VPAID Detectado" : "🟢 Clean (No VPAID)", vpaidFound);
    actualizarUI('verificationCard', 'verificationStatus', hasVerifNodes || detected.length > 0 ? "⚠️ Verificación Detectada" : "🟢 Sin Scripts Externos", hasVerifNodes || detected.length > 0);
    
    document.getElementById('detailsStatus').innerText = detected.length > 0 
        ? "Se identificaron rastros de: " + detected.join(', ').toUpperCase() 
        : "No se detectaron proveedores específicos.";
}

function actualizarUI(cardId, textId, mensaje, isNegative) {
    const card = document.getElementById(cardId);
    const text = document.getElementById(textId);
    
    text.innerText = mensaje;
    card.className = isNegative ? "result-card alert" : "result-card success";
}
