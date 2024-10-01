/**
 * This is an integration fix, so that Ramda can be imported in the same way
 * both on server and on browser, and also not trip jslint.
 */
import * as R from "./node_modules/ramda/es/index.js";
export default R;


// const board1 = [[0,1,3],[4,5,6]]
// const board2 = [[0,1,3],[4,5,6]]

// const map_element_with_index = R.addIndex(R.map);

// const identical = function (board1, board2) {
//     const flatten1 = R.flatten(board1)
//     const flatten2 = R.flatten(board2)
//     return map_element_with_index(function (value, index) {
//         if (value === flatten2[index]) {
//             console.log(value)
//         }
//     }, flatten1)
// }


// const prepare_neighbourhood = function (board) {
//     const board_with_indices = map_element_with_index(function (row, row_index) {
//         return map_element_with_index(function (value, column_index) {
//             if (value === 1) {
//                 return [row_index, column_index]
//             } else { return -1 }
//         }, row)
//     }, board)
//     const filtered = R.map(function (row) {
//         return R.filter((x) => x !== -1, row)
//     }, board_with_indices)
//     const list = R.unnest(filtered)
//     return list
// }

// console.log(prepare_neighbourhood(
//     [[1,0,0,0,0],
//      [0,1,1,1,1],
//      [0,1,0,1,0],
//      [0,1,1,1,0],
//      [0,1,0,0,0]]))

// const board = [[1,2,2],[0,1,2],[1,1,2]]
// const board5 = [[0,0,0], [0,0,1],[0,2,1]]
// const board6 = [[2,2,2],[0,1,0],[1,1,2]]


// const is_horizontal_win = function (grid) {
//     const list =  grid.map(function (row, row_index) {
//         return row_equals(1, row), row_equals(2, row)
//     })
//     return R.filter((x) => x === true, list)
// }

// const is_vertical_win =  function (grid) {
//     const rotated_board = R.transpose(grid);
//     return is_horizontal_win(rotated_board)
// }

// const row_equals = (x, row) => R.all(R.equals(x), row)

// const curried_step = Cyclic_Automata.single_step(moore_neighbourhood, grid_threshold, grid_states, 3);

// let board = Cyclic_Automata.initial_board(grid_rows, grid_columns, grid_states);

// console.log(board)
// console.log(curried_step(board))