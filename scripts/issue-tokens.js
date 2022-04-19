const PlayBank = artifacts.require('PlayBank');

module.exports = async function issueRewards(callback) {
    let playBank = await PlayBank.deployed();
    await playBank.issueTokens();
    console.log('Tokens have been issued successfully!');
    callback();
}