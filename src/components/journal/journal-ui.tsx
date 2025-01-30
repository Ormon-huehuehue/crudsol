'use client';

import { useState } from 'react';
import { useJournalProgramAccount, useJournalProgram } from './journal-data-access'
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';



export function JournalCreate() {

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const { createEntry } = useJournalProgram();
  const {publicKey} = useWallet();

  const isFormValid : boolean = title.trim() !== '' && message.trim() !== '';

  const handleSubmit = ()=>{
    if (publicKey && isFormValid){
      createEntry.mutateAsync({title, message, owner : publicKey})
    }
  }

  if(!publicKey){
    return (
      <p className= "text-center text-4xl"> Connect your wallet </p>
    )
  }
  
  return (
    <div className = 'flex flex-col items-center'>
      <input 
        type="text" 
        placeholder="Title" 
        value={title} 
        onChange={(e)=>setTitle(e.target.value)}
        className="input input-bordered mb-4 w-full max-w-xs"
      />
      <textarea
        placeholder="Message"
        value={message}
        onChange={(e)=>setMessage(e.target.value)}
        className="flex justify-center textarea textarea-bordered mb-4 w-full max-w-xs"
      />
      <button 
        onClick={handleSubmit}
        disabled={!isFormValid || createEntry.isPending}
        className="flex btn  btn-primary"
      > Create Entry</button>
    </div>
  );
}

export function JournalList() {
  const { accounts, getProgramAccount } = useJournalProgram();

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="flex justify-center alert alert-info">
        <span>
          Program account not found. Make sure you have deployed the program and
          are on the correct cluster.
        </span>
      </div>
    );
  }
  return (
    <div className={"space-y-6"}>
      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : accounts.data?.length ? (
        <div className="grid gap-4 lg:grid-cols-2 p-8">
          {accounts.data?.map((account) => (
            <JournalCard
              key={account.publicKey.toString()}
              account={account.publicKey}
            />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className={"text-2xl"}>No accounts</h2>
          No accounts found. Create one above to get started.
        </div>
      )}
    </div>
  );
}

function JournalCard({account}: {account : PublicKey}){

  const {accountQuery, updateEntry, deleteEntry} = useJournalProgramAccount({account});

  const [message, setMessage] = useState(accountQuery.data?.message ?? "");
  const title = accountQuery.data?.title;


  const {publicKey} = useWallet();

  const isFormValid : boolean = message?.trim() !==''

  const handleSubmit = ()=>{
    if (publicKey && isFormValid && title){
      updateEntry.mutateAsync({title, message, owner : publicKey});
    }
  }

  if(!publicKey){
    return <p> Connect your Wallet</p>
  }

  return accountQuery.isLoading ? (
    <span className="loading loading-spinner loading-lg" />) : (
      <div className= 'card card-bordered border-base-300 border-3  text-neutral-content'>
        <div className= 'card-body items-center text-center'>
          <div className= 'space-y-6'>
            <h2 className= 'card-title justify-center text-4xl cursor-pointer'
            onClick={()=> accountQuery.refetch()}
            > {title}</h2>
            <p>{accountQuery.data?.message}</p>
            <p className= 'text-red-200 text-xs'>Account : {account.toString()}</p>
            <div className= "card-actions">
              <textarea className= 'textarea textarea-bordered w-full masx-w-xs'
              placeholder = "message"
              value = {message}
              onChange = {(e) => setMessage(e.target.value)}
              />

              <button
                onClick = {handleSubmit}
                disabled = {!isFormValid || updateEntry.isPending}
                className=  'btn btn-xs lg:btn-md btn-primary'
                > Update Entry
              </button>
              <button
                onClick = {()=>{
                  const title = accountQuery.data?.title;
                  if(title){
                    return deleteEntry.mutate({title});
                  }
                }}
                disabled = { deleteEntry.isPending}
                className=  'btn btn-xs lg:btn-md btn-primary'
                > Delete Entry
              </button>
            </div>
          </div>
      </div>
    </div>
  ) 
}
