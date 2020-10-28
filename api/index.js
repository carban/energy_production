const path = require('path');
const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const bodyParser = require('body-parser')
const app = express();

// Settings
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.set('port', process.env.PORT || 3030);

// Listening
const server = app.listen(app.get('port'), () => {
    console.log("Server on port: " + app.get('port'));
});

const pathMini = "/home/carban/PortableApps/MiniZincIDE-2.4.3-bundle-linux-x86_64/bin/minizinc ";
const pathModel = path.resolve("model.mzn");
// const pathModel2 = path.resolve("Model2.mzn");


// #################################### MODEL 1 ################################
app.post('/api/solve/model1/', (req, res) => {

    const { capacidades, costos, clientes, dias, d } = req.body;

    const inpp = ' -D \" ' + capacidades + ' ' + costos + ' ' + clientes + ' ' + dias + ' ' + d + '"';

    var command = '/..' + pathMini + ' --solver COIN-BC ' + pathModel + inpp;

    // console.log(command);

    // DIRECTO
    try {
        exec(command, (err, stdout, stderr) => {
            if (stdout.length != 24) {
                let f = stdout.split("\n")
                let profit = parseInt(f[0]);
                let sol = JSON.parse(f[1]);
                res.json({ status: true, profit: profit, sol: sol });
            } else {
                // console.log('UNSATISFIABLE');
                res.json({ status: false });
            }
        });
    } catch (error) {
        console.log(error);
        res.json({ error: error });
    }
})