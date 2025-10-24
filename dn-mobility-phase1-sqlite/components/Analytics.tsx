'use client'
import Script from 'next/script'

export default function Analytics(){
  const ga = process.env.NEXT_PUBLIC_GA_ID
  const matomoUrl = process.env.NEXT_PUBLIC_MATOMO_URL
  const matomoId = process.env.NEXT_PUBLIC_MATOMO_SITE_ID
  const consent = typeof window !== 'undefined' ? localStorage.getItem('cookie:analytics') : null

  return (
    <>
      {ga && consent==='granted' && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} strategy="afterInteractive" />
          <Script id="ga" strategy="afterInteractive">{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date()); gtag('config', '${ga}');
          `}</Script>
        </>
      )}
      {!ga && matomoUrl && matomoId && consent==='granted' && (
        <Script id="matomo" strategy="afterInteractive">{`
          var _paq = window._paq = window._paq || [];
          _paq.push(['trackPageView']); _paq.push(['enableLinkTracking']);
          (function() {
            var u='${matomoUrl}'; _paq.push(['setTrackerUrl', u+'matomo.php']); _paq.push(['setSiteId', '${matomoId}']);
            var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
            g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
          })();
        `}</Script>
      )}
    </>
  )
}
