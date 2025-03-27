## **`스트리밍과 에러핸들링`**

### **`스트리밍`**

- 서버에서 큰 용량의 데이터를 잘게 쪼개 클라이언트로 전달하는 것

- next.js의 스트리밍

  ```
  1. 렌더링이 오래 걸리지 않는 컴포넌트를 먼저 보냄

  2. 데이터 페칭 등 여러 이유로 렌더링이 오래 걸릴 수 있는 컴포넌트는
     대체 UI(로딩바) 이후 서버 측에서 렌더링이 완료된 이후 컴포넌트 전달

  => Dynamic Page에 주로 사용
  => Static Page가 아니기 때문에 풀 라우트 캐시에 저장되지 않기 때문
    -> 페이지를 요청마다 새롭게 렌더링해야 함

  => 페이지 스트리밍: 빨리 렌더링할 수 있는 컴포넌트들을 밑반찬처럼 내주는 것
  ```

<br />

### **`스트리밍 1. 페이지 스트리밍 적용하기`**

- 페이지 컴포넌트 스트리밍 설정

  > Dynamic Page인 search/page.tsx에 적용

  1. 스트리밍을 적용할 페이지와 동일한 위치에 loading.tsx 생성

  2. loading.tsx의 내부 내용 작성

     ```ts
     // (with-searchbar)/search/loading.tsx
     export default function Loading() {
       return <div>Loading...</div>;
     }
     ```

  3. next.js에 의해서 해당 loading.tsx을 대체 UI로 사용해 스트리밍 적용

<br />

- 스트리밍 테스트를 위한 delay 함수 생성 및 호출

  ```ts
  // util/delay.ts

  export async function delay(ms: number) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("");
      }, ms);
    });
  }
  ```

  ```ts
  import BookItem from "@/components/book-item";
  import { BookData } from "@/types";
  import { delay } from "@/util/delay";

  export default async function Page({
    searchParams
  }: Readonly<{
    searchParams: Promise<{
      q?: string;
    }>;
  }>) {
    const { q } = await searchParams;

    // delay 함수 호출
    await delay(1500);

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

- 페이지 컴포넌트 스트리밍 주의점(loading.tsx)

  1. layout.tsx 처럼 현재 경로에 있는 비동기 페이지 컴포넌트와 하위 비동기 페이지 컴포넌트 모두 스트리밍을 설정함

     - 하위 페이지 컴포넌트의 대체 UI 또한 loading.tsx 컴포넌트가 사용됨

  2. loading.tsx가 스트리밍 하도록 설정하는 컴포넌트는 비동기로 작동하도록 설정된 페이지 컴포넌트에 한정

     - async 키워드가 붙은 페이지 컴포넌트

  3. 오직 페이지 컴포넌트에만 스트리밍을 적용할 수 있음

  4. loading.tsx로 설정된 스트리밍은 브라우저에서 쿼리스트링이 변경될 때는 트리거링 되지 않음

     - 쿼리스트링만 바뀌는 경우 스트리밍 동작 X

<br />

### **`스트리밍 2. 컴포넌트 스트리밍 적용하기`**

- React의 Suspense 컴포넌트를 통해 특정 컴포넌트의 스트리밍 설정

  1. search/page.tsx의 비동기 작업 코드를 컴포넌트로 분리 후 페이지 컴포넌트에서 Suspense와 함께 return

     ```ts
     import BookItem from "@/components/book-item";
     import { BookData } from "@/types";
     import { delay } from "@/util/delay";
     import { Suspense } from "react";

     async function SearchResult({ q }: Readonly<{ q: string }>) {
       await delay(1500);

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

     export default function Page({
       searchParams
     }: Readonly<{
       searchParams: {
         q?: string;
       };
     }>) {
       return (
         <Suspense fallback={<div>Loading...</div>}>
           <SearchResult q={searchParams.q ?? ""} />
         </Suspense>
       );
     }
     ```

  <br />

  2. 쿼리스트링이 변할 때도 스트리밍을 동작시킬 수 있도록 Suspense의 key 설정

     > React는 컴포넌트의 key 값이 바뀔 때마다 컴포넌트가 달라졌다고 인식하기 때문

     ```ts
     export default function Page({
       searchParams
     }: Readonly<{
       searchParams: {
         q?: string;
       };
     }>) {
       return (
         <Suspense key={searchParams.q ?? ""} fallback={<div>Loading...</div>}>
           <SearchResult q={searchParams.q ?? ""} />
         </Suspense>
       );
     }
     ```

  - next.js 15 버전에서 변경된 searchParams 사용법에 따라 다시 비동기 페이지 컴포넌트로 변경 -> 서버 컴포넌트의 렌더링 최적화

    ```ts
    export default async function Page({
      searchParams
    }: Readonly<{
      searchParams: Promise<{ q?: string }>;
    }>) {
      const { q } = await searchParams;

      return (
        <Suspense key={q ?? ""} fallback={<div>Loading...</div>}>
          <SearchResult q={q ?? ""} />
        </Suspense>
      );
    }
    ```

<br />

- React의 Suspense를 통해 하나의 페이지에서 여러 비동기 컴포넌트를 동시다발적으로 스트리밍

  - index 페이지에 스트리밍 설정 -> Dynamic Page로 수정

  ```ts
  // Dynamic Page로 수정
  export const dynamic = "force-dynamic";

  export default function Home() {
    return (
      <div className={style.container}>
        <section>
          <h3>지금 추천하는 도서</h3>
          <Suspense fallback={<div>도서를 불러오는 중 입니다...</div>}>
            <RecoBooks />
          </Suspense>
        </section>

        <section>
          <h3>등록된 모든 도서</h3>
          <Suspense fallback={<div>도서를 불러오는 중 입니다...</div>}>
            <AllBooks />
          </Suspense>
        </section>
      </div>
    );
  }
  ```

  ```ts
  async function AllBooks() {
    await delay(1500);

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/book`, {
      cache: "force-cache"
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

  async function RecoBooks() {
    await delay(3000);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_SERVER_URL}/book/random`,
      {
        next: {
          revalidate: 3
        }
      }
    );

    if (!res.ok) {
      return <div>오류가 발생했습니다...</div>;
    }
    const recoBooks: BookData[] = await res.json();

    return (
      <div>
        {recoBooks.map((book) => (
          <BookItem key={book.id} {...book} />
        ))}
      </div>
    );
  }
  ```

<br />

### **`스켈레톤 UI 적용하기`**

- 뼈대 역할을 하는 UI

  - 실제 UI와 비슷한 박스 형태의 UI

  <br />

  1. BookItem 구조와 비슷한 형태의 스켈레톤 UI 컴포넌트 생성

  ```ts
  import style from "./book-item-skeleton.module.css";

  export default function BookItemSkeleton() {
    return (
      <div className={style.container}>
        <div className={style.cover_img}></div>
        <div className={style.info_container}>
          <div className={style.title}></div>
          <div className={style.subtitle}></div>
          <br />
          <div className={style.author}></div>
        </div>
      </div>
    );
  }
  ```

  <br />

  2. BookItem의 css 파일과 비슷한 형태의 스켈레톤 UI 스타일 파일 생성

  ```cs
  .container {
    display: flex;
    gap: 15px;
    padding: 20px 10px;
    border-bottom: 1px solid rgb(220, 220, 220);

    color: black;
    text-decoration: none;
  }

  .container img {
    width: 80px;
  }

  .title {
    font-weight: bold;
  }

  .subTitle {
    word-break: keep-all;
  }

  .author {
    color: gray;
  }
  ```

  <br />

  3. index 페이지의 Suspense fallback 속성에 적용

  ```ts
  export const dynamic = "force-dynamic";

  export default function Home() {
    return (
      <div className={style.container}>
        <section>
          <h3>지금 추천하는 도서</h3>
          <Suspense
            fallback={
              <>
                <BookItemSkeleton />
                <BookItemSkeleton />
                <BookItemSkeleton />
              </>
            }
          >
            <RecoBooks />
          </Suspense>
        </section>

        <section>
          <h3>등록된 모든 도서</h3>
          <Suspense
            fallback={
              <>
                <BookItemSkeleton />
                <BookItemSkeleton />
                <BookItemSkeleton />
              </>
            }
          >
            <AllBooks />
          </Suspense>
        </section>
      </div>
    );
  }
  ```

<br />

- BookItemSkeleton을 List로 렌더링 하는 컴포넌트 사용 후 생성

  - 개수만 Props로 넘겨주면 수에 맞춰 BookItemSkeleton List UI 생성

    - index 페이지와 search 페이지에서 fallback에 사용

  ```ts
  import BookItemSkeleton from "./book-item-skeleton";

  export default function BookListSkeleton({ count }: { count: number }) {
    return new Array(count)
      .fill(0)
      .map((_, i) => <BookItemSkeleton key={`book-item-skeleton-${i}`} />);
  }
  ```

> 직접 스켈레톤 컴포넌트 생성없이 react-loading-skeleton 라이브러리로 대체 가능

<br />

### **`에러 핸들링(error.tsx)`**

- layout/loading.tsx와 같이 페이지 경로에 error.tsx 생성

  - error.tsx 파일과 같은 경로, 하위 경로에서 에러 발생 시 error.tsx 컴포넌트 실행

  - "use client" 사용 이유: 서버, 클라이언트 오류 모두 대응하기 위해 지시자 사용

  - error props: 현재 발생한 에러의 정보를 컴포넌트에 전달

  - reset props: 에러가 발생한 페이지를 복구하기 위해 브라우저에서 다시 한번 컴포넌트들을 렌더링 하는 함수(에러 상태 초기화, 컴포넌트 재 렌더링) -> 서버 컴포넌트 X, 데이터 페칭 실행 X

  ```ts
  "use client";

  import { useEffect } from "react";

  export default function Error({
    error,
    reset
  }: Readonly<{ error: Error; reset: () => void }>) {
    useEffect(() => {
      console.error(error);
    }, [error]);

    return (
      <div>
        <h3>오류가 발생했습니다.</h3>
        <button onClick={() => reset()}>다시 시도</button>
      </div>
    );
  }
  ```

<br />

- 서버 컴포넌트에서 발생한 오류 에러 해결을 위한 reset

  1. 브라우저 강제 새로고침: 브라우저에 발생한 데이터가 제거되고 현존하는 컴포넌트도 리렌더링 하게 됨

  ```ts
  "use client";

  import { useEffect } from "react";

  export default function Error({
    error,
    reset
  }: Readonly<{ error: Error; reset: () => void }>) {
    useEffect(() => {
      console.error(error);
    }, [error]);

    return (
      <div>
        <h3>오류가 발생했습니다.</h3>
        <button onClick={() => window.location.reload()}>다시 시도</button>
      </div>
    );
  }
  ```

  <br />

  2. useRouter의 refresh 메서드: 오류가 발생한 부분만 렌더링

     - next 서버에게 서버 컴포넌트만 새롭게 렌더링 요청한 후 props로 받은 reset 함수 호출

     - startTransition: React18 버전부터 추가된 메서드, 콜백 함수를 인자로 받아 콜백 함수 안에 들어있는 UI를 변경시키는 작업을 일괄적으로 처리

     - router.refresh(): 현재 페이지에 필요한 서버 컴포넌트들을 next 서버에게 재실행 요청하는 비동기 메서드 -> void 반환 즉, async/await 사용 불가

     - reset(): 에러 상태 초기화, 컴포넌트 재 렌더링 -> 서버 컴포넌트 결괏값 개선 + 에러 상태 초기화 -> 페이지 복구

  ```ts
  "use client";

  import { useRouter } from "next/navigation";
  import { useEffect } from "react";

  export default function Error({
    error,
    reset
  }: Readonly<{ error: Error; reset: () => void }>) {
    const router = useRouter();

    useEffect(() => {
      console.error(error);
    }, [error]);

    return (
      <div>
        <h3>오류가 발생했습니다.</h3>
        <button
          onClick={() => {
            startTransition(() => {
              router.refresh();
              reset();
            });
          }}
        >
          다시 시도
        </button>
      </div>
    );
  }
  ```

<br />

- 특정 페이지의 에러 페이지가 필요한 경우 해당 페이지와 동일 경로에 error.tsx 생성

- error.tsx 파일의 위치가 app 디렉토리 하위인 경우 동일 경로에 있는 layou까지만 렌더링함

> next app router 버전부터는 레이아웃을 위해 error.tsx 파일을 경로별로 생성해야 할 수 있음
