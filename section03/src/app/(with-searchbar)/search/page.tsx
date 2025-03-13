export default async function Page({
  searchParams
}: Readonly<{
  searchParams: Promise<{ q: string }>;
}>) {
  const { q } = await searchParams;

  return <div>Search 페이지 {q}</div>;
}
