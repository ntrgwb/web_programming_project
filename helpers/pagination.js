module.exports = (objectPagination, query, countProuducts) => {
    if(query.page){
        objectPagination.currentPage = parseInt(query.page);
    }

    objectPagination.skip = (objectPagination.currentPage - 1) * objectPagination.limitItems;

    const totaPage = Math.ceil(countProuducts / objectPagination.limitItems);

    objectPagination.totaPage = totaPage;
    return objectPagination;
}