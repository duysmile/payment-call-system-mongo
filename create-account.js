const connect = require('./mongo-connector');

const main = async () => {
    try {
        await connect();

        const AccountModel = require('./account');
        await AccountModel.create({
           name: "Duy",
           balance: 200,
           estimate: 0,
        });

        console.log('DONE');
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

main();
