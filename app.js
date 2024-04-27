    const http = require('http');
    // Set up data storage
    const usersData = require('./users.json');
    const booksData = require('./books.json');

    // Helper function to generate automatic ID 
    function generateId(data) {
        const maxId = data.reduce((max, item) => (item.id > max ? item.id : max), 0);
        return maxId + 1;
    }   

    // Helper function to write data to file
    function writeDataToFile(data, filename) {
        const fs = require('fs');
        fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    }

    // Helper function to read data from file
    function readDataFromFile(filename) {
        const fs = require('fs');
        try {
            return JSON.parse(fs.readFileSync(filename, 'utf8'));
        } catch (err) {
            return [];
        }
    }

    // Users routes
    function createUser(req, res) {
        const newUser = req.body;
        const existingUser = usersData.find(user => user.username === newUser.username);
        if (existingUser) {
            res.writeHead(409, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'User already exists' }));
        } else {
            const userId = generateId(usersData);
            newUser.id = userId;
            usersData.push(newUser);
            writeDataToFile(usersData, 'users.json');
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'User created successfully', user: newUser }));
        }
    }

    function authenticateUser(req, res) {
        const user = req.body;
        const storedUsers = readDataFromFile('users.json');
        const authenticatedUser = storedUsers.find(u => u.username === user.username && u.password === user.password);
        if (authenticatedUser) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'User authenticated successfully', user: authenticatedUser }));
        } else {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Invalid credentials' }));
        }
    }

    function getAllUsers(req, res) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(usersData));
    }
    
    // Books routes
function getAllBooks(req, res) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(booksData));
}

    function createBook(req, res) {
        const newBook = req.body;
        const existingBook = booksData.find(book => book.title === newBook.title);
        if (existingBook) {
            res.writeHead(409, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Book already exists' }));
        } else {
            const bookId = generateId(booksData);
            newBook.id = bookId;
            newBook.available = true;
            booksData.push(newBook);
            writeDataToFile(booksData, 'books.json');
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Book created successfully', book: newBook }));
        }
    }

    function deleteBook(req, res) {
        const bookId = parseInt(req.params.id);
        const index = booksData.findIndex(b => b.id === bookId);
        if (index !== -1) {
            booksData.splice(index, 1);
            writeDataToFile(booksData, 'books.json');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Book deleted successfully' }));
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Book not found' }));
        }
    }

    function loanOutBook(req, res, bookId) {
        const bookIndex = booksData.findIndex(book => book.id === bookId);
    
        if (bookIndex !== -1) {
            const book = booksData[bookIndex];
    
            if (book.available) {
                const { loanedTo } = req.body;
                if (loanedTo) {
                    book.available = false;
                    book.loanedTo = loanedTo;
                    writeDataToFile(booksData, 'books.json');
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Book loaned out successfully', book }));
                } else {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Please provide a valid user to loan the book to' }));
                }
            } else {
                res.writeHead(409, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Book is not available for loan' }));
            }
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Book not found' }));
        }
    }
    

    function returnBook(req, res) {
        const bookId = parseInt(req.params.id);
        const index = booksData.findIndex(b => b.id === bookId);
        if (index !== -1) {
            booksData[index].loanedTo = null;
            writeDataToFile(booksData, 'books.json');
            res.status(200).send({ message: 'Book returned successfully' });
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({message: 'Book not found'}))
        }
    }

    function updateBook(req, res) {
        const bookId = parseInt(req.params.id);
        const index = booksData.findIndex(b => b.id === bookId);
        if (index !== -1) {
            const updatedBook = req.body;
            booksData[index] = {
                ...booksData[index],
                ...updatedBook
            };
            writeDataToFile(booksData, 'books.json');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Book updated successfully', book: booksData[index] }))
           
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({message: 'Book not found'}))
        }
    }


    const server = http.createServer((req, res) => {
        const { method, url, headers } = req;
        let body = [];

        req.on('data', (chunk) => {
            body.push(chunk);   
        }).on('end', () => {
            body = Buffer.concat(body).toString();

            // Route handling
            if (method === 'POST' && url === '/users') {
                req.body = JSON.parse(body);
                createUser(req, res);
            } else if (method === 'POST' && url === '/users/authenticate') {
                req.body = JSON.parse(body);
                authenticateUser(req, res);
            } else if (method === 'GET' && url === '/users') {
                getAllUsers(req, res);
            }else if (method === 'GET' && url === '/books') {
                getAllBooks(req, res);
            }
             else if (method === 'POST' && url === '/books') {
                req.body = JSON.parse(body);
                createBook(req, res);
            } else if (method === 'DELETE' && url.startsWith('/books/')) {
                const bookId = parseInt(url.split('/')[3]);
                deleteBook(req, res, bookId);
            } else if (method === 'POST' && url.startsWith('/books/loan')) {
                const bookId = parseInt(url.split('/')[3]);
                req.body = JSON.parse(body);
                loanOutBook(req, res, bookId);
            } else if (method === 'POST' && url.startsWith('/books/return')) {
                const bookId = parseInt(url.split('/')[3]);
                req.body = JSON.parse(body);
                returnBook(req, res, bookId);
            } else if (method === 'PUT' && url.startsWith('/books/')) {
                const bookId = parseInt(url.split('/')[3]);
                req.body = JSON.parse(body);
                updateBook(req, res, bookId);
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Route not found' }));
            }
        });
    });

    const PORT = process.env.PORT || 3000;

    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });

