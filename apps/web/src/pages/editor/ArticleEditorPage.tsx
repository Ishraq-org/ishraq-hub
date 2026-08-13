import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TipTapEditor } from '../../components/editor/TipTapEditor';
import { Icon } from '../../components/icons';
import { fetchMeApi } from '../../api/auth';
import { ImageUploadField } from '../../components/ImageUploadField';

type SaveState = 'saved' | 'saving' | 'error' | 'idle';

export const ArticleEditorPage: React.FC = () => {
  const { articleId, language } = useParams<{ articleId: string; language: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [content, setContent] = useState<Record<string, any> | null>(null);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [reviewNotesInput, setReviewNotesInput] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch current user
  const { data: meData } = useQuery({
    queryKey: ['me'],
    queryFn: fetchMeApi,
  });

  const currentUser = meData?.user;

  // Fetch Article Translation
  const {
    data: translationData,
    isLoading,
    error: loadError,
  } = useQuery({
    queryKey: ['articleTranslation', articleId, language],
    queryFn: async () => {
      const res = await fetch(`/api/articles/${articleId}/translations/${language}`);
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to load translation');
      }
      return json.translation;
    },
    enabled: Boolean(articleId && language),
    retry: false,
  });

  useEffect(() => {
    if (translationData) {
      setTitle(translationData.title);
      setContent(translationData.content);
      if (translationData.coverImage) {
        setCoverImage(translationData.coverImage);
      }
    }
  }, [translationData]);

  // Patch / Autosave Mutation
  const patchMutation = useMutation({
    mutationFn: async (payload: { title?: string; content?: Record<string, any>; coverImage?: string | null }) => {
      const res = await fetch(`/api/articles/${articleId}/translations/${language}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Autosave failed');
      }
      return json.translation;
    },
    onSuccess: (updated) => {
      setSaveState('saved');
      queryClient.setQueryData(['articleTranslation', articleId, language], updated);
    },
    onError: (err: any) => {
      setSaveState('error');
      setErrorMessage(err.message);
    },
  });

  // Debounced Autosave Timer Ref
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerAutosave = useCallback(
    (newTitle: string, newContent: Record<string, any>, newCover: string | null) => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }

      setSaveState('saving');

      autosaveTimerRef.current = setTimeout(() => {
        patchMutation.mutate({ title: newTitle, content: newContent, coverImage: newCover });
      }, 2500); // 2.5 second debounce per Prompt 08 §90
    },
    [patchMutation]
  );

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (content) {
      triggerAutosave(val, content, coverImage);
    }
  };

  const handleContentChange = (jsonContent: Record<string, any>) => {
    setContent(jsonContent);
    triggerAutosave(title, jsonContent, coverImage);
  };

  const handleCoverImageChange = (newUrl: string | null) => {
    setCoverImage(newUrl);
    if (content) {
      triggerAutosave(title, content, newUrl);
    }
  };

  // Submit for Review Mutation
  const submitMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/articles/${articleId}/translations/${language}/submit`, {
        method: 'POST',
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to submit article');
      }
      return json.translation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articleTranslation', articleId, language] });
    },
    onError: (err: any) => {
      setErrorMessage(err.message);
    },
  });

  // Super Admin Review Mutation
  const reviewMutation = useMutation({
    mutationFn: async (payload: { decision: 'approve' | 'request_changes'; reviewNotes?: string }) => {
      const res = await fetch(`/api/articles/${articleId}/translations/${language}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Review submission failed');
      }
      return json.translation;
    },
    onSuccess: () => {
      setShowReviewModal(false);
      setReviewNotesInput('');
      queryClient.invalidateQueries({ queryKey: ['articleTranslation', articleId, language] });
    },
    onError: (err: any) => {
      setErrorMessage(err.message);
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] text-[var(--text-muted)]">
        <div className="flex flex-col items-center gap-3 text-sm font-medium">
          <div className="w-8 h-8 border-4 border-t-[var(--accent)] border-[var(--border)] rounded-full animate-spin" />
          <span>Loading Translation Editor...</span>
        </div>
      </div>
    );
  }

  if (loadError || !translationData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] p-4">
        <div className="max-w-md w-full p-6 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl text-center space-y-4 shadow-lg">
          <Icon name="close" size={32} className="mx-auto text-[var(--danger)]" />
          <h2 className="text-lg font-bold text-[var(--danger)]">Access Denied / Not Found</h2>
          <p className="text-xs text-[var(--text-muted)]">
            {(loadError as any)?.message || 'Translation unavailable or unauthorized'}
          </p>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 text-xs font-semibold rounded bg-[var(--accent)] text-[var(--bg-secondary)]"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const lang = language || 'en';
  const isOwner = currentUser && (translationData.authorId === currentUser._id || translationData.authorId === (currentUser as any).userId);
  const isSuperAdmin = currentUser && currentUser.role === 'super_admin';
  const isPublished = translationData.status === 'published';
  const isReadOnly = isPublished && !isSuperAdmin;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] pb-16">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[var(--bg-secondary)] border-b border-[var(--border)] px-4 sm:px-8 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="p-1.5 rounded hover:bg-[var(--bg-primary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            title="Back to Dashboard"
          >
            <Icon name="chevron-left" size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
                {lang.toUpperCase()} Draft
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  translationData.status === 'published'
                    ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                    : translationData.status === 'in_review'
                    ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                    : translationData.status === 'changes_requested'
                    ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                    : 'bg-zinc-500/10 text-zinc-500 border border-zinc-500/20'
                }`}
              >
                {translationData.status.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Unobtrusive Autosave Indicator & Actions */}
        <div className="flex items-center gap-4">
          <div className="text-xs font-medium flex items-center gap-1.5">
            {saveState === 'saving' && (
              <span className="text-amber-500 flex items-center gap-1.5 animate-pulse">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Saving...</span>
              </span>
            )}
            {saveState === 'saved' && (
              <span className="text-emerald-600 flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Saved</span>
              </span>
            )}
            {saveState === 'error' && (
              <span className="text-[var(--danger)] flex items-center gap-1.5 font-semibold">
                <Icon name="close" size={14} />
                <span>Save Error</span>
              </span>
            )}
          </div>

          {(isOwner || isSuperAdmin) &&
            (translationData.status === 'draft' || translationData.status === 'changes_requested') && (
              <button
                type="button"
                onClick={() => submitMutation.mutate()}
                disabled={submitMutation.isPending}
                className="px-4 py-1.5 text-xs font-bold rounded bg-[var(--accent)] text-[var(--bg-secondary)] hover:bg-[var(--accent-hover)] transition-colors shadow-sm"
              >
                {submitMutation.isPending ? 'Submitting...' : 'Submit for Review'}
              </button>
            )}

          {isSuperAdmin && translationData.status === 'in_review' && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => reviewMutation.mutate({ decision: 'approve' })}
                disabled={reviewMutation.isPending}
                className="px-3 py-1.5 text-xs font-bold rounded bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
              >
                Approve & Publish
              </button>
              <button
                type="button"
                onClick={() => setShowReviewModal(true)}
                className="px-3 py-1.5 text-xs font-bold rounded border border-[var(--danger)] text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-colors"
              >
                Request Changes
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {errorMessage && (
          <div className="p-3 text-xs rounded border border-[var(--danger)] bg-[var(--danger)]/10 text-[var(--danger)] flex items-center justify-between">
            <span>{errorMessage}</span>
            <button type="button" onClick={() => setErrorMessage(null)} className="font-bold">
              Dismiss
            </button>
          </div>
        )}

        {/* Review Notes Alert */}
        {translationData.reviewNotes && translationData.status === 'changes_requested' && (
          <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-700 text-xs space-y-1 shadow-sm">
            <p className="font-bold uppercase tracking-wider">Reviewer Feedback:</p>
            <p>{translationData.reviewNotes}</p>
          </div>
        )}

        {/* Article Cover Image Upload (Prompt 13 §90-91) */}
        {!isReadOnly && (
          <div className="bg-[var(--bg-secondary)] p-5 rounded-xl border border-[var(--border)] shadow-sm">
            <ImageUploadField
              label="Article Hero Cover Image"
              folder="covers"
              value={coverImage}
              onChange={handleCoverImageChange}
            />
          </div>
        )}

        {/* Editable Title Input */}
        <div className="bg-[var(--bg-secondary)] p-6 rounded-xl border border-[var(--border)] shadow-sm space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Article Title ({lang.toUpperCase()})
          </label>
          <input
            type="text"
            disabled={isReadOnly}
            value={title}
            onChange={handleTitleChange}
            placeholder="Article Title..."
            className="w-full text-2xl font-bold bg-transparent border-b border-transparent hover:border-[var(--border)] focus:border-[var(--accent)] focus:outline-none transition-colors py-1"
          />
        </div>

        {/* TipTap Editor */}
        <TipTapEditor
          content={content}
          onChange={handleContentChange}
          editable={!isReadOnly}
          language={lang}
        />
      </main>

      {/* Request Changes Modal for Super Admin */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="max-w-md w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-[var(--accent)]">Request Changes</h3>
            <p className="text-xs text-[var(--text-muted)]">
              Provide feedback for the author detailing the required changes.
            </p>
            <textarea
              rows={4}
              value={reviewNotesInput}
              onChange={(e) => setReviewNotesInput(e.target.value)}
              placeholder="Detail what needs correction..."
              className="w-full p-3 text-xs rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none"
            />
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded border border-[var(--border)]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!reviewNotesInput.trim() || reviewMutation.isPending}
                onClick={() =>
                  reviewMutation.mutate({
                    decision: 'request_changes',
                    reviewNotes: reviewNotesInput,
                  })
                }
                className="px-4 py-2 text-xs font-bold rounded bg-[var(--danger)] text-white hover:opacity-90 disabled:opacity-50"
              >
                Send Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleEditorPage;
