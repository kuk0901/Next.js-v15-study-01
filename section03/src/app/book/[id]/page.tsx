export default async function Page({
  params
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;

  return <div>book/[id] 페이지 : {id}</div>;
}
