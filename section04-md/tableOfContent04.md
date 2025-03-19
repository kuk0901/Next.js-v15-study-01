## **`데이터 패칭`**

### **`앱 라우터의 데이터 페칭`**

- page router의 데이터 페칭

  - 사전 렌더링 과정 진행 중 서버에서만 실행되는 특정 함수를 사용

  - 데이터가 필요한 하위 컴포넌트에게 Props로 넘겨줘야 함

  ```ts
  // 페이지 파일

  // SSR(서버 사이드 렌더링): getServerSideProps
  export async function getServerSideProps() {
    const data = await fetch("...");

    return {
      props: {
        data,
        ...
      }
    }
  }

  // SSG(정적 사이트 생성): getStaticProps
  export async function getStaticProps() {
    return {
      props: {
        ...
      }
    }
  }

  // Dynamic SSG(동적 경로에 대한 정적 사이트 생성): getStaticPaths
  export async function getStaticPaths() {
    return {
      props: {
        ...
      }
    }
  }

  // Page(클라이언트 컴포넌트)에서 props로 받아 처리
  export function Page(props) {
    return <div></div>
  }
  ```

<br />

- app router의 데이터 페칭

  - 서버 컴포넌트가 서버에서만 실행되기에 컴포넌트를 비동기 함수로 사용

  - getServerSideProps, getStaticProps 등을 대체함

  - 데이터가 필요한 컴포넌트에서 직접 데이터 요청 가능

  - 한 페이지에서 여러번 데이터 페칭을 해야 하는 경우 컴포넌트로 분리 -> AllBooks, RecoBooks 컴포넌트

  ```ts
  // 서버 컴포넌트 + 비동기 함수
  export async function Page(props) {
    const data = await fetch("");

    return <div></div>;
  }
  ```

> 클라이언트 컴포넌트에서는 Async 키워드를 사용할 수 없었음: <br />
> 브라우저에서 동작시 문제를 일으킬 수 있기 때문에 권장 X

<br />

- 프로젝트에 app router 데이터 페칭 적용

  - next.js 15에서 서버 컴포넌트의 params는 비동기적으로 처리 -> params가 Promise로 전달됨

  - 비동기 서버 컴포넌트에서는 await를 사용하여 params 값을 추출해야 함

  ```ts
  // search/page.tsx
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

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_SERVER_URL}/book/search?q=${q}`
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

  ```ts
  // book/[id]/page.tsx
  import style from "./page.module.css";

  export default async function Page({
    params
  }: Readonly<{ params: Promise<{ id: string | string[] }> }>) {
    const { id } = await params;

    const bookId = Array.isArray(id) ? id.join(",") : id;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_SERVER_URL}/book/${bookId}`
    );

    if (!res.ok) {
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

- 서버 url을 환경 변수로 등록

  - NEXT_PUBLIC 접두사를 사용하지 않을 경우 next.js는 해당 환경변수를 서버측에서만 사용할 수 있게 private로 설정 -> 클라이언트 컴포넌트에서 사용 불가

<br />

### **`데이터 캐시(Data Cache)`**

- 데이터 캐시: fetch 메서드를 활용해 불러온 데이터를 Next 서버에서 보관하는 기능

  - 영구적으로 데이터를 보관하거나, 특정 시간을 주기로 갱신 시키는 것 가능

  - 불 필요한 데이터 요청의 수를 줄여서 웹 서비스의 성능을 크게 개선할 수 있음

  - 옵션을 넣지 않을 경우 no-store(기본값) 동작 -> next.js 15에서부터 변경된 내용

  - 캐시된 데이터는 json 형태

  > 백엔드 서버로부터 불러온 데이터를 반영구적으로 보관하기 위해 사용 <br />
  > 서버 가동중에는 영구적으로 보관됨

  ```ts
  // fetch 메서드의 두번째 인자(객체) 사용
  const res = await fetch("...", { cache: "force-cache" });
  ```

  > Next의 데이터 캐시 옵션은 fetch 메서드에서만 활용 가능 <br />
  > -> 일반 fetch 메서드가 아닌 next가 기능을 확장한 메서드

<br />

- { cache: "force-cache" }

  - 요청의 결과를 무조건 캐싱함 -> 한 번 호출된 이후에는 다시는 호출되지 않음

  ```
  1. next 서버가 접속 요청을 받음

  2. 사전 렌더링 과정에서 데이터 캐시에서 저장된 데이터를 찾음

  3. miss라는 결과가 나올 경우(최초) 서버로 요청 후 데이터를 set한 이후 응답

  4. hit라는 결과가 나올 경우(저장된 데이터를 찾음) 서버 요청없이 캐싱된 데이터 사용
  ```

<br />

- { cache: "no-store" }

  - 데이터 페칭의 결과를 저장하지 않는 옵션 -> 캐싱을 아예 하지 않도록 설정

  ```
  1. next 서버가 접속 요청을 받음

  2. 사전 렌더링 과정에서 데이터 캐시를 무시하고 서버로 요청 후 응답
  ```

<br />

- { next: { revalidate: 10} }

  - 특정 시간을 주기로 캐시를 업데이트 함(자동)

  - Page Router의 ISR 방식과 유사

  ```
  1. force-cache와 비슷한 동작을 진행하되, 특정 시간이 지난 이후 데이터가 stale 상태로 바뀜

  2. 해당 데이터를 반환한 이후 서버로 요청해 다시 최신 데이터로 set
  ```

  <br />

- { next: { tags: ['a'] } }

  - On-Demand Revalidate: 요청이 들어왔을 때 데이터를 최신화함

  - Page Router의 On-Demand ISR 같은 방식

  - server action, route handler 등의 개념 필요

<br />

- next.config.ts 파일을 수정해 로그 확인

  ```ts
  import type { NextConfig } from "next";

  const nextConfig: NextConfig = {
    /* config options here */
    logging: {
      fetches: {
        fullUrl: true
      }
    }
  };

  export default nextConfig;
  ```

<br />

### **`리퀘스트 메모이제이션(Request Memoization)`**

- 여러 컴포넌트에서의 모든 요청 중 중복된 요청들은 한 번만 요청하도록 자동 최적화

  ```
  1. 동일한 api 요청이 반복
  2. next 서버의 리퀘스트 메모이제이션에서 하나의 페이지를 렌더링하는 과정에서
  발생하는 중복된 api 요청을 자동으로 캐싱


  * 데이터 캐시처럼 miss, set, hit 등의 상태 사용
  => 데이터가 존재(hit)할 경우 리퀘스트 메모이제이션에 저장된 캐싱 데이터 사용
  => api 요청 X

  * 데이터 캐시와 리퀘스트 메모이제이션은 다름
  => "하나의 페이지를 렌더링하는 동안에 중복된 api 요청을 캐싱"하기 위해 존재
  => 렌더링 종료시 모든 캐시 소멸
  ```

<br />

- 서버 컴포넌트 도입에 의해 생성됨

   - Page Router: 서버측에서만 실행되는 함수

   - App Router: 컴포넌트마다 필요한 데이터를 페칭 -> 다른 컴포넌트에서 동일한 데이터 사용을 위해 api 요청이 중복될 수 있음

   - fetch 메서드에서 cache에 no-store를 사용할 경우 request memoization이 동작하지 않을 수 있음