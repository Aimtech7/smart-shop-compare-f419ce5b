import { useState } from 'react';
import { Star, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import type { Review, ReviewReply } from '@/types';

export function ReviewCard({ review }: { review: Review }) {
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replies, setReplies] = useState<ReviewReply[]>(review.replies || []);

  const submitReply = () => {
    if (!replyText.trim()) return;
    const reply: ReviewReply = {
      id: `rr-${Date.now()}`, userId: 'u1', userName: 'You',
      comment: replyText, createdAt: new Date().toISOString(),
    };
    setReplies([...replies, reply]);
    setReplyText('');
    setShowReplyForm(false);
    setShowReplies(true);
  };

  return (
    <div className="p-4 rounded-lg border bg-card">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
            {review.userName.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-sm">{review.userName}</p>
            <p className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {review.isVerifiedBuyer && <Badge variant="outline" className="text-xs">Verified Buyer</Badge>}
        </div>
      </div>
      <div className="flex items-center gap-0.5 mb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-star text-star' : 'text-muted'}`} />
        ))}
      </div>
      <p className="text-sm text-muted-foreground">{review.comment}</p>

      {/* Discussion Thread Controls */}
      <div className="flex items-center gap-3 mt-3 pt-3 border-t">
        <button onClick={() => setShowReplyForm(!showReplyForm)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition">
          <MessageSquare className="w-3.5 h-3.5" />Reply
        </button>
        {replies.length > 0 && (
          <button onClick={() => setShowReplies(!showReplies)} className="flex items-center gap-1 text-xs text-primary hover:underline">
            {showReplies ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
          </button>
        )}
      </div>

      {/* Reply Form */}
      {showReplyForm && (
        <div className="mt-3 pl-6 border-l-2 border-primary/20">
          <Textarea placeholder="Write a reply..." value={replyText} onChange={e => setReplyText(e.target.value)} className="text-sm mb-2" rows={2} />
          <div className="flex gap-2">
            <Button size="sm" onClick={submitReply} disabled={!replyText.trim()}>Post Reply</Button>
            <Button size="sm" variant="ghost" onClick={() => setShowReplyForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Replies Thread */}
      {showReplies && replies.length > 0 && (
        <div className="mt-3 pl-6 border-l-2 border-primary/20 space-y-3">
          {replies.map(reply => (
            <div key={reply.id} className="pt-3 first:pt-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground">
                  {reply.userName.charAt(0)}
                </div>
                <span className="text-sm font-medium">{reply.userName}</span>
                <span className="text-xs text-muted-foreground">{new Date(reply.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-muted-foreground ml-8">{reply.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
