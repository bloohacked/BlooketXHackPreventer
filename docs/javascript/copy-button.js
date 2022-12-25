let code

(async () => {
    code = await (await fetch("https://raw.githubusercontent.com/hostedposted/BlooketXHackPreventer/master/bookmarklet.txt")).text()
})()

document.getElementById("copy-button").addEventListener("click", () => {
    if (!code) {
        document.getElementById("copy-button").innerText = "Please try again soon!"
    }
    navigator.clipboard.writeText(code).then(() => {
        const oldText = document.getElementById("copy-button").innerText
        document.getElementById("copy-button").innerText = "Copied!"
        setTimeout(() => {
            document.getElementById("copy-button").innerText = oldText
        }, 1000)
    }).catch(() => {
        const oldText = document.getElementById("copy-button").innerText
        document.getElementById("copy-button").innerText = "Failed!"
        setTimeout(() => {
            document.getElementById("copy-button").innerText = oldText
        }, 1000)
    })
})
