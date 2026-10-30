import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyReferral } from "../features/user/referralSlice";

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

function CopyButton({ text, label }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // older browsers / http: fall back to a hidden textarea
      const area = document.createElement("textarea");
      area.value = text;
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      document.body.removeChild(area);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-[#f4511e] hover:underline"
    >
      <i className={`fa-regular ${copied ? "fa-circle-check" : "fa-copy"}`} aria-hidden="true" />
      {copied ? "Copied" : label}
    </button>
  );
}

// "Referral" card of the account overview page
function ReferralCard() {
  const dispatch = useDispatch();
  const { mine, mineStatus, mineError } = useSelector((state) => state.referral);

  useEffect(() => {
    dispatch(fetchMyReferral());
  }, [dispatch]);

  if (mineStatus === "failed" && !mine) {
    return (
      <div className="mt-6 w-full max-w-3xl rounded-xl border border-line bg-white p-5 text-sm text-red-600 sm:p-7">
        Couldn't load your referral details{mineError ? `: ${mineError}` : "."}
      </div>
    );
  }
  if (!mine) {
    return (
      <div className="mt-6 w-full max-w-3xl rounded-xl border border-line bg-white p-5 text-sm text-muted sm:p-7">
        Loading your referral details...
      </div>
    );
  }

  const { program, stats } = mine;

  return (
    <div className="mt-6 w-full max-w-3xl rounded-xl border border-line bg-white p-5 sm:p-7">
      <div className="mb-5 flex items-center justify-between gap-2 border-b border-line pb-4">
        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted">
          <i className="fa-solid fa-user-plus text-[#f4511e]" aria-hidden="true" />
          Referral
        </span>
        {program.isActive && program.referrerReward > 0 && (
          <span className="rounded bg-[#fdece7] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#f4511e]">
            Earn {money(program.referrerReward)} credit
          </span>
        )}
      </div>

      {!program.isActive ? (
        <p className="text-sm text-muted">The referral programme is paused right now. Your code and link stay safe.</p>
      ) : (
        <p className="text-sm text-gray-600">
          Invite friends to STEP SELECT. They get {money(program.referredDiscount)} off their first order of{" "}
          {money(program.minOrderAmount)} or more, and you receive {money(program.referrerReward)} wallet credit once
          that order is delivered.
        </p>
      )}

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">Your referral code</p>
          <div className="flex items-center justify-between gap-3 rounded-lg bg-[#f7f7f7] px-4 py-3">
            <span className="truncate text-sm font-bold tracking-wide text-ink">{mine.referralCode}</span>
            <CopyButton text={mine.referralCode} label="Copy code" />
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">Share link</p>
          <div className="flex items-center justify-between gap-3 rounded-lg bg-[#f7f7f7] px-4 py-3">
            <span className="truncate text-sm text-gray-700">{mine.shareLink.replace(/^https?:\/\//, "")}</span>
            <CopyButton text={mine.shareLink} label="Copy link" />
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        {[
          { label: "Friends invited", value: stats.friendsInvited },
          { label: "Successful referrals", value: stats.successfulReferrals },
          { label: "Wallet rewards earned", value: money(stats.rewardsEarned), accent: true },
        ].map((tile) => (
          <div key={tile.label} className="rounded-lg bg-[#f7f7f7] px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">{tile.label}</p>
            <p className={`mt-1 text-lg font-extrabold ${tile.accent ? "text-[#f4511e]" : "text-ink"}`}>{tile.value}</p>
          </div>
        ))}
      </div>

      {mine.referredBy && (
        <p className="mt-4 text-xs text-muted">
          You joined through <span className="font-semibold text-ink">{mine.referredBy.name}</span>'s invitation.
        </p>
      )}
    </div>
  );
}

export default ReferralCard;
