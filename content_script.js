DOCUMENTS_CSS_LINK_CLASS = "cmd filename"
VIDEOS_CSS_LINK_CLASS = "lecturecVideo"

chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        if (request.message === "download_documents") {
            downloads_list = extract_documents_links()
        } else if (request.message === "download_videos") {
            downloads_list = extract_video_links()
        }

        if (downloads_list.length == 0) {
            subject = request.message.split("_")[1]
            progress_channel = chrome.runtime.connect({ name: "progress_channel" });
            progress_channel.postMessage({ error: `No ${subject} to download. Try refresh the page` })
            progress_channel.disconnect()
        } else {
            // sent data to background_script
            chrome.runtime.sendMessage(downloads_list);
        }
    }
);


function extract_documents_links() {
    var all_links = document.getElementsByClassName(DOCUMENTS_CSS_LINK_CLASS);

    downloads_list = []
    for (let i = 0; i < all_links.length; i++) {
        let filename = all_links[i].childNodes[1].wholeText;
        downloads_list.push({
            url: all_links[i].href,
            filename: filename
        })
    }

    return downloads_list
}

function extract_video_links() {
    var all_links = document.getElementsByTagName("source");

    downloads_list = []
    for (let i = 0; i < all_links.length; i++) {

        let video_url = all_links[i].src;
        video_name = video_url.split("/")
        video_name = video_name[video_name.length - 1]

        downloads_list.push({
            url: video_url,
            filename: video_name
        });
    }
    return downloads_list
}