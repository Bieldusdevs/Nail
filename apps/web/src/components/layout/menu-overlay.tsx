"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/ui/logo";
import { siteConfig } from "@/config/site";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

const navigation = [
  { href: "/", label: "Início", number: "01" },
  { href: "/#servicos", label: "Serviços", number: "02" },
  { href: "/#atelier", label: "O atelier", number: "03" },
  { href: "/reservar", label: "Marcar", number: "04" },
  { href: "/conta", label: "A minha conta", number: "05" },
];

export function MenuOverlay() {
  const [open, setOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="group inline-flex h-12 items-center gap-3 rounded-pill bg-ink px-5 text-sm font-medium text-bone transition-transform duration-300 hover:scale-[1.025] active:scale-[0.98]"
          aria-label="Abrir menu principal"
        >
          <span>Menu</span>
          <span className="relative size-3" aria-hidden="true">
            <span className="absolute left-0 top-[3px] h-px w-3 bg-current transition-transform group-hover:translate-x-0.5" />
            <span className="absolute bottom-[3px] left-0 h-px w-3 bg-current transition-transform group-hover:-translate-x-0.5" />
          </span>
        </button>
      </Dialog.Trigger>
      <AnimatePresence>
        {open ? (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 z-50 bg-ink/35 backdrop-blur-[2px]"
                initial={shouldReduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild onEscapeKeyDown={() => setOpen(false)}>
              <motion.div
                className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[52rem] flex-col overflow-y-auto bg-navy px-[var(--page-gutter)] py-5 text-bone"
                initial={shouldReduceMotion ? false : { x: "100%" }}
                animate={{ x: 0 }}
                exit={shouldReduceMotion ? undefined : { x: "100%" }}
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.65,
                  ease: [0.76, 0, 0.24, 1],
                }}
              >
                <Dialog.Title className="sr-only">Menu principal</Dialog.Title>
                <Dialog.Description className="sr-only">
                  Navegação para as áreas do Lume Atelier.
                </Dialog.Description>
                <div className="flex items-center justify-between">
                  <Logo inverted />
                  <Dialog.Close
                    className="inline-flex size-12 items-center justify-center rounded-full border border-bone/30 transition-colors hover:border-bone"
                    aria-label="Fechar menu"
                  >
                    <X className="size-5" strokeWidth={1.3} />
                  </Dialog.Close>
                </div>

                <nav className="my-auto py-16" aria-label="Navegação principal">
                  <ul>
                    {navigation.map((item, index) => (
                      <motion.li
                        key={item.href}
                        className="border-b border-bone/20"
                        initial={
                          shouldReduceMotion ? false : { opacity: 0, y: 24 }
                        }
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: shouldReduceMotion ? 0 : 0.17 + index * 0.06,
                          duration: shouldReduceMotion ? 0 : 0.45,
                        }}
                      >
                        <Link
                          href={item.href}
                          className="group flex items-end justify-between py-4 md:py-5"
                          onClick={() => setOpen(false)}
                        >
                          <span className="text-[clamp(2.5rem,7vw,5.5rem)] font-light leading-none tracking-[-0.055em] transition-transform duration-500 group-hover:translate-x-3">
                            {item.label}
                          </span>
                          <span className="mb-1 text-xs text-bone/55">
                            {item.number}
                          </span>
                        </Link>
                      </motion.li>
                    ))}
                  </ul>
                </nav>

                <div className="grid gap-5 border-t border-bone/20 pt-5 text-xs uppercase tracking-[0.06em] sm:grid-cols-2">
                  <a
                    href={`mailto:${siteConfig.email}`}
                    className="link-underline"
                  >
                    {siteConfig.email}
                  </a>
                  <a
                    href="https://www.instagram.com"
                    className="inline-flex items-center gap-1 sm:justify-self-end"
                    rel="noreferrer"
                  >
                    Instagram <ArrowUpRight className="size-3.5" />
                  </a>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        ) : null}
      </AnimatePresence>
    </Dialog.Root>
  );
}
