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


var collectedObjects = null


chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {
        if (message.type === "collectObjects") {
            chrome.tabs.query(
                {
                    active: true, 
                    currentWindow: true 
                }, 
                async (tabs) => {    
                    const browser = await connect({
                        transport: await ExtensionTransport.connectTab(tabs[0].id),
                        defaultViewport: null,
                    });
                    const [page] = await browser.pages()

                    var objects = []
                    for (let i = 0; i < message.urls.length; i++) {
                        await page.goto(message.urls[i])

                        var obj = {}
                        for (var selector in selector_to_input) {
                            await page.waitForSelector(selector_to_input[selector])
                            obj[selector] = await page.$eval(selector_to_input[selector], get_value_from_input)
                        }

                        for (var func_selection in function_fields) {
                            obj[func_selection] = await function_fields[func_selection](page)
                        }
                        console.log(obj)
                        objects.push(obj)
                    }

                    for (let i = 9; i < message.urls.length; i++) {
                        await page.goBack()
                    }

                    collectedObjects = objects
                    
                    await browser.disconnect()

                    return true
                }
            )
        } else if (message.type === "getObjects") {
            if (collectedObjects === null) {
                sendResponse()
            } else {
                sendResponse(
                    {
                        collected: collectedObjects
                    }
                )

                collectedObjects = null
            }
        }
        return true
    }
)
