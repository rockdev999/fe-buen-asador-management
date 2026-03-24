import { type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AuthLayoutProps {
  card: ReactNode;
  title: string;
  description: string;
  step: 1 | 2;
  userName?: string;
  userEmail?: string;
  userInitials?: string;
}

export function AuthLayout({
  card,
  title,
  description,
  step,
  userName,
  userEmail,
  userInitials,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-surface flex overflow-hidden">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-5/12 bg-inkblack flex-col justify-between p-10">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-medium">BA</span>
          </div>
          <span className="text-white text-base font-medium">Buen Asador</span>
        </div>

        {/* Tagline */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            <h1 className="text-white text-2xl font-medium leading-snug mb-3">
              {title}
            </h1>
            <p className="text-white/40 text-sm leading-relaxed">
              {description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Footer — user chip en paso 2, dots siempre */}
        <div className="flex flex-col gap-3">
          {step === 2 && userName && (
            <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
              <div className="w-8 h-8 bg-brand rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-medium">
                  {userInitials}
                </span>
              </div>
              <div>
                <p className="text-white text-sm font-medium">{userName}</p>
                <p className="text-white/40 text-xs">{userEmail}</p>
              </div>
            </div>
          )}

          {/* Carousel dots */}
          <div className="flex gap-1.5">
            <div
              className={
                step === 1
                  ? "w-5 h-1.5 bg-brand rounded-full"
                  : "w-1.5 h-1.5 bg-white/20 rounded-full"
              }
            />
            <div
              className={
                step === 2
                  ? "w-5 h-1.5 bg-brand rounded-full"
                  : "w-1.5 h-1.5 bg-white/20 rounded-full"
              }
            />
            <div className="w-1.5 h-1.5 bg-white/20 rounded-full" />
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-medium">BA</span>
            </div>
            <span className="text-inkblack text-sm font-medium">
              Buen Asador
            </span>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl border border-surface p-8">
            {card}
          </div>
        </div>
      </div>
    </div>
  );
}
