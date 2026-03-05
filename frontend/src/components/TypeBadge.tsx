import styles from './TypeBadge.module.css';

type PostType = 'itinerary' | 'restaurant' | 'experience';

interface TypeBadgeProps {
    type: PostType;
}

const LABELS: Record<PostType, string> = {
    itinerary: 'Itinerary',
    restaurant: 'Restaurant',
    experience: 'Experience',
};

export function TypeBadge({ type }: TypeBadgeProps) {
    return (
        <span className={`${styles.badge} ${styles[type]}`}>
            {LABELS[type]}
        </span>
    );
}
