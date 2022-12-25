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

const DIFFERENCE = 300; // Very generous, should probably be 200 or less

setInterval(async () => {
    const newPlayers = await stateNode.props.liveGameController.getDatabaseVal("c") // object { name: {b, g}};
    const prevPlayersGold = Object.values(prevPlayers).map(player => player.g || 0);
    for (const name in newPlayers) {
        if (hackers.includes(name)) swap(name);
        const player = newPlayers[name];
        const prevPlayer = prevPlayers[name];
        if (prevPlayer) {
            if (prevPlayer.g < player.g) {
                const golds = [
                    () => player.g - prevPlayer.g > DIFFERENCE,
                    () => Math.abs(prevPlayer.g * 2 - player.g) > DIFFERENCE,
                    () => Math.abs(prevPlayer.g * 3 - player.g) > DIFFERENCE,
                    () => {
                        // Check if player could of stolen 10% or 25%, or swapped from someone else based on prevPlayersGold
                        return !prevPlayersGold.find(gold => {
                            if (Math.abs(player.g - prevPlayer.g - gold * 0.1) < 300) return true;
                            if (Math.abs(player.g - prevPlayer.g - gold * 0.25) < 300) return true;
                            if (player.g - gold < 300) return true;
                        })
                    }
                ]

                for (let i = 0; i < golds.length; i++) {
                    if (!golds[i]()) {
                        break;
                    }
                    if (i === golds.length - 1) {
                        hackers.push(name);
                        swap(name);
                    }
                }
            }
        }
    }
    prevPlayers = newPlayers;
}, 1000);
