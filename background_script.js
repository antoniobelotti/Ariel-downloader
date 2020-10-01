var progress_channel = undefined
var download_size = -1

chrome.runtime.onMessage.addListener(
    (request) => {
        progress_channel = chrome.runtime.connect({ name: "progress_channel" });
        download_size = request.length

        for (idx in request) {
            chrome.downloads.download({
                saveAs: false,
                url: request[idx].url,
                conflictAction: 'overwrite',
                filename: request[idx].filename
            }, (dl_item_id) => {
                if (dl_item_id == undefined) {
                    progress_channel.postMessage({ error: "Unable to start download" })
                }
            })
        }
    }
);

const done = (downloadItem) => { return downloadItem.state != "in_progress" }

chrome.downloads.onChanged.addListener((downloadDelta) => {
    if (downloadDelta.state == undefined) { return }

    if (downloadDelta.state.current == "complete") {
        progress_channel.postMessage({ increase_by: 100 / download_size });
    } else if (downloadDelta.state.current == "interrupted") {
        progress_channel.postMessage({ error: "Download stopped" })
    }

    chrome.downloads.search({
        orderBy: ['-startTime'],
        limit: download_size
    }, (results) => {
        if (results.every(done)) {
            progress_channel.disconnect()
            progress_channel = undefined
            download_size = -1
        }
    })
})