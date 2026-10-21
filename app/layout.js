import "./globals.css";

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://rcldislampur.in"),
  title: { default:"RCLD Islampur | Online Computer Courses & Skill Development", template:"%s | RCLD Islampur" },
  description:"Explore RCLD Islampur online computer courses including CCA, DCA, ADCA, CCC, CAO, DWPD, DOM, DCST, DCAP and DHNT. Learn through structured lessons, resources and student progress tracking.",
  keywords:["RCLD Islampur","RCLD","computer courses Islampur","online computer courses","computer training Islampur","DCA","ADCA","CCA","CCC","web programming","computer accounting","hardware networking"],
  alternates:{canonical:"/"},
  openGraph:{title:"RCLD Islampur | Online Computer Courses",description:"Explore practical computer courses and online learning with RCLD Islampur.",url:"/",siteName:"RCLD Islampur",locale:"en_IN",type:"website"},
  twitter:{card:"summary_large_image",title:"RCLD Islampur | Online Computer Courses",description:"Explore practical computer courses and online learning with RCLD Islampur."},
  robots:{index:true,follow:true,googleBot:{index:true,follow:true,maxSnippet:-1,maxImagePreview:"large",maxVideoPreview:-1}},
};

export default function RootLayout({children}) {
  const base=process.env.NEXT_PUBLIC_APP_URL || "https://rcldislampur.in";
  const organization={
    "@context":"https://schema.org","@type":"EducationalOrganization","name":"RCLD Islampur","url":base,
    "description":"Computer education and skill development institution offering practical computer courses and online learning.",
    "areaServed":{"@type":"City","name":"Islampur"},"address":{"@type":"PostalAddress","addressLocality":"Islampur","addressRegion":"West Bengal","postalCode":"733202","addressCountry":"IN"},
    "telephone":"+91-9851775891"
  };
  return <html lang="en"><body>{children}<script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(organization)}} /></body></html>;
}