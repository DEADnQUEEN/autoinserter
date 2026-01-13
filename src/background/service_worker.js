import {
  connect,
  ExtensionTransport,
} from '../../node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core-browser.js';

import {
    selector_to_input
} from "./constants.js"

import {
    get_value_from_input,
    function_fields
} from "./functions.js"


var browser = null

async function open_url(url, tab) {
    if (browser === null || browser === undefined) {
        if (tab === null || tab === undefined) {
            throw "Exception"
        }
        browser = await connect({
            transport: await ExtensionTransport.connectTab(tab),
            defaultViewport: null,
        });
    }

    const [page] = await browser.pages()

    await page.goto(url)

    return page
}

chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {
        if (message.type === "bau_url") {
            chrome.tabs.query(
                {
                    active: true, 
                    currentWindow: true 
                }, 
                async (tabs) => {
                    let page = null

                    for (let i = 0; i < message.urls.length; i++) {
                        page = await open_url(message.urls[i], tabs[0].id, browser)

                        var obj = {}
                        for (var selector in selector_to_input) {
                            await page.waitForSelector(selector_to_input[selector])
                            obj[selector] = await page.$eval(selector_to_input[selector], get_value_from_input)
                        }

                        for (var func_selection in function_fields) {
                            obj[func_selection] = await function_fields[func_selection](page)
                        }
                    }
                    await open_url(message.return_to, tabs[0].id, browser)

                    sendResponse(
                        {
                            response: "ready",
                        }
                    )
                    return true
                }
            )
        } else if (message.type === "set_url") {
            chrome.tabs.query(
                {
                    
                },
                async (tabs) => {
                    await open_url(message.urls[i], tabs[0].id, browser)
                    
                }
            )
        }
        return true
    }
)
