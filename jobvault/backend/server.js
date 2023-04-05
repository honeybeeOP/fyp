
const express = require("express")
const mysql = require("mysql");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const port = 8000;



app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

// database connection
const db = mysql.createConnection({
  user: "root",
  host: "localhost",
  password: "password",
  database: "jobvaultmysql",
});
db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("Connected to database...");
});


//image
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(
      null,
      "C:\\Users\\ACER\\Desktop\\jobvault\\jobvault\\frontend\\public\\profilepicture"
    );
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});



const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/webp" 
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};




const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10000000000,
  },
  fileFilter: fileFilter,
});








//signup for jobseekers
app.post("/signup", upload.single("image"), (req, res) => {
  const { firstname, lastname, age, gender, qualification, mobilenumber, email, password } = req.body;

  const image = req.file ? req.file.filename : null;
  if (!image) {
    res.status(400).send("no image to upload");
    return;
  }

  db.query(
    "INSERT INTO jobseekers (firstname, lastname, age, gender,  qualification, mobilenumber, email, password, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      firstname,
      lastname,
      age,
      gender,
      qualification,
      mobilenumber,
      email,
      password,
      image
    ],
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send("Server error");
      } else {
        if (result.affectedRows > 0) {
          res.status(200).send("signup successful");
        } else {
          res.status(401).send("Invalid email or password");
        }
      }
    }
  );
});








//signup for employers
app.post("/employersignup", (req, res) => {
  const companyname = req.body.companyname;
  const companyowner = req.body.companyowner;
  const dateofestd = req.body.dateofestd;
  
  const companycontactnumber = req.body.companycontactnumber;
  const email = req.body.email;
  const password = req.body.password;

  db.query(
    "INSERT INTO employers(companyname, companyowner, dateofestd, companycontactnumber, email,  password) VALUES (?, ?, ?, ?, ?, ?)",
    [
      companyname,
      companyowner,
      dateofestd,
      companycontactnumber,
      email,
      password,
    ],
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(200).send(err);
      } else {
        if (result.length > 0) {
          res.status(200).send("signup successful");
        } else {
          res.status(401).send("Invalid email or password");
        }
      }
    }
  );
});




//login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  db.query(
    "SELECT * FROM jobseekers WHERE email=? and password=?",
    [email, password],
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send("Server error");
      } else {
        if (result.length > 0) {
          res.status(200).send("Login successful");
        } else {
          res.status(401).send("Invalid email or password");
        }
      }
    }
  );
});



//add jobs
app.post("/addjobs", (req, res) => {
  const jobTitle = req.body.jobTitle;
  const jobDescription = req.body.jobDescription;
  const jobLocation = req.body.jobLocation;

  const salary = req.body.salary;
  const noofvacancies = req.body.noofvacancies;
  const skillsneeded = req.body.skillsneeded;
  
  db.query(
    "INSERT INTO jobslists( jobTitle, jobDescription,  jobLocation,salary, noofvacancies,skillsneeded) VALUES (?, ?, ?,?,?,?)",
    [jobTitle, jobDescription, jobLocation, salary, noofvacancies,skillsneeded ],
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send("Server error");
      } else {
        res.status(200).send("Job added successfully");
      }
    }
  );
});

///job display to home page
app.get("/joblist", (req, res) => {
  const sql1 = "SELECT * FROM jobslists";
  db.query(sql1, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});


app.get("/ktmjobs", (req, res) => {
  const sql = "SELECT * FROM jobslists WHERE location = 'Kathmandu'";
  db.query(sql, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});



///jobseekers display to home page
app.get("/hirejob", (req, res) => {
  const sql2 =
    "SELECT firstname, lastname, qualification, email, image FROM jobseekers";
  db.query(sql2, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});



//search
// app.get('/search', function(req, res){
//   con.connect(function(error){
//     if(error) console.log(error);

//     const sql =
//   })
// })

app.get("/search", function (req, res) {
  const jobTitle = req.query.jobTitle;
  const jobLocation = req.query.jobLocation;

  const sql =
    "SELECT * from jobslists where jobTitle LIKE '%" +
    jobTitle +
    "%' AND jobLocation LIKE '%" +
    jobLocation +
    "%'";

  db.query(sql, (err, result) => {
    if (err) console.log(err);
    res.render(_);
  });
});

app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}`);
});
