import {Button, Frog, TextInput} from 'frog'
import {devtools} from 'frog/dev'
import {serveStatic} from 'frog/serve-static'
import axios from "axios";
import {sleep} from "bun";

// import { neynar } from 'frog/hubs'

const SERVER = "http://localhost:3069";

export const app = new Frog({
    imageOptions: {
        width: 200,
        height: 200,
    },
    imageAspectRatio: "1:1",
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
                display: 'flex'
            }}>
                <p style={{textAlign: 'center', color: 'white'}}>Warp plays pocket monsters :tm: lol</p>
            </div>
        ),
        intents: [
            <Button action="/game">Play</Button>
        ]
    })
})

const getMove = async (stringValue: string|undefined) => {
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
            <TextInput placeholder={"move: u,d,l,r,a,b,start,sel"}/>,
            <Button action="/game">Submit</Button>,
            <Button value="refresh">↺</Button>,
            <Button.Reset>Back</Button.Reset>
        ],
    })
})

app.use('/*', serveStatic({root: './public'}))
devtools(app, {serveStatic})

if (typeof Bun !== 'undefined') {
    Bun.serve({
        fetch: app.fetch,
        port: 3000,
    })
    console.log('Server is running on port 3000')
}
