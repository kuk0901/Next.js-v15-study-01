import Searchbar from "./searchbar";

export default function Layout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <Searchbar />

      {children}
    </div>
  );
}
