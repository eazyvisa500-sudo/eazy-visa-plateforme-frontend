import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import EntrepriseDetailModal from '../../components/EntrepriseDetailModal';
import { getEntreprise, type EntrepriseDetail } from '../../services/entreprises';

export default function EntrepriseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [detail, setDetail] = useState<EntrepriseDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getEntreprise(Number(id));
      setDetail(data);
    } catch {
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <EntrepriseDetailModal
      asPage
      detail={detail}
      loading={loading}
      onRefresh={load}
    />
  );
}
