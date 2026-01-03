module.exports = (query) => {
    let objectSearch = {
        keyword: "",
        regex: ""
    }

    if(query.keyword){

        objectSearch.keyword = query.keyword

        const re = new RegExp(objectSearch.keyword, "i");
        objectSearch.regex = re;
    }

    return objectSearch;
}
