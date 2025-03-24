## **`페이징 캐싱`**

### **`풀 라우트 캐시(Full Route Cache) 1`**

- Next 서버측에서 빌드 타임에 특정 페이지의 렌더링 결과를 캐싱하는 기능

- SSG와 유사

  ```
  특정 페이지의 사전 렌더링 결과(리퀘스트 메모이제이션, 데이터 캐시, 백엔드 서버 모두 포함)를
  풀 라우트 캐시라는 이름으로 캐싱(SET)

  => 요청에 대해 풀 라우트 캐시에서 HIT 후 바로 응답 반환
  ```

<br />

- Next의 페이지들

  - 어떤 기능을 사용하냐에 따라 자동으로 나뉨

  ```
  1. Static Page(정적 페이지)
  - Dynamic Page가 아니면 모두 Static Page가 됨(Default)
  => 풀 라우트 캐시가 적용됨


  2. Dynamic Page(동적 페이지)
  - 특정 페이지가 접속 요청을 받을 때마다 매번 변화가 생기거나, 데이터가 달라질 경우


  * 서버 컴포넌트만 해당, 클라이언트 컴포넌트는 페이지 유형에 영향을 미치지 않음
  ```

<br />

- Dynamic Page로 설정되는 기준

  1. 캐시되지 않는 Data Fetching을 사용할 경우

  ```ts
  async function Comp() {
    const res = await fetch("...");
    const res = await fetch("...", { catch: "no-store" });
    return <div>...</div>;
  }
  ```

  <br />

  2. 동적 함수(쿠키, 헤더, 쿼리스트링)을 사용하는 컴포넌트가 있을 때

  ```ts
  import { cookies } from "next/headers";

  async function Comp() {
    const cookieStore = cookies();
    const theme = cookieStore.get("theme");

    return <div>...</div>;
  }
  ```

<br />

- Dynamic Page, Static Page 정리

  | 동적 함수 | 데이터 캐시 | 페이지 분류  |
  | --------- | ----------- | ------------ |
  | Yes       | No          | Dynamic Page |
  | Yes       | Yes         | Dynamic Page |
  | No        | No          | Dynamic Page |
  | No        | Yes         | Static Page  |

  > Static Page 사용이 권장됨

<br />

- 풀 라우트 캐시의 revalidate

  - 특정 시간 이후 갱신 가능 -> ISR과 유사

  ```
  fetch 메서드의 revalidate 옵션을 사용한 경우,
  데이터 캐시 뿐만 아니라 풀 라우트 캐시도 갱신됨

  1. revalidate 이후에 대한 요청에 대해 STALE 상태에서 페이지 반환
  2. 서버에서 데이터 요청 후 데이터 캐시 갱신(SET)
  3. 새로 갱신된 데이터로 렌더링 후 풀 라우트 캐시 갱신(SET)
  ```

<br />

### **`풀 라우트 캐시(Full Route Cache) 2`**

- 빌드 타임에 페이지를 생성하기 위해 client component를 실행할 때 동적 함수 실행할 경우 빌드 중 오류 발생

  - 해당 컴포넌트를 사전 렌더링 과정에서 배제되도록 설정: react에서 제공하는 Suspense 컴포넌트 사용

  - Suspense: next 서버측에서 Suspense로 묶여있는 컴포넌트들은 바로 렌더링하지 않고 비동기 작업이 완료될 때까지 fallback의 값을 사용

  ```ts
  import { ReactNode, Suspense } from "react";
  import Searchbar from "../../components/searchbar";

  export default function Layout({
    children
  }: Readonly<{ children: ReactNode }>) {
    return (
      <div>
        <Suspense fallback={<div>Loading...</div>}>
          <Searchbar />
        </Suspense>
        {children}
      </div>
    );
  }
  ```

  ```ts
  "use client";

  import { useEffect, useState } from "react";
  import { useRouter, useSearchParams } from "next/navigation";
  import style from "./serachbar.module.css";

  export default function Searchbar() {
    const router = useRouter();
    // useSearchParams 비동기 함수
    const searchParams = useSearchParams();
    const [search, setSearch] = useState("");

    const q = searchParams.get("q");

    useEffect(() => {
      setSearch(q || "");
    }, [q]);

    const onChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
    };

    const onSubmit = () => {
      if (!search || q === search) return;
      router.push(`/search?q=${search}`);
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        onSubmit();
      }
    };

    return (
      <div className={style.container}>
        <input value={search} onChange={onChangeSearch} onKeyDown={onKeyDown} />
        <button onClick={onSubmit}>검색</button>
      </div>
    );
  }
  ```

<br >

- Dynamic인 인덱스 페이지를 Static Page로 전환

  1. index page: RootLayout부터 확인(데이터 페칭, 동적 함수 존재 확인)

  ```ts
  // app/layout.tsx
  async function Footer() {
    // cache 옵션 사용
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/book`, {
      cache: "force-cache"
    });

    if (!res.ok) {
      return <footer>제작 @dobby</footer>;
    }

    const books: BookData[] = await res.json();
    const bookCount = books.length;

    return (
      <footer>
        <div>제작 @dobby</div>
        <div>{bookCount}개의 도서가 등록되어 있습니다</div>
      </footer>
    );
  }
  ```

  ```ts
  // (with-searchbar)/page.tsx
  async function AllBooks() {
    // cache 옵션에 대한 값을 force-store 사용
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/book`, {
      cache: "force-store"
    });

    if (!res.ok) {
      return <div>오류가 발생했습니다...</div>;
    }
    const allBooks: BookData[] = await res.json();

    return (
      <div>
        {allBooks.map((book) => (
          <BookItem key={book.id} {...book} />
        ))}
      </div>
    );
  }
  ```

<br />

### **`풀 라우트 캐시(Full Route Cache) 3. 동적 경로에 적용하기`**

- search page

  - searchParams(동적 함수)를 사용

  - 실시간(사용자의 검색어를 기반)으로 데이터를 백엔드 서버로부터 불러와 렌더링해야 하는 페이지는 풀 라우트 캐시 포기

  - 단 데이터 캐시 적용하여 생성 시간 최적화

  ```ts
  import BookItem from "@/components/book-item";
  import { BookData } from "@/types";

  export default async function Page({
    searchParams
  }: Readonly<{
    searchParams: Promise<{
      q?: string;
    }>;
  }>) {
    const { q } = await searchParams;

    // force-cache를 사용해 한 번 검색된 데이터는 캐싱되도록 함
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_SERVER_URL}/book/search?q=${q}`,
      { cache: "force-cache" }
    );
    if (!res) {
      return <div>오류가 발생했습니다...</div>;
    }

    const books: BookData[] = await res.json();

    return (
      <div>
        {books.map((book) => (
          <BookItem key={book.id} {...book} />
        ))}
      </div>
    );
  }
  ```

<br />

- book page

  - id(URL parameter)를 갖는 Dynamic Page

  - 생성될 수 있는 모든 URL parameter를 제공: generateStaticParams 함수 사용

  - `generateStaticParams`: return으로 어떤 url parameter가 빌드 타임에 페이지에 존재할 수 있는지 직접 설정

    - getStaticPaths와 유사

    - 주의사항 1: url parameter는 문자열로만 제공

    - 주의사항 2: 페이지 컴포넌트 내부에 데이터 캐싱이 설정되지 않은 데이터 페칭이 존재해도 무조건 static page로 강제 설정됨

  ```ts
  import style from "./page.module.css";

  export function generateStaticParams() {
    return [
      {
        id: "1"
      },
      {
        id: "2"
      },
      {
        id: "3"
      }
    ];
  }

  export default async function Page({
    params
  }: Readonly<{ params: Promise<{ id: string | string[] }> }>) {
    const { id } = await params;

    const bookId = Array.isArray(id) ? id.join(",") : id;

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

    const { title, subTitle, description, author, publisher, coverImgUrl } =
      book;

    return (
      <div className={style.container}>
        <div
          className={style.cover_img_container}
          style={{ backgroundImage: `url('${coverImgUrl}')` }}
        >
          <img src={coverImgUrl} />
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

- generateStaticParams 함수에서 정적으로 설정해둔 url parameter를 제외하고 모두 404 페이지로 보내고 싶은 경우

  ```ts
  import { notFound } from "next/navigation";
  import style from "./page.module.css";

  // dynamicParams를 false로 설정, 기본값은 true
  export const dynamicParams = false;

  export function generateStaticParams() {
    return [
      {
        id: "1"
      },
      {
        id: "2"
      },
      {
        id: "3"
      }
    ];
  }
  ```

<br />

### **`라우트 세그먼트 옵션`**

- 페이지 캐싱/리벨리데이트 동작을 강제로 설정 -> 강제로 특정 페이지를 static, dynamic page 혹은 revalidate 설정

  - 약속된 이름의 변수명을 설정하고 내보냄

  ```
  - dynamic: 특정 페이지의 유형을 강제로 Static, Dynamic 페이지로 설정

  1. auto
  => 기본값, 아무것도 강제하지 않음

  2. force-dynamic
  => 페이지를 강제로 Dynamic 페이지로 설정

  3. force-static
  => 페이지를 강제로 Static 페이지로 설정
  => 실시간 검색 페이지에 사용하는 경우 검색어가 빈 값으로 처리되어 검색 결과가 나타나지 않음

  4. error
  => 페이지를 강제로 Static 페이지로 설정(설정하면 안 되는 이유 O -> 빌드 오류)
  => 동적 함수, 캐싱되지 않는 데이터 페칭이 있는 경우 빌드 오류


  * 동적 함수, 데이터 페칭을 사용하는 것과 별개로 모든 설정을 강제함
  => 동적 함수: undefined, 빈 값으로 설정됨
  => 캐싱되지 않는 데이터 페칭: no-store처럼 데이터 캐싱이 되지 않도록 설정된 경우 강제로 캐싱되도록 변경됨
  ```

> 사용하지 않는 것을 지양<br />
> 개발 과정에서 버그 찾기에는 수월할 수 있음

<br />

### **`클라이언트 라우터 캐시`**

- 브라우저에 저장되는 캐시

- 페이지 이동을 효율적으로 진행하기 위해 페이지의 일부 데이터를 보관함

  ```
  페이지 데이터: HTML, JS Bundle, RSC Payload(레이아웃들, 페이지 및 기타 등등)

  => 여러 개의 페이지가 공통된 레이아웃을 사용하는 경우, 중복되는 데이터(RSC Payload)가 존재할 수 있음
  => 클라이언트 라우트 캐시에 레이아웃에 해당하는 RSC Payload의 데이터를 캐싱
  => 한 번 접속한 페이지의 레이아웃을 브라우저 캐시에 캐싱하여 중복 요청을 방지(최적화)
  ```

  <br />

- new Date().troLocaleString()을 사용해 페이지 간의 이동에서 레이아웃이 캐싱되어 있는지 확인

  - 새로고침, 페이지 새롭게 로드할 경우에는 브라우저의 캐시가 삭제되기 때문에 시간이 변경됨

  ```ts
  import { ReactNode, Suspense } from "react";
  import Searchbar from "../../components/searchbar";

  export default function Layout({
    children
  }: Readonly<{ children: ReactNode }>) {
    return (
      <div>
        <div>{new Date().toLocaleString()}</div>
        <Suspense fallback={<div>Loading...</div>}>
          <Searchbar />
        </Suspense>
        {children}
      </div>
    );
  }
  ```

<br />
