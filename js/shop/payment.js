/* ==========================================================================
   HEGYHÁTI FINOMSÁGOK, fizetési provider-seam
   FLAGS.PAYMENT_PROVIDER: 'demo' (most) | 'barion' (éleskor).
   Éles Barion-bekötéskor CSAK a functions/api/payment/* jön létre + a flag vált,
   ez a fájl és a frontend többi része NEM változik. Lásd functions/README.md.
   ========================================================================== */
(function () {
  const providers = {
    demo: {
      start(order) {
        location.href = 'fizetes-demo.html?order=' + encodeURIComponent(order.id);
      },
    },
    barion: {
      start(order) {
        fetch('/api/payment/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: order.id, order }),
        })
          .then(r => r.json())
          .then(d => {
            if (d && d.gatewayUrl) location.href = d.gatewayUrl;
            else alert('A fizetés indítása nem sikerült. Kérjük, próbálja újra, vagy válassza az átvételkori fizetést.');
          })
          .catch(() => alert('A fizetés indítása nem sikerült. Kérjük, próbálja újra, vagy válassza az átvételkori fizetést.'));
      },
    },
  };

  window.HFPAY = {
    start(order) {
      const prov = providers[HF.FLAGS.PAYMENT_PROVIDER] || providers.demo;
      prov.start(order);
    },
  };
})();
