'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { ExplorerLink } from '../cluster/cluster-ui';
import { WalletButton } from '../solana/solana-provider';
import { AppHero, ellipsify } from '../ui/ui-layout';
import { useJournalProgram } from './journal-data-access';
import { JournalCreate, JournalList } from './journal-ui';

export default function JournalFeature() {
  const { publicKey } = useWallet();
  const { programId } = useJournalProgram();

  return publicKey ? (
    <div>
      <AppHero
        title="Journal Program"
        subtitle={'Submit your journal entries to the Solana blockchain.'}
      >
        <p className="mb-6">
          Program ID --{' '}
          <ExplorerLink
            path={`account/${programId}`}
            label={ellipsify(programId.toString())}
          />
        </p>
        <JournalCreate />
      </AppHero>
      <JournalList />
    </div>
  ) : (
    <div className="max-w-4xl mx-auto">
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <WalletButton className="btn btn-primary" />
        </div>
      </div>
    </div>
  );
}
