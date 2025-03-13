## **`page-router`**

- Pages 폴더의 구조를 기반으로 페이지 라우팅을 제공함

- Pages 폴더 구조

  - 파일명 기반의 페이지 라우팅

  ```
  pages / index.js  -> ~/
        / about.js -> ~/about
        / item.js -> ~/item
  ```

  - 폴더명 기반의 페이지 라우팅

  ```
  pages / index.js   -> ~/
        / about / index.js  -> ~/about
        / item / item.js  -> ~/item



  * 동적 경로(Dynamic Routes)

  page / index.js
       / item / index.js
              / [id].js -> ~/item/1, ~/item/2, ~/item/100
  ```

- next.js 14 install

```shell
$npx create-next-app@14 [폴더명]
```

- pages/\_app.tsx

  - React의 App component와 동일한 역할 -> Root component

  - 모든 페이지 역할을 하는 컴포넌트들의 부모 컴포넌트

  - Component: 현재 page 역할을 할 컴포넌트

  - pageProps: Component에 Props로 전달할 객체

  - Layout / 비즈니스 로직 작성하는 공간

  ```ts
  // pages/_app.tsx
  import "@/styles/globals.css";
  import type { AppProps } from "next/app";

  export default function App({ Component, pageProps }: AppProps) {
    return (
      <>
        <header>글로벌 헤더</header>
        <Component {...pageProps} />
      </>
    );
  }
  ```

<br />

- pages/\_document.tsx

  - 모든 페이지에 공통으로 적용되어야 하는 html 코드 설정 컴포넌트

  - React의 index.html

  - 공통의 meta tag, font 등 설정

<br />

- next.config.mjs

  - next 앱의 설정을 관리하는 설정 파일

<br />

### **`페이지 라우팅 설정`**

- 폴더 구조로 페이지 라우팅 설정

- 쿼리 스트링 사용

  ```ts
  // 해당 페이지 컴포넌트
  import { useRouter } from "next/router";

  export default function Page() {
    // 모든 라우터 정보를 갖고 있는 객체
    const router = useRouter();
    const { q } = router.query;

    return <h1>Search {q}</h1>;
  }
  ```

- URL Parameter를 갖는 Dynamic Routes 생성

  - query에서 id로 key가 지정되는 이유: 파일명 [id].tsx

  ```ts
  // pages/book/[id].tsx
  import { useRouter } from "next/router";

  export default function Page() {
    const router = useRouter();
    const { id } = router.query;

    return <h1>Book: {id}</h1>;
  }
  ```

- Catch All Segment

  - 모든 구간에 대응하는 페이지 생성: ~/book/123/123/123/123

  - [...id].tsx

  ```ts
  // pages/book/[...id].tsx
  import { useRouter } from "next/router";

  export default function Page() {
    const router = useRouter();
    // id가 배열 형태로 저장됨
    const { id } = router.query;

    console.log(id);

    return <h1>Book: {id}</h1>;
  }
  ```

- Optional Catch All Segment

  - 경로 뒤에 슬래시 수가 많은 경우, 또는 없는 모든 범용적인 경우

  - [[...id]].tsx -> pages/book/[[...id]].tsx

  - ex) /book || /book/~~ 모든 경우 대응

<br />

- 404 page 처리

  - pages/404.tsx

<br />

### **`네비게이팅`**

1. next가 제공하는 Link 컴포넌트 사용

```ts
// _app.tsx
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Link from "next/link";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <header>
        <Link href={"/"}>index</Link>
        &nbsp;
        <Link href={"/search"}>search</Link>
        &nbsp;
        <Link href={"/book/1"}>book/1</Link>
      </header>
      <Component {...pageProps} />
    </>
  );
}
```

  <br />

2. 프로그래매틱한 페이지 이동(Programmatic Navigation)

- 특정 버튼, 특정 조건 만족 등 함수 내부에서 이동시키는 방법

- useRouter Hook, 메서드 사용

  - push: 인자로 받은 경로로 페이지 이동

  - replace: 뒤로 가기를 방지하며 페이지 이동

  - back: 페이지를 뒤로 이동

```ts
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Link from "next/link";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  // push 메서드에 전달된 인자: 경로
  // CSR 방식으로 페이지 이동 처리
  const onClickButton = () => {
    router.push("/test");
  };

  return (
    <>
      <header>
        <div>
          <button onClick={onClickButton}>/test 페이지로 이동</button>
        </div>
      </header>
      <Component {...pageProps} />
    </>
  );
}
```

### **`프리페칭(Pre-Fetching)`**

- 페이지를 사전에 불러옴

  - 빠른 페이지 이동을 위해 제공되는 기능

  - 연결된(현재 사용자가 보고 있는 페이지 내에서 이동할 가능성이 있는) 모든 페이지의 JS Bundle을 사전에 불러옴

  ```
  * JS Bundle
  : 현재 페이지에 필요한 JS Bundle만 전달됨, 용량 경량화로 인해 Hydration 시간이 단축됨
  => 모든 페이지에 필요한 JS Bundle 전달 X
  => 모든 페이지의 번들 파일을 전달할 경우 용량이 너무 커지게 되며 하이드레이션이 늦어짐

  ex) "/search" 접속 요청 -> Search JS Bundle
  ```

- 일반적으로 Link 컴포넌트를 사용한 경우 프리페칭이 이루어짐

  - 프로그래매틱한 페이지에도 프리페칭을 적용시키고 싶은 경우: useEffect + prefetch()

  ```ts
  // _app.tsx
  import "@/styles/globals.css";
  import type { AppProps } from "next/app";
  import Link from "next/link";
  import { useRouter } from "next/router";
  import { useEffect } from "react";

  export default function App({ Component, pageProps }: AppProps) {
    const router = useRouter();

    const onClickButton = () => {
      router.push("/test");
    };

    // router.prefetch 함수의 인자로 경로를 사용해 해당 페이지를 프리페칭함
    useEffect(() => {
      router.prefetch("/test");
    }, []);

    return (
      <>
        <header>
          <Link href={"/"}>index</Link>
          &nbsp;
          <Link href={"/search"}>search</Link>
          &nbsp;
          <Link href={"/book/1"}>book/1</Link>
          <div>
            <button onClick={onClickButton}>/test 페이지로 이동</button>
          </div>
        </header>
        <Component {...pageProps} />
      </>
    );
  }
  ```

- Link 컴포넌트의 prefetch 기능을 제외시킬 경우: Link 컴포넌트의 prefetch 속성의 값을 false로 사용

<br />

### **`API Routes`**

- Next.js에서 API를 구축할 수 있게 해주는 기능

- pages/api 디렉토리 하위에 파일 생성 후 api 응답을 정의하는 코드 작성

```ts
// pages/api/time.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const date = new Date();
  res.json({ time: date.toLocaleString() });
}
```

<br />

### **`스타일링`**

- React의 스타일링 설정과 동일

- 글로벌 css 파일은 App 컴포넌트가 아닌 곳에서는 불러올 수 없음 -> import 사용 제한

  - css 파일 간의 클래스명에 대한 충돌 방지

> CSS Module 기능 사용: ~~.module.css <br />
> style 객체는 기본 내보내기

```ts
// CSS Module
import style from "./index.module.css";

export default function Home() {
  return (
    <>
      <h1 className={style.h1}>index</h1>
      <h2 className={style.h2}>H2</h2>
    </>
  );
}
```

```css
/* index.module.css */
.h1 {
  color: red;
}

.h2 {
  color: blue;
}
```

<br />

### **`글로벌 레아이웃 설정하기`**

> 프로젝트 완성본과 비교하며 설정

- \_app.tsx 컴포넌트를 통해 글로벌 레이아웃 설정

  ```ts
  import "@/styles/globals.css";
  import type { AppProps } from "next/app";

  export default function App({ Component, pageProps }: AppProps) {
    return (
      <div>
        <header>헤더</header>
        <main>
          <Component {...pageProps} />
        </main>
        <footer>푸터</footer>
      </div>
    );
  }
  ```

- global-layout 컴포넌트로 분리 및 import

  ```ts
  import { ReactNode } from "react";
  import Link from "next/link";
  import style from "./global-layout.module.css";

  export default function GlobalLayout({ children }: { children: ReactNode }) {
    return (
      <div className={style.container}>
        <header className={style.header}>
          <Link href={"/"}>📚 ONEBITE BOOKS</Link>
        </header>
        <main className={style.main}>{children}</main>
        <footer className={style.footer}>제작 @dobby</footer>
      </div>
    );
  }
  ```

  ```ts
  import GlobalLayout from "@/components/global-layout";
  import "@/styles/globals.css";
  import type { AppProps } from "next/app";

  export default function App({ Component, pageProps }: AppProps) {
    return (
      <GlobalLayout>
        <Component {...pageProps} />
      </GlobalLayout>
    );
  }
  ```

<br />

### **`페이지별 레이아웃 설정하기`**

- 프로젝트 완성본과 비교하여 페이지별로 사용되는 레이아웃 분리

  - 공통으로 사용되는 레이아웃의 경우 컴포넌트 생성

- getLayout(): 현재 페이지 역할을 할 컴포넌트를 매개변수로 받아 별도의 layout으로 감싸진 페이지를 반환

  ```ts
  // CSS Module
  import SearchableLayout from "@/components/searchable-layout";
  import style from "./index.module.css";
  import { ReactNode } from "react";

  export default function Home() {
    return (
      <>
        <h1 className={style.h1}>index</h1>
        <h2 className={style.h2}>H2</h2>
      </>
    );
  }

  // 메서드 추가
  Home.getLayout = (page: ReactNode) => {
    return <SearchableLayout>{page}</SearchableLayout>;
  };
  ```

  ```ts
  import SearchableLayout from "@/components/searchable-layout";
  import { useRouter } from "next/router";
  import { ReactNode } from "react";

  export default function Page() {
    const router = useRouter();

    const { q } = router.query;

    return <h1>search: {q}</h1>;
  }

  Page.getLayout = (page: ReactNode) => {
    return <SearchableLayout>{page}</SearchableLayout>;
  };
  ```

  ```ts
  import GlobalLayout from "@/components/global-layout";
  import "@/styles/globals.css";
  import { NextPage } from "next";
  import type { AppProps } from "next/app";
  import { ReactNode } from "react";

  // NextPage에 추가로 getLayout 속성을 가짐을 타입으로 명시
  type NextPageWithLayout = NextPage & {
    getLayout?: (page: ReactNode) => ReactNode;
  };

  export default function App({
    Component,
    pageProps
  }: AppProps & {
    Component: NextPageWithLayout;
  }) {
    // getLayout이 있는 경우 추가한 메서드를 꺼내옴, 없는 경우 page 사용
    const getLayout = Component.getLayout ?? ((page: ReactNode) => page);

    return (
      <GlobalLayout>{getLayout(<Component {...pageProps} />)}</GlobalLayout>
    );
  }
  ```

- SearchableLayout 컴포넌트를 사용해 검색 기능 활성화

  ```ts
  import { useRouter } from "next/router";
  import { ReactNode, useEffect, useState } from "react";

  export default function SearchableLayout({
    children
  }: Readonly<{
    children: ReactNode;
  }>) {
    const router = useRouter();
    const [search, setSearch] = useState("");

    const q = router.query.q as string;

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
      <div>
        <div>
          <input
            value={search}
            onKeyDown={onKeyDown}
            placeholder="검색어를 입력하세요..."
            onChange={onChangeSearch}
          />
          <button onClick={onSubmit}>검색</button>
        </div>
        {children}
      </div>
    );
  }
  ```

<br />

### **`한입북스 UI 구현`**

- 컴포넌트, CSS 파일 생성 및 코드 작성

<br />

### **`사전 렌더링과 데이터페칭`**

- React App에서의 데이터페칭

  ```ts
  export default function Page() {
    // 1. 불러온 데이터를 보관할 State 생성
    const [state, setState] = useState();

    // 2. 데이터 페칭 함수 생성
    const fetchData = async () => {
      const res = await fetch("...");
      const data = await res.json();

      setState(data);
    };

    // 3. 컴포넌트 마운트 시점에 fetchData 호출
    useEffect(() => {
      fetchData();
    }, []);

    // 4. 데이터 로딩중일때의 예외 처리
    if (!state) return "Loading...";

    return <div>...</div>;
  }
  ```

  > 초기 접속 요청부터 데이터 로딩까지 오랜 시간이 걸림 <br />
  > FCP가 끝난 이후에 데이터 요청 -> 컴포넌트 마운트 시점에 요청하기 때문 <br />
  > 화면에 늦게 나타남 -> 데이터도 늦게 나타남

  <br />

- Next.js의 데이터페칭: 사전 렌더링

  - JS 실행(렌더링) 시점에 현재 페이지에서 필요한 데이터를 미리 요청하고 응답을 받음

  - 렌더링 된 HTML에 data 포함된 상태

  > 백엔드 서버의 상태 혹은 데이터 용량이 너무 큰 경우에 Next.js는 JS 실행(렌더링) 과정을 빌드타임(Build Time)에 미리 사전 렌더링을 맞춰두도록 설정하는 등의 방법 제공

<br />

- Next.js의 다양한 사전 렌더링

  ```
  1. 서버 사이드 렌더링(SSR)
  - 가장 기본적인 사전 렌더링 방식
  - 요청이 들어올 때마다 사전 렌더링을 진행함


  2. 정적 사이트 생성(SSG)
  - 위에서 안내한 사전 렌더링 방식
  - 빌드 타임에 미리 페이지를 사전 렌더링해둠

  3. 증분 정적 재생성(ISR)
  - 향후 강의에서 다룰 사전 렌더링 방식
  ```

<br />

- React와 Next.js의 데이터페칭 차이점

  | React-app의 데이터페칭                                                          | Next-app의 데이터페칭                                                                                                |
  | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
  | 컴포넌트 마운트 이후에 발생함 <br /> 데이터 요청 시점이 느려지게 되는 단점 발생 | 사전 렌더링 중 발생함(당연히 컴포넌트 마운트 이후에도 발생 가능) <br /> 데이터 요청 시점이 매우 빨라지는 장점이 있음 |

<br />

### **`tableOfContent02-1, 2, 3`**

- SSR vs SSG vs ISR

  | 특징              | SSR                                | SSG                                       | ISR                                                                     |
  | ----------------- | ---------------------------------- | ----------------------------------------- | ----------------------------------------------------------------------- |
  | HTML 생성 시점    | 요청 시마다 서버에서 즉시 생성     | 빌드 시점에 미리 생성 후 캐시             | 빌드 시점에 생성되며, 이후 설정된 주기에 따라 백그라운드에서 갱신       |
  | JS 실행 위치      | 서버와 클라이언트 모두             | 클라이언트 측                             | 클라이언트 측                                                           |
  | Hydration 과정    | 서버 렌더링 된 HTML 위에 번들 적용 | 정적 HTML 위에 번들 적용                  | 정적 HTML 위에 번들 적용                                                |
  | 성능 및 활용 사례 | 실시간 데이터 처리 필요 시 적합    | 정적 콘텐츠 제공 및 빠른 로딩 속도에 적합 | 자주 변경되는 콘텐츠(블로그, 뉴스 등)에 적합하며, 최신 데이터 유지 가능 |

<br />

- JS(HTML) vs JS 번들

  | 특징         | JS(HTML)                                  | JS 번들                                                   |
  | ------------ | ----------------------------------------- | --------------------------------------------------------- |
  | 정의         | 사전 렌더링의 결과물로 생성된 정적 HTML   | 페이지와 관련된 모든 JavaScript 코드를 포함하는 통합 파일 |
  | 생성 시점    | 서버에서 사전 렌더링 시                   | 빌드 과정에서 번들링                                      |
  | 목적         | 초기 UI를 빠르게 표시                     | 페이지의 동적 기능 제공                                   |
  | 실행 위치    | 서버 (SSR) 또는 빌드 시 (SSG)             | 클라이언트 (브라우저)                                     |
  | 로딩 순서    | 먼저 로드됨                               | HTML 로드 후 로드됨                                       |
  | 역할         | 기본적인 페이지 구조와 콘텐츠 제공        | 인터랙티브 기능 및 동적 업데이트 담당                     |
  | SEO 영향     | 긍정적 (검색 엔진이 콘텐츠를 쉽게 인덱싱) | 직접적인 영향 적음                                        |
  | 하이드레이션 | 하이드레이션의 대상                       | 하이드레이션을 수행하는 코드 포함                         |

<br />

- ISR 주문형 재 검증(On-Demand-ISR)

  - On-Demand-ISR: 요청을 받을 때 마다 페이지를 다시 생성하는 ISR

  - 시간을 기반으로 불필요하거나 너무 늦게 페이지를 재생성하는 과정 제거

  - 실제 사용자의 요청에 따라 페이지 재생성: 페이지 요청 직접 트리거링 가능

  - api 요청으로 핸들러 실행하여 적용 가능

<br />

### **`SEO 설정하기`**

- favicon, thumbnail 등 정적 리소스, 페이지별 meta 태그 사용

- 각 페이지별로 메타 태그 적용을 위해 next/head를 통해 Head import

  - next/document의 Head는 \_document.tsx 파일에서만 사용

  - og(open graph): 웹 페이지가 소셜 미디어 플랫폼이나 메시징 앱에서 공유될 때 어떻게 표시될지를 제어하는 데 사용

- pages/index.tsx

  - search/index.tsx도 같은 형태로 적용

  ```ts
  import SearchableLayout from "@/components/searchable-layout";
  import style from "./index.module.css";
  import { ReactNode } from "react";
  import BookItem from "@/components/book-item";
  import { InferGetStaticPropsType } from "next";
  import fetchBooks from "@/lib/fetch-books";
  import fetchRandomBooks from "@/lib/fetch-random-books";
  import { BookData } from "@/types";
  import Head from "next/head";

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
      <>
        {/* 메타 태그 적용 */}
        <Head>
          <title>한입북스</title>
          <meta property="og:image" content="/thumbnail.png" />
          <meta property="og:title" content="한입북스" />
          <meta
            property="og:description"
            content="한입북스에 등록된 도서들을 만나보세요"
          />
        </Head>

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
      </>
    );
  }

  Home.getLayout = (page: ReactNode) => {
    return <SearchableLayout>{page}</SearchableLayout>;
  };
  ```

- book/[id].tsx처럼 fallback을 사용하는 다니나믹 정적 페이지에서의 메타 태그 사용

  - 조건문을 통한 loading 상태에서의 기본적 메타 태그 사용: book의 데이터가 없는 경우 메타 태그 미적용 -> SEO 동작 X

  ```ts
  import { GetStaticPropsContext, InferGetStaticPropsType } from "next";
  import style from "./[id].module.css";
  import fetchOneBook from "@/lib/fetch-one-book";
  import { useRouter } from "next/router";
  import Head from "next/head";

  export const getStaticPaths = () => {
    return {
      paths: [
        { params: { id: "1" } },
        { params: { id: "2" } },
        { params: { id: "3" } }
      ],
      fallback: true
    };
  };

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

  export default function Page({
    book
  }: Readonly<InferGetStaticPropsType<typeof getStaticProps>>) {
    const router = useRouter();

    // fallback 상태일 때의 기본적인 메타 태그
    if (router.isFallback) {
      return (
        <>
          <Head>
            <title>한입북스</title>
            <meta property="og:image" content="/thumbnail.png" />
            <meta property="og:title" content="한입북스" />
            <meta
              property="og:description"
              content="한입북스에 등록된 도서들을 만나보세요"
            />
          </Head>
          <div>로딩중입니다</div>
        </>
      );
    }

    if (!book) return "문제가 발생했습니다. 다시 시도하세요.";

    const { title, subTitle, description, author, publisher, coverImgUrl } =
      book;

    return (
      <>
        <Head>
          <title>{title}</title>
          <meta property="og:image" content={coverImgUrl} />
          <meta property="og:title" content={title} />
          <meta property="og:description" content={description} />
        </Head>

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
      </>
    );
  }
  ```

<br />

### **`배포하기`**

- vercel 사용 -> Next.js 개발사

  - section02 / server 모두 배포

  ```shell
  $npm i -g vercel
  ```

  ```shell
  vercel
  ```

<br />

- section02/src/lib 하위에 있는 모든 fetch 함수의 요청 도메인 변경

- 재배포

  ```shell
  vercel --prod
  ```

<br />

### **`페이지 라우터 정리`**

- <u>Page Router의 장점</u>

  1. 파일 시스템 기반의 간편한 페이지 라우팅 제공

     - 폴더 구조만으로 페이지 라우팅 사용 가능

     ```
     pages/index.tsx -> ~/

     pages/search.tsx -> ~/search

     pages/book/index.tsx -> ~/book


     - 동적 경로(Dynamic Routes)
     pages/book/[id].tsx -> ~/book/1


     - Catch All Segment
     pages/book/[...id].tsx -> ~/book/1, ~/book/2/10, ~/book/100/2345/233


     - Optional Catch All Segment
     pages/book/[[...id]].tsx -> ~/book, ~/book/1, ~/book/2/10, ~/book/100/2345/233
     ```

  <br />

  2. 다양한 방식의 사전 렌더링 제공

     ```
     유저         브라우저(클라이언트)        서버
     접속요청 ->
                                  JS 실행(렌더링)
                              <-  렌더링 된 HTML
     FCP      <-  화면에 렌더링

     * FCP 단축
     ```

     - 서버사이드 렌더링(SSR)

       - 요청이 들어올 때 마다 JS 실행(사전 렌더링)을 진행

       - 상황에 때라 응답 속도가 느려질 수 있음

     - 정적 사이트 생성(SSG)

       - 빌드 타임에 미리 페이지를 사전 렌더링 해 둠

       - 사전 렌더링에 많은 시간이 소요되는 페이지더라도 사용자의 요청에는 매우 빠른 속도로 응답 가능

       - 매번 똑같은 페이지만 응답함, 최신 데이터 반영은 어려움

     - 증분 정적 재생성(ISR)

       - SSG 페이지를 일정 시간마다 재생성

       - 유효 기간에 따라 재생성 가능

       - on-demand 방식으로 Revalidate 요청에 따라 재생성 가능

<br />

- <u>Page Router의 단점</u>

  1. 페이지별 레이아웃 설정이 번거로움

     - 각 페이지별로 레이아웃 관련 코드를 작성해줘야 함

     ```ts
     export default function App({
       Component,
       pageProps
     }: AppProps & {
       Component: NextPageWithLayout;
     }) {
       const getLayout = Component.getLayout ?? ((Page: ReactNode) => page);

       return (
         <GlobalLayout>{getLayout(<Component {...pageProps} />)}</GlobalLayout>
       );
     }
     ```

     ```ts
     export default function Page() {
      return (
        ...
      );
     }

     Page.getLayout = (page: ReactNode) => {
      return <SearchableLayout>{page}</SearchableLayout>
     }
     ```

  <br />

  2. 데이터 페칭 페이지 컴포넌트에 집중됨

     - getServerSideProps, getStaticProps를 사용해 백엔드 서버로부터 데이터 불러와 메이지 컴포넌트에게 Props로 데이터전달

     ```
     서버에서 불러온 데이터 -> Page 컴포넌트에 Props로 전달 -> 하위 컴포넌트에 무한 전달

     => 데이터를 전달하는 과정이 번거로움
     ```

  <br />

  3. 불필요한 컴포넌트들도 JS Bundle에 포함됨

     - FCP 시점 이후 하이드레이션을 위해 JS Bundle로 묶어서 전달하는 과정에서 불필요한 컴포넌트들도 포함되어 전달됨

     ```
     Q. 불필요한 컴포넌트?

     - 상호작용하는 기능이 없는 컴포넌트
     => BookItem 컴포넌트 -> Link 태그 -> 상호작용이 없음
     => 상호작용이 있는 컴포넌트와 없는 컴포넌트가 존재함
     => 상호작용이 없는 컴포넌트가 JS Bundle에 포함되어 하이드레이션을 위해 한 번 더 실행될 필요 X


     Q. 컴포넌트의 실행 수?

     - 컴포넌트 실행은 총 두번
     1. 사전 렌더링을 위한 JS 실행
     2. JS Bundle 이후 하이드레이션


     - 결론
     => JS Bundle의 용량이 커짐
     => 하이드레이션 완료 시점도 늦어짐
     => 상호작용이 가능한 TTI에 도달하는 시간도 늦어짐


     * 하이드레이션 이후: TTI
     ```
