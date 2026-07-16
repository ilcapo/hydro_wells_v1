'use client';

import { useState } from 'react';
import { createClient } from '../lib/supabase/client';
import { Star, Upload, CheckCircle2, AlertCircle, FileImage, FileVideo, Loader2 } from 'lucide-react';
import { compressImage } from '../lib/imageCompressor';

interface ReviewFormProps {
  serviceId: string;
  serviceName: string;
}

export default function ReviewForm({ serviceId, serviceName }: ReviewFormProps) {
  const supabase = createClient();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  
  // Media upload states
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles].slice(0, 3)); // Limit to max 3 files
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (!name.trim() || !email.trim() || !comment.trim()) {
        throw new Error('Please fill in all required fields.');
      }

      // 1. Insert review into db (starts as 'pending')
      const { data: reviewData, error: reviewErr } = await supabase
        .from('reviews')
        .insert([{
          service_id: serviceId,
          name,
          email,
          rating,
          comment,
          status: 'pending'
        }])
        .select('id')
        .single();

      if (reviewErr) throw reviewErr;
      const newReviewId = reviewData.id;

      // 2. Upload files if any (with client-side compression for images)
      if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          let file = files[i];
          const fileType = file.type.startsWith('video') ? 'video' : 'image';

          // Apply compression if it is an image
          if (file.type.startsWith('image/')) {
            try {
              file = await compressImage(file, 1200, 0.8);
            } catch (compressErr) {
              console.error('Failed to compress image:', compressErr);
            }
          }

          const fileExt = file.name.split('.').pop() || 'webp';
          const fileName = `${newReviewId}/evidence-${Date.now()}-${i}.${fileExt}`;

          // Upload to review-media bucket
          const { error: uploadErr } = await supabase.storage
            .from('review-media')
            .upload(fileName, file, { cacheControl: '3600', upsert: true });

          if (uploadErr) throw uploadErr;

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('review-media')
            .getPublicUrl(fileName);

          // Save in review_media table
          const { error: mediaErr } = await supabase
            .from('review_media')
            .insert([{
              review_id: newReviewId,
              file_url: publicUrl,
              file_type: fileType
            }]);

          if (mediaErr) throw mediaErr;
        }
      }

      // 3. Trigger email notification API
      try {
        await fetch('/api/notify-review', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            email,
            rating,
            comment,
            serviceName,
          }),
        });
      } catch (notifyErr) {
        console.error('Failed to send review email notification:', notifyErr);
        // Do not crash the review success flow if the notification API has issues
      }

      setSuccess(true);
      setName('');
      setEmail('');
      setComment('');
      setRating(5);
      setFiles([]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error submitting comment.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center space-y-4 shadow-[0_0_30px_rgba(16,185,129,0.06)] animate-fadeIn">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-semibold text-white">Review submitted!</h3>
        <p className="text-slate-300 text-sm max-w-sm mx-auto leading-relaxed">
          Your review has been successfully submitted. To maintain the quality of our platform, an administrator will review and moderate it before it appears publicly.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-4 px-5 py-2.5 rounded-xl border border-white/10 hover:border-white/20 text-xs font-semibold text-white transition bg-white/5"
        >
          Submit another review
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] border border-white/10 bg-slate-950/75 p-8 shadow-panel backdrop-blur-xl space-y-6">
      <div>
        <h3 className="text-2xl font-semibold text-white font-display">Leave your review</h3>
        <p className="text-slate-400 text-sm mt-1">Share your experience with our service.</p>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name and Email */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="rev-name" className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
              Full Name *
            </label>
            <input
              id="rev-name"
              type="text"
              required
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-white/10 bg-slate-900/40 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
            />
          </div>

          <div>
            <label htmlFor="rev-email" className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
              Email Address *
            </label>
            <input
              id="rev-email"
              type="email"
              required
              placeholder="name@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-white/10 bg-slate-900/40 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
            />
          </div>
        </div>

        {/* Rating Stars Selection */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
            Rating
          </label>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(null)}
                className="text-yellow-500 transition-transform active:scale-90"
              >
                <Star
                  className={`h-7 w-7 transition-all ${
                    star <= (hoverRating ?? rating)
                      ? 'fill-current scale-105 filter drop-shadow-[0_0_8px_rgba(234,179,8,0.3)]'
                      : 'opacity-25'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Comment textarea */}
        <div>
          <label htmlFor="rev-comment" className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
            Comment *
          </label>
          <textarea
            id="rev-comment"
            rows={4}
            required
            placeholder="Describe how our team served you, the technical quality, and if you would recommend HydroWells..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full px-4 py-3 text-sm rounded-xl border border-white/10 bg-slate-900/40 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/40 transition resize-none"
          />
        </div>

        {/* Media Evidence Upload */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
            Attach Photos / Videos (Optional - Max 3)
          </label>
          <label className="w-full py-3.5 rounded-xl border border-dashed border-white/10 hover:border-primary/20 bg-slate-900/20 text-slate-400 hover:text-slate-200 font-medium text-xs flex items-center justify-center gap-2 cursor-pointer transition-all duration-200">
            <Upload className="h-4 w-4 text-slate-500" />
            <span>Select evidence files</span>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileChange}
              disabled={submitting}
              className="hidden"
            />
          </label>

          {/* Uploaded Files thumbnails list */}
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {files.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/5 text-[11px] text-slate-300"
                >
                  {file.type.startsWith('video') ? (
                    <FileVideo className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                  ) : (
                    <FileImage className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                  )}
                  <span className="truncate max-w-[120px]">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(idx)}
                    className="text-red-400 hover:text-red-300 font-bold ml-1"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-primaryDark hover:from-primary/90 hover:to-primaryDark/90 text-slate-950 font-semibold tracking-wide flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,194,255,0.12)] hover:shadow-[0_0_30px_rgba(0,194,255,0.22)] active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
              <span>Sending...</span>
            </>
          ) : (
            <span>Submit Review</span>
          )}
        </button>
      </form>
    </div>
  );
}
