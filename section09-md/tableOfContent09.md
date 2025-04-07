## **`최적화와 배포`**

### **`이미지 최적화`**

- 일반 이미지 최적화

  ```
  1. webp, AVIF 등의 차세대 형식으로 변환 -> 경량화된 이미지 포맷

  2. 디바이스 사이즈에 맞는 이미지 불러오기

  3. 레이지 로딩 적용

  4. 블러 이미지 활용
  ..
  ```

<br />

- next에서 제공하는 `Image` 컴포넌트 사용

  ```ts
  import Image from "next/image";

  export default function Page() {
    return (
      <Image
        src="/profile.png"
        width{500}
        height{500}
        alt="Picture of the author"
      />
    )
  }
  ```

<br />

- 현재 코드의 문제점

  - jpeg 확장자

  - 페이지에 포함된 이미지를 모두 불러옴

  - 실제 사용 크기보다 더 큰 이미지 크기에 따른 용량(4배 차이)

<br />

- img 태그를 Image 컴포넌트로 변경

  ```ts
  // components/book-item.tsx
  import type { BookData } from "@/types";
  import Link from "next/link";
  import style from "./book-item.module.css";
  import Image from "next/image";

  export default function BookItem({
    id,
    title,
    subTitle,
    description,
    author,
    publisher,
    coverImgUrl
  }: Readonly<BookData>) {
    return (
      <Link href={`/book/${id}`} className={style.container}>
        <Image
          src={coverImgUrl}
          width={80}
          height={105}
          alt={`도서 ${title}의 표지 이미지`}
        />
        <div>
          <div className={style.title}>{title}</div>
          <div className={style.subTitle}>{subTitle}</div>
          <br />
          <div className={style.author}>
            {author} | {publisher}
          </div>
        </div>
      </Link>
    );
  }
  ```

<br />

- next.config.js 수정

  - 사용되는 이미지가 외부 서버에 보관되어 있는 경우 보안에 의해 차단됨 -> 설정 추가

  ```ts
  import type { NextConfig } from "next";

  const nextConfig: NextConfig = {
    /* config options here */
    logging: {
      fetches: {
        fullUrl: true
      }
    },
    images: {
      // 배열 형태로 허용할 domain 추가
      domains: ["shopping-phinf.pstatic.net"]
    }
  };

  export default nextConfig;
  ```

<br />

- book/[id]/page.tsx의 BookDetail의 image 최적화

  ```ts
  async function BookDetail({ bookId }: Readonly<{ bookId: string }>) {
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
      <section>
        <div
          className={style.cover_img_container}
          style={{ backgroundImage: `url('${coverImgUrl}')` }}
        >
          <Image
            src={coverImgUrl}
            width={240}
            height={300}
            alt={`도서 ${title}의 표지 이미지`}
          />
        </div>
        <div className={style.title}>{title}</div>
        <div className={style.subTitle}>{subTitle}</div>
        <div className={style.author}>
          {author} | {publisher}
        </div>
        <div className={style.description}>{description}</div>
      </section>
    );
  }
  ```

<br />

### **`검색 엔진 최적화(SEO)`**

```
1. Sitemap 설정

2. RSS 발행

3. 시멘틱 태그 설정

4. 메타 데이터 설정
```

<br />

- 페이지별 메타 데이터 설정

  - metadata 변수를 생성해 export

  - Metadata type: next에서 제공

  - metadata를 page || layout 컴포넌트에서 export 할 경우 자동으로 객체의 값에 따라 metadata 설정 가능

  ```ts
  // 해당 페이지의 metadata로 설정됨
  // (with-searchbar)/page.tsx
  export const metadata: Metadata = {
    title: "한입 북스",
    description: "한입 북스에 등록된 도서를 만나보세요",
    openGraph: {
      title: "한입 북스",
      description: "한입 북스에 등록된 도서를 만나보세요",
      images: ["/thumbnail.png"]
    }
  };
  ```

<br />

- 동적인 값으로 메타데이터 설정

  - generateMetadata() 함수 사용: 현재 페이지 메타 데이터를 동적으로 생성하는 역할, page의 props를 그대로 전달받음

  ```ts
  // (with-searchbar)/search/page.tsx
  export async function generateMetadata({
    searchParams
  }: Readonly<{
    searchParams: Promise<{ q?: string }>;
  }>): Promise<Metadata> {
    const { q } = await searchParams;

    return {
      title: `${q}: 한입북스 검색`,
      description: `${q}의 검색 결과입니다.`,
      openGraph: {
        title: `${q}: 한입북스 검색`,
        description: `${q}의 검색 결과입니다.`,
        images: ["/thumbnail.png"]
      }
    };
  }
  ```

  <br />

  - book/[id]/page.tsx에서 metadata 설정

  ```ts
  export async function generateMetadata({
    params
  }: Readonly<{ params: Promise<{ id: string }> }>): Promise<Metadata> {
    // id를 이용해 실제 도서의 정보를 사용 -> BookDetail의 fetch 함수 사용
    const { id } = await params;
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_SERVER_URL}/book/${id}`
    );

    if (!res.ok) {
      throw new Error(res.statusText);
    }

    const book: BookData = await res.json();

    return {
      title: `${book.title} - 한입북스`,
      description: `${book.description}`,
      openGraph: {
        title: `${book.title} - 한입북스`,
        description: `${book.description}`,
        images: [book.coverImgUrl]
      }
    };
  }
  ```

  > RequestMemoization를 통해 동일 api 요청을 해도 문제 X<br />
  > RequestMemoization: 하나의 페이지를 렌더링하는 도중 중복된 API 호출을 방지

<br />

- favicon 설정

  - app 디레토리 하위의 favicon.ico 파일 변경

<br />

### **`배포하기`**

<br />

### **`배포 후 최적화`**
