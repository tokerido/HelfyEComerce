import { motion } from 'framer-motion';
import { SignupForm } from '../components/SignupForm';

export function SignupPage() {
  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-accent-muted to-background items-center justify-center p-12">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-text-primary mb-4">Helfy<span className="text-accent">.</span></h1>
          <p className="text-text-secondary text-lg">Join thousands of happy customers.</p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <h2 className="text-3xl font-bold text-text-primary mb-2">Create account</h2>
          <p className="text-text-secondary mb-8">Start your premium shopping experience</p>
          <SignupForm />
        </motion.div>
      </div>
    </div>
  );
}
