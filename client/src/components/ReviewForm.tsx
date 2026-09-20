import { useState } from 'react';
import * as reviewsApi from '../api/reviews';
import { ApiError } from '../api/client';

function StarInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span>{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={n <= value ? 'text-star' : 'text-border'}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ReviewForm({
  contractId,
  revieweeId,
  revieweeName,
  onDone,
}: {
  contractId: string;
  revieweeId: string;
  revieweeName: string;
  onDone: () => void;
}) {
  const [communication, setCommunication] = useState(5);
  const [quality, setQuality] = useState(5);
  const [timeliness, setTimeliness] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await reviewsApi.createReview({ contractId, revieweeId, communication, quality, timeliness, comment });
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not submit your review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border border-border rounded-lg p-5 bg-surface space-y-3 mt-3">
      <p className="text-sm font-medium">Rate {revieweeName}</p>
      <StarInput label="Communication" value={communication} onChange={setCommunication} />
      <StarInput label="Quality" value={quality} onChange={setQuality} />
      <StarInput label="Timeliness" value={timeliness} onChange={setTimeliness} />
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        placeholder="Great to work with..."
        className="w-full border border-border rounded px-3 py-2 text-sm bg-white"
      />
      {error && <p className="text-xs text-warn">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="bg-primary text-white px-4 py-2 rounded text-sm font-medium hover:bg-primary-dark disabled:opacity-60"
      >
        {submitting ? 'Submitting...' : 'Submit review'}
      </button>
    </form>
  );
}
