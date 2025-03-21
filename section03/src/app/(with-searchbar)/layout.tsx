import { ReactNode } from "react";
import Searchbar from "../../components/searchbar";

export default function Layout({
  children
}: Readonly<{ children: ReactNode }>) {
  return (
    <div>
      <Searchbar />
      {children}
    </div>
  );
}
