### **`SSR(서버 사이드 렌더링) 소개 및 실습`**

- SSR - Server Side Rendering

  - 가장 기본적인 사전 렌더링 방식

  - 요청이 들어올 때마다 사전 렌더링을 진행함

- index.tsx 페이지를 SSR 페이지로 변동

  - 기존 코드

  ```ts
  import SearchableLayout from "@/components/searchable-layout";
  import style from "./index.module.css";
  import { ReactNode } from "react";
  import books from "@/mock/books.json";
  import BookItem from "@/components/book-item";

  export default function Home() {
    return (
      <div className={style.container}>
        <section>
          <h3>지금 추천하는 도서</h3>
          {books.map((book) => (
            <BookItem key={book.id} {...book} />
          ))}
        </section>
        <section>
          <h3>등록된 모든 도서</h3>
          {books.map((book) => (
            <BookItem key={book.id} {...book} />
          ))}
        </section>
      </div>
    );
  }

  Home.getLayout = (page: ReactNode) => {
    return <SearchableLayout>{page}</SearchableLayout>;
  };
  ```

  - getServerSideProps 메서드 작성 후 내보냄: Next.js에서 제공

    - 컴포넌트보다 먼저 실행되어서 컴포넌트에 필요한 데이터를 불러오는 함수

    - 페이지로 요청이 들어올 때 getServerSideProps 함수가 먼저 동작 -> 서버, 서드파티 등으로부터 데이터 요청 후 페이지 컴포넌트 실행

    - InferGetServerSidePropsType: getServerSideProps 함수의 반환값 타입을 자동으로 추론 => getServerSideProps 함수 사용시 컴포넌트에서 받는 data의 type

  ```ts
  import SearchableLayout from "@/components/searchable-layout";
  import style from "./index.module.css";
  import { ReactNode } from "react";
  import books from "@/mock/books.json";
  import BookItem from "@/components/book-item";

  // next.js에서 제공
  export const getServerSideProps = () => {
    // 컴포넌트보다 먼저 실행되어서 컴포넌트에 필요한 데이터를 불러오는 함수
    // 서버 환경에서만 실행되는 함수

    const data = "hello";

    // props 객체를 포함하는 하나의 객체만 반환
    return {
      props: {
        data
      }
    };
  };

  export default function Home({
    data
  }: Readonly<InferGetServerSidePropsType<typeof getServerSideProps>>) {
    console.log(data);

    return (
      <div className={style.container}>
        <section>
          <h3>지금 추천하는 도서</h3>
          {books.map((book) => (
            <BookItem key={book.id} {...book} />
          ))}
        </section>
        <section>
          <h3>등록된 모든 도서</h3>
          {books.map((book) => (
            <BookItem key={book.id} {...book} />
          ))}
        </section>
      </div>
    );
  }

  Home.getLayout = (page: ReactNode) => {
    return <SearchableLayout>{page}</SearchableLayout>;
  };
  ```

  > 컴포넌트도 서버에서 실행됨 => 총 두번 실행 <br />
  > 요청 + 하이드레이션을 위한 JS Bundle = 2번 <br />
  > 브라우저에서 실행되어야 하는 코드(window 객체) -> ex) useEffect 사용

<br />

### **`SSR 실습`**

- 프로젝트의 모든 페이지에 적용

  > 서버 가동 후 http://localhost:12345/api로 접속

- index.tsx

  - 추천 도서, 등록된 모든 도서를 api를 사용해 불러옴

  - api 관련 함수 파일에 대한 lib 디렉토리 생성 및 fetch-books.ts 파일 생성: 비동기 함수이기에 Promise 객체를 반환

  ```ts
  // lib/fetch-books.ts -> lib/fetch-random-books.ts url 변수 이외 동일 구조
  import { BookData } from "@/types";

  export default async function fetchBooks(): Promise<BookData[]> {
    const url = `http://localhost:12345/book`;

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
  ```

  ```ts
  // index.tsx
  import SearchableLayout from "@/components/searchable-layout";
  import style from "./index.module.css";
  import { ReactNode } from "react";
  import BookItem from "@/components/book-item";
  import { InferGetServerSidePropsType } from "next";
  import fetchBooks from "@/lib/fetch-books";
  import fetchRandomBooks from "@/lib/fetch-random-books";

  export const getServerSideProps = async () => {
    // Promise.all 메서드를 통해 비동기 요청을 병렬 구조로 사용
    const [allBooks, recoBooks] = await Promise.all([
      fetchBooks(),
      fetchRandomBooks()
    ]);

    return {
      props: {
        allBooks,
        recoBooks
      }
    };
  };

  export default function Home({
    allBooks,
    recoBooks
  }: Readonly<InferGetServerSidePropsType<typeof getServerSideProps>>) {
    return (
      <div className={style.container}>
        <section>
          <h3>지금 추천하는 도서</h3>
          {recoBooks.map((book) => (
            <BookItem key={book.id} {...book} />
          ))}
        </section>
        <section>
          <h3>등록된 모든 도서</h3>
          {allBooks.map((book) => (
            <BookItem key={book.id} {...book} />
          ))}
        </section>
      </div>
    );
  }

  Home.getLayout = (page: ReactNode) => {
    return <SearchableLayout>{page}</SearchableLayout>;
  };
  ```

<br />

- search/index.tsx

  - getServerSideProps 함수에서 QueryString을 불러와야 함: context 객체 사용

  - fetch-books.ts의 fetchBooks 함수 확장

  ```ts
  // lib/fetch-books.ts
  import { BookData } from "@/types";

  // 옵셔널로 매개변수를 받게 처리
  export default async function fetchBooks(q?: string): Promise<BookData[]> {
    let url = `http://localhost:12345/book`;

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
  ```

  <br />

  - context 객체: 현재 브라우저로 받은 요청에 대한 모든 정보 포함

  ```ts
  // search/index.tsx
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
  ```

<br />

- book/[id].tsx

  - 다이나믹 페이지 생성 -> 디테일 페이지

  - getServerSideProps 함수에서 URLParameter를 불러와야 함: context 사용

  ```ts
  // lib/fetch-one-book.ts
  import { BookData } from "@/types";

  export default async function fetchOneBook(
    id: number
  ): Promise<BookData | null> {
    const url = `http://localhost:12345/book/${id}`;

    try {
      const res = await fetch(url);

      if (!res.ok) {
        throw new Error();
      }

      return await res.json();
    } catch (err) {
      console.error(err);
      return null;
    }
  }
  ```

  ```ts
  // book/[id].tsx
  import { GetServerSidePropsContext, InferGetStaticPropsType } from "next";
  import style from "./[id].module.css";
  import fetchOneBook from "@/lib/fetch-one-book";

  export const getServerSideProps = async (
    context: GetServerSidePropsContext
  ) => {
    const id = context.params!.id;

    // fetchOneBook 매개변수의 타입에 맞춰 형변환
    const book = await fetchOneBook(Number(id));

    return {
      props: { book }
    };
  };

  export default function Page({
    book
  }: Readonly<InferGetStaticPropsType<typeof getServerSideProps>>) {
    if (!book) return "문제가 발생했습니다. 다시 시도하세요.";

    const { id, title, subTitle, description, author, publisher, coverImgUrl } =
      book;

    return (
      <div className={style.container}>
        <div
          className={style.cover_img_container}
          style={{ backgroundImage: `url('${coverImgUrl}')` }}
        >
          <img src={coverImgUrl} alt={title} />
        </div>

        <div className={style.title}>{title}</div>
        <div className={style.subTitle}>{subTitle}</div>
        <div className={style.author}>
          {author} | {publisher}
        </div>
        <div className={style.description}>{description}</div>
      </div>
    );
  }
  ```

## **`SSR 정리`**

- next.js에서 제공하는 <u>**getServerSideProps()**</u>를 사용하여 SSR 동작: export 필수

  ```
  Q. getServerSideProps?

  - 컴포넌트보다 먼저 실행되어서 컴포넌트에 필요한 데이터를 불러오는 함수

  - 페이지로 요청이 들어올 때 getServerSideProps 함수가 먼저 동작

  => 서버, 서드파티 등으로부터 데이터 요청 후 페이지 컴포넌트 실행


  Q. getServerSideProps() 반환 타입?

  - InferGetServerSidePropsType: 타입을 자동으로 추론

  => getServerSideProps 함수를 작성한 해당 컴포넌트의 data type으로 작성


  * 실제 사용
  - Readonly<InferGetServerSidePropsType<typeof getServerSideProps>>
  ```

<br />

- getServerSideProps()에서의 <u>**query-string, url-parameter**</u> 사용

  ```
  Q: QueryString, URLParameter

  - context 객체 사용

  => 현재 브라우저로 받은 요청에 대한 모든 정보 포함


  Q. context 객체의 type?

  - GetServerSidePropsContext
  ```
