'use client';

import { useConnection } from '@solana/wallet-adapter-react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Program } from '@coral-xyz/anchor';
import { getCrudappProgramId, getCrudappProgram, CrudappIDL } from '@project/anchor';
import toast from 'react-hot-toast'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../ui/ui-layout'
import { Cluster, PublicKey } from '@solana/web3.js';
import IDL from "../../../anchor/target/idl/crudapp.json"
import { useMemo } from 'react';


const PROGRAM_ID = new PublicKey(IDL.address);

interface CreateEntryArgs{
  title : string,
  message : string,
  owner : PublicKey
}

export function useJournalProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const programId = useMemo(()=> getCrudappProgramId(cluster.network as Cluster), [cluster])
  const program = getCrudappProgram(provider);


  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(PROGRAM_ID),
  });

  const createEntry = useMutation<string, Error, CreateEntryArgs>({
    mutationKey : ['journalEntry', 'create', {cluster}],
    mutationFn : async ({title, message, owner}) => {
      return program.methods.createJournalEntry(title, message).rpc();
    },
    onSuccess : (signature) => {
      transactionToast(signature);
    }
  })

  return {
    program,
    programId,
    getProgramAccount,
    
  };
}
