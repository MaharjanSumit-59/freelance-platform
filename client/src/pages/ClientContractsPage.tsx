import { useEffect, useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import ContractCard from '../components/ContractCard';
import * as contractsApi from '../api/contracts';
import { useAuth } from '../context/AuthContext';
import type { Contract } from '../types';

export default function ClientContractsPage() {
  const { currentUser } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    contractsApi.listMyContracts().then(setContracts).finally(() => setLoading(false));
  }, [currentUser]);

  if (!currentUser) return null;

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-ink mb-6">Contracts</h1>
        <div className="space-y-4">
          {loading ? (
            <div className="bg-surface border border-border rounded-lg text-muted text-sm py-16 text-center">
              Loading...
            </div>
          ) : contracts.length === 0 ? (
            <div className="bg-surface border border-border rounded-lg text-muted text-sm py-16 text-center">
              No active contracts yet. Hire a freelancer to get started.
            </div>
          ) : (
            contracts.map((c) => <ContractCard key={c.id} contract={c} viewerRole="client" />)
          )}
        </div>
      </div>
    </MainLayout>
  );
}
