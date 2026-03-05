import { useEffect, useState } from 'react';
import type { Itinerary } from '../types/itinerary';

const API_URL = 'http://localhost:8080/api/itineraries';

// Tag color palette (cycles through)
const TAG_COLORS = [
    'bg-rose-100 text-rose-700',
    'bg-sky-100 text-sky-700',
    'bg-emerald-100 text-emerald-700',
    'bg-amber-100 text-amber-700',
    'bg-violet-100 text-violet-700',
];

function ItineraryCard({ item, index }: { item: Itinerary; index: number }) {
    const [saved, setSaved] = useState(false);

    return (
        <div
            className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 group"
            style={{ animationDelay: `${index * 80}ms` }}
        >
            {/* Image — 4:3 aspect ratio */}
            <div className="w-full" style={{ aspectRatio: '4/3', overflow: 'hidden', position: 'relative' }}>
                <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                />
                {/* Day badge */}
                <span
                    className="absolute top-3 left-3 text-white text-xs font-semibold px-3 py-1 rounded-full"
                    style={{ backgroundColor: '#FF5A5F' }}
                >
                    {item.days} days
                </span>
                {/* Save button */}
                <button
                    onClick={() => setSaved(!saved)}
                    aria-label={saved ? 'Unsave itinerary' : 'Save itinerary'}
                    className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-200 active:scale-90 ${saved
                            ? 'bg-rose-500 text-white shadow-md'
                            : 'bg-white/80 text-gray-500 hover:bg-white hover:text-rose-500'
                        }`}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill={saved ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                </button>
            </div>

            {/* Card body */}
            <div className="p-4">
                {/* Destination */}
                <p className="text-xs font-medium text-gray-400 flex items-center gap-1 mb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                    </svg>
                    {item.destination}
                </p>

                {/* Title */}
                <h3 className="font-semibold text-gray-900 text-base leading-snug mb-3 line-clamp-2">
                    {item.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">
                    {item.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                    {item.tags.map((tag, i) => (
                        <span
                            key={tag}
                            className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${TAG_COLORS[i % TAG_COLORS.length]}`}
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function ItineraryList() {
    const [itineraries, setItineraries] = useState<Itinerary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch(API_URL)
            .then((res) => {
                if (!res.ok) throw new Error(`Server error: ${res.status}`);
                return res.json();
            })
            .then((data: Itinerary[]) => {
                setItineraries(data);
                setLoading(false);
            })
            .catch((err: Error) => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div
                    className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-rose-500 animate-spin"
                />
                <p className="text-sm text-gray-400 font-medium">Loading itineraries…</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-center px-6">
                <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center text-2xl">🔌</div>
                <p className="font-semibold text-gray-700">Couldn't reach the server</p>
                <p className="text-sm text-gray-400">Make sure the Spring Boot backend is running on port 8080.</p>
                <code className="mt-1 text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg">{error}</code>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {itineraries.map((item, idx) => (
                <ItineraryCard key={item.id} item={item} index={idx} />
            ))}
        </div>
    );
}
