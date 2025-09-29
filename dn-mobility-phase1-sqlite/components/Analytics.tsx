'use client'
import Script from 'next/script'
export default function Analytics(){
  const consent = typeof window !== 'undefined' ? localStorage.getItem('consent') : 'no'
  const ga = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  if(consent !== 'yes' || !ga) return null
  return (<>
    <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} strategy="afterInteractive"/>
    <Script id="ga-init" strategy="afterInteractive">
      {`window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date()); gtag('config', '${ga}');`}
    </Script>
  </>)
}
