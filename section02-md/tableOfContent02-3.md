### **`ISR(Increment Static Regeneration) 소개 및 실습`**

> 가장 강력한 사전 렌더링 방식

- 증분 정적 재생성

- SSG 방식으로 생성된 정적 페이지를 일정 시간을 주기로 다시 생성하는 기술 -> 특정 시간을 주기로 정적 페이지 재생성

  - 빌드 타임에 사전 렌더링(페이지 생성)할 때 유효 기간 설정 -> 유효 기간이 지난 경우 다시 재생성

  - 장점: 매우 빠른 속도로 응답 가능(기존 SSG 방식의 장점), 최신 데이터 반영 가능(기존 SSR 방식의 장점)

  ```
  1. 0초: 빌드 타임 => 사전 렌더링

  2. 60초가 지나기 전: 사전 렌더링 된 페이지

  3. 60초 지난 후: 사전 렌더링 된 페이지를 보여준 후 새로운 페이지 반환
  ```

<br />

- pages/index.tsx ISR 적용

  - 추천 도서 업데이트

  - getStaticProps의 반환 객체에 **revalidate**(재검증) 값 설정

  ```ts
  export const getStaticProps = async () => {
    console.log("인덱스 페이지");

    const [allBooks, recoBooks] = await Promise.all([
      fetchBooks(),
      fetchRandomBooks()
    ]);

    return {
      props: {
        allBooks,
        recoBooks
      },
      revalidate: 3
    };
  };
  ```

<br />

### **`ISR 주문형 재 검증(On-Demand-ISR)`**

- 시간 기반의 ISR을 적용하기 어려운 페이지?

  - 시간과 관계없이 사용자의 행동에 따라 데이터가 업데이트되는 페이지

  - ex) 커뮤니티 사이트의 게시글 페이지(수정, 삭제)

<br />

- On-Demand-ISR: 요청을 받을 때마다 페이지를 다시 생성하는 ISR

  - 시간을 기반으로 불필요하거나 너무 늦게 페이지를 재생성하는 과정 제거

  - 실제 사용자의 요청에 따라 페이지 재생성: 페이지 요청 직접 트리거링 가능

<br />

- On-Demand-ISR를 pages/index.tsx에 적용

  1. src/pages/index.tsx의 getStaticProps 함수의 반환 객체의 revalidate 옵션 제거

  ```ts
  // src/pages/index.tsx
  export const getStaticProps = async () => {
    console.log("인덱스 페이지");

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
  ```

  <br />

  2. revalidate에 대한 api 생성

     - /api/revalidate로 요청할 경우 핸들러 실행

  ```ts
  // src/api/revalidate.ts
  import { NextApiRequest, NextApiResponse } from "next";

  export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    try {
      await res.revalidate("/");
      return res.json({ revalidate: true });
    } catch (err) {
      res.status(500).send("Revalidation Failed");
    }
  }
  ```

  > index 페이지 생성 후 api/revalidate로 접속(요청)한 다음 index 페이지 새로고침 <br />
  > => 새롭게 렌더링 된 페이지 반환
