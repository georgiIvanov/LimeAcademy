import { expect } from 'chai';
import { ethers } from 'hardhat';
import { USElection, USElection__factory } from '../typechain-types';

describe('USElection', () => {
  let usElectionFactory: USElection__factory;
  let usElection: USElection;

  before(async () => {
    usElectionFactory = await ethers.getContractFactory('USElection');
    usElection = await usElectionFactory.deploy();
    await usElection.deployed();
  });

  it('Should return the current leader before submitting results', async () => {
    expect(await usElection.currentLeader()).to.equal(0);
  });

  it('Should return the election status', async () => {
    expect(await usElection.electionEnded()).to.equal(false);
  });

  it("Should submit state results and get current leader", async () => {
    const stateResults: USElection.StateResultStruct = {
      name: "California", votesBiden: 1000, votesTrump: 900, stateSeats: 32
    };
    const submitStateResultsTx = await usElection.submitStateResult(stateResults);
    expect(await usElection.currentLeader()).to.equal(1);
  });

  it("Should throw when try to submit already submitted state results", async () => {
    const stateResults: USElection.StateResultStruct = {
      name: "California", votesBiden: 1000, votesTrump: 900, stateSeats: 32
    };
    expect(usElection.submitStateResult(stateResults))
    .to.be.revertedWith('This state result was already submitted!');
  });

  it("Should submit state results and get current leader", async () => {
    const stateResults: USElection.StateResultStruct = {
      name: "Ohaio", votesBiden: 800, votesTrump: 1200, stateSeats: 33
    };
    const submitStateResultsTx = await usElection.submitStateResult(stateResults);
    expect(await usElection.currentLeader()).to.equal(2);
  });

  it("Should end the elections, get the leader and election status", async () => {
    await usElection.endElection();
    expect(await usElection.currentLeader()).to.equal(2);
    expect(await usElection.electionEnded()).to.equal(true);
  });
})