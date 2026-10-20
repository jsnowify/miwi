import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
export default function SongPicker({ onSelect, disabled }) {
  const [search, setSearch] = useState(''), [term, setTerm] = useState('');
  const results = useQuery({ queryKey: ['musicSearch', term], enabled: !!term, retry: false,
    queryFn: async ({ signal }) => {
      const response = await fetch(`https://itunes.apple.com/search?${new URLSearchParams({ term, entity: 'song', limit: '6' })}`, { signal });
      if (!response.ok) throw new Error('Music search is unavailable. Try again later.');
      return (await response.json()).results.filter(track => track.previewUrl && track.artworkUrl100).map(track => ({ track_id: String(track.trackId), title: track.trackName, artist: track.artistName, cover_url: track.artworkUrl100, preview_url: track.previewUrl, clip_start: 0 }));
    },
  });
  return <details><summary>Add a song instead of a photo</summary><div className="miwi-form"><label>Song or artist<input value={search} onChange={e => setSearch(e.target.value)} maxLength={100} disabled={disabled} /></label>
    <small>Music search sends your search words to Apple. You can attach a short preview.</small>
    <button type="button" className="miwi-secondary" disabled={disabled || !search.trim() || results.isFetching} onClick={() => setTerm(search.trim())}>{results.isFetching ? 'Searching…' : 'Search music'}</button>
    <p role="alert">{results.error?.message}</p>{results.data?.length === 0 && <p>No songs found. Try another title or artist.</p>}
    {results.data?.map(track => <div className="miwi-member" key={track.track_id}><span>{track.title}<br /><small>{track.artist}</small></span><button type="button" className="miwi-secondary" disabled={disabled} onClick={() => onSelect(track)}>Choose</button></div>)}
  </div></details>;
}
