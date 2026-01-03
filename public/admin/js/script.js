// Button Status
const buttonsStatus = document.querySelectorAll("[button-status]");
if (buttonsStatus.length > 0) {
    let url = new URL(window.location.href);
    buttonsStatus.forEach(button => {
        button.addEventListener("click", () => {
            const status = button.getAttribute("button-status");

            if(status) {
                url.searchParams.set("status", status);
            }
            else {
                url.searchParams.delete("status");
            }

            console.log(url.href);
            window.location.href = url.href;
        })
    });
}
// End Button Status


// Form Search
const formSearch = document.querySelector("#form-search");
if (formSearch) {
    let url = new URL(window.location.href);

    formSearch.addEventListener("submit", (e) => {

        const keyword = e.target.elements.keyword.value

        // console.log(e.target.elements.keyword.value);
        
        e.preventDefault();

        if(keyword) {
                url.searchParams.set("keyword", keyword);
            }
        else {
            url.searchParams.delete("keyword");
        }

        window.location.href = url.href;
    });
}
// End Form Search


// pagination
const buttonsPagination = document.querySelectorAll("[button-pagination]");
if (buttonsPagination) {
    let url = new URL(window.location.href);
    buttonsPagination.forEach(button => {
        button.addEventListener("click", () => {
            const page = button.getAttribute("button-pagination");
            url.searchParams.set("page", page);
            window.location.href = url.href;
        })
    })
}

// End Pagination

// Checkbox Multi
const checkboxMulti = document.querySelector("[checkbox-multi]");
if (checkboxMulti) {

    const inputCheckAll = checkboxMulti.querySelector("input[name='checkall']");
    const inputsId = checkboxMulti.querySelectorAll("input[name='ids']");

    inputCheckAll.addEventListener("click", () => {
        // console.log(inputCheckAll.checked)
        if (inputCheckAll.checked) {
            inputsId.forEach(input => input.checked = true);
        }
        else {
            inputsId.forEach(input => input.checked = false);
        }
    });

    inputsId.forEach(input => {
        input.addEventListener("click", () => {
            const countChecked = checkboxMulti.querySelectorAll("input[name='ids']:checked").length;
            if (countChecked === inputsId.length) {
                inputCheckAll.checked = true;
            }
            else {
                inputCheckAll.checked = false;
            }
        });
    })
}   
// End Checkbox Multi

// Form Change Multi
const formChangeMulti = document.querySelector("[form-change-multi]");
if (formChangeMulti) {
    formChangeMulti.addEventListener("submit", (e) => {
        e.preventDefault();
        const checkboxMulti = document.querySelector("[checkbox-multi]");
        const inputChecked = checkboxMulti.querySelectorAll("input[name='ids']:checked");

        const typeChange = e.target.elements.type.value;

        if (typeChange === "delete-all") {
            const isConfirm = confirm("Bạn có chắc chắn muốn xóa các bản ghi đã chọn không ?");

            if (!isConfirm) return;
        }

        console.log(typeChange);

        if (inputChecked.length > 0) {
            let ids = [];
            const inputIds = formChangeMulti.querySelector("input[name='ids']");
            inputChecked.forEach(input => {
                const id = input.value;

                if(typeChange === "change-position") {
                    const position = input 
                    .closest("tr")
                    .querySelector("input[name='position']").value;

                    console.log(`${id}-${position}`);

                    ids.push(`${id}-${position}`);
                }
                else {
                    ids.push(id);
                }
                
            });

            inputIds.value = ids.join(", ");

            formChangeMulti.submit();
        }
        else {
            alert("Vui long chon it nhat 1 ban ghi");
        }

        formChangeMulti

    })

}
// End Form Change Multi

// Show Alert
const showAlerts = document.querySelector("[show-alert]");
if (showAlerts) {
    const time = parseInt(showAlerts.getAttribute("data-time"));

    const closeAlert = showAlerts.querySelector("[close-alert]");

    setTimeout(() => {

        showAlerts.classList.add("alert-hidden");

    }, time);

    closeAlert.addEventListener("click", () => {
        showAlerts.classList.add("alert-hidden");
    })
}
// End Show Alert

// Upload Image
const uploadImage = document.querySelector("[upload-image]");
if (uploadImage) {
    const uploadImageInput = uploadImage.querySelector("[upload-image-input]");
    const uploadImagePreview = uploadImage.querySelector("[upload-image-preview]");

    uploadImageInput.addEventListener("change", (e) => {
        console.log(e);
        const file = e.target.files[0];
        if (file) {
            uploadImagePreview.src = URL.createObjectURL(file);
        }
    })
}
// End Upload Image

// Sort
const sort = document.querySelector("[sort]");
if(sort) {
    let url = new URL(window.location.href)
    const sortselect = sort.querySelector("[sort-select");
    const sortClear = sort.querySelector("[sort-clear");

    sortselect.addEventListener("change", (e) => {
        const value = e.target.value;
        console.log(value.split("-")); //split bien 1 string thanh 1 mang
        const [sortKey, sortValue] = value.split("-");
        url.searchParams.set("sortKey", sortKey)
        url.searchParams.set("sortValue", sortValue)

        window.location.href = url.href;
    })

    sortClear.addEventListener("click", () => {
        url.searchParams.delete("sortKey");
        url.searchParams.delete("sortValue");

        window.location.href = url.href;

    })

    // Them selected cho option
    const sortKey = url.searchParams.get("sortKey");
    const sortValue = url.searchParams.get("sortValue");
    if (sortKey && sortValue ){
        const stingSort = `${sortKey}-${sortValue}`;
        const optionSelected = sortselect.querySelector(`option[value='${stingSort}']`)
        optionSelected.selected = true;
    }

}
// End Sort