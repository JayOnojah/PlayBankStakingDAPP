import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
    ClockIcon,
    CreditCardIcon,
    HomeIcon,
    XIcon,
    CalculatorIcon,
    RefreshIcon,
    ArrowCircleRightIcon,
} from '@heroicons/react/outline';
import Web3 from 'web3';
import smartTruncate from 'smart-truncate';
import CurrencyFormat from 'react-currency-format';
import Noty from "noty";
import '../../node_modules/noty/lib/noty.css';
import '../../node_modules/noty/lib/themes/mint.css';

import RWD from '../truffle_abis/RWD.json';
import Tether from '../truffle_abis/Tether.json';
import PlayBank from '../truffle_abis/PlayBank.json';

import logo from '../images/play-bank.svg';

const navigation = [
    { name: 'Dashboard', href: '#', icon: HomeIcon, current: true },
    { name: 'Account', href: '#', icon: ClockIcon, current: false },
    { name: 'Calculator', href: '#', icon: CalculatorIcon, current: false },
    { name: 'Buy Tokens', href: '#', icon: CreditCardIcon, current: false },
    { name: 'Swap', href: '#', icon: RefreshIcon, current: false },
];

const secondaryNavigation = [
    { name: 'Facebook', href: '#', icon: ArrowCircleRightIcon },
    { name: 'Twitter', href: '#', icon: ArrowCircleRightIcon },
    { name: 'Discord', href: '#', icon: ArrowCircleRightIcon },
];

const statusStyles = {
    success: 'bg-green-100 text-green-800',
    processing: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-gray-100 text-gray-800',
}

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

const Dashboard = () => {

    useEffect(() => {
        loadBlockchainData();
        checkAccount();
    }, []);


    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [account, setAccount] = useState(null);
    let [web3, setWeb3] = useState(null)
    const [tether, setTether] = useState({});

    const [rwd, setRwd] = useState({});
    const [playBank, setPlayBank] = useState({});
    const [tetherBalance, setTetherBalance] = useState("0");
    const [rwdBalance, setRwdBalance] = useState("0");
    const [stakingBalance, setStakingBalance] = useState("0");
    const [loading, setLoading] = useState(true);

    // Invoke to Connect to wallet account
    async function activate() {
        if (window.ethereum) {
            try {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                checkAccount();
            } catch (err) {
                console.log("User did not add account...", err);
            }
        } else if (window.web3) {
            window.web3 = new Web3(window.web3.currentProvider);
        } else {
            new Noty({
                type: 'error',
                text: 'Your Ethereum Wallet is not Connected!',
                timeout: 5000,
                progressBar: true
            }).show();
        }
    }

    // Invoke to check if account is already connected
    async function checkAccount() {
        let web3 = new Web3(window.ethereum);
        setWeb3(web3);
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);
    }

    async function loadBlockchainData() {
        try {
            const web3 = new Web3(window.ethereum);
            const networkId = await web3.eth.net.getId();

            // Load mUSDT Contract
            const tetherData = Tether.networks[networkId];

            if (tetherData) {
                const tether = new web3.eth.Contract(Tether.abi, tetherData.address);
                setTether(tether);
                let tetherBalance = await tether.methods.balanceOf(account).call();
                setTetherBalance(tetherBalance.toString());
            } else {
                new Noty({
                    type: 'error',
                    text: 'Your Ethereum Wallet is not Connected!',
                    timeout: 5000,
                    progressBar: true
                }).show();
            }

            // Load RWD Contract
            const rwdData = RWD.networks[networkId];

            if (rwdData) {
                const rwd = new web3.eth.Contract(RWD.abi, rwdData.address);
                setRwd(rwd);
                let rwdBalance = await rwd.methods.balanceOf(account).call();
                setRwdBalance(rwdBalance.toString());
            } else {
                new Noty({
                    type: 'error',
                    text: 'Your Ethereum Wallet is not Connected!',
                    timeout: 5000,
                    progressBar: true
                }).show();
            }

            // Load PlayBank Contract
            const playBankData = PlayBank.networks[networkId];

            if (playBankData) {
                const playBank = new web3.eth.Contract(PlayBank.abi, playBankData.address);
                setPlayBank(playBank);
                let stakingBalance = await playBank.methods.stakingBalance(account).call();
                setStakingBalance(stakingBalance.toString());
            } else {
                new Noty({
                    type: 'error',
                    text: 'Your Ethereum Wallet is not Connected!',
                    timeout: 5000,
                    progressBar: true
                }).show();
            }

            setLoading(false);
        } catch (err) {
            console.log("Error: ", err)
        }
    }

    let content;

    {
        loading ? content = (
            <div className="text-center">
                <svg role="status" className="inline mr-2 w-10 h-10 text-gray-200 animate-spin dark:text-gray-600 fill-gray-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                </svg>
            </div>
        ) : content = (
            <div className="mt-2 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-2">
                {/* Dashboard Cards */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-400" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" >
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="mt-3 ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total Earnings</dt>
                                    <dd>
                                        <div className="text-4xl font-medium py-2 mt-2 text-gray-900">
                                            <CurrencyFormat
                                                value="54,923.72"
                                                decimalSeperator="."
                                                decimalScale={2}
                                                fixedDecimalScale={true}
                                                displayType={'text'}
                                                thousandSeparator={true}
                                                renderText={(value) => (
                                                    <span className="font-semibold"> {value} <span className="text-lg text-cyan-700">RWD</span></span>
                                                )}
                                            />
                                        </div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-5 py-3">
                        <div className="text-sm">
                            <a href="/" className="font-medium text-blue-700 hover:text-cyan-900">
                                WITHDRAW
                            </a>
                        </div>
                    </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-400" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" >
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="mt-3 ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">mUST Balance</dt>
                                    <dd>
                                        <div className="text-4xl font-medium py-2 mt-2 text-gray-900">
                                            <CurrencyFormat
                                                value={tetherBalance}
                                                decimalSeperator="."
                                                decimalScale={2}
                                                fixedDecimalScale={true}
                                                displayType={'text'}
                                                thousandSeparator={true}
                                                renderText={(value) => (
                                                    <span className="font-semibold"> {value} <span className="text-lg text-cyan-700">mUSDT</span></span>
                                                )}
                                            />
                                        </div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-5 py-3">
                        <div className="text-sm">
                            <a href="/" className="font-medium text-green-700 hover:text-cyan-900">
                                DEPOSIT
                            </a>
                        </div>
                    </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-400" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" >
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="mt-3 ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">RWD Balance</dt>
                                    <dd>
                                        <div className="text-4xl font-medium py-2 mt-2 marker:mt-2 text-gray-900">
                                            <CurrencyFormat
                                                value="22469.4567"
                                                decimalSeperator="."
                                                decimalScale={2}
                                                fixedDecimalScale={true}
                                                displayType={'text'}
                                                thousandSeparator={true}
                                                renderText={(value) => (
                                                    <span className="font-semibold"> {value} <span className="text-lg text-cyan-700">RWD</span></span>
                                                )}
                                            />
                                        </div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-5 py-3">
                        <div className="text-sm my-3.5">
                            <button
                                type="button"
                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 w-98"
                            >
                                Buy Tokens
                            </button>
                        </div>
                    </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div>
                            <label htmlFor="name" className="ml-px block text-md font-medium text-gray-500 mt-5 mb-4">
                                Enter Amount to Stake
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    className="shadow-sm focus:ring-cyan-600 focus:border-cyan-600 border-2 block w-full sm:text-sm border-gray-300 px-4 rounded-md"
                                    placeholder="Enter amount of tokens..."
                                />
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-5 py-3">
                        <div className="text-sm my-3">
                            <button
                                type="button"
                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Stake Tokens
                            </button>
                        </div>
                    </div>
                </div>
                {/* End Dashboard Cards */}
            </div>
        )
    }

    return (
        <>
            <div className="min-h-full">
                <Transition.Root show={sidebarOpen} as={Fragment}>
                    <Dialog as="div" className="fixed inset-0 flex z-40 lg:hidden" onClose={setSidebarOpen}>
                        <Transition.Child
                            as={Fragment}
                            enter="transition-opacity ease-linear duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="transition-opacity ease-linear duration-300"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <Dialog.Overlay className="fixed inset-0 bg-gray-600 bg-opacity-75" />
                        </Transition.Child>
                        <Transition.Child
                            as={Fragment}
                            enter="transition ease-in-out duration-300 transform"
                            enterFrom="-translate-x-full"
                            enterTo="translate-x-0"
                            leave="transition ease-in-out duration-300 transform"
                            leaveFrom="translate-x-0"
                            leaveTo="-translate-x-full"
                        >
                            <div className="relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-cyan-700">
                                <Transition.Child
                                    as={Fragment}
                                    enter="ease-in-out duration-300"
                                    enterFrom="opacity-0"
                                    enterTo="opacity-100"
                                    leave="ease-in-out duration-300"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                >
                                    <div className="absolute top-0 right-0 -mr-12 pt-2">
                                        <button
                                            type="button"
                                            className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                                            onClick={() => setSidebarOpen(false)}
                                        >
                                            <span className="sr-only">Close sidebar</span>
                                            <XIcon className="h-6 w-6 text-white" aria-hidden="true" />
                                        </button>
                                    </div>
                                </Transition.Child>
                                <div className="flex-shrink-0 flex items-center px-4">
                                    <img
                                        className="h-8 w-auto"
                                        src={logo}
                                        alt="Play Bank Logo"
                                    />
                                </div>
                                <nav
                                    className="mt-5 flex-shrink-0 h-full divide-y divide-cyan-800 overflow-y-auto"
                                    aria-label="Sidebar"
                                >
                                    <div className="px-2 space-y-1">
                                        {navigation.map((item) => (
                                            <a
                                                key={item.name}
                                                href={item.href}
                                                className={classNames(
                                                    item.current ? 'bg-cyan-800 text-white' : 'text-cyan-100 hover:text-white hover:bg-cyan-600',
                                                    'group flex items-center px-2 py-2 text-base font-medium rounded-md'
                                                )}
                                                aria-current={item.current ? 'page' : undefined}
                                            >
                                                <item.icon className="mr-4 flex-shrink-0 h-6 w-6 text-cyan-200" aria-hidden="true" />
                                                {item.name}
                                            </a>
                                        ))}
                                    </div>
                                    <div className="mt-6 pt-6">
                                        <div className="px-2 space-y-1">
                                            {secondaryNavigation.map((item) => (
                                                <a
                                                    key={item.name}
                                                    href={item.href}
                                                    className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-cyan-100 hover:text-white hover:bg-cyan-600"
                                                >
                                                    <item.icon className="mr-4 h-6 w-6 text-cyan-200" aria-hidden="true" />
                                                    {item.name}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                </nav>
                            </div>
                        </Transition.Child>
                        <div className="flex-shrink-0 w-14" aria-hidden="true">
                            {/* Dummy element to force sidebar to shrink to fit close icon */}
                        </div>
                    </Dialog>
                </Transition.Root>

                {/* Static sidebar for desktop */}
                <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
                    {/* Sidebar component, swap this element with another sidebar if you like */}
                    <div className="flex flex-col flex-grow bg-cyan-700 pt-5 pb-4 overflow-y-auto">
                        <div className="flex items-center flex-shrink-0 px-4">
                            <img
                                className="h-8 w-auto"
                                src={logo}
                                alt="Play Bank Logo"
                            />
                        </div>
                        <nav className="mt-10 flex-1 flex flex-col divide-y divide-cyan-800 overflow-y-auto" aria-label="Sidebar">
                            <div className="px-2 space-y-1">
                                {navigation.map((item) => (
                                    <a
                                        key={item.name}
                                        href={item.href}
                                        className={classNames(
                                            item.current ? 'bg-cyan-800 text-white' : 'text-cyan-100 hover:text-white hover:bg-cyan-600',
                                            'group flex items-center px-2 py-3 text-xl leading-6 font-medium rounded-md'
                                        )}
                                        aria-current={item.current ? 'page' : undefined}
                                    >
                                        <item.icon className="mr-4 flex-shrink-0 h-7 w-7 text-cyan-200" aria-hidden="true" />
                                        {item.name}
                                    </a>
                                ))}
                            </div>
                            <div className="mt-6 pt-6">
                                <div className="px-2 space-y-1">
                                    {secondaryNavigation.map((item) => (
                                        <a
                                            key={item.name}
                                            href={item.href}
                                            className="group flex items-center px-2 py-3 my-3 text-xl leading-6 font-medium rounded-md text-cyan-100 hover:text-white hover:bg-cyan-600"
                                        >
                                            <item.icon className="mr-4 h-7 w-7 text-cyan-200" aria-hidden="true" />
                                            {item.name}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </nav>
                    </div>
                </div>

                <div className="lg:pl-64 flex flex-col flex-1">

                    <main className="flex-1 pb-8">
                        {/* Page header */}
                        <div className="bg-white shadow">
                            <div className="px-4 sm:px-6 lg:max-w-6xl lg:mx-auto lg:px-8">
                                <div className="py-6 md:flex md:items-center md:justify-between lg:border-t lg:border-gray-200">
                                    <div className="flex-1 min-w-0">
                                        {/* Profile */}
                                        <div className="flex items-center">
                                            <div>
                                                <div className="flex items-center">
                                                    <h1 className="ml-3 text-3xl font-bold leading-7 text-gray-900 sm:leading-9 sm:truncate">
                                                        Dashboard
                                                    </h1>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-6 flex space-x-3 md:mt-0 md:ml-4">
                                        <div
                                            type="button"
                                            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 cursor-pointer"
                                        >
                                            <div className="mr-2 w-2 h-2 bg-green-500 rounded-full"></div> {smartTruncate(account, 11, { position: 5 })}
                                        </div>
                                        <button
                                            type="button"
                                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                                        >
                                            Connect Wallet
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8">
                            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                                <h2 className="text-lg leading-6 font-medium text-gray-900 my-6 ml-2">Overview</h2>
                                {content}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    )
}

export default Dashboard;