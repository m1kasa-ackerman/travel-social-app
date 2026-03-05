import { useState, useEffect, useRef } from 'react';
import { mockMapPins } from '../data/mockData';
import styles from './MapPage.module.css';

declare global {
    interface Window {
        L: typeof import('leaflet');
    }
}

const FILTER_TYPES = ['All', 'Restaurant', 'Itinerary', 'Experience'];

export function MapPage() {
    const mapRef = useRef<HTMLDivElement>(null);
    const leafletMap = useRef<unknown>(null);
    const [activePin, setActivePin] = useState<typeof mockMapPins[0] | null>(null);
    const [filterOpen, setFilterOpen] = useState(false);
    const [selectedType, setSelectedType] = useState('All');
    const [onlySaved, setOnlySaved] = useState(false);
    const [minRating, setMinRating] = useState(0);
    const [search, setSearch] = useState('');
    const [mapLoaded, setMapLoaded] = useState(false);
    void mapLoaded; // used to trigger re-render after map init

    useEffect(() => {
        // Dynamically import Leaflet
        import('leaflet').then(L => {
            if (!mapRef.current || leafletMap.current) return;

            const map = L.map(mapRef.current, {
                center: [20, 0],
                zoom: 3,
                zoomControl: false,
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
            }).addTo(map);

            L.control.zoom({ position: 'bottomright' }).addTo(map);

            // Add markers
            mockMapPins.forEach(pin => {
                const color = pin.saved ? '#FF4500' : '#0079D3';
                const icon = L.divIcon({
                    html: `<svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 22 14 22s14-12.667 14-22C28 6.268 21.732 0 14 0z" fill="${color}"/>
            <circle cx="14" cy="13" r="5" fill="white"/>
          </svg>`,
                    className: '',
                    iconSize: [28, 36],
                    iconAnchor: [14, 36],
                });

                const marker = L.marker([pin.lat, pin.lng], { icon })
                    .addTo(map)
                    .on('click', () => setActivePin(pin));

                return marker;
            });

            leafletMap.current = map;
            setMapLoaded(true);
        });

        return () => {
            if (leafletMap.current) {
                (leafletMap.current as { remove: () => void }).remove();
                leafletMap.current = null;
            }
        };
    }, []);

    const [searching, setSearching] = useState(false);
    const [savedPins, setSavedPins] = useState<Set<string>>(new Set(
        mockMapPins.filter(p => p.saved).map(p => p.name)
    ));

    async function handleGeoSearch(e?: React.FormEvent) {
        e?.preventDefault();
        if (!search.trim() || !leafletMap.current) return;
        setSearching(true);
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(search)}&format=json&limit=1`,
                { headers: { 'Accept-Language': 'en' } }
            );
            const data = await res.json();
            if (data.length > 0) {
                const { lat, lon } = data[0];
                const map = leafletMap.current as { flyTo: (latlng: [number, number], zoom: number) => void };
                map.flyTo([parseFloat(lat), parseFloat(lon)], 13);
            }
        } catch { /* silently ignore */ }
        finally { setSearching(false); }
    }

    function handleMyLocation() {
        navigator.geolocation?.getCurrentPosition(pos => {
            const map = leafletMap.current as { flyTo: (latlng: [number, number], zoom: number) => void };
            map?.flyTo([pos.coords.latitude, pos.coords.longitude], 13);
        });
    }

    function handleSavePin(pinName: string) {
        setSavedPins(prev => {
            const next = new Set(prev);
            if (next.has(pinName)) next.delete(pinName);
            else next.add(pinName);
            return next;
        });
    }

    return (
        <div className={styles.page}>
            {/* Floating search */}
            <form className={styles.floatingSearch} onSubmit={handleGeoSearch}>
                <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                    type="text"
                    className={styles.searchInput}
                    placeholder={searching ? 'Searching…' : 'Search any city or place…'}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <button type="button" className={styles.locationBtn} title="My location" onClick={handleMyLocation}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3" /><path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
                    </svg>
                </button>
            </form>

            {/* Filter Drawer */}
            <div className={`${styles.filterDrawer} ${filterOpen ? styles.filterOpen : ''}`}>
                <button className={styles.filterToggle} onClick={() => setFilterOpen(f => !f)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: filterOpen ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }}>
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                    <span>Filters</span>
                </button>
                <div className={styles.filterContent}>
                    <h3 className={styles.filterTitle}>Type</h3>
                    <div className={styles.filterPills}>
                        {FILTER_TYPES.map(t => (
                            <button
                                key={t}
                                className={`${styles.filterPill} ${selectedType === t ? styles.filterPillActive : ''}`}
                                onClick={() => setSelectedType(t)}
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    <h3 className={styles.filterTitle}>Min Rating</h3>
                    <div className={styles.starSelector}>
                        {[1, 2, 3, 4, 5].map(s => (
                            <button key={s} className={styles.starBtn} onClick={() => setMinRating(s === minRating ? 0 : s)}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill={s <= minRating ? 'var(--accent-primary)' : 'var(--border-default)'}>
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                            </button>
                        ))}
                    </div>

                    <div className={styles.filterToggleRow}>
                        <span className={styles.filterLabel}>Only Saved</span>
                        <button
                            className={`${styles.toggle} ${onlySaved ? styles.toggleOn : ''}`}
                            onClick={() => setOnlySaved(s => !s)}
                        >
                            <span className={styles.toggleThumb} />
                        </button>
                    </div>

                    <button className={styles.applyBtn}>Apply Filters</button>
                </div>
            </div>

            {/* Map canvas */}
            <div ref={mapRef} className={styles.mapCanvas} />

            {/* Bottom Sheet */}
            {activePin && (
                <div className={styles.bottomSheet}>
                    <div className={styles.bottomSheetHandle} />
                    <div className={styles.bottomSheetContent}>
                        <div className={styles.placeInfo}>
                            <div className={styles.placeImgWrap}>
                                <div className={styles.placeImgPlaceholder}>📍</div>
                            </div>
                            <div className={styles.placeDetails}>
                                <div className={styles.placeName}>{activePin.name}</div>
                                <div className={styles.placeCity}>{activePin.city}</div>
                                <div style={{ marginTop: 4 }}>
                                    <span className={`${activePin.type === 'restaurant' ? 'badge-restaurant' : activePin.type === 'itinerary' ? 'badge-itinerary' : 'badge-experience'}`}
                                        style={{
                                            fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '2px 8px', borderRadius: 20,
                                            background: activePin.type === 'restaurant' ? 'var(--badge-restaurant-bg)' : activePin.type === 'itinerary' ? 'var(--badge-itinerary-bg)' : 'var(--badge-experience-bg)',
                                            color: activePin.type === 'restaurant' ? 'var(--badge-restaurant-txt)' : activePin.type === 'itinerary' ? 'var(--badge-itinerary-txt)' : 'var(--badge-experience-txt)',
                                        }}>
                                        {activePin.type}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className={styles.bottomBtns}>
                            <button
                                className={styles.savePlaceBtn}
                                onClick={() => handleSavePin(activePin.name)}
                            >
                                {savedPins.has(activePin.name) ? '🔖 Saved ✓' : '🔖 Save to Wishlist'}
                            </button>
                            <button className={styles.reviewBtn} onClick={() => setActivePin(null)}>See Full Review</button>
                            <button className={styles.closeSheetBtn} onClick={() => setActivePin(null)}>✕</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
