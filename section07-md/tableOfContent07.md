## **`서버 액션`**

### **`서버 액션 소개`**

- 서버 액션: 브라우저에서 호출할 수 있는 서버에서 실행되는 비동기 함수

  > 별도의 api 없이 데이터를 불러와 사용 가능

  - 함수 안 상단에 "use server"; 지시자 작성할 경우 함수를 next 서버에서 실행되는 서버 액션으로 설정

- ex)

  ```ts
  export default function Page() {
    const saveName = async (formData: FormData) => {
      "use server";

      const name = formData.get("name");
      // db 저장 함수 호출
      await saveDB({ name: name });
      // sql문 직접 작성
      await sql`INSERT INTO Names (name) VALUES (${name})`;
      //
    };

    return (
      <form action={saveName}>
        <input name="name" placeholder="이름을 알려주세요..." />
        <button type="submit">제출</button>
      </form>
    );
  }
  ```

<br />

- 서버 액션 요약

  ```
  브라우저에서 특정 form에 제출 이벤트가 발생했을 때
  서버에서만 실행되는 함수를 브라우저가 직접 호출하면서 데이터까지
  formData 형식으로 전달해 주는 기능

  -> 자바스크립트 함수 하나만으로 서버 간의 데이터 통신 설정 가능

  => 클라이언트인 브라우저 측에서 특정 폼, 양식의 제출이 발생했을 때,
  서버에서만 실행되는 함수를 실행시켜 주는 기능
  ```

<br />

- 실습(리뷰 기능)

  - 네트워크 request header의 Next-Action: 자동으로 해시값을 갖는 api

    - 브라우저에서 form 태그를 제출했을 때 해당 api가 자동으로 호출됨

  - 기존 코드와 review 기능을 위해 분리: BookDetail 분리, ReviewEditor 추가

  - 리뷰 작성을 위한 ReviewEditor 컴포넌트 추가 + 서버 액션 사용을 위해 createReviewAction 함수 상단에 use server 지시자 작성

  ```ts
  // app/book/[id]/page.tsx

  function ReviewEditor() {
    async function createReviewAction(formData: FormData) {
      "use server";

      // formData.get(name 속성)을 사용해 입력된 값 추출
      // FormDataEntryValue:string, file 타입을 의미
      // string 타입을 위해 ?.toString() 사용 -> 값이 있을 때만 string 타입으로 변환
      const content = formData.get("content")?.toString();
      const author = formData.get("author")?.toString();

      console.log(content, author);
    }

    return (
      <section>
        <form action={createReviewAction}>
          <input type="text" name="content" placeholder="리뷰 내용" />
          <input type="text" name="author" placeholder="작성자" />
          <button type="submit">작성하기</button>
        </form>
      </section>
    );
  }

  export default async function Page({
    params
  }: Readonly<{ params: Promise<{ id: string }> }>) {
    const { id } = await params;

    return (
      <div className={style.container}>
        <BookDetail bookId={id} />
        <ReviewEditor />
      </div>
    );
  }
  ```

<br />

- 서버 액션 사용 이유

  1. 간결한 코드: 파일 추가, 경로 설정, 예외 처리와 같은 부가적인 작업 없이 단순한 기능에서 함수 하나만으로도 사용 가능

  2. 보안상으로 중요한 데이터를 다룰 때 유용: 서버 측에서만 실행되는 코드이기 때문에 브라우저에서는 코드를 전달받지 않음

<br />

### **`리뷰 추가 기능 구현(with 서버액션)`**

- database에 직접 접근 X

- server에서 제공하는 review 관련 api 사용

  ```ts
  // 부모 컴포넌트에서 bookId를 받아서 함께 전달
  function ReviewEditor({ bookId }: Readonly<{ bookId: string }>) {
    async function createReviewAction(formData: FormData) {
      "use server";

      const content = formData.get("content")?.toString();
      const author = formData.get("author")?.toString();

      // 에러 처리
      if (!content || !author) {
        return;
      }

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_SERVER_URL}/review`,
          {
            method: "POST",
            // 데이터 직렬화를 위해 JSON.stringify 메서드 사용
            body: JSON.stringify({
              bookId,
              content,
              author
            })
          }
        );

        console.log(res.status);
      } catch (err) {
        console.error(err);
        return;
      }
    }

    return (
      <section>
        <form action={createReviewAction}>
          <input required type="text" name="content" placeholder="리뷰 내용" />
          <input required type="text" name="author" placeholder="작성자" />
          <button type="submit">작성하기</button>
        </form>
      </section>
    );
  }
  ```

<br />

- 서버 액션을 별도의 파일로 분리

  - 서버 액션을 파일로 분리할 경우 "use server"; 지시자를 파일 최상단에 작성

  ```ts
  // src/actions/create-review.cation.ts
  "use server";

  export async function createReviewAction(formData: FormData) {
    const bookId = formData.get("bookId")?.toString();
    const content = formData.get("content")?.toString();
    const author = formData.get("author")?.toString();

    // 에러 처리
    if (!bookId || !content || !author) {
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/review`,
        {
          method: "POST",
          body: JSON.stringify({
            bookId,
            content,
            author
          })
        }
      );

      console.log(res.status);
    } catch (err) {
      console.error(err);
      return;
    }
  }
  ```

  ```ts
  // src/app/book/[id]/page.tsx 내부 ReviewEditor component
  function ReviewEditor({ bookId }: Readonly<{ bookId: string }>) {
    return (
      <section>
        <form action={createReviewAction}>
          <input name="bookId" value={bookId} hidden readOnly />
          <input required type="text" name="content" placeholder="리뷰 내용" />
          <input required type="text" name="author" placeholder="작성자" />
          <button type="submit">작성하기</button>
        </form>
      </section>
    );
  }
  ```

  > input 태그를 hidden으로 설정해 id 전달

<br />

### **`리뷰 조회 기능 구현 & 스타일링`**

- review list를 호출하는 컴포넌트 생성

  ```ts
  // app/book/[id]/page.tsx
  async function ReviewList({ bookId }: Readonly<{ bookId: string }>) {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_SERVER_URL}/review/book/${bookId}`
    );

    if (!res.ok) {
      throw new Error(`Review fetch failed: ${res.statusText}`);
    }

    const reviews: ReviewData[] = await res.json();

    return (
      <section>
        {reviews.map((review) => (
          <ReviewItem key={`review-item-${review.id}`} {...review} />
        ))}
      </section>
    );
  }
  ```

<br />

- review 타입 정의

  ```ts
  // src/types.ts
  export interface ReviewData {
    id: number;
    content: string;
    author: string;
    createdAt: string;
    bookId: number;
  }
  ```

<br />

- review item 컴포넌트 파일 생성 및 스타일링 적용

  - css 파일: review-item.module.css

  ```ts
  // src/components/review-item.tsx
  import { ReviewData } from "@/types";
  import style from "./review-item.module.css";

  export default function ReviewItem({
    id,
    content,
    author,
    createdAt,
    bookId
  }: Readonly<ReviewData>) {
    return (
      <div className={style.container}>
        <div className={style.author}>{author}</div>
        <div className={style.content}>{content}</div>
        <div className={style.bottom_container}>
          <div className={style.date}>
            {new Date(createdAt).toLocaleString()}
          </div>
          <div className={style.delete_btn}>삭제하기</div>
        </div>
      </div>
    );
  }
  ```

<br />

- ReviewEditor 컴포넌트 부분을 파일로 분리 및 스타일링 적용

  - css 파일: review-editor.module.css

  ```ts
  import style from "./review-editor.module.css";
  import { createReviewAction } from "@/actions/create-review.action";

  export default function ReviewEditor({
    bookId
  }: Readonly<{ bookId: string }>) {
    return (
      <section>
        <form action={createReviewAction} className={style.form_container}>
          <input name="bookId" value={bookId} hidden readOnly />
          <textarea required name="content" placeholder="리뷰 내용" />
          <div className={style.submit_container}>
            <input required type="text" name="author" placeholder="작성자" />
            <button type="submit">작성하기</button>
          </div>
        </form>
      </section>
    );
  }
  ```

<br />

### **`리뷰 재검증 구현하기`**

- 리뷰 작성 후 자동으로 화면 업데이트: 서버 액션이 성공적으로 종료되었을 때 실시간으로 book 페이지 재검증

- NextJs가 제공하는 revalidatePath 메서드 호출(next/catch): 현재 페이지 경로를 인수로 전달

  - revalidatePath(): next 서버에게 경로로 작성된 페이지 재검증(다시 생성) 요청 -> Page 컴포넌트가 재렌더링 -> 하위 컴포넌트도 재렌더링

  > Page 컴포넌트와 하위 컴포넌트를 재렌더링 하기 위해 데이터 페칭도 다시 수행됨

  ```ts
  "use server";

  import { revalidatePath } from "next/cache";

  export async function createReviewAction(formData: FormData) {
    const bookId = formData.get("bookId")?.toString();
    const content = formData.get("content")?.toString();
    const author = formData.get("author")?.toString();

    // 에러 처리
    if (!bookId || !content || !author) {
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/review`,
        {
          method: "POST",
          body: JSON.stringify({
            bookId,
            content,
            author
          })
        }
      );

      console.log(res.status);
      revalidatePath(`/book/${bookId}`);
    } catch (err) {
      console.error(err);
      return;
    }
  }
  ```

<br />

- revalidatePath 메서드 사용 시 주의사항

  1. 서버측에서만 호출되는 메서드: 서버 액션, 서버 컴포넌트 내부에서만 호출 가능

  2. 해당 페이지를 전부 재검증하는 메서드이기 때문에 페이지에 포함된 모든 데이터 캐시들까지 전부 무효화(삭제) -> catch 옵션을 적용해도 캐시가 삭제됨

  3. 데이터 캐시뿐만 아니라 페이지를 캐싱하는 풀 라우트 캐시까지도 함께 삭제됨 -> 새롭게 생성된 페이지를 풀 라우트 캐시에 저장하지는 않음

     - 새로고침(페이지 재방문) 후에 next 서버 측에서 실시간으로 다이나믹 페이지를 만들듯이 새롭게 페이지 생성 후 브라우저에 전달, 풀 라우트 캐시로 업데이트

  <br />

  ```
  - revalidatePath 요청 시 next 서버는 풀 라우트 캐시, 데이터 캐시를 PURGE 상태로 만듦
  => 캐시된 데이터 제거

  - 각종 Fetch 함수에 대한 데이터들을 다시 SKIP(요청), SET(저장)
  => 풀 라우트 캐시에는 페이지 업데이트 X

  - 브라우저로 해당 페이지에 대한 요청이 들어왔을 때 각종 Fetch 데이터 캐시에서 HIT
  => 페이지 생성 후 풀 라우터 캐시에 페이지 SET


  => revalidatePath 함수 이후 페이지를 다시 요청할 경우, 응답이 늦어질 수 있음

  * revalidatePath 요청 이후에 브라우저에서 페이지에 접속하게 되었을 때,
  최신의 데이터를 보장하기 위해 위와 같은 동작이 이뤄짐
  ```

<br />

### **`다양한 재검증 방식 살펴보기`**

<br />

### **`클라이언트 컴포넌트에서의 서버 액션`**

<br />

### **`리뷰 삭제 기능 구현`**
