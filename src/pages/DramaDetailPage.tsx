import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { dramaApi } from '@/src/api/dramaApi';
import { DramaDetailResponse, Episode } from '@/src/types';
import Icon from '@/src/components/Icon';

const DramaDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [drama, setDrama] = useState<DramaDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [coins, setCoins] = useState(() => Number(localStorage.getItem('genidea_coins') || 100));
  const [lockedEpisode, setLockedEpisode] = useState<Episode | null>(null);
  const [unlockedIds, setUnlockedIds] = useState<string[]>(() => JSON.parse(localStorage.getItem('genidea_unlocked') || '[]'));

  const episodeCost = (episode: Episode) => Math.max(5, episode.episodeGoldCoinPrice || 20);
  const unlockWithCoins = () => {
    if (!lockedEpisode) return;
    const cost = episodeCost(lockedEpisode);
    if (coins < cost) {
      alert('Koin belum cukup. Buka menu saldo koin untuk melihat paket demo.');
      return;
    }
    const nextCoins = coins - cost;
    const nextUnlocked = [...unlockedIds, lockedEpisode.episodeId];
    setCoins(nextCoins);
    setUnlockedIds(nextUnlocked);
    localStorage.setItem('genidea_coins', String(nextCoins));
    localStorage.setItem('genidea_unlocked', JSON.stringify(nextUnlocked));
    window.dispatchEvent(new Event('genidea-coins'));
    setSelectedEpisode(lockedEpisode);
    setLockedEpisode(null);
  };

  const unlockWithAdDemo = () => {
    if (!lockedEpisode) return;
    // Demo-only reward flow. A real ad network SDK and server-side callback are required in production.
    const nextUnlocked = [...unlockedIds, lockedEpisode.episodeId];
    setUnlockedIds(nextUnlocked);
    localStorage.setItem('genidea_unlocked', JSON.stringify(nextUnlocked));
    setSelectedEpisode(lockedEpisode);
    setLockedEpisode(null);
  };

  const fetchDrama = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await dramaApi.getAllEpisodes(id);
      setDrama(response);
      // Auto-select first episode
      if (response.shortPlayEpisodeInfos.length > 0) {
        const firstFree = response.shortPlayEpisodeInfos.find(ep => !ep.isLock || unlockedIds.includes(ep.episodeId));
        if (firstFree) setSelectedEpisode(firstFree);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Gagal memuat drama'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDrama();
  }, [fetchDrama]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background-light dark:bg-background-dark pt-20 pb-20">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <span className="ml-4 text-gray-600 dark:text-gray-400">Memuat drama...</span>
        </div>
      </main>
    );
  }

  if (error || !drama) {
    return (
      <main className="min-h-screen bg-background-light dark:bg-background-dark pt-20 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
            <p className="font-medium">Gagal memuat drama</p>
            <p className="text-sm">{error?.message}</p>
            <Link to="/" className="mt-4 inline-block text-primary hover:underline">
              ← Kembali ke Beranda
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Video Player Section */}
      <div className="relative bg-black">
        {selectedEpisode ? (
          <div className="aspect-video max-h-[70vh] mx-auto">
            <video
              key={selectedEpisode.episodeId}
              src={selectedEpisode.playVoucher}
              poster={selectedEpisode.episodeCover}
              controls
              autoPlay
              className="w-full h-full object-contain"
            />
          </div>
        ) : (
          <div className="aspect-video max-h-[70vh] flex items-center justify-center bg-gray-900">
            <img src={drama.shortPlayCover} alt={drama.shortPlayName} className="h-full object-contain" />
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Drama Info */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <img
            src={drama.shortPlayCover}
            alt={drama.shortPlayName}
            className="w-40 h-60 object-cover rounded-lg shadow-lg hidden md:block"
          />
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {drama.shortPlayName}
            </h1>
            <div className="flex flex-wrap gap-2 mb-4">
              {drama.shortPlayLabels.map((label, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                >
                  {label}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400 text-sm mb-4">
              <span className="flex items-center gap-1">
                <Icon name="movie" size="sm" />
                {drama.totalEpisode} Episode
              </span>
              <span className="flex items-center gap-1">
                <Icon name="check_circle" size="sm" />
                {drama.isFinish ? 'Selesai' : 'Ongoing'}
              </span>
              {drama.scriptName && (
                <span className="px-2 py-0.5 bg-orange-500 text-white rounded text-xs">
                  {drama.scriptName}
                </span>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-400 line-clamp-3">
              {drama.shotIntroduce}
            </p>
          </div>
        </div>

        {/* Episode List */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Daftar Episode ({drama.shortPlayEpisodeInfos.length})
          </h2>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
            {drama.shortPlayEpisodeInfos.map((episode) => (
              <button
                key={episode.episodeId}
                onClick={() => {
                  if (episode.isLock && !unlockedIds.includes(episode.episodeId)) setLockedEpisode(episode);
                  else setSelectedEpisode(episode);
                }}
                className={`relative aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all
                  ${selectedEpisode?.episodeId === episode.episodeId
                    ? 'bg-primary text-white'
                    : episode.isLock && !unlockedIds.includes(episode.episodeId)
                      ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900'
                      : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-primary/20'
                  }`}
              >
                {episode.isLock && !unlockedIds.includes(episode.episodeId) && (
                  <Icon name="lock" size="xs" className="absolute top-1 right-1 text-blue-500" />
                )}
                {episode.episodeNo}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Episode Info */}
        {selectedEpisode && (
          <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Episode {selectedEpisode.episodeNo}
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Icon name="favorite" size="sm" className="text-red-500" />
                  {selectedEpisode.likeNums}
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="visibility" size="sm" />
                  {selectedEpisode.chaseNums}
                </span>
                <span className="px-2 py-0.5 bg-blue-500 text-white rounded text-xs">
                  {selectedEpisode.playClarity}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {lockedEpisode && (
        <div className="fixed inset-0 z-[70] bg-black/75 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-blue-500/30 bg-white dark:bg-[#0b1729] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div><p className="text-xs uppercase tracking-widest text-primary font-bold">EPISODE PREMIUM</p><h3 className="text-xl font-black text-gray-900 dark:text-white">Buka Episode {lockedEpisode.episodeNo}</h3></div>
              <button onClick={() => setLockedEpisode(null)} className="text-2xl text-gray-500">×</button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Pilih cara untuk membuka episode ini.</p>
            <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-4 mb-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">Harga episode</p>
              <p className="text-2xl font-black text-primary">{episodeCost(lockedEpisode)} Koin</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Saldo kamu: {coins.toLocaleString('id-ID')} koin</p>
            </div>
            <button onClick={unlockWithCoins} className="w-full rounded-xl bg-primary hover:bg-blue-600 text-white font-bold py-3 mb-3">Buka dengan Koin</button>
            <button onClick={unlockWithAdDemo} className="w-full rounded-xl border border-blue-500/40 text-primary font-bold py-3 hover:bg-blue-500/10">Tonton Iklan untuk Membuka (Demo)</button>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-3">Tombol iklan saat ini simulasi. Untuk iklan sungguhan perlu integrasi penyedia iklan dan verifikasi reward dari server.</p>
          </div>
        </div>
      )}
    </main>
  );
};

export default DramaDetailPage;
