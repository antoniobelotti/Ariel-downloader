var download_doc_trigger = document.getElementById("document_download_trigger");
var download_video_trigger = document.getElementById("video_download_trigger");


function send_command(command) {
    chrome.tabs.query({ currentWindow: true, active: true },
        (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { "message": command });
        }
    );
}

download_doc_trigger.addEventListener("click", () => { send_command("download_documents") })
download_video_trigger.addEventListener("click", () => { send_command("download_videos") })


document.addEventListener("DOMContentLoaded", function() {
    // when the extension popup DOM loads ...

    chrome.tabs.query({ active: true, currentWindow: true },
        (tabs) => {
            chrome.runtime.onConnect.addListener(function(port) {
                console.assert(port.name == "progress_channel");
                document.getElementById("progress_bar_div").hidden = false

                port.onMessage.addListener((msg) => {
                    if (msg.error == undefined) {
                        var bar = document.getElementById("progress_bar")
                        bar.setAttribute("value", bar.value + msg.increase_by)
                    } else {
                        clean_progress_bar()
                        document.getElementById("error_container").hidden = false
                        document.getElementById("error_txt").innerText = msg.error
                        setTimeout(function() {
                            document.getElementById("error_container").hidden = true
                        }, 2000);
                    }
                });

                port.onDisconnect.addListener(() => {
                    clean_progress_bar(1500)
                });
            });


            if (!isArielDomain(tabs[0].url)) {
                document.getElementById("error_content").hidden = false;
                document.getElementById("document_download_trigger").hidden = true;
                document.getElementById("video_download_trigger").hidden = true;
                document.getElementById("header").style.opacity = 0.5
            } else {
                document.getElementById("error_content").hidden = true;
                document.getElementById("document_download_trigger").hidden = false;
                document.getElementById("video_download_trigger").hidden = false;
                document.getElementById("header").style.opacity = 200
            }
        });

});


function clean_progress_bar(delay = 0) {
    setTimeout(function() {
        document.getElementById("progress_bar").value = 0
        document.getElementById("progress_bar_div").hidden = true
    }, delay);

}

// https://stackoverflow.com/questions/8498592/extract-hostname-name-from-string
function isArielDomain(url) {
    var hostname;

    //find & remove protocol (http, ftp, etc.) and get hostname
    if (url.indexOf("//") > -1) {
        hostname = url.split('/')[2];
    } else {
        hostname = url.split('/')[0];
    }

    expr = /[^a-z]*.ariel.ctu.unimi.it/;
    return expr.test(hostname) ? true : false;
}