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

  const accounts = useQuery({
    queryKey : ['journal', 'all', {cluster}],
    queryFn : async ()=> program.account.journalEntryState.all()
  })


  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  const createEntry = useMutation<string, Error, CreateEntryArgs>({
    mutationKey : ['journalEntry', 'create', {cluster}],
    mutationFn : async ({title, message, owner}) => {
      return program.methods.createJournalEntry(title, message).rpc();
    },
    onSuccess : (signature) => {
      transactionToast(signature);
      accounts.refetch();
    },
    onError : (error) =>{
      toast.error(`Error to create journal entry : ${error.message}`);
    }
  })

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    createEntry
  };
}


export function useJournaLProgramAccount({account} : {account : PublicKey}){
  const {cluster} = useCluster();
  const transactionToast = useTransactionToast();
  const {program, accounts, programId} = useJournalProgram();

  const accountQuery = useQuery({
    queryKey : ['journal', 'fetch', {cluster, account}],
    queryFn : async () => program.account.journalEntryState.fetch(account)
  })

  const updateEntry = useMutation<string, Error, CreateEntryArgs>({
    mutationKey : ['journalEntry', 'update', {cluster}],
    mutationFn : async ( {title, message}) => {
      return program.methods.updateJournalEntry(title, message).rpc();
    },
    onSuccess : (signature) =>{
      transactionToast(signature);
      accounts.refetch();
    },
    onError : (error) =>{
      toast.error(`Error while updating journal entry : ${error.message}`);
    }
  })


  const deleteEntry = useMutation({
    mutationKey : ['journalEntry', 'delete', {cluster}],
    mutationFn : ({title} : {title : string}) =>{
      return program.methods.deleteJournalEntry(title).rpc();
    },
    onSuccess : (signature) =>{
      transactionToast(signature);
      accounts.refetch();
    }
  })

  return {
    accountQuery,
    updateEntry,
    deleteEntry,
  }
  
}
