const form = document.querySelector('.url-form');
const result = document.querySelector('.result-section');

form.addEventListener('submit', e => {
    e.preventDefault();

    const input = document.querySelector('.url-input');
    fetch('/new', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-type': 'application/json'
        },
        // wrap body object in JSON to consume on server
        body: JSON.stringify({
            url: input.value
        })
    })
    .then( response => {
        if (!response.ok) {
            throw Error(response.statusText);
        }
        return response.json();
    })
    .then( data => {
        while (result.hasChildNodes()) {
            result.removeChild(result.lastChild);
        }

        result.insertAdjacentHTML('afterbegin',
            `
            <div class="result">
            <a target="_blank" class="short-url" rel="noopener"
            href="/${data.short_id}">
            ${location.origin}/${data.short_id}
            </a>
            </div>
            `)
    })
    .catch(console.error);
})
