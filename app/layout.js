import "./globals.css";

export const metadata = {
  title: "Ayaat Sport Shop",
  description: "E-commerce store for sports items and jerseys",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 flex justify-center">
        <div className="w-full max-w-md min-h-screen bg-white shadow-2xl overflow-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}
