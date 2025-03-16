import ClientComponent from "@/components/client-component";

export default async function Page({
  params
}: Readonly<{ params: Promise<{ id: string | string[] }> }>) {
  const { id } = await params;

  return (
    <div>
      book/[id] 페이지 : {id}
      <ClientComponent>
        <></>
      </ClientComponent>
    </div>
  );
}
