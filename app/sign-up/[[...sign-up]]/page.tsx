import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <main className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl" />
      
      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        <SignUp
          appearance={{
            elements: {
              formButtonPrimary: 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-sm font-semibold shadow-lg transition-all duration-200 border-none',
              card: 'bg-slate-900/90 border border-white/10 text-white shadow-2xl backdrop-blur-xl rounded-2xl',
              headerTitle: 'text-white text-2xl font-bold',
              headerSubtitle: 'text-slate-400 text-sm',
              socialButtonsBlockButton: 'bg-slate-950 border border-white/10 hover:bg-slate-900 text-white transition-colors duration-200',
              socialButtonsBlockButtonText: 'text-white font-medium',
              dividerLine: 'bg-white/10',
              dividerText: 'text-slate-500',
              formFieldLabel: 'text-slate-300 font-medium text-xs',
              formFieldInput: 'bg-slate-950 border-white/10 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg text-sm',
              footerActionText: 'text-slate-400',
              footerActionLink: 'text-indigo-400 hover:text-indigo-300 font-medium',
            },
          }}
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
        />
      </div>
    </main>
  );
}
