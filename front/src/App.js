import { useState } from "react";
import { Table, Input, Button, Row, Col } from "reactstrap";
import ReactLoading from "react-loading";
import axios from "axios";
import './App.css';

const App = () => {

  const initialState = {
    capaN: 1000,
    capaH: 300,
    capaT: 500,
    costoN: 22,
    costoH: 10,
    costoT: 30,
    matrix: [
      [800, 300, 100, 230, 500],
      [200, 700, 350, 420, 0]
    ],
    ldc: 0,
    proc: 0,
    model2: false,

    profit: 0,
    sol: [],
    loading: false,
    unsatisfiable: false,
  }

  const [values, setValues] = useState(initialState);

  const handler = e => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: parseInt(value) });
  }

  const handlerMatrix = (i, j, e) => {
    let m = values.matrix;
    const { value } = e.target;
    m[i][j] = parseInt(value);
    setValues({ ...values, matrix: m });
  }

  const trMatrix = (m, c, d) => {
    let a = "d=[|";
    for (let i = 0; i < c; i++) {
      for (let j = 0; j < d; j++) {
        if (j === d - 1) {
          a += m[i][j];
        } else {
          a += m[i][j] + ",";
        }
      }
      a += "|";
    }
    a += "];";
    return a;
  }

  const submit = e => {
    e.preventDefault();
    let capacidades = "capacidades=[" + values.capaN + "," + values.capaH + "," + values.capaT + "];";
    let costos = "costos=[" + values.costoN + "," + values.costoH + "," + values.costoT + "];";
    let cl = values.matrix.length;
    let di = values.matrix[0].length;
    let clientes = "n_clientes=" + cl + ";";
    let dias = "n_dias=" + di + ";";
    let d = trMatrix(values.matrix, cl, di);

    let data = {};

    let model2 = values.model2;
    if (model2) {
      let ldc = "limit_dias=" + values.ldc + ";";
      let porcentaje = "porcentaje=" + values.porc / 100 + ";";
      data = { capacidades, costos, clientes, dias, d, ldc, porcentaje, model2 };
    } else {
      data = { capacidades, costos, clientes, dias, d, model2 };
    }

    setValues({ ...values, loading: true, profit: 0, sol: [] });
    axios.post("http://localhost:3030/api/solve/", data)
      .then(res => {
        let { status } = res.data;
        if (status) {
          let { profit, sol } = res.data;
          setValues({ ...values, profit: profit, sol: sol, loading: false, unsatisfiable: false });
        } else {
          setValues({ ...values, profit: 0, sol: [], loading: false, unsatisfiable: true });
        }
      })
      .catch(err => {
        console.log(err);
      })
  }

  const newClient = () => {
    let l = values.matrix[0].length;
    let a = [];

    for (let i = 0; i < l; i++) {
      a.push(0);
    }

    let m = values.matrix;
    m.push(a);
    setValues({ ...values, matrix: m });
  }

  const newDay = () => {
    let m = values.matrix;
    let l = values.matrix.length;
    for (let i = 0; i < l; i++) {
      m[i].push(0);
    }
    setValues({ ...values, matrix: m });
  }

  const rmClient = () => {
    let m = values.matrix;
    m.pop();
    setValues({ ...values, matrix: m });
  }

  const rmDay = () => {
    let m = values.matrix;
    let l = values.matrix.length;
    for (let i = 0; i < l; i++) {
      m[i].pop();
    }
    setValues({ ...values, matrix: m });
  }

  const changeModel = () => {
    setValues({ ...values, model2: !values.model2 });
  }

  return (
    <div className="App">
      <header className="App-header">
        Energy Production
      </header>
      <div>
        <br></br>
        <Row>
          <Col>
            <b>Capacidades</b>
            <br></br>
            <input type="number" placeholder="N" name="capaN" value={values.capaN} onChange={handler}></input>
            <input type="number" placeholder="H" name="capaH" value={values.capaH} onChange={handler}></input>
            <input type="number" placeholder="T" name="capaT" value={values.capaT} onChange={handler}></input>
            <br></br>
          </Col>
          <Col>
            <b>Costos</b>
            <br></br>
            <input type="number" placeholder="costoN" name="costoN" value={values.costoN} onChange={handler}></input>
            <input type="number" placeholder="costoH" name="costoH" value={values.costoH} onChange={handler}></input>
            <input type="number" placeholder="costoT" name="costoT" value={values.costoT} onChange={handler}></input>
            <br></br>
          </Col>
        </Row>
        <br></br>
        <button onClick={changeModel}>Parámetros Extra</button>
        {
          values.model2 ?
            <div>
              <input type="number" placeholder="LDC" name="ldc" onChange={handler}></input>
              <input type="number" placeholder="Porcentaje" name="porc" onChange={handler}></input>
            </div>
            : true
        }

      </div>
      <br></br>
      <center>

        <Table striped style={{ "width": "90%" }}>
          <thead>
            <tr>
              <th>#</th>
              {
                values.matrix[0].map((ele, i) => (
                  <th key={i}>
                    <center>Dia {i + 1}</center>
                  </th>
                ))
              }
            </tr>
          </thead>
          <tbody>
            {
              values.matrix.map((ele, i) => (
                <tr key={i}>
                  <th scope="row">Cliente {i + 1}</th>
                  {
                    ele.map((ele2, j) => (
                      <td key={j}>
                        <Input type="number" placeholder="Gasto"
                          value={values.matrix[i][j]}
                          onChange={handlerMatrix.bind(this, i, j)} />
                      </td>
                    ))
                  }
                </tr>
              ))
            }
          </tbody>
        </Table>

        <br></br>
        <Button onClick={newDay.bind(this)} color="success">Nuevo Dia</Button>
        <Button onClick={rmDay.bind(this)} color="danger">Quitar Dia</Button>
        <Button onClick={newClient.bind(this)} color="success">Nuevo Cliente</Button>
        <Button onClick={rmClient.bind(this)} color="danger">Quitar Cliente</Button>
        <br></br>
        <br></br>
        <Button onClick={submit.bind(this)} color="primary">Calcular</Button>

        <br></br>
        <hr></hr>
        <br></br>

        {
          values.unsatisfiable ? <h1 style={{ "color": "red" }}>Insatisfactible</h1> : true
        }

        {
          values.sol.length === 0 ?
            (
              values.loading ? <ReactLoading type="spin" color="blue" /> : true
            )
            :
            (
              <div>
                <h4>Ganancia: {values.profit}</h4>
                <br></br>
                <Table striped style={{ "width": "90%" }}>
                  <thead>
                    <tr>
                      <th>#</th>
                      {
                        values.sol[0].map((ele, i) => (
                          <th key={i}>
                            <center>Dia {i + 1}</center>
                          </th>
                        ))
                      }
                    </tr>
                  </thead>
                  <tbody>
                    {
                      values.sol.map((ele, i) => (
                        <tr key={i}>
                          <th scope="row">Tr {i + 1}</th>
                          {
                            ele.map((ele2, j) => (
                              <td key={j}>
                                <Input type="number" placeholder="Gasto"
                                  value={values.sol[i][j]}
                                  readOnly />
                              </td>
                            ))
                          }
                        </tr>
                      ))
                    }
                  </tbody>
                </Table>
              </div>
            )
        }
      </center>
    </div>
  );
}

export default App;