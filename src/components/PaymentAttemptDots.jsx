// "● ● ○ ○": one dot per payment attempt. Red = failed, amber = running, grey = still available.
export default function PaymentAttemptDots({ failed = 0, used = 0, max = 4 }) {
  return (
    <div className="flex items-center justify-center gap-2" aria-label={`${failed} of ${max} attempts failed`}>
      {Array.from({ length: max }, (_, i) => {
        const cls = i < failed ? "bg-red-500" : i < used ? "bg-amber-400" : "bg-gray-200";
        return <span key={i} className={`h-2.5 w-2.5 rounded-full ${cls}`} />;
      })}
    </div>
  );
}
