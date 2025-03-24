## **`app-router`**

### **`App Router 시작하기`**

- Next.js 13 버전에 새롭게 추가된 라우터

- 기존의 Page Router를 완전히 대체함

<br />

- 변경되거나 추가되는 사항

  - 페이지 라우팅 설정 방식 변경

  - 레이아웃 설정 방식 변경

  - 데이터 페칭 방식 변경

  - React 18 신규 기능 추가: React Server Component, Streaming

<br />

- 크게 변경되지 않은 사항

  - 네비게이팅(Navigating)

  - 프리페칭(Pre-Fetching)

  - 사전 렌더링(Pre-Rendering)

<br />

- 사용

  ```shell
  $npx create-next-app@latest section03
  ```

<br />

- default 설정

  - page 이름의 파일: page 역할

  - layout 이름의 파일: layout 역할

<br />

### **`페이지 라우팅 설정하기`**

- App Router 버전의 페이지 라우팅

  - app 폴더를 기반으로 설정하되 page 파일만 페이지로 취급

  - app/page.tsx, app/search/page.tsx, app/book/page.tsx, app/book/[id]/page.tsx

<br />

- App Router의 QueryString, URLParameter

  ```
  앱 라우터에서 경로상에 포함되는 값들은 Page 컴포넌트에 모두 Props로 전달됨
  ```

<br />

- src/app/search/page.tsx

  - 리액트의 서버 컴포넌트이기 때문에 async 키워드 사용 가능

  - 서버 컴포넌트는 서버에서 사전 렌더링을 위해서 딱 한 번만 실행됨 -> 비동기적으로 실행되어도 문제없음

  - props는 항상 Promise 타입을 지정해줘야 함

  ```ts
  // app/search/page.tsx
  export default async function Page({
    searchParams
  }: Readonly<{
    searchParams: Promise<{ q: string }>;
  }>) {
    const { q } = await searchParams;

    return <div>Search 페이지: {q}</div>;
  }
  ```

<br />

- 다이나믹 라우팅

  - app/book/[id]/page.tsx

  ```ts
  export default async function Page({
    params
  }: Readonly<{ params: Promise<{ id: string }> }>) {
    const { id } = await params;

    return <div>book/[id] 페이지 : {id}</div>;
  }
  ```

<br />

- Catch All Segment

  - app/book/[...id]/page.tsx

<br />

- Optional Catch All Segment

  - app/book/[[...id]]/page.tsx

<br />

### **`레이아웃 설정하기`**

- page 라는 이름의 파일이 페이지 역할을 하는 파일로 자동 설정됨 -> 레이아웃도 마찬가지

- app/search/layout.tsx, app/search/page.tsx -> 해당 페이지의 레이아웃으로 자동 설정

  - /search 경로로 시작하는 모든 페이지의 레이아웃으로 설정됨

  - app/search/setting/page.tsx -> app/search/layout.tsx 자동 적용

  > layout 컴포넌트 렌더링 후 page 컴포넌트 렌더링

  - app/search/setting/layout.tsx를 생성한 경우 중첩되어 적용 -> search/layout.tsx + search/setting/layout.tsx + search/setting/page.tsx

<br />

- layout 적용

  - 페이지 역할의 컴포넌트인 children을 배치시켜줘야 함

  ```ts
  // search/layout.tsx
  export default function Layout({
    children
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <div>
        <div>임시 서치바</div>

        {children}
      </div>
    );
  }
  ```

  ```ts
  // search/setting/layout.tsx
  export default function Layout({
    children
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <div>
        <div>search/setting</div>

        {children}
      </div>
    );
  }
  ```

<br />

- 경로와 관계없이 특정 페이지에만 적용되는 공통 layout 설정

  - index page와 search page에 searchBar layout 적용

  - 라우트 그룹(Route Group) 사용: 경로상에는 아무런 영향을 미치지 않으며 각기 다른 기능의 페이지를 묶을 수 있음

    - 폴더명을 소괄호로 감쌈

    - layout만 따로 적용 가능

  ```
  app/(with-searchbar) 폴더 생성 후 인덱스 페이지와 search 폴더를 옮김
  ```

<br />

### **`리액트 서버 컴포넌트 이해하기`**

- React Server Component

  - React 18v부터 새롭게 추가된, 새로운 유형의 컴포넌트

  - 서버 측에서만 실행되는 컴포넌트(브라우저에서 실행 X)

  - 브라우저에서 하이드레이션 될 필요 없는 컴포넌트들(상호작용이 없는 컴포넌트)을 JS Bundle에 포함시키지 않도록 제외시키기 위해 등장

  ```
  => 특정 페이지에 필요한 컴포넌트들을 상호작용에 따라 서버 컴포넌트와 클라이언트 컴포넌트로 분류

  1. 모든 컴포넌트를 실행해 사전 렌더링

    - 상호작용이 없는 컴포넌트: server component

    - 상호작용이 있는 컴포넌트: client component


  2. client component만 JS Bundle에 포함시켜 한 번 더 실행


  * server component: 서버 측에서 사전 렌더링을 진행할 때 딱 한 번만 실행됨
  * client component: 사전 렌더링 진행할 때 한 번 + 하이드레이션 진행할 때 한 번 = 총 2번 실행

  * Next.js에서는 페이지의 대부분을 서버 컴포넌트로 구성할 것과 클라이언트 컴포넌트는 꼭 필요한 경우에만 사용할 것을 권장
  => 최종적으로 JS Bundle이 줄어듦
  ```

<br />

- Server / Client Component 실습

  > App Router에서는 기본적으로 모든 컴포넌트가 Server Component

  - server component는 서버에서만 실행되기 때문에 보안 관련된 코드나 데이터 페칭 등에 대한 작업 실행 가능, 단 브라우저에서만 가능한 기능은 사용 불가

    - React Hooks 사용 불가능

  ```
  Q. Server / Client Component를 어떻게 분류하는가?

  - 상호작용이 있어야 하면 client component, 아니면 전부 server component

  - Link는 Js 기능을 활용하는 상호작용이 아님 -> 페이지 이동

  - SearchBar 컴포넌트는 client component -> 입력값 저장, 페이지 이동 등을 수행
  ```

<br />

- Co-Location

  - 페이지, 레이아웃이 아닌 파일을 app 하위에 둘 경우 일반적인 ts/js 파일로 처리 -> 컴포넌트도 동일

  - (with-searchbar)/searchbar.tsx 파일을 컴포넌트로 처리

### **`리액트 서버 컴포넌트 주의 사항`**

1. 서버 컴포넌트에는 브라우저에서 실행될 코드가 포함되면 안 된다.

   - React Hooks, 이벤트 핸들러 사용 불가

   - 브라우저에서 실행되는 기능을 담고 있는 라이브러리 호출 출가

<br />

2. 클라이언트 컴포넌트는 클라이언트에서만 실행되지 않는다.

   - 서버 컴포넌트: 서버 측에서만 실행되는 컴포넌트

   - 클라이언트 컴포넌트: 사전 렌더링을 위해 서버에서 1번, 하이드레이션을 위해 브라우저에서 1번 -> 서버와 클라이언트에서 모두 실행됨

   ```ts
   "use client";

   export default function Home() {
     console.log("컴포넌트 실행!");

     return <div>인덱스 페이지</div>;
   }
   ```

<br />

3. 클라이언트 컴포넌트에서 서버 컴포넌트를 import 할 수 없다.

   - 클라이언트 컴포넌트의 코드는 서버와 브라우저에서 모두 실행 되지만 서버 컴포넌트의 코드는 오직 서버에서만 실행됨

   - 사전 렌더링에서는 수행이 가능하지만 하이드레이션을 위해 한 번 더 실행될 때는 서버 컴포넌트의 코드는 존재하지 않아 수행되지 못함

   > 서버 컴포넌트는 JS Bundle에 포함되지 않음

   <br />

   - client component가 server component를 직접 import 하는 경우

   ```ts
   "use client";

   // 불가능
   import ServerComponent from "./server-components.tsx";

   export default function ClientComponent() {
     return <SeverComponent />;
   }
   ```

   ```
   클라이언트 컴포넌트에서 서버 컴포넌트를 import 하려고 할 경우,
   Next.js는 자동으로 서버 컴포넌트를 클라이언트 컴포넌트로 변경함

   => 클라이언트 컴포넌트에서 서버 컴포넌트를 자식 컴포넌트로 두는 것 지양
   => 자식 컴포넌트로 사용해야 한다면 children으로 받아서 사용
   ```

    <br />

   - client component가 server component를 children으로 받아 사용하는 경우

   ```ts
   // server component인 index 페이지
   import ClientComponent from "./client-component";
   import styles from "./page.module.css";
   import ServerComponent from "./server-component";

   export default function Home() {
     return (
       <div className={styles.page}>
         인덱스 페이지
         <ClientComponent>
           <ServerComponent />
         </ClientComponent>
       </div>
     );
   }
   ```

   ```ts
   "use client";

   export default function ClientComponent({
     children
   }: Readonly<{ children: React.ReactNode }>) {
     console.log("클라이언트 컴포넌트!");

     return <div>{children}</div>;
   }
   ```

   > 서버 컴포넌트의 결과만 props으로 받아서 처리하기 때문에 클라이언트 컴포넌트로 변환되지 않음

<br />

4. 서버 컴포넌트에서 클라이언트 컴포넌트에게 직렬화되지 않는 Props는 전달 불가하다.

   - 직렬화(Serialization)

     - 객체, 배열, 클래스 등의 복잡한 구조의 데이터를 네트워크 상으로 전송하기 위해 아주 단순한 형태(문자열, Byte)로 변환하는 것

     - 함수는 직렬화가 불가능함 -> 서버 컴포넌트에서 클라이언트 컴포넌트로 향하는 props가 될 수 없음

   ```ts
   // before
   const person = {
     name: "이정환",
     age: 27
   };
   ```

   ```json
   // after
   { "name": "이정환", "age": 27 }
   ```

   - <u>직렬화 되지 않는 Props</u>: 함수

   ```ts
   function findName(search: string) {
     //
   }
   ```

   - 사전 렌더링 과정을 통한 4번 주의 사항 이해

   ```
   1. 페이지를 구성하는 모든 컴포넌트 확인

   2. 서버 컴포넌트들만 먼저 실행되어 RSC Payload로 직렬화가 됨

   3. 클라이언트 컴포넌트 실행

   4. RSC Payload + 클라이언트 컴포넌트 결과 -> 완성된 HTML 페이지


   * RSC Payload

    - React Server Component의 순수한 데이터(결과물)
    - React Server Component를 직렬화한 결과

   => RCS Payload에는 서버 컴포넌트의 모든 데이터가 포함됨

    - 서버 컴포넌트의 렌더링 결과
    - 연결된 클라이언트 컴포넌트의 위치
    - 클라이언트 컴포넌트에게 전달하는 Props 값


   * 함수는 직렬화할 수 없는 값이기에 Props로 전달 불가능
   => RSC Payload 변환 불가능
   ```

<br />

### **`네비게이팅`**

- 페이지 이동은 Client Side Rendering 방식으로 처리 -> Page Router 버전과 동일

- App Router에서는 서버 컴포넌트가 추가되었기 때문에 JS Bundle + RSC Payload 전달

  - JS Bundle에는 클라이언트 컴포넌트만 포함되기 때문

  - JS Bundle: Client Component

  - RSC Payload: Server Component

  ```
  * 초기 접속 요청 이후

  유저                브라우저(클라이언트)              서버
  페이지 이동 요청 ->
                              <- JS Bundle(이동할 페이지에 필요한 컴포넌트)
                                                  +
                                              RSC Payload

                                          프리페칭(Pre-Fetching)

                  JS 실행(컴포넌트 교체)

                  <- 페이지 교체


  => 이동한 페이지에 클라이언트 컴포넌트가 없는 경우 RSC Payload만 전달됨

  * 프리페칭(Pre-Fetching)
  - 이동할(현재 페이지에서 이동가능한) 페이지의 데이터를 미리 불러오는 기능
  ```

<br />

- next/link의 Link 태그 사용

<br />

- 프로그래매틱한(Programmatic) 페이지 이동

  - 이벤트 핸들러를 통한 페이지 이동

  - App Router 버전인 next/navigation의 useRouter 사용

<br />

- App Router의 Pre-Fetching

  - 이동할(현재 페이지에서 이동가능한) 페이지의 데이터를 미리 불러오는 기능

  - Static(SSG)페이지와 다르게 동적 페이지(SSR)의 경우 JS Bundle를 포함하지 않고 RSC Payload만 불러옴

<br />

### **`한입북스 UI 구현하기`**

- 수업자료 받아서 src 디렉토리 교체

- page router와 다른 점

  - queryString을 useRouter에서 바로 사용할 수 없음

  - useSearchParams를 사용해 queryString을 가져옴 -> useEffect 사용

  ```ts
  "use client";

  import { useEffect, useState } from "react";
  import { useRouter, useSearchParams } from "next/navigation";
  import style from "./serachbar.module.css";

  export default function Searchbar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [search, setSearch] = useState("");

    // router.query.q -> AppRouterInstance 형식에 query 속성이 없음
    // useSearchParams hook을 사용해야 함
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
