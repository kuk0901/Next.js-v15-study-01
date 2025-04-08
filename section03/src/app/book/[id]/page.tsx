import { notFound } from "next/navigation";
import style from "./page.module.css";

import { BookData, ReviewData } from "@/types";
import ReviewItem from "@/components/review-item";
import ReviewEditor from "@/components/review-editor";
import Image from "next/image";
import { Metadata } from "next";

// export const dynamicParams = false;
export async function generateStaticParams() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/book`);

  if (!res.ok) {
    throw new Error(res.statusText);
  }

  const books: BookData[] = await res.json();

  return books.map((book) => ({
    id: book.id.toString()
  }));
}

async function BookDetail({ bookId }: Readonly<{ bookId: string }>) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_SERVER_URL}/book/${bookId}`
  );

  if (!res.ok) {
    if (res.status === 404) {
      notFound();
    }

    return <div>오류가 발생했습니다...</div>;
  }

  const book = await res.json();

  const { title, subTitle, description, author, publisher, coverImgUrl } = book;

  return (
    <section>
      <div
        className={style.cover_img_container}
        style={{ backgroundImage: `url('${coverImgUrl}')` }}
      >
        <Image
          src={coverImgUrl}
          width={240}
          height={300}
          alt={`도서 ${title}의 표지 이미지`}
        />
      </div>
      <div className={style.title}>{title}</div>
      <div className={style.subTitle}>{subTitle}</div>
      <div className={style.author}>
        {author} | {publisher}
      </div>
      <div className={style.description}>{description}</div>
    </section>
  );
}

async function ReviewList({ bookId }: Readonly<{ bookId: string }>) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_SERVER_URL}/review/book/${bookId}`,
    {
      next: {
        tags: [`review-${bookId}`]
      }
    }
  );

  if (!res.ok) {
    throw new Error(`Review fetch failed: ${res.statusText}`);
  }

  const reviews: ReviewData[] = await res.json();

  return (
    <section>
      {reviews.map((review) => (
        <ReviewItem key={`review-item-${review.id}`} {...review} />
      ))}
    </section>
  );
}

export async function generateMetadata({
  params
}: Readonly<{ params: Promise<{ id: string }> }>): Promise<Metadata> {
  // id를 이용해 실제 도서의 정보를 사용 -> BookDetail의 fetch 함수 사용
  const { id } = await params;
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_SERVER_URL}/book/${id}`
  );

  if (!res.ok) {
    throw new Error(res.statusText);
  }

  const book: BookData = await res.json();

  return {
    title: `${book.title} - 한입북스`,
    description: `${book.description}`,
    openGraph: {
      title: `${book.title} - 한입북스`,
      description: `${book.description}`,
      images: [book.coverImgUrl]
    }
  };
}

export default async function Page({
  params
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;

  return (
    <div className={style.container}>
      <BookDetail bookId={id} />
      <ReviewEditor bookId={id} />
      <ReviewList bookId={id} />
    </div>
  );
}
