/* ==========================================================================
   IMAGENS: reduz a foto antes de enviar ao servidor
   (fotos grandes viram base64 gigante e o servidor recusa o envio)
   Carregar DEPOIS do script.js
   ========================================================================== */
   (function () {
    var LADO_MAXIMO = 512;     // px do maior lado
    var QUALIDADE = 0.85;      // 0 a 1
  
    var originalConverter = window.converterImagemParaBase64;
  
    function lerArquivo(arquivo) {
      return new Promise(function (resolve, reject) {
        var leitor = new FileReader();
        leitor.onload = function () { resolve(leitor.result); };
        leitor.onerror = reject;
        leitor.readAsDataURL(arquivo);
      });
    }
  
    function carregarImagem(src) {
      return new Promise(function (resolve, reject) {
        var img = new Image();
        img.onload = function () { resolve(img); };
        img.onerror = reject;
        img.src = src;
      });
    }
  
    function reduzir(arquivo) {
      return lerArquivo(arquivo).then(carregarImagem).then(function (img) {
        var escala = Math.min(1, LADO_MAXIMO / Math.max(img.width, img.height));
        var canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * escala));
        canvas.height = Math.max(1, Math.round(img.height * escala));
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        // WebP mantém transparência e é leve; se o navegador não suportar, cai para PNG
        return canvas.toDataURL('image/webp', QUALIDADE);
      });
    }
  
    window.converterImagemParaBase64 = function (event, idCampo) {
      var arquivo = event && event.target && event.target.files && event.target.files[0];
      if (!arquivo) return;
  
      reduzir(arquivo).then(function (dataUrl) {
        var campo = document.getElementById(idCampo);
        if (campo) campo.value = dataUrl;
      }).catch(function () {
        // Se algo falhar, usa o comportamento original
        if (typeof originalConverter === 'function') originalConverter(event, idCampo);
      });
    };
  })();