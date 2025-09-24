import "./globals.css";
import Navbar from "./components/Navbar";

export const metadata = {
  title: "Anime Streaming",
  description: "Anime Streaming App with Admin & Premium Pages",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="p-6">{children}</main>
      </body>
    </html>
  );
}
