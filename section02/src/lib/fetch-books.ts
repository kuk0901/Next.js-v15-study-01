import { BookData } from "@/types";

export default async function fetchBooks(q?: string): Promise<BookData[]> {
  let url = `https://onebite-books-server-puce.vercel.app/book`;

  if (q) {
    url += `/search?q=${q}`;
  }

  try {
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error();
    }

    return await res.json();
  } catch (err) {
    console.log(err);
    return [];
  }
}
