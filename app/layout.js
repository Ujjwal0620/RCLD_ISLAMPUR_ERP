import "./globals.css";

export const metadata = {
  title: "RCLD Islampur ERP",
  description: "Integrated ERP, CRM, LMS, HR, finance and AI platform for RCLD Islampur.",
  keywords: ["RCLD Islampur", "ERP", "computer education", "student management", "LMS"]
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
