const express = require('express')
const bodyParser = require('body-parser')
const {WebhookClient} = require('dialogflow-fulfillment');
const axios = require('axios');
const BACKEND_HOST_URL = 'https://calm-beach-69260.herokuapp.com/'

const app = express()
app.use(bodyParser.json())
const port = process.env.PORT || 4000

var intentMap = new Map();
var endpointMap = new Map();

function addToEndpointMap(endpointName, endpoint) {
    endpoint.set(endpointName, endpoint);
}

function addToIntentMap(intentName, intentHandler) {
    intentMap.set(intentName, intentHandler);
}

async function handleIntent(agent) {
    console.log('inside handle request');
    // console.log(`CONSOLE MSGS: ${JSON.stringify(agent.consoleMessages)}`);
    tempParams = agent.parameters;

    if (tempParams != undefined) {
        if ("aadhar-card" in tempParams)
        {
            aadhar_card = String(tempParams["aadhar-card"]);
            console.log(`We found aadhar-card: ${aadhar_card}`);
            if (aadhar_card.length != 12) {
                console.log("Not Proper Length")
                agent.add([{
                    "text": "Please Enter Valid 12 digit Aadhar Number."
                }])
                return;
            }
            else if (!(/^\d+$/.test(aadhar_card))) {
                console.log("No characters allowed");
                agent.add([{
                    "text": "Aadhar Number cannot contain any characters."
                }])
                return;
            }
        }
    }

    data = {
        'intentName': agent.intent,
        'parameters': agent.parameters,
        'session': agent.session
    }
    
    console.log(JSON.stringify(data));

    try {
        resp = await axios.post(BACKEND_HOST_URL + 'api/webhook', data);
        console.log(`Resp from BACKEND = ${JSON.stringify(resp.data)}`);    
    } catch (error) {
        console.log(`failure from backend`);
    }
    agent.add(agent.consoleMessages);
}

addToIntentMap("Schedule Appointment", handleIntent);

app.post('/dialogflow-fulfillment', (request, response) => {
    dialogflowFulfillment(request, response);
})

app.get('/test-page', (req, res) => {
    console.log('testing')
    res.json({'Test':'success'});
});

const dialogflowFulfillment = (request, response) => {
    const agent = new WebhookClient({request, response})
    console.log('webhook client created');
    const intentNameFromAgent = agent.intent;
    addToIntentMap(intentNameFromAgent , handleIntent);
    agent.handleRequest(intentMap)
}


app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})