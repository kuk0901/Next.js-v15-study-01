"use client";

import { deleteReviewAction } from "@/actions/delete-review.action";
import { useActionState, useEffect, useRef } from "react";
import style from "./review-item.module.css";

export default function ReviewItemDeleteButton({
  reviewId,
  bookId
}: Readonly<{
  reviewId: number;
  bookId: number;
}>) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(
    deleteReviewAction,
    null
  );

  useEffect(() => {
    if (state && !state.status) {
      alert(state.error);
    }
  }, [state]);

  const handleClick = () => {
    formRef.current?.requestSubmit();
  };

  return (
    <form ref={formRef} action={formAction}>
      <input name="reviewId" hidden value={reviewId} readOnly />
      <input name="bookId" hidden value={bookId} readOnly />
      {isPending ? (
        <div>...</div>
      ) : (
        <div
          className={style.delete_btn}
          onClick={handleClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleClick();
          }}
          aria-label="삭제 버튼"
        >
          삭제하기
        </div>
      )}
    </form>
  );
}
