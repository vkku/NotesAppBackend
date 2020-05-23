import express from 'express';
import bodyParser from 'body-parser';
import { MongoClient } from 'mongodb';
import path from 'path';

const app = express();

app.use(express.static(path.join(__dirname, '/build')));
app.use(bodyParser.json());

const withDB = async operations => {
    try {
        const client = await MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true, useUnifiedTopology: true });
        const db = client.db('noteapp');

        await operations(db);

        client.close();
    } catch (err) {
        //res.status(500).send({ message: 'Database Error', err });
        console.log(err);
    }
}

var note = {
    title: "",
    text: "",
    label: "",
    dueDate: "",
    status: ""
}

app.get('/api/find/:title', async (req, res) => {
    const noteTitle = req.params.title;
    console.log("Inside: " + noteTitle);
    await withDB(async db => {
        const articleInfo = await db.collection('notes').find({ title: noteTitle }).toArray();
        await res.status(200).json(articleInfo);
    });

});

app.post('/api/noteapp/insert', async (req, res) => {
    const noteToBeInserted = req.body;
    note.title = noteToBeInserted.title;
    note.text = noteToBeInserted.text;
    note.label = noteToBeInserted.label;
    note.dueDate = noteToBeInserted.dueDate;
    note.status = noteToBeInserted.status;


    await withDB(async db => {
        const response = await db.collection('notes').insertOne(note);
        const displayId = "_id: " + response.ops[0]._id;
        await res.status(200).json(displayId);
    });
});

app.get('*', (req, res) =>{
    res.sendFile(path.join(__dirname + '/build/index.html'));
});

app.listen(8000, () => console.log('Server is listening on port 8000'));