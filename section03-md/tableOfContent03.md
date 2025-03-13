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

  - 서버 컴포넌트는 서버에서 사전 렌더링을 위해서 딱 한 번만 실행됨 -> 비동기적으로 실행되어도 문제 없음

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

    - 폴더 명을 소괄호로 감쌈

    - layout만 따로 적용 가능

  ```
  app/(with-searchbar) 폴더 생성 후 인덱스 페이지와 search 폴더를 옮김
  ```

<br />

### **`리액트 서버 컴포넌트 이해하기`**

- React Server Component

  - React 18v부터 새롭게 추가된, 새로운 유형으 ㅣ컴포넌트

  - 서버 측에서만 실행되는 컴포넌트(브라우저에서 실행 X)

  - 브라우저에서 하이드레이션 될 필요 없는 컴포넌트들(상호작용이 없는 컴포넌트)을 JS Bundle에 포함시키지 않도록 제외시키기 위해 등장

  ```
  => 특정 페이지에 필요한 컴포넌트들을 상호작용에 따라 서버 컴포넌트와 클라이언트 컴포넌트로 분류

  1. 모든 컴포넌트를 실행해 사전 렌더링

    - 상호작용이 없는 컴포넌트: server component

    - 상호작용이 있는 컴포넌트: client component


  2. client component만 JS Bundle에 포함시켜 한 번 더 실행


  * server component: 서버측에서 사전 렌더링을 진행할 때 딱 한 번만 실행됨
  * client component: 사전 렌더링 진행할 때 한 번 + 하이드레이션 진행할 때 한 번 = 총 2번 실행

  * Next.js에서는 페이지의 대부분을 서버 컨포넌트로 구성할 것고 클라이언트 컴포넌트는 꼭 필요한 경우에만 사용할 것을 권장
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

### **`리액트 서버 컴포넌트 주의사항`**

<br />

### **`네비게이팅`**

<br />

### **`한입북스 UI 구현하기`**
