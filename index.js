const express = require("express")
const { MongoClient, ServerApiVersion } = require("mongodb")
const cors = require('cors')
const jwt = require("jsonwebtoken")
const { ObjectId } = require("mongodb")
const app = express()

app.use(cors())
app.use(express.json())


let arr = [{
    id: 1,
    time: "10:00",
    status: true
}, {
    id: 2,
    time: "10:30",
    status: true
}, {
    id: 3,
    time: "11:00",
    status: true
}, {
    id: 4,
    time: "11:30",
    status: true
}, {
    id: 5,
    time: "12:00",
    status: true
}, {
    id: 6,
    time: "02:00",
    status: true
}, {
    id: 7,
    time: "02:30",
    status: true
}, {
    id: 8,
    time: "03:00",
    status: true
}, {
    id: 9,
    time: "03:30",
    status: true
}, {
    id: 10,
    time: "04:00",
    status: true
}]

const url = "mongodb+srv://luckypranav47:lucky647@cluster0.yo7ifvg.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(url, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


app.get('/', (req, res) => {
    res.send("hello world")
})

app.get('/data', async (req, res) => {
    try {
        const collection = client.db('Hospital_Mangement').collection('Doctors');
        const allData = await collection.find({}).toArray();

        res.send(allData);
    } catch (error) {
        console.error('Error retrieving data:', error);
        res.status(500).json({ error: 'Error retrieving data' });
    }
})
app.get('getDoctors', async (req, res) => {
    try {
        const collection = client.db('Hospital_Mangement').collection('Doctors');
        const allData = await collection.find({}).toArray();

        res.send(allData);
    } catch (error) {
        console.error('Error retrieving data:', error);
        res.status(500).json({ error: 'Error retrieving data' });
    }
})

app.post('/appointments', async (req, res) => {
    try {
        const result = req.body
        const { id, data } = result
        const collection = client.db('Hospital_Mangement').collection('Doctors');
        const allData = await collection.updateOne({
            "_id": new ObjectId(id)
        },
            { $push: { "appointments": data } }
        );
        const status = await collection.find({ "_id": new ObjectId(id) }).toArray()
        const filtered = status[0].DoctorTimings.map((each) => {
            if (each.time === data.time) {
                return { ...each, status: !each.status }
            } else {
                return each
            }
        })
        const query = await collection.updateOne(
            { "_id": new ObjectId(id) },
            { $set: { "DoctorTimings": filtered } }
        )
        res.send({ message: "Booked successfully" }).status(200)
    } catch (error) {
        console.log(error)
    }

})

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const collection = await client.db("Hospital_Mangement").collection("Admin_Login")
    const loginData = await collection.find({ "username": username }).toArray()
    if (loginData.length === 0) {
        res.status(404).send("Enter valid credentials")
    }
    else {
        if (loginData[0].username === username) {
            if (loginData[0].password === password) {
                let token = jwt.sign(username, 'myToken')
                res.send({ token: token })
            } else {
                res.status(404).send("Enter valid password")
            }
        } else {
            res.status(404).send("Enter valid username")
        }
    }
})
app.put('/change_availability', async (req, res) => {
    try {
        const { availability, id } = req.body
        const collection = await client.db("Hospital_Mangement").collection("Doctors")
        const loginData = await collection.updateOne({ "_id": new ObjectId(id) },
            { $set: { "Available": availability } })
        res.send("changed successfuly")
    } catch (error) {
        console.log(error)
    }
})


app.put('/add', async (req, res) => {
    let receivedData1 = new ObjectId("64f890dd365b3e3cbe1942e7")
    const collection = client.db('Hospital_Mangement').collection('Doctors');
    arr.map(async (each) => {
        const restList = await collection.updateOne({
            "_id": receivedData1
        },
            { $push: { "DoctorTimings": each } }
        )
        console.log(`added ${each.time}`)
    })

})

app.post('/update', async (req, res) => {
    const data = req.body
    const collection = await client.db('Hospital_Mangement').collection('Doctors');

    const filter = {
        "_id": new ObjectId(data.id),
        'DoctorTimings.id': { $in: [data.obj.id] } // Specify the IDs of the doctor timings to update
    };

    const update = {
        $set: {
            'DoctorTimings.$.status': true
        }
    };

    const result = await collection.updateMany(filter, update);
    console.log(result)
})


app.listen(4000, async () => {
    try {
        await client.connect();
        console.log('Connected to MongoDB successfully!');
        console.log("http://localhost:4000")
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
})