const express = require('express');
const connector = require('./mongo-connector');

const {
    createCallAtomic,
    createCallNormal,
    finishCall,
} = require('./handle-call');

const app = express();

app.post('/jobs-atomic', async (req, res) => {
    try {
        const userName = "Duy";
        res.send('ok');
        const canCall = await createCallAtomic(userName);
        if (!canCall) {
            return;
        }
        // simulate call in 10s
        await new Promise(res => setTimeout(() => res(), 5000));

        await finishCall(userName);
    } catch (error) {
        console.error(error);
        res.status(500).send('failed');
    }
});

app.post('/jobs-normal', async (req, res) => {
    try {
        const userName = "Duy";
        res.send('ok');
        const canCall = await createCallNormal(userName);
        if (!canCall) {
            return;
        }
        // simulate call in 10s
        await new Promise(res => setTimeout(() => res(), 5000));

        await finishCall(userName);
    } catch (error) {
        console.error(error);
        res.status(500).send('failed');
    }
})

connector().then(() => {
    app.listen(3000, () => {
        console.log('server started at port 3000');
    });
}).catch(err => {
    console.error(err);
    process.exit(1);
});
