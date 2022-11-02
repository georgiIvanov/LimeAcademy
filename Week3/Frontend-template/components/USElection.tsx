import type { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { useEffect, useState } from "react";
import useUSElectionContract from "../hooks/useUSElectionContract";
import { SeatsWon } from "./SeatsWon";
import { Spinner } from "./Spinner";
import { TransactionInfo } from "./TransactionInfo";

type USContract = {
  contractAddress: string;
};

export enum Leader {
  UNKNOWN = 0,
  BIDEN = 1,
  TRUMP = 2
}

const USElection = ({ contractAddress }: USContract) => {
  const { account, library } = useWeb3React<Web3Provider>();
  const usElectionContract = useUSElectionContract(contractAddress);
  const [currentLeader, setCurrentLeader] = useState<string>('Unknown');
  const [name, setName] = useState<string | undefined>();
  const [votesBiden, setVotesBiden] = useState<number | undefined>();
  const [votesTrump, setVotesTrump] = useState<number | undefined>();
  const [stateSeats, setStateSeats] = useState<number | undefined>();
  const [loading, isLoading] = useState<boolean>();
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  useEffect(() => {
    getCurrentLeader();
  },[])

  const getCurrentLeader = async () => {
    const currentLeader = await usElectionContract.currentLeader();
    setCurrentLeader(currentLeader == Leader.UNKNOWN ? 'Unknown' : currentLeader == Leader.BIDEN ? 'Biden' : 'Trump')
  }

  usElectionContract.on('LogStateResult', (winner, stateSeats, stateName, tx) => {
    console.log('LogStateResult');
    console.log(winner);
    console.log(stateSeats);
    console.log(stateName);
    console.log(tx);
  });

  const filterBiddenWinner = usElectionContract.filters.LogStateResult(Leader.BIDEN);

  usElectionContract.on(filterBiddenWinner, (winner, stateSeats, stateName, tx) => {
    console.log('Filtered LogStateResult - BIDEN only');
    console.log(tx);
  })

  const stateInput = (input) => {
    setName(input.target.value)
  }

  const bideVotesInput = (input) => {
    setVotesBiden(input.target.value)
  }

  const trumpVotesInput = (input) => {
    setVotesTrump(input.target.value)
  }

  const seatsInput = (input) => {
    setStateSeats(input.target.value)
  }

  const submitStateResults = async () => {
    isLoading(true);
    const result:any = [name, votesBiden, votesTrump, stateSeats];

    try {
      const tx = await usElectionContract.submitStateResult(result);
      setTransactionHash(tx.hash);
      await tx.wait();
    } catch (e) {
      throw e;
    } finally {
      isLoading(false);
      resetForm();
      getCurrentLeader();
    }
  }

  const resetForm = async () => {
    setName('');
    setVotesBiden(0);
    setVotesTrump(0);
    setStateSeats(0);
  }

  return (
    <div className="results-form">
    <p>
      Current Leader is: {currentLeader}
    </p>
    <form>
      <label>
        State:
        <input onChange={stateInput} value={name} type="text" name="state" />
      </label>
      <label>
        BIDEN Votes:
        <input onChange={bideVotesInput} value={votesBiden} type="number" name="biden_votes" />
      </label>
      <label>
        TRUMP Votes:
        <input onChange={trumpVotesInput} value={votesTrump} type="number" name="trump_votes" />
      </label>
      <label>
        Seats:
        <input onChange={seatsInput} value={stateSeats} type="number" name="seats" />
      </label>
      {/* <input type="submit" value="Submit" /> */}
    </form>
    <div className="button-wrapper">
      <button onClick={submitStateResults}>Submit Results</button>
    </div>
    <TransactionInfo transactionHash={transactionHash}/>
    <div>
      {loading && <Spinner/>}
    </div>
    <SeatsWon usElectionContract={usElectionContract}/>
    <style jsx>{`
        .results-form {
          display: flex;
          flex-direction: column;
        }

        .button-wrapper {
          margin: 20px;
        }
        
      `}</style>
    </div>
  );
};

export default USElection;
