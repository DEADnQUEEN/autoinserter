import {
  connect,
  ExtensionTransport,
} from '../../node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core-browser.js';

import {
    return_to,
    selector_to_input,
    start_json_from
} from "./constants.js"

import {
    get_value_from_input,
    function_fields,
    parse_bau_search,
    compress_to_url,
} from "./functions.js"


var collectedObjects = null
var collected_filter = null

const active_sessions = {}

async function get_browser(tab_id) {
    var created = active_sessions[tab_id] === undefined
    if (active_sessions[tab_id] === undefined) {
        active_sessions[tab_id] = await connect({
            transport: await ExtensionTransport.connectTab(tab_id),
            defaultViewport: null,
        });
    } else {
        active_sessions[tab_id] = active_sessions[tab_id]
    }

    return [active_sessions[tab_id], created]
}


chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {
        if (message.type === "collectObjects") {
            chrome.tabs.query(
                {
                    active: true, 
                    currentWindow: true 
                }, 
                async (tabs) => {
                    const [browser, _] = await get_browser(tabs[0].id)
                    const [page] = await browser.pages()
                    var window_from = await page.evaluate(() => {return window.location.href})

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

                        objects.push(obj)
                    }

                    collectedObjects = objects

                    if (collected_filter === null || collected_filter === undefined) {
                        await page.goto(window_from)
                    } else {
                        await page.goto(return_to + start_json_from + collected_filter)
                    }

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

            chrome.tabs.query(
                {
                    active: true, 
                    currentWindow: true 
                }, 
                async (tabs) => {
                    const [browser, created] = await get_browser(tabs[0].id)
                    const [page] = await browser.pages()

                    if (!created) {
                        return true
                    }

                    await page.setRequestInterception(true)

                    page.on(
                        "request",
                        async (request) => {
                            if (request.url().includes(start_json_from)) {
                                collected_filter = request.url().slice(request.url().search(start_json_from) + start_json_from.length)
                            }

                            if (!request.url().startsWith('https://baucrm.ithead.ru/sbm/furasm_qry.php')) {
                                request.continue()
                                return
                            }

                            if (request.method() !== 'POST') {
                                request.continue()
                                return
                            }

                            var parsed = parse_bau_search(await request.fetchPostData())
                            collected_filter = compress_to_url(parsed)
                            
                            request.continue()
                        }
                    )
                }
            )
        } else if (message.type === "export_to_excel") {     
            chrome.runtime.sendNativeMessage(
                "com.python.export_excel",
                {
                    
                },
                (response) => {
                    if (chrome.runtime.lastError) {
                        console.error("Ошибка при общении с нативным приложением:", chrome.runtime.lastError.message);
                        sendResponse({ error: chrome.runtime.lastError.message });
                    } else {
                        console.log("r", response)
                        sendResponse()
                    }
                }
            );
        }
        return true
    }
)
