import express from "express";
import axios from "axios";
import pg from "pg";
import bodyParser from "body-parser";

const app = express();
const port = 3000;
const API_URL = "https://gutendex.com/books/";

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "book",
    password: "postgres",
    port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

let notes = [];

app.get("/", async (req, res) => {
    try{
        const result = await axios.get(API_URL);
        const dataBase = await db.query("SELECT * FROM notes");
        const books = result.data;
        const dbBook = dataBase.rows;

        // loop result.data [{}]
        //  book = result.data[i]
        //  {id, nama, cover}
        //  db.query -> mendapatkan data notes berdasakan book_id
        //  kalau ada datanya book.note = {} / null
        //  [{id, nama, cover, note: {} // null}]

        // function compare(satu, dua) {
        //     const dataSatu = Object.values(satu);
        //     const dataDua = Object.values(dua);
        //     const dataCompare = [];
        //     for (var i = 0; i < dataSatu.length; i++) {
        //         for (var j = 0; j < dataDua.length; j++) {
        //             if (i === j) {
        //                 dataCompare.push(dataSatu[i]);
        //             }
        //         }
        //     }
        //     console.log(dataCompare);
        // }
        // compare(dbBook, books);

        // res.render("index.ejs", {books: result.data, dbBook: dataBase.rows});
        res.render("index.ejs", {books, dbBook});
    } catch (error) {
        res.status(404).send(error.message);
    };
});

app.get("/note/:id", async (req, res) => {
    const{id} = req.params;
    try{
        const result = await axios.get(`${API_URL}/${id}`);
        res.render('isi-notes', {book: result.data});
    } catch (error) {
        res.status(404).send(error.message);
    }
});

app.get("/note", async (req, res) => {
    try{
        const result = await db.query("SELECT * FROM notes ORDER BY id ASC");
        notes = result.rows;
        res.render("notes.ejs", {listNote: notes});
    } catch (err) {
        console.log(err);
    }
});

app.post("/note/:id", async (req, res) => {
    const judul = req.body.newJudul;
    const note = req.body.newNote;
    const rating = req.body.newRating;
    const coverbuku = req.body.newCoverbuku;
    const date = req.body.newTime;
    const idBook = req.body.newIdBook;
    try{
        await db.query("INSERT INTO notes (judul, isi_note, rating, cover_buku, date, id_book) VALUES ($1, $2, $3, $4, $5, $6)", [judul, note, rating, coverbuku, date, idBook]);
        res.redirect("/note");
    } catch (err) {
        console.log(err);
    }
});

app.get("/note/:id/edit", async (req, res) => {
    const id = req.params.id;
    try{
        const result = await db.query("SELECT * FROM notes WHERE id = $1", [id]);
        notes = result.rows;
        res.render('edit-notes', {listNote: notes});
    } catch (error) {
        res.status(404).send(error.message);
    };
});

app.post("/note/:id/edit", async (req, res) => {
    const id = req.params.id;
    const judul = req.body.updateJudul;
    const note = req.body.updateNote;
    const rating = req.body.updateRating;
    const coverbuku = req.body.updateCoverbuku;
    const date = req.body.updateTime;
    const idBook = req.body.updateIdBook;
    try{
        await db.query("UPDATE notes SET judul = ($1) WHERE id = $2", [judul, id]);
        await db.query("UPDATE notes SET isi_note = ($1) WHERE id = $2", [note, id]);
        await db.query("UPDATE notes SET rating = ($1) WHERE id = $2", [rating, id]);
        await db.query("UPDATE notes SET cover_buku = ($1) WHERE id = $2", [coverbuku, id]);
        await db.query("UPDATE notes SET date = ($1) WHERE id = $2", [date, id]);
        await db.query("UPDATE notes SET id_book = ($1) WHERE id = $2", [idBook, id]);
        res.redirect("/note");
    } catch (error) {
        res.status(404).send(error.message);
    };
});

app.post("/note/:id/delete", async (req, res) => {
    const id = req.params.id;
    try{
        await db.query("DELETE FROM notes WHERE id = $1", [id]);
        res.redirect("/note");
    } catch (error) {
        res.status(404).send(error.message);
    }
});

app.listen(port, () => {
    console.log('Server is running on port 3000');
});