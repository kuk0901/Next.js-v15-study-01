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

  - 모든 페이지에 공통적으로 적용되어야 하는 html 코드 설정 컴포넌트

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

  - replace: 뒤로가기를 방지하며 페이지 이동

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

  - 빠른 페이지 이돌을 위해 제공되는 기능

  - 연결된(현재 사용자가 보고 있는 페이지 내에서 이동할 가능성이 있는) 모든 페이지의 JS Bundle을 사전에 불러옴

  ```
  * JS Bundle
  : 현재 페이지에 필요한 JS Bundle만 전달 됨, 용량 경량화로 인해 Hydration 시간이 단축됨
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
