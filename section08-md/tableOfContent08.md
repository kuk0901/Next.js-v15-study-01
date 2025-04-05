## **`고급 라우팅 패턴`**

### **`Parallel Route (페럴렐 라우트)`**

- Parallel Route: 병렬 라우트

- 하나의 화면 안에 여러 개의 페이지 컴포넌트를 병렬로 렌더링하는 패턴

  - ex) 하나의 화면 안에 Sidebar, Feed 페이지를 병렬로 렌더링

  > 단순 컴포넌트가 아닌 page.tsx 컴포넌트를 의미

<br />

- Slot(슬롯): 병렬로 렌더링 될 페이지 컴포넌트를 보관하는 폴더

  - 디렉토리 명에 @ 기호를 붙여 생성: ex) @sidebar

  - 슬롯 안에 보관된 페이지 컴포넌트는 자신의 부모 레이아웃 컴포넌트에게 props로 자동으로 전달됨 -> props의 이름은 슬롯 명과 동일

  - 슬롯은 URL 경로에는 아무런 영향을 미치지 않음 -> 괄호를 사용하는 라우트 그룹(Route Group)과 유사

  - 슬롯 생성에는 개수 제한이 없으나 개발 모드에서 바로 적용되지 않을 수 있음 -> 개발 모드를 종료한 후 .next 폴더 삭제 및 재실행

  > 일종의 현재 자신의 부모 layout 컴포넌트에 추가적으로 제공되는 페이지 컴포넌트를 보관하기 위한 폴더<br />
  > 기본적인 페이지 컴포넌트 또한 @children 슬롯에 있는 것과 동일한 상태라고 할 수 있음

<br />

- 임시 페이지를 통한 실습

  ```ts
  // src/app/parallel/page.tsx
  export default function Page() {
    return <div>/parallel</div>;
  }
  ```

  ```ts
  // src/app/parallel/layout.tsx
  export default function Layout({
    children,
    sidebar
  }: Readonly<{
    children: React.ReactNode;
    sidebar: React.ReactNode;
  }>) {
    return (
      <div>
        {sidebar}
        {children}
      </div>
    );
  }
  ```

  ```ts
  // src/app/parallel/@sidebar/page.tsx
  export default function Page() {
    return <div>@sidebar</div>;
  }
  ```

<br />

- 슬롯과 라우트 이동

  - 특정 슬롯 안에서 추가적인 경로와 페이지 생성 후 브라우저에서 이동할 경우, 해당 슬롯의 페이지만 이동

  ```ts
  // src/app/parallel/@feed/setting/page.tsx
  export default function Page() {
    return <div>@feed/setting</div>;
  }
  ```

  ```ts
  // sra/app/parallel/layout.tsx
  import Link from "next/link";

  export default function Layout({
    children,
    sidebar,
    feed
  }: Readonly<{
    children: React.ReactNode;
    sidebar: React.ReactNode;
    feed: React.ReactNode;
  }>) {
    return (
      <div>
        <div>
          <Link href={"/parallel"}>parallel</Link>
          &nbsp;
          <Link href={"/parallel/setting"}>parallel/setting</Link>
        </div>
        <br />
        {sidebar}
        {feed}
        {children}
      </div>
    );
  }
  ```

  ```
  * layout의 Link 동작

  1. parallel/setting Link를 클릭

  2. feed 하위에 setting 경로가 존재 -> feed 페이지는 하위의 setting/page.tsx 경로 페이지 렌더링

  3. sidebar, children은 setting 경로가 존재하지 않아 기존의 페이지 렌더링

  => next에서 슬롯마다 하위 경로가 존재하지 않는 경우 기존의 페이지를 렌더링함
  => 슬롯의 하위 경로가 있을 땐 하위 경로 페이지를 렌더링


  * 각각의 슬롯들이 이전의 페이지를 유지하게 되는 건 Link 컴포넌트를 이용할 때
  즉, 브라우저 측에서 클라이언트 사이드 렌더링 방식을 이용해 페이지를 이동할 때만 한정됨

  => 새로고침 등의 경우 현재 페이지에 초기 접속을 하게 됨
  => 이전의 페이지를 찾지 못함
  => 해결: 슬롯별로 현재 렌더링 할 페이지가 없을 때 대신 렌더링 할 default page 생성
  ```

<br />

- 슬롯의 default 페이지

  - 현재 렌더링 할 페이지가 없을 때 대신 렌더링됨

  - default.tsx: 약속된 이름

  ```ts
  // src/app/parallel/default.tsx

  export default function Default() {
    return <div>/parallel/default</div>;
  }
  ```

  ```ts
  // src/app/parallel/@sidebar/default.tsx

  export default function Default() {
    return <div>@sidebar/default</div>;
  }
  ```

<br />

### **`Intercepting Route(인터셉팅 라우트)`**

- 사용자가 동일한 경로에 접속하게 되더라도 특정 조건을 만족하게 되면 다른 페이지를 렌더링 하도록 설정하는 패턴

- 조건: 초기 접속 요청이 아닌 경우(next에서 설정)

  - Link 컴포넌트, Router 객체와 같은 브라우저의 클라이언트 사이드 렌더링이 아닌 경우

- 사용법: 특정 경로와 동일한 디렉토리 명 생성, 단 디렉토리 명 앞에 소괄호 작성

  - (.): 상대경로 -> 동일 경로

  - (..): 상위 경로 -> 1단계

  - (..)(..): 상위 경로 -> 2단계

  - (...): app 폴더 바로 하위 폴더

<br />

- book/[id]/page.tsx의 인터셉팅 라우트 적용

  ```ts
  // src/app/(.)book/[id]
  export default function Page() {
    return <div>가로채기 성공</div>;
  }
  ```

  - Modal component 생성

    - createPortal: 브라우저에 존재하는 특정 요소 아래에 모달 요소를 렌더링 하도록 설정하기 위해 사용 -> 페이지 하위에 모달이 설정되지 않도록 함

    - 루트 layout.tsx 파일에 #modal-root 태그 생성

    - dialog 태그는 모달 역할이기 때문에 기본적으로 첫 렌더링 시 보이지 않는 형태로 렌더링 됨

    - dialog의 onClose(): 키보드 esc 입력

    - dialog의 onClick 내부 조건문 (e.target as any).nodeName === DIALOG: 모달의 바깥 영역 클릭을 의미, 현재 ts에서 nodeName 속성을 지원하지 않기에 타입 단언 사용

  ```ts
  // src/components/modal.tsx
  "use client";

  import { createPortal } from "react-dom";
  import style from "./modal.module.css";
  import { useEffect, useRef } from "react";
  import { useRouter } from "next/navigation";

  export default function Modal({
    children
  }: Readonly<{ children: React.ReactNode }>) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const router = useRouter();

    useEffect(() => {
      // 모달 컴포넌트가 자동으로 화면에 보이게 함 + 스크롤 위치 최상단
      if (!dialogRef.current?.open) {
        dialogRef.current?.showModal();
        dialogRef.current?.scrollTo({
          top: 0
        });
      }
    }, []);

    return createPortal(
      <dialog
        onClose={() => router.back()}
        onClick={(e) => {
          // 모달 배경 클릭 -> 뒤로가기
          if ((e.target as any).nodeName === "DIALOG") {
            router.back();
          }
        }}
        className={style.modal}
        ref={dialogRef}
      >
        {children}
      </dialog>,
      document.getElementById("modal-root") as HTMLElement
    );
  }
  ```

<br />

- dialog 태그의 특수성

  ```
  - (e.target as any).nodeName === "DIALOG" 조건에 대한 부가 설명

  1. dialog 태그는 기본적으로 활성화되었을 때 화면 전체를 덮는 블록 요소로 동작

  2. .modal 클래스는 <dialog> 태그 자체에 적용되지만, CSS 속성은 <dialog> 내부 콘텐츠 영역에만 영향을 줌

  3. 사용자가 모달 외부(배경)나 .modal 영역 바깥의 빈공간을 클릭
  => 클릭 이벤트의 e.target은 여전히 dialog 태그 자체

  4. 사용자가 .modal 내부 콘텐츠를 클릭
  => 클릭 이벤트의 e.target은 .modal 내부의 특정 자식 요소(예: 버튼, 텍스트 등)


  => nodeName === "DIALOG" 조건은 "모달 외부 또는 배경을 클릭했을 때"라는 의미로 동작
  => css 속성은 내부 콘텐츠 영역에만 영향을 미치고 dialog 태그 자체는 화면 자체를 덮고 있기 때문
  (모달로서의 동작을 위해 태그 자체는 화면 전체를 차지하지만, 시각적 스타일은 내부 콘텐츠에만 적용)
  ```

  <br />

  - dialog 태그의 2 계층 구조

  ```html
  <dialog>
    <!-- [계층1] 투명한 전체 화면 컨테이너 (태그 자체) -->
    <!-- [계층2] 스타일링된 모달 콘텐츠 (사용자 정의 영역) -->
    <div class="modal-content">
      <h2>모달 제목</h2>
      <p>내용</p>
    </div>
  </dialog>
  ```

<br />

### **`Parallel(페럴렐) & Intercepting(인터셉팅) 라우트`**

- 현재의 구조에서는 인터셉팅 페이지의 모달의 뒤 페이지 배경이 인덱스, 검색 페이지가 아닌 문제점 존재

<br />

- 모달이 열려 있을 때 뒷 배경이 병렬로 이전의 페이지가 함께 렌더링 되도록 수정

  - 인터셉팅 라우트 위치 변경 -> 인터셉팅 라우트에 추가로 페럴랠 라우트 사용: src/app/@modal/(.)book/[id]로 디렉토리 구조 수정

  - @modal 슬롯 안에 인터셉팅 라우트가 존재하게 됨 -> @modal 슬롯의 부모 layout에게 props로 전달됨

  ```ts
  // app/layout.tsx
  // modal과 children 페이지를 병렬로 렌더링
  export default function RootLayout({
    children,
    modal
  }: Readonly<{
    children: React.ReactNode;
    modal: React.ReactNode;
  }>) {
    return (
      <html lang="en">
        <body>
          <div className={style.container}>
            <header>
              <Link href={"/"}>📚 ONEBITE BOOKS</Link>
            </header>
            <main>{children}</main>
            <Footer />
          </div>
          {modal}
          <div id="modal-root"></div>
        </body>
      </html>
    );
  }
  ```

  > book/[id]의 클라이언트 사이드 렌더링은 인터셉팅 라우트에 의해서 modal 렌더링<br />
  > children의 경우 이전 페이지 렌더링

  <br />

  - 인덱스 페이지 접근에서의 인터셉팅 페이지 처리를 위한 default.tsx 생성

  ```ts
  // @modal/default.tsx

  export default function Default() {
    return null;
  }
  ```

<br />

- 페럴랭 라우트 + 인터셉팅 라우트 장점

  - 사용자에게 인터셉팅 되어서 모달로 나타나는 페이지를 이전의 페이지와 함께 병렬로 보여줄 수 있음

  - 특정 아이템의 상세 페이지를 모달로 처리 가능
