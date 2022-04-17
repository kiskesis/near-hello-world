import 'regenerator-runtime/runtime'
import React, {useEffect, useState} from 'react'
import {login, logout} from './utils'
import './global.css'

import getConfig from './config'

const {networkId} = getConfig(process.env.NODE_ENV || 'development')

export default function App() {
    const [greeting, setGreeting] = useState('')
    const [name, setName] = useState('')
    const [inputName, setInputName] = useState('')
    const [inputDisabled, setInputDisabled] = useState(false)

    // when the user has not yet interacted with the form, disable the button
    const [buttonDisabled, setButtonDisabled] = useState(true)

    // after submitting the form, we want to show Notification
    const [showNotification, setShowNotification] = useState(false)

    useEffect(
        () => {
            if (window.walletConnection.isSignedIn()) {
                window.contract.get_greeting({account_id: window.accountId})
                    .then(greetingFromContract => {
                        setGreeting(greetingFromContract)
                    })

                window.contract.get_name({account_id: window.accountId})
                    .then(nameFromContract => {
                        setName(nameFromContract)
                    })
            }
        },
        []
    )

    useEffect(() => {
        setInputName(name)
    }, [name])

    const handleChangeName = (e) => {
        setInputName(e.target.value)
        setButtonDisabled(e.target.value === name)
    }

    const onClick = async () => {
        // get elements from the form using their id attribute
        // const {fieldset, greeting} = event.target.elements

        // hold onto new user-entered value from React's SynthenticEvent for use after `await` call
        // disable the form while the value gets updated on-chain
        setInputDisabled(true)

        try {
            // make an update call to the smart contract
            const changedGreetings = await window.contract.set_name({
                // pass the value that the user entered in the greeting field
                name: inputName
            })
            setGreeting(changedGreetings)
        } catch (e) {
            alert(
                'Something went wrong! ' +
                'Maybe you need to sign out and back in? ' +
                'Check your browser console for more info.'
            )
            throw e
        } finally {
            // re-enable the form, whether the call succeeded or failed
            setInputDisabled(false)
        }

        // update local `greeting` variable to match persisted value
        setName(inputName)

        // show Notification
        setShowNotification(true)

        // remove Notification again after css animation completes
        // this allows it to be shown again next time the form is submitted
        setTimeout(() => {
            setShowNotification(false)
        }, 11000)
    }

    console.log('greeting', greeting);

    if (!window.walletConnection.isSignedIn()) {
        return (
            <main>
                <h1>Welcome to NEAR!</h1>
                <p>
                    To make use of the NEAR blockchain, you need to sign in. The button
                    below will sign you in using NEAR Wallet.
                </p>
                <p>
                    By default, when your app runs in "development" mode, it connects
                    to a test network ("testnet") wallet. This works just like the main
                    network ("mainnet") wallet, but the NEAR Tokens on testnet aren't
                    convertible to other currencies – they're just for testing!
                </p>
                <p>
                    Go ahead and click the button below to try it out:
                </p>
                <p style={{textAlign: 'center', marginTop: '2.5em'}}>
                    <button onClick={login}>Sign in</button>
                </p>
            </main>
        )
    }

    return (
        <>
            <button
                className="link"
                style={{float: 'right'}}
                onClick={logout}
            >
                Sign out
            </button>
            <main>
                <h1>
                    <label
                        htmlFor="greeting"
                    >
                        {greeting}
                    </label>
                </h1>
                <label
                    htmlFor="greeting"
                    style={{
                        display: 'block',
                        color: 'var(--gray)',
                        marginBottom: '0.5em'
                    }}
                >
                    Change name
                </label>
                <div style={{display: 'flex'}}>
                    <input
                        autoComplete="off"
                        value={inputName}
                        id="greeting"
                        onChange={e => handleChangeName(e)}
                        style={{flex: 1}}
                        disabled={inputDisabled}
                    />
                    <button
                        disabled={buttonDisabled || inputDisabled}
                        onClick={onClick}
                        style={{borderRadius: '0 5px 5px 0'}}
                    >
                        Save
                    </button>
                </div>
                {/*<p>*/}
                {/*  Look at that! A Hello World app! This greeting is stored on the NEAR blockchain. Check it out:*/}
                {/*</p>*/}
                {/*<ol>*/}
                {/*  <li>*/}
                {/*    Look in <code>src/App.js</code> and <code>src/utils.js</code> – you'll see <code>get_greeting</code> and <code>set_greeting</code> being called on <code>contract</code>. What's this?*/}
                {/*  </li>*/}
                {/*  <li>*/}
                {/*    Ultimately, this <code>contract</code> code is defined in <code>assembly/main.ts</code> – this is the source code for your <a target="_blank" rel="noreferrer" href="https://docs.near.org/docs/develop/contracts/overview">smart contract</a>.</li>*/}
                {/*  <li>*/}
                {/*    When you run <code>yarn dev</code>, the code in <code>assembly/main.ts</code> gets deployed to the NEAR testnet. You can see how this happens by looking in <code>package.json</code> at the <code>scripts</code> section to find the <code>dev</code> command.</li>*/}
                {/*</ol>*/}
                {/*<hr />*/}
                {/*<p>*/}
                {/*  To keep learning, check out <a target="_blank" rel="noreferrer" href="https://docs.near.org">the NEAR docs</a> or look through some <a target="_blank" rel="noreferrer" href="https://examples.near.org">example apps</a>.*/}
                {/*</p>*/}
            </main>
            {showNotification && <Notification />}
        </>
    )
}

// this component gets rendered by App after the form is submitted
function Notification() {
    const urlPrefix = `https://explorer.${networkId}.near.org/accounts`
    return (
        <aside>
            <a
                target="_blank"
                rel="noreferrer"
                href={`${urlPrefix}/${window.accountId}`}
            >
                {window.accountId}
            </a>
            {' '/* React trims whitespace around tags; insert literal space character when needed */}
            called method: 'set_name' in contract:
            {' '}
            <a
                target="_blank"
                rel="noreferrer"
                href={`${urlPrefix}/${window.contract.contractId}`}
            >
                {window.contract.contractId}
            </a>
            <footer>
                <div>✔ Succeeded</div>
                <div>Just now</div>
            </footer>
        </aside>
    )
}
