const getReactHandler = () => {
    return Object.values(document.querySelector("#app > div > div"))[1].children[0]._owner
}

const reactHandler = getReactHandler();
const stateNode = reactHandler.stateNode;

const swap = (user) => stateNode.props.liveGameController.setVal({
    path: "c/".concat(stateNode.props.client.name),
    val: {
        b: `${user} hacked the game. Please report this to the host.`,
        tat: "".concat(user, ":swap:").concat("0")
    }
})
const hackers = [];
let prevPlayers = {};
let prevPlayersDifference = {};

const MOST_GAINED_PER_QUESTION = 25;
const DIFFERENCE = 300; // Same as gold rush, similarly it should probably be lower

let interval = setInterval(async () => {
    const newPlayers = await stateNode.props.liveGameController.getDatabaseVal("c") // object { name: {b, t}};
    const prevPlayersGift = Object.values(prevPlayers).map(player => player.t || 0);
    for (const name in newPlayers) {
        if (hackers.includes(name)) swap(name);
        const player = newPlayers[name];
        const prevPlayer = prevPlayers[name];
        if (prevPlayer) {
            if (prevPlayer.t < player.t && prevPlayersDifference[name] !== undefined) {
                const prevIncrease = prevPlayersDifference[name];
                const gifts = [
                    () => player.t - prevPlayer.t > prevIncrease + MOST_GAINED_PER_QUESTION + DIFFERENCE,
                    () => player.t - prevPlayer.t > (prevIncrease + MOST_GAINED_PER_QUESTION + DIFFERENCE) * 2,
                    () => player.t - prevPlayer.t > (prevIncrease + MOST_GAINED_PER_QUESTION + DIFFERENCE) * 3,
                    () => Math.abs(prevPlayer.t * 2 - player.t) > prevIncrease + MOST_GAINED_PER_QUESTION + DIFFERENCE,
                    () => Math.abs(prevPlayer.t * 3 - player.t) > prevIncrease + MOST_GAINED_PER_QUESTION + DIFFERENCE,
                    () => {
                        // Check if player could of stolen 10% or 25%, or swapped from someone else based on prevPlayersGift
                        return !prevPlayersGift.find(gift => {
                            if (Math.abs(player.t - prevPlayer.t - gift * 0.1) < DIFFERENCE) return true;
                            if (Math.abs(player.t - prevPlayer.t - gift * 0.25) < DIFFERENCE) return true;
                            if (player.t - gift < DIFFERENCE) return true;
                        })
                    }
                ]

                for (let i = 0; i < gifts.length; i++) {
                    if (!gifts[i]()) {
                        break;
                    }
                    if (i === gifts.length - 1) {
                        hackers.push(name);
                        swap(name);
                    }
                }
            }
            if (prevPlayer.t < player.t) {
                prevPlayersDifference[name] = player.t - prevPlayer.t;
            }
        }
    }
    prevPlayers = newPlayers;
}, 1000);
