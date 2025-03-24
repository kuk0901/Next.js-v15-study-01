### **`SSG(Static Site Generation) 소개`**

- 정적 사이트 생성

- SSR의 단점을 해결하는 사전 렌더링 방식

- 빌드 타임에 미리 페이지를 사전 렌더링해 둠

  ```
  1. 빌드타임(Build Time)에 JS 실행(렌더링) 작업이 이뤄짐

  2. 접속 요청이 들어온 경우 렌더링 된 HTML 반환

  3. 화면에 렌더링

  4. 데이터 페칭이 완료된 페이지를 사용자가 볼 수 있음

  * 3-1. 화면에 HTML 렌더링 이후 JS bundle 실행 및 하이드레이션은 SSR과 동일
  ```

- 장점: 사전 렌더링에 많은 시간이 소요되는 페이지더라도 사용자의 요청에는 매우 빠른 속도로 응답 가능

- 단점: 빌드 타임 이후에는 페이지를 재렌더링하지 않음 -> 매번 똑같은 페이지만 응답, 즉 최신 데이터 반영은 어려움

<br />

### **`SSG 정적 경로에 적용하기`**

- getServerSideProps 함수를 <u>getStaticProps</u> 함수로 변경

- 사용 방식은 getServerSideProps 함수와 동일 단, 반환되는 타입은 InferGetStaticPropsType\<typeof getStaticProps>

  - InferGetStaticPropsType: getStaticProps 함수의 반환값 타입을 자동으로 추론 => getStaticProps 함수 사용 시 컴포넌트에서 받는 data의 type

  ```ts
  // pages/index.tsx
  import SearchableLayout from "@/components/searchable-layout";
  import style from "./index.module.css";
  import { ReactNode } from "react";
  import BookItem from "@/components/book-item";
  import { InferGetStaticPropsType } from "next";
  import fetchBooks from "@/lib/fetch-books";
  import fetchRandomBooks from "@/lib/fetch-random-books";
  import { BookData } from "@/types";

  export const getStaticProps = async () => {
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
  }: Readonly<InferGetStaticPropsType<typeof getStaticProps>>) {
    return (
      <div className={style.container}>
        <section>
          <h3>지금 추천하는 도서</h3>
          {recoBooks.map((book: BookData) => (
            <BookItem key={book.id} {...book} />
          ))}
        </section>
        <section>
          <h3>등록된 모든 도서</h3>
          {allBooks.map((book: BookData) => (
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

- npm run build 시 결과 확인 가능

  ```shell
  $npm run build

  > section02@0.1.0 build
  > next build

    ▲ Next.js 14.2.24

  ✓ Linting and checking validity of types
    Creating an optimized production build ...
  ✓ Compiled successfully
  ✓ Collecting page data
    Generating static pages (0/4)  [    ]인덱스 페이지
  ✓ Generating static pages (4/4)
  ✓ Collecting build traces
  ✓ Finalizing page optimization

  Route (pages)                             Size     First Load JS
  ┌ ● /                                     1.06 kB        85.7 kB
  ├   └ css/37a00a8bb8b3801f.css            369 B
  ├   /_app                                 0 B            80.7 kB
  ├ ○ /404                                  180 B          80.9 kB
  ├ ƒ /api/hello                            0 B            80.7 kB
  ├ ƒ /api/time                             0 B            80.7 kB
  ├ ƒ /book/[id]                            669 B          85.3 kB
  ├   └ css/50d74a5bf08a4d74.css            381 B
  ├ ƒ /search                               943 B          85.6 kB
  ├   └ css/06ef3de95892fac5.css            329 B
  └ ○ /test                                 256 B          80.9 kB
  + First Load JS shared by all             81 kB
    ├ chunks/framework-64ad27b21261a9ce.js  44.8 kB
    ├ chunks/main-56dd814a9c67cbd2.js       32.2 kB
    └ other shared chunks (total)           3.96 kB

  ○  (Static)   prerendered as static content
  ●  (SSG)      prerendered as static HTML (uses getStaticProps)
  ƒ  (Dynamic)  server-rendered on demand
  ```

  > SSR, SSG 설정을 하지 않은 페이지는 Static 페이지 처리가 되고 이는 SSG 페이지로 설정됨 <br />
  > SSG 페이지가 default 설정

  <br />

- search 페이지를 SSG 형태로 변경

  - QueryString을 가져올 수 없음: GetStaticPropsContext에는 query가 없기 때문

  - 검색 결과를 서버로부터 불러오는 동작 수행 불가능

  - 컴포넌트가 마운트 된 이후에 동작하는 형태로 코드 수정 -> useEffect 사용(기존의 React 형태의 방식)

  > 클라이언트 사이드 측에서 직접 페칭 해서 불러오도록 설정

  ```ts
  // pages/search/index.tsx
  import SearchableLayout from "@/components/searchable-layout";
  import { ReactNode, useEffect, useState } from "react";
  import BookItem from "@/components/book-item";
  import fetchBooks from "@/lib/fetch-books";
  import { BookData } from "@/types";
  import { useRouter } from "next/router";

  export default function Page() {
    const [books, setBooks] = useState<BookData[]>([]);
    const router = useRouter();
    const q = router.query.q;

    const fetchSearchResult = async () => {
      const data = await fetchBooks(q as string);
      setBooks(data);
    };

    useEffect(() => {
      if (q) {
        // 검색 결과를 불러오는 로직
        fetchSearchResult();
      }
    }, [q]);

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

### **`SSG 동적 경로에 적용하기`**

- ```ts
  // pages/book/[id].tsx
  import { GetStaticPropsContext, InferGetStaticPropsType } from "next";
  import style from "./[id].module.css";
  import fetchOneBook from "@/lib/fetch-one-book";

  export const getStaticProps = async (context: GetStaticPropsContext) => {
    const id = context.params!.id;

    const book = await fetchOneBook(Number(id));

    return {
      props: { book }
    };
  };

  export default function Page({
    book
  }: Readonly<InferGetStaticPropsType<typeof getStaticProps>>) {
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

  > Error: getStaticPaths is required for dynamic SSG pages and is missing for '/book/[id]'.

- 다이나믹 페이지의 사전 렌더링

  ```
  빌드타임(Build Time)
  [id].tsx 사전 렌더링

  1. 경로 설정하기(존재할 수 있는 모든 경로 설정: getStaticPaths 함수 호출하여 경로 설정)

  2. 사전 렌더링(getStaticProps 함수를 통해 설정된 경로에 대한 페이지를 각각 렌더링)

  * 경로를 알 수 없어 사전 렌더링이 불가능
  => 임의로 경로 설정 || 서버로부터 id를 불러옴
  ```

- pages/book/[id].tsx 페이지에 getStaticPaths 함수 사용

  - 반환 객체의 paths 속성의 값은 배열, 해당 배열은 객체를 가짐

  - url parameter의 값은 문자열로만 설정

  - fallback의 false 값은 not found 처리

  ```ts
  import { GetStaticPropsContext, InferGetStaticPropsType } from "next";
  import style from "./[id].module.css";
  import fetchOneBook from "@/lib/fetch-one-book";

  export const getStaticPaths = () => {
    return {
      paths: [
        // url parameter의 값들은 문자열로만 설정
        { params: { id: "1" } },
        { params: { id: "2" } },
        { params: { id: "3" } }
      ],
      // fallback: false -> not found
      fallback: false
    };
  };

  export const getStaticProps = async (context: GetStaticPropsContext) => {
    const id = context.params!.id;

    const book = await fetchOneBook(Number(id));

    return {
      props: { book }
    };
  };

  export default function Page({
    book
  }: Readonly<InferGetStaticPropsType<typeof getStaticProps>>) {
    if (!book) return "문제가 발생했습니다. 다시 시도하세요.";

    const { title, subTitle, description, author, publisher, coverImgUrl } =
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

<br />

### **`SSG 풀백옵션 설정하기`**

- Fallback 옵션 설정(없는 경로로 요청 시)

  - false: 404 Not Found 반환

  - blocking: 즉시 생성(Like SSR)

  - true: 즉시 생성 + 페이지만 미리 반환

  ```
  - 동적 경로에 대한 SSG: 빌드 타임(Build Time) -> 경로 설정 & 사전 렌더링


  - fallback: "blocking"의 경우 -> 실시간으로 사전 렌더링

  => 정적 페이지로서 next 서버에 저장됨 -> .next/pages/book 디렉토리 하위에 html 확인 가능

  => SSR로 페이지가 생성되기 때문에 생성 시간이 걸릴 수 있지만 이후에는 next 서버에 저장된 페이지 사용 X === SSR + SSG

  => 사용: 빌드 타임에 모든 데이터에 해당하는 다이나믹 페이지를 불러오기 어려운 경우, 새로운 데이터가 계속 추가되어야 하는 경우

  => 단점: 새로 생성되는 페이지의 사전 렌더링이 길어지게 될 경우 로딩이 발생함


  - fallback: true의 경우 -> Props(getStaticProps로부터 받은 데이터)가 없는 페이지 반환

  1. 레이아웃만 사전 렌더링 후 반환: 데이터가 없는 상태의 페이지 렌더링 -> getStaticProps 생략
  2. Props 계산
  3. Props만 따로 반환: 데이터가 있는 상태의 페이지 렌더링
  ```

<br />

- fallback:true 일 때의 로딩 화면 보여주기

  - useRouter의 isFallback 속성 사용

  ```ts
  const router = useRouter();

  if (router.isFallback) return "로딩 중입니다.";
  ```

<br />

- 문제가 발생한 경우 404 페이지로 이동

  - getStaticProps 함수에서 반환 객체의 notFound 값을 true로 처리

  ```ts
  export const getStaticProps = async (context: GetStaticPropsContext) => {
    const id = context.params!.id;

    const book = await fetchOneBook(Number(id));

    if (!book) {
      return {
        notFound: true
      };
    }

    return {
      props: { book }
    };
  };
  ```
