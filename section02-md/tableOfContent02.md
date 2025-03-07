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
