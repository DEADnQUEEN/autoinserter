function waitForElm(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                observer.disconnect();
                resolve(document.querySelector(selector));
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}


waitForElm(
    '#fi1 > div.AddCrit > div.contBtnMap > div'
).then(
    async (elm) => {
        var response = await chrome.runtime.sendMessage({type: "getObjects"})

        if (response !== null) {
            exportJsonToExcel(response.collected)
        }
        
        let el = elm.cloneNode(true)
        el.querySelector("span").textContent = "Скачать"

        el.onclick = async () => {
            let rows = document.querySelectorAll("a[href^='order.php?&mode=modal&id_order=']")
            
            var urls = []
            for (let i = 0; i < rows.length; i++) {
                var url = rows[i].href
                urls.push(url)
            }

            await chrome.runtime.sendMessage({type: "collectObjects", urls: urls})
        }

        elm.parentNode.appendChild(el)
    }
);
