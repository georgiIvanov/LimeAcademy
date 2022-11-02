import { useEffect, useState } from "react";
import { USElection } from "../contracts/types";

export interface SeatsWonProps {
  usElectionContract: USElection
}

export const SeatsWon = ({ usElectionContract }: SeatsWonProps): JSX.Element => {
  const BIDEN = 1;
  const TRUMP = 2;

  const [seats, setSeats] = useState<number[]>([]);

  useEffect(() => {
    getSeatsData();
  });

  const getSeatsData = async () => {
    let seatsBiden = await usElectionContract.seats(BIDEN);
    let seatsTrump = await usElectionContract.seats(TRUMP);
    setSeats([seatsBiden, seatsTrump]);
  }

  if (seats.length == 2) {
    return <div className="center">
      <table>
        <tr>
          <th>Candidate</th>
          <th>Seats</th>
        </tr>
        <tr>
          <td>Biden</td>
          <td>{seats[0]}</td>
        </tr>
        <tr>
          <td>Trump</td>
          <td>{seats[1]}</td>
        </tr>
      </table>
    </div>
  }
  else {
    return <></>
  }
}