import Cyclic_Automata from "../common/Cyclic_Automata.js";
import R from "../common/ramda.js";

const print_board = (board) => "\n" + JSON.stringify(board);
const map_element_with_index = R.addIndex(R.map);

const van_neumann_neighbourhood =
    [[0,0,0,0,0],
     [0,0,1,0,0],
     [0,1,0,1,0],
     [0,0,1,0,0],
     [0,0,0,0,0]];

const moore_neighbourhood =
    [[0,0,0,0,0],
     [0,1,1,1,0],
     [0,1,0,1,0],
     [0,1,1,1,0],
     [0,0,0,0,0]];

const van_neumann_neighbourhood_2 =
    [[0,0,1,0,0],
     [0,0,1,0,0],
     [1,1,0,1,1],
     [0,0,1,0,0],
     [0,0,1,0,0]];

const moore_neighbourhood_2 =
    [[1,1,1,1,1],
     [1,1,1,1,1],
     [1,1,0,1,1],
     [1,1,1,1,1],
     [1,1,1,1,1]];

const random_neighbourhood =
    [[1,1,0,0,1],
     [0,1,1,0,0],
     [0,1,0,1,1],
     [0,1,1,0,1],
     [1,0,0,1,0]];

const test_board_1 =
    [[0,0,2,0,0,0,0,0],
     [1,1,0,2,0,1,0,2],
     [0,1,0,2,1,0,1,0],
     [0,2,0,1,0,1,0,0],
     [0,2,2,0,2,0,2,0]];

const test_neighbourhood = Cyclic_Automata.prepare_neighbourhood(moore_neighbourhood)
/**
 * Returns if the board is in a valid state.
 * Board is considered valid if the following criteria are all met:
 * - Board is a 2d array containing numbers
 * - Row lengths are constant
 * - Contains only 0,1,2...n-1 where n = states
 * - Board should not only contain one state
 * @memberof Cyclic_Automata.tests
 * @function
 * @param {matrix} [board] Board to test
 * @param {number} [states] Number of states
 * @throws if the board fails any of the predefined conditions
 */
const throw_if_invalid_board = function (board, states) {

    // checking for 2d array
    if (R.type(board) !== "Array" || R.type(board[0]) !== "Array") {
        throw new Error("The board is not a 2D array: " + print_board(board));
    }

    // check all elements are numbers
    const flattened_board = R.flatten(board);
    const boolean_valid_types = R.map(function (value) {
        if (R.type(value) === "Number") {
            return true
        } else { return false }
    }, flattened_board);
    const contains_invalid_type = R.includes(false, boolean_valid_types);
    if (contains_invalid_type) {
        throw new Error( "The board contains invalid data types: " + print_board(board));
    }

    // ensuring row length is consistent
    const board_width = R.length(board[0]);
    const same_width = R.all((row) => R.length(row) === board_width, board);
    if (!same_width) {
        throw new Error("The rows are not the same size: " + print_board(board));
    }

    // only valid states present in board
    const valid_states = R.range(0, states);
    const boolean_valid_states = R.map((value) => R.includes(value, valid_states), flattened_board);
    const contains_invalid_states = R.includes(false, boolean_valid_states);
    if (contains_invalid_states) {
        throw new Error("The board contains invalid states: " + print_board(board));
    }

    // board should not consist of only one state
    const example_state = flattened_board[0];
    const all_same_state = R.all((value) => value === example_state, flattened_board);
    if (all_same_state) {
        throw new Error("There is only one state present: " + print_board(board));
    }
};

describe("Valid Boards", function () {

    it("The intial board should be valid", function () {
        const initial = Cyclic_Automata.initial_board(8,14,3);
        throw_if_invalid_board(initial, 3);
    });

    it("An evolved board should be valid", function () {
        const initial = Cyclic_Automata.initial_board(8,14,3);
        const evolved = Cyclic_Automata.single_step(test_neighbourhood, 1, 3, 2)(initial);
        throw_if_invalid_board(evolved, 3);
    });

});


// Chose to test the neighbouring states function as it is not only key to
// ensuring the board evolves correclty but has also been written in such a way
// that it easily works alongside the front-end input grid.
// Hence it is a crucial aspect of my module and must be working as expoected

/**
 * Returns if the output list of states is valid.
 * Output list is valid for a given input board if:
 * - The output is a an array containing numbers
 * - Only states present are -1, 0, 1...n-1 where n = states
 * @memberof Cyclic_Automata.tests
 * @function
 * @param {matrix} [board] Board to operate on
 * @param {number} [states] Number of states
 * @param {matrix} [neighbourhood_grid] Grid representing the neighbourhood
 * @param {number} [row] Row of the cell we are concerned with
 * @param {number} [column] Column of the cell we are concerned with
 * @throws if the output array fails any of the predefined conditions
 */
const throw_if_invalid_neighbourhood = function (board, states, neighbourhood_grid, row, column) {

    const centre_offset = Math.floor(R.length(neighbourhood_grid)/2)
    const neighbourhood_list = Cyclic_Automata.prepare_neighbourhood(neighbourhood_grid)
    const padded = Cyclic_Automata.recursion_padding(centre_offset, board);
    const function_output = Cyclic_Automata.neighbouring_states(row + centre_offset, column + centre_offset, padded, neighbourhood_list, centre_offset)

    // checking the output is an array containing numbers only
    if (R.type(function_output) !== "Array" || R.type(function_output[0]) !== "Number") {
        throw new Error("The output is not an array containing numbers: " + print_board(function_output))
    }

    // checking that the output states are valid
    const present_states = R.dropRepeats(function_output)
    const only_valid_states = R.forEach(function (state) {
        if (state < -1 || state >= states) {
            return false
        }}, present_states)
    if (only_valid_states === false) {
        throw new Error("Invalid states are present: " + print_board(function_output))
    }
}

/**
 * Returns if the output list of states is correct.
 * Output list is correct for a given input board if:
 * - It contains the correct number of states
 * - The output only contains the predetermined state
 * @memberof Cyclic_Automata.tests
 * @function
 * @param {matrix} [board] Board to lookup states from
 * @param {matrix} [neighbourhood_grid] Guide for which cells to observe
 * @throws if the output array fails any of the predefined conditions
 */
const throw_if_incorrect_states = function (board, neighbourhood_grid) {

    const centre_offset = Math.floor(R.length(neighbourhood_grid)/2);
    const neighbourhood_list = Cyclic_Automata.prepare_neighbourhood(neighbourhood_grid);
    const neighbourhood_length = R.length(neighbourhood_list);
    const padded = Cyclic_Automata.recursion_padding(centre_offset, board);
    const function_output = Cyclic_Automata.neighbouring_states(2 * centre_offset, 2 * centre_offset, padded, neighbourhood_list, centre_offset);

    // checking if length of the output array is correct
    if (R.length(function_output) !== neighbourhood_length) {
        throw new Error("The length of the array is incorrect: " + print_board(function_output))
    }

    // checking that all output values are equal to 1
    const collapsed_output = R.flatten(R.dropRepeats(function_output))
    if (collapsed_output[0] !== 1) {
        throw new Error("The output states are not correct: " + print_board(function_output))
    }
}

describe("Neighbouring States", function () {

    it("Neighbouring states are valid", function () {
        throw_if_invalid_neighbourhood(random_neighbourhood, 2, random_neighbourhood, 2, 2)
        throw_if_invalid_neighbourhood(moore_neighbourhood, 2, van_neumann_neighbourhood, 2, 2)
        throw_if_invalid_neighbourhood(random_neighbourhood, 2, moore_neighbourhood, 2, 2)
    })

    it("Neighbouring states are correct", function () {
        // (by testing the neighbourhood on itself, it should only return 1s)
        throw_if_incorrect_states(random_neighbourhood, random_neighbourhood)
        throw_if_incorrect_states(moore_neighbourhood_2, moore_neighbourhood)
        throw_if_incorrect_states(van_neumann_neighbourhood_2, van_neumann_neighbourhood)
    })
})