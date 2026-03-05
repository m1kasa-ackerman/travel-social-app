interface StarRatingProps {
    rating: number;
    maxStars?: number;
    size?: 'sm' | 'md' | 'lg';
    interactive?: boolean;
    onRate?: (rating: number) => void;
}

const SIZE_MAP = { sm: 14, md: 20, lg: 28 };

export function StarRating({ rating, maxStars = 5, size = 'md', interactive = false, onRate }: StarRatingProps) {
    const px = SIZE_MAP[size];

    return (
        <span style={{ display: 'inline-flex', gap: 2 }}>
            {Array.from({ length: maxStars }, (_, i) => {
                const filled = i < rating;
                return (
                    <svg
                        key={i}
                        width={px}
                        height={px}
                        viewBox="0 0 24 24"
                        fill={filled ? 'var(--accent-primary)' : 'var(--border-default)'}
                        style={{ cursor: interactive ? 'pointer' : 'default', transition: 'fill 150ms' }}
                        onClick={() => interactive && onRate?.(i + 1)}
                    >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                );
            })}
        </span>
    );
}
