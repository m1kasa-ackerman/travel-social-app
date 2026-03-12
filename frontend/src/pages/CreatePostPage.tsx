import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { StarRating } from '../components/StarRating';
import { postsApi } from '../api/posts';
import styles from './CreatePostPage.module.css';

const POST_TYPES = [
    { id: 'itinerary', icon: '🗺️', label: 'Itinerary', desc: 'Share a day-by-day trip plan' },
    { id: 'restaurant', icon: '🍜', label: 'Restaurant Review', desc: 'Rate and review a place to eat' },
    { id: 'experience', icon: '✨', label: 'Experience', desc: 'Share a moment or travel story' },
];

interface Stop {
    id: number;
    name: string;
    type: string;
    note: string;
}

interface Day {
    id: number;
    stops: Stop[];
}

export function CreatePostPage() {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [postType, setPostType] = useState<string>('');
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [destination, setDestination] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [visibility, setVisibility] = useState<'public' | 'followers'>('public');
    const [rating, setRating] = useState(0);
    const [days, setDays] = useState<Day[]>([{ id: 1, stops: [] }]);
    const [, setCoverImage] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string>('');
    const [submitting, setSubmitting] = useState(false);

    // Restaurant fields
    const [restaurantName, setRestaurantName] = useState('');
    const [restaurantAddress, setRestaurantAddress] = useState('');
    const [priceRange, setPriceRange] = useState('');
    const [recommend, setRecommend] = useState<boolean | null>(null);

    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) {
            toast.error('Image must be under 10MB');
            return;
        }
        setCoverImage(file);
        const reader = new FileReader();
        reader.onload = ev => setCoverPreview(ev.target?.result as string);
        reader.readAsDataURL(file);
    }

    function handleDropzoneDrag(e: React.DragEvent) {
        e.preventDefault();
        e.stopPropagation();
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const fakeEvent = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>;
            handleImageChange(fakeEvent);
        }
    }

    function addTag(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (!tags.includes(tagInput.trim())) {
                setTags(t => [...t, tagInput.trim()]);
            }
            setTagInput('');
        }
    }

    function removeTag(tag: string) {
        setTags(t => t.filter(x => x !== tag));
    }

    function addDay() {
        setDays(d => [...d, { id: Date.now(), stops: [] }]);
    }

    function addStop(dayId: number) {
        setDays(d => d.map(day =>
            day.id === dayId
                ? { ...day, stops: [...day.stops, { id: Date.now(), name: '', type: 'attraction', note: '' }] }
                : day
        ));
    }

    function updateStop(dayId: number, stopId: number, field: string, value: string) {
        setDays(d => d.map(day =>
            day.id === dayId
                ? { ...day, stops: day.stops.map(s => s.id === stopId ? { ...s, [field]: value } : s) }
                : day
        ));
    }

    function buildBody(): string {
        if (postType === 'itinerary') {
            return days.map((day, di) =>
                `Day ${di + 1}:\n` + day.stops.map(s => `- ${s.name} (${s.type})${s.note ? ': ' + s.note : ''}`).join('\n')
            ).join('\n\n');
        }
        if (postType === 'restaurant') {
            return [
                restaurantName && `Restaurant: ${restaurantName}`,
                restaurantAddress && `Address: ${restaurantAddress}`,
                rating && `Rating: ${rating}/5`,
                priceRange && `Price: ${priceRange}`,
                recommend !== null && `Recommend: ${recommend ? 'Yes' : 'No'}`,
                body,
            ].filter(Boolean).join('\n');
        }
        return body;
    }

    async function handlePublish() {
        if (!postType || !title.trim()) {
            toast.error('Please select a type and add a title.');
            return;
        }
        if (postType === 'restaurant' && !restaurantName.trim()) {
            toast.error('Please enter the restaurant name.');
            return;
        }

        setSubmitting(true);
        try {
            await postsApi.createPost({
                type: postType,
                title: title.trim(),
                body: buildBody(),
                destination: destination.trim() || undefined,
                visibility,
                status: 'published',
                tags,
            });
            toast.success('Post published! 🎉');
            navigate('/');
        } catch (err) {
            toast.error('Failed to publish. Please try again.');
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDraft() {
        if (!postType || !title.trim()) {
            toast.error('Please select a type and add a title to save a draft.');
            return;
        }
        try {
            await postsApi.createPost({
                type: postType,
                title: title.trim(),
                body: buildBody(),
                visibility,
                status: 'draft',
                tags,
            });
            toast.success('Saved as draft.');
        } catch {
            toast.error('Could not save draft.');
        }
    }

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <h1 className="text-h1" style={{ marginBottom: 'var(--space-6)' }}>Create Post</h1>

                {/* Step 1 — Post Type */}
                <section className={styles.section}>
                    <h2 className={styles.sectionLabel}>What are you sharing?</h2>
                    <div className={styles.typeGrid}>
                        {POST_TYPES.map(t => (
                            <button
                                key={t.id}
                                className={`${styles.typeCard} ${postType === t.id ? styles.typeCardSelected : ''}`}
                                onClick={() => setPostType(t.id)}
                            >
                                <span className={styles.typeIcon}>{t.icon}</span>
                                <span className={styles.typeLabel}>{t.label}</span>
                                <span className={styles.typeDesc}>{t.desc}</span>
                            </button>
                        ))}
                    </div>
                </section>

                {postType && (
                    <>
                        <section className={styles.section}>
                            <input
                                className={styles.titleInput}
                                placeholder="Give your post a title…"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                maxLength={120}
                            />
                        </section>

                        <section className={styles.section}>
                            <input
                                className={styles.input}
                                placeholder="📍 Destination (e.g. Bali, Indonesia)"
                                value={destination}
                                onChange={e => setDestination(e.target.value)}
                            />
                        </section>

                        {/* Cover Image — with working file picker */}
                        <section className={styles.section}>
                            <h2 className={styles.sectionLabel}>Cover Image</h2>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={handleImageChange}
                            />
                            <div
                                className={styles.dropzone}
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={handleDropzoneDrag}
                                onDrop={handleDrop}
                                style={{ cursor: 'pointer' }}
                            >
                                {coverPreview ? (
                                    <div className={styles.previewWrap}>
                                        <img src={coverPreview} alt="Cover preview" className={styles.coverPreview} />
                                        <button
                                            className={styles.removeImg}
                                            onClick={e => { e.stopPropagation(); setCoverImage(null); setCoverPreview(''); }}
                                        >
                                            ✕ Remove
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5">
                                            <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
                                            <polyline points="21 15 16 10 5 21" />
                                        </svg>
                                        <p className={styles.dropzoneText}>Click or drag image here</p>
                                        <p className={styles.dropzoneHint}>PNG, JPG up to 10MB</p>
                                    </>
                                )}
                            </div>
                        </section>

                        {/* Tags */}
                        <section className={styles.section}>
                            <h2 className={styles.sectionLabel}>Tags</h2>
                            <div className={styles.tagInputWrap}>
                                <div className={styles.tagPills}>
                                    {tags.map(tag => (
                                        <span key={tag} className={styles.tagPill}>
                                            #{tag}
                                            <button className={styles.tagRemove} onClick={() => removeTag(tag)}>×</button>
                                        </span>
                                    ))}
                                    <input
                                        className={styles.tagInput}
                                        placeholder="Type a tag and press Enter…"
                                        value={tagInput}
                                        onChange={e => setTagInput(e.target.value)}
                                        onKeyDown={addTag}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Visibility */}
                        <section className={styles.section}>
                            <h2 className={styles.sectionLabel}>Visibility</h2>
                            <div className={styles.visSwitch}>
                                <button
                                    className={`${styles.visBtn} ${visibility === 'public' ? styles.visBtnActive : ''}`}
                                    onClick={() => setVisibility('public')}
                                >
                                    🌍 Public
                                </button>
                                <button
                                    className={`${styles.visBtn} ${visibility === 'followers' ? styles.visBtnActive : ''}`}
                                    onClick={() => setVisibility('followers')}
                                >
                                    👥 Followers Only
                                </button>
                            </div>
                        </section>

                        {/* Itinerary Fields */}
                        {postType === 'itinerary' && (
                            <section className={styles.section}>
                                <h2 className={styles.sectionLabel}>Day-by-Day Itinerary</h2>
                                {days.map((day, di) => (
                                    <div key={day.id} className={styles.dayBlock}>
                                        <div className={styles.dayHeader}>
                                            <span className={styles.dayNum}>Day {di + 1}</span>
                                        </div>
                                        <div className={styles.stopsList}>
                                            {day.stops.map(stop => (
                                                <div key={stop.id} className={styles.stopRow}>
                                                    <span className={styles.stopDot}>📍</span>
                                                    <input
                                                        className={styles.stopInput}
                                                        placeholder="Place name"
                                                        value={stop.name}
                                                        onChange={e => updateStop(day.id, stop.id, 'name', e.target.value)}
                                                    />
                                                    <select
                                                        className={styles.stopSelect}
                                                        value={stop.type}
                                                        onChange={e => updateStop(day.id, stop.id, 'type', e.target.value)}
                                                    >
                                                        <option>attraction</option>
                                                        <option>restaurant</option>
                                                        <option>hotel</option>
                                                        <option>transport</option>
                                                    </select>
                                                    <input
                                                        className={styles.stopNote}
                                                        placeholder="Short note…"
                                                        value={stop.note}
                                                        onChange={e => updateStop(day.id, stop.id, 'note', e.target.value)}
                                                    />
                                                </div>
                                            ))}
                                            <button className={styles.addStopBtn} onClick={() => addStop(day.id)}>
                                                + Add Stop
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <button className={styles.addDayBtn} onClick={addDay}>+ Add Day</button>
                            </section>
                        )}

                        {/* Restaurant Fields */}
                        {postType === 'restaurant' && (
                            <section className={styles.section}>
                                <h2 className={styles.sectionLabel}>Restaurant Details</h2>
                                <div className={styles.formGrid}>
                                    <input className={styles.input} placeholder="Restaurant name *" value={restaurantName} onChange={e => setRestaurantName(e.target.value)} />
                                    <input className={styles.input} placeholder="📍 Address / Location" value={restaurantAddress} onChange={e => setRestaurantAddress(e.target.value)} />
                                </div>
                                <div style={{ margin: 'var(--space-4) 0' }}>
                                    <p className={styles.fieldLabel}>Rating</p>
                                    <StarRating rating={rating} size="lg" interactive onRate={setRating} />
                                </div>
                                <div style={{ margin: 'var(--space-4) 0' }}>
                                    <p className={styles.fieldLabel}>Price Range</p>
                                    <div className={styles.priceSelector}>
                                        {['$', '$$', '$$$', '$$$$'].map(p => (
                                            <button
                                                key={p}
                                                className={`${styles.priceBtn} ${priceRange === p ? styles.priceBtnActive : ''}`}
                                                onClick={() => setPriceRange(p === priceRange ? '' : p)}
                                            >{p}</button>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ margin: 'var(--space-4) 0' }}>
                                    <p className={styles.fieldLabel}>Would you recommend?</p>
                                    <div className={styles.recommendSelector}>
                                        <button
                                            className={`${styles.recommendBtn} ${styles.recommendYes} ${recommend === true ? styles.recommendActive : ''}`}
                                            onClick={() => setRecommend(r => r === true ? null : true)}
                                        >✅ Yes</button>
                                        <button
                                            className={`${styles.recommendBtn} ${styles.recommendNo} ${recommend === false ? styles.recommendActive : ''}`}
                                            onClick={() => setRecommend(r => r === false ? null : false)}
                                        >❌ No</button>
                                    </div>
                                </div>
                                <textarea className={styles.textarea} placeholder="Write your review…" rows={6} value={body} onChange={e => setBody(e.target.value)} />
                            </section>
                        )}

                        {/* Experience Fields */}
                        {postType === 'experience' && (
                            <section className={styles.section}>
                                <h2 className={styles.sectionLabel}>Experience Details</h2>
                                <textarea className={styles.textarea} placeholder="Tell your story…" rows={8} style={{ marginTop: 'var(--space-4)' }} value={body} onChange={e => setBody(e.target.value)} />
                            </section>
                        )}
                    </>
                )}
            </div>

            {/* Sticky Submit Bar */}
            {postType && (
                <div className={styles.submitBar}>
                    <div className={styles.submitInner}>
                        <button className={styles.draftBtn} onClick={handleDraft} disabled={submitting}>Save as Draft</button>
                        <button className={styles.publishBtn} onClick={handlePublish} disabled={submitting}>
                            {submitting ? 'Publishing…' : '🚀 Publish'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
