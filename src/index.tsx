import {Button, Frog, parseEther, TextInput} from 'frog'
import axios from "axios";
import {env, sleep} from "bun";
import {PinataFDK} from "pinata-fdk"
import {pinata} from "frog/hubs";

// import { neynar } from 'frog/hubs'

const SERVER = env.SERVER!!;

const fdk = new PinataFDK({
    pinata_jwt: env.PINATA_JWT!!,
    pinata_gateway: env.PINATA_GATEWAY!!
});

export const app = new Frog({
    origin: "https://pocket.mempool.online",
    imageOptions: {
        format: "png",
        width: 200,
        height: 200,
    },
    imageAspectRatio: "1:1",
    hub: pinata(),
    verify: true,
    secret: env.SECRET,
    // Supply a Hub to enable frame verification.
    // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' }),
}).use("/", fdk.analyticsMiddleware({ frameId: "warp_monsters", customId: "warp_custom" }));

app.transaction("/send-ether", (c) => {
    const { inputText } = c;
    const decimals = 6;
    const num = Number(inputText!!) * (10**decimals);
    const number = BigInt(num);
    return c.send({
        abi: erc20Abi,
        functionName: 'transfer',
        args: [ env.DONATION!! as `0x${string}`, number ],
        value: 0n,
        to: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
        chainId: "eip155:8453"
    })
});

app.frame("/donate", (c) => {
    return c.res({
        image: (
            <div style={{
                width: 200,
                height: 200,
                background: "#8963d2",
                display: 'flex',
                flexDirection: "column",
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
                <p style={{
                    height: "10px",
                    textAlign: 'center',
                    color: 'white',
                    fontSize: "2em",
                }}>Donate ETH on Base to help me build more :)</p>
            </div>
        ),
        intents: [
            <TextInput placeholder={"5 USDC"}/>,
            <Button action="/send-ether">DONATE</Button>
        ]
    })
})

app.frame("/", (c) => {
    return c.res({
        image: (
            <div style={{
                width: 200,
                height: 200,
                background: "#8963d2",
                display: 'flex',
                flexDirection: "column",
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
                <p style={{
                    height: "10px",
                    textAlign: 'center',
                    color: 'white',
                    fontSize: "0.4em",
                }}>WarpMonsters: Play Pokemon Blue together</p>
                <div style={{
                    display: 'flex',
                    boxShadow: "2px 3px",
                    width: 160,
                    height: 144,
                    backgroundImage: `url('${SERVER}/buffer?cache${Date.now()}')`
                }}/>
                <p style={{
                    height: "10px"
                }}/>
            </div>
        ),
        intents: [
            <Button action="/game">Play</Button>
        ]
    })
})

const getMove = async (stringValue: string | undefined) => {
    if (!stringValue) return undefined;
    let matched: string | undefined;
    let s = stringValue.toLowerCase();
    if (s === "up" || s === "u") {
        matched = "U";
    } else if (s === "down" || s === "d") {
        matched = "D";
    } else if (s === "left" || s === "l") {
        matched = "L";
    } else if (s === "right" || s === "r") {
        matched = "R";
    } else if (s === "a") {
        matched = "A";
    } else if (s === "b") {
        matched = "B";
    } else if (s === "start" || s === "star") {
        matched = "START";
    } else if (s === "sel" || s === "select") {
        matched = "SEL";
    } else {
        matched = undefined;
    }
    if (matched) {
        await axios.post(`${SERVER}/move`, {
            "input": matched
        });
    }
}

app.frame('/game', async (c) => {
    const {buttonValue, inputText, status} = c

    await getMove(inputText);
    if (inputText && !buttonValue) {
//	await new Promise(r => setTimeout(r, 200));
        await sleep(300);
    }

    return c.res({
        image: (
            <div style={{
                background: '#8963d2',
                display: 'flex',
                width: 200,
                height: 200,
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <div style={{
                    display: 'flex',
                    boxShadow: "2px 3px",
                    width: 160,
                    height:144,
                    backgroundImage: `url('${SERVER}/buffer?cache${Date.now()}')`
                }}/>
            </div>
        ),
        intents: [
            <TextInput placeholder={"input: U,D,L,R,A,B,START,SEL"}/>,
            <Button action="/game">Submit</Button>,
            <Button value="refresh">↺</Button>,
            <Button action="/">Back</Button>
        ],
    })
})

//app.use('/*', serveStatic({root: './public'}));
//devtools(app, {serveStatic})

if (typeof Bun !== 'undefined') {
    Bun.serve({
        fetch: app.fetch,
        port: 3069,
    })
    console.log('Server is running on port 3069')
}


const erc20Abi = [{"inputs":[{"internalType":"address","name":"implementationContract","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"previousAdmin","type":"address"},{"indexed":false,"internalType":"address","name":"newAdmin","type":"address"}],"name":"AdminChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"implementation","type":"address"}],"name":"Upgraded","type":"event"},{"stateMutability":"payable","type":"fallback"},{"inputs":[],"name":"admin","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newAdmin","type":"address"}],"name":"changeAdmin","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"implementation","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newImplementation","type":"address"}],"name":"upgradeTo","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newImplementation","type":"address"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"upgradeToAndCall","outputs":[],"stateMutability":"payable","type":"function"}] as const;
