import {Button, Frog, TextInput} from 'frog'
import {devtools} from 'frog/dev'
import {serveStatic} from 'frog/serve-static'
import axios from "axios";
import {env, sleep} from "bun";
import {PinataFDK} from "pinata-fdk"
import {pinata} from "frog/hubs";

// import { neynar } from 'frog/hubs'

const SERVER = "http://localhost:3069";

const FDK = new PinataFDK({
    pinata_jwt: env.PINATA_JWT!!,
    pinata_gateway: env.PINATA_GATEWAY!!
});

export const app = new Frog({
    origin: "https://pocket.mempool.online",
    imageOptions: {
        width: 200,
        height: 200,
    },
    imageAspectRatio: "1:1",
    hub: pinata(),
    verify: true,
    // Supply a Hub to enable frame verification.
    // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' }),
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
    if (inputText) {
        await sleep(1500);
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
            <Button.Reset>Back</Button.Reset>
        ],
    })
})

app.use('/*', serveStatic({root: './public'}))
app.use("/", FDK.analyticsMiddleware({ frameId: "warp_monsters"}));
devtools(app, {serveStatic})

if (typeof Bun !== 'undefined') {
    Bun.serve({
        fetch: app.fetch,
        port: 3000,
    })
    console.log('Server is running on port 3000')
}
