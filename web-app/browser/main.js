import Cyclic_Automata from "../common/Cyclic_Automata.js";
import Colour_Scheme from "../common/Colour_Scheme.js";
import R from "./common/ramda.js";
import Json_rpc from "./Json_rpc.js";

const original_colours = [[]]

const van_neumann_neighbourhood = [[2, 3], [3, 4], [4, 3], [3, 2]];
const moore_neighbourhood = [[2, 2], [2, 3], [2, 4], [3, 2], [3, 4], [4, 2], [4, 3], [4, 4]];

const board_height = parseInt(document.getElementById("height").value);
const board_width = parseInt(document.getElementById("width").value);
const states = parseInt(document.getElementById("states").value);
const threshold = parseInt(document.getElementById("threshold").value);
// const speed = parseInt(document.getElementById("speed").value);

// const optional_value = function (optional, desired) {
//     if (desired === NaN) {
//         return optional
//     } else {return desired}
// }

// console.log(R.length(board_height));

const padding = 3;
const neighbourhood_grid_size = 2*padding + 1;
let grid_rows = board_height;
let grid_columns = board_width;
const grid_states = states;
const grid_threshold = threshold;
const time_delay = 150;
let neighbourhood_list = [];

let board = Cyclic_Automata.initial_board(grid_rows, grid_columns, grid_states);
const colour_scheme = Colour_Scheme.create_colour_scheme(183, 112, 42, grid_states)

console.log(board);
console.log(colour_scheme);

document.documentElement.style.setProperty("--grid-rows", grid_rows);
document.documentElement.style.setProperty("--grid-columns", grid_columns);
document.documentElement.style.setProperty("--neighbourhood-size", neighbourhood_grid_size);

const grid = document.getElementById("grid");
const footer = document.getElementById("footer");
const neighbourhood_grid = document.getElementById("neighbourhood_grid");
const start_button = document.getElementById("start_button");
const stop_button = document.getElementById("stop_button");
const randomise_button = document.getElementById("randomise_button");
const update_button = document.getElementById("update_button");
// const increase_size_button = document.getElementById("increase_size_button");
// const decrease_size_button = document.getElementById("decrease_size_button");

let run_state = true;

update_button.onclick = function () {
    window.location.reload();
};

start_button.onclick = function () {
    run_state = true;
    setInterval(function () {
        if (run_state === true) {
            update_printed_board();
        }
    }, time_delay);
};

stop_button.onclick = function () {
    run_state = false;
};

randomise_button.onclick = function () {
    set_new_board(grid_rows, grid_columns, grid_states);
};

const neighbourhood_cells = R.range(0, neighbourhood_grid_size).map(function (row_index) {
    const row = document.createElement("div");
    row.className = "neighbourhood_row";

    const rows = R.range(0, neighbourhood_grid_size).map(function (column_index) {
        const cell = document.createElement("div");
        cell.className = "neighbourhood_cell";

        if (row_index === 3 && column_index === 3) {
            cell.classList.add("middle");
        }

        cell.onclick = function () {
            const current_cell = cells[row_index][column_index];
            if (cell.classList.contains("on")) {
                cell.classList.remove("on");
                // let temporary_list = [];
                // neighbourhood_list.forEach(function (coordinates) {
                //     if (coordinates === [row_index,column_index]) {
                //         console.log([row_index,column_index]);
                //     } else {console.log(neighbourhood_list);}
                // });
            } else {cell.classList.add("on");}
            // if (row_index !== 3 || column_index !== 3) {
                // neighbourhood_list.push([row_index,column_index]);
            // } else {
            //     cell.classList.remove("on");
            //     cell.classList.add("middle");
            if (row_index === 3 && column_index === 3) {
                cell.classList.remove("on");
                cell.classList.add("middle");
            };
            create_neighbourhood();
        };

        row.append(cell);
        return cell;

    });

    neighbourhood_grid.append(row);
    return rows;

});

const create_neighbourhood = function () {
    neighbourhood_list = []
    neighbourhood_cells.forEach(function (row, row_index) {
        row.forEach(function (square, column_index) {
            if (square.classList.contains("on")) {
                neighbourhood_list.push([row_index,column_index]);
            }
        });
    });
    console.log(neighbourhood_list);
    return neighbourhood_list;
};

const cells = R.range(0, grid_rows).map(function (row_index) {
    const row = document.createElement("div");
    row.className = "row";

    const rows = R.range(0, grid_columns).map(function (column_index) {
        const cell = document.createElement("div");
        cell.className = "cell";
        // cell.textContent = `[${row_index},${column_index}]`;

        cell.onclick = function () {
            footer.textContent = `[${row_index},${column_index}]`;
            const current_cell = cells[row_index][column_index];
            // board = console.log(curried_step(board));
            update_printed_board();
        };

        row.append(cell);
        return cell;

    });

    grid.append(row);
    return rows;

});
// const attempt = function (row_number, column_number) {

//     return R.range(0, row_number).map(function (row_index) {
//         const row = document.createElement("div");
//         row.className = "row";

//         const rows = R.range(0, column_number).map(function (column_index) {
//             const cell = document.createElement("div");
//             cell.className = "cell";
//             // cell.textContent = `[${row_index},${column_index}]`;

//             cell.onclick = function () {
//                 // footer.textContent = `[${row_index},${column_index}]`;
//                 // const current_cell = cells[row_index][column_index];
//                 // // board = console.log(curried_step(board));
//                 update_printed_board();
//             };

//             row.append(cell);
//             return cell;

//         });

//         grid.append(row);
//         return rows;

//     });
// };

// let cells = attempt(grid_rows, grid_columns);

// increase_size_button.onclick = function () {
//     grid_rows = grid_rows + 15;
//     document.documentElement.style.setProperty("--grid-rows", grid_rows);
//     set_new_board(grid_rows, grid_columns, grid_states);
//     cells = attempt(grid_rows, grid_columns);
// };



const update_printed_board = function () {

    const curried_step = Cyclic_Automata.single_step(neighbourhood_list, grid_threshold, grid_states, padding);
    board = curried_step(board);
    console.log(board);
    update_board();
    return board
}

const set_new_board = function (grid_rows, grid_columns, grid_states) {
    const new_board = Cyclic_Automata.initial_board(grid_rows, grid_columns, grid_states);
    board = new_board
    console.log(board);
    update_board();
    return board
}

const update_board = function () {
    cells.forEach(function (row, row_index) {
        row.forEach(function (square, column_index) {
            const cell_state = board[row_index][column_index];
            square.style.setProperty("background-color", "rgb(0, 0, 0)")
            square.style.setProperty("background-color", `rgb(${colour_scheme[cell_state]})`)
            // square.classList.remove("state0");
            // square.classList.remove("state1");
            // square.classList.remove("state2");
            // square.classList.remove("state3");
            // square.classList.remove("state4");
            // square.classList.remove("state5");
            // square.classList.remove("state6");
            // square.classList.remove("state7");
            // square.classList.remove("state8");
            // square.classList.remove("state9");
            // square.classList.remove("state10");
            // square.classList.remove("state11");
            // square.classList.remove("state12");
            // square.classList.remove("state13");
            // square.classList.remove("state14");
            // const random_shit = [[255,0,0],[255,255,0]]
            // console.log(`rgb(${colour_scheme[0]})`)
            // if (cell_state === 0) {
            //     // square.classList.add("state0");
            //     square.style.setProperty("background-color", `rgb(${random_shit[0]})`)
            // }
            // if (cell_state === 1) {
            //     // square.classList.add("state1");
            //     square.style.setProperty("background-color", "rgb(255, 255, 0)")
            // }
            // if (cell_state === 2) {
            //     square.classList.add("state2");
            // }
            // if (cell_state === 3) {
            //     square.classList.add("state3");
            // }
            // if (cell_state === 4) {
            //     square.classList.add("state4");
            // }
            // if (cell_state === 5) {
            //     square.classList.add("state5");
            // }
            // if (cell_state === 6) {
            //     square.classList.add("state6");
            // }
            // if (cell_state === 7) {
            //     square.classList.add("state7");
            // }
            // if (cell_state === 8) {
            //     square.classList.add("state8");
            // }
            // if (cell_state === 9) {
            //     square.classList.add("state9");
            // }
            // if (cell_state === 10) {
            //     square.classList.add("state10");
            // }
            // if (cell_state === 11) {
            //     square.classList.add("state11");
            // }
            // if (cell_state === 12) {
            //     square.classList.add("state12");
            // }
            // if (cell_state === 13) {
            //     square.classList.add("state13");
            // }
            // if (cell_state === 14) {
            //     square.classList.add("state14");
            // }
        });
    });
};


update_board();
console.log(neighbourhood_list);

