import PassForm from '@/components/passes/pass-form';

export default function PassCreator() {
  return (
    <div className="container mx-auto px-4">
      <PassForm mode="create" />
    </div>
  );
}
