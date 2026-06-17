import Image from "next/image";
import { CreditCard, ShieldCheck, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: UtensilsCrossed,
    title: "Meal allowance tracking",
    description: "Monitor daily balances for every student-athlete.",
  },
  {
    icon: CreditCard,
    title: "RFID-powered checkout",
    description: "Fast, accurate consumption at the cafeteria counter.",
  },
  {
    icon: ShieldCheck,
    title: "Secure staff access",
    description: "Role-based permissions for administrators and cashiers.",
  },
] as const;

type AuthShellProps = {
  children: React.ReactNode;
  title: string;
  description: string;
  className?: string;
};

export function AuthShell({ children, title, description, className }: AuthShellProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className="relative hidden w-[46%] flex-col justify-between overflow-hidden lg:flex"
        aria-hidden="true"
      >
        <Image
          src="/brand/auth-hero.png"
          alt=""
          fill
          priority
          className="object-cover"
          sizes="46vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/88 to-primary/75" />
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage: "url(/brand/auth-pattern.svg)",
            backgroundSize: "400px 400px",
          }}
        />
        <div className="absolute inset-x-0 top-0 z-10 h-0.5 bg-accent" aria-hidden="true" />

        <div className="relative z-10 flex flex-col gap-10 p-12 xl:p-16">
          <div className="flex items-center gap-4">
            <Image
              src="/brand/lams-mark.svg"
              alt="LAMS logo"
              width={56}
              height={56}
              className="drop-shadow-md"
            />
            <div>
              <p className="font-display text-2xl font-semibold tracking-tight text-primary-foreground">
                LAMS
              </p>
              <p className="text-sm text-primary-foreground/80">
                Letran Athlete Meal System
              </p>
            </div>
          </div>

          <div className="max-w-md space-y-3">
            <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight text-primary-foreground xl:text-4xl">
              Fueling excellence on and off the field
            </h1>
            <p className="text-base leading-relaxed text-primary-foreground/85">
              A trusted platform for managing athlete meal allowances, RFID
              transactions, and daily spending limits.
            </p>
          </div>
        </div>

        <ul className="relative z-10 space-y-3 p-12 pt-0 xl:p-16 xl:pt-0">
          {features.map(({ icon: Icon, title: featureTitle, description: featureDescription }) => (
            <li
              key={featureTitle}
              className="flex gap-4 rounded-lg border border-primary-foreground/15 bg-primary-foreground/5 p-4"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-accent bg-accent/20 text-accent">
                <Icon className="size-5" aria-hidden="true" />
              </div>
              <div>
                <p className="font-medium text-primary-foreground">{featureTitle}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-primary-foreground/75">
                  {featureDescription}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </aside>

      <main className="lams-surface flex flex-1 flex-col justify-center px-4 py-10 sm:px-8 lg:px-14 xl:px-20">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 flex flex-col items-center text-center lg:items-start lg:text-left">
            <div className="mb-5 flex items-center gap-3 lg:hidden">
              <Image
                src="/brand/lams-logo.png"
                alt="LAMS"
                width={48}
                height={48}
                className="rounded-xl shadow-sm"
              />
              <div className="text-left">
                <p className="font-display text-lg font-semibold text-primary">LAMS</p>
                <p className="text-xs text-muted-foreground">Letran Athlete Meal System</p>
              </div>
            </div>

            <div className="hidden items-center gap-3 lg:mb-2 lg:flex">
              <Image
                src="/brand/lams-mark.svg"
                alt=""
                width={40}
                height={40}
                aria-hidden="true"
              />
            </div>

            <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
              {title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
          </div>

          <div
            className={cn(
              "lams-gold-rule-top rounded-xl border border-border/80 bg-card p-6 shadow-(--shadow-card) sm:p-8",
              className
            )}
          >
            {children}
          </div>

          <p className="mt-8 text-center text-xs text-muted-foreground lg:text-left">
            Colegio de San Juan de Letran · Athlete Services
          </p>
        </div>
      </main>
    </div>
  );
}
