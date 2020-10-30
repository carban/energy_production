% Parametros y constantes
set of int: t = 1..3;

array[t] of int: capacidades; 
array[t] of int: costos; 

int: n_clientes;
int: n_dias;

set of int: clientes = 1..n_clientes; 
set of int: dias = 1..n_dias;

array[clientes, dias] of int: d;

% Matriz con las variables de decision
array[t, dias] of var int: pro;

% Restricciones
constraint forall(i in t, j in dias)(pro[i, j] >= 0 /\ pro[i, j] <= capacidades[i]);
constraint forall(i in dias)(sum(d[clientes, i]) <= sum(pro[t, i]));

% Regimen alto | Restriccion extra ----------------------------------------
int: limit_dias;
float: porcentaje;
float: limit = capacidades[2] * porcentaje;

constraint not exists(i in dias, j in dias where j-i+1=limit_dias)(forall(k in i..j)(pro[2,k] > limit));

% Funcion Objetivo
var int: f; 
constraint f = sum(i in t, j in dias)(pro[i, j] * costos[i]);
solve minimize f;

% Output
output["Total Profit: \(f)\n\(pro[1, dias])\n\(pro[2, dias])\n\(pro[3, dias])"];
