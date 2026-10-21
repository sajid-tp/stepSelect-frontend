import { useState } from "react";

/*
  Star rating + comment for one delivered item.
  Mount it only while it is open, so the fields start empty every time.

  onSubmit({ rating, comment }) is async; the page shows the server error through `error`.
*/
function ReviewModal({ item, busy = false, error = "", onSubmit, onClose }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");

  const shown = hover || rating;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-title"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 id="review-title" className="text-lg font-bold text-gray-900">
              Rate &amp; review
            </h2>
            <p className="mt-1 truncate text-xs text-muted">
              {item.name}
              {item.size ? ` | Size ${item.size}` : ""}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {/* STARS */}
        <div
          className="flex items-center gap-1"
          role="radiogroup"
          aria-label="Rating"
          onMouseLeave={() => setHover(0)}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              disabled={busy}
              onMouseEnter={() => setHover(n)}
              onClick={() => setRating(n)}
              className={`text-3xl transition ${
                n <= shown ? "text-yellow-400" : "text-gray-200"
              }`}
            >
              <i className="fa-solid fa-star" />
            </button>
          ))}

          <span className="ml-2 text-xs text-muted">
            {rating ? `${rating} / 5` : "Tap to rate"}
          </span>
        </div>

        {/* COMMENT */}
        <div className="mt-5">
          <label
            htmlFor="review-comment"
            className="mb-1 block text-xs font-semibold text-gray-700"
          >
            Your review (optional)
          </label>
          <textarea
            id="review-comment"
            rows={4}
            maxLength={500}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={busy}
            placeholder="How do they fit and feel?"
            className="w-full resize-none rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#f4511e]"
          />
          <p className="mt-1 text-right text-[11px] text-gray-400">
            {comment.length}/500
          </p>
        </div>

        {error && (
          <p
            role="alert"
            className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
          >
            {error}
          </p>
        )}

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={busy || rating === 0}
            onClick={() => onSubmit({ rating, comment: comment.trim() })}
            className="rounded-md bg-[#b13600] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#8f2c00] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? "Submitting..." : "Submit review"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReviewModal;
