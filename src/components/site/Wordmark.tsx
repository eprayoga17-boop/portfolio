export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-baseline gap-1.5 leading-none ${className}`}>
      <span className="display text-[1.35rem] text-cobalt-text">Erik</span>
      <span className="script -translate-y-[1px] text-[1.65rem] text-orange-text">Prayoga</span>
    </span>
  );
}
