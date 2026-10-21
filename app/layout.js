import "./globals.css";

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://rcldislampur.in"),
  title: { default:"RCLD Islampur | Online Computer Courses", template:"%s | RCLD Islampur" },
  description:"Learn computer applications, programming, office productivity, accounting, hardware, networking and digital skills with RCLD Islampur.",
  keywords:["RCLD Islampur","computer courses","online computer courses","DCA","ADCA","CCA","CCC","computer training Islampur"],
  alternates:{canonical:"/"},
  openGraph:{title:"RCLD Islampur | Online Computer Courses",description:"Explore RCLD Islampur courses and learn online.",url:"/",siteName:"RCLD Islampur",type:"website"},
  robots:{index:true,follow:true}
};

export default function RootLayout({children}) {
  return <html lang="en"><body>{children}</body></html>;
}
