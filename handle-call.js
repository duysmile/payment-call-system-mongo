const AccountModel = require("./account");

let currentCalls = 0;
let estimate = 0;
const costEstimatePerCall = 10;

exports.createCallAtomic = async (userName) => {
    const nUpdate = await AccountModel.updateOne({
        name: userName,
        $where: `function() {
            return this.balance >= this.estimate + ${costEstimatePerCall};
        }`,
    }, {
        $inc: { estimate: costEstimatePerCall },
    });

    if (nUpdate.nModified == 0) {
        return false;
    }

    currentCalls += 1;
    console.log('START: current calls:', currentCalls);
    return true;
};

exports.createCallNormal = async (userName) => {
    const account = await AccountModel.findOne({
        name: userName,
    });

    if (account.estimate + costEstimatePerCall > account.balance) {
        return false;
    }

    currentCalls += 1;
    console.log('START: current calls:', currentCalls);
    await AccountModel.updateOne({
        name: userName,
    }, {
        $inc: { estimate: costEstimatePerCall },
    });
    return true
}

exports.finishCall = async (userName) => {
    await AccountModel.updateOne({
        name: userName,
    }, {
        $inc: {
            estimate: -costEstimatePerCall,
            balance: -costEstimatePerCall,
        },
    });

    currentCalls -= 1;
    console.log('FINISH: current calls:', currentCalls);
};
