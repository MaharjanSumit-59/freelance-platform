import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import ChatThread from '../components/ChatThread';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationsContext';
import * as contractsApi from '../api/contracts';
import * as jobsApi from '../api/jobs';
import * as usersApi from '../api/users';
import type { Contract } from '../types';

interface ConversationSummary {
  contract: Contract;
  jobTitle: string;
  otherPartyName: string;
  lastMessagePreview: string;
}

export default function MessagesPage() {
  const { currentUser } = useAuth();
  const { notifications, markRead } = useNotifications();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedContractId, setSelectedContractId] = useState<string | null>(searchParams.get('contract'));
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    contractsApi
      .listMyContracts()
      .then(async (contracts) => {
        const enriched = await Promise.all(
          contracts.map(async (contract) => {
            const otherPartyId = currentUser.role === 'client' ? contract.freelancerId : contract.clientId;
            const [job, otherParty, messages] = await Promise.all([
              jobsApi.getJob(contract.jobId).catch(() => null),
              usersApi.getPublicUser(otherPartyId).catch(() => null),
              contractsApi.listMessages(contract.id).catch(() => []),
            ]);
            return {
              contract,
              jobTitle: job?.title ?? '',
              otherPartyName: otherParty?.name ?? '',
              lastMessagePreview: messages[messages.length - 1]?.text ?? '',
            };
          })
        );
        setConversations(enriched);
      })
      .finally(() => setLoading(false));
  }, [currentUser]);

  const activeContractId = selectedContractId ?? conversations[0]?.contract.id ?? null;
  const activeConversation = conversations.find((c) => c.contract.id === activeContractId);

  const unreadContractIds = new Set(
    notifications.filter((n) => n.type === 'message' && !n.read && n.relatedId).map((n) => n.relatedId as string)
  );

  useEffect(() => {
    if (!activeContractId) return;
    notifications
      .filter((n) => n.type === 'message' && !n.read && n.relatedId === activeContractId)
      .forEach((n) => markRead(n.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeContractId, notifications]);

  if (!currentUser) return null;

  const selectContract = (id: string) => {
    setSelectedContractId(id);
    setSearchParams({ contract: id });
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-6">
        <aside className="md:col-span-1 border border-border rounded-lg bg-surface overflow-hidden">
          <p className="text-sm font-medium px-4 py-3 border-b border-border">Conversations</p>
          {loading && <p className="text-sm text-muted px-4 py-6">Loading...</p>}
          {!loading && conversations.length === 0 && (
            <p className="text-sm text-muted px-4 py-6">No active contracts to message about yet.</p>
          )}
          <div>
            {conversations.map(({ contract, jobTitle, otherPartyName, lastMessagePreview }) => (
              <button
                key={contract.id}
                onClick={() => selectContract(contract.id)}
                className={`w-full text-left px-4 py-3 border-b border-border last:border-0 hover:bg-bg/30 transition-colors ${
                  activeContractId === contract.id ? 'bg-bg/40' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{otherPartyName}</p>
                  {unreadContractIds.has(contract.id) && (
                    <span className="w-2 h-2 rounded-full bg-primary shrink-0" aria-label="Unread messages" />
                  )}
                </div>
                <p className="text-xs text-muted truncate">{jobTitle}</p>
                {lastMessagePreview && (
                  <p className="text-xs text-ink/60 truncate mt-1">{lastMessagePreview}</p>
                )}
              </button>
            ))}
          </div>
        </aside>

        <section className="md:col-span-2 border border-border rounded-lg bg-surface p-4">
          {activeContractId && activeConversation ? (
            <ChatThread contractId={activeContractId} otherPartyName={activeConversation.otherPartyName} />
          ) : (
            <p className="text-sm text-muted text-center py-16">Select a conversation to start messaging.</p>
          )}
        </section>
      </div>
    </MainLayout>
  );
}
