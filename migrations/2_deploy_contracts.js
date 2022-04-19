const Tether = artifacts.require('Tether');
const RWD = artifacts.require('RWD');
const PlayBank = artifacts.require('PlayBank');

module.exports = async function (deployer, network, accounts) {
    // Deploy Mock Tether Contract
    await deployer.deploy(Tether);
    const tether = await Tether.deployed();

    // Deploy RWD Contract
    await deployer.deploy(RWD);
    const rwd = await RWD.deployed();

    // Deploy PlayBank Contract
    await deployer.deploy(PlayBank, rwd.address, tether.address);
    const playBank = await PlayBank.deployed();

    // Transfer all RWD tokens to PlayBank
    await rwd.transfer(playBank.address, '1000000000000000000000000');

    // Distribute 100 Tether tokens to investor
    await tether.transfer(accounts[1], '100000000000000000000')
};