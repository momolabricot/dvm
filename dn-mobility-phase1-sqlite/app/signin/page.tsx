import SignInForm from '@/components/SignInForm'

export default function SignInPage({
  searchParams,
}: {
  searchParams?: { callbackUrl?: string }
}) {
  const callbackUrl = searchParams?.callbackUrl || '/'

  return (
    <main className="max-w-md mx-auto py-10">
      <h1 className="text-2xl font-semibold mb-4">Connexion</h1>
      {/* On passe callbackUrl au composant client */}
      <SignInForm callbackUrl={callbackUrl} />
    </main>
  )
}
