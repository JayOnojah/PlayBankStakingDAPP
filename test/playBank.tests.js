const RWD = artifacts.require('RWD');
const Tether = artifacts.require('Tether');
const PlayBank = artifacts.require('PlayBank');

require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('PlayBank', ([owner, customer]) => {
    let tether, rwd, playBank;

    function tokens(number) {
        return web3.utils.toWei(number, 'ether');
    }

    before(async () => {
        // Load Contracts
        tether = await Tether.new();
        rwd = await RWD.new();
        playBank = await PlayBank.new(rwd.address, tether.address);

        // Transfer all tokens to PlayBank (1 million)
        await rwd.transfer(playBank.address, tokens('1000000'));

        // Transfer 100 mUSDT to Customer
        await tether.transfer(customer, tokens('100'), { from: owner });
    })

    describe('Mock Tether Deployment', async () => {
        it('mathces name successfully', async () => {
            const name = await tether.name();
            assert.equal(name, 'Mock Tether Token');
        });
    });

    describe('Reward Token Deployment', async () => {
        it('mathces name successfully', async () => {
            const name = await rwd.name();
            assert.equal(name, 'Reward Token');
        });
    });

    describe('Play Bank Deployment', async () => {
        it('mathces name successfully', async () => {
            const name = await playBank.name();
            assert.equal(name, 'Play Bank');
        });

        it('contract has tokens', async () => {
            let balance = await rwd.balanceOf(playBank.address);
            assert.equal(balance, tokens('1000000'));
        });

        describe('Yield Farming', async () => {
            it('rewards tokens for staking', async () => {
                let result;

                // Check Investor Balance
                result = await tether.balanceOf(customer);
                assert.equal(result.toString(), tokens('100'), 'Customer mock wallet before staking');

                // Check Staking for Customer of 100 tokens
                await tether.approve(playBank.address, tokens('100'), { from: customer });
                await playBank.depositTokens(tokens('100'), { from: customer });

                // Check Updated Balance of Customer
                result = await tether.balanceOf(customer);
                assert.equal(result.toString(), tokens('0'), 'Customer mock wallet after staking 100 tokens');

                // Check Updated Balance of Play Bank
                result = await tether.balanceOf(playBank.address);
                assert.equal(result.toString(), tokens('100'), 'Play Bank mock wallet after staking from Customer');

                // Is Staking Update
                result = await playBank.isStaking(customer);
                assert.equal(result.toString(), 'true', 'Customer is staking status after staking');

                // Issue Tokens
                await playBank.issueTokens({ from: owner });

                // Ensure only the Owner can issue tokens
                await playBank.issueTokens({ from: customer }).should.be.rejected;

                // Unstake Tokens
                await playBank.unstakeTokens({ from: customer });

                // Check Unstaking Balances
                result = await tether.balanceOf(customer);
                assert.equal(result.toString(), tokens('100'), 'Customer mock wallet balance after unstaking 100 tokens');

                // Check Updated Balance of Play Bank
                result = await tether.balanceOf(playBank.address);
                assert.equal(result.toString(), tokens('0'), 'Play Bank mock wallet after staking from Customer');

                // Is Staking Balance
                result = await playBank.isStaking(customer);
                assert.equal(result.toString(), 'false', 'Customer is no longer staking after unstaking');
            });
        });
    });
});