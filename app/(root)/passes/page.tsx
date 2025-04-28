import { WalletPass } from '@prisma/client';
import PassCard from '@/components/pass-card';
import { headers } from 'next/headers';
import Image from 'next/image';
import PageHeader from '@/components/page-header';

export default async function AllPasses() {
  const response = await fetch(`${process.env.BETTER_AUTH_URL}/api/passes`, {
    headers: await headers(),
  });

  const data: {
    passes: null | WalletPass[];
    error?: string;
  } = await response.json();

  return (
    <>
      <PageHeader
        title="My Passes"
        description="Manage and share your digital passes"
        buttonLabel="Create New Pass"
        href="/passes/create"
      />
      {data?.passes?.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[500px] border border-gray-200 rounded-lg max-w-5xl mx-auto">
          <Image src="/no-data.svg" alt="Empty State" width={200} height={200} />
          <h3 className="text-xl font-semibold text-gray-700 mb-2 mt-4">
            You have not created any passes yet.
          </h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {data?.passes?.map((pass: WalletPass) => <PassCard key={pass.id} pass={pass} />)}
        </div>
      )}
    </>
  );
}
