import PassForm from '@/components/passes/pass-form';
import { getPass } from '@/actions/passes';
import { PassData } from '@/types/types';
import { JsonValue } from '@prisma/client/runtime/library';

// Define type for the database model's customization item
type DbCustomization = {
  logoUrl: string;
  coverImgUrl: string;
  websiteUrl: string | null;
  qrUrl: string | null;
  qrText: string | null;
  backgroundColor: string;
  notificationTitle: string | null;
  textFields: JsonValue;
  linkModules: JsonValue;
};

export default async function PassEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getPass(id);
  const pass = data.pass;
  if (!pass) {
    return <div>Pass not found</div>;
  }

  const passData: PassData = {
    type: pass.type,
    name: pass.name,
    url: pass.url,
    customization: pass.customization.map((c: DbCustomization) => ({
      logoUrl: c.logoUrl,
      coverImgUrl: c.coverImgUrl,
      websiteUrl: c.websiteUrl,
      qrUrl: c.qrUrl,
      qrText: c.qrText,
      backgroundColor: c.backgroundColor,
      notificationTitle: c.notificationTitle,
      textFields: typeof c.textFields === 'string' ? JSON.parse(c.textFields) : c.textFields,
      linkModules: typeof c.linkModules === 'string' ? JSON.parse(c.linkModules) : c.linkModules,
    })),
  };

  return (
    <div className="container mx-auto px-4">
      <PassForm mode="edit" initialData={passData} passId={id} />
    </div>
  );
}
