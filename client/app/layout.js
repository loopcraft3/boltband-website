import { Barlow_Condensed, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const head = Barlow_Condensed({ subsets: ["latin"], weight: ["600", "700"], variable: "--f-head" });
const body = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--f-body" });

export const metadata = {
  title: "Bolt & Bond — Industrial hardware supply",
  description: "Fasteners, tools, adhesives and safety gear. Build a list and request a quote.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${head.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
