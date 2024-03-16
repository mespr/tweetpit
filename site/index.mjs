/**
 *
 */
onload = async () =>{
    let entryPost = document.querySelector('#entry-post');
    let entryStatus = document.querySelector('#entry-status');
    let entrySend = document.querySelector('#entry-send');
    let featured = document.querySelector('#featured');
    entryPost.setAttribute('maxlength','256');
    let statusDefault = "Please avoid profanity"
    entryStatus.innerHTML = statusDefault;

    entryPost.addEventListener('input',(e) =>{
        entryStatus.innerHTML = `${entryPost.value.length} of ${entryPost.getAttribute('maxlength')}`;
    });

    entrySend.addEventListener('click',async (e) =>{
        await API.post('/post',{text:entryPost.value});
        entryPost.value = '';
        entryStatus.innerHTML = statusDefault;
    });
    await updateFeature();

    async function updateFeature() {
        let result = await API.get('/featured');
        featured.innerHTML = result.body;
        setTimeout(updateFeature,5000);
    }
}


class API {
    static async get(path,options={},format="json") {
        if (path.charAt(0) !== '/') path = '/'+path;
        options.credentials = 'include';
        let response = await fetch(path,options);
        if (response.ok) {
            return response.status===204?{}:await response[format]();
        } else {
            let e = new Error(`failed to fetch ${path}`);
            e.status = response.status;
            e.response = await response.text();
            throw(e);
        }
    }
    static async post(path,body) {
        if (path.charAt(0) !== '/') path = '/'+path;
        let options = {method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)};
        let response = await fetch(path,options);
        if (response.ok) {
            return response.status===204?{}:await response.json();
        } else {
            let e = new Error(`failed update ${path}`);
            e.status = response.status;
            try {e.response = await response.json()} catch(e) {e.response = response.statusText}
            throw(e);
        }
    }
    static async remove(path) {
        if (path.charAt(0) !== '/') path = '/'+path;
        let options = {method:'DELETE',credentials:'include',headers:{'Content-Type':'application/json'}};
        let response = await fetch(path,options);
        if (!response.ok) {
            let e = new Error(`failed remove ${path}`);
            e.status = response.status;
            e.response = await response.text();
            throw(e);
        }
    }
}

