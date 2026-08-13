import React, { useState } from 'react';
import { Icon } from '../../icons';
import {
  QuranVerseNodeSchema,
  HadithNodeSchema,
  BibleVerseNodeSchema,
  EvidenceImageNodeSchema,
  FootnoteNodeSchema,
  CalloutVariantSchema,
} from '@ishraq/shared-types';

export type CustomNodeType =
  | 'quranVerse'
  | 'hadith'
  | 'bibleVerse'
  | 'evidenceImage'
  | 'callout'
  | 'footnote';

interface NodeInsertionModalProps {
  nodeType: CustomNodeType | null;
  onClose: () => void;
  onConfirm: (nodeType: CustomNodeType, attrs: Record<string, any>) => void;
}

export const NodeInsertionModal: React.FC<NodeInsertionModalProps> = ({
  nodeType,
  onClose,
  onConfirm,
}) => {
  if (!nodeType) return null;

  // Quran state
  const [quranSurah, setQuranSurah] = useState<number>(1);
  const [quranAyah, setQuranAyah] = useState<number>(1);
  const [quranArabic, setQuranArabic] = useState<string>('');
  const [quranTranslation, setQuranTranslation] = useState<string>('');
  const [quranSource, setQuranSource] = useState<string>('Sahih International');
  const [isFetchingQuran, setIsFetchingQuran] = useState(false);

  // Hadith state
  const [hadithText, setHadithText] = useState<string>('');
  const [hadithNarrator, setHadithNarrator] = useState<string>('');
  const [hadithSource, setHadithSource] = useState<string>('Sahih al-Bukhari');
  const [hadithGrade, setHadithGrade] = useState<string>('Sahih');

  // Bible state
  const [bibleBook, setBibleBook] = useState<string>('Genesis');
  const [bibleChapter, setBibleChapter] = useState<number>(1);
  const [bibleVerseNum, setBibleVerseNum] = useState<string>('1');
  const [bibleVersion, setBibleVersion] = useState<string>('kjv');
  const [bibleText, setBibleText] = useState<string>('');
  const [isFetchingBible, setIsFetchingBible] = useState(false);

  // Evidence Image state
  const [primaryUrl, setPrimaryUrl] = useState('');
  const [primaryAlt, setPrimaryAlt] = useState('');
  const [secondaryUrl, setSecondaryUrl] = useState('');
  const [secondaryAlt, setSecondaryAlt] = useState('');
  const [imgCaption, setImgCaption] = useState('');
  const [citationTitle, setCitationTitle] = useState('');
  const [citationAuthor, setCitationAuthor] = useState('');
  const [citationPublisher, setCitationPublisher] = useState('');
  const [citationYear, setCitationYear] = useState<number>(new Date().getFullYear());
  const [citationPage, setCitationPage] = useState<string>('');
  const [citationUrl, setCitationUrl] = useState('');

  // Callout state
  const [calloutVariant, setCalloutVariant] = useState<
    'warning' | 'info' | 'answer' | 'summary' | 'claim'
  >('info');

  const [validationError, setValidationError] = useState<string | null>(null);

  // Quran Auto-Fetch via Al Quran Cloud API per Prompt 09 §32-36
  const fetchQuranVerse = async () => {
    setIsFetchingQuran(true);
    setValidationError(null);
    try {
      const res = await fetch(
        `https://api.alquran.cloud/v1/ayah/${quranSurah}:${quranAyah}/editions/quran-uthmani,en.sahih`
      );
      if (!res.ok) throw new Error('Verse not found in Quran API');
      const json = await res.json();
      const arabicData = json.data[0];
      const englishData = json.data[1];

      setQuranArabic(arabicData.text);
      setQuranTranslation(englishData.text);
      setQuranSource('Sahih International');
    } catch (err: any) {
      setValidationError('Failed to auto-fetch Quran verse. You can enter text manually below.');
    } finally {
      setIsFetchingQuran(false);
    }
  };

  // Bible Auto-Fetch via bible-api.com per Prompt 09 §46-58 (Public domain only)
  const isPublicDomainBibleVersion = (ver: string) => ['kjv', 'web', 'asv'].includes(ver.toLowerCase());

  const fetchBibleVerse = async () => {
    if (!isPublicDomainBibleVersion(bibleVersion)) {
      return;
    }
    setIsFetchingBible(true);
    setValidationError(null);
    try {
      const res = await fetch(
        `https://bible-api.com/${encodeURIComponent(bibleBook)}+${bibleChapter}:${bibleVerseNum}?translation=${bibleVersion}`
      );
      if (!res.ok) throw new Error('Verse not found');
      const json = await res.json();
      setBibleText(json.text ? json.text.trim() : '');
    } catch (err: any) {
      setValidationError('Failed to fetch verse. Enter text manually below.');
    } finally {
      setIsFetchingBible(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    try {
      if (nodeType === 'quranVerse') {
        const attrs = {
          surah: Number(quranSurah),
          ayah: Number(quranAyah),
          arabicText: quranArabic.trim(),
          translation: quranTranslation.trim(),
          translationSource: quranSource.trim() || 'Sahih International',
        };
        QuranVerseNodeSchema.parse({ type: 'quranVerse', ...attrs });
        onConfirm('quranVerse', attrs);
      } else if (nodeType === 'hadith') {
        const attrs = {
          text: hadithText.trim(),
          narrator: hadithNarrator.trim() || 'Narrator',
          source: hadithSource.trim() || 'Authentic Source',
          grade: hadithGrade.trim() || 'Sahih',
        };
        HadithNodeSchema.parse({ type: 'hadith', ...attrs });
        onConfirm('hadith', attrs);
      } else if (nodeType === 'bibleVerse') {
        const attrs = {
          book: bibleBook.trim(),
          chapter: Number(bibleChapter),
          verse: String(bibleVerseNum).trim(),
          translationVersion: bibleVersion.toUpperCase(),
          text: bibleText.trim(),
        };
        BibleVerseNodeSchema.parse({ type: 'bibleVerse', ...attrs });
        onConfirm('bibleVerse', attrs);
      } else if (nodeType === 'evidenceImage') {
        const attrs = {
          primaryImage: { url: primaryUrl.trim(), alt: primaryAlt.trim() || 'Primary Evidence' },
          secondaryImage: secondaryUrl.trim()
            ? { url: secondaryUrl.trim(), alt: secondaryAlt.trim() || 'Secondary Plate' }
            : null,
          caption: imgCaption.trim(),
          citation: {
            sourceType: 'book',
            title: citationTitle.trim() || 'Source Archive',
            author: citationAuthor.trim() || 'Author',
            publisher: citationPublisher.trim() || 'Publisher',
            year: Number(citationYear) || new Date().getFullYear(),
            page: citationPage ? Number(citationPage) : null,
            url: citationUrl.trim() || null,
          },
        };
        EvidenceImageNodeSchema.parse({ type: 'evidenceImage', ...attrs });
        onConfirm('evidenceImage', attrs);
      } else if (nodeType === 'callout') {
        CalloutVariantSchema.parse(calloutVariant);
        onConfirm('callout', { variant: calloutVariant });
      } else if (nodeType === 'footnote') {
        const attrs = {
          citation: {
            sourceType: 'book',
            title: citationTitle.trim() || 'Citation Title',
            author: citationAuthor.trim() || 'Author',
            publisher: citationPublisher.trim() || 'Publisher',
            year: Number(citationYear) || new Date().getFullYear(),
            page: citationPage ? Number(citationPage) : null,
            url: citationUrl.trim() || null,
          },
        };
        FootnoteNodeSchema.parse({ type: 'footnote', ...attrs });
        onConfirm('footnote', attrs);
      }
    } catch (err: any) {
      setValidationError(err.errors?.[0]?.message || err.message || 'Validation error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="max-w-lg w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-xs text-[var(--text-primary)]">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <h2 className="text-base font-bold text-[var(--accent)] flex items-center gap-2">
            <Icon name={nodeType === 'quranVerse' ? 'quran' : nodeType === 'hadith' ? 'hadith' : nodeType === 'bibleVerse' ? 'cross' : nodeType === 'evidenceImage' ? 'evidence' : nodeType === 'footnote' ? 'footnote' : 'callout'} size={18} />
            <span>Insert Custom Block: {nodeType}</span>
          </h2>
          <button type="button" onClick={onClose} className="p-1 rounded hover:bg-[var(--bg-primary)]">
            <Icon name="close" size={16} />
          </button>
        </div>

        {validationError && (
          <div className="p-2.5 rounded bg-[var(--danger)]/10 border border-[var(--danger)] text-[var(--danger)] text-xs">
            {validationError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. Quran Verse Form */}
          {nodeType === 'quranVerse' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Surah Number (1-114)</label>
                  <input
                    type="number"
                    min={1}
                    max={114}
                    value={quranSurah}
                    onChange={(e) => setQuranSurah(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded border border-[var(--border)] bg-[var(--bg-primary)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Ayah Number</label>
                  <input
                    type="number"
                    min={1}
                    value={quranAyah}
                    onChange={(e) => setQuranAyah(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded border border-[var(--border)] bg-[var(--bg-primary)] focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={fetchQuranVerse}
                disabled={isFetchingQuran}
                className="w-full py-1.5 rounded bg-[var(--accent)]/15 border border-[var(--accent)] text-[var(--accent)] font-bold hover:bg-[var(--accent)] hover:text-[var(--bg-secondary)] transition-colors"
              >
                {isFetchingQuran ? 'Fetching from Al Quran Cloud...' : '⚡ Auto-Fetch Arabic & English Translation'}
              </button>

              <div>
                <label className="block font-semibold mb-1">Arabic Text (Uthmani Script)</label>
                <textarea
                  rows={3}
                  dir="rtl"
                  value={quranArabic}
                  onChange={(e) => setQuranArabic(e.target.value)}
                  placeholder="Arabic Uthmani text..."
                  className="w-full p-2.5 rounded border border-[var(--border)] bg-[var(--bg-primary)] focus:outline-none font-serif text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Translation</label>
                <textarea
                  rows={3}
                  value={quranTranslation}
                  onChange={(e) => setQuranTranslation(e.target.value)}
                  placeholder="English translation..."
                  className="w-full p-2 rounded border border-[var(--border)] bg-[var(--bg-primary)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Translation Source</label>
                <input
                  type="text"
                  value={quranSource}
                  onChange={(e) => setQuranSource(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-[var(--border)] bg-[var(--bg-primary)] focus:outline-none"
                />
              </div>
            </>
          )}

          {/* 2. Hadith Form */}
          {nodeType === 'hadith' && (
            <>
              <div>
                <label className="block font-semibold mb-1">Hadith Text</label>
                <textarea
                  rows={4}
                  required
                  value={hadithText}
                  onChange={(e) => setHadithText(e.target.value)}
                  placeholder="Enter Hadith matn text..."
                  className="w-full p-2.5 rounded border border-[var(--border)] bg-[var(--bg-primary)] focus:outline-none font-serif text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Narrator</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Abu Hurairah (RA)"
                    value={hadithNarrator}
                    onChange={(e) => setHadithNarrator(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-[var(--border)] bg-[var(--bg-primary)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Grade</label>
                  <select
                    value={hadithGrade}
                    onChange={(e) => setHadithGrade(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-[var(--border)] bg-[var(--bg-primary)] focus:outline-none"
                  >
                    <option value="Sahih">Sahih (Authentic)</option>
                    <option value="Hasan">Hasan (Good)</option>
                    <option value="Da'if">Da'if (Weak)</option>
                    <option value="Mawdu'">Mawdu' (Fabricated)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Source Collection</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sahih al-Bukhari 5422"
                  value={hadithSource}
                  onChange={(e) => setHadithSource(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-[var(--border)] bg-[var(--bg-primary)] focus:outline-none"
                />
              </div>
            </>
          )}

          {/* 3. Bible Verse Form */}
          {nodeType === 'bibleVerse' && (
            <>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Book</label>
                  <input
                    type="text"
                    value={bibleBook}
                    onChange={(e) => setBibleBook(e.target.value)}
                    className="w-full px-2 py-1 rounded border border-[var(--border)] bg-[var(--bg-primary)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Chapter</label>
                  <input
                    type="number"
                    min={1}
                    value={bibleChapter}
                    onChange={(e) => setBibleChapter(Number(e.target.value))}
                    className="w-full px-2 py-1 rounded border border-[var(--border)] bg-[var(--bg-primary)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Verse</label>
                  <input
                    type="text"
                    value={bibleVerseNum}
                    onChange={(e) => setBibleVerseNum(e.target.value)}
                    className="w-full px-2 py-1 rounded border border-[var(--border)] bg-[var(--bg-primary)] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Translation Version</label>
                <select
                  value={bibleVersion}
                  onChange={(e) => setBibleVersion(e.target.value)}
                  className="w-full px-2 py-1.5 rounded border border-[var(--border)] bg-[var(--bg-primary)] focus:outline-none"
                >
                  <option value="kjv">King James Version (KJV) — Public Domain</option>
                  <option value="web">World English Bible (WEB) — Public Domain</option>
                  <option value="asv">American Standard (ASV) — Public Domain</option>
                  <option value="niv">NIV (Copyrighted - Manual Text Entry Only)</option>
                  <option value="esv">ESV (Copyrighted - Manual Text Entry Only)</option>
                </select>
              </div>

              {isPublicDomainBibleVersion(bibleVersion) ? (
                <button
                  type="button"
                  onClick={fetchBibleVerse}
                  disabled={isFetchingBible}
                  className="w-full py-1.5 rounded bg-[var(--accent)]/15 border border-[var(--accent)] text-[var(--accent)] font-bold hover:bg-[var(--accent)] hover:text-[var(--bg-secondary)] transition-colors"
                >
                  {isFetchingBible ? 'Fetching...' : '⚡ Auto-Fetch Public Domain Verse'}
                </button>
              ) : (
                <div className="p-2 rounded border border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200 text-[11px] leading-tight">
                  ⚠️ Note (Master Prompt §5.6 / Prompt 09): Modern copyrighted translations (NIV, ESV) cannot be auto-fetched from unlicensed APIs. Please enter text manually below.
                </div>
              )}

              <div>
                <label className="block font-semibold mb-1">Verse Text</label>
                <textarea
                  rows={3}
                  required
                  value={bibleText}
                  onChange={(e) => setBibleText(e.target.value)}
                  placeholder="Enter verse quotation..."
                  className="w-full p-2 rounded border border-[var(--border)] bg-[var(--bg-primary)] focus:outline-none"
                />
              </div>
            </>
          )}

          {/* 4. Evidence Image Form */}
          {nodeType === 'evidenceImage' && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Primary Image URL</label>
                  <input
                    type="url"
                    required
                    placeholder="https://cloudinary.com/..."
                    value={primaryUrl}
                    onChange={(e) => setPrimaryUrl(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-[var(--border)] bg-[var(--bg-primary)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Primary Alt Text</label>
                  <input
                    type="text"
                    placeholder="Primary Plate Alt"
                    value={primaryAlt}
                    onChange={(e) => setPrimaryAlt(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-[var(--border)] bg-[var(--bg-primary)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Secondary Image URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://cloudinary.com/..."
                    value={secondaryUrl}
                    onChange={(e) => setSecondaryUrl(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-[var(--border)] bg-[var(--bg-primary)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Secondary Alt Text</label>
                  <input
                    type="text"
                    placeholder="Volume Cover Alt"
                    value={secondaryAlt}
                    onChange={(e) => setSecondaryAlt(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-[var(--border)] bg-[var(--bg-primary)] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Caption</label>
                <input
                  type="text"
                  placeholder="Primary manuscript page excerpt..."
                  value={imgCaption}
                  onChange={(e) => setImgCaption(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-[var(--border)] bg-[var(--bg-primary)] focus:outline-none"
                />
              </div>

              <div className="pt-2 border-t border-[var(--border)] space-y-2">
                <p className="font-bold text-[var(--accent)]">Structured Citation Metadata</p>
                <input
                  type="text"
                  required
                  placeholder="Book / Document Title"
                  value={citationTitle}
                  onChange={(e) => setCitationTitle(e.target.value)}
                  className="w-full px-2.5 py-1 rounded border border-[var(--border)] bg-[var(--bg-primary)] focus:outline-none"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Author"
                    value={citationAuthor}
                    onChange={(e) => setCitationAuthor(e.target.value)}
                    className="w-full px-2 py-1 rounded border border-[var(--border)] bg-[var(--bg-primary)] focus:outline-none"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Publisher"
                    value={citationPublisher}
                    onChange={(e) => setCitationPublisher(e.target.value)}
                    className="w-full px-2 py-1 rounded border border-[var(--border)] bg-[var(--bg-primary)] focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Year"
                    value={citationYear}
                    onChange={(e) => setCitationYear(Number(e.target.value))}
                    className="w-full px-2 py-1 rounded border border-[var(--border)] bg-[var(--bg-primary)] focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Page (Optional)"
                    value={citationPage}
                    onChange={(e) => setCitationPage(e.target.value)}
                    className="w-full px-2 py-1 rounded border border-[var(--border)] bg-[var(--bg-primary)] focus:outline-none"
                  />
                </div>
              </div>
            </>
          )}

          {/* 5. Callout Form */}
          {nodeType === 'callout' && (
            <div>
              <label className="block font-semibold mb-2">Select Callout Variant</label>
              <div className="space-y-2">
                {[
                  { id: 'answer', label: 'Answer Block (High Visual Weight / --accent)', desc: 'Core scholarly conclusion' },
                  { id: 'warning', label: 'Warning Callout (--warning)', desc: 'Crucial caveats and red flags' },
                  { id: 'info', label: 'Info Callout (--info)', desc: 'Contextual background notes' },
                  { id: 'summary', label: 'Summary Block (Neutral)', desc: 'Section overview bulleted points' },
                  { id: 'claim', label: 'Opposing Claim Steelman (Neutral Grey)', desc: 'Fair steelman of opponent arguments' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCalloutVariant(item.id as any)}
                    className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between transition-colors ${
                      calloutVariant === item.id
                        ? 'border-[var(--accent)] bg-[var(--accent)]/15 font-bold'
                        : 'border-[var(--border)] bg-[var(--bg-primary)] hover:border-[var(--accent)]'
                    }`}
                  >
                    <div>
                      <p className="font-semibold">{item.label}</p>
                      <p className="text-[10px] text-[var(--text-muted)]">{item.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 6. Footnote Form */}
          {nodeType === 'footnote' && (
            <div className="space-y-2">
              <p className="font-bold text-[var(--accent)]">Footnote Citation Metadata</p>
              <input
                type="text"
                required
                placeholder="Source Title"
                value={citationTitle}
                onChange={(e) => setCitationTitle(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded border border-[var(--border)] bg-[var(--bg-primary)] focus:outline-none"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Author"
                  value={citationAuthor}
                  onChange={(e) => setCitationAuthor(e.target.value)}
                  className="w-full px-2 py-1 rounded border border-[var(--border)] bg-[var(--bg-primary)] focus:outline-none"
                />
                <input
                  type="text"
                  required
                  placeholder="Publisher"
                  value={citationPublisher}
                  onChange={(e) => setCitationPublisher(e.target.value)}
                  className="w-full px-2 py-1 rounded border border-[var(--border)] bg-[var(--bg-primary)] focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Year"
                  value={citationYear}
                  onChange={(e) => setCitationYear(Number(e.target.value))}
                  className="w-full px-2 py-1 rounded border border-[var(--border)] bg-[var(--bg-primary)] focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Page (Optional)"
                  value={citationPage}
                  onChange={(e) => setCitationPage(e.target.value)}
                  className="w-full px-2 py-1 rounded border border-[var(--border)] bg-[var(--bg-primary)] focus:outline-none"
                />
              </div>
              <input
                type="url"
                placeholder="Source URL (Optional)"
                value={citationUrl}
                onChange={(e) => setCitationUrl(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded border border-[var(--border)] bg-[var(--bg-primary)] focus:outline-none"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold rounded border border-[var(--border)] hover:bg-[var(--bg-primary)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold rounded bg-[var(--accent)] text-[var(--bg-secondary)] hover:bg-[var(--accent-hover)]"
            >
              Insert Block
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NodeInsertionModal;
