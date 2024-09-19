async function loadMenuData() {
    try {
        const response = await fetch('/menu.json'); // Updated to match your server endpoint
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const menuData = await response.json();
        return menuData;
    } catch (error) {
        console.error('Error loading menu data:', error);
        return { items: [] }; // Return an empty menu if there's an error
    }
}

async function showMenu(section) {
    const menuData = await loadMenuData();
    const filteredItems = menuData.items.filter(item => item.section === section);
    const menuItemsDiv = document.getElementById('menu-items');

    if (menuItemsDiv) {
        menuItemsDiv.innerHTML = '';

        const categories = {};
        filteredItems.forEach(item => {
            const category = item.category || '';
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push(item);
        });

        for (const category in categories) {
            if (category) {
                const categoryTitle = document.createElement('h2');
                categoryTitle.className = 'text-xl font-bold mt-8 mb-4';
                categoryTitle.textContent = category;
                menuItemsDiv.appendChild(categoryTitle);
            }

            categories[category].forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'item flex justify-between p-4 bg-white rounded-lg shadow-md mb-2';
                itemDiv.innerHTML = `
                    <span>${item.name}</span>
                    <span>$${item.price.toFixed(2)}</span>
                `;
                menuItemsDiv.appendChild(itemDiv);
            });
        }
    }
}

async function loadEditableMenu() {
    const menuData = await loadMenuData();
    const editMenu = document.getElementById('edit-menu');

    if (editMenu) {
        editMenu.innerHTML = '';

        const sections = {};
        menuData.items.forEach(item => {
            if (!sections[item.section]) {
                sections[item.section] = [];
            }
            sections[item.section].push(item);
        });

        for (const section in sections) {
            const sectionDiv = document.createElement('div');
            sectionDiv.className = 'section mb-6';

            const sectionTitle = document.createElement('h2');
            sectionTitle.className = 'text-2xl font-bold mt-8 mb-4';
            sectionTitle.textContent = section;
            sectionDiv.appendChild(sectionTitle);

            sections[section].forEach(item => {
                const editItem = document.createElement('div');
                editItem.className = 'edit-item flex items-center space-x-4 p-4 bg-white rounded-lg shadow-md mb-2';
                editItem.innerHTML = `
                    <input type="text" id="name-${item.id}" value="${item.name}" class="w-full border border-gray-300 p-2 rounded">
                    <input type="number" id="price-${item.id}" value="${item.price}" step="0.01" class="w-24 border border-gray-300 p-2 rounded">
                    <select id="section-${item.id}" class="w-32 border border-gray-300 p-2 rounded">
                        <option value="Topli napitci / Hot drinks" ${item.section === 'Topli napitci / Hot drinks' ? 'selected' : ''}>Topli napitci / Hot drinks</option>
                        <option value="Bezalkoholna pića / Non alcoholic drinks" ${item.section === 'Bezalkoholna pića / Non alcoholic drinks' ? 'selected' : ''}>Bezalkoholna pića / Non alcoholic drinks</option>
                        <option value="Domaća alkoholna pića / Domestic alcoholic drinks" ${item.section === 'Domaća alkoholna pića / Domestic alcoholic drinks' ? 'selected' : ''}>Domaća alkoholna pića / Domestic alcoholic drinks</option>
                        <option value="Pivo" ${item.section === 'Pivo' ? 'selected' : ''}>Pivo</option>
                        <option value="Specijalno" ${item.section === 'Specijalno' ? 'selected' : ''}>Specijalno</option>
                        <option value="Strana alkoholna pića / Foreign alcoholic drinks" ${item.section === 'Strana alkoholna pića / Foreign alcoholic drinks' ? 'selected' : ''}>Strana alkoholna pića / Foreign alcoholic drinks</option>
                        <option value="Vino / Wine" ${item.section === 'Vino / Wine' ? 'selected' : ''}>Vino / Wine</option>
                    </select>
                    <input type="text" id="category-${item.id}" value="${item.category || ''}" placeholder="Category" class="w-full border border-gray-300 p-2 rounded">
                    <button onclick="deleteItem('${item.id}')" class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">Delete</button>
                `;
                sectionDiv.appendChild(editItem);
            });

            editMenu.appendChild(sectionDiv);
        }
    }
}

async function saveChanges() {
    const items = [];
    const editItems = document.querySelectorAll('.edit-item');

    editItems.forEach(editItem => {
        const id = editItem.querySelector('input[type="text"]').id.split('-')[1];
        const name = document.getElementById(`name-${id}`).value;
        const price = parseFloat(document.getElementById(`price-${id}`).value);
        const section = document.getElementById(`section-${id}`).value;
        const category = document.getElementById(`category-${id}`).value;

        if (name && !isNaN(price)) {
            items.push({ id, name, price, section, category });
        }
    });

    const menuData = { items };

    try {
        const response = await fetch('/menu.json', { // Updated to match your server endpoint
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(menuData),
        });

        if (!response.ok) {
            throw new Error('Failed to save menu data');
        }

        alert('Menu updated successfully.');
    } catch (error) {
        console.error('Error saving changes:', error);
        alert('Failed to save changes.');
    }
}

async function addNewItem() {
    const name = document.getElementById('new-item-name').value;
    const price = parseFloat(document.getElementById('new-item-price').value);
    const section = document.getElementById('new-item-section').value;
    const category = document.getElementById('new-item-category').value;

    if (!name || isNaN(price)) {
        alert('Please provide valid name and price.');
        return;
    }

    const id = Date.now().toString();
    const newItem = { id, name, price, section, category };

    try {
        const response = await fetch('../../.netlify/functions/update-menu.js', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newItem),
        });

        if (!response.ok) {
            throw new Error('Failed to save new item');
        }

        alert('Item added successfully.');
        loadEditableMenu(); // Reload menu to show new item
    } catch (error) {
        console.error('Error adding new item:', error);
        alert('Failed to add new item.');
    }
}

async function deleteItem(id) {
    const menuData = await loadMenuData();
    menuData.items = menuData.items.filter(item => item.id !== id);

    try {
        const response = await fetch('/menu.json', { // Updated to match your server endpoint
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(menuData),
        });

        if (!response.ok) {
            throw new Error('Failed to delete item');
        }

        alert('Item deleted successfully.');
        loadEditableMenu(); // Reload menu to remove deleted item
    } catch (error) {
        console.error('Error deleting item:', error);
        alert('Failed to delete item.');
    }
}
