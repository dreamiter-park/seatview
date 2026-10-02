-- 야구장도 공연장처럼 시야 별점(1~5)을 받을 수 있도록 baseball_seat_reviews에
-- rating 컬럼을 추가합니다. musical_seat_reviews.rating과 동일한 방식(정수,
-- 비어있을 수 있음, 1~5만 허용)으로 맞췄습니다.
--
-- 실행 방법: Supabase 대시보드 > SQL Editor에 붙여넣고 실행(Run)하세요.

ALTER TABLE baseball_seat_reviews
  ADD COLUMN rating integer CHECK (rating BETWEEN 1 AND 5);
