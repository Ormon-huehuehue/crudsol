'use client';

import { useState } from 'react';
import { useJournalProgram } from './journal-data-access'
import { useWallet } from '@solana/wallet-adapter-react';

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
    <div>
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
        className="textarea textarea-bordered mb-4 w-full max-w-xs"
      />
      <button 
        onClick={handleSubmit}
        disabled={!isFormValid || createEntry.isPending}
        className="btn btn-xs lg:btn:md btn-primary"
      />
    </div>
  );
}

export function JournalProgram() {
  const { getProgramAccount } = useJournalProgram();

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>
          Program account not found. Make sure you have deployed the program and
          are on the correct cluster.
        </span>
      </div>
    );
  }
  return (
    <div className={'space-y-6'}>
      <pre>{JSON.stringify(getProgramAccount.data.value, null, 2)}</pre>
    </div>
  );
}
