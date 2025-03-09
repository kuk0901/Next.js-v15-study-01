import SearchableLayout from "@/components/searchable-layout";
import { ReactNode } from "react";
import BookItem from "@/components/book-item";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import fetchBooks from "@/lib/fetch-books";
import { BookData } from "@/types";

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const q = context.query.q;

  const books = await fetchBooks(q as string);

  return {
    props: { books }
  };
};

export default function Page({
  books
}: Readonly<InferGetServerSidePropsType<typeof getServerSideProps>>) {
  return (
    <div>
      {books.map((book: BookData) => (
        <BookItem key={book.id} {...book} />
      ))}
    </div>
  );
}

Page.getLayout = (page: ReactNode) => {
  return <SearchableLayout>{page}</SearchableLayout>;
};
