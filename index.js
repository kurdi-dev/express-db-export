const mysqldump = require("mysqldump");
const express = require("express");
const fs = require("fs");

const app = express();
const PORT = 3000;

const today = new Date().toISOString().substr(0, 10);

const mysqlHostName = "127.0.0.1 or host address";
const mysqlUserName = "mysql user";
const mysqlPassword = "mysql password";
const dbName = "db name";
const backup_dir = "./backups/"; //saving files inside backups directory
const backup_name = `hawlervaris_db_${today}.sql`;
const accessKey = "access key"; // a key to verify the key parameter from the get request

app.get("/", async (req, res) => {
  //getting the key parameter from the GET request
  let key = req.query.key;
  if (key && key == accessKey) {
    // dump the database straight to a file
    try {
      await mysqldump({
        connection: {
          host: mysqlHostName,
          user: mysqlUserName,
          password: mysqlPassword,
          database: dbName,
        },
        dumpToFile: backup_dir + backup_name,
      });

      // send the dump file to the client
      res.download(backup_dir + backup_name, backup_name, function (err) {
        if (err) {
          // Handle error, but keep in mind the response may be partially-sent
          // so check res.headersSent
          console.log("Error: ", err);
        } else {
          // file is downloaded
          // Delete the dump file after 10 seconds (optional)
          setTimeout(function () {
            fs.unlink(backup_dir + backup_name, (err) => {
              if (err) {
                console.error(err);
              }
              //file is deleted
            });
          }, 10000);
        }
      });
    } catch (error) {
      console.log(error);
    }
  } else {
    res.status(404).send("Not found");
  }
});

app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));
