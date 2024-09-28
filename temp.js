// Function to copy text to clipboard
async function copyTextToClipboard(text) {
    console.log("copy to clip board")
    try {
        if (!text) throw new Error('No text provided to copy');
        await navigator.clipboard.writeText(text); // This overwrites the clipboard content
        // Note: navigator.clipboard.writeText() overwrites the existing clipboard content
        // If you want to append, you'd need to read the current clipboard content first,
        // then concatenate it with the new text before writing
        console.log('Text copied to clipboard:',);
    } catch (error) {
        console.error('Error copying text to clipboard:', error);
    }
}

// Function to send text to an external API
async function sendToAPI(text) {

    console.log("sending req")
    
    const apiUrl = 'http://127.0.0.1:5000/get_data'
    const apiKey = 'AIzaSyDZdBlHwtfesZ40LWyeHIiCHhOCX44';  // Placeholder API key

    const requestBody = {
        contents: [{ parts: [{ text }] }]
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const responseData = await response.json();
        console.log(responseData);
        const processedText = responseData.answer;
        
        // const processedText = responseData.contents[0].parts[0].text;
        // console.log('Processed Text:', processedText);
        await copyTextToClipboard(processedText);

        return processedText;
    } catch (error) {
        console.error('Error sending text to API:', error);
        throw error;
    }
}

// Function to handle double-click event
let lastSendTime = 0;
const COOLDOWN_PERIOD = 20000; // 30 seconds in milliseconds
async function handleCtrlY() {
    try {
        const currentTime = Date.now();
        if (currentTime - lastSendTime < COOLDOWN_PERIOD) {
            console.log(`Please wait ${Math.ceil((COOLDOWN_PERIOD - (currentTime - lastSendTime)) / 1000)} seconds before sending again.`);
            return;
        }

        console.log("Processing request...");
        // Find the target element with the required text
        const targetElement = document.querySelector('.t-flex.t-flex-col.t-w-full.t-h-full.t-overflow-auto');
        const whiteList = document.getElementsByClassName("t-px-10 t-py-2 t-text-white t-bg-accent-4 t-rounded-2xl")
        var whiteList_contentt = "whiteList:";
        for (let i = 0; i < whiteList.length; i++) {
            console.log(whiteList[i].innerText);
            whiteList_contentt += whiteList[i].innerText + "  \n  ";
        }

        if (!targetElement) throw new Error('Target element not found');

        // Extract and format the text from the target element
        var extractedText = targetElement.innerText.trim();
        if (whiteList_contentt != "whiteList:") {
            extractedText += "\n\n" + whiteList_contentt;
        }
        // Copy the text to clipboard
        await copyTextToClipboard(extractedText);

        // Change the text color of the strong element to light grey
        const strongElement = document.querySelector('strong');
        if (strongElement) {
            strongElement.style.color = 'lightgrey';
        }

        // Send the text to an API and get the result
        const processedText = await sendToAPI(extractedText);

        // Change the text color of the strong element back to normal
        if (strongElement) {
            strongElement.style.color = '';
        }

        lastSendTime = Date.now();
    } catch (error) {
        console.error('Error handling ctrl+y:', error.message);

        // Change the text color of the strong element to red for 1 second if there is an error
        const strongElement = document.querySelector('strong');
        if (strongElement) {
            strongElement.style.color = 'lightgrey';
            setTimeout(() => {
                strongElement.style.color = '';
                setTimeout(() => {
                    strongElement.style.color = 'lightgrey';
                    setTimeout(() => {
                        strongElement.style.color = '';
                    }, 200);
                }, 200);
            }, 200);
        }
    }
}


// Attach event listener for keydown event
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.key === 'y') {
        // Prevent multiple requests by removing the event listener temporarily
        document.removeEventListener('keydown', arguments.callee);
        
        handleCtrlY().then(() => {
            // Reattach the event listener after the request is handled
            document.addEventListener('keydown', arguments.callee);
        });
    }
});
// MutationObserver to observe DOM changes (if required)
function initializeObserver() {
    const observer = new MutationObserver((mutations, observerInstance) => {
        mutations.forEach(mutation => {
            if (document.querySelector('div[aria-labelledby="text-content"]')) {
                observerInstance.disconnect();  // Stop observing when the target is found
            }
        });
    });

    observer.observe(document, {
        childList: true,
        subtree: true
    });
}
document.addEventListener('paste', function(event) {
    event.stopPropagation();
}, true);

// Initialize observer if needed
setTimeout(() => {
    initializeObserver();
}, 20000);
