const AIRTABLE_BASE_ID = "appz6a0uRGlALNl2B";
const AIRTABLE_TABLE_NAME = "Contacts";
const AIRTABLE_API_KEY = "patsXcS1Y2T3uXPWj.2ad1f91c9da253ddacbd86407d69b1bac467709239c03cf0950e57194a6854dd"; // Solo si aun usas API keys

async function fetchContacts() {
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;
    
    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${AIRTABLE_API_KEY}`
        }
    });

    const data = await response.json();
    return data.records.map(record => record.fields);
}

async function buildPhoneBook() {
    const contacts = await fetchContacts();
    const phoneBookContainer = document.getElementById("phonebook");

    contacts.forEach(contact => {
        const category = contact.Category || "Uncategorized";
        const subcategory = contact.Subcategory || "Others";
        const name = contact.Name;
        const phone = contact.Phone;

        let categoryElement = document.querySelector(`[data-category="${category}"]`);
        if (!categoryElement) {
            categoryElement = document.createElement("div");
            categoryElement.dataset.category = category;
            categoryElement.innerHTML = `<h3>${category}</h3><ul></ul>`;
            phoneBookContainer.appendChild(categoryElement);
        }

        let subcategoryList = categoryElement.querySelector("ul");
        let subcategoryElement = subcategoryList.querySelector(`[data-subcategory="${subcategory}"]`);
        if (!subcategoryElement) {
            subcategoryElement = document.createElement("li");
            subcategoryElement.dataset.subcategory = subcategory;
            subcategoryElement.innerHTML = `<strong>${subcategory}</strong><ul></ul>`;
            subcategoryList.appendChild(subcategoryElement);
        }

        const contactItem = document.createElement("li");
        contactItem.textContent = `${name} - ${phone}`;
        subcategoryElement.querySelector("ul").appendChild(contactItem);
    });
}

buildPhoneBook();