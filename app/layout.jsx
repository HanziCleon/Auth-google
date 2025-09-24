import "./globals.css";
import Script from "next/script";

export const metadata = {
  title: "AnimeStream+",
  description: "Stream Anime with Google Login",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        {/* Google Identity Services SDK */}
        <Script src="https://accounts.google.com/gsi/client" async defer />
      </body>
    </html>
  );
}
