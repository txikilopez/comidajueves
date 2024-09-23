// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAQrFaYCDWUpz-zhQOcC6ZW7h7k6wY5R_c",
    authDomain: "sucenajueves.firebaseapp.com",
    databaseURL: "https://sucenajueves-default-rtdb.firebaseio.com",
    projectId: "sucenajueves",
    storageBucket: "sucenajueves.appspot.com",
    messagingSenderId: "682575630359",
    appId: "1:682575630359:web:06797b3ebae65d6fb48c52",
    measurementId: "G-9YB85L46TL"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const fixedRoster = [
    'Zelada', 'Campano', 'Carra', 'Deivid', 'Jorge R', 'Fruta', 
    'Flaco', 'Diego Campos', 'Fralo', 'Sama', 'Tom', 'Zurba', 'Kinast', 'Lucas', 'ATL'
];

let columns = ['Lomits', 'Rishtedar'];

// Function to render the table
function renderTable() {
    const tableBody = document.getElementById('confirmation-table');
    const tableHead = document.querySelector('thead tr');
    
    tableBody.innerHTML = '';
    tableHead.innerHTML = '<th>Nombre</th><th>Lomits</th><th>Rishtedar</th>'; // Clear previous headers except for baseline

    // Add extra restaurant headers
    columns.slice(2).forEach(col => {
        const th = document.createElement('th');
        th.textContent = col;
        tableHead.appendChild(th);
    });

    fixedRoster.forEach(name => {
        const row = document.createElement('tr');
        const nameCell = document.createElement('td');
        nameCell.textContent = name;
        row.appendChild(nameCell);

        columns.forEach(col => {
            const colCell = document.createElement('td');
            colCell.setAttribute('data-name', name);
            colCell.setAttribute('data-col', col);

            // Set initial cell color by fetching value from the database
            db.ref(`availability/${name}/${col}`).once('value').then(snapshot => {
                const value = snapshot.val();
                if (value === 'yes') {
                    colCell.style.backgroundColor = 'green';
                } else if (value === 'no') {
                    colCell.style.backgroundColor = 'red';
                } else {
                    colCell.style.backgroundColor = '';
                }
            });

            colCell.addEventListener('click', () => toggleSelection(name, col, colCell));
            row.appendChild(colCell);
        });

        tableBody.appendChild(row);
    });
}

// Toggle between yes (green), no (red), and unset (gray)
function toggleSelection(name, col, cell) {
    const cellRef = db.ref(`availability/${name}/${col}`);

    cellRef.once('value').then(snapshot => {
        const currentValue = snapshot.val();
        let newValue = '';

        if (currentValue === 'yes') {
            newValue = 'no';
            cell.style.backgroundColor = 'red';
        } else if (currentValue === 'no') {
            newValue = '';
            cell.style.backgroundColor = '';
        } else {
            newValue = 'yes';
            cell.style.backgroundColor = 'green';
        }

        cellRef.set(newValue);
    });
}

// Add new column (restaurant)
document.getElementById('add-column-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const newColumn = document.getElementById('new-column').value;
    if (newColumn && !columns.includes(newColumn)) { // Prevent duplicates
        columns.push(newColumn);
        db.ref('columns').set(columns); // Save columns to the database
        renderTable();
    }
    document.getElementById('new-column').value = '';
});

// Load columns from the database on initialization
db.ref('columns').once('value').then(snapshot => {
    const dbColumns = snapshot.val();
    if (dbColumns) {
        columns = [...new Set([...columns, ...dbColumns])]; // Ensure default columns are included
    }
    renderTable();
});

// Add new player (row)
document.getElementById('add-player-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const newPlayer = document.getElementById('new-player').value;
    if (newPlayer && !fixedRoster.includes(newPlayer)) {
        fixedRoster.push(newPlayer);
        renderTable();
    }
    document.getElementById('new-player').value = '';
});

// Reset all answers
document.getElementById('reset-answers').addEventListener('click', function() {
    db.ref('availability').set(null, function(error) {
        if (!error) renderTable();
    });
});

// Initial render
renderTable();
