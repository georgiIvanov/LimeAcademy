import { useEffect, useState } from "react";
import { USElection } from "../contracts/types";

export interface ElectionRunningProps {
  usElectionContract: USElection,
  setWaiting: (isWaiting: boolean) => void
}

export const ElectionRunning = ({ usElectionContract, setWaiting }: ElectionRunningProps): JSX.Element => {
  const [running, setElectionRunning] = useState<boolean>(null);

  useEffect(() => {
    getElectionEnded();
  });

  const getElectionEnded = async () => {
    let electionEnded = await usElectionContract.electionEnded();
    setElectionRunning(!electionEnded);
  };

  const endElection = async () => {
    setWaiting(true);
    try {
      let tx = await usElectionContract.endElection();
      await tx.wait();
      setElectionRunning(false);
    } catch (e) {
      throw e;
    } finally {
      setWaiting(false);
    }
  };

  if (running == null) {
    return null;
  } else {
    return running ?
    (
      <span>
        Election is running. <button onClick={endElection}>End election</button>
      </span>
    )
    : (<p>Election ended</p>)
  } 
}